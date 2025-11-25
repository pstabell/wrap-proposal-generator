import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, convertInchesToTwip, ShadingType, VerticalAlign, ImageRun, Footer, Header, PageNumber, NumberFormat } from 'docx';
import { ProposalData, CoverageType } from '@/types';

// Note: For solid color fills, use ShadingType.CLEAR (not SOLID which doesn't exist)

const PRIMARY_COLOR = '003B5C';
const ACCENT_COLOR = 'D4AF37';
const LIGHT_BLUE = '003B5C'; // Dark navy blue - matches web page section headings
const GREEN = '2E7D32';
const RED = 'C62828';

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

// Helper function to fetch images from URLs and convert to buffer
async function fetchImageAsBuffer(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
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
    const mainSections: any[] = []; // Array of section objects for the document
    const sections: any[] = []; // Array of paragraphs/tables for the current section

    // ===== COVER PAGE =====

    // Add agency logo if available
    if (proposalData.agencyLogo) {
      const logoBuffer = await fetchImageAsBuffer(proposalData.agencyLogo);
      if (logoBuffer) {
        sections.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: logoBuffer,
                transformation: {
                  width: 200,
                  height: 80,
                },
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 },
          }),
          // Add blank spacing row between logo and photos
          new Paragraph({
            text: '',
            spacing: { after: 400 },
          })
        );
      }
    }

    // Add 3 default sample images (mansion, yacht, jet) - always display these
    const defaultImagePaths = [
      '/images/miami-mansion.jpg',
      '/images/yacht.jpg',
      '/images/g700-jet.jpg'
    ];

    const imageBuffers: Buffer[] = [];

    // Get base URL from request
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    for (const imagePath of defaultImagePaths) {
      const imageUrl = `${baseUrl}${imagePath}`;
      const buffer = await fetchImageAsBuffer(imageUrl);
      if (buffer) {
        imageBuffers.push(buffer);
      }
    }

    if (imageBuffers.length > 0) {
      const imageCells: TableCell[] = [];

      imageBuffers.forEach(buffer => {
        imageCells.push(
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new ImageRun({
                    data: buffer,
                    transformation: {
                      width: 215,
                      height: 180,
                    },
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 0 },
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            margins: {
              top: convertInchesToTwip(0),
              bottom: convertInchesToTwip(0),
              left: convertInchesToTwip(0),
              right: convertInchesToTwip(0),
            },
          })
        );
      });

      sections.push(
        new Table({
          rows: [
            new TableRow({
              children: imageCells,
            }),
          ],
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 12, color: LIGHT_BLUE },
            bottom: { style: BorderStyle.SINGLE, size: 12, color: LIGHT_BLUE },
            left: { style: BorderStyle.SINGLE, size: 12, color: LIGHT_BLUE },
            right: { style: BorderStyle.SINGLE, size: 12, color: LIGHT_BLUE },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 6, color: LIGHT_BLUE },
            insideVertical: { style: BorderStyle.SINGLE, size: 6, color: LIGHT_BLUE },
          },
        }),
        new Paragraph({
          text: '',
          spacing: { after: 400 },
        })
      );
    }

    sections.push(
      new Paragraph({
        children: [new TextRun({ text: 'PRIVATE CLIENT', size: 56, bold: true, color: PRIMARY_COLOR })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 600, after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'INSURANCE PROPOSAL', size: 56, bold: true, color: PRIMARY_COLOR })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      // Prepared For Box
      new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: 'Prepared For', size: 20, color: ACCENT_COLOR, allCaps: true, bold: true })],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 100, after: 50 },
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: `${proposalData.clientInfo.firstName} ${proposalData.clientInfo.lastName}`, size: 36, bold: true, color: PRIMARY_COLOR })],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 50, after: 100 },
                  }),
                ],
                shading: { fill: 'F9F9F9', type: ShadingType.CLEAR },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 8, color: PRIMARY_COLOR },
                  bottom: { style: BorderStyle.SINGLE, size: 8, color: PRIMARY_COLOR },
                  left: { style: BorderStyle.SINGLE, size: 8, color: PRIMARY_COLOR },
                  right: { style: BorderStyle.SINGLE, size: 8, color: PRIMARY_COLOR },
                },
                margins: {
                  top: convertInchesToTwip(0.15),
                  bottom: convertInchesToTwip(0.15),
                  left: convertInchesToTwip(0.3),
                  right: convertInchesToTwip(0.3),
                },
              }),
            ],
          }),
        ],
        width: { size: 50, type: WidthType.PERCENTAGE },
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({ text: '', spacing: { after: 200 } }),
      // Presented By Box
      new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: 'Presented By', size: 20, color: ACCENT_COLOR, allCaps: true, bold: true })],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 100, after: 50 },
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: proposalData.agentInfo.name, size: 32, bold: true, color: PRIMARY_COLOR })],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 50, after: 100 },
                  }),
                ],
                shading: { fill: 'F9F9F9', type: ShadingType.CLEAR },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 8, color: PRIMARY_COLOR },
                  bottom: { style: BorderStyle.SINGLE, size: 8, color: PRIMARY_COLOR },
                  left: { style: BorderStyle.SINGLE, size: 8, color: PRIMARY_COLOR },
                  right: { style: BorderStyle.SINGLE, size: 8, color: PRIMARY_COLOR },
                },
                margins: {
                  top: convertInchesToTwip(0.15),
                  bottom: convertInchesToTwip(0.15),
                  left: convertInchesToTwip(0.3),
                  right: convertInchesToTwip(0.3),
                },
              }),
            ],
          }),
        ],
        width: { size: 50, type: WidthType.PERCENTAGE },
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({ text: '', spacing: { after: 200 } }),
      // Date Box
      new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: 'Date', size: 20, color: ACCENT_COLOR, allCaps: true, bold: true })],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 100, after: 50 },
                  }),
                  new Paragraph({
                    children: [new TextRun({
                      text: new Date(proposalData.proposalDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                      size: 28,
                      bold: true,
                      color: PRIMARY_COLOR
                    })],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 50, after: 100 },
                  }),
                ],
                shading: { fill: 'F9F9F9', type: ShadingType.CLEAR },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 8, color: PRIMARY_COLOR },
                  bottom: { style: BorderStyle.SINGLE, size: 8, color: PRIMARY_COLOR },
                  left: { style: BorderStyle.SINGLE, size: 8, color: PRIMARY_COLOR },
                  right: { style: BorderStyle.SINGLE, size: 8, color: PRIMARY_COLOR },
                },
                margins: {
                  top: convertInchesToTwip(0.15),
                  bottom: convertInchesToTwip(0.15),
                  left: convertInchesToTwip(0.3),
                  right: convertInchesToTwip(0.3),
                },
              }),
            ],
          }),
        ],
        width: { size: 50, type: WidthType.PERCENTAGE },
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({ text: '', pageBreakBefore: true })
    );

    // ===== TABLE OF CONTENTS =====
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: 'Contents', size: 48, bold: true, color: PRIMARY_COLOR })],
        spacing: { before: 200, after: 200 },
        border: {
          bottom: {
            color: ACCENT_COLOR,
            space: 1,
            style: BorderStyle.SINGLE,
            size: 12,
          },
        },
      }),
      new Paragraph({
        text: '',
        spacing: { after: 300 },
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
      tocItems.push({ title, page: pageNum++ });
    });

    tocItems.push(
      { title: 'Premium Summary', page: pageNum++ },
      { title: 'Recommendations & Discussion Points', page: pageNum++ }
    );

    tocItems.forEach(item => {
      // Separate emoji icon from text to preserve icon colors in TOC
      const emojiMatch = item.title.match(/^([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])\s*/u);
      const emoji = emojiMatch ? emojiMatch[0] : '';
      const textOnly = emoji ? item.title.substring(emoji.length) : item.title;

      const children = [];
      if (emoji) {
        children.push(new TextRun({ text: emoji, size: 30, bold: true }));
      }
      children.push(new TextRun({ text: textOnly, size: 30, bold: true, color: PRIMARY_COLOR }));
      children.push(new TextRun({ text: '\t', size: 30 }));
      children.push(new TextRun({ text: item.page.toString(), size: 30, bold: true, color: ACCENT_COLOR }));

      sections.push(
        new Paragraph({
          children,
          spacing: { before: 150, after: 200 },
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
        children: [new TextRun({ text: 'Welcome', size: 48, bold: true, color: PRIMARY_COLOR })],
        spacing: { before: 200, after: 200 },
        border: {
          bottom: {
            color: ACCENT_COLOR,
            space: 1,
            style: BorderStyle.SINGLE,
            size: 12,
          },
        },
      }),
      new Paragraph({
        text: '',
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: `Dear ${proposalData.clientInfo.firstName} ${proposalData.clientInfo.lastName},`, size: 30, bold: true, color: PRIMARY_COLOR })],
        spacing: { before: 300, after: 250 },
      }),
      new Paragraph({
        children: [new TextRun({
          text: 'Thank you for the opportunity to present this comprehensive insurance proposal. We have carefully reviewed your current coverage and identified opportunities to enhance your protection while potentially reducing costs.',
          size: 28,
          color: PRIMARY_COLOR
        })],
        spacing: { before: 150, after: 250 },
      }),
      new Paragraph({
        children: [new TextRun({
          text: 'This proposal reflects our commitment to providing you with the highest level of service and the most competitive options available in the marketplace. Our team has leveraged our relationships with leading carriers to secure quotes that offer superior coverage at competitive premiums.',
          size: 28,
          color: PRIMARY_COLOR
        })],
        spacing: { before: 150, after: 250 },
      }),
      new Paragraph({
        children: [new TextRun({
          text: 'We look forward to discussing this proposal with you and answering any questions you may have.',
          size: 28,
          color: PRIMARY_COLOR
        })],
        spacing: { before: 150, after: 450 },
      })
    );

    // Important Disclaimer in premium shaded box
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: 'Important Disclaimer', size: 34, bold: true, color: PRIMARY_COLOR })],
        spacing: { before: 300, after: 250 },
      }),
      new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({
                      text: 'Premium quotes are subject to underwriting approval and may change based on final underwriting review, inspection results, or changes in the information provided. All coverage is subject to the terms, conditions, and exclusions of the insurance policy as issued by the carrier.',
                      size: 28,
                      color: 'FFFFFF'
                    })],
                    spacing: { before: 250, after: 250 },
                  }),
                ],
                shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR },
                borders: {
                  left: { style: BorderStyle.SINGLE, size: 16, color: ACCENT_COLOR },
                  top: { style: BorderStyle.SINGLE, size: 4, color: ACCENT_COLOR },
                  bottom: { style: BorderStyle.SINGLE, size: 4, color: ACCENT_COLOR },
                  right: { style: BorderStyle.SINGLE, size: 4, color: ACCENT_COLOR },
                },
                margins: {
                  top: convertInchesToTwip(0.2),
                  bottom: convertInchesToTwip(0.2),
                  left: convertInchesToTwip(0.3),
                  right: convertInchesToTwip(0.3),
                },
              }),
            ],
          }),
        ],
        width: { size: 100, type: WidthType.PERCENTAGE },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Compensation', size: 34, bold: true, color: PRIMARY_COLOR })],
        spacing: { before: 450, after: 250 },
      }),
      new Paragraph({
        children: [new TextRun({
          text: `${proposalData.agencyName || 'Metro Point Insurance'} is compensated through commissions paid by insurance carriers for policies placed. Commission rates vary by carrier and coverage type but typically range from 10% to 15% of the premium.`,
          size: 28,
          color: PRIMARY_COLOR
        })],
        spacing: { before: 150, after: 250 },
      }),
      new Paragraph({
        children: [new TextRun({
          text: 'Our compensation does not affect the premium you pay. Premiums are set by the insurance carriers based on their underwriting guidelines and rate filings.',
          size: 28,
          color: PRIMARY_COLOR
        })],
        spacing: { before: 150, after: 250 },
      }),
      new Paragraph({
        children: [new TextRun({
          text: 'We may also receive contingent commissions or bonuses based on overall volume and loss performance with certain carriers. These arrangements do not influence our recommendations, which are based solely on providing you with the best coverage at the most competitive price.',
          size: 28,
          color: PRIMARY_COLOR
        })],
        spacing: { before: 150, after: 250 },
      }),
      new Paragraph({ text: '', pageBreakBefore: true })
    );

    // ===== ABOUT AGENCY PAGE =====
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: `About ${proposalData.agencyName || 'Metro Point Insurance'}`, size: 48, bold: true, color: PRIMARY_COLOR })],
        spacing: { before: 200, after: 200 },
        border: {
          bottom: {
            color: ACCENT_COLOR,
            space: 1,
            style: BorderStyle.SINGLE,
            size: 12,
          },
        },
      }),
      new Paragraph({
        text: '',
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({
          text: `${proposalData.agencyName || 'Metro Point Insurance'} is a leading independent insurance agency specializing in high-net-worth personal insurance and risk management. With decades of combined experience, our team brings deep expertise in protecting the unique assets and lifestyles of affluent individuals and families.`,
          size: 28,
          color: PRIMARY_COLOR
        })],
        spacing: { before: 300, after: 400 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Our Unique Advantage', size: 36, bold: true, color: PRIMARY_COLOR })],
        spacing: { before: 300, after: 250 },
      }),
      new Paragraph({
        children: [new TextRun({
          text: 'As an independent agency, we work with multiple top-rated insurance carriers, providing you with the best coverage at competitive prices. We have the flexibility to shop the market on your behalf and negotiate optimal terms.',
          size: 28,
          color: PRIMARY_COLOR
        })],
        spacing: { before: 150, after: 400 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Why Choose Us', size: 36, bold: true, color: PRIMARY_COLOR })],
        spacing: { before: 300, after: 250 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '✓ ', size: 32, color: ACCENT_COLOR, bold: true }),
          new TextRun({ text: 'Independent representation with access to multiple A-rated carriers', size: 28, color: PRIMARY_COLOR }),
        ],
        spacing: { before: 150, after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '✓ ', size: 32, color: ACCENT_COLOR, bold: true }),
          new TextRun({ text: 'Specialized expertise in high-net-worth personal insurance', size: 28, color: PRIMARY_COLOR }),
        ],
        spacing: { before: 150, after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '✓ ', size: 32, color: ACCENT_COLOR, bold: true }),
          new TextRun({ text: 'Personalized service with dedicated account management', size: 28, color: PRIMARY_COLOR }),
        ],
        spacing: { before: 150, after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '✓ ', size: 32, color: ACCENT_COLOR, bold: true }),
          new TextRun({ text: 'Comprehensive risk assessment and coverage analysis', size: 28, color: PRIMARY_COLOR }),
        ],
        spacing: { before: 150, after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '✓ ', size: 32, color: ACCENT_COLOR, bold: true }),
          new TextRun({ text: 'Claims advocacy and support when you need it most', size: 28, color: PRIMARY_COLOR }),
        ],
        spacing: { before: 150, after: 450 },
      })
    );

    // Contact Information in premium shaded box
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: 'Contact Information', size: 36, bold: true, color: PRIMARY_COLOR })],
        spacing: { before: 300, after: 250 },
      }),
      new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'Phone: ', bold: true, size: 28, color: 'FFFFFF' }),
                      new TextRun({ text: proposalData.agentInfo.phone || '(555) 123-4567', size: 28, color: 'FFFFFF' }),
                    ],
                    spacing: { before: 150, after: 150 },
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'Email: ', bold: true, size: 28, color: 'FFFFFF' }),
                      new TextRun({ text: proposalData.agentInfo.email || 'info@agency.com', size: 28, color: 'FFFFFF' }),
                    ],
                    spacing: { before: 150, after: 150 },
                  }),
                ],
                shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 4, color: ACCENT_COLOR },
                  bottom: { style: BorderStyle.SINGLE, size: 4, color: ACCENT_COLOR },
                  left: { style: BorderStyle.SINGLE, size: 4, color: ACCENT_COLOR },
                  right: { style: BorderStyle.SINGLE, size: 4, color: ACCENT_COLOR },
                },
                margins: {
                  top: convertInchesToTwip(0.2),
                  bottom: convertInchesToTwip(0.2),
                  left: convertInchesToTwip(0.3),
                  right: convertInchesToTwip(0.3),
                },
              }),
            ],
          }),
        ],
        width: { size: 100, type: WidthType.PERCENTAGE },
      }),
      new Paragraph({ text: '', pageBreakBefore: true })
    );

    // ===== TEAM PAGE =====
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: `Your ${proposalData.agencyName || 'Metro Point Insurance'} Team`, size: 48, bold: true, color: PRIMARY_COLOR })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
        border: {
          bottom: {
            color: ACCENT_COLOR,
            space: 1,
            style: BorderStyle.SINGLE,
            size: 12,
          },
        },
      }),
      new Paragraph({
        text: '',
        spacing: { after: 200 },
      })
    );

    // Function to add team member details
    const addTeamMember = async (member: any, isFirst: boolean = false) => {
      // Add member photo if available
      if (member.photo) {
        const photoBuffer = await fetchImageAsBuffer(member.photo);
        if (photoBuffer) {
          sections.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: photoBuffer,
                  transformation: {
                    width: 150,
                    height: 150,
                  },
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: isFirst ? 300 : 400, after: 300 },
            })
          );
        }
      }

      sections.push(
        new Paragraph({
          children: [new TextRun({ text: member.name, size: 38, bold: true, color: PRIMARY_COLOR })],
          alignment: AlignmentType.CENTER,
          spacing: { before: member.photo ? 0 : (isFirst ? 300 : 400), after: 150 },
        }),
        new Paragraph({
          children: [new TextRun({ text: member.title || 'Insurance Advisor', size: 30, color: ACCENT_COLOR, bold: true })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
        })
      );

      if (member.phone) {
        sections.push(
          new Paragraph({
            children: [new TextRun({ text: member.phone, size: 28, color: PRIMARY_COLOR })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 150 },
          })
        );
      }

      if (member.email) {
        sections.push(
          new Paragraph({
            children: [new TextRun({ text: member.email, size: 28, color: PRIMARY_COLOR })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          })
        );
      }
    };

    // Add primary agent
    await addTeamMember(proposalData.agentInfo, true);

    // Add additional team members if available
    if (proposalData.teamMembers && proposalData.teamMembers.length > 0) {
      for (const teamMember of proposalData.teamMembers) {
        await addTeamMember(teamMember, false);
      }
    }

    sections.push(new Paragraph({ text: '', pageBreakBefore: true }));

    // Helper function to create coverage header (used for continuation pages)
    const createCoverageHeader = (title: string, isContinuation: boolean = false) => {
      // Separate emoji icon from text to preserve icon colors
      const emojiMatch = title.match(/^([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])\s*/u);
      const emoji = emojiMatch ? emojiMatch[0] : '';
      const textOnly = emoji ? title.substring(emoji.length) : title;
      const displayText = isContinuation ? `${textOnly} (Cont'd)` : textOnly;

      return [
        new Paragraph({
          children: [
            ...(emoji ? [new TextRun({ text: emoji, size: isContinuation ? 36 : 52, bold: true })] : []),
            new TextRun({ text: displayText, size: isContinuation ? 36 : 52, bold: true, color: PRIMARY_COLOR })
          ],
          spacing: { before: isContinuation ? 100 : 200, after: isContinuation ? 100 : 200 },
          border: {
            bottom: {
              color: ACCENT_COLOR,
              space: 1,
              style: BorderStyle.SINGLE,
              size: isContinuation ? 6 : 12,
            },
          },
        }),
        new Paragraph({
          text: '',
          spacing: { after: isContinuation ? 100 : 200 },
        })
      ];
    };

    // ===== COVERAGE PAGES =====
    Object.entries(proposalData.coverages).forEach(([type, coverage]) => {
      const coverageType = type as CoverageType;
      const title = COVERAGE_TITLES[coverageType] || 'Coverage';

      // Add main coverage header
      sections.push(...createCoverageHeader(title, false));

      // Premium in prominent colored box with gold styling
      const proposedPremium = parseFloat(coverage.proposed_premium?.toString() || '0');
      sections.push(
        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: 'Annual Premium: ', size: 36, bold: true, color: 'FFFFFF' }),
                        new TextRun({ text: `$${proposedPremium.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, size: 52, bold: true, color: 'FFFFFF' }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 300, after: 300 },
                    }),
                  ],
                  shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR },
                  verticalAlign: VerticalAlign.CENTER,
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 12, color: ACCENT_COLOR },
                    bottom: { style: BorderStyle.SINGLE, size: 12, color: ACCENT_COLOR },
                    left: { style: BorderStyle.SINGLE, size: 12, color: ACCENT_COLOR },
                    right: { style: BorderStyle.SINGLE, size: 12, color: ACCENT_COLOR },
                  },
                }),
              ],
            }),
          ],
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: {
            top: convertInchesToTwip(0.2),
            bottom: convertInchesToTwip(0.2),
          },
        }),
        new Paragraph({
          text: '',
          spacing: { after: 400 },
        })
      );

      // Coverage details in professional two-column table
      const coverageRows: TableRow[] = [];

      // Helper function to add a table row
      const addTableRow = (label: string, value: string) => {
        coverageRows.push(
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 26, color: 'FFFFFF' })], spacing: { before: 150, after: 150 } })],
                shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR },
                width: { size: 40, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 6, color: ACCENT_COLOR },
                  bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT_COLOR },
                  left: { style: BorderStyle.SINGLE, size: 6, color: ACCENT_COLOR },
                  right: { style: BorderStyle.SINGLE, size: 6, color: ACCENT_COLOR },
                },
                margins: {
                  top: convertInchesToTwip(0.15),
                  bottom: convertInchesToTwip(0.15),
                  left: convertInchesToTwip(0.2),
                  right: convertInchesToTwip(0.2),
                },
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: value, size: 26, color: PRIMARY_COLOR })], spacing: { before: 150, after: 150 } })],
                width: { size: 60, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 4, color: PRIMARY_COLOR },
                  bottom: { style: BorderStyle.SINGLE, size: 4, color: PRIMARY_COLOR },
                  left: { style: BorderStyle.SINGLE, size: 4, color: PRIMARY_COLOR },
                  right: { style: BorderStyle.SINGLE, size: 4, color: PRIMARY_COLOR },
                },
                margins: {
                  top: convertInchesToTwip(0.15),
                  bottom: convertInchesToTwip(0.15),
                  left: convertInchesToTwip(0.2),
                  right: convertInchesToTwip(0.2),
                },
              }),
            ],
          })
        );
      };

      // Policy Number
      if (coverage.policy_number) {
        addTableRow('Policy Number', coverage.policy_number?.toString() || 'N/A');
      }

      // Carrier
      if (coverage.proposed_carrier) {
        addTableRow('Carrier', coverage.proposed_carrier);
      }

      // Policy Term
      if (coverage.policy_term) {
        addTableRow('Policy Term', coverage.policy_term?.toString() || 'N/A');
      }

      // Coverage-specific fields based on type
      if (coverageType === 'homeowners' || coverageType === 'condo') {
        if (coverage.property_address) addTableRow('Property Address', coverage.property_address.toString());
        if (coverage.dwelling_coverage) addTableRow('Dwelling Coverage', coverage.dwelling_coverage.toString());
        if (coverage.other_structures) addTableRow('Other Structures', coverage.other_structures.toString());
        if (coverage.personal_property) addTableRow('Personal Property', coverage.personal_property.toString());
        if (coverage.loss_of_use) addTableRow('Loss of Use', coverage.loss_of_use.toString());
        if (coverage.personal_liability) addTableRow('Personal Liability', coverage.personal_liability.toString());
        if (coverage.medical_payments) addTableRow('Medical Payments to Others', coverage.medical_payments.toString());
        if (coverage.deductible) addTableRow('Deductible (Other Perils)', coverage.deductible.toString());
        if (coverage.hurricane_deductible) addTableRow('Hurricane Deductible', coverage.hurricane_deductible.toString());
        if (coverage.wind_deductible) addTableRow('Wind Deductible', coverage.wind_deductible.toString());
        if (coverage.water_backup) addTableRow('Water Backup Coverage', coverage.water_backup.toString());
        if (coverage.equipment_breakdown) addTableRow('Equipment Breakdown', coverage.equipment_breakdown.toString());
        if (coverage.identity_theft) addTableRow('Identity Theft', coverage.identity_theft.toString());
        if (coverage.endorsements) addTableRow('Endorsements', coverage.endorsements.toString());
      } else if (coverageType === 'auto') {
        if (coverage.vehicles) addTableRow('Vehicles', coverage.vehicles.toString());
        if (coverage.liability_limits) addTableRow('Liability Limits', coverage.liability_limits.toString());
        if (coverage.uninsured_motorist) addTableRow('Uninsured Motorist', coverage.uninsured_motorist.toString());
        if (coverage.pip_coverage) addTableRow('PIP Coverage', coverage.pip_coverage.toString());
        if (coverage.additional_pip) addTableRow('Additional PIP', coverage.additional_pip.toString());
        if (coverage.rental_reimbursement) addTableRow('Rental Reimbursement', coverage.rental_reimbursement.toString());
        if (coverage.full_glass_coverage) addTableRow('Full Glass Coverage', coverage.full_glass_coverage.toString());
        if (coverage.towing_labor) addTableRow('Towing & Labor', coverage.towing_labor.toString());
        if (coverage.comprehensive_deductible) addTableRow('Comprehensive Deductible', coverage.comprehensive_deductible.toString());
        if (coverage.collision_deductible) addTableRow('Collision Deductible', coverage.collision_deductible.toString());
        if (coverage.drivers_listed) addTableRow('Drivers Listed', coverage.drivers_listed.toString());
        if (coverage.additional_interests) addTableRow('Additional Interests', coverage.additional_interests.toString());
      } else if (coverageType === 'umbrella') {
        if (coverage.liability_limit) addTableRow('Liability Limit', coverage.liability_limit.toString());
        if (coverage.underlying_auto_limit) addTableRow('Underlying Auto Limit', coverage.underlying_auto_limit.toString());
        if (coverage.underlying_home_limit) addTableRow('Underlying Home Limit', coverage.underlying_home_limit.toString());
      } else if (coverageType === 'watercraft') {
        if (coverage.vessel_type) addTableRow('Vessel Type', coverage.vessel_type.toString());
        if (coverage.vessel_value) addTableRow('Vessel Value', coverage.vessel_value.toString());
        if (coverage.liability_coverage) addTableRow('Liability Coverage', coverage.liability_coverage.toString());
        if (coverage.physical_damage) addTableRow('Physical Damage', coverage.physical_damage.toString());
        if (coverage.deductible) addTableRow('Deductible', coverage.deductible.toString());
      } else if (coverageType === 'jewelry') {
        if (coverage.items_scheduled) addTableRow('Items Scheduled', coverage.items_scheduled.toString());
        if (coverage.total_value) addTableRow('Total Value', coverage.total_value.toString());
        if (coverage.deductible) addTableRow('Deductible', coverage.deductible.toString());
      } else {
        // For other coverage types, add all fields dynamically
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
            addTableRow(label, value.toString());
          }
        });
      }

      if (coverageRows.length > 0) {
        sections.push(
          new Paragraph({
            children: [new TextRun({ text: 'Coverage Details', size: 38, bold: true, color: PRIMARY_COLOR })],
            spacing: { before: 300, after: 250 },
          }),
          new Table({
            rows: coverageRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
          new Paragraph({
            text: '',
            spacing: { after: 200 },
          })
        );
      }

      sections.push(new Paragraph({ text: '', pageBreakBefore: true }));
    });

    // ===== PREMIUM SUMMARY PAGE =====
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: 'Premium Summary', size: 52, bold: true, color: PRIMARY_COLOR })],
        spacing: { before: 200, after: 200 },
        border: {
          bottom: {
            color: ACCENT_COLOR,
            space: 1,
            style: BorderStyle.SINGLE,
            size: 12,
          },
        },
      }),
      new Paragraph({
        text: '',
        spacing: { after: 250 },
      })
    );

    // Create premium summary table
    const summaryRows: TableRow[] = [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Coverage Type', bold: true, size: 28, color: 'FFFFFF' })], alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 } })],
            shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR },
            verticalAlign: VerticalAlign.CENTER,
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: ACCENT_COLOR },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: ACCENT_COLOR },
              left: { style: BorderStyle.SINGLE, size: 4, color: ACCENT_COLOR },
              right: { style: BorderStyle.SINGLE, size: 4, color: ACCENT_COLOR },
            },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Expiring Premium', bold: true, size: 28, color: 'FFFFFF' })], alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 } })],
            shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR },
            verticalAlign: VerticalAlign.CENTER,
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: ACCENT_COLOR },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: ACCENT_COLOR },
              left: { style: BorderStyle.SINGLE, size: 4, color: ACCENT_COLOR },
              right: { style: BorderStyle.SINGLE, size: 4, color: ACCENT_COLOR },
            },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Renewal Premium', bold: true, size: 28, color: 'FFFFFF' })], alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 } })],
            shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR },
            verticalAlign: VerticalAlign.CENTER,
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: ACCENT_COLOR },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: ACCENT_COLOR },
              left: { style: BorderStyle.SINGLE, size: 4, color: ACCENT_COLOR },
              right: { style: BorderStyle.SINGLE, size: 4, color: ACCENT_COLOR },
            },
          }),
        ],
      }),
    ];

    Object.entries(proposalData.coverages).forEach(([type, coverage]) => {
      const coverageType = type as CoverageType;
      const title = COVERAGE_TITLES[coverageType] || 'Coverage';
      const current = parseFloat(coverage.current_premium?.toString() || '0');
      const proposed = parseFloat(coverage.proposed_premium?.toString() || '0');

      // Separate emoji icon from text to preserve icon colors
      const emojiMatch = title.match(/^([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])\s*/u);
      const emoji = emojiMatch ? emojiMatch[0] : '';
      const textOnly = emoji ? title.substring(emoji.length) : title;

      const titleChildren = [];
      if (emoji) {
        titleChildren.push(new TextRun({ text: emoji, size: 26 }));
      }
      titleChildren.push(new TextRun({ text: textOnly, size: 26, color: PRIMARY_COLOR }));

      summaryRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: titleChildren, spacing: { before: 150, after: 150 } })],
              borders: {
                top: { style: BorderStyle.SINGLE, size: 4, color: PRIMARY_COLOR },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: PRIMARY_COLOR },
                left: { style: BorderStyle.SINGLE, size: 4, color: PRIMARY_COLOR },
                right: { style: BorderStyle.SINGLE, size: 4, color: PRIMARY_COLOR },
              },
              margins: {
                top: convertInchesToTwip(0.1),
                bottom: convertInchesToTwip(0.1),
                left: convertInchesToTwip(0.15),
                right: convertInchesToTwip(0.15),
              },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: `$${current.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, size: 26, color: PRIMARY_COLOR })], alignment: AlignmentType.RIGHT, spacing: { before: 150, after: 150 } })],
              borders: {
                top: { style: BorderStyle.SINGLE, size: 4, color: PRIMARY_COLOR },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: PRIMARY_COLOR },
                left: { style: BorderStyle.SINGLE, size: 4, color: PRIMARY_COLOR },
                right: { style: BorderStyle.SINGLE, size: 4, color: PRIMARY_COLOR },
              },
              margins: {
                top: convertInchesToTwip(0.1),
                bottom: convertInchesToTwip(0.1),
                left: convertInchesToTwip(0.15),
                right: convertInchesToTwip(0.15),
              },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: `$${proposed.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, size: 26, color: PRIMARY_COLOR })], alignment: AlignmentType.RIGHT, spacing: { before: 150, after: 150 } })],
              borders: {
                top: { style: BorderStyle.SINGLE, size: 4, color: PRIMARY_COLOR },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: PRIMARY_COLOR },
                left: { style: BorderStyle.SINGLE, size: 4, color: PRIMARY_COLOR },
                right: { style: BorderStyle.SINGLE, size: 4, color: PRIMARY_COLOR },
              },
              margins: {
                top: convertInchesToTwip(0.1),
                bottom: convertInchesToTwip(0.1),
                left: convertInchesToTwip(0.15),
                right: convertInchesToTwip(0.15),
              },
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
            children: [new Paragraph({ children: [new TextRun({ text: 'TOTAL', bold: true, size: 30, color: 'FFFFFF' })], spacing: { before: 200, after: 200 } })],
            shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 8, color: ACCENT_COLOR },
              bottom: { style: BorderStyle.SINGLE, size: 8, color: ACCENT_COLOR },
              left: { style: BorderStyle.SINGLE, size: 8, color: ACCENT_COLOR },
              right: { style: BorderStyle.SINGLE, size: 8, color: ACCENT_COLOR },
            },
            margins: {
              top: convertInchesToTwip(0.15),
              bottom: convertInchesToTwip(0.15),
              left: convertInchesToTwip(0.15),
              right: convertInchesToTwip(0.15),
            },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: `$${totalCurrentPremium.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, bold: true, size: 30, color: 'FFFFFF' })], alignment: AlignmentType.RIGHT, spacing: { before: 200, after: 200 } })],
            shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 8, color: ACCENT_COLOR },
              bottom: { style: BorderStyle.SINGLE, size: 8, color: ACCENT_COLOR },
              left: { style: BorderStyle.SINGLE, size: 8, color: ACCENT_COLOR },
              right: { style: BorderStyle.SINGLE, size: 8, color: ACCENT_COLOR },
            },
            margins: {
              top: convertInchesToTwip(0.15),
              bottom: convertInchesToTwip(0.15),
              left: convertInchesToTwip(0.15),
              right: convertInchesToTwip(0.15),
            },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: `$${totalProposedPremium.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, bold: true, size: 30, color: 'FFFFFF' })], alignment: AlignmentType.RIGHT, spacing: { before: 200, after: 200 } })],
            shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 8, color: ACCENT_COLOR },
              bottom: { style: BorderStyle.SINGLE, size: 8, color: ACCENT_COLOR },
              left: { style: BorderStyle.SINGLE, size: 8, color: ACCENT_COLOR },
              right: { style: BorderStyle.SINGLE, size: 8, color: ACCENT_COLOR },
            },
            margins: {
              top: convertInchesToTwip(0.15),
              bottom: convertInchesToTwip(0.15),
              left: convertInchesToTwip(0.15),
              right: convertInchesToTwip(0.15),
            },
          }),
        ],
      })
    );

    sections.push(
      new Table({
        rows: summaryRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      })
    );

    // Savings summary in prominent colored box
    if (savingsAmount !== 0) {
      const isSavings = savingsAmount > 0;
      const boxColor = isSavings ? GREEN : RED;
      const savingsText = isSavings ? 'Total Annual Savings' : 'Total Annual Increase';

      sections.push(
        new Paragraph({
          text: '',
          spacing: { before: 450, after: 250 },
        }),
        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: savingsText, size: 36, bold: true, color: 'FFFFFF' }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 200, after: 100 },
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${isSavings ? '-' : '+'}$${Math.abs(savingsAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                          size: 56,
                          bold: true,
                          color: 'FFFFFF'
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 150, after: 100 },
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `(${isSavings ? '-' : '+'}${Math.abs(parseFloat(savingsPercentage))}%)`,
                          size: 36,
                          bold: true,
                          color: 'FFFFFF'
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 100, after: 200 },
                    }),
                  ],
                  shading: { fill: boxColor, type: ShadingType.CLEAR },
                  verticalAlign: VerticalAlign.CENTER,
                }),
              ],
            }),
          ],
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      );
    }

    sections.push(new Paragraph({ text: '', pageBreakBefore: true }));

    // ===== RECOMMENDATIONS PAGE =====
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: 'Recommendations & Discussion Points', size: 52, bold: true, color: PRIMARY_COLOR })],
        spacing: { before: 200, after: 200 },
        border: {
          bottom: {
            color: ACCENT_COLOR,
            space: 1,
            style: BorderStyle.SINGLE,
            size: 12,
          },
        },
      }),
      new Paragraph({
        text: '',
        spacing: { after: 250 },
      })
    );

    if (proposalData.notes) {
      proposalData.notes.split('\n').filter(line => line.trim()).forEach(note => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: '✓ ', size: 32, color: ACCENT_COLOR, bold: true }),
              new TextRun({ text: note.trim(), size: 28, color: PRIMARY_COLOR }),
            ],
            spacing: { before: 200, after: 250 },
          })
        );
      });
    } else {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: '✓ ', size: 32, color: ACCENT_COLOR, bold: true }),
            new TextRun({ text: 'Review all coverage limits to ensure adequate protection', size: 28, color: PRIMARY_COLOR }),
          ],
          spacing: { before: 200, after: 250 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: '✓ ', size: 32, color: ACCENT_COLOR, bold: true }),
            new TextRun({ text: 'Consider increasing umbrella coverage for additional liability protection', size: 28, color: PRIMARY_COLOR }),
          ],
          spacing: { before: 200, after: 250 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: '✓ ', size: 32, color: ACCENT_COLOR, bold: true }),
            new TextRun({ text: 'Ensure all high-value items are properly scheduled', size: 28, color: PRIMARY_COLOR }),
          ],
          spacing: { before: 200, after: 250 },
        })
      );
    }

    sections.push(
      new Paragraph({
        children: [new TextRun({ text: 'Next Steps', size: 38, bold: true, color: PRIMARY_COLOR })],
        spacing: { before: 450, after: 300 },
      }),
      new Paragraph({
        children: [new TextRun({
          text: 'Please review this proposal carefully and contact us with any questions. We are happy to discuss any aspect of the coverage or make adjustments as needed. Once you are ready to proceed, we will work quickly to bind coverage and provide you with your policy documents.',
          size: 28,
          color: PRIMARY_COLOR
        })],
        spacing: { before: 200, after: 300 },
      }),
      new Paragraph({
        children: [new TextRun({
          text: 'Thank you for the opportunity to serve your insurance needs. We look forward to protecting what matters most to you.',
          size: 28,
          color: PRIMARY_COLOR
        })],
        spacing: { before: 200, after: 300 },
      })
    );

    // Create the document
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(0.75),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(0.75),
            },
            pageNumbers: {
              start: 1,
              formatType: NumberFormat.DECIMAL,
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${proposalData.agencyName || 'ABC Insurance Agency'} | WRAP Proposal | Page `,
                    size: 20,
                    color: '666666',
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 20,
                    color: '666666',
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
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
