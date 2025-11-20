// Word Document Generator using docx library
async function generateDocxFile(data, filename) {
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, BorderStyle } = docx;

    // Calculate totals
    let totalCurrent = 0;
    let totalProposed = 0;
    Object.keys(data.coverages).forEach(coverageType => {
        const coverage = data.coverages[coverageType];
        totalCurrent += parseFloat(coverage.current_premium) || 0;
        totalProposed += parseFloat(coverage.proposed_premium) || 0;
    });
    const savings = totalCurrent - totalProposed;
    const savingsPercent = totalCurrent > 0 ? ((savings / totalCurrent) * 100).toFixed(1) : 0;

    // Format date
    const proposalDate = new Date(data.proposalDate);
    const formattedDate = proposalDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Build document sections
    const sections = [];

    // Header Section
    sections.push(
        new Paragraph({
            text: data.companyInfo.name || 'Insurance Agency',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
        })
    );

    if (data.companyInfo.address || data.companyInfo.phone || data.companyInfo.email || data.companyInfo.website) {
        const contactInfo = [];
        if (data.companyInfo.address) contactInfo.push(data.companyInfo.address);
        if (data.companyInfo.phone) contactInfo.push(data.companyInfo.phone);
        if (data.companyInfo.email) contactInfo.push(data.companyInfo.email);
        if (data.companyInfo.website) contactInfo.push(data.companyInfo.website);

        sections.push(
            new Paragraph({
                text: contactInfo.join(' | '),
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
            })
        );
    }

    // Proposal Title
    sections.push(
        new Paragraph({
            text: 'WRAP INSURANCE PROPOSAL',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 400 }
        })
    );

    // Client Information
    sections.push(
        new Paragraph({
            text: 'Client Information',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 }
        })
    );

    sections.push(
        new Paragraph({
            children: [
                new TextRun({ text: 'Prepared for: ', bold: true }),
                new TextRun(`${data.clientInfo.firstName} ${data.clientInfo.lastName}`)
            ],
            spacing: { after: 100 }
        })
    );

    sections.push(
        new Paragraph({
            children: [
                new TextRun({ text: 'Address: ', bold: true }),
                new TextRun(`${data.clientInfo.address}, ${data.clientInfo.city}, ${data.clientInfo.state} ${data.clientInfo.zip}`)
            ],
            spacing: { after: 100 }
        })
    );

    if (data.clientInfo.email) {
        sections.push(
            new Paragraph({
                children: [
                    new TextRun({ text: 'Email: ', bold: true }),
                    new TextRun(data.clientInfo.email)
                ],
                spacing: { after: 100 }
            })
        );
    }

    if (data.clientInfo.phone) {
        sections.push(
            new Paragraph({
                children: [
                    new TextRun({ text: 'Phone: ', bold: true }),
                    new TextRun(data.clientInfo.phone)
                ],
                spacing: { after: 100 }
            })
        );
    }

    sections.push(
        new Paragraph({
            children: [
                new TextRun({ text: 'Proposal Date: ', bold: true }),
                new TextRun(formattedDate)
            ],
            spacing: { after: 300 }
        })
    );

    // Team Members
    if (data.teamMembers && data.teamMembers.length > 0) {
        sections.push(
            new Paragraph({
                text: 'Your Advisory Team',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 200 }
            })
        );

        data.teamMembers.forEach(member => {
            sections.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: member.name, bold: true })
                    ],
                    spacing: { after: 50 }
                })
            );

            if (member.title) {
                sections.push(
                    new Paragraph({
                        text: member.title,
                        spacing: { after: 50 }
                    })
                );
            }

            const contactDetails = [];
            if (member.phone) contactDetails.push(member.phone);
            if (member.email) contactDetails.push(member.email);

            if (contactDetails.length > 0) {
                sections.push(
                    new Paragraph({
                        text: contactDetails.join(' | '),
                        spacing: { after: 150 }
                    })
                );
            }
        });
    }

    // Executive Summary
    if (data.executiveSummary) {
        sections.push(
            new Paragraph({
                text: 'Executive Summary',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 200 }
            })
        );

        sections.push(
            new Paragraph({
                text: data.executiveSummary,
                spacing: { after: 300 }
            })
        );
    }

    // Premium Summary
    sections.push(
        new Paragraph({
            text: 'Premium Summary',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 }
        })
    );

    const summaryTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph({ text: 'Description', bold: true })],
                        width: { size: 60, type: WidthType.PERCENTAGE }
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: 'Amount', bold: true, alignment: AlignmentType.RIGHT })],
                        width: { size: 40, type: WidthType.PERCENTAGE }
                    })
                ]
            }),
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph('Total Current Premium')] }),
                    new TableCell({ children: [new Paragraph({ text: `$${totalCurrent.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, alignment: AlignmentType.RIGHT })] })
                ]
            }),
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph('Total Proposed Premium')] }),
                    new TableCell({ children: [new Paragraph({ text: `$${totalProposed.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, alignment: AlignmentType.RIGHT })] })
                ]
            }),
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph({ text: 'Annual Savings', bold: true })] }),
                    new TableCell({
                        children: [new Paragraph({
                            text: `$${savings.toLocaleString('en-US', { minimumFractionDigits: 2 })} (${savingsPercent}%)`,
                            alignment: AlignmentType.RIGHT,
                            bold: true
                        })]
                    })
                ]
            })
        ]
    });

    sections.push(summaryTable);
    sections.push(new Paragraph({ text: '', spacing: { after: 300 } }));

    // Coverage Details
    sections.push(
        new Paragraph({
            text: 'Coverage Details',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 }
        })
    );

    Object.keys(data.coverages).forEach(coverageType => {
        const template = coverageTemplates[coverageType];
        const coverageData = data.coverages[coverageType];

        if (!template) return;

        sections.push(
            new Paragraph({
                text: template.title,
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 200, after: 150 }
            })
        );

        template.fields.forEach(field => {
            const value = coverageData[field.id];
            if (value) {
                sections.push(
                    new Paragraph({
                        children: [
                            new TextRun({ text: `${field.label}: `, bold: true }),
                            new TextRun(value)
                        ],
                        spacing: { after: 100 }
                    })
                );
            }
        });

        sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));
    });

    // Additional Notes
    if (data.notes) {
        sections.push(
            new Paragraph({
                text: 'Additional Notes',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 200 }
            })
        );

        sections.push(
            new Paragraph({
                text: data.notes,
                spacing: { after: 300 }
            })
        );
    }

    // Footer
    sections.push(
        new Paragraph({
            text: '',
            spacing: { before: 400 }
        })
    );

    sections.push(
        new Paragraph({
            text: '___________________________________________',
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 }
        })
    );

    sections.push(
        new Paragraph({
            text: `This proposal is prepared by ${data.companyInfo.name} and is valid for 30 days from the proposal date.`,
            alignment: AlignmentType.CENTER,
            italics: true
        })
    );

    // Create document
    const doc = new Document({
        sections: [{
            properties: {},
            children: sections
        }]
    });

    // Generate and download
    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);
}
