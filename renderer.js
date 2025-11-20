// Main application logic - Updated for browser-based PDF/Word generation
let activeCoverages = new Set();
let teamMemberCount = 1;

document.addEventListener('DOMContentLoaded', () => {
    initializeForm();
    setupEventListeners();
});

function initializeForm() {
    document.getElementById('proposalDate').valueAsDate = new Date();
}

function setupEventListeners() {
    // Toolbar buttons
    document.getElementById('newBtn').addEventListener('click', newProposal);
    document.getElementById('loadSampleBtn').addEventListener('click', loadSampleData);
    document.getElementById('loadBtn').addEventListener('click', loadProposal);
    document.getElementById('saveBtn').addEventListener('click', saveProposal);
    document.getElementById('previewBtn').addEventListener('click', previewPDF);
    document.getElementById('generatePdfBtn').addEventListener('click', generatePDF);
    document.getElementById('generateDocxBtn').addEventListener('click', generateWordDoc);

    // Coverage toggles
    document.querySelectorAll('.coverage-toggle').forEach(checkbox => {
        checkbox.addEventListener('change', handleCoverageToggle);
    });

    // Add team member button
    document.getElementById('addTeamMember').addEventListener('click', addTeamMember);

    // Modal close
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('previewModal').style.display = 'none';
    });
}

function handleCoverageToggle(event) {
    const coverageType = event.target.dataset.coverage;
    const container = document.getElementById('coverageSections');
    
    if (event.target.checked) {
        activeCoverages.add(coverageType);
        addCoverageSection(coverageType, container);
    } else {
        activeCoverages.delete(coverageType);
        removeCoverageSection(coverageType);
    }
    
    calculateSummary();
}

function addCoverageSection(coverageType, container) {
    const template = coverageTemplates[coverageType];
    if (!template) return;

    const section = document.createElement('div');
    section.id = `coverage-${coverageType}`;
    section.className = 'coverage-detail-section';
    
    let html = `<h3>${template.title}</h3><div class="coverage-field-grid">`;
    
    template.fields.forEach(field => {
        const fieldId = `${coverageType}_${field.id}`;
        const required = field.required ? 'required' : '';
        const placeholder = field.placeholder || '';
        
        html += `<div class="form-group ${field.type === 'textarea' ? 'full-width' : ''}">
            <label for="${fieldId}">${field.label}${field.required ? ' *' : ''}</label>`;
        
        if (field.type === 'textarea') {
            html += `<textarea id="${fieldId}" ${required} placeholder="${placeholder}" rows="3"></textarea>`;
        } else {
            html += `<input type="${field.type}" id="${fieldId}" ${required} placeholder="${placeholder}"
                     ${field.id.includes('premium') ? 'onchange="calculateSummary()"' : ''}>`;
        }
        
        html += `</div>`;
    });
    
    html += `</div>`;
    section.innerHTML = html;
    container.appendChild(section);
}

function removeCoverageSection(coverageType) {
    const section = document.getElementById(`coverage-${coverageType}`);
    if (section) {
        section.remove();
    }
}

function addTeamMember() {
    teamMemberCount++;
    const teamContainer = document.getElementById('teamMembers');

    const memberCard = document.createElement('div');
    memberCard.className = 'team-member-card';
    memberCard.dataset.member = teamMemberCount;

    memberCard.innerHTML = `
        <h4>Team Member #${teamMemberCount}</h4>
        <button type="button" class="remove-team-member" onclick="removeTeamMember(${teamMemberCount})">✕ Remove</button>
        <div class="form-grid">
            <div class="form-group">
                <label for="teamName${teamMemberCount}">Name *</label>
                <input type="text" id="teamName${teamMemberCount}" required placeholder="Jane Smith">
            </div>
            <div class="form-group">
                <label for="teamTitle${teamMemberCount}">Title</label>
                <input type="text" id="teamTitle${teamMemberCount}" placeholder="Senior Advisor">
            </div>
            <div class="form-group">
                <label for="teamPhone${teamMemberCount}">Phone</label>
                <input type="tel" id="teamPhone${teamMemberCount}" placeholder="(239) 555-5678">
            </div>
            <div class="form-group">
                <label for="teamEmail${teamMemberCount}">Email</label>
                <input type="email" id="teamEmail${teamMemberCount}" placeholder="jane@agency.com">
            </div>
            <div class="form-group full-width">
                <label for="teamPhoto${teamMemberCount}">Photo URL (optional)</label>
                <input type="text" id="teamPhoto${teamMemberCount}" placeholder="https://yoursite.com/photo.jpg or leave blank">
            </div>
        </div>
    `;

    teamContainer.appendChild(memberCard);
}

