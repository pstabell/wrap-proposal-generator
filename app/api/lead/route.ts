import { NextRequest, NextResponse } from "next/server";
import { guardPublicRoute } from "@/lib/request-guard";

/**
 * WRAP lead capture (2026-10-13). The lead gate used to write contacts
 * straight from the browser with the public anon key; CRM RLS now refuses
 * that, so the write happens here with the server-side CRM key.
 *
 * Public callers can create a new contact, but on an existing email they can
 * only fill blank fields and tag the WRAP source. Name, type, owner-ish and
 * status fields of an existing CRM contact are never changed.
 */

const CRM_URL = "https://qgtjpdviboxxlrivwcan.supabase.co";
const CRM_SERVICE_KEY = process.env.CRM_SERVICE_KEY || "";

const SOURCE = "wrap-tool";
const TAG = "wrap-user";
const NOTE = "Lead from WRAP Proposal Generator tool";
const SOURCE_DETAILS = new Set(["google", "social", "referral", "chamber", "other"]);

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/;

function crmHeaders(extra: Record<string, string> = {}) {
  return {
    apikey: CRM_SERVICE_KEY,
    Authorization: `Bearer ${CRM_SERVICE_KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

function cleanText(value: unknown, max: number): string | null | undefined {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") return undefined;
  const v = value.replace(/[\u0000-\u001f\u007f]/g, " ").trim();
  if (!v) return null;
  if (v.length > max) return undefined;
  return v;
}

type ExistingContact = {
  id: string;
  company: string | null;
  phone: string | null;
  source: string | null;
  source_detail: string | null;
  tags: string[] | null;
  notes: string | null;
};

async function findByEmail(email: string): Promise<ExistingContact | null | "error"> {
  // Case-insensitive match; escape LIKE wildcards so the email is literal.
  const pattern = email.replace(/[\\%_]/g, (c) => `\\${c}`);
  const res = await fetch(
    `${CRM_URL}/rest/v1/contacts?email=ilike.${encodeURIComponent(pattern)}` +
      `&select=id,company,phone,source,source_detail,tags,notes&order=created_at.asc&limit=1`,
    { headers: crmHeaders(), cache: "no-store" },
  );
  if (!res.ok) {
    console.error("Lead lookup failed:", res.status);
    return "error";
  }
  const rows = (await res.json()) as ExistingContact[];
  return rows[0] ?? null;
}

async function touchExisting(
  c: ExistingContact,
  input: { company: string | null; phone: string | null; source_detail: string | null },
): Promise<boolean> {
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (!c.company && input.company) patch.company = input.company;
  if (!c.phone && input.phone) patch.phone = input.phone;
  if (!c.source) patch.source = SOURCE;
  if (!c.source_detail && input.source_detail && (c.source ?? SOURCE) === SOURCE) {
    patch.source_detail = input.source_detail;
  }
  const tags = Array.isArray(c.tags) ? c.tags : [];
  if (!tags.includes(TAG)) patch.tags = [...tags, TAG];
  if (!c.notes) patch.notes = NOTE;
  else if (!c.notes.includes(NOTE)) patch.notes = `${c.notes}\n${NOTE}`;

  const res = await fetch(`${CRM_URL}/rest/v1/contacts?id=eq.${c.id}`, {
    method: "PATCH",
    headers: crmHeaders({ Prefer: "return=minimal" }),
    body: JSON.stringify(patch),
  });
  if (!res.ok) console.error("Lead update failed:", res.status);
  return res.ok;
}

export async function POST(request: NextRequest) {
  const blocked = guardPublicRoute(request, "lead", 5, 10 * 60 * 1000);
  if (blocked) return blocked;

  if (!CRM_SERVICE_KEY) {
    console.error("Lead API: CRM_SERVICE_KEY is not set");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  try {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const first_name = cleanText(body.first_name, 100);
    const last_name = cleanText(body.last_name, 100);
    const emailRaw = cleanText(body.email, 254);
    const company = cleanText(body.company, 200);
    const phone = cleanText(body.phone, 40);
    const detailRaw = cleanText(body.source_detail, 40);

    if (!first_name || !last_name || !emailRaw) {
      return NextResponse.json({ error: "First name, last name and email are required" }, { status: 400 });
    }
    if (company === undefined || phone === undefined || detailRaw === undefined) {
      return NextResponse.json({ error: "Invalid field" }, { status: 400 });
    }
    const email = emailRaw.toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (phone && !/^[0-9+().\-\s x]+$/i.test(phone)) {
      return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
    }
    const source_detail = detailRaw && SOURCE_DETAILS.has(detailRaw) ? detailRaw : null;

    const existing = await findByEmail(email);
    if (existing === "error") return NextResponse.json({ error: "Server error" }, { status: 500 });
    if (existing) {
      await touchExisting(existing, { company, phone, source_detail });
      return NextResponse.json({ id: existing.id });
    }

    const insertRes = await fetch(`${CRM_URL}/rest/v1/contacts?select=id`, {
      method: "POST",
      headers: crmHeaders({ Prefer: "return=representation" }),
      body: JSON.stringify({
        first_name,
        last_name,
        email,
        company,
        phone,
        source: SOURCE,
        source_detail,
        type: "prospect",
        tags: [TAG],
        notes: NOTE,
      }),
    });

    if (insertRes.status === 409) {
      // Created between our lookup and insert: treat it as an existing contact.
      const again = await findByEmail(email);
      if (again && again !== "error") {
        await touchExisting(again, { company, phone, source_detail });
        return NextResponse.json({ id: again.id });
      }
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
    if (!insertRes.ok) {
      console.error("Lead insert failed:", insertRes.status, await insertRes.text());
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    const rows = (await insertRes.json()) as Array<{ id: string }>;
    if (!rows.length) return NextResponse.json({ error: "Server error" }, { status: 500 });
    return NextResponse.json({ id: rows[0].id });
  } catch (err) {
    console.error("Lead API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
