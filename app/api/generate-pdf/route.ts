import { NextRequest, NextResponse } from 'next/server';
import { ProposalData } from '@/types';
import { generateProposalHTML } from '@/lib/pdf-generator';

// PDFShift API configuration
const PDFSHIFT_API_KEY = process.env.PDFSHIFT_API_KEY || 'api_xxxxxxxxxxxxxxxxxxxxxxxx';

export async function POST(request: NextRequest) {
  try {
    const proposalData: ProposalData = await request.json();

    // Validate required fields
    if (!proposalData.clientInfo || !proposalData.agentInfo) {
      return NextResponse.json(
        { error: 'Missing required client or agent information' },
        { status: 400 }
      );
    }

    if (!proposalData.coverages || Object.keys(proposalData.coverages).length === 0) {
      return NextResponse.json(
        { error: 'At least one coverage type is required' },
        { status: 400 }
      );
    }

    // Generate comprehensive HTML from proposal data
    const html = generateProposalHTML(proposalData);

    // Use PDFShift API to convert HTML to PDF
    const pdfshiftResponse = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`api:${PDFSHIFT_API_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: html,
        format: 'Letter',
        margin: '0',
        print_background: true,
        landscape: false,
      }),
    });

    if (!pdfshiftResponse.ok) {
      const errorText = await pdfshiftResponse.text();
      console.error('PDFShift API error:', errorText);
      throw new Error(`PDFShift API error: ${pdfshiftResponse.status} - ${errorText}`);
    }

    const pdfBuffer = await pdfshiftResponse.arrayBuffer();

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="WRAP_Proposal_${proposalData.clientInfo.lastName}_${proposalData.proposalDate}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