function removeTeamMember(memberId) {
    const card = document.querySelector(`.team-member-card[data-member="${memberId}"]`);
    if (card && memberId > 1) { // Don't allow removing the primary agent
        card.remove();
    }
}

function calculateSummary() {
    let totalCurrent = 0;
    let totalProposed = 0;
    
    activeCoverages.forEach(coverageType => {
        const currentInput = document.getElementById(`${coverageType}_current_premium`);
        const proposedInput = document.getElementById(`${coverageType}_proposed_premium`);
        
        if (currentInput && proposedInput) {
            totalCurrent += parseFloat(currentInput.value) || 0;
            totalProposed += parseFloat(proposedInput.value) || 0;
        }
    });
    
    const savings = totalCurrent - totalProposed;
    const savingsClass = savings >= 0 ? 'savings-positive' : 'savings-negative';
    const savingsPercent = totalCurrent > 0 ? ((savings / totalCurrent) * 100).toFixed(1) : 0;
    
    const summaryContent = document.querySelector('#premiumSummary .summary-content') || 
                          document.querySelector('#premiumSummary');
    
    if (activeCoverages.size === 0) {
        summaryContent.innerHTML = '<p style="color: #666;">Add coverages above to see premium summary</p>';
        return;
    }
    
    summaryContent.innerHTML = `
        <div class="summary-row">
            <span class="summary-label">Total Current Premium:</span>
            <span class="summary-value">$${totalCurrent.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">Total Proposed Premium:</span>
            <span class="summary-value">$${totalProposed.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">Annual Savings:</span>
            <span class="summary-value ${savingsClass}">$${savings.toLocaleString('en-US', {minimumFractionDigits: 2})} (${savingsPercent}%)</span>
        </div>
    `;
}

function collectFormData() {
    const data = {
        companyInfo: {
            name: document.getElementById('companyName').value,
            phone: document.getElementById('companyPhone').value,
            email: document.getElementById('companyEmail').value,
            address: document.getElementById('companyAddress').value,
            website: document.getElementById('companyWebsite').value,
            logo: document.getElementById('companyLogo').value,
            brandColor: document.getElementById('brandColor').value
        },
        teamMembers: [],
        proposalDate: document.getElementById('proposalDate').value,
        clientInfo: {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            zip: document.getElementById('zip').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value
        },
        coverages: {},
        executiveSummary: document.getElementById('executiveSummary').value,
        notes: document.getElementById('notes').value
    };

    // Collect team members
    document.querySelectorAll('.team-member-card').forEach(card => {
        const memberId = card.dataset.member;
        const nameEl = document.getElementById(`teamName${memberId}`);
        if (nameEl && nameEl.value) {
            data.teamMembers.push({
                name: nameEl.value,
                title: document.getElementById(`teamTitle${memberId}`)?.value || '',
                phone: document.getElementById(`teamPhone${memberId}`)?.value || '',
                email: document.getElementById(`teamEmail${memberId}`)?.value || '',
                photo: document.getElementById(`teamPhoto${memberId}`)?.value || ''
            });
        }
    });
    
    // Collect coverage data
    activeCoverages.forEach(coverageType => {
        const template = coverageTemplates[coverageType];
        const coverageData = {};
        
        template.fields.forEach(field => {
            const fieldId = `${coverageType}_${field.id}`;
            const element = document.getElementById(fieldId);
            if (element) {
                coverageData[field.id] = element.value;
            }
        });
        
        data.coverages[coverageType] = coverageData;
    });
    
    return data;
}

