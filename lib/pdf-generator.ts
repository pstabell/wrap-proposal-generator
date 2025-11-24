import { ProposalData, CoverageType } from '@/types';
import { coverageTemplates } from './coverage-templates';

// Metro Point Insurance branding colors
const PRIMARY_COLOR = '#003B5C';
const ACCENT_COLOR = '#D4AF37';

// Coverage type icons mapping
const COVERAGE_ICONS: Record<CoverageType, string> = {
  homeowners: '🏠',
  condo: '🏢',
  wind: '💨',
  auto: '🚗',
  umbrella: '☂️',
  watercraft: '⛵',
  jewelry: '💎',
  cyber: '🔒',
  fineart: '🎨',
  other: '📄'
};

export function generateProposalHTML(data: ProposalData, baseUrl: string = ''): string {
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

  // Get coverage entries as array for table of contents
  const coverageEntries = Object.entries(coverages) as [CoverageType, typeof coverages[CoverageType]][];

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
      min-height: 10in;
      max-height: 10.5in;
      padding: 0.5in 0.5in 0.6in 0.5in;
      background: white;
      page-break-after: always;
      page-break-inside: avoid;
      position: relative;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }

    .page:last-child {
      page-break-after: auto;
    }

    .cover-page {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      text-align: center;
      background: white !important;
      color: ${PRIMARY_COLOR};
      padding-top: 0.5in;
      padding-bottom: 0.5in;
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
      padding-bottom: 15px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
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
      margin-bottom: 20px;
    }

    .section-title {
      color: ${PRIMARY_COLOR};
      font-size: 22px;
      font-weight: bold;
      margin-bottom: 12px;
      padding-bottom: 8px;
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
      margin-bottom: 20px;
      page-break-inside: avoid;
      break-inside: avoid;
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
      margin-top: auto;
      padding-top: 20px;
      text-align: center;
      color: #999;
      font-size: 10px;
      border-top: 1px solid #ddd;
      flex-shrink: 0;
    }

    .page-content {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
    }

    /* Table of Contents Styles */
    .toc-section {
      margin-bottom: 25px;
    }

    .toc-title {
      color: ${PRIMARY_COLOR};
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 30px;
      padding-bottom: 15px;
      border-bottom: 3px solid ${PRIMARY_COLOR};
    }

    .toc-list {
      list-style: none;
      margin: 20px 0;
    }

    .toc-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 15px;
      border-bottom: 1px solid #eee;
      font-size: 16px;
      align-items: center;
    }

    .toc-item:hover {
      background: #f9f9f9;
    }

    .toc-section-header {
      color: ${PRIMARY_COLOR};
      font-weight: bold;
      font-size: 18px;
      margin: 25px 0 15px 0;
      padding-left: 10px;
      border-left: 4px solid ${ACCENT_COLOR};
    }

    .toc-icon {
      margin-right: 10px;
      font-size: 20px;
    }

    .toc-page-num {
      color: ${ACCENT_COLOR};
      font-weight: bold;
      min-width: 30px;
      text-align: right;
    }

    /* Welcome & Disclaimers Styles */
    .disclaimer-box {
      background: #f9f9f9;
      border-left: 4px solid ${PRIMARY_COLOR};
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }

    .disclaimer-box h3 {
      color: ${PRIMARY_COLOR};
      font-size: 18px;
      margin-bottom: 10px;
    }

    .disclaimer-box p {
      line-height: 1.6;
      font-size: 13px;
      margin-bottom: 8px;
    }

    /* About Agency Styles */
    .about-section {
      margin: 20px 0;
    }

    .about-section h3 {
      color: ${PRIMARY_COLOR};
      font-size: 20px;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid ${ACCENT_COLOR};
    }

    .about-section p, .about-section ul {
      line-height: 1.6;
      font-size: 14px;
      margin-bottom: 12px;
    }

    .about-section ul {
      list-style: none;
      padding-left: 0;
    }

    .about-section li {
      padding: 8px 0;
      padding-left: 25px;
      position: relative;
    }

    .about-section li:before {
      content: "•";
      color: ${ACCENT_COLOR};
      font-weight: bold;
      font-size: 20px;
      position: absolute;
      left: 0;
      top: 5px;
    }

    .contact-box {
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      border: 2px solid ${PRIMARY_COLOR};
      border-radius: 8px;
      padding: 25px;
      margin-top: 30px;
    }

    .contact-box h3 {
      color: ${PRIMARY_COLOR};
      font-size: 20px;
      margin-bottom: 15px;
    }

    .contact-box p {
      margin: 8px 0;
      font-size: 14px;
      line-height: 1.6;
    }

    .contact-box strong {
      color: ${PRIMARY_COLOR};
      display: inline-block;
      min-width: 80px;
    }

    /* Team Page Styles */
    .team-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 30px;
      margin: 30px 0;
    }

    .team-member {
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 25px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .team-photo {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid ${PRIMARY_COLOR};
      margin: 0 auto 15px;
      display: block;
    }

    .team-name {
      color: ${PRIMARY_COLOR};
      font-size: 22px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .team-title {
      color: #666;
      font-size: 15px;
      font-style: italic;
      margin-bottom: 15px;
    }

    .team-contact {
      font-size: 13px;
      color: #555;
      line-height: 1.6;
    }

    /* Premium Summary Table Styles */
    .premium-summary-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .premium-summary-table thead th {
      background: ${PRIMARY_COLOR};
      color: white;
      padding: 15px;
      text-align: left;
      font-size: 14px;
      font-weight: bold;
      border-right: 1px solid rgba(255,255,255,0.1);
    }

    .premium-summary-table tbody td {
      padding: 15px;
      border: 1px solid #ddd;
      font-size: 15px;
    }

    .premium-summary-table .icon-cell {
      text-align: center;
      font-size: 24px;
      width: 60px;
    }

    .premium-summary-table .totals-row {
      background: #f9f9f9;
      font-weight: bold;
      border-top: 3px solid ${PRIMARY_COLOR};
    }

    .summary-highlight-box {
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      border: 3px solid ${PRIMARY_COLOR};
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0 10px 0;
      text-align: center;
    }

    .summary-highlight-box .summary-label {
      font-size: 16px;
      color: #666;
      margin-bottom: 10px;
    }

    .summary-highlight-box .summary-value {
      font-size: 32px;
      font-weight: bold;
      color: ${PRIMARY_COLOR};
      margin: 5px 0;
    }

    .summary-highlight-box .summary-savings {
      font-size: 36px;
      font-weight: bold;
      color: #2e7d32;
      margin: 10px 0;
    }

    .summary-highlight-box .summary-percentage {
      font-size: 24px;
      color: #2e7d32;
    }

    /* Recommendations Styles */
    .recommendation-item {
      background: white;
      border-left: 4px solid ${ACCENT_COLOR};
      padding: 15px 20px;
      margin: 15px 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      line-height: 1.8;
      font-size: 14px;
    }

    .executive-summary-box {
      background: ${PRIMARY_COLOR};
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin: 30px 0;
    }

    .executive-summary-box h3 {
      color: ${ACCENT_COLOR};
      font-size: 22px;
      margin-bottom: 15px;
    }

    .executive-summary-box p {
      line-height: 1.8;
      font-size: 15px;
      margin-bottom: 12px;
    }

    .executive-summary-box ul {
      list-style: none;
      padding-left: 0;
      margin: 15px 0;
    }

    .executive-summary-box li {
      padding: 8px 0;
      padding-left: 25px;
      position: relative;
    }

    .executive-summary-box li:before {
      content: "-";
      color: ${ACCENT_COLOR};
      font-weight: bold;
      position: absolute;
      left: 0;
    }

    /* Cover Page Images */
    .cover-images {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin: 20px 0;
      flex-wrap: wrap;
    }

    .cover-image-item {
      width: 180px;
      height: 120px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      flex-shrink: 0;
    }

    .cover-image-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .cover-prepared-for {
      background: #f9f9f9;
      padding: 20px 30px;
      border: 2px solid ${PRIMARY_COLOR};
      border-radius: 10px;
      margin: 15px;
      display: inline-block;
    }

    .cover-prepared-label {
      font-size: 12px;
      color: ${ACCENT_COLOR};
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }

    .cover-prepared-name {
      font-size: 28px;
      font-weight: bold;
      color: ${PRIMARY_COLOR};
    }

    .cover-presented-box {
      background: #f9f9f9;
      padding: 15px 25px;
      border: 2px solid ${PRIMARY_COLOR};
      border-radius: 10px;
      margin: 10px 20px;
      text-align: left;
    }

    .cover-title {
      font-size: 36px;
      font-weight: bold;
      margin: 20px 0;
      letter-spacing: 1px;
      color: ${PRIMARY_COLOR};
    }

    /* Coverage Details Table Styles */
    .coverage-details-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }

    .coverage-details-table th {
      padding: 12px;
      text-align: left;
      font-size: 14px;
      border: 1px solid #ddd;
      background: ${PRIMARY_COLOR};
      color: white;
    }

    .coverage-details-table td {
      padding: 12px;
      border: 1px solid #ddd;
    }

    .coverage-details-table .description-cell {
      font-weight: bold;
      background: #f9f9f9;
      width: 40%;
    }

    .coverage-details-table .value-cell {
      white-space: pre-wrap;
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

  <!-- Page 1: Cover Page -->
  <div class="page" style="background: white !important; background-color: white !important; background-image: none !important; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 0.5in; height: 10.5in; box-sizing: border-box;">
    ${agencyLogo ? `<img src="${agencyLogo}" alt="Agency Logo" style="max-width: 200px; max-height: 80px; margin-bottom: 15px; object-fit: contain;" />` : ''}

    <!-- Luxury lifestyle images -->
    <div style="display: flex; justify-content: center; gap: 12px; margin: 15px 0; flex-wrap: wrap;">
      <div style="width: 160px; height: 100px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.2); flex-shrink: 0;">
        <img src="${baseUrl}/miami-mansion.jpg" alt="Luxury Estate" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
      <div style="width: 160px; height: 100px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.2); flex-shrink: 0;">
        <img src="${baseUrl}/yacht.jpg" alt="Luxury Yacht" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
      <div style="width: 160px; height: 100px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.2); flex-shrink: 0;">
        <img src="${baseUrl}/g700-jet.jpg" alt="G700 Private Jet" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
    </div>

    <div style="font-size: 32px; font-weight: bold; margin: 15px 0; letter-spacing: 1px; color: ${PRIMARY_COLOR};">PRIVATE CLIENT INSURANCE PROPOSAL</div>

    <!-- Prepared For Box -->
    <div style="background: #f9f9f9; padding: 15px 25px; border: 2px solid ${PRIMARY_COLOR}; border-radius: 10px; margin: 10px; display: inline-block;">
      <div style="font-size: 11px; color: ${ACCENT_COLOR}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Prepared For</div>
      <div style="font-size: 24px; font-weight: bold; color: ${PRIMARY_COLOR};">
        ${clientInfo.firstName} ${clientInfo.lastName}
      </div>
    </div>

    <!-- Presented By Box -->
    <div style="background: #f9f9f9; padding: 12px 20px; border: 2px solid ${PRIMARY_COLOR}; border-radius: 10px; margin: 8px 20px; text-align: left;">
      <div style="font-size: 11px; color: ${ACCENT_COLOR}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Presented By</div>
      <div style="font-size: 20px; font-weight: bold; color: ${PRIMARY_COLOR}; margin-bottom: 4px;">
        ${agentInfo.name}
      </div>
      <div style="font-size: 13px; color: ${ACCENT_COLOR};">
        ${agentInfo.title || 'Insurance Advisor'}
      </div>
    </div>

    <div style="background: #f9f9f9; padding: 12px 20px; border: 2px solid ${PRIMARY_COLOR}; border-radius: 10px; margin: 8px 20px; text-align: left;">
      <div style="font-size: 11px; color: ${ACCENT_COLOR}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Date</div>
      <div style="font-size: 18px; font-weight: bold; color: ${PRIMARY_COLOR};">
        ${formatDate(proposalDate)}
      </div>
    </div>
  </div>

  <!-- Page 2: Table of Contents -->
  <div class="page">
    <div class="page-content">
      <div class="header">
        <div class="header-content">
          <h1>Contents</h1>
          <div class="date">${formatDate(proposalDate)}</div>
          ${agencyName ? `<div class="agency-name">${agencyName || 'Metro Point Insurance'}</div>` : '<div class="agency-name">Metro Point Insurance</div>'}
        </div>
        ${agencyLogo ? `<img src="${agencyLogo}" alt="Agency Logo" class="header-logo" />` : ''}
      </div>

      <div class="toc-section">
      <ul class="toc-list">
        <li class="toc-item">
          <span>Welcome & General Disclaimers</span>
          <span class="toc-page-num">3</span>
        </li>
        <li class="toc-item">
          <span>About ${agencyName || 'Metro Point Insurance'}</span>
          <span class="toc-page-num">4</span>
        </li>
        <li class="toc-item">
          <span>Your ${agencyName || 'Metro Point Insurance'} Team</span>
          <span class="toc-page-num">5</span>
        </li>
      </ul>

      <div class="toc-section-header">Coverage Details</div>
      <ul class="toc-list">
        ${coverageEntries.map(([type, _coverage], index) => {
          const template = coverageTemplates[type];
          const icon = COVERAGE_ICONS[type] || '📄';
          const pageNum = 6 + index;
          return `
            <li class="toc-item">
              <span><span class="toc-icon">${icon}</span>${template.title.replace(/[^\w\s]/g, '')}</span>
              <span class="toc-page-num">${pageNum}</span>
            </li>
          `;
        }).join('')}
      </ul>

      <ul class="toc-list" style="margin-top: 30px;">
        <li class="toc-item">
          <span>Premium Summary</span>
          <span class="toc-page-num">${6 + coverageEntries.length}</span>
        </li>
        <li class="toc-item">
          <span>Recommendations & Discussion Points</span>
          <span class="toc-page-num">${7 + coverageEntries.length}</span>
        </li>
      </ul>
      </div>
    </div>

    <div class="footer">
      ${agencyName || 'Metro Point Insurance'} | WRAP Proposal | Page 2
    </div>
  </div>

  <!-- Page 3: Welcome & General Disclaimers -->
  <div class="page">
    <div class="page-content">
      <div class="header">
        <div class="header-content">
          <h1>Welcome</h1>
          <div class="date">${formatDate(proposalDate)}</div>
          ${agencyName ? `<div class="agency-name">${agencyName || 'Metro Point Insurance'}</div>` : '<div class="agency-name">Metro Point Insurance</div>'}
        </div>
        ${agencyLogo ? `<img src="${agencyLogo}" alt="Agency Logo" class="header-logo" />` : ''}
      </div>

      <div class="disclaimer-box">
      <h3>Welcome</h3>
      <p>Dear ${clientInfo.firstName} ${clientInfo.lastName},</p>
      <p>Thank you for the opportunity to present this comprehensive insurance proposal. We have carefully reviewed your current coverage and identified opportunities to enhance your protection while potentially reducing costs.</p>
      <p>This proposal reflects our commitment to providing you with the highest level of service and the most competitive options available in the marketplace. Our team has leveraged our relationships with leading carriers to secure quotes that offer superior coverage at competitive premiums.</p>
      <p>We look forward to discussing this proposal with you and answering any questions you may have.</p>
    </div>

    <div class="disclaimer-box">
      <h3>Coverage Disclaimer and Liability Limitations</h3>
      <p>This proposal is provided for informational purposes only and does not constitute a binding contract of insurance. All coverage is subject to the terms, conditions, exclusions, and limitations of the actual policy documents.</p>
      <p>The information presented is based on the information you have provided to us. It is important that all information is accurate and complete. Any material misrepresentation or omission may affect coverage or premium.</p>
      <p>${agencyName || 'Metro Point Insurance'} acts as your agent in presenting this proposal. We do not assume any liability for coverage gaps, claim denials, or other issues that may arise from the policies presented. We strongly recommend that you review all policy documents carefully and consult with legal and financial advisors as appropriate.</p>
      <p>Premium quotes are subject to underwriting approval and may change based on final underwriting review, inspection results, or changes in the information provided.</p>
    </div>

    <div class="disclaimer-box">
      <h3>Compensation</h3>
      <p>${agencyName || 'Metro Point Insurance'} is compensated through commissions paid by insurance carriers for policies placed. Commission rates vary by carrier and coverage type but typically range from 10% to 15% of the premium.</p>
      <p>Our compensation does not affect the premium you pay. Premiums are set by the insurance carriers based on their underwriting guidelines and rate filings.</p>
      <p>We may also receive contingent commissions or bonuses based on overall volume and loss performance with certain carriers. These arrangements do not influence our recommendations, which are based solely on providing you with the best coverage at the most competitive price.</p>
      </div>
    </div>

    <div class="footer">
      ${agencyName || 'Metro Point Insurance'} | WRAP Proposal | Page 3
    </div>
  </div>

  <!-- Page 4: About Agency -->
  <div class="page">
    <div class="page-content">
      <div class="header">
        <div class="header-content">
          <h1>About ${agencyName || 'Metro Point Insurance'}</h1>
          <div class="date">${formatDate(proposalDate)}</div>
          ${agencyName ? `<div class="agency-name">${agencyName || 'Metro Point Insurance'}</div>` : '<div class="agency-name">Metro Point Insurance</div>'}
        </div>
        ${agencyLogo ? `<img src="${agencyLogo}" alt="Agency Logo" class="header-logo" />` : ''}
      </div>

      <div class="about-section">
      <p>${agencyName || 'Metro Point Insurance'} is a leading independent insurance agency specializing in high-net-worth personal insurance and risk management. With decades of combined experience, our team brings deep expertise in protecting the unique assets and lifestyles of affluent individuals and families.</p>
    </div>

    <div class="about-section">
      <h3>Our Unique Advantage</h3>
      <p>As an independent agency, we work with multiple top-rated insurance carriers, allowing us to provide you with the best coverage at the most competitive price. Unlike captive agents who represent only one company, we have the flexibility to shop the market on your behalf and negotiate the best terms.</p>
    </div>

    <div class="about-section">
      <h3>Why Choose Us</h3>
      <ul>
        <li>Independent representation with access to multiple A-rated carriers</li>
        <li>Specialized expertise in high-net-worth personal insurance</li>
        <li>Personalized service with dedicated account management</li>
        <li>Comprehensive risk assessment and coverage analysis</li>
        <li>Proactive policy reviews and market updates</li>
        <li>Claims advocacy and support when you need it most</li>
        <li>Strong carrier relationships ensuring competitive pricing</li>
      </ul>
    </div>

    <div class="about-section">
      <h3>Our Commitment to You</h3>
      <p>We are committed to providing you with exceptional service, expert advice, and comprehensive protection for your assets. Our team takes the time to understand your unique needs and works diligently to ensure you have the right coverage in place.</p>
      <p>We believe in building long-term relationships based on trust, transparency, and results. Your success is our success, and we are here to support you every step of the way.</p>
    </div>

    <div class="contact-box">
      <h3>Contact Information</h3>
      <p><strong>Address:</strong> ${agentInfo.address || '123 Main Street, Suite 100'}</p>
      <p><strong>Phone:</strong> ${agentInfo.phone || '(555) 123-4567'}</p>
      <p><strong>Email:</strong> ${agentInfo.email || 'info@agency.com'}</p>
      <p><strong>Website:</strong> ${agentInfo.website || 'www.agency.com'}</p>
      </div>
    </div>

    <div class="footer">
      ${agencyName || 'Metro Point Insurance'} | WRAP Proposal | Page 4
    </div>
  </div>

  <!-- Page 5: Team Page -->
  <div class="page">
    <div class="page-content">
      <div class="header">
        <div class="header-content">
          <h1>Your ${agencyName || 'Metro Point Insurance'} Team</h1>
          <div class="date">${formatDate(proposalDate)}</div>
          ${agencyName ? `<div class="agency-name">${agencyName || 'Metro Point Insurance'}</div>` : '<div class="agency-name">Metro Point Insurance</div>'}
        </div>
        ${agencyLogo ? `<img src="${agencyLogo}" alt="Agency Logo" class="header-logo" />` : ''}
      </div>

      <div class="team-grid">
      <div class="team-member">
        ${agentPhoto ? `<img src="${agentPhoto}" alt="${agentInfo.name}" class="team-photo" />` : `
          <div class="team-photo" style="background: linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #004466 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 40px; font-weight: bold;">
            ${agentInfo.name.split(' ').map(n => n[0]).join('')}
          </div>
        `}
        <div class="team-name">${agentInfo.name}</div>
        <div class="team-title">${agentInfo.title || 'Insurance Advisor'}</div>
        <div class="team-contact">
          ${agentInfo.phone ? `<div>${agentInfo.phone}</div>` : ''}
          ${agentInfo.email ? `<div>${agentInfo.email}</div>` : ''}
        </div>
      </div>
      </div>
    </div>

    <div class="footer">
      ${agencyName || 'Metro Point Insurance'} | WRAP Proposal | Page 5
    </div>
  </div>

  <!-- Coverage Detail Pages -->
  ${Object.entries(coverages).map(([type, coverage], index) => {
    const coverageType = type as CoverageType;
    const template = coverageTemplates[coverageType];
    const icon = COVERAGE_ICONS[coverageType] || '📄';
    const pageNum = 6 + index;

    return `
      <div class="page">
        <div class="page-content">
          <div class="header">
            <div class="header-content">
              <h1>${icon} ${template.title.replace(/[^\w\s]/g, '')}</h1>
              <div class="date">${formatDate(proposalDate)}</div>
              ${agencyName ? `<div class="agency-name">${agencyName || 'Metro Point Insurance'}</div>` : '<div class="agency-name">Metro Point Insurance</div>'}
            </div>
            ${agencyLogo ? `<img src="${agencyLogo}" alt="Agency Logo" class="header-logo" />` : ''}
          </div>

          <!-- Policy Info Box with Premium -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 30px;">
          <div style="background: #e3f2fd; border: 2px solid ${PRIMARY_COLOR}; border-radius: 8px; padding: 20px;">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
              ${coverage.policy_number ? `
                <div>
                  <div style="font-size: 12px; color: #666; font-weight: bold; text-transform: uppercase; margin-bottom: 5px;">Policy Number</div>
                  <div style="font-size: 16px; color: #333;">${coverage.policy_number}</div>
                </div>
              ` : ''}
              <div>
                <div style="font-size: 12px; color: #666; font-weight: bold; text-transform: uppercase; margin-bottom: 5px;">Carrier</div>
                <div style="font-size: 16px; color: #333;">${coverage.proposed_carrier}</div>
              </div>
              ${coverage.policy_term ? `
                <div>
                  <div style="font-size: 12px; color: #666; font-weight: bold; text-transform: uppercase; margin-bottom: 5px;">Policy Term</div>
                  <div style="font-size: 16px; color: #333;">${coverage.policy_term}</div>
                </div>
              ` : ''}
              ${coverage.effective_date ? `
                <div>
                  <div style="font-size: 12px; color: #666; font-weight: bold; text-transform: uppercase; margin-bottom: 5px;">Effective Date</div>
                  <div style="font-size: 16px; color: #333;">${coverage.effective_date}</div>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Large Premium Box -->
          <div class="premium-highlight" style="display: flex; flex-direction: column; justify-content: center; min-height: 120px;">
            <div class="label">Annual Premium</div>
            <div class="value" style="font-size: 32px;">$${parseFloat(coverage.proposed_premium.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            ${coverage.current_premium ? `
              <div style="font-size: 14px; margin-top: 10px; color: rgba(255,255,255,0.9);">
                Previous: $${parseFloat(coverage.current_premium.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Coverage Details Table -->
        <div class="coverage-detail">
          <div class="coverage-title">Coverage Details</div>

          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr style="background: ${PRIMARY_COLOR}; color: white;">
                <th style="padding: 12px; text-align: left; font-size: 14px; border: 1px solid #ddd;">Description</th>
                <th style="padding: 12px; text-align: left; font-size: 14px; border: 1px solid #ddd;">Limits & Deductibles</th>
              </tr>
            </thead>
            <tbody>
              ${template.fields.map(field => {
                const value = coverage[field.id];
                if (!value || field.id === 'policy_number' || field.id === 'proposed_carrier' || field.id === 'current_carrier' || field.id === 'policy_term' || field.id === 'effective_date' || field.id === 'proposed_premium' || field.id === 'current_premium') return '';

                return `
                  <tr>
                    <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9; width: 40%;">${field.label}</td>
                    <td style="padding: 12px; border: 1px solid #ddd; white-space: pre-wrap;">${value}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <!-- Coverage Endorsements Section -->
          ${coverage.endorsements || coverage.additional_features ? `
            <div style="margin-top: 25px;">
              <h3 style="color: ${PRIMARY_COLOR}; font-size: 18px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid ${ACCENT_COLOR};">
                ${coverage.endorsements ? 'Coverage Endorsements' : 'Additional Features'}
              </h3>
              <ul style="list-style: none; padding: 0;">
                ${String(coverage.endorsements || coverage.additional_features || '').split('\n').filter(line => line.trim()).map(item => `
                  <li style="padding: 8px 0; padding-left: 25px; position: relative; line-height: 1.6;">
                    <span style="position: absolute; left: 0; color: ${ACCENT_COLOR};">✓</span>
                    ${item.trim()}
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
        </div>

        <div class="footer">
          ${agencyName || 'Metro Point Insurance'} | ${template.title.replace(/[^\w\s]/g, '')} | Page ${pageNum}
        </div>
      </div>
    `;
  }).join('')}

  <!-- Premium Summary Page -->
  <div class="page">
    <div class="page-content">
      <div class="header">
        <div class="header-content">
          <h1>Premium Summary</h1>
          <div class="date">${formatDate(proposalDate)}</div>
          ${agencyName ? `<div class="agency-name">${agencyName || 'Metro Point Insurance'}</div>` : '<div class="agency-name">Metro Point Insurance</div>'}
        </div>
        ${agencyLogo ? `<img src="${agencyLogo}" alt="Agency Logo" class="header-logo" />` : ''}
      </div>

      <table class="premium-summary-table">
      <thead>
        <tr>
          <th style="width: 60px;"></th>
          <th>Lines of Business</th>
          <th style="text-align: right;">Expiring Premium</th>
          <th style="text-align: right;">Renewal Premium</th>
        </tr>
      </thead>
      <tbody>
        ${coverageEntries.map(([type, coverage]) => {
          const template = coverageTemplates[type];
          const icon = COVERAGE_ICONS[type] || '📄';
          const current = parseFloat(coverage.current_premium?.toString() || '0');
          const proposed = parseFloat(coverage.proposed_premium?.toString() || '0');

          return `
            <tr>
              <td class="icon-cell">${icon}</td>
              <td>${template.title.replace(/[^\w\s]/g, '')}</td>
              <td style="text-align: right;">${current > 0 ? '$' + current.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}</td>
              <td style="text-align: right;">$${proposed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          `;
        }).join('')}
        <tr class="totals-row">
          <td></td>
          <td><strong>TOTAL</strong></td>
          <td style="text-align: right;"><strong>$${totalCurrentPremium.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
          <td style="text-align: right;"><strong>$${totalProposedPremium.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
        </tr>
      </tbody>
    </table>

    <div class="summary-highlight-box">
      <div class="summary-label">Total Expiring Premium</div>
      <div class="summary-value">$${totalCurrentPremium.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>

      <div class="summary-label" style="margin-top: 12px;">Total Renewal Premium</div>
      <div class="summary-value">$${totalProposedPremium.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>

      ${savingsAmount !== 0 ? `
        <div class="summary-label" style="margin-top: 12px;">${savingsAmount > 0 ? 'Annual Savings' : 'Annual Increase'}</div>
        <div class="summary-savings">
          ${savingsAmount > 0 ? '-' : '+'}$${Math.abs(savingsAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div class="summary-percentage">
          (${savingsAmount > 0 ? '-' : '+'}${Math.abs(parseFloat(savingsPercentage))}%)
        </div>
      ` : ''}
      </div>
    </div>

    <div class="footer">
      ${agencyName || 'Metro Point Insurance'} | Premium Summary | Page ${6 + coverageEntries.length}
    </div>
  </div>

  <!-- Recommendations & Discussion Points -->
  <div class="page">
    <div class="page-content">
      <div class="header">
        <div class="header-content">
          <h1>Recommendations & Discussion Points</h1>
          <div class="date">${formatDate(proposalDate)}</div>
          ${agencyName ? `<div class="agency-name">${agencyName || 'Metro Point Insurance'}</div>` : '<div class="agency-name">Metro Point Insurance</div>'}
        </div>
        ${agencyLogo ? `<img src="${agencyLogo}" alt="Agency Logo" class="header-logo" />` : ''}
      </div>

      <div class="section">
      <h2 class="section-title">Key Recommendations</h2>

      ${notes ? `
        ${notes.split('\n').filter(line => line.trim()).map(note => `
          <div class="recommendation-item">${note}</div>
        `).join('')}
      ` : `
        <div class="recommendation-item">
          Review all coverage limits to ensure they align with your current asset values and potential exposures.
        </div>
        <div class="recommendation-item">
          Consider scheduling an annual policy review to account for any changes in your assets, lifestyle, or risk profile.
        </div>
        <div class="recommendation-item">
          Verify that all properties, vehicles, and valuable items are properly listed and covered under the appropriate policies.
        </div>
        <div class="recommendation-item">
          Ensure adequate liability protection through umbrella coverage to protect your wealth from catastrophic claims.
        </div>
        <div class="recommendation-item">
          Maintain detailed inventories and appraisals for high-value items such as jewelry, art, and collectibles.
        </div>
      `}
    </div>

    <div class="executive-summary-box">
      <h3>Executive Summary</h3>

      ${executiveSummary ? `
        <p>${executiveSummary.replace(/\n/g, '<br>')}</p>
      ` : `
        <ul>
          <li>Comprehensive coverage across all lines of business with leading A-rated carriers</li>
          <li>Competitive premiums reflecting our strong carrier relationships and market expertise</li>
          <li>Enhanced protection with updated policy limits and endorsements</li>
          <li>Dedicated service team committed to your ongoing protection and satisfaction</li>
          <li>Annual policy reviews to ensure your coverage evolves with your needs</li>
        </ul>
        <p style="margin-top: 20px;">
          We recommend accepting this proposal to secure superior coverage at competitive rates. Our team is ready to assist with binding coverage and ensuring a smooth transition.
        </p>
      `}
    </div>

    ${executiveSummary ? '' : `
      <div style="margin-top: 30px; padding: 20px; background: #f9f9f9; border-left: 4px solid ${PRIMARY_COLOR}; border-radius: 4px;">
        <h4 style="color: ${PRIMARY_COLOR}; margin-bottom: 10px;">Next Steps</h4>
        <p style="line-height: 1.8;">
          Please review this proposal carefully and contact us with any questions. We are happy to discuss any aspect of the coverage or make adjustments as needed. Once you are ready to proceed, we will work quickly to bind coverage and provide you with your policy documents.
        </p>
        <p style="margin-top: 15px; line-height: 1.8;">
          Thank you for the opportunity to serve your insurance needs. We look forward to protecting what matters most to you.
        </p>
      </div>
    `}
    </div>

    <div class="footer">
      ${agencyName || 'Metro Point Insurance'} | Recommendations | Page ${7 + coverageEntries.length}
    </div>
  </div>

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
