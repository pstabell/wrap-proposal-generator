// Page-by-page PDF generator for perfect page breaks
async function generatePDFPageByPage(data, filename) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let currentPage = 1;

    // Helper function to add a new page
    function addNewPage() {
        pdf.addPage();
        currentPage++;
    }

    // Helper to render HTML section to canvas
    async function renderSection(htmlContent, width = 800) {
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.width = width + 'px';
        tempDiv.style.backgroundColor = 'white';
        tempDiv.innerHTML = htmlContent;
        document.body.appendChild(tempDiv);

        const canvas = await html2canvas(tempDiv, {
            scale: 1.2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            allowTaint: true
        });

        document.body.removeChild(tempDiv);
        return canvas;
    }

    try {
        showMessage('Generating professional PDF... This may take a moment.', 'success');

        const brandColor = data.companyInfo.brandColor || '#003366';
        const clientName = `${data.clientInfo.firstName} ${data.clientInfo.lastName}`;
        const proposalDate = new Date(data.proposalDate).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        // Calculate totals
        let totalCurrent = 0;
        let totalProposed = 0;
        Object.keys(data.coverages).forEach(type => {
            const coverage = data.coverages[type];
            totalCurrent += parseFloat(coverage.current_premium) || 0;
            totalProposed += parseFloat(coverage.proposed_premium) || 0;
        });
        const savings = totalCurrent - totalProposed;
        const savingsPercent = totalCurrent > 0 ? ((savings / totalCurrent) * 100).toFixed(1) : 0;

        // PAGE 1: COVER PAGE
        const coverHTML = `
            <div style="width: 800px; height: 1100px; background: white; padding: 40px; font-family: 'Segoe UI', Arial; position: relative;">
                ${data.companyInfo.logo ?
                    `<img src="${data.companyInfo.logo}" style="max-width: 250px; max-height: 60px; margin-bottom: 20px;">` :
                    `<div style="font-size: 24px; color: ${brandColor}; font-weight: 700; margin-bottom: 30px;">${data.companyInfo.name}</div>`
                }

                <div style="margin-top: 80px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                    <img src="miami-mansion.jpg" style="width: 100%; height: 163px; object-fit: cover; border-radius: 8px;">
                    <img src="yacht.jpg" style="width: 100%; height: 163px; object-fit: cover; border-radius: 8px;">
                    <img src="g700-jet.jpg" style="width: 100%; height: 163px; object-fit: cover; border-radius: 8px;">
                </div>

                <div style="font-size: 32px; color: ${brandColor}; font-weight: 700; text-align: center; margin: 30px 0; letter-spacing: 2px;">
                    WRAP INSURANCE PROPOSAL
                </div>

                <div style="position: absolute; bottom: 60px; left: 40px; right: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border: 4px solid ${brandColor};">
                        <div style="font-size: 11pt; color: ${brandColor}; font-weight: 700; margin-bottom: 8px;">PREPARED FOR</div>
                        <div style="font-size: 18pt; font-weight: 600;">${clientName}</div>
                        <div style="font-size: 12pt; color: #666; margin-top: 6px;">${data.clientInfo.city}, ${data.clientInfo.state}</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border: 4px solid ${brandColor};">
                        <div style="font-size: 11pt; color: ${brandColor}; font-weight: 700; margin-bottom: 8px;">PROPOSAL DATE</div>
                        <div style="font-size: 18pt; font-weight: 600;">${proposalDate}</div>
                    </div>
                </div>
            </div>
        `;

        const coverCanvas = await renderSection(coverHTML, 800);
        const coverImgData = coverCanvas.toDataURL('image/jpeg', 0.85);
        const coverHeight = (coverCanvas.height * pageWidth) / coverCanvas.width;
        pdf.addImage(coverImgData, 'JPEG', 0, 0, pageWidth, Math.min(coverHeight, pageHeight), undefined, 'FAST');

        // PAGE 2: EXECUTIVE SUMMARY
        addNewPage();
        pdf.setFontSize(20);
        pdf.setTextColor(brandColor);
        pdf.text('Executive Summary', margin, margin + 10);

        pdf.setFontSize(11);
        pdf.setTextColor(51, 51, 51);
        let yPos = margin + 25;

        if (data.executiveSummary) {
            const lines = pdf.splitTextToSize(data.executiveSummary, contentWidth);
            pdf.text(lines, margin, yPos);
            yPos += (lines.length * 7) + 15;
        }

        // Premium Summary Table
        pdf.setFontSize(16);
        pdf.setTextColor(brandColor);
        pdf.text('Premium Summary', margin, yPos);
        yPos += 12;

        // Draw table
        pdf.setFillColor(248, 249, 250);
        pdf.rect(margin, yPos, contentWidth, 10, 'F');
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        pdf.text('Coverage', margin + 3, yPos + 7);
        pdf.text('Current Premium', margin + 100, yPos + 7);
        pdf.text('Proposed Premium', margin + 145, yPos + 7);
        yPos += 10;

        pdf.setFont(undefined, 'normal');
        Object.keys(data.coverages).forEach(type => {
            const template = coverageTemplates[type];
            const coverage = data.coverages[type];
            const current = parseFloat(coverage.current_premium) || 0;
            const proposed = parseFloat(coverage.proposed_premium) || 0;

            pdf.text(template.title, margin + 3, yPos + 7);
            pdf.text('$' + current.toLocaleString('en-US', {minimumFractionDigits: 2}), margin + 100, yPos + 7);
            pdf.text('$' + proposed.toLocaleString('en-US', {minimumFractionDigits: 2}), margin + 145, yPos + 7);
            pdf.rect(margin, yPos, contentWidth, 10);
            yPos += 10;

            if (yPos > pageHeight - 30) {
                addNewPage();
                yPos = margin + 10;
            }
        });

        // Totals
        pdf.setFont(undefined, 'bold');
        pdf.setFillColor(brandColor);
        pdf.setTextColor(255, 255, 255);
        pdf.rect(margin, yPos, contentWidth, 10, 'F');
        pdf.text('TOTAL', margin + 3, yPos + 7);
        pdf.text('$' + totalCurrent.toLocaleString('en-US', {minimumFractionDigits: 2}), margin + 100, yPos + 7);
        pdf.text('$' + totalProposed.toLocaleString('en-US', {minimumFractionDigits: 2}), margin + 145, yPos + 7);
        yPos += 15;

        pdf.setTextColor(51, 51, 51);
        pdf.setFontSize(14);
        const savingsText = `Annual Savings: $${savings.toLocaleString('en-US', {minimumFractionDigits: 2})} (${savingsPercent}%)`;
        pdf.text(savingsText, margin, yPos + 7);

        // PAGE 3+: COVERAGE DETAILS
        Object.keys(data.coverages).forEach(type => {
            addNewPage();
            const template = coverageTemplates[type];
            const coverage = data.coverages[type];

            yPos = margin + 10;
            pdf.setFontSize(18);
            pdf.setTextColor(brandColor);
            pdf.text(template.title, margin, yPos);
            yPos += 15;

            pdf.setFontSize(10);
            pdf.setTextColor(51, 51, 51);

            template.fields.forEach(field => {
                const value = coverage[field.id];
                if (value) {
                    pdf.setFont(undefined, 'bold');
                    pdf.text(field.label + ':', margin, yPos);
                    pdf.setFont(undefined, 'normal');
                    const lines = pdf.splitTextToSize(value, contentWidth - 60);
                    pdf.text(lines, margin + 60, yPos);
                    yPos += (lines.length * 5) + 3;

                    if (yPos > pageHeight - 30) {
                        addNewPage();
                        yPos = margin + 10;
                    }
                }
            });
        });

        // FINAL PAGE: TEAM
        if (data.teamMembers && data.teamMembers.length > 0) {
            addNewPage();
            yPos = margin + 10;
            pdf.setFontSize(18);
            pdf.setTextColor(brandColor);
            pdf.text('Your Advisory Team', margin, yPos);
            yPos += 15;

            data.teamMembers.forEach(member => {
                pdf.setFontSize(12);
                pdf.setFont(undefined, 'bold');
                pdf.text(member.name, margin, yPos);
                yPos += 7;

                pdf.setFontSize(10);
                pdf.setFont(undefined, 'normal');
                if (member.title) {
                    pdf.text(member.title, margin, yPos);
                    yPos += 6;
                }
                if (member.phone) pdf.text(member.phone, margin, yPos);
                if (member.email) pdf.text(member.email, margin + 60, yPos);
                yPos += 12;
            });
        }

        // Save
        pdf.save(filename);
        showMessage('PDF generated successfully with perfect page breaks!', 'success');

    } catch (error) {
        console.error('Error generating PDF:', error);
        showMessage('Failed to generate PDF: ' + error.message, 'error');
    }
}
