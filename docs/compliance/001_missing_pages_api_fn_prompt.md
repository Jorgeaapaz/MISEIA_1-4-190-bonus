@~/.claude/prompts/new_functionality_prompt_spec.md

# Implement All Missing Pages and API Routes — BondVault

## Role
Act as a Senior Full-Stack Developer with expertise in Next.js 16 (App Router), TypeScript, MongoDB, and React 19.

## Context
Project root: `D:\Master-IA-Dev\04-Bloque4\1-4-190-bonus\bonus`

The README documents 9 modules but only `app/login/page.tsx`, `app/page.tsx`, `app/admin/layout.tsx`, and `app/investor/layout.tsx` exist. The following pages and API routes are **missing from disk** and must be implemented:

**Admin Pages (under `app/admin/`):**
- `bonds/page.tsx` — Bond structuring: create/list/edit/delete bonds
- `orderbook/page.tsx` — Bookbuilding: real-time demand tracking
- `payments/page.tsx` — Payment scheduler: schedule and trigger coupon/principal payments
- `compliance/page.tsx` — Compliance portal: generate and list reports

**Investor Pages (under `app/investor/`):**
- `screener/page.tsx` — Bond screener with filters (credit rating, YTM, maturity, sector) + purchase flow
- `dashboard/page.tsx` — Position dashboard: current holdings, upcoming coupons, historical returns
- `alerts/page.tsx` — Risk alerts panel: rating changes, price fluctuations, rebalancing

**API Routes (under `app/api/`):**
- `auth/send/route.ts` — POST: generate & email magic link
- `auth/verify/route.ts` — GET: verify token, issue JWT
- `bonds/route.ts` — GET/POST bonds collection
- `bonds/[id]/route.ts` — GET/PATCH/DELETE single bond
- `orders/route.ts` — GET/POST investor orders
- `payments/route.ts` — GET/POST payment schedule
- `portfolio/route.ts` — GET investor holdings
- `alerts/route.ts` — GET/PATCH investor alerts
- `compliance/route.ts` — GET/POST compliance documents

**Also missing:** `app/auth/verify/page.tsx` (token verification & JWT storage)

## Task
Implement all missing pages and API routes following the existing project conventions:

1. Read `lib/types.ts`, `lib/db.ts`, `lib/auth.ts`, `lib/auth-client.ts`, `lib/email.ts`, `lib/payments.ts` before writing any code
2. Read `node_modules/next/dist/docs` before using any Next.js API
3. Use `frontend-design` skill for every new page/component
4. All API routes: validate JWT from `Authorization: Bearer <token>` header, return `{ error: string }` on failure with correct HTTP status
5. All money values stored/computed in cents (integers)
6. No `any` types — use interfaces from `lib/types.ts`
7. Server components fetch directly from MongoDB; client components call API routes
8. Input validation on all POST/PATCH routes (return 400 if required fields missing)

### Implementation Guidelines

**Auth routes:**
- `POST /api/auth/send`: Accept `{ email }`, create a one-time token, store in `magic_tokens` collection with 15-min TTL, send via MailHog using `lib/email.ts`
- `GET /api/auth/verify?token=X`: Validate token (not expired, not used), mark used, find user, issue JWT via `lib/auth.ts:signToken`, return `{ token, user }`

**Bond routes:**
- Admin-only (verify role=admin from JWT)
- Support lifecycle status: `draft → offering → active → matured`
- `couponRate` stored as basis points (integer)
- `faceValue` stored as cents (integer)

**Order routes:**
- Support investor creating orders during `offering` period
- Track `requestedAmount` (cents), `quantity`, `pricePerBond` (cents)

**Payments:**
- Use `lib/payments.ts` to schedule events
- Status flow: `scheduled → processing → completed | failed`

**Portfolio:**
- Aggregate holdings from orders collection
- Calculate current market value and unrealized P&L

**Alerts:**
- Categories: `info | warning | critical`
- Support PATCH to mark alerts as read

**UI requirements (for all pages):**
- Dark theme consistent with `app/globals.css`
- Loading states (spinners/skeletons), error states, empty states
- Mobile-responsive layouts
- Role guards already in layout.tsx — pages just need to render content

## Output checklist and Guardrails
- [ ] All 9 missing pages created
- [ ] All 9 API route files created
- [ ] `app/auth/verify/page.tsx` created
- [ ] No `any` types
- [ ] All API routes return `{ error: string }` on failure
- [ ] Money values in cents everywhere
- [ ] `frontend-design` skill used for each page
- [ ] Build passes (`npm run build`)
- [ ] No secrets hardcoded
