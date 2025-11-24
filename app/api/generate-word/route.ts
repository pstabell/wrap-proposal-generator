import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, convertInchesToTwip } from 'docx';
import { ProposalData, CoverageType } from '@/types';

const PRIMARY_COLOR = '003B5C';
const ACCENT_COLOR = 'D4AF37';

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

    // Calculate totals
    let totalCurrentPremium = 0;
    let totalProposedPremium = 0;

    Object.values(proposalData.coverages).forEach(coverage => {
      const current = parseFloat(coverage.current_premium?.toString() || '0');
      const proposed = parseFloat(coverage.proposed_premium?.toString() || '0');
      totalCurrentPremium += current;
      totalProposedPremium += proposed;
    });

    const savingsAmount = totalCurrentPremium - totalProposedPremium;
    const savingsPercentage = totalCurrentPremium > 0
      ? ((savingsAmount / totalCurrentPremium) * 100).toFixed(1)
      : '0.0';

    // Create Word document
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(0.5),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(0.5),
            },
          },
        },
        children: [
          // Cover Page
          new Paragraph({
            text: 'PRIVATE CLIENT INSURANCE PROPOSAL',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 400 },
          }),
          new Paragraph({
            text: `Prepared For: ${proposalData.clientInfo.firstName} ${proposalData.clientInfo.lastName}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: `Presented By: ${proposalData.agentInfo.name}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: `Date: ${new Date(proposalData.proposalDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            text: '',
            pageBreakBefore: true,
          }),

          // Welcome Page
          new Paragraph({
            text: 'Welcome',
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: `Dear ${proposalData.clientInfo.firstName} ${proposalData.clientInfo.lastName},`,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: 'Thank you for the opportunity to present this comprehensive insurance proposal. We have carefully reviewed your current coverage and identified opportunities to enhance your protection while potentially reducing costs.',
            spacing: { after: 200 },
          }),

          // Add coverage sections dynamically
          ...generateCoverageSections(proposalData),

          // Premium Summary
          new Paragraph({
            text: 'Premium Summary',
            heading: HeadingLevel.HEADING_1,
            pageBreakBefore: true,
            spacing: { after: 400 },
          }),
          createPremiumSummaryTable(proposalData, totalCurrentPremium, totalProposedPremium, savingsAmount, savingsPercentage),
        ],
      }],
    });

    // Generate Word document buffer
    const buffer = await Packer.toBuffer(doc);

    // Return Word document as response
    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="WRAP_Proposal_${proposalData.clientInfo.lastName}_${proposalData.proposalDate}.docx"`,
      },
    });
  } catch (error) {
    console.error('Error generating Word document:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate Word document',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function generateCoverageSections(data: ProposalData): Paragraph[] {
  const sections: Paragraph[] = [];

  Object.entries(data.coverages).forEach(([type, coverage]) => {
    const coverageType = type as CoverageType;
    const title = getCoverageTitle(coverageType);

    // Coverage heading
    sections.push(
      new Paragraph({
        text: title,
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
        spacing: { after: 400 },
      })
    );

    // Policy info
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Policy Number: ',
            bold: true,
          }),
          new TextRun({
            text: coverage.policy_number?.toString() || 'N/A',
          }),
        ],
        spacing: { after: 100 },
      })
    );

    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Carrier: ',
            bold: true,
          }),
          new TextRun({
            text: coverage.proposed_carrier || 'N/A',
          }),
        ],
        spacing: { after: 100 },
      })
    );

    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Annual Premium: ',
            bold: true,
            size: 32,
            color: PRIMARY_COLOR,
          }),
          new TextRun({
            text: `$${parseFloat(coverage.proposed_premium?.toString() || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            size: 32,
            color: PRIMARY_COLOR,
          }),
        ],
        spacing: { after: 400 },
      })
    );

    // Coverage details
    sections.push(
      new Paragraph({
        text: 'Coverage Details',
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 200 },
      })
    );

    // Add coverage-specific fields
    Object.entries(coverage).forEach(([key, value]) => {
      if (
        value &&
        key !== 'policy_number' &&
        key !== 'proposed_carrier' &&
        key !== 'current_carrier' &&
        key !== 'proposed_premium' &&
        key !== 'current_premium'
      ) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${formatFieldLabel(key)}: `,
                bold: true,
              }),
              new TextRun({
                text: value.toString(),
              }),
            ],
            spacing: { after: 100 },
          })
        );
      }
    });
  });

  return sections;
}

function createPremiumSummaryTable(
  data: ProposalData,
  totalCurrent: number,
  totalProposed: number,
  savings: number,
  savingsPercent: string
): Table {
  const rows: TableRow[] = [
    // Header row
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Coverage Type', bold: true })] })],
          width: { size: 40, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Current Premium', bold: true })], alignment: AlignmentType.RIGHT })],
          width: { size: 30, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Proposed Premium', bold: true })], alignment: AlignmentType.RIGHT })],
          width: { size: 30, type: WidthType.PERCENTAGE },
        }),
      ],
    }),
  ];

  // Coverage rows
  Object.entries(data.coverages).forEach(([type, coverage]) => {
    const current = parseFloat(coverage.current_premium?.toString() || '0');
    const proposed = parseFloat(coverage.proposed_premium?.toString() || '0');

    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph(getCoverageTitle(type as CoverageType))],
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: `$${current.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: `$${proposed.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
        ],
      })
    );
  });

  // Total row
  rows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'TOTAL', bold: true })] })],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: `$${totalCurrent.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, bold: true })],
              alignment: AlignmentType.RIGHT,
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: `$${totalProposed.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, bold: true })],
              alignment: AlignmentType.RIGHT,
            }),
          ],
        }),
      ],
    })
  );

  return new Table({
    rows,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
  });
}

function getCoverageTitle(type: CoverageType): string {
  const titles: Record<CoverageType, string> = {
    homeowners: 'Homeowners Insurance',
    condo: 'Condo Insurance',
    wind: 'Wind Insurance',
    auto: 'Auto Insurance',
    umbrella: 'Umbrella Insurance',
    watercraft: 'Watercraft Insurance',
    jewelry: 'Jewelry Insurance',
    cyber: 'Cyber Insurance',
    fineart: 'Fine Art Insurance',
    other: 'Other Coverage',
  };
  return titles[type] || 'Coverage';
}

function formatFieldLabel(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
