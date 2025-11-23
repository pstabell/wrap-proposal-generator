import { NextRequest, NextResponse } from 'next/server';
import { ProposalData } from '@/types';
import { generateProposalPDF } from '@/lib/pdf-generator-react';

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

    // Generate PDF using React PDF
    const pdfBuffer = await generateProposalPDF(proposalData);

    // Return PDF as response
    return new NextResponse(pdfBuffer as any, {
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
