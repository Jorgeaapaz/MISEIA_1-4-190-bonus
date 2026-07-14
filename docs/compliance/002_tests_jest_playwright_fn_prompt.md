@~/.claude/prompts/new_functionality_prompt_spec.md

# Implement Jest Unit Tests and Playwright E2E Tests — BondVault

## Role
Act as a Senior QA Engineer and Full-Stack Developer with expertise in Jest, Playwright, Next.js 16, and TypeScript.

## Context
Project root: `D:\Master-IA-Dev\04-Bloque4\1-4-190-bonus\bonus`

The project currently has **zero tests**. No `jest.config.*`, no `playwright.config.*`, no `__tests__/` directories, no `*.test.ts` files. The AGENTS.md requires:
- **Jest**: Unit tests for functions in `lib/` (payment processing, data validation)
- **Playwright**: E2E tests covering registration, login, bond purchase, and other critical flows
- Tests must be runnable with a single command documented in README
- CI requires `npm run test` and `npm run test:e2e`

## Task
1. Install and configure Jest for unit testing `lib/` functions
2. Install and configure Playwright for E2E testing critical user flows
3. Write unit tests for all functions in `lib/payments.ts`, `lib/auth.ts`, and `lib/types.ts` validators
4. Write Playwright E2E tests for: magic link request, JWT verification, bond listing (admin), bond purchase (investor)
5. Add test scripts to `package.json`
6. Document test commands in README

### Jest Setup Guidelines
Install: `jest`, `@types/jest`, `ts-jest`, `jest-environment-node`

Configure `jest.config.ts`:
```ts
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
}
```

**Unit tests to write (`__tests__/lib/`):**
- `payments.test.ts`: Test `schedulePayments()`, coupon calculation logic, payment date generation
- `auth.test.ts`: Test `signToken()`, `verifyToken()`, `generateMagicToken()` — use mocked JWT
- `validation.test.ts`: Test that required fields produce correct errors when missing

**Mock strategy:**
- Mock `lib/db.ts` for pure function tests
- Do NOT mock MongoDB for integration-like tests — use a test database `bonos_test_db`

### Playwright Setup Guidelines
Install: `@playwright/test`, then `npx playwright install chromium`

Configure `playwright.config.ts`:
```ts
export default {
  testDir: './e2e',
  use: { baseURL: 'http://localhost:3000' },
  webServer: { command: 'npm run dev', url: 'http://localhost:3000', reuseExistingServer: true },
}
```

**E2E tests to write (`e2e/`):**
- `auth.spec.ts`: Navigate to /login, submit email, check success message displayed
- `admin-bonds.spec.ts`: Login as admin JWT (inject via localStorage), navigate to /admin/bonds, verify bond list loads
- `investor-screener.spec.ts`: Login as investor JWT, navigate to /investor/screener, apply filter, verify results
- `investor-dashboard.spec.ts`: Login as investor, verify /investor/dashboard shows holdings table

**package.json scripts to add:**
```json
"test": "jest",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage",
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

## Output checklist and Guardrails
- [ ] `jest.config.ts` created and working
- [ ] `playwright.config.ts` created and working
- [ ] At least 5 Jest unit tests covering `lib/payments.ts` and `lib/auth.ts`
- [ ] At least 4 Playwright E2E tests covering auth and main investor/admin flows
- [ ] `npm run test` passes
- [ ] `npm run test:e2e` runs (may require app running)
- [ ] Coverage report accessible via `npm run test:coverage`
- [ ] README updated with test commands
- [ ] No secrets or real credentials in test files
