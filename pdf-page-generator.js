// Page-by-page PDF generator using beautiful template with controlled breaks
async function generatePDFPageByPage(data, filename) {
    const { jsPDF } = window.jspdf;

    try {
        showMessage('Generating professional PDF... This may take a moment.', 'success');

        // Generate the beautiful HTML template
        const fullHTML = generateProposalHTML(data);

        // Create container with the beautiful template
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.width = '800px';
        tempContainer.className = 'pdf-rendering';
        tempContainer.innerHTML = fullHTML;
        document.body.appendChild(tempContainer);

        // Apply PDF-specific image sizing
        const styleTag = document.createElement('style');
        styleTag.textContent = '.pdf-rendering .cover-image { height: 163px !important; }';
        document.head.appendChild(styleTag);

        // Get all pages from the template (they have page-break-after styling)
        const pages = tempContainer.querySelectorAll('.cover-page, .toc-page, .content-page');

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        });

        const pageWidth = 210;
        const pageHeight = 297;

        // Track actual page count for numbering (starts at 0 for cover, increments after)
        let actualPageNum = 0;
        let totalNonCoverPages = 0;

        // First pass: count total pages including splits
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const canvas = await html2canvas(page, {
                scale: 1.2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                allowTaint: true,
                imageTimeout: 0
            });
            const imgHeight = (canvas.height * pageWidth) / canvas.width;

            if (i === 0) {
                // Cover page doesn't count
                continue;
            }

            // Calculate how many PDF pages this content needs
            const pagesNeeded = Math.ceil(imgHeight / pageHeight);
            totalNonCoverPages += pagesNeeded;
        }

        // Second pass: render each page separately, splitting if needed
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];

            // Render this specific page
            const canvas = await html2canvas(page, {
                scale: 1.2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                allowTaint: true,
                imageTimeout: 0
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.85);
            const imgHeight = (canvas.height * pageWidth) / canvas.width;

            // Calculate how many PDF pages this content needs
            const pagesNeeded = Math.ceil(imgHeight / pageHeight);

            // Split content across multiple pages if needed
            for (let pageNum = 0; pageNum < pagesNeeded; pageNum++) {
                if (i > 0 || pageNum > 0) {
                    pdf.addPage();
                }

                const yOffset = -(pageNum * pageHeight);

                // Add the image, offset for multi-page content
                pdf.addImage(imgData, 'JPEG', 0, yOffset, pageWidth, imgHeight, undefined, 'FAST');

                // Add page number (skip cover page)
                if (i > 0) {
                    actualPageNum++;
                    pdf.setFontSize(9);
                    pdf.setTextColor(128, 128, 128);
                    pdf.text(`Page ${actualPageNum} of ${totalNonCoverPages}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
                }
            }
        }

        // Clean up
        document.body.removeChild(tempContainer);
        document.head.removeChild(styleTag);

        // Save
        pdf.save(filename);
        showMessage(`PDF generated successfully! ${totalNonCoverPages + 1} pages created with perfect breaks.`, 'success');

    } catch (error) {
        console.error('Error generating PDF:', error);
        showMessage('Failed to generate PDF: ' + error.message, 'error');
        // Clean up on error
        const tempContainer = document.querySelector('.pdf-rendering');
        if (tempContainer) tempContainer.remove();
        const styleTag = document.querySelector('style');
        if (styleTag && styleTag.textContent.includes('pdf-rendering')) styleTag.remove();
    }
}
