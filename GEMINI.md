# GEMINI.md - Project Instructions

Welcome to the **Financial Portfolio** project. This document serves as the primary instructional context for the Gemini CLI agent.

---

## 🚀 Project Overview

**Financial Portfolio** is a local-first web application designed for tracking personal assets across multiple platforms and currencies. It features a modern dashboard with real-time data persistence via Google Sheets.

### 🛠️ Core Tech Stack
- **Frontend:** HTML5, Modern CSS3 (Grid/Flexbox), Vanilla JavaScript (ES6+).
- **Charts:** Chart.js (CDN).
- **Backend:** Google Apps Script (GAS) acting as a JSON API.
- **Database:** Google Sheets.
- **Security:** Built-in "Incognito Mode" for financial privacy.

---

## 🛠️ Building and Running

### Prerequisites
- A modern web browser.
- A Google account (for the Google Sheets/GAS backend).

### Setup & Installation
1.  **Repository:**
    - Clone the repository: `git clone https://github.com/nutsuphakit/app-fin-portfolio.git`
2.  **Backend:**
    - Create a Google Sheet with `Current_Portfolio` and `Transaction_Logs` tabs.
    - Deploy the code in `Code.gs` as a Web App (Access: Anyone).
3.  **Frontend:**
    - Paste your Web App URL into `docs/app.js` (line 3).
    - Open `docs/index.html` locally.

### Testing
- Open `tests.html` in your browser to run the comprehensive unit test suite for the `PortfolioLogic` module.

---

## 📏 Development Conventions

### Architecture
- **Separation of Concerns:** Business logic is isolated in `portfolio-logic.js`, while UI orchestration is handled in `app.js`.
- **Pure Functions:** Calculations and formatting logic must remain pure for testability.
- **TDD First:** New logic should be added to the `tests.js` suite and verified in `tests.html`.

### Coding Style
- **Naming:** PascalCase for modules/classes (`PortfolioLogic`), camelCase for variables/functions.
- **Formatting:** Use 4-space indentation and clean, modular code blocks.
- **Privacy First:** Ensure all sensitive data displays respect the `isIncognito` state.

---

## 📝 Roadmap & Current State

- [x] Initial UI/UX Dashboard implementation.
- [x] Chart.js integration with dynamic grouping.
- [x] Google Apps Script backend with multi-currency support (Note: Current frontend uses XML LocalStorage for offline-first resilience).
- [x] Unit test suite with 100% pass rate (Verified via TDD).
- [x] Dark/Light theme and Incognito mode toggles.
- [x] AI Portfolio Review prompt generation.
- [x] XML Data Export.
- [ ] Add support for manual exchange rate overrides.
- [ ] Implement historical data export (CSV).

---

## 🔄 Updating GEMINI.md

Update this file whenever:
- New core features are added to the roadmap.
- The project architecture or tech stack changes.
- New development conventions are established.
