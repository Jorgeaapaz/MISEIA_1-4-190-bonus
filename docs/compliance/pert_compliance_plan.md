# PERT Compliance Plan — BondVault

**Date:** 2026-06-27  
**Project:** BondVault — 1-4-190-bonus  
**Student:** jorgeaapaz@hotmail.com

---

## PERT Compliance Plan

Logical ordered path to fix all non-compliant issues. Tasks are sequenced by dependency: documentation can be done independently; pages/API must precede tests; tests must precede CI/CD; CI/CD plus Dockerfile precede production deploy.

### Path A — Documentation (independent, can start immediately)
- **A1** → `005_env_example_docs_fn_prompt.md` — Create `.env.example`, add architecture diagram, trade-off decisions, AI documentation, and test/deploy commands to README
  - *No dependencies*

### Path B — Core Implementation (critical path)
- **B1** → `001_missing_pages_api_fn_prompt.md` — Implement all missing pages and API routes (9 admin/investor pages + 9 API routes + auth verify page)
  - *Dependency: None — but all subsequent tasks depend on this*

- **B2** → `002_tests_jest_playwright_fn_prompt.md` — Configure Jest + Playwright and write tests
  - *Dependency: B1 (pages and API routes must exist to test them)*

### Path C — Infrastructure / CI/CD (depends on B2)
- **C1** → `003_cicd_github_actions_fn_prompt.md` — Create Dockerfile, GitHub Actions workflow, configure secrets, deploy to GCP VM
  - *Dependency: B2 (tests must pass before CI/CD runs them)*
  - *Note: Also creates `Dockerfile` and `env.production` needed by C2*

- **C2** → `004_cicd_gitlab_fn_prompt.md` — Create `.gitlab-ci.yml`, configure GitLab variables
  - *Dependency: C1 (Dockerfile must exist; `env.production` must be created)*

### Critical Path
**B1 → B2 → C1 → C2** (with A1 in parallel from day 1)

---

## Execution PERT

| # | Task | Prompt File | Depends On | Estimated Effort | Priority |
|---|---|---|---|---|---|
| 1 | Create `.env.example`, architecture diagram, decisions doc, AI doc, README updates | `005_env_example_docs_fn_prompt.md` | — | 1h | MEDIUM |
| 2 | Implement all missing pages (admin + investor) and API routes | `001_missing_pages_api_fn_prompt.md` | — | 8h | HIGH |
| 3 | Configure Jest + Playwright, write unit and E2E tests | `002_tests_jest_playwright_fn_prompt.md` | Task 2 | 4h | HIGH |
| 4 | Create Dockerfile, GitHub Actions CI/CD, configure secrets, deploy to GCP VM | `003_cicd_github_actions_fn_prompt.md` | Task 3 | 3h | HIGH |
| 5 | Create GitLab CI/CD pipeline, configure GitLab variables | `004_cicd_gitlab_fn_prompt.md` | Task 4 | 2h | HIGH |

**Total estimated effort:** ~18 hours  
**Parallel execution:** Tasks 1 and 2 can run in parallel. Tasks 3, 4, 5 are sequential.

---

## Files Generated

| File | Purpose |
|---|---|
| `docs/compliance/compliance_report.md` | Full compliance evaluation report |
| `docs/compliance/pert_compliance_plan.md` | This file — PERT plan |
| `docs/compliance/001_missing_pages_api_fn_prompt.md` | Prompt to implement all missing pages and API routes |
| `docs/compliance/002_tests_jest_playwright_fn_prompt.md` | Prompt to set up Jest and Playwright tests |
| `docs/compliance/003_cicd_github_actions_fn_prompt.md` | Prompt to create GitHub Actions CI/CD and production deploy |
| `docs/compliance/004_cicd_gitlab_fn_prompt.md` | Prompt to create GitLab CI/CD pipeline |
| `docs/compliance/005_env_example_docs_fn_prompt.md` | Prompt to add `.env.example` and complete documentation |
| `env.production` | Production environment variables for GCP VM deploy |
