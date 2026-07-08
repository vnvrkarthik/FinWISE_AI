// FinWise AI - Client Side Application Logic

document.addEventListener("DOMContentLoaded", () => {
    // --- Application State ---
    const state = {
        // Inputs
        salary: 45000,
        creditScore: 730,
        existingEmi: 0,
        requestedAmount: 500000,
        requestedTenure: 60,

        // Output calculations
        eligibleAmount: 900000,
        dtiRatio: 20.5,
        riskLevel: "Low Risk",
        decision: "Approved",
        suggestedRate: 10.5,
        calculatedEmi: 10747,
        aiAdvice: "",

        // Settings (loaded from localStorage on init)
        settings: {
            isDemoMode: true,
            gasUrl: "",
            anthropicApiKey: ""
        },
        serverConfigured: false,
        serverLive: false
    };

    // --- DOM Elements Cache ---
    const elements = {
        // Tab Buttons
        tabEligibilityBtn: document.getElementById("btn-tab-eligibility"),
        tabCreditBtn: document.getElementById("btn-tab-credit"),
        tabEmiBtn: document.getElementById("btn-tab-emi"),
        tabTipsBtn: document.getElementById("btn-tab-tips"),
        
        // Tab Panels
        panelEligibility: document.getElementById("tab-eligibility"),
        panelCredit: document.getElementById("tab-credit"),
        panelEmi: document.getElementById("tab-emi"),
        panelTips: document.getElementById("tab-tips"),
        
        // Header
        mainTitle: document.getElementById("main-title"),
        quickTipsBtn: document.getElementById("btn-quick-tips"),
        
        // Connection status
        connectionBadge: document.getElementById("connection-badge"),

        // Eligibility Form Elements
        eligibilityForm: document.getElementById("eligibility-form"),
        salaryInput: document.getElementById("input-salary"),
        creditInput: document.getElementById("input-credit-score"),
        creditSlider: document.getElementById("slider-credit-score"),
        emiInput: document.getElementById("input-existing-emi"),
        loanAmountInput: document.getElementById("input-loan-amount"),
        loanTenureInput: document.getElementById("input-loan-tenure"),

        // Eligibility Result Elements
        eligPlaceholder: document.getElementById("eligibility-placeholder"),
        eligResults: document.getElementById("eligibility-results"),
        eligStatusBadge: document.getElementById("eligibility-status-badge"),
        eligStatusText: document.getElementById("eligibility-status-text"),
        resEligibleAmount: document.getElementById("res-eligible-amount"),
        resDtiRatio: document.getElementById("res-dti-ratio"),
        resRiskLevel: document.getElementById("res-risk-level"),
        resInterestRate: document.getElementById("res-interest-rate"),
        resEstEmi: document.getElementById("res-est-emi"),
        actionEmiBtn: document.getElementById("btn-action-emi"),
        actionImproveBtn: document.getElementById("btn-action-improve"),

        // Credit Analyzer elements
        gaugeFill: document.getElementById("gauge-fill"),
        gaugeScoreVal: document.getElementById("gauge-score-val"),
        gaugeTierVal: document.getElementById("gauge-tier-val"),
        creditAnalyzerScore: document.getElementById("credit-analyzer-score"),
        btnUpdateGauge: document.getElementById("btn-update-gauge"),
        creditTierDesc: document.getElementById("credit-tier-desc"),
        creditTipsList: document.getElementById("credit-tips-list"),
        btnCreditToTips: document.getElementById("btn-credit-to-tips"),

        // EMI Calculator Elements
        emiForm: document.getElementById("emi-form"),
        emiPrincipalInput: document.getElementById("input-emi-principal"),
        emiPrincipalSlider: document.getElementById("slider-emi-principal"),
        emiRateInput: document.getElementById("input-emi-rate"),
        emiRateSlider: document.getElementById("slider-emi-rate"),
        emiTenureInput: document.getElementById("input-emi-tenure"),
        emiTenureSlider: document.getElementById("slider-emi-tenure"),
        
        resEmiVal: document.getElementById("res-emi-val"),
        resEmiPrincipal: document.getElementById("res-emi-principal"),
        resEmiInterest: document.getElementById("res-emi-interest"),
        resEmiTotal: document.getElementById("res-emi-total"),
        barPrincipal: document.getElementById("ratio-bar-principal"),
        barInterest: document.getElementById("ratio-bar-interest"),
        lblRatioPrincipal: document.getElementById("lbl-ratio-principal"),
        lblRatioInterest: document.getElementById("lbl-ratio-interest"),

        // AI Tips elements
        tipsPlaceholder: document.getElementById("tips-placeholder"),
        tipsLoading: document.getElementById("tips-loading"),
        tipsReportContent: document.getElementById("tips-report-content"),
        tipsMetaSalary: document.getElementById("tips-meta-salary"),
        tipsMetaCredit: document.getElementById("tips-meta-credit"),
        tipsMetaEmi: document.getElementById("tips-meta-emi"),
        tipsMarkdownBody: document.getElementById("tips-markdown-body"),
        btnGenerateAiTips: document.getElementById("btn-generate-ai-tips"),
        btnDownloadPdf: document.getElementById("btn-download-pdf"),
        btnReEvaluate: document.getElementById("btn-re-evaluate"),
        reportDate: document.getElementById("report-date"),

        // Settings Elements
        settingsModal: document.getElementById("settings-modal"),
        btnOpenSettings: document.getElementById("btn-open-settings"),
        btnCloseSettings: document.getElementById("btn-close-settings"),
        btnCancelSettings: document.getElementById("btn-cancel-settings"),
        btnSaveSettings: document.getElementById("btn-save-settings"),
        toggleDemoMode: document.getElementById("toggle-demo-mode"),
        settingGasUrl: document.getElementById("setting-gas-url"),
        settingAnthropicKey: document.getElementById("setting-anthropic-key"),
        liveSettingsFields: document.getElementById("live-settings-fields")
    };

    // --- Tab Management ---
    const tabs = [
        { btn: elements.tabEligibilityBtn, panel: elements.panelEligibility, title: "Loan Eligibility Checker" },
        { btn: elements.tabCreditBtn, panel: elements.panelCredit, title: "Credit Score Analyzer" },
        { btn: elements.tabEmiBtn, panel: elements.panelEmi, title: "EMI Calculator" },
        { btn: elements.tabTipsBtn, panel: elements.panelTips, title: "AI Financial Advisor" }
    ];

    function switchTab(targetTabId) {
        tabs.forEach(tab => {
            const isTarget = tab.panel.id === targetTabId;
            tab.btn.classList.toggle("active", isTarget);
            tab.panel.classList.toggle("active", isTarget);
            if (isTarget) {
                elements.mainTitle.textContent = tab.title;
            }
        });
        
        // Trigger tab-specific refresh if needed
        if (targetTabId === "tab-credit") {
            elements.creditAnalyzerScore.value = state.creditScore;
            updateCreditGauge(state.creditScore);
        } else if (targetTabId === "tab-tips") {
            // Update inputs displayed inside AI Tips placeholder
            elements.tipsMetaSalary.textContent = formatCurrency(state.salary);
            elements.tipsMetaCredit.textContent = state.creditScore;
            elements.tipsMetaEmi.textContent = formatCurrency(state.existingEmi);
        }
    }

    tabs.forEach(tab => {
        tab.btn.addEventListener("click", () => switchTab(tab.panel.id));
    });

    // --- Helper Functions ---
    function formatCurrency(amount) {
        return "₹" + Math.round(amount).toLocaleString("en-IN");
    }

    // --- Initialization & Local Settings Loader ---
    function init() {
        // Load settings from LocalStorage
        const savedDemo = localStorage.getItem("finwise_demo_mode");
        const savedGasUrl = localStorage.getItem("finwise_gas_url");
        const savedApiKey = localStorage.getItem("finwise_anthropic_key");

        if (savedDemo !== null) {
            state.settings.isDemoMode = savedDemo === "true";
        }
        if (savedGasUrl !== null) {
            state.settings.gasUrl = savedGasUrl;
        }
        if (savedApiKey !== null) {
            state.settings.anthropicApiKey = savedApiKey;
        }

        // Apply settings UI states
        elements.toggleDemoMode.checked = state.settings.isDemoMode;
        elements.settingGasUrl.value = state.settings.gasUrl;
        elements.settingAnthropicKey.value = state.settings.anthropicApiKey;
        
        updateConnectionUI();
        
        // Link slider inputs to numbers
        linkInputAndSlider(elements.creditInput, elements.creditSlider);
        
        // EMI Inputs
        linkInputAndSlider(elements.emiPrincipalInput, elements.emiPrincipalSlider, calculateEMIPanel);
        linkInputAndSlider(elements.emiRateInput, elements.emiRateSlider, calculateEMIPanel);
        linkInputAndSlider(elements.emiTenureInput, elements.emiTenureSlider, calculateEMIPanel);

        // Run default calculation
        calculateEMIPanel();

        // Check if server config is active
        checkServerConfig();
    }

    async function checkServerConfig() {
        try {
            const res = await fetch("/api/config");
            if (res.ok) {
                const config = await res.json();
                state.serverConfigured = true;
                if (config.server_mode === "live") {
                    state.serverLive = true;
                    // Disable demo mode on first launch if server is preconfigured in production live mode
                    const savedDemo = localStorage.getItem("finwise_demo_mode");
                    if (savedDemo === null) {
                        state.settings.isDemoMode = false;
                        elements.toggleDemoMode.checked = false;
                    }
                    
                    const label = document.querySelector(".toggle-main-label");
                    if (label) {
                        label.innerHTML = 'Simulation Mode (Demo Mode) <span class="badge-success" style="font-size:0.75rem; vertical-align:middle; margin-left:0.5rem; background:rgba(16,185,129,0.15)">Server .env Key Loaded</span>';
                    }
                    
                    elements.settingGasUrl.placeholder = "Server .env Config Active";
                    elements.settingAnthropicKey.placeholder = "Server .env Config Active";
                    elements.settingGasUrl.disabled = true;
                    elements.settingAnthropicKey.disabled = true;
                    
                    updateConnectionUI();
                }
            }
        } catch (e) {
            console.log("Not running on local Python proxy server, default to browser client configuration.");
        }
    }

    function updateConnectionUI() {
        const badge = elements.connectionBadge;
        const text = badge.querySelector(".badge-text");
        
        if (state.settings.isDemoMode) {
            badge.className = "mode-badge demo-active";
            text.textContent = "Demo Mode";
            elements.liveSettingsFields.classList.add("disabled");
        } else {
            badge.className = "mode-badge live-active";
            if (state.serverLive) {
                text.textContent = "Live Server Mode";
            } else {
                text.textContent = "Live Mode";
            }
            elements.liveSettingsFields.classList.remove("disabled");
        }
    }

    function linkInputAndSlider(inputEl, sliderEl, callback) {
        inputEl.addEventListener("input", (e) => {
            sliderEl.value = e.target.value;
            if (callback) callback();
        });
        sliderEl.addEventListener("input", (e) => {
            inputEl.value = e.target.value;
            if (callback) callback();
        });
    }

    // --- Settings Modal Events ---
    elements.btnOpenSettings.addEventListener("click", () => {
        elements.settingsModal.classList.remove("hidden");
    });

    const closeModal = () => elements.settingsModal.classList.add("hidden");
    elements.btnCloseSettings.addEventListener("click", closeModal);
    elements.btnCancelSettings.addEventListener("click", closeModal);

    elements.toggleDemoMode.addEventListener("change", (e) => {
        if (e.target.checked) {
            elements.liveSettingsFields.classList.add("disabled");
        } else {
            elements.liveSettingsFields.classList.remove("disabled");
        }
    });

    elements.btnSaveSettings.addEventListener("click", () => {
        state.settings.isDemoMode = elements.toggleDemoMode.checked;
        state.settings.gasUrl = elements.settingGasUrl.value.trim();
        state.settings.anthropicApiKey = elements.settingAnthropicKey.value.trim();

        // Save to localStorage
        localStorage.setItem("finwise_demo_mode", state.settings.isDemoMode);
        localStorage.setItem("finwise_gas_url", state.settings.gasUrl);
        localStorage.setItem("finwise_anthropic_key", state.settings.anthropicApiKey);

        updateConnectionUI();
        closeModal();
    });

    // --- Deterministic Loan Eligibility Check ---
    elements.eligibilityForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        // Grab values
        state.salary = parseFloat(elements.salaryInput.value) || 0;
        state.creditScore = parseInt(elements.creditInput.value) || 300;
        state.existingEmi = parseFloat(elements.emiInput.value) || 0;
        state.requestedAmount = parseFloat(elements.loanAmountInput.value) || 0;
        state.requestedTenure = parseInt(elements.loanTenureInput.value) || 60;

        // Perform calculation
        evaluateEligibility();
    });

    function evaluateEligibility() {
        // Risk levels and max DTI limits based on Credit Score bands
        let risk = "High Risk";
        let dtiLimit = 0.0;
        let rate = 10.5; // Default rate

        if (state.creditScore >= 750) {
            risk = "Low Risk";
            dtiLimit = 0.50;  // Can spend up to 50% of income on debt
            rate = 9.5;      // Lower rate for excellent credit
        } else if (state.creditScore >= 650) {
            risk = "Medium Risk";
            dtiLimit = 0.40;  // Up to 40% of income
            rate = 10.5;     // Standard rate
        } else if (state.creditScore >= 600) {
            risk = "High Risk";
            dtiLimit = 0.30;  // Up to 30% of income
            rate = 12.0;     // Higher rate due to risk
        } else {
            // Rejected immediately if score < 600
            risk = "High Risk";
            dtiLimit = 0.0;
            rate = 14.0;
        }

        // Determine existing DTI ratio
        const existingDtiRatio = (state.existingEmi / state.salary) * 100;
        
        // Maximum allowed monthly EMI contribution for a new loan
        const maxAllowedEmi = Math.max(0, (state.salary * dtiLimit) - state.existingEmi);

        // Solve for maximum principal loan amount given maxAllowedEmi, interest rate, and tenure
        // Formula: P = EMI * [(1 + R)^N - 1] / [R * (1 + R)^N]
        const monthlyRate = (rate / 12) / 100;
        const tenureMonths = state.requestedTenure;
        let maxPrincipal = 0;

        if (maxAllowedEmi > 0 && monthlyRate > 0) {
            const compoundFactor = Math.pow(1 + monthlyRate, tenureMonths);
            maxPrincipal = maxAllowedEmi * (compoundFactor - 1) / (monthlyRate * compoundFactor);
            // Cap the loan at 50 times the monthly salary to avoid absurd leverage
            maxPrincipal = Math.min(maxPrincipal, state.salary * 50);
        }

        // Calculate actual EMI for requested loan amount
        const requestedEmi = calculateEmi(state.requestedAmount, rate, tenureMonths);
        const totalProjectedEmi = state.existingEmi + requestedEmi;
        const projectedDtiRatio = (totalProjectedEmi / state.salary) * 100;

        // Eligibility Decision logic
        let decision = "Approved";
        let reason = "";

        if (state.creditScore < 600) {
            decision = "Rejected";
            reason = "Credit score is below the minimum threshold (600).";
        } else if (state.existingEmi >= (state.salary * dtiLimit)) {
            decision = "Rejected";
            reason = "Existing EMI obligations consume too much of your monthly income.";
        } else if (state.requestedAmount > maxPrincipal) {
            // Approved but with a capped eligible amount
            decision = "Approved (Capped)";
            reason = `Requested ₹${state.requestedAmount.toLocaleString()} exceeds eligible capacity. Approved up to ₹${Math.round(maxPrincipal).toLocaleString()}.`;
        }

        // Save calculated variables to state
        state.riskLevel = risk;
        state.decision = decision;
        state.suggestedRate = rate;
        state.dtiRatio = projectedDtiRatio;
        state.eligibleAmount = decision === "Rejected" ? 0 : Math.round(maxPrincipal);
        state.calculatedEmi = decision === "Rejected" ? 0 : Math.round(requestedEmi);

        // Update UI
        renderEligibilityResults(reason);
    }

    function calculateEmi(principal, annualRate, tenureMonths) {
        if (principal <= 0 || annualRate <= 0 || tenureMonths <= 0) return 0;
        const r = (annualRate / 12) / 100;
        const compoundFactor = Math.pow(1 + r, tenureMonths);
        return principal * r * compoundFactor / (compoundFactor - 1);
    }

    function renderEligibilityResults(reasonText) {
        // Toggle elements
        elements.eligPlaceholder.classList.add("hidden");
        elements.eligResults.classList.remove("hidden");

        // Format and render
        elements.resEligibleAmount.textContent = formatCurrency(state.eligibleAmount);
        elements.resDtiRatio.textContent = state.dtiRatio.toFixed(1) + "%";
        elements.resInterestRate.textContent = state.suggestedRate + "%";
        elements.resEstEmi.textContent = formatCurrency(state.calculatedEmi);

        // Decision Badge
        const statusBadge = elements.eligStatusBadge;
        const statusText = elements.eligStatusText;

        statusBadge.className = "result-badge";
        if (state.decision.startsWith("Approved")) {
            statusBadge.classList.add("approved");
            statusText.textContent = state.decision;
            statusBadge.querySelector("i").className = "fa-solid fa-circle-check";
        } else {
            statusBadge.classList.add("rejected");
            statusText.textContent = state.decision;
            statusBadge.querySelector("i").className = "fa-solid fa-circle-xmark";
        }

        // Risk Profile Badge
        const riskLevelEl = elements.resRiskLevel;
        riskLevelEl.textContent = state.riskLevel;
        riskLevelEl.className = "info-value risk-badge";
        
        if (state.decision === "Rejected") {
            riskLevelEl.classList.add("badge-high");
        } else if (state.riskLevel === "Low Risk") {
            riskLevelEl.classList.add("badge-low");
        } else if (state.riskLevel === "Medium Risk") {
            riskLevelEl.classList.add("badge-medium");
        } else {
            riskLevelEl.classList.add("badge-high");
        }

        // Add details if there is a warning/cap/rejection reason
        let detailDiv = document.getElementById("eligibility-reason");
        if (!detailDiv) {
            detailDiv = document.createElement("div");
            detailDiv.id = "eligibility-reason";
            detailDiv.style.fontSize = "0.85rem";
            detailDiv.style.lineHeight = "1.4";
            detailDiv.style.marginTop = "0.5rem";
            detailDiv.style.color = "var(--text-secondary)";
            elements.eligResults.insertBefore(detailDiv, elements.eligResults.querySelector(".result-actions"));
        }
        detailDiv.textContent = reasonText || "Your profile matches all eligibility criteria for the requested amount.";
    }

    // --- Action Buttons from Eligibility Result ---
    elements.actionEmiBtn.addEventListener("click", () => {
        // Send inputs to EMI panel
        elements.emiPrincipalInput.value = state.eligibleAmount > 0 ? state.eligibleAmount : state.requestedAmount;
        elements.emiPrincipalSlider.value = elements.emiPrincipalInput.value;
        elements.emiRateInput.value = state.suggestedRate;
        elements.emiRateSlider.value = state.suggestedRate;
        elements.emiTenureInput.value = state.requestedTenure;
        elements.emiTenureSlider.value = state.requestedTenure;

        calculateEMIPanel();
        switchTab("tab-emi");
    });

    elements.actionImproveBtn.addEventListener("click", () => {
        switchTab("tab-credit");
    });

    // --- Credit Score Analyzer Logic ---
    function updateCreditGauge(score) {
        // Validate score
        score = Math.max(300, Math.min(900, score));
        elements.gaugeScoreVal.textContent = score;

        // Map 300-900 to 0-100% progress
        const percent = (score - 300) / 600;
        
        // Gauge perimeter of circle is roughly 251.3
        // dashoffset range: 251.3 (empty) to 0 (full)
        const offset = 251.3 - (percent * 251.3);
        elements.gaugeFill.style.strokeDashoffset = offset;

        // Band Details & Checklist
        let tier = "Poor";
        let tierDesc = "";
        let tipsHtml = "";

        if (score >= 750) {
            tier = "Excellent";
            tierDesc = `Your score of <strong>${score}</strong> is outstanding. You will easily secure premium loan rates (around 9.5%) and high credit limit approvals.`;
            tipsHtml = `
                <li><i class="fa-solid fa-circle-check check-checked"></i> Pay bills on time to maintain record (35% impact).</li>
                <li><i class="fa-solid fa-circle-check check-checked"></i> Maintain credit usage below 10% for optimal rating.</li>
                <li><i class="fa-solid fa-circle-check check-checked"></i> Periodically request card limit increases (keeps utilization low).</li>
            `;
        } else if (score >= 650) {
            tier = "Good";
            tierDesc = `Your score of <strong>${score}</strong> is healthy. You qualify for standard loans (approx 10.5% rate). Elevate it past 750 for premium perks.`;
            tipsHtml = `
                <li><i class="fa-solid fa-circle-check check-checked"></i> Consolidate any scattered short-term card debts.</li>
                <li><i class="fa-solid fa-circle-check check-checked"></i> Reduce total utilization ratio to under 30%.</li>
                <li><i class="fa-solid fa-circle-xmark check-unchecked"></i> Avoid opening new accounts in quick succession.</li>
            `;
        } else if (score >= 600) {
            tier = "Fair";
            tierDesc = `Your score of <strong>${score}</strong> is below average. Loan approval is subject to higher risk ratings (12% interest) and lower caps.`;
            tipsHtml = `
                <li><i class="fa-solid fa-circle-exclamation check-warning" style="color: var(--accent-amber);"></i> Pay off outstanding interest overdues immediately.</li>
                <li><i class="fa-solid fa-circle-xmark check-unchecked"></i> Do not apply for any new credit accounts for 6 months.</li>
                <li><i class="fa-solid fa-circle-check check-checked"></i> Maintain older lines of credit to preserve history length.</li>
            `;
        } else {
            tier = "Poor";
            tierDesc = `Your credit score is <strong>${score}</strong>. Loans will be instantly rejected. Prioritize active debt repair and credit building.`;
            tipsHtml = `
                <li><i class="fa-solid fa-circle-xmark check-unchecked"></i> Clear all outstanding default status accounts instantly.</li>
                <li><i class="fa-solid fa-circle-info check-checked"></i> Secure a collateralized/secured credit card to start reporting clean payments.</li>
                <li><i class="fa-solid fa-circle-check check-checked"></i> Review credit history statements for potential dispute errors.</li>
            `;
        }

        elements.gaugeTierVal.textContent = tier;
        
        // Add color classes to gauge label
        elements.gaugeTierVal.className = "gauge-label";
        if (tier === "Excellent") elements.gaugeTierVal.style.color = "var(--accent-green)";
        else if (tier === "Good") elements.gaugeTierVal.style.color = "var(--text-accent)";
        else if (tier === "Fair") elements.gaugeTierVal.style.color = "var(--accent-amber)";
        else elements.gaugeTierVal.style.color = "var(--accent-red)";

        elements.creditTierDesc.innerHTML = tierDesc;
        elements.creditTipsList.innerHTML = tipsHtml;
    }

    elements.btnUpdateGauge.addEventListener("click", () => {
        const val = parseInt(elements.creditAnalyzerScore.value);
        if (val >= 300 && val <= 900) {
            state.creditScore = val;
            updateCreditGauge(val);
            // Update eligibility checker input sync
            elements.creditInput.value = val;
            elements.creditSlider.value = val;
        } else {
            alert("Please enter a valid credit score between 300 and 900.");
        }
    });

    elements.btnCreditToTips.addEventListener("click", () => {
        switchTab("tab-tips");
    });

    // --- EMI Calculator Math ---
    function calculateEMIPanel() {
        const principal = parseFloat(elements.emiPrincipalInput.value) || 0;
        const annualRate = parseFloat(elements.emiRateInput.value) || 0;
        const tenureMonths = parseInt(elements.emiTenureInput.value) || 0;

        const emi = calculateEmi(principal, annualRate, tenureMonths);
        const totalRepay = emi * tenureMonths;
        const totalInterest = Math.max(0, totalRepay - principal);

        // Update display text
        elements.resEmiVal.textContent = formatCurrency(emi);
        elements.resEmiPrincipal.textContent = formatCurrency(principal);
        elements.resEmiInterest.textContent = formatCurrency(totalInterest);
        elements.resEmiTotal.textContent = formatCurrency(totalRepay);

        // Update ratios
        let pRatio = 100;
        let iRatio = 0;
        if (totalRepay > 0) {
            pRatio = (principal / totalRepay) * 100;
            iRatio = (totalInterest / totalRepay) * 100;
        }

        elements.barPrincipal.style.width = pRatio.toFixed(1) + "%";
        elements.barInterest.style.width = iRatio.toFixed(1) + "%";
        
        elements.lblRatioPrincipal.textContent = `Principal: ${pRatio.toFixed(1)}%`;
        elements.lblRatioInterest.textContent = `Interest: ${iRatio.toFixed(1)}%`;
    }

    // --- AI Financial Tips Generator ---
    elements.btnGenerateAiTips.addEventListener("click", generateAiTips);
    elements.btnReEvaluate.addEventListener("click", () => {
        switchTab("tab-eligibility");
    });

    elements.quickTipsBtn.addEventListener("click", () => {
        switchTab("tab-tips");
        generateAiTips();
    });

    async function generateAiTips() {
        // Toggle view states
        elements.tipsPlaceholder.classList.add("hidden");
        elements.tipsReportContent.classList.add("hidden");
        elements.tipsLoading.classList.remove("hidden");

        const payload = {
            salary: state.salary,
            creditScore: state.creditScore,
            existingEmi: state.existingEmi,
            requestedAmount: state.requestedAmount,
            requestedTenure: state.requestedTenure,
            decision: state.decision,
            riskLevel: state.riskLevel,
            calculatedEmi: state.calculatedEmi,
            generateAiAdvice: true,
            anthropicApiKey: state.settings.anthropicApiKey
        };

        if (state.settings.isDemoMode) {
            // Simulated Delay
            setTimeout(() => {
                const tips = getSimulatedAiAdvice(payload);
                state.aiAdvice = tips;
                renderAiTips(tips);
            }, 1800);
        } else {
            // Live Server Call
            let fetchUrl = state.settings.gasUrl;
            let headers = { "Content-Type": "text/plain" };
            let mode = "cors";

            if (state.serverLive) {
                fetchUrl = "/api/advisory";
                headers = { "Content-Type": "application/json" };
                mode = "same-origin";
            } else if (!state.settings.gasUrl) {
                alert("Please configure your Google Apps Script URL in settings to use Live Mode.");
                elements.tipsLoading.classList.add("hidden");
                elements.tipsPlaceholder.classList.remove("hidden");
                elements.settingsModal.classList.remove("hidden");
                return;
            }

            try {
                const response = await fetch(fetchUrl, {
                    method: "POST",
                    mode: mode,
                    headers: headers,
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP network error: status ${response.status}`);
                }

                const result = await response.json();
                if (result.status === "success") {
                    const tips = result.aiAdvice || "Logged details successfully but no AI advice was generated. Ensure your Anthropic Key is filled.";
                    state.aiAdvice = tips;
                    renderAiTips(tips);
                } else {
                    throw new Error(result.message || "Unknown server error logging data");
                }

            } catch (err) {
                alert("Live API Error: " + err.message + "\nFalling back to simulated tips.");
                console.error("Live integration failure:", err);
                const tips = getSimulatedAiAdvice(payload);
                state.aiAdvice = tips;
                renderAiTips(tips);
            }
        }
    }

    function renderAiTips(markdownText) {
        elements.tipsLoading.classList.add("hidden");
        elements.tipsReportContent.classList.remove("hidden");
        elements.reportDate.textContent = new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        // Simple Markdown compiler helper
        elements.tipsMarkdownBody.innerHTML = compileSimpleMarkdown(markdownText);
    }

    // A lightweight simple markdown parser to keep the client independent
    function compileSimpleMarkdown(md) {
        let html = md;
        
        // Headings: ### Title
        html = html.replace(/^### (.*?)$/gm, "<h3>$1</h3>");
        // Bold: **text**
        html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        // Bullet lists: - item
        html = html.replace(/^- (.*?)$/gm, "<li>$1</li>");
        // Wrap adjacent li tags in ul
        html = html.replace(/(<li>.*?<\/li>)/gs, (match) => `<ul>${match}</ul>`);
        // Clean double ul wrappers
        html = html.replace(/<\/ul>\s*<ul>/g, "");
        // Blockquotes: > text
        html = html.replace(/^> (.*?)$/gm, "<blockquote>$1</blockquote>");
        // Paragraphs: double carriage returns
        html = html.split(/\n\n+/).map(p => {
            if (p.trim().startsWith("<h3") || p.trim().startsWith("<ul") || p.trim().startsWith("<bq") || p.trim().startsWith("<blockquote>")) {
                return p;
            }
            return `<p>${p.replace(/\n/g, "<br>")}</p>`;
        }).join("");

        return html;
    }

    // --- Mock Engine: Heuristic Simulated Advice Generator ---
    function getSimulatedAiAdvice(data) {
        const approvalText = data.decision.startsWith("Approved") 
            ? "Your loan calculation has been **Approved**. You possess low risk profile markers."
            : "Your loan evaluation has been **Rejected**. Actionable credit repair procedures should be activated.";
        
        let customGuidance = "";

        if (data.decision.startsWith("Approved")) {
            customGuidance = `
### Financial Strength Analysis
- **Excellent Leverage**: Your Debt-to-Income (DTI) ratio is **${data.dtiRatio.toFixed(1)}%**, which sits comfortably below banking guidelines of 40%. This leaves a safety cushion for emergency savings.
- **Accrued Savings**: By opting for a suggested rate of **${data.suggestedRate}%**, you save substantial funds compared to subprime borrowing.

### Recommended Action Plan
- **Repayment Optimization**: Since your profile is low-risk, consider making pre-payments on your principal loan amount annually. This can reduce tenure by up to 12 months.
- **Credit Lock**: Avoid closing older credit accounts, as their history length protects your high score. Keep credit card use between 10% and 30%.
            `;
        } else {
            customGuidance = `
### Risk Profile Analysis
- **Debt Burden Warnings**: Your DTI is currently capped at **${data.dtiRatio.toFixed(1)}%**. A DTI exceeding 40% represents critical financial stress. Banks reject files with high ratios because any drop in salary could trigger defaults.
- **Credit Score Deficit**: A score of **${data.creditScore}** classifies you in subprime risk bands. Boosting your score past 650 will reverse your eligibility status.

### Credit Score Repair Steps
- **Bill Automation**: Late payments are penalizing your records heavily. Set up auto-debits for all active EMI cycles.
- **De-leverage**: Commit ₹5,000 extra per month to clear outstanding unsecured cards. This reduces credit utilization ratio instantly.
- **Secured Card Utility**: If you cannot qualify for standard cards, buy a secured card backed by a Fixed Deposit. Paying small bills on this builds positive monthly report histories.
            `;
        }

        return `### personalized Financial Report Summary

> Disclaimer: This report contains automated advisory insights based on your inputs. Consult a certified financial advisor before making binding obligations.

${approvalText}

${customGuidance}

### Strategic Recommendations
- **Debt Consolidation**: If you have multiple active loans, combine them under a single low-interest credit line.
- **Emergency Reserve**: Build a buffer equivalent to 6 months of EMIs + basic household costs before signing final agreements.
        `;
    }

    // --- PDF / Document Download Feature ---
    elements.btnDownloadPdf.addEventListener("click", () => {
        // Compile a clean text-based report for download
        const separator = "==================================================";
        const textReport = `
FINWISE AI - PERSONAL FINANCIAL ADVISOR REPORT
${separator}
Generated on: ${new Date().toLocaleDateString("en-IN")}
User Profile:
- Monthly Salary: INR ${state.salary.toLocaleString("en-IN")}
- Credit Score: ${state.creditScore}
- Running EMIs: INR ${state.existingEmi.toLocaleString("en-IN")}
- Decision: ${state.decision}
- Risk Level: ${state.riskLevel}
- Proposed EMI: INR ${state.calculatedEmi.toLocaleString("en-IN")}
${separator}

ADVISORY TEXT REPORT:
${state.aiAdvice.replace(/###/g, "").replace(/\*\*/g, "")}

${separator}
Note: This document was compiled securely. For advice updates, visit your FinWise AI portal.
`;

        const blob = new Blob([textReport], { type: "text/plain;charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `FinWise_AI_Financial_Report_${Date.now()}.txt`;
        link.click();
        URL.revokeObjectURL(link.href);
    });

    // Run Initial Setup
    init();
});
