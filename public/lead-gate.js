/**
 * WRAP Lead Gate - JavaScript Injection
 * Shows a modal requiring contact info before accessing the tool
 */
(function() {
    'use strict';
    
    const CONFIG = {
        cookieName: 'wrap_access',
        cookieDays: 30
    };

    // Check if user has access
    function hasAccess() {
        return document.cookie.includes(CONFIG.cookieName + '=granted') || 
               localStorage.getItem('wrap_access') === 'granted';
    }

    // Grant access
    function grantAccess() {
        const expires = new Date(Date.now() + CONFIG.cookieDays * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `${CONFIG.cookieName}=granted; expires=${expires}; path=/; SameSite=Lax`;
        localStorage.setItem('wrap_access', 'granted');
    }

    // Create and show modal
    function showGate() {
        const overlay = document.createElement('div');
        overlay.id = 'wrap-gate-overlay';
        overlay.innerHTML = `
            <style>
                #wrap-gate-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 59, 92, 0.95);
                    z-index: 99999;
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    font-family: system-ui, -apple-system, sans-serif;
                    overflow-y: auto;
                    padding: 20px 0;
                    box-sizing: border-box;
                }
                #wrap-gate-modal {
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    max-width: 480px;
                    width: 90%;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.3);
                    margin: auto;
                }
                #wrap-gate-modal h2 {
                    color: #003B5C;
                    margin: 0 0 8px 0;
                    font-size: 24px;
                }
                #wrap-gate-modal p {
                    color: #666;
                    margin: 0 0 16px 0;
                    font-size: 15px;
                }
                #wrap-gate-modal .benefits {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 12px 16px;
                    margin-bottom: 16px;
                }
                #wrap-gate-modal .benefits li {
                    color: #333;
                    margin: 4px 0;
                    font-size: 13px;
                }
                #wrap-gate-modal label {
                    display: block;
                    color: #333;
                    font-size: 13px;
                    font-weight: 500;
                    margin-bottom: 4px;
                }
                #wrap-gate-modal input, #wrap-gate-modal select {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 16px;
                    margin-bottom: 12px;
                    box-sizing: border-box;
                }
                #wrap-gate-modal input:focus, #wrap-gate-modal select:focus {
                    outline: none;
                    border-color: #003B5C;
                    box-shadow: 0 0 0 3px rgba(0,59,92,0.1);
                }
                #wrap-gate-modal button {
                    width: 100%;
                    padding: 14px;
                    background: #003B5C;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                #wrap-gate-modal button:hover {
                    background: #004d7a;
                }
                #wrap-gate-modal button:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                }
                #wrap-gate-modal .error {
                    color: #dc3545;
                    font-size: 14px;
                    margin-bottom: 16px;
                    display: none;
                }
                #wrap-gate-modal .row {
                    display: flex;
                    gap: 12px;
                }
                #wrap-gate-modal .row > div {
                    flex: 1;
                }
            </style>
            <div id="wrap-gate-modal">
                <h2>🔐 Access WRAP Tool</h2>
                <p>Enter your contact info to use the WRAP Proposal Generator for free.</p>
                <div class="benefits">
                    <ul style="margin:0; padding-left:20px;">
                        <li>✓ Create professional WRAP proposals in minutes</li>
                        <li>✓ Export to Word documents</li>
                        <li>✓ Add your agency branding</li>
                        <li>✓ Free — no credit card required</li>
                    </ul>
                </div>
                <form id="wrap-gate-form">
                    <div class="row">
                        <div>
                            <label>First Name *</label>
                            <input type="text" name="firstName" required placeholder="John">
                        </div>
                        <div>
                            <label>Last Name *</label>
                            <input type="text" name="lastName" required placeholder="Smith">
                        </div>
                    </div>
                    <label>Email *</label>
                    <input type="email" name="email" required placeholder="john@agency.com">
                    <label>Agency Name</label>
                    <input type="text" name="agency" placeholder="ABC Insurance Agency">
                    <label>Phone</label>
                    <input type="tel" name="phone" placeholder="(555) 123-4567">
                    <label>How did you find us?</label>
                    <select name="source">
                        <option value="">Select one...</option>
                        <option value="google">Google Search</option>
                        <option value="social">Social Media</option>
                        <option value="referral">Referral</option>
                        <option value="chamber">Chamber Event</option>
                        <option value="other">Other</option>
                    </select>
                    <div class="error" id="wrap-gate-error"></div>
                    <button type="submit">Get Free Access</button>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);

        // Handle form submission
        document.getElementById('wrap-gate-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const btn = form.querySelector('button');
            const errorDiv = document.getElementById('wrap-gate-error');
            
            btn.disabled = true;
            btn.textContent = 'Processing...';
            errorDiv.style.display = 'none';

            const data = {
                first_name: form.firstName.value.trim(),
                last_name: form.lastName.value.trim(),
                email: form.email.value.trim(),
                company: form.agency.value.trim() || null,
                phone: form.phone.value.trim() || null,
                source_detail: form.source.value || null
            };

            try {
                // 1. Save the contact via the server-side lead API (same origin)
                const contactResponse = await fetch('/api/lead', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                let contactId = null;
                if (contactResponse.ok) {
                    const result = await contactResponse.json();
                    if (result && result.id) {
                        contactId = result.id;
                    }
                }

                // 2. Enroll in AMS-AGENCY drip campaign via server-side API (bypasses RLS)
                if (contactId) {
                    await fetch('/api/enroll', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contact_id: contactId,
                            campaign_id: 'ams-agency-drip',
                            campaign_name: 'AMS Agency Software Solutions',
                            source: 'wrap-tool',
                            source_detail: data.source_detail
                        })
                    });
                }

                // Success - grant access and remove modal
                grantAccess();
                overlay.remove();
                
            } catch (err) {
                console.error('Lead gate error:', err);
                // Grant access anyway - don't block user if CRM fails
                grantAccess();
                overlay.remove();
            }
        });
    }

    // Initialize on DOM ready
    function init() {
        if (hasAccess()) {
            console.log('[WRAP Gate] User has access');
            return;
        }
        console.log('[WRAP Gate] Showing lead capture form');
        showGate();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
