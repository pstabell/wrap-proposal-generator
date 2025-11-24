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

    // For now, we'll use a simpler approach: fetch PDF as base64 and send to Claude
    // Fetch the first PDF
    const pdfUrl = pdfUrls[0];
    const pdfResponse = await fetch(pdfUrl);

    if (!pdfResponse.ok) {
      throw new Error('Failed to fetch PDF from blob storage');
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
              text: `You are extracting data from an insurance policy declaration page or proposal.

Extract ALL of the following fields if present in the document. Return ONLY valid JSON with no additional text or markdown.

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

Extract as much information as possible. Leave fields empty ("") if not found in the document.`,
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
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      throw new Error('Failed to parse extracted data');
    }

    return NextResponse.json({
      success: true,
      data: extractedData,
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
