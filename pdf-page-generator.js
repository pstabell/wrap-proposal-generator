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

        // Render each page separately for perfect breaks
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

            if (i > 0) {
                pdf.addPage();
            }

            // Add image to fit page
            pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, Math.min(imgHeight, pageHeight), undefined, 'FAST');
        }

        // Clean up
        document.body.removeChild(tempContainer);
        document.head.removeChild(styleTag);

        // Save
        pdf.save(filename);
        showMessage('PDF generated successfully with perfect page breaks!', 'success');

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
