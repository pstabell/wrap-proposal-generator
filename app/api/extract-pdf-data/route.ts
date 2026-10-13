import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { guardPublicRoute, isOwnBlobUrl, looksLikePdf, MAX_PDF_BYTES } from '@/lib/request-guard';

const MAX_FILES = 8;

type PdfInput = { url: string; type: 'current' | 'proposed' };

/** Accept only our own Blob-store PDF URLs with a fixed document type. */
function parsePdfFiles(raw: unknown): PdfInput[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_FILES) return null;
  const out: PdfInput[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') return null;
    const { url, type } = item as { url?: unknown; type?: unknown };
    if (type !== 'current' && type !== 'proposed') return null;
    if (!isOwnBlobUrl(url)) return null;
    out.push({ url, type });
  }
  return out;
}

/** Fetch a PDF from our Blob store with size and magic-number checks. */
async function fetchPdf(url: string): Promise<ArrayBuffer | null> {
  const res = await fetch(url, { redirect: 'error' });
  if (!res.ok) return null;
  const len = Number(res.headers.get('content-length') || '0');
  if (len > MAX_PDF_BYTES) return null;
  const buf = await res.arrayBuffer();
  if (buf.byteLength === 0 || buf.byteLength > MAX_PDF_BYTES) return null;
  if (!looksLikePdf(new Uint8Array(buf, 0, Math.min(8, buf.byteLength)))) return null;
  return buf;
}