function populateFormData(data) {
    // Company info
    if (data.companyInfo) {
        document.getElementById('companyName').value = data.companyInfo.name || '';
        document.getElementById('companyPhone').value = data.companyInfo.phone || '';
        document.getElementById('companyEmail').value = data.companyInfo.email || '';
        document.getElementById('companyAddress').value = data.companyInfo.address || '';
        document.getElementById('companyWebsite').value = data.companyInfo.website || '';
        document.getElementById('companyLogo').value = data.companyInfo.logo || '';
        document.getElementById('brandColor').value = data.companyInfo.brandColor || '#003366';
    }

    // Team members
    document.getElementById('teamMembers').innerHTML = '';
    teamMemberCount = 0;
    if (data.teamMembers && data.teamMembers.length > 0) {
        data.teamMembers.forEach((member, index) => {
            if (index === 0) {
                // First team member (already in HTML)
                teamMemberCount = 1;
                const card = document.createElement('div');
                card.className = 'team-member-card';
                card.dataset.member = '1';
                card.innerHTML = `
                    <h4>Team Member #1 (Primary Agent)</h4>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="teamName1">Name *</label>
                            <input type="text" id="teamName1" required placeholder="John Smith" value="${member.name || ''}">
                        </div>
                        <div class="form-group">
                            <label for="teamTitle1">Title</label>
                            <input type="text" id="teamTitle1" placeholder="Senior Vice President" value="${member.title || ''}">
                        </div>
                        <div class="form-group">
                            <label for="teamPhone1">Phone</label>
                            <input type="tel" id="teamPhone1" placeholder="(239) 555-1234" value="${member.phone || ''}">
                        </div>
                        <div class="form-group">
                            <label for="teamEmail1">Email</label>
                            <input type="email" id="teamEmail1" placeholder="john@agency.com" value="${member.email || ''}">
                        </div>
                        <div class="form-group full-width">
                            <label for="teamPhoto1">Photo URL (optional)</label>
                            <input type="text" id="teamPhoto1" placeholder="https://yoursite.com/photo.jpg or leave blank" value="${member.photo || ''}">
                        </div>
                    </div>
                `;
                document.getElementById('teamMembers').appendChild(card);
            } else {
                // Additional team members
                addTeamMember();
                const memberId = teamMemberCount;
                document.getElementById(`teamName${memberId}`).value = member.name || '';
                document.getElementById(`teamTitle${memberId}`).value = member.title || '';
                document.getElementById(`teamPhone${memberId}`).value = member.phone || '';
                document.getElementById(`teamEmail${memberId}`).value = member.email || '';
                document.getElementById(`teamPhoto${memberId}`).value = member.photo || '';
            }
        });
    }

    // Proposal date
    document.getElementById('proposalDate').value = data.proposalDate || '';

    // Client info
    document.getElementById('firstName').value = data.clientInfo.firstName || '';
    document.getElementById('lastName').value = data.clientInfo.lastName || '';
    document.getElementById('address').value = data.clientInfo.address || '';
    document.getElementById('city').value = data.clientInfo.city || '';
    document.getElementById('state').value = data.clientInfo.state || '';
    document.getElementById('zip').value = data.clientInfo.zip || '';
    document.getElementById('email').value = data.clientInfo.email || '';
    document.getElementById('phone').value = data.clientInfo.phone || '';

    // Clear existing coverages
    document.querySelectorAll('.coverage-toggle').forEach(cb => cb.checked = false);
    document.getElementById('coverageSections').innerHTML = '';
    activeCoverages.clear();

    // Add coverages
    Object.keys(data.coverages || {}).forEach(coverageType => {
        const checkbox = document.querySelector(`[data-coverage="${coverageType}"]`);
        if (checkbox) {
            checkbox.checked = true;
            activeCoverages.add(coverageType);
            addCoverageSection(coverageType, document.getElementById('coverageSections'));

            // Populate fields
            const coverageData = data.coverages[coverageType];
            Object.keys(coverageData).forEach(fieldId => {
                const element = document.getElementById(`${coverageType}_${fieldId}`);
                if (element) {
                    element.value = coverageData[fieldId];
                }
            });
        }
    });

    // Notes
    document.getElementById('executiveSummary').value = data.executiveSummary || '';
    document.getElementById('notes').value = data.notes || '';

    calculateSummary();
}

