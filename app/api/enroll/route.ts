import { NextRequest, NextResponse } from "next/server";
import { guardPublicRoute } from "@/lib/request-guard";

const CRM_URL = "https://qgtjpdviboxxlrivwcan.supabase.co";
const CRM_SERVICE_KEY = process.env.CRM_SERVICE_KEY || "";

// The WRAP lead gate only ever enrolls into this one campaign. The campaign
// is fixed server-side so callers cannot enroll contacts into anything else
// (security fix 2026-10-13).
const CAMPAIGN_ID = "ams-agency-drip";
const CAMPAIGN_NAME = "AMS Agency Software Solutions";
const SOURCE = "wrap-tool";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function crmHeaders(extra: Record<string, string> = {}) {
  return {
    apikey: CRM_SERVICE_KEY,
    Authorization: `Bearer ${CRM_SERVICE_KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

export async function POST(request: NextRequest) {
  const blocked = guardPublicRoute(request, "enroll", 5, 10 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const body = await request.json().catch(() => ({}));
    const { contact_id, source_detail } = body as { contact_id?: unknown; source_detail?: unknown };

    if (typeof contact_id !== "string" || !UUID_RE.test(contact_id)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Only contacts that came in through the WRAP lead gate can be enrolled.
    const contactRes = await fetch(
      `${CRM_URL}/rest/v1/contacts?id=eq.${contact_id}&select=id,source`,
      { headers: crmHeaders() },
    );
    if (!contactRes.ok) {
      console.error("Enroll contact lookup failed:", contactRes.status);
      return NextResponse.json({ error: "Enrollment failed" }, { status: 500 });
    }
    const contacts = (await contactRes.json()) as Array<{ id: string; source: string | null }>;
    if (!contacts.length || contacts[0].source !== SOURCE) {
      return NextResponse.json({ error: "Contact not eligible" }, { status: 403 });
    }

    // Do not enroll the same contact twice.
    const existingRes = await fetch(
      `${CRM_URL}/rest/v1/campaign_enrollments?contact_id=eq.${contact_id}&campaign_id=eq.${CAMPAIGN_ID}&select=contact_id&limit=1`,
      { headers: crmHeaders() },
    );
    if (existingRes.ok) {
      const existing = (await existingRes.json()) as unknown[];
      if (existing.length > 0) return NextResponse.json({ success: true, already: true });
    }

    const enrollmentData = {
      contact_id,
      campaign_id: CAMPAIGN_ID,
      campaign_name: CAMPAIGN_NAME,
      status: "active",
      current_step: 1,
      total_steps: 5,
      source: SOURCE,
      source_detail: typeof source_detail === "string" && source_detail ? source_detail.slice(0, 100) : null,
      emails_sent: 0,
      emails_opened: 0,
      emails_clicked: 0,
    };

    const res = await fetch(`${CRM_URL}/rest/v1/campaign_enrollments`, {
      method: "POST",
      headers: crmHeaders({ Prefer: "return=minimal" }),
      body: JSON.stringify(enrollmentData),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Enrollment failed:", err);
      return NextResponse.json({ error: "Enrollment failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Enroll API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
