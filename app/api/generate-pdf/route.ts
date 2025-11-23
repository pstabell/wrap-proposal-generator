import { NextRequest, NextResponse } from 'next/server';
import { ProposalData } from '@/types';
import { generateProposalHTML } from '@/lib/pdf-generator';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

// Configure chromium for Vercel serverless environment
if (process.env.NODE_ENV === 'production') {
  chromium.setHeadlessMode = true;
  chromium.setGraphicsMode = false;
}

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

    // Generate HTML from proposal data
    const html = generateProposalHTML(proposalData);

    // Launch browser with appropriate configuration
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: process.env.NODE_ENV === 'production'
        ? await chromium.executablePath()
        : process.platform === 'win32'
        ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        : process.platform === 'darwin'
        ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        : '/usr/bin/google-chrome',
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    // Set content and wait for any images/fonts to load
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    // Generate PDF with proper settings
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

    // Return PDF as response
    return new NextResponse(Buffer.from(pdf), {
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