function newProposal() {
    if (confirm('Are you sure you want to start a new proposal? Any unsaved changes will be lost.')) {
        document.getElementById('proposalForm').reset();
        document.querySelectorAll('.coverage-toggle').forEach(cb => cb.checked = false);
        document.getElementById('coverageSections').innerHTML = '';
        activeCoverages.clear();
        document.getElementById('proposalDate').valueAsDate = new Date();
        calculateSummary();
        showMessage('New proposal started', 'success');
    }
}

async function saveProposal() {
    const form = document.getElementById('proposalForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const data = collectFormData();
    
    // Check if running in Electron
    if (window.electronAPI) {
        const result = await window.electronAPI.saveProposal(data);
        if (result.success) {
            showMessage('Proposal saved successfully!', 'success');
        } else {
            showMessage('Failed to save: ' + result.message, 'error');
        }
    } else {
        // Browser fallback
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.clientInfo.lastName}_WRAP_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showMessage('Proposal saved!', 'success');
    }
}

async function loadProposal() {
    if (window.electronAPI) {
        const result = await window.electronAPI.loadProposal();
        if (result.success) {
            populateFormData(result.data);
            showMessage('Proposal loaded successfully!', 'success');
        }
    } else {
        showMessage('Load functionality requires the desktop app', 'error');
    }
}

function previewPDF() {
    const form = document.getElementById('proposalForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const data = collectFormData();
    const html = generateProposalHTML(data);
    
    const modal = document.getElementById('previewModal');
    const frame = document.getElementById('previewFrame');
    
    frame.srcdoc = html;
    modal.style.display = 'block';
}

async function generatePDF() {
    const form = document.getElementById('proposalForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    if (activeCoverages.size === 0) {
        showMessage('Please select at least one coverage type', 'error');
        return;
    }

    const data = collectFormData();
    const filename = `${data.clientInfo.lastName}_WRAP_Proposal_${new Date().toISOString().split('T')[0]}.pdf`;

    // Use the new page-by-page generator for perfect page breaks
    await generatePDFPageByPage(data, filename);
}

function generateProposalHTML(data) {
    // This will be in a separate file - pdf-template.js
    return generatePDFTemplate(data);
}

async function generateWordDoc() {
    const form = document.getElementById('proposalForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    if (activeCoverages.size === 0) {
        showMessage('Please select at least one coverage type', 'error');
        return;
    }

    try {
        showMessage('Generating Word document...', 'success');
        const data = collectFormData();
        const filename = `${data.clientInfo.lastName}_WRAP_Proposal_${new Date().toISOString().split('T')[0]}.docx`;

        await generateDocxFile(data, filename);
        showMessage('Word document generated successfully!', 'success');
    } catch (error) {
        console.error('Error generating Word doc:', error);
        showMessage('Failed to generate Word document: ' + error.message, 'error');
    }
}

function showMessage(text, type) {
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());

    const message = document.createElement('div');
    message.className = `message message-${type}`;
    message.textContent = text;

    const container = document.querySelector('.container');
    const toolbar = document.querySelector('.toolbar');
    container.insertBefore(message, toolbar.nextSibling);

    setTimeout(() => message.remove(), 5000);
}
