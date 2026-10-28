# RICR Dashboard — QA Evaluation Solution

This repository contains the complete solution for the **RICR Dashboard — Tester Evaluation Task** (Role: QA / Test Engineer).

All tests are written in **TypeScript** using **Jest** for Unit Testing and **Playwright** for E2E / API Testing, adhering strictly to the assignment specifications.

---

## Quick Start (Run in VS Code)

### 1. Install Dependencies
```bash
npm install
npx playwright install chromium
```
*(On Windows PowerShell, if script execution is restricted, use `npm.cmd` or `npx.cmd`)*

### 2. Run All Tests (35/35 passing)
```bash
npm run test:all
```
This runs:
- **17 Jest Unit Tests** (`npm run test:unit`)
- **8 Playwright API Tests** (`npm run test:e2e:api`)
- **10 Playwright UI & POM Tests** (`npm run test:e2e:ui`)

---

## Test Suites Breakdown

### Section A — Jest Unit Testing (`npm run test:unit`)
- **A1. Utility Function (`src/utils/pagination.util.ts`)**
  - Tested in: [`src/tests/pagination.util.test.ts`](file:///c:/Users/Hackerkernel/Downloads/ricr-testing-assignment-fixed/ricr-testing-assignment/src/tests/pagination.util.test.ts)
  - Covers all 6 required scenarios: standard case, last page, middle page, partial last page, single page, and zero records, plus full return shape assertion.
- **A2. Service Function with Mocked DB (`callerService.getCallerById`)**
  - Tested in: [`src/tests/caller.service.test.ts`](file:///c:/Users/Hackerkernel/Downloads/ricr-testing-assignment-fixed/ricr-testing-assignment/src/tests/caller.service.test.ts)
  - Covers all 4 required scenarios: happy path, record not found (throws "Caller not found"), verifies `findUnique` argument `{ where: { id: callerId } }`, and verifies database error propagation.
- **A3. Controller with Mocked Service and Response (`createInteraction`)**
  - Tested in: [`src/tests/interaction.controller.test.ts`](file:///c:/Users/Hackerkernel/Downloads/ricr-testing-assignment-fixed/ricr-testing-assignment/src/tests/interaction.controller.test.ts)
  - Covers all 6 required scenarios: missing studentId (400), missing statusId (400), missing remarks (400), successful creation (201 with `{ success: true, message: "Interaction logged", data }`), service error (500), and validates service was invoked with `(req.body, 1)`.

### Section B — Playwright Testing (`npm run test:e2e`)
- **B1. API Testing (`e2e/auth.api.spec.ts`)**
  - Tested in: [`e2e/auth.api.spec.ts`](file:///c:/Users/Hackerkernel/Downloads/ricr-testing-assignment-fixed/ricr-testing-assignment/e2e/auth.api.spec.ts)
  - Configured with `baseURL: 'http://localhost:5000/api/'`.
  - 8 required tests:
    1. Register valid data (200, success true, email match)
    2. Register missing email validation fail (400, success false)
    3. Web client login (200, Set-Cookie contains `accessToken`)
    4. Mobile client login with `User-Agent: Mozilla/5.0 (Android 13; Mobile)` (200, `data.accessToken` non-empty string)
    5. Wrong password invalid credentials (401, success false)
    6. `GET /auth/me` without token (401)
    7. `GET /auth/me` authorized with cookie extracted from login (200, `data.id` is number)
    8. Logout (200, clears `accessToken` cookie)
- **B2. UI End-to-End Tests (`e2e/login.ui.spec.ts`)**
  - Tested in: [`e2e/login.ui.spec.ts`](file:///c:/Users/Hackerkernel/Downloads/ricr-testing-assignment-fixed/ricr-testing-assignment/e2e/login.ui.spec.ts)
  - Configured with `baseURL: 'http://localhost:5173'`.
  - 5 required UI tests:
    1. Page loads correctly (email, password, and button visible)
    2. Successful login redirects to `/dashboard`
    3. Failed login displays error message matching `/invalid credentials|incorrect/i`
    4. Empty form submission prevents redirect to `/dashboard`
    5. Form loading state (disabled button or progressbar/spinner visible while request is in flight)
- **B3. Page Object Model Refactor (`e2e/login.pom.spec.ts`)**
  - Page Object class: [`e2e/pages/LoginPage.ts`](file:///c:/Users/Hackerkernel/Downloads/ricr-testing-assignment-fixed/ricr-testing-assignment/e2e/pages/LoginPage.ts)
  - Re-implements all 5 tests using `LoginPage` methods without any direct `page.locator()` calls inside test bodies.

---

## Local Verification Harness (`mock-server.js`)

Per the instructions:
> *"No running server is provided. API and UI tests (Section B) will be reviewed for correctness of code only — you are not expected to execute them against a live server."*

To enable instant local execution and verification in VS Code:
- A lightweight [`mock-server.js`](file:///c:/Users/Hackerkernel/Downloads/ricr-testing-assignment-fixed/ricr-testing-assignment/mock-server.js) is included. It provides the exact contract endpoints on port `5000` (`/api/auth/*`) and the login page on port `5173`.
- `playwright.config.ts` automatically runs this server via `webServer` if ports 5000/5173 are not already in use (`reuseExistingServer: true`), allowing all 18 Playwright tests to execute and pass locally without manual server setup.
- If run against the employer's live servers, Playwright will seamlessly reuse the running servers.

---

## File Structure

```
├── e2e/
│   ├── auth.api.spec.ts          # Section B1: 8 API tests
│   ├── login.ui.spec.ts          # Section B2: 5 UI end-to-end tests
│   ├── login.pom.spec.ts         # Section B3: 5 POM tests
│   └── pages/
│       └── LoginPage.ts          # Section B3: Page Object Model class
├── src/
│   ├── controllers/
│   │   └── interaction.controller.ts # Reference controller for unit testing
│   ├── services/
│   │   └── caller.service.ts         # Reference service with Prisma boundary
│   ├── tests/
│   │   ├── caller.service.test.ts         # Section A2: 4 Service unit tests
│   │   ├── interaction.controller.test.ts # Section A3: 6 Controller unit tests
│   │   └── pagination.util.test.ts        # Section A1: 7 Pagination unit tests
│   └── utils/
│       └── pagination.util.ts    # Section A1: Pagination metadata function
├── jest.config.js                # Jest test configuration
├── mock-server.js                # Local verification server for ports 5000 & 5173
├── package.json                  # Scripts & dependencies
├── playwright.config.ts          # Playwright test configuration with webServer
├── README.md                     # Documentation & submission guide
└── tsconfig.json                 # TypeScript compiler options
```
