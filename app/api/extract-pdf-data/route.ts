import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY environment variable is not configured. Please add it to your Vercel environment variables.' },
        { status: 500 }
      );
    }

    const { pdfUrls } = await request.json();

    if (!pdfUrls || !Array.isArray(pdfUrls) || pdfUrls.length === 0) {
      return NextResponse.json(
        { error: 'No PDF URLs provided' },
        { status: 400 }
      );
    }

    // Initialize Anthropic client with the API key
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    // Process all PDFs and merge the results
    const allExtractedData: any[] = [];

    for (const pdfUrl of pdfUrls) {
      const pdfResponse = await fetch(pdfUrl);

      if (!pdfResponse.ok) {
        console.error(`Failed to fetch PDF from ${pdfUrl}`);
        continue;
      }

      const pdfBuffer = await pdfResponse.arrayBuffer();
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
              text: `You are extracting data from insurance policy documents. This could be either:
1. A CURRENT/EXPIRING policy declaration page (showing existing coverage with the current carrier)
2. A NEW/PROPOSED quote or proposal (showing new coverage being offered by a proposed carrier)

CRITICAL: Pay close attention to document type and do NOT mix up current vs proposed data!

Look for these indicators:
- Declaration pages, "Dec Page", "Policy Period", "Renewal" = CURRENT policy (use current_carrier, current_premium)
- Quotes, "Quote", "Proposal", "Estimated Premium" = PROPOSED policy (use proposed_carrier, proposed_premium)

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
      "proposed_carrier": "",
      "current_carrier": "",
      "policy_term": "",
      "effective_date": "",
      "proposed_premium": "",
      "current_premium": "",
      "dwelling_limit": "",
      "other_structures": "",
      "personal_property": "",
      "loss_of_use": "",
      "personal_liability": "",
      "medical_payments": "",
      "deductible": "",
      "wind_hail_deductible": "",
      "address": ""
    }
  ]
}

RULES:
- If this is a CURRENT/EXPIRING policy: fill current_carrier and current_premium, leave proposed fields empty
- If this is a PROPOSED/NEW quote: fill proposed_carrier and proposed_premium, leave current fields empty
- Extract carrier name from company logo, letterhead, or "Carrier:", "Company:", "Insurer:" fields
- For premiums, extract the total annual premium amount (numbers only, no $ or commas)
- For deductibles, include both the percentage and dollar amount if shown (e.g., "2% ($121,091)")
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

    // Merge coverages by type, combining current and proposed data
    const coveragesByType: Record<string, any> = {};

    for (const data of allExtractedData) {
      if (data.coverages && Array.isArray(data.coverages)) {
        for (const coverage of data.coverages) {
          if (coverage.type) {
            if (!coveragesByType[coverage.type]) {
              coveragesByType[coverage.type] = {};
            }

            // Merge this coverage with existing data for this type
            for (const [key, value] of Object.entries(coverage)) {
              if (value && value !== '') {
                // Special handling: don't overwrite current_* with proposed_* or vice versa
                if (!coveragesByType[coverage.type][key] ||
                    coveragesByType[coverage.type][key] === '') {
                  coveragesByType[coverage.type][key] = value;
                }
              }
            }
          }
        }
      }
    }

    // Convert merged coverages back to array
    mergedData.coverages = Object.values(coveragesByType);

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
