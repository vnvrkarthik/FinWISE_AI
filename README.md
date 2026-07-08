# Product Requirements Document (PRD)
## FinWise AI: Intelligent Loan Eligibility, Credit Analysis & Financial Advisory Platform

---

## 1. Document Information

| Field | Detail |
|---|---|
| Product Name | FinWise AI |
| Category | BFSI (Banking, Financial Services & Insurance) |
| Document Type | Product Requirements Document |
| Status | Draft v1.0 |
| Prepared For | Development & Mentor Review |

---

## 2. Executive Summary

FinWise AI is an AI-powered BFSI web platform that simplifies personal financial decision-making by combining four core tools — **Loan Eligibility Checker**, **Credit Score Analyzer**, **EMI Calculator**, and **AI Financial Tips** — into a single, seamless interface. The platform uses Claude AI for intelligent reasoning and financial guidance, a dark glassmorphism UI for a modern user experience, and Google Sheets as a lightweight, transparent backend for storing user data across sessions.

The goal is to give everyday users instant, data-driven clarity on their loan eligibility, credit health, repayment obligations, and financial improvement paths — without needing a bank visit or financial advisor.

---

## 3. Problem Statement

Individuals seeking loans or trying to improve their financial standing often face:
- Lack of instant, transparent tools to check loan eligibility before formally applying.
- Limited understanding of how credit scores affect approval odds.
- Difficulty calculating accurate EMI outflows before committing to a loan.
- No accessible, personalized guidance on how to improve their financial/credit profile.

Traditional BFSI tools are fragmented across different bank portals, financial apps, or manual calculators, creating friction, confusion, and delayed decision-making.

---

## 4. Product Goals & Objectives

- Provide an **instant, single-window** experience for loan eligibility, credit analysis, EMI planning, and financial advisory.
- Use **AI reasoning (Claude AI)** to generate personalized, context-aware financial insights rather than static rule-based outputs.
- Ensure **transparency and persistence** of user data using Google Sheets integration.
- Deliver a **modern, trustworthy UI** (dark glassmorphism) that reflects a fintech-grade experience.
- Reduce user drop-off by guiding rejected/high-risk applicants toward actionable next steps (e.g., Credit Analyzer, Financial Tips).

---

## 5. Target Users

| Persona | Description |
|---|---|
| Salaried Individuals | Employees checking loan eligibility based on stable income. |
| Self-employed/Variable Income Users | Users needing EMI planning before committing to a loan. |
| Credit-Conscious Users | Individuals wanting to understand and improve their credit score. |
| First-time Loan Applicants | Users unfamiliar with eligibility criteria or EMI mechanics. |

---

## 6. User Scenarios (from provided use cases)

**Scenario 1 — Salaried Individual (Low Risk Approval)**
Salary: ₹45,000/month, Credit Score: 730, No existing EMI → System approves instantly, eligible loan amount ₹9,00,000, risk classified as **Low**.

**Scenario 2 — High-Risk Applicant (Rejection)**
Salary: ₹22,000, Credit Score: 620, Existing EMI: ₹18,000 → System rejects application, risk classified as **High**, user redirected to Credit Score Analyzer for improvement guidance.

**Scenario 3 — EMI Planning**
Loan: ₹5,00,000 at 10.5% interest for 60 months → User calculates exact monthly EMI outflow before applying.

**Scenario 4 — Credit Improvement Journey**
Credit Score: 580 → Classified as **Poor**, system gives actionable recommendations; user proceeds to AI Financial Tips for structured improvement guidance.

---

## 7. Core Features & Functional Requirements

### 7.1 Loan Eligibility Checker
- Input fields: Monthly salary, credit score, existing EMI obligations, (optionally: loan amount requested, tenure).
- System computes eligibility using salary-to-EMI ratio, credit score thresholds, and existing debt burden.
- Output: Approve/Reject decision, eligible loan amount (if approved), and a Risk Classification (**Low / Medium / High**).
- On rejection, system must prompt the user toward the Credit Score Analyzer.

### 7.2 Credit Score Analyzer
- Input: Credit score (manual entry or computed from financial inputs).
- Classification bands (example): Poor (<600), Fair (600–649), Good (650–749), Excellent (750+) — exact bands to be finalized with mentor/stakeholder input.
- Output: Score classification + AI-generated, actionable improvement recommendations.

### 7.3 EMI Calculator
- Inputs: Loan amount, interest rate (%), tenure (months).
- Uses standard EMI formula: `EMI = [P x R x (1+R)^N] / [(1+R)^N - 1]`
- Output: Monthly EMI amount, total interest payable, total repayment amount.
- Should support quick recalculation as inputs change (real-time or on-submit).