export async function POST(request: NextRequest) {
  const blocked = guardPublicRoute(request, 'extract', 10, 10 * 60 * 1000);
  if (blocked) return blocked;

  try {
    // Check if API key is configured
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY environment variable is not configured. Please add it to your Vercel environment variables.' },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const rawFiles = (body as { pdfFiles?: unknown }).pdfFiles;

    if (!Array.isArray(rawFiles) || rawFiles.length === 0) {
      return NextResponse.json(
        { error: 'No PDF files provided' },
        { status: 400 }
      );
    }

    const pdfFiles = parsePdfFiles(rawFiles);
    if (!pdfFiles) {
      return NextResponse.json(
        { error: `Invalid PDF list (up to ${MAX_FILES} uploaded PDFs)` },
        { status: 400 }
      );
    }

    // Initialize Anthropic client with the API key
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    // Process all PDFs and merge the results
    const allExtractedData: any[] = [];

    for (const pdfFile of pdfFiles) {
      const { url: pdfUrl, type: documentType } = pdfFile;
      const pdfBuffer = await fetchPdf(pdfUrl).catch(() => null);

      if (!pdfBuffer) {
        console.error(`Failed to fetch a valid PDF from ${pdfUrl}`);
        continue;
      }

      const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

      // Use Claude to extract data from the PDF
      const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: pdfBase64,
              },
            },
            {
              type: 'text',
              text: `You are extracting data from an insurance ${documentType === 'current' ? 'CURRENT/EXPIRING POLICY DECLARATION PAGE' : 'NEW PROPOSED QUOTE/PROPOSAL'}.

CRITICAL INSTRUCTION - THIS DOCUMENT IS: ${documentType.toUpperCase()}

${documentType === 'current'
  ? '- This is a CURRENT/EXPIRING policy declaration page\n- Extract the carrier name → use current_carrier\n- Extract the premium → use current_premium\n- Leave proposed_carrier and proposed_premium EMPTY'
  : '- This is a NEW/PROPOSED quote or proposal\n- Extract the carrier name → use proposed_carrier\n- Extract the premium → use proposed_premium\n- Leave current_carrier and current_premium EMPTY'}

Extract ALL of the following fields if present. Return ONLY valid JSON with no additional text or markdown.

{
  "clientInfo": {
    "firstName": "",
    "lastName": "",
    "address": "",
    "city": "",
    "state": "",
    "zip": "",
    "email": "",
    "phone": ""
  },
  "coverages": [
    {
      "type": "homeowners|condo|wind|auto|umbrella|watercraft|jewelry|cyber|fineart|other",
      "policy_number": "",
      "property_address": "",
      "city_state_zip": "",
      "proposed_carrier": "",
      "current_carrier": "",
      "policy_term": "",
      "effective_date": "",
      "proposed_premium": "",
      "current_premium": "",
      "dwelling_coverage": "",
      "other_structures": "",
      "personal_property": "",
      "loss_of_use": "",
      "personal_liability": "",
      "medical_payments": "",
      "deductible_other": "",
      "deductible_hurricane": "",
      "deductible_wind": "",
      "deductible": "",
      "endorsements": "",
      "loss_assessment": "",
      "coverage_amount": "",
      "special_features": "",
      "vehicles": "",
      "liability_limits": "",
      "uninsured_motorist": "",
      "pip_coverage": "",
      "additional_pip": "",
      "rental_reimbursement": "",
      "full_glass": "",
      "towing_labor": "",
      "comprehensive_deductible": "",
      "collision_deductible": "",
      "drivers": "",
      "additional_interests": "",
      "underlying_requirements": "",
      "boat_info": "",
      "hull_value": "",
      "navigation_limits": "",
      "items_covered": "",
      "appraisal_info": "",
      "cyber_coverage_details": "",
      "coverage_details": ""
    }
  ]
}

RULES:
- Extract carrier name from company logo, letterhead, or "Carrier:", "Company:", "Insurer:" fields
- For premiums, extract the total annual premium amount (numbers only, no $ or commas)
- For deductibles, include both the percentage and dollar amount if shown (e.g., "2% ($121,091)")
- For property_address: Look for "Insured Location", "Property Address", "Risk Address", etc.
  - If it says "Same as address shown under insured" or "Same as mailing address", use the insured's mailing address
  - If a specific property address is shown, use that street address only
- For city_state_zip: Extract city, state, and zip from the property address (e.g., "Naples, FL 34102")
- For vehicles (auto policies): List each vehicle on a new line with format: "Year Make Model | VIN: xxxxx | Value: $xxxxx"
- For drivers (auto policies): List each named driver on a new line
- For liability_limits: Extract combined single limit or split limits (e.g., "$500,000" or "$250,000/$500,000")
- For coverage amounts: Include $ and commas (e.g., "$6,054,560")
- For endorsements: List each endorsement or rider on a new line
- For boat_info (watercraft): Include year, make, model, length, and any identifying info
- For items_covered (jewelry/valuables): List each scheduled item with description and value
- Leave fields empty ("") if not found in the document.`,
            },
          ],
        },
      ],
      });

      // Parse Claude's response
      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

      // Extract JSON from response (handle if Claude wraps it in markdown code blocks)
      let extractedData;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          extractedData = JSON.parse(jsonMatch[0]);
        } else {
          extractedData = JSON.parse(responseText);
        }
        allExtractedData.push(extractedData);
      } catch (parseError) {
        console.error('Failed to parse Claude response:', responseText);
        // Continue processing other PDFs even if one fails
      }
    }

    // Merge all extracted data intelligently
    const mergedData: any = {
      clientInfo: {},
      coverages: []
    };

    // Merge client info (use first non-empty value for each field)
    for (const data of allExtractedData) {
      if (data.clientInfo) {
        for (const [key, value] of Object.entries(data.clientInfo)) {
          if (value && !mergedData.clientInfo[key]) {
            mergedData.clientInfo[key] = value;
          }
        }
      }
    }

    // Merge coverages by type, intelligently combining current and proposed data
    const coveragesByType: Record<string, any> = {};

    for (const data of allExtractedData) {
      if (data.coverages && Array.isArray(data.coverages)) {
        for (const coverage of data.coverages) {
          if (coverage.type) {
            if (!coveragesByType[coverage.type]) {
              coveragesByType[coverage.type] = {};
            }

            // Determine if this is current or proposed data based on which fields are filled
            const isCurrent = coverage.current_carrier || coverage.current_premium;
            const isProposed = coverage.proposed_carrier || coverage.proposed_premium;

            // Merge this coverage with existing data for this type
            for (const [key, value] of Object.entries(coverage)) {
              if (value && value !== '') {
                const existing = coveragesByType[coverage.type][key];

                // Always allow current_* and proposed_* fields (never overwrite)
                if (key.startsWith('current_') || key.startsWith('proposed_')) {
                  if (!existing || existing === '') {
                    coveragesByType[coverage.type][key] = value;
                  }
                }
                // For coverage details (dwelling, deductibles, etc), prefer values from proposed doc
                // Only use current doc values if no proposed doc exists yet
                else {
                  if (!existing || existing === '') {
                    coveragesByType[coverage.type][key] = value;
                  } else if (isProposed) {
                    // If this is from a proposed doc, overwrite any existing value
                    coveragesByType[coverage.type][key] = value;
                  }
                }
              }
            }
          }
        }
      }
    }

    // Convert merged coverages back to array
    mergedData.coverages = Object.values(coveragesByType);

    // Post-process: If property address is missing or says "same as", use client address
    if (mergedData.clientInfo && mergedData.coverages) {
      const clientStreetAddress = mergedData.clientInfo.address || '';
      const clientCityStateZip = [
        mergedData.clientInfo.city,
        mergedData.clientInfo.state,
        mergedData.clientInfo.zip
      ].filter(Boolean).join(', ');

      for (const coverage of mergedData.coverages) {
        // Handle property_address field
        if (!coverage.property_address || coverage.property_address === '' ||
            coverage.property_address.toLowerCase().includes('same as') ||
            coverage.property_address.toLowerCase().includes('same address')) {
          coverage.property_address = clientStreetAddress;
        }

        // Handle city_state_zip field
        if (!coverage.city_state_zip || coverage.city_state_zip === '') {
          coverage.city_state_zip = clientCityStateZip;
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: mergedData,
    });
  } catch (error) {
    console.error('Error extracting PDF data:', error);
    return NextResponse.json(
      {
        error: 'Failed to extract data from PDF',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
