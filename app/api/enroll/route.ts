import { NextRequest, NextResponse } from "next/server";

const CRM_URL = "https://qgtjpdviboxxlrivwcan.supabase.co";
const CRM_SERVICE_KEY = process.env.CRM_SERVICE_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contact_id, campaign_id, campaign_name, source, source_detail } = body;

    if (!contact_id || !campaign_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const enrollmentData = {
      contact_id,
      campaign_id,
      campaign_name: campaign_name || "AMS Agency Software Solutions",
      status: "active",
      current_step: 1,
      total_steps: 5,
      source: source || "wrap-tool",
      source_detail: source_detail || null,
      emails_sent: 0,
      emails_opened: 0,
      emails_clicked: 0,
    };

    const res = await fetch(`${CRM_URL}/rest/v1/campaign_enrollments`, {
      method: "POST",
      headers: {
        apikey: CRM_SERVICE_KEY,
        Authorization: `Bearer ${CRM_SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
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
