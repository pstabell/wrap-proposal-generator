import { ProposalData, CoverageType } from '@/types';
import { coverageTemplates } from './coverage-templates';

const PRIMARY_COLOR = '#003B5C';
const ACCENT_COLOR = '#D4AF37';

export function generateProposalHTML(data: ProposalData): string {
  const { clientInfo, agentInfo, proposalDate, coverages, executiveSummary, notes, agencyLogo, agencyName, agentPhoto } = data;

  // Calculate totals
  let totalCurrentPremium = 0;
  let totalProposedPremium = 0;

  Object.values(coverages).forEach(coverage => {
    const current = parseFloat(coverage.current_premium?.toString() || '0');
    const proposed = parseFloat(coverage.proposed_premium?.toString() || '0');
    if (!isNaN(current)) totalCurrentPremium += current;
    if (!isNaN(proposed)) totalProposedPremium += proposed;
  });

  const savingsAmount = totalCurrentPremium - totalProposedPremium;
  const savingsPercentage = totalCurrentPremium > 0
    ? ((savingsAmount / totalCurrentPremium) * 100).toFixed(2)
    : '0.00';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
    }

    .page {
      width: 8.5in;
      min-height: 11in;
      padding: 0.75in;
      background: white;
      page-break-after: always;
      position: relative;
    }

    .page:last-child {
      page-break-after: auto;
    }

    .cover-page {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #004466 100%);
      color: white;
    }

    .cover-logo {
      max-width: 250px;
      max-height: 100px;
      margin-bottom: 30px;
      object-fit: contain;
    }

    .cover-title {
      font-size: 48px;
      font-weight: bold;
      margin-bottom: 20px;
      letter-spacing: 2px;
    }

    .cover-subtitle {
      font-size: 24px;
      margin-bottom: 60px;
      color: ${ACCENT_COLOR};
    }

    .cover-client-info {
      background: rgba(255, 255, 255, 0.1);
      padding: 40px;
      border-radius: 10px;
      margin: 40px 0;
      backdrop-filter: blur(10px);
    }

    .cover-client-name {
      font-size: 36px;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .cover-client-address {
      font-size: 18px;
      line-height: 1.8;
    }

    .cover-date {
      font-size: 18px;
      margin-top: 60px;
      color: ${ACCENT_COLOR};
    }

    .cover-agent {
      position: absolute;
      bottom: 50px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 16px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .agent-photo {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid ${ACCENT_COLOR};
      margin-bottom: 10px;
    }

    .header {
      border-bottom: 3px solid ${PRIMARY_COLOR};
      padding-bottom: 20px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-content {
      flex: 1;
    }

    .header-logo {
      max-width: 150px;
      max-height: 60px;
      object-fit: contain;
    }

    .header h1 {
      color: ${PRIMARY_COLOR};
      font-size: 32px;
      margin-bottom: 5px;
    }

    .header .date {
      color: #666;
      font-size: 14px;
    }

    .header .agency-name {
      color: ${ACCENT_COLOR};
      font-size: 14px;
      font-weight: bold;
      margin-top: 5px;
    }

    .section {
      margin-bottom: 40px;
    }

    .section-title {
      color: ${PRIMARY_COLOR};
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid ${ACCENT_COLOR};
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }

    .info-item {
      padding: 10px;
      background: #f9f9f9;
      border-left: 3px solid ${ACCENT_COLOR};
    }

    .info-label {
      font-weight: bold;
      color: #666;
      font-size: 12px;
      text-transform: uppercase;
      margin-bottom: 5px;
    }

    .info-value {
      color: #333;
      font-size: 16px;
    }

    .summary-box {
      background: linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #004466 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 30px;
    }

    .summary-box h3 {
      font-size: 20px;
      margin-bottom: 15px;
      color: ${ACCENT_COLOR};
    }

    .summary-box p {
      line-height: 1.8;
      font-size: 15px;
    }

    .totals-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .totals-table th {
      background: ${PRIMARY_COLOR};
      color: white;
      padding: 15px;
      text-align: left;
      font-size: 14px;
      text-transform: uppercase;
    }

    .totals-table td {
      padding: 15px;
      border-bottom: 1px solid #eee;
      font-size: 16px;
    }

    .totals-table .total-row {
      background: #f9f9f9;
      font-weight: bold;
      font-size: 18px;
    }

    .totals-table .savings-row {
      background: #e8f5e9;
      color: #2e7d32;
      font-weight: bold;
      font-size: 18px;
    }

    .coverage-detail {
      background: white;
      border: 2px solid ${PRIMARY_COLOR};
      border-radius: 8px;
      padding: 25px;
      margin-bottom: 30px;
    }

    .coverage-title {
      color: ${PRIMARY_COLOR};
      font-size: 22px;
      font-weight: bold;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid ${ACCENT_COLOR};
    }

    .coverage-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }

    .coverage-item {
      padding: 12px;
      background: #f9f9f9;
      border-radius: 4px;
    }

    .coverage-item.full-width {
      grid-column: 1 / -1;
    }

    .coverage-label {
      font-weight: bold;
      color: #666;
      font-size: 13px;
      margin-bottom: 5px;
    }

    .coverage-value {
      color: #333;
      font-size: 15px;
      white-space: pre-wrap;
    }

    .premium-highlight {
      background: ${PRIMARY_COLOR};
      color: white;
      padding: 15px;
      border-radius: 4px;
      text-align: center;
      margin-top: 15px;
    }

    .premium-highlight .label {
      font-size: 12px;
      text-transform: uppercase;
      color: ${ACCENT_COLOR};
      margin-bottom: 5px;
    }

    .premium-highlight .value {
      font-size: 24px;
      font-weight: bold;
    }

    .notes-section {
      background: #fff9e6;
      border-left: 4px solid ${ACCENT_COLOR};
      padding: 20px;
      margin-top: 30px;
      border-radius: 4px;
    }

    .notes-section h4 {
      color: ${PRIMARY_COLOR};
      margin-bottom: 10px;
      font-size: 18px;
    }

    .footer {
      position: absolute;
      bottom: 30px;
      left: 0.75in;
      right: 0.75in;
      text-align: center;
      color: #999;
      font-size: 11px;
      padding-top: 15px;
      border-top: 1px solid #ddd;
    }

    @media print {
      .page {
        margin: 0;
        page-break-after: always;
      }
      .page:last-child {
        page-break-after: auto;
      }
    }
  </style>
</head>
<body>

  <!-- Cover Page -->
  <div class="page cover-page">
    ${agencyLogo ? `<img src="${agencyLogo}" alt="Agency Logo" class="cover-logo" />` : ''}

    <div class="cover-title">WRAP PROPOSAL</div>
    <div class="cover-subtitle">Wealth Risk Analysis & Protection</div>

    <div class="cover-client-info">
      <div class="cover-client-name">
        ${clientInfo.firstName} ${clientInfo.lastName}
      </div>
      <div class="cover-client-address">
        ${clientInfo.address}<br>
        ${clientInfo.city}, ${clientInfo.state} ${clientInfo.zip}
        ${clientInfo.email ? `<br>${clientInfo.email}` : ''}
        ${clientInfo.phone ? `<br>${clientInfo.phone}` : ''}
      </div>
    </div>

    <div class="cover-date">
      Proposal Date: ${formatDate(proposalDate)}
    </div>

    <div class="cover-agent">
      ${agentPhoto ? `<img src="${agentPhoto}" alt="Agent Photo" class="agent-photo" />` : ''}
      <div>
        Prepared by: ${agentInfo.name}<br>
        ${agentInfo.phone ? `${agentInfo.phone}` : ''}
        ${agentInfo.email ? ` | ${agentInfo.email}` : ''}
        ${agencyName ? `<br>${agencyName}` : ''}
      </div>
    </div>
  </div>

  <!-- Executive Summary Page -->
  <div class="page">
    <div class="header">
      <div class="header-content">
        <h1>Executive Summary</h1>
        <div class="date">${formatDate(proposalDate)}</div>
        ${agencyName ? `<div class="agency-name">${agencyName}</div>` : ''}
      </div>
      ${agencyLogo ? `<img src="${agencyLogo}" alt="Agency Logo" class="header-logo" />` : ''}
    </div>

    ${executiveSummary ? `
      <div class="summary-box">
        <h3>Overview</h3>
        <p>${executiveSummary.replace(/\n/g, '<br>')}</p>
      </div>
    ` : ''}

    <div class="section">
      <h2 class="section-title">Coverage Summary</h2>
      <table class="totals-table">
        <thead>
          <tr>
            <th>Coverage Type</th>
            <th>Current Premium</th>
            <th>Proposed Premium</th>
            <th>Difference</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(coverages).map(([type, coverage]) => {
            const current = parseFloat(coverage.current_premium?.toString() || '0');
            const proposed = parseFloat(coverage.proposed_premium?.toString() || '0');
            const diff = current - proposed;
            const coverageType = type as CoverageType;
            const template = coverageTemplates[coverageType];

            return `
              <tr>
                <td>${template.title.replace(/[^\w\s]/g, '')}</td>
                <td>$${current.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>$${proposed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style="color: ${diff >= 0 ? '#2e7d32' : '#c62828'}">
                  ${diff >= 0 ? '-' : '+'}$${Math.abs(diff).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            `;
          }).join('')}
          <tr class="total-row">
            <td>TOTAL ANNUAL PREMIUM</td>
            <td>$${totalCurrentPremium.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td>$${totalProposedPremium.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td style="color: ${savingsAmount >= 0 ? '#2e7d32' : '#c62828'}">
              ${savingsAmount >= 0 ? '-' : '+'}$${Math.abs(savingsAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
          </tr>
          ${savingsAmount !== 0 ? `
            <tr class="savings-row">
              <td colspan="4" style="text-align: center;">
                ${savingsAmount > 0 ? 'TOTAL ANNUAL SAVINGS' : 'TOTAL ANNUAL INCREASE'}:
                $${Math.abs(savingsAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                (${Math.abs(parseFloat(savingsPercentage))}%)
              </td>
            </tr>
          ` : ''}
        </tbody>
      </table>
    </div>

    ${notes ? `
      <div class="notes-section">
        <h4>Additional Notes</h4>
        <p>${notes.replace(/\n/g, '<br>')}</p>
      </div>
    ` : ''}

    <div class="footer">
      ${agencyName || 'Metro Point Technology'} | WRAP Proposal | Page 2
    </div>
  </div>

  <!-- Coverage Detail Pages -->
  ${Object.entries(coverages).map(([type, coverage]) => {
    const coverageType = type as CoverageType;
    const template = coverageTemplates[coverageType];

    return `
      <div class="page">
        <div class="header">
          <div class="header-content">
            <h1>${template.title.replace(/[^\w\s]/g, '')}</h1>
            <div class="date">${formatDate(proposalDate)}</div>
            ${agencyName ? `<div class="agency-name">${agencyName}</div>` : ''}
          </div>
          ${agencyLogo ? `<img src="${agencyLogo}" alt="Agency Logo" class="header-logo" />` : ''}
        </div>

        <div class="coverage-detail">
          <div class="coverage-title">Coverage Details</div>

          <div class="coverage-grid">
            ${template.fields.map(field => {
              const value = coverage[field.id];
              if (!value) return '';

              const isTextArea = field.type === 'textarea';

              return `
                <div class="coverage-item ${isTextArea ? 'full-width' : ''}">
                  <div class="coverage-label">${field.label}</div>
                  <div class="coverage-value">${value}</div>
                </div>
              `;
            }).join('')}
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 20px;">
            ${coverage.current_premium ? `
              <div class="premium-highlight" style="background: #666;">
                <div class="label">Current/Expiring Premium</div>
                <div class="value">$${parseFloat(coverage.current_premium.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                ${coverage.current_carrier ? `<div style="font-size: 14px; margin-top: 5px;">${coverage.current_carrier}</div>` : ''}
              </div>
            ` : ''}

            <div class="premium-highlight">
              <div class="label">Proposed/Renewal Premium</div>
              <div class="value">$${parseFloat(coverage.proposed_premium.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div style="font-size: 14px; margin-top: 5px;">${coverage.proposed_carrier}</div>
            </div>
          </div>
        </div>

        <div class="footer">
          ${agencyName || 'Metro Point Technology'} | ${template.title.replace(/[^\w\s]/g, '')} | ${clientInfo.lastName}
        </div>
      </div>
    `;
  }).join('')}

</body>
</html>
  `.trim();
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