### 7.4 AI Financial Tips (Claude AI Integration)
- Provides personalized financial advice based on user's eligibility/credit results.
- Uses Claude AI's generative reasoning to produce structured, actionable tips (not generic static text).
- Should contextually link back to Credit Score Analyzer / Loan Eligibility results where relevant.

### 7.5 Data Persistence (Google Sheets Integration)
- All user submissions (inputs + results) are logged to Google Sheets via API integration.
- Ensures transparency (auditable record) and session continuity.
- Data written should include: timestamp, salary, credit score, existing EMI, decision, risk level, loan amount, and AI tips generated (where applicable).

---

## 8. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Eligibility/EMI results should return in near real-time (<2–3 seconds including AI response). |
| Usability | Single-page, intuitive flow between all four tools without page reloads where possible. |
| Design | Dark glassmorphism aesthetic — frosted-glass cards, subtle blur, soft shadows, smooth CSS animations/transitions. |
| Responsiveness | Fully responsive across desktop, tablet, and mobile viewports. |
| Reliability | Google Sheets write operations must handle failures gracefully (retry/error messaging). |
| Data Privacy | User financial data must be handled with care; avoid exposing sensitive data in client-side logs or console. |
| Maintainability | Modular JS codebase separating UI logic, calculation logic, and API integration logic. |

---

## 9. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3 (animations, glassmorphism styling), JavaScript |
| AI Layer | Claude AI (Generative AI reasoning for tips & analysis) |
| Backend/Data Storage | Google Sheets (via REST API / Apps Script integration) |
| Data Exchange Format | JSON |
| Version Control | Git |
| Scripting/Automation (optional) | Python (for backend utilities, data processing, or API scripting where applicable) |

---

## 10. High-Level Architecture Flow

1. **User Interface (HTML/CSS/JS)** → captures inputs for one of the four tools.
2. **Client-side Logic (JavaScript)** → performs deterministic calculations (EMI, eligibility rules, score banding).
3. **Claude AI API Call (REST/JSON)** → sends relevant context (score, salary, decision) to generate personalized tips/recommendations.
4. **Google Sheets API** → logs the transaction (inputs + outputs) for persistence and transparency.
5. **UI Rendering** → displays decision, risk classification, EMI breakdown, and AI-generated advice back to the user.

---

## 11. Success Metrics

- Accuracy and consistency of eligibility decisions against defined business rules.
- Average AI response time for Financial Tips generation.
- Successful data write rate to Google Sheets (target: >99%).
- User flow completion rate (e.g., % of rejected users who proceed to Credit Analyzer or Financial Tips).
- Qualitative feedback on UI/UX (glassmorphism design, ease of navigation).

---

## 12. Assumptions & Constraints

- Credit score is either user-input or derived from a simplified internal model (not a live CIBIL/Experian integration).
- Eligibility and risk rules are rule-based (deterministic), while advisory content is AI-generated.
- Google Sheets is used as an MVP-stage data store; not intended to replace a production-grade database at scale.
- Claude AI API usage is subject to rate limits and requires an active API key/credentials.

---

## 13. Out of Scope (for current version)

- Real-time integration with actual credit bureaus (CIBIL, Experian, etc.).
- User authentication/login system (unless explicitly required later).
- Multi-currency or international loan/interest regulations.
- Mobile native app (iOS/Android) — web-only for this version.

---

## 14. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| AI-generated financial advice may be generic or inconsistent | Use well-structured prompts with context (score, salary, decision) fed into Claude AI calls; add disclaimers that this is not certified financial advice. |
| Google Sheets API rate limits/downtime | Implement retry logic and local fallback/error messaging. |
| Sensitive financial data exposure | Avoid storing raw sensitive data unnecessarily; use HTTPS for all API calls. |
| Inconsistent eligibility logic vs. AI advice | Keep eligibility/risk decisions rule-based and deterministic; use AI only for advisory/explanatory content. |

---

## 15. Future Enhancements (Roadmap Ideas)

- Integration with real credit bureau APIs for live credit scores.
- User authentication and personalized dashboards with historical trend tracking.
- Loan comparison across multiple lenders/interest rates.
- Voice-based financial assistant using Claude AI.
- Migration from Google Sheets to a scalable database (e.g., Firebase, PostgreSQL) for production use.

---

## 16. Required Skills (Development)

- HTML5, CSS3 (Animations), JavaScript
- Python (for backend scripting/utilities)
- Generative AI integration (Claude AI)
- REST API consumption & integration
- JSON data handling
- Git for version control
