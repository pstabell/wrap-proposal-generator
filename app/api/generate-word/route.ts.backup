import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, convertInchesToTwip, ShadingType, VerticalAlign } from 'docx';
import { ProposalData, CoverageType } from '@/types';

const PRIMARY_COLOR = '003B5C';
const ACCENT_COLOR = 'D4AF37';

const COVERAGE_TITLES: Record<CoverageType, string> = {
  homeowners: '🏠 Homeowners Insurance',
  condo: '🏢 Condo Insurance',
  wind: '💨 Wind Insurance',
  auto: '🚗 Auto Insurance',
  umbrella: '☂️ Umbrella Insurance',
  watercraft: '⛵ Watercraft Insurance',
  jewelry: '💎 Jewelry Insurance',
  cyber: '🔒 Cyber Insurance',
  fineart: '🎨 Fine Art Insurance',
  other: '📄 Other Coverage',
};

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

    // Create Word document sections
    const sections: any[] = [];

    // ===== COVER PAGE =====
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: 'PRIVATE CLIENT INSURANCE PROPOSAL', size: 48, bold: true, color: PRIMARY_COLOR })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 800, after: 400 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Prepared For', size: 18, color: ACCENT_COLOR, allCaps: true }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `${proposalData.clientInfo.firstName} ${proposalData.clientInfo.lastName}`, size: 32, bold: true, color: PRIMARY_COLOR }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Presented By', size: 18, color: ACCENT_COLOR, allCaps: true }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: proposalData.agentInfo.name, size: 28, bold: true, color: PRIMARY_COLOR }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Date', size: 18, color: ACCENT_COLOR, allCaps: true }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: new Date(proposalData.proposalDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            size: 24,
            bold: true,
            color: PRIMARY_COLOR
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({ text: '', pageBreakBefore: true })
    );

    // ===== TABLE OF CONTENTS =====
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: 'Contents', size: 32, bold: true, color: PRIMARY_COLOR })],
        spacing: { after: 400 },
      })
    );

    const coverageEntries = Object.entries(proposalData.coverages);
    let pageNum = 3;
    const tocItems = [
      { title: 'Welcome & General Disclaimers', page: pageNum++ },
      { title: `About ${proposalData.agencyName || 'Metro Point Insurance'}`, page: pageNum++ },
      { title: 'Your Team', page: pageNum++ },
    ];

    coverageEntries.forEach(([type]) => {
      const title = COVERAGE_TITLES[type as CoverageType] || 'Coverage';
      tocItems.push({ title: title.replace(/[^\w\s]/g, ''), page: pageNum++ });
    });

    tocItems.push(
      { title: 'Premium Summary', page: pageNum++ },
      { title: 'Recommendations & Discussion Points', page: pageNum++ }
    );

    tocItems.forEach(item => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: item.title, size: 22 }),
            new TextRun({ text: '\t', size: 22 }),
            new TextRun({ text: item.page.toString(), size: 22 }),
          ],
          spacing: { after: 150 },
          tabStops: [{
            type: 'right',
            position: convertInchesToTwip(6.5),
          }],
        })
      );
    });

    sections.push(new Paragraph({ text: '', pageBreakBefore: true }));

    // ===== WELCOME PAGE =====
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: 'Welcome', size: 32, bold: true, color: PRIMARY_COLOR })],
        spacing: { after: 300 },
      }),
      new Paragraph({
        children: [new TextRun({ text: `Dear ${proposalData.clientInfo.firstName} ${proposalData.clientInfo.lastName},`, size: 22 })],
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: 'Thank you for the opportunity to present this comprehensive insurance proposal. We have carefully reviewed your current coverage and identified opportunities to enhance your protection while potentially reducing costs.',
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: 'This proposal reflects our commitment to providing you with the highest level of service and the most competitive options available in the marketplace. Our team has leveraged our relationships with leading carriers to secure quotes that offer superior coverage at competitive premiums.',
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: 'We look forward to discussing this proposal with you and answering any questions you may have.',
        spacing: { after: 400 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Important Disclaimer', size: 24, bold: true, color: PRIMARY_COLOR })],
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        text: 'Premium quotes are subject to underwriting approval and may change based on final underwriting review, inspection results, or changes in the information provided.',
        spacing: { after: 400 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Compensation', size: 24, bold: true, color: PRIMARY_COLOR })],
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: `${proposalData.agencyName || 'Metro Point Insurance'} is compensated through commissions paid by insurance carriers for policies placed. Commission rates vary by carrier and coverage type but typically range from 10% to 15% of the premium.`,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: 'Our compensation does not affect the premium you pay. Premiums are set by the insurance carriers based on their underwriting guidelines and rate filings.',
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: 'We may also receive contingent commissions or bonuses based on overall volume and loss performance with certain carriers. These arrangements do not influence our recommendations, which are based solely on providing you with the best coverage at the most competitive price.',
        spacing: { after: 200 },
      }),
      new Paragraph({ text: '', pageBreakBefore: true })
    );

    // ===== ABOUT AGENCY PAGE =====
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: `About ${proposalData.agencyName || 'Metro Point Insurance'}`, size: 32, bold: true, color: PRIMARY_COLOR })],
        spacing: { after: 300 },
      }),
      new Paragraph({
        text: `${proposalData.agencyName || 'Metro Point Insurance'} is a leading independent insurance agency specializing in high-net-worth personal insurance and risk management. With decades of combined experience, our team brings deep expertise in protecting the unique assets and lifestyles of affluent individuals and families.`,
        spacing: { after: 300 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Our Unique Advantage', size: 24, bold: true, color: PRIMARY_COLOR })],
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: 'As an independent agency, we work with multiple top-rated insurance carriers, providing you with the best coverage at competitive prices. We have the flexibility to shop the market on your behalf and negotiate optimal terms.',
        spacing: { after: 300 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Why Choose Us', size: 24, bold: true, color: PRIMARY_COLOR })],
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: '• Independent representation with access to multiple A-rated carriers',
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: '• Specialized expertise in high-net-worth personal insurance',
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: '• Personalized service with dedicated account management',
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: '• Comprehensive risk assessment and coverage analysis',
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: '• Claims advocacy and support when you need it most',
        spacing: { after: 400 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Contact Information', size: 24, bold: true, color: PRIMARY_COLOR })],
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Phone: ', bold: true }),
          new TextRun({ text: proposalData.agentInfo.phone || '(555) 123-4567' }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Email: ', bold: true }),
          new TextRun({ text: proposalData.agentInfo.email || 'info@agency.com' }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({ text: '', pageBreakBefore: true })
    );

    // ===== TEAM PAGE =====
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: `Your ${proposalData.agencyName || 'Metro Point Insurance'} Team`, size: 32, bold: true, color: PRIMARY_COLOR })],
        spacing: { after: 300 },
      }),
      new Paragraph({
        children: [new TextRun({ text: proposalData.agentInfo.name, size: 28, bold: true, color: PRIMARY_COLOR })],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: proposalData.agentInfo.title || 'Insurance Advisor', size: 22, color: ACCENT_COLOR })],
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: proposalData.agentInfo.phone || '', size: 20 })],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: proposalData.agentInfo.email || '', size: 20 })],
        spacing: { after: 100 },
      }),
      new Paragraph({ text: '', pageBreakBefore: true })
    );

    // ===== COVERAGE PAGES =====
    Object.entries(proposalData.coverages).forEach(([type, coverage]) => {
      const coverageType = type as CoverageType;
      const title = COVERAGE_TITLES[coverageType] || 'Coverage';

      sections.push(
        new Paragraph({
          children: [new TextRun({ text: title, size: 32, bold: true, color: PRIMARY_COLOR })],
          spacing: { after: 300 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Annual Premium: ', size: 28, bold: true, color: PRIMARY_COLOR }),
            new TextRun({ text: `$${parseFloat(coverage.proposed_premium?.toString() || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}`, size: 28, bold: true, color: PRIMARY_COLOR }),
          ],
          spacing: { after: 300 },
        })
      );

      // Policy info
      if (coverage.policy_number) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Policy Number: ', bold: true }),
              new TextRun({ text: coverage.policy_number?.toString() || 'N/A' }),
            ],
            spacing: { after: 100 },
          })
        );
      }

      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Carrier: ', bold: true }),
            new TextRun({ text: coverage.proposed_carrier || 'N/A' }),
          ],
          spacing: { after: 100 },
        })
      );

      if (coverage.policy_term) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Policy Term: ', bold: true }),
              new TextRun({ text: coverage.policy_term?.toString() || 'N/A' }),
            ],
            spacing: { after: 100 },
          })
        );
      }

      sections.push(
        new Paragraph({
          children: [new TextRun({ text: 'Coverage Details', size: 24, bold: true, color: PRIMARY_COLOR })],
          spacing: { before: 300, after: 200 },
        })
      );

      // Add all coverage fields
      Object.entries(coverage).forEach(([key, value]) => {
        if (
          value &&
          key !== 'policy_number' &&
          key !== 'proposed_carrier' &&
          key !== 'current_carrier' &&
          key !== 'proposed_premium' &&
          key !== 'current_premium' &&
          key !== 'policy_term' &&
          key !== 'effective_date'
        ) {
          const label = key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
          sections.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${label}: `, bold: true }),
                new TextRun({ text: value.toString() }),
              ],
              spacing: { after: 100 },
            })
          );
        }
      });

      sections.push(new Paragraph({ text: '', pageBreakBefore: true }));
    });

    // ===== PREMIUM SUMMARY PAGE =====
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: 'Premium Summary', size: 32, bold: true, color: PRIMARY_COLOR })],
        spacing: { after: 400 },
      })
    );

    // Create premium summary table
    const summaryRows: TableRow[] = [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Coverage Type', bold: true })], alignment: AlignmentType.CENTER })],
            shading: { fill: PRIMARY_COLOR, type: ShadingType.SOLID, color: PRIMARY_COLOR },
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Expiring Premium', bold: true, color: 'FFFFFF' })], alignment: AlignmentType.RIGHT })],
            shading: { fill: PRIMARY_COLOR, type: ShadingType.SOLID, color: PRIMARY_COLOR },
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Renewal Premium', bold: true, color: 'FFFFFF' })], alignment: AlignmentType.RIGHT })],
            shading: { fill: PRIMARY_COLOR, type: ShadingType.SOLID, color: PRIMARY_COLOR },
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
      }),
    ];

    Object.entries(proposalData.coverages).forEach(([type, coverage]) => {
      const coverageType = type as CoverageType;
      const title = COVERAGE_TITLES[coverageType]?.replace(/[^\w\s]/g, '') || 'Coverage';
      const current = parseFloat(coverage.current_premium?.toString() || '0');
      const proposed = parseFloat(coverage.proposed_premium?.toString() || '0');

      summaryRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph(title)],
            }),
            new TableCell({
              children: [new Paragraph({ text: `$${current.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, alignment: AlignmentType.RIGHT })],
            }),
            new TableCell({
              children: [new Paragraph({ text: `$${proposed.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, alignment: AlignmentType.RIGHT })],
            }),
          ],
        })
      );
    });

    // Total row
    summaryRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'TOTAL', bold: true })] })],
            shading: { fill: 'E3F2FD', type: ShadingType.SOLID },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: `$${totalCurrentPremium.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, bold: true })], alignment: AlignmentType.RIGHT })],
            shading: { fill: 'E3F2FD', type: ShadingType.SOLID },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: `$${totalProposedPremium.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, bold: true })], alignment: AlignmentType.RIGHT })],
            shading: { fill: 'E3F2FD', type: ShadingType.SOLID },
          }),
        ],
      })
    );

    sections.push(
      new Table({
        rows: summaryRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: PRIMARY_COLOR },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: PRIMARY_COLOR },
          left: { style: BorderStyle.SINGLE, size: 1, color: PRIMARY_COLOR },
          right: { style: BorderStyle.SINGLE, size: 1, color: PRIMARY_COLOR },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
          insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
        },
      })
    );

    // Savings summary
    if (savingsAmount !== 0) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: savingsAmount > 0 ? 'Total Annual Savings: ' : 'Total Annual Increase: ',
              size: 28,
              bold: true,
              color: savingsAmount > 0 ? '2E7D32' : 'C62828'
            }),
            new TextRun({
              text: `${savingsAmount > 0 ? '-' : '+'}$${Math.abs(savingsAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })} (${savingsAmount > 0 ? '-' : '+'}${Math.abs(parseFloat(savingsPercentage))}%)`,
              size: 28,
              bold: true,
              color: savingsAmount > 0 ? '2E7D32' : 'C62828'
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 400 },
        })
      );
    }

    sections.push(new Paragraph({ text: '', pageBreakBefore: true }));

    // ===== RECOMMENDATIONS PAGE =====
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: 'Recommendations & Discussion Points', size: 32, bold: true, color: PRIMARY_COLOR })],
        spacing: { after: 300 },
      })
    );

    if (proposalData.notes) {
      proposalData.notes.split('\n').filter(line => line.trim()).forEach(note => {
        sections.push(
          new Paragraph({
            text: `• ${note.trim()}`,
            spacing: { after: 150 },
          })
        );
      });
    }

    sections.push(
      new Paragraph({
        children: [new TextRun({ text: 'Next Steps', size: 24, bold: true, color: PRIMARY_COLOR })],
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        text: 'Please review this proposal carefully and contact us with any questions. We are happy to discuss any aspect of the coverage or make adjustments as needed. Once you are ready to proceed, we will work quickly to bind coverage and provide you with your policy documents.',
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: 'Thank you for the opportunity to serve your insurance needs. We look forward to protecting what matters most to you.',
        spacing: { after: 200 },
      })
    );

    // Create the document
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
        children: sections,
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
