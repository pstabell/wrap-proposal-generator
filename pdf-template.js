// Professional WRAP Proposal PDF Template Generator
// Creates multi-page proposals matching Christensen Group quality

function generatePDFTemplate(data) {
    const clientName = `${data.clientInfo.firstName} ${data.clientInfo.lastName}`;
    const proposalDate = new Date(data.proposalDate).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    // Calculate totals
    let totalCurrent = 0;
    let totalProposed = 0;
    const coverageList = [];

    Object.keys(data.coverages).forEach(type => {
        const coverage = data.coverages[type];
        const current = parseFloat(coverage.current_premium) || 0;
        const proposed = parseFloat(coverage.proposed_premium) || 0;
        totalCurrent += current;
        totalProposed += proposed;

        coverageList.push({
            type: type,
            title: coverageTemplates[type].title,
            current: current,
            proposed: proposed
        });
    });

    const savings = totalCurrent - totalProposed;
    const savingsPercent = totalCurrent > 0 ? ((savings / totalCurrent) * 100).toFixed(1) : 0;
    const brandColor = data.companyInfo.brandColor || '#003366';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', 'Calibri', Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #333;
            width: 100%;
            overflow-x: hidden;
            display: block;
        }

        /* Page breaks */
        .page-break { page-break-after: always; }

        /* Cover Page - Kathleen Wiesenbaugh Style */
        .cover-page {
            width: 100%;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: white;
            padding: 40px 60px 60px 60px;
            position: relative;
            box-sizing: border-box;
            page-break-after: always;
            break-after: page;
        }

        /* Screen-only: Add visual page separation */
        @media screen {
            .cover-page,
            .toc-page,
            .content-page {
                margin-bottom: 40px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                border: 1px solid #e0e0e0;
            }
        }
        .cover-logo-section {
            position: absolute;
            top: 40px;
            left: 60px;
        }
        .cover-logo {
            max-width: 250px;
            max-height: 80px;
        }
        .cover-company-name {
            font-size: 24pt;
            color: ${brandColor};
            font-weight: 700;
            letter-spacing: 1px;
        }
        .cover-images-container {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-top: 130px;
            flex-shrink: 0;
        }
        .cover-image {
            width: 100%;
            height: 240px;
            object-fit: cover;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        /* PDF-only: Reduce image height for proper rendering */
        @media print {
            .cover-image {
                height: 163px;
            }
        }
        .cover-title {
            font-size: 32pt;
            color: ${brandColor};
            font-weight: 700;
            text-align: center;
            margin: 30px 0 20px 0;
            letter-spacing: 2px;
            flex-shrink: 0;
        }
        .cover-details-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-top: auto;
            flex-shrink: 0;
        }
        .cover-detail-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border: 4px solid ${brandColor};
        }
        .cover-right-column {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        .cover-detail-label {
            font-size: 11pt;
            color: ${brandColor};
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: 1px;
        }
        .cover-detail-value {
            font-size: 18pt;
            color: #333;
            font-weight: 600;
        }
        .cover-detail-subvalue {
            font-size: 12pt;
            color: #666;
            margin-top: 6px;
        }

        /* Page Header (appears on all pages except cover) */
        .page-header {
            position: absolute;
            top: 20px;
            left: 40px;
            z-index: 100;
        }
        .page-header-logo {
            max-width: 150px;
            max-height: 50px;
        }
        .page-header-text {
            font-size: 14pt;
            color: ${brandColor};
            font-weight: 700;
            letter-spacing: 0.5px;
        }

        /* Table of Contents */
        .toc-page {
            width: 100%;
            padding: 80px 60px 60px 60px;
            min-height: 100vh;
            height: auto;
            position: relative;
            box-sizing: border-box;
            background: white;
            display: block;
            page-break-before: always;
            break-before: page;
            page-break-after: always;
            break-after: page;
        }
        .toc-page h1 {
            color: ${brandColor};
            font-size: 32pt;
            margin-bottom: 40px;
            border-bottom: 4px solid ${brandColor};
            padding-bottom: 15px;
        }
        .toc-item {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e0e0e0;
            font-size: 13pt;
        }
        .toc-item:hover {
            background: #f8f9fa;
        }
        .toc-section {
            margin-top: 30px;
        }
        .toc-section-title {
            font-weight: 700;
            color: ${brandColor};
            margin-top: 25px;
            margin-bottom: 10px;
            font-size: 14pt;
        }

        /* Standard Page Layout */
        .content-page {
            width: 100%;
            padding: 80px 60px 60px 60px;
            min-height: 100vh;
            position: relative;
            box-sizing: border-box;
            background: white;
            overflow: hidden;
            clear: both;
            page-break-after: always;
            break-after: page;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        .content-page h1 {
            color: ${brandColor};
            font-size: 28pt;
            margin-bottom: 30px;
            border-bottom: 4px solid ${brandColor};
            padding-bottom: 12px;
        }
        .content-page h2 {
            color: ${brandColor};
            font-size: 22pt;
            margin: 30px 0 20px 0;
            border-bottom: 2px solid ${brandColor};
            padding-bottom: 8px;
        }
        .content-page h3 {
            color: ${brandColor};
            font-size: 16pt;
            margin: 20px 0 12px 0;
        }
        .content-page p {
            margin-bottom: 15px;
            line-height: 1.8;
        }

        /* Team Member Section */
        .team-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 30px;
            margin: 30px 0;
        }
        .team-member {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 2px solid #e0e0e0;
        }
        .team-photo {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            object-fit: cover;
            margin: 0 auto 15px auto;
            display: block;
            border: 3px solid ${brandColor};
        }
        .team-photo-placeholder {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            margin: 0 auto 15px auto;
            background: ${brandColor};
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 48pt;
            font-weight: 300;
        }
        .team-name {
            font-size: 16pt;
            font-weight: 700;
            color: ${brandColor};
            margin-bottom: 5px;
        }
        .team-title {
            font-size: 12pt;
            color: #666;
            margin-bottom: 10px;
            font-style: italic;
        }
        .team-contact {
            font-size: 10pt;
            color: #333;
            line-height: 1.8;
        }

        /* Policy Information Box */
        .policy-info-box {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            border: 3px solid ${brandColor};
            border-radius: 10px;
            padding: 25px;
            margin: 25px 0;
        }
        .policy-info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        .policy-info-item {
            margin-bottom: 10px;
        }
        .policy-info-label {
            font-weight: 700;
            color: ${brandColor};
            font-size: 10pt;
            margin-bottom: 3px;
        }
        .policy-info-value {
            font-size: 12pt;
            color: #333;
        }
        .policy-premium {
            background: ${brandColor};
            color: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        .policy-premium-label {
            font-size: 10pt;
            margin-bottom: 5px;
            opacity: 0.9;
        }
        .policy-premium-value {
            font-size: 24pt;
            font-weight: 700;
        }

        /* Coverage Tables */
        .coverage-table {
            width: 100%;
            margin: 25px 0;
            border-collapse: collapse;
            font-size: 11pt;
        }
        .coverage-table th {
            background: ${brandColor};
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            border: 1px solid ${brandColor};
        }
        .coverage-table td {
            padding: 12px;
            border: 1px solid #ddd;
            vertical-align: top;
        }
        .coverage-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        .coverage-table tr:hover {
            background: #e9ecef;
        }

        /* Premium Summary Table */
        .premium-summary-table {
            width: 100%;
            margin: 30px 0;
            border-collapse: collapse;
            font-size: 12pt;
        }
        .premium-summary-table th {
            background: ${brandColor};
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
            border: 1px solid ${brandColor};
        }
        .premium-summary-table td {
            padding: 15px;
            border: 1px solid #ddd;
        }
        .premium-summary-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        .premium-summary-table .total-row {
            background: ${brandColor};
            color: white;
            font-weight: 700;
            font-size: 14pt;
        }
        .premium-summary-table .total-row td {
            border: 1px solid ${brandColor};
        }
        .savings-positive { color: #28a745; font-weight: 700; }
        .savings-negative { color: #dc3545; font-weight: 700; }

        /* Recommendations Box */
        .recommendations-box {
            background: #fff9e6;
            border: 2px solid #ffc107;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
        }
        .recommendations-box h3 {
            color: #856404;
            margin-bottom: 15px;
        }
        .recommendations-box ul {
            margin-left: 25px;
        }
        .recommendations-box li {
            margin-bottom: 10px;
            line-height: 1.8;
        }

        /* Footer */
        .page-footer {
            text-align: center;
            font-size: 9pt;
            color: #666;
            padding: 20px;
            border-top: 1px solid #ccc;
            margin-top: 40px;
        }

        @media print {
            .page-break { page-break-after: always; }
            .content-page { min-height: auto; }
        }
    </style>
</head>
<body>

    <!-- COVER PAGE -->
    <div class="cover-page">
        <!-- Company Logo/Name in Top Left -->
        <div class="cover-logo-section">
            ${data.companyInfo.logo ?
                `<img src="${data.companyInfo.logo}" alt="Company Logo" class="cover-logo">` :
                `<div class="cover-company-name">${data.companyInfo.name || 'ABC Insurance Agency'}</div>`
            }
        </div>

        <!-- Three Luxury Lifestyle Images -->
        <div class="cover-images-container">
            <img src="miami-mansion.jpg" alt="Luxury Waterfront Estate" class="cover-image">
            <img src="yacht.jpg" alt="Luxury Yacht" class="cover-image">
            <img src="g700-jet.jpg" alt="Gulfstream G700 Private Jet" class="cover-image">
        </div>

        <!-- Main Title -->
        <div class="cover-title">PRIVATE CLIENT INSURANCE PROPOSAL</div>

        <!-- Client and Producer Details -->
        <div class="cover-details-container">
            <div class="cover-detail-box">
                <div class="cover-detail-label">PREPARED FOR:</div>
                <div class="cover-detail-value">${clientName}</div>
            </div>
            <div class="cover-right-column">
                <div class="cover-detail-box">
                    <div class="cover-detail-label">PRESENTED BY:</div>
                    <div class="cover-detail-value">${data.teamMembers && data.teamMembers.length > 0 ? data.teamMembers[0].name : data.companyInfo.name || 'Your Insurance Agent'}</div>
                    ${data.teamMembers && data.teamMembers.length > 0 && data.teamMembers[0].title ?
                        `<div class="cover-detail-subvalue">${data.teamMembers[0].title}</div>` : ''
                    }
                </div>
                <div class="cover-detail-box">
                    <div class="cover-detail-label">DATE:</div>
                    <div class="cover-detail-value">${proposalDate}</div>
                </div>
            </div>
        </div>
    </div>

    ${generateCoveragePages(data, brandColor)}

    <!-- PREMIUM SUMMARY (Second to last page - just before Recommendations) -->
    <div class="content-page">
        <!-- Page Header -->
        <div class="page-header">
            ${data.companyInfo.logo ?
                `<img src="${data.companyInfo.logo}" alt="Company Logo" class="page-header-logo">` :
                `<div class="page-header-text">${data.companyInfo.name || 'ABC Insurance Agency'}</div>`
            }
        </div>

        <h1>Premium Summary</h1>

        <table class="premium-summary-table">
            <thead>
                <tr>
                    <th>Lines of Business</th>
                    <th style="text-align: right;">Expiring Premium</th>
                    <th style="text-align: right;">Renewal Premium</th>
                </tr>
            </thead>
            <tbody>
                ${coverageList.map(cov => `
                <tr>
                    <td>${cov.title}</td>
                    <td style="text-align: right;">${cov.current > 0 ? '$' + cov.current.toLocaleString('en-US', {minimumFractionDigits: 2}) : 'N/A'}</td>
                    <td style="text-align: right;">$${cov.proposed.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                </tr>
                `).join('')}
                <tr class="total-row">
                    <td><strong>Total Premium</strong></td>
                    <td style="text-align: right;"><strong>$${totalCurrent.toLocaleString('en-US', {minimumFractionDigits: 2})}</strong></td>
                    <td style="text-align: right;"><strong>$${totalProposed.toLocaleString('en-US', {minimumFractionDigits: 2})}</strong></td>
                </tr>
            </tbody>
        </table>

        <div style="background: ${brandColor}; color: white; padding: 25px; border-radius: 8px; margin-top: 40px;">
            <div style="font-size: 16pt; margin-bottom: 15px;"><strong>Annual ${savings >= 0 ? 'Savings' : 'Increase'}:</strong></div>
            <div style="font-size: 24pt; font-weight: bold;">
                $${Math.abs(savings).toLocaleString('en-US', {minimumFractionDigits: 2})} (${Math.abs(savingsPercent)}%)
            </div>
        </div>
    </div>

    <!-- RECOMMENDATIONS & DISCUSSION POINTS (Final Page) -->
    <div class="content-page">
        <!-- Page Header -->
        <div class="page-header">
            ${data.companyInfo.logo ?
                `<img src="${data.companyInfo.logo}" alt="Company Logo" class="page-header-logo">` :
                `<div class="page-header-text">${data.companyInfo.name || 'ABC Insurance Agency'}</div>`
            }
        </div>

        <h1>Recommendations & Discussion Points</h1>

        ${data.notes ? `
        <div class="recommendations-content">
            <p style="white-space: pre-wrap; line-height: 1.8; font-size: 11pt;">${data.notes}</p>
        </div>
        ` : `
        <div class="recommendations-content">
            <h2>Next Steps</h2>
            <p>We recommend scheduling a follow-up meeting to discuss:</p>
            <ul style="margin-left: 30px; margin-top: 15px; line-height: 2;">
                <li>Review of coverage details and any questions you may have</li>
                <li>Customization options to better fit your specific needs</li>
                <li>Timeline for implementation and policy effective dates</li>
                <li>Additional risk management strategies for your assets</li>
            </ul>

            <h2 style="margin-top: 30px;">Contact Your Advisory Team</h2>
            <p>Please don't hesitate to reach out to any member of your ${data.companyInfo.name || 'insurance'} team with questions or to move forward with this proposal.</p>
        </div>
        `}

        ${data.executiveSummary ? `
        <div class="policy-info-box" style="margin-top: 30px;">
            <h3 style="color: ${brandColor};">Executive Summary</h3>
            <p style="margin-top: 10px; white-space: pre-wrap;">${data.executiveSummary}</p>
        </div>
        ` : ''}

        <div class="page-footer">
            <p>© ${new Date().getFullYear()} ${data.companyInfo.name || 'Insurance Agency'}. All rights reserved.</p>
            <p>This proposal is for informational purposes only and does not constitute a binder or contract of insurance.</p>
        </div>
    </div>

</body>
</html>
    `;
}

// Generate individual coverage pages
function generateCoveragePages(data, brandColor) {
    let html = '';

    Object.keys(data.coverages).forEach(coverageType => {
        const coverage = data.coverages[coverageType];
        const template = coverageTemplates[coverageType];

        html += `
    <!-- ${template.title} -->
    <div class="content-page">
        <!-- Page Header -->
        <div class="page-header">
            ${data.companyInfo.logo ?
                `<img src="${data.companyInfo.logo}" alt="Company Logo" class="page-header-logo">` :
                `<div class="page-header-text">${data.companyInfo.name || 'ABC Insurance Agency'}</div>`
            }
        </div>

        <h1>${template.title}</h1>

        <!-- Policy Information Box -->
        <div class="policy-info-box">
            <div style="display: grid; grid-template-columns: 3fr 1fr; gap: 20px;">
                <div class="policy-info-grid">
                    ${coverage.policy_number ? `
                    <div class="policy-info-item">
                        <div class="policy-info-label">POLICY NUMBER</div>
                        <div class="policy-info-value">${coverage.policy_number}</div>
                    </div>
                    ` : ''}
                    <div class="policy-info-item">
                        <div class="policy-info-label">CARRIER</div>
                        <div class="policy-info-value">${coverage.proposed_carrier || 'N/A'}</div>
                    </div>
                    ${coverage.policy_term ? `
                    <div class="policy-info-item">
                        <div class="policy-info-label">POLICY TERM</div>
                        <div class="policy-info-value">${coverage.policy_term}</div>
                    </div>
                    ` : ''}
                </div>
                <div class="policy-premium">
                    <div class="policy-premium-label">PREMIUM</div>
                    <div class="policy-premium-value">$${parseFloat(coverage.proposed_premium || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                </div>
            </div>
        </div>

        <h2>Coverages</h2>
        ${generateCoverageDetails(coverageType, coverage, brandColor)}

        ${coverage.endorsements ? `
        <h2>Coverage Endorsements</h2>
        <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid ${brandColor}; border-radius: 4px;">
            ${coverage.endorsements.replace(/\n/g, '<br>')}
        </div>
        ` : ''}
    </div>
        `;
    });

    return html;
}

// Generate specific coverage details based on type
function generateCoverageDetails(coverageType, coverage, brandColor) {
    let html = '';

    // Special handling for different coverage types
    if (coverageType === 'auto' && coverage.vehicles) {
        // Auto - Vehicle table
        const vehicles = coverage.vehicles.split('\n').filter(v => v.trim());
        html += `
        <h3>Vehicles</h3>
        <table class="coverage-table">
            <thead>
                <tr>
                    <th>Vehicle</th>
                    <th>VIN</th>
                    <th>Agreed Amount</th>
                </tr>
            </thead>
            <tbody>
                ${vehicles.map(vehicle => {
                    const parts = vehicle.split('|').map(p => p.trim());
                    return `
                    <tr>
                        <td>${parts[0] || ''}</td>
                        <td>${parts[1] ? parts[1].replace('VIN:', '').trim() : ''}</td>
                        <td>${parts[2] ? parts[2].replace('Agreed Value:', '').trim() : ''}</td>
                    </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
        `;
    }

    if (coverageType === 'watercraft' && coverage.vessels) {
        // Watercraft - Vessel table
        const vessels = coverage.vessels.split('\n').filter(v => v.trim());
        html += `
        <h3>Watercraft</h3>
        <table class="coverage-table">
            <thead>
                <tr>
                    <th>Watercraft</th>
                    <th>Hull ID #</th>
                    <th>Hull Value</th>
                </tr>
            </thead>
            <tbody>
                ${vessels.map(vessel => {
                    const parts = vessel.split('|').map(p => p.trim());
                    return `
                    <tr>
                        <td>${parts[0] || ''}</td>
                        <td>${parts[1] ? parts[1].replace('Hull ID:', '').trim() : ''}</td>
                        <td>${parts[2] ? parts[2].replace('Hull Value:', '').trim() : ''}</td>
                    </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
        `;
    }

    if (coverageType === 'jewelry' && coverage.scheduled_items) {
        // Jewelry - Scheduled property table
        const items = coverage.scheduled_items.split('\n').filter(i => i.trim());
        html += `
        <h3>Scheduled Property</h3>
        <table class="coverage-table">
            <thead>
                <tr>
                    <th style="width: 70%;">Description</th>
                    <th style="width: 30%;">Value</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => {
                    const match = item.match(/(.*?)(?:Value:|-)?\s*\$?([\d,]+)$/);
                    return `
                    <tr>
                        <td>${match ? match[1].trim() : item}</td>
                        <td>${match ? '$' + match[2] : ''}</td>
                    </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
        `;
    }

    // Standard coverage limits table
    html += `
    <table class="coverage-table" style="margin-top: 20px;">
        <thead>
            <tr>
                <th>Description</th>
                <th>Limits & Deductibles</th>
            </tr>
        </thead>
        <tbody>
    `;

    // Add all coverage fields dynamically
    const template = coverageTemplates[coverageType];
    template.fields.forEach(field => {
        const value = coverage[field.id];

        // Skip certain fields that were already displayed or are administrative
        const skipFields = ['policy_number', 'policy_term', 'current_carrier', 'current_premium',
                           'proposed_carrier', 'proposed_premium', 'property_address', 'city_state_zip',
                           'endorsements', 'vehicles', 'vessels', 'scheduled_items', 'drivers', 'operators'];

        if (value && !skipFields.includes(field.id) && field.type !== 'textarea') {
            html += `
            <tr>
                <td>${field.label}</td>
                <td><strong>${value}</strong></td>
            </tr>
            `;
        }
    });

    html += `
        </tbody>
    </table>
    `;

    // Add location/property address if present
    if (coverage.property_address) {
        html = `
        <div style="background: #e3f2fd; padding: 15px; border-left: 4px solid ${brandColor}; margin-bottom: 20px; border-radius: 4px;">
            <strong style="color: ${brandColor};">Location:</strong> ${coverage.property_address}${coverage.city_state_zip ? ', ' + coverage.city_state_zip : ''}
        </div>
        ` + html;
    }

    // Add drivers/operators list if present
    if (coverage.drivers) {
        html += `
        <h3>Driver List</h3>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 4px;">
            ${coverage.drivers.replace(/\n/g, '<br>')}
        </div>
        `;
    }

    if (coverage.operators) {
        html += `
        <h3>Operator List</h3>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 4px;">
            ${coverage.operators.replace(/\n/g, '<br>')}
        </div>
        `;
    }

    // Add additional interests/lien holders
    if (coverage.additional_interests) {
        html += `
        <h3>Additional Interests</h3>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 4px;">
            ${coverage.additional_interests.replace(/\n/g, '<br>')}
        </div>
        `;
    }

    // Add underlying requirements for umbrella
    if (coverage.underlying_requirements) {
        html += `
        <h3>Underlying Policy Requirements</h3>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 4px;">
            ${coverage.underlying_requirements.replace(/\n/g, '<br>')}
        </div>
        `;
    }

    // Add coverage includes for cyber
    if (coverage.coverage_includes) {
        html += `
        <h3>Coverage Includes</h3>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 4px;">
            ${coverage.coverage_includes.replace(/\n/g, '<br>')}
        </div>
        `;
    }

    // Add items covered for fine art
    if (coverage.items_covered) {
        html += `
        <h3>Artwork & Collectibles</h3>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 4px;">
            ${coverage.items_covered.replace(/\n/g, '<br>')}
        </div>
        `;
    }

    // Add coverage details for "other" coverage
    if (coverage.coverage_details) {
        html += `
        <h3>Coverage Details</h3>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 4px;">
            ${coverage.coverage_details.replace(/\n/g, '<br>')}
        </div>
        `;
    }

    // Add special features/highlights
    if (coverage.special_features) {
        html += `
        <h3>Additional Features</h3>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 4px;">
            ${coverage.special_features.replace(/\n/g, '<br>')}
        </div>
        `;
    }

    return html;
}

// Helper function to adjust color brightness
function adjustColor(color, percent) {
    const num = parseInt(color.replace("#",""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 +
        (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255))
        .toString(16).slice(1);
}
