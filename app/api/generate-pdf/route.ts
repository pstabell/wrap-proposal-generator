import { NextRequest, NextResponse } from 'next/server';
import { ProposalData } from '@/types';
import { generateProposalHTML } from '@/lib/pdf-generator';
import playwright from 'playwright-aws-lambda';

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

    // Generate HTML from proposal data using your existing comprehensive template
    const html = generateProposalHTML(proposalData);

    // Launch browser with Playwright (optimized for AWS Lambda/Vercel)
    const browser = await playwright.launchChromium();
    const page = await browser.newPage();

    // Set content and wait for any images/fonts to load
    await page.setContent(html, {
      waitUntil: 'networkidle',
    });

    // Generate PDF with proper settings for multi-page proposal
    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
      },
      preferCSSPageSize: true,
    });

    await browser.close();

    // Return PDF as response (cast to any to handle Buffer type)
    return new NextResponse(pdf as any, {
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
