<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-spec -->
# Project: Bond Management Application (Deuda Corporativa)

## Definition
Web application for managing corporate debt bonds — covering issuance structuring, investor order management, automated coupon payments, compliance reporting, and investor portfolio tracking.

## Modules

### AUTH & DATA
1. Magic link authentication (JWT, no passwords, no cookies — see Authentication rules)
2. Seed script to populate initial data

### ADMIN
3. **Bond Structuring**: Define face value, coupon rate (fixed or variable), payment frequency, maturity date, company name, bond name. Support short, medium, and long-term maturities.
4. **Order Book Management (Bookbuilding)**: Real-time tracking of investor demand during the offering period to adjust final pricing.
5. **Automated Payments**: Schedule automatic coupon payments and principal repayment at maturity.
6. **Compliance & Reporting Portal**: Auto-generate tax documents, fund usage reports, and covenant compliance reports for investors.

### INVESTOR
7. **Bond Screener**: Advanced filters by credit rating, yield-to-maturity (YTM), maturity date, and sector. Includes bond purchase flow.
8. **Comprehensive Position Dashboard**: Real-time view of current market value of held bonds, upcoming coupon payments, and historical returns.
9. **Alerts & Risk Analysis**: Notifications for issuer rating changes, price fluctuations, and portfolio rebalancing alerts.

## Design Guidelines
- Dark theme for better readability
- Clean, modern storefront feel — bold typography, clear CTAs
- Single accent color, consistent across all views
- No images — use category-colored icon placeholders (CSS only)
- Mobile-responsive layouts
- Use `frontend-design` skill for every new page/component

## Architecture
- **Frontend**: Next.js with TypeScript
- **Database**: MongoDB via native driver — all access through `lib/db.ts` singleton
- **Storage**: AWS S3-compatible via RustFS (Docker) for PDFs, videos, audio
- **Email**: MailHog (Docker) for magic link delivery
- **Auth**: JWT magic links, stored in localStorage — NO cookies

## Coding Rules
1. Read `node_modules/next/dist/docs` before using any Next.js API
2. All DB access through `lib/db.ts` singleton — never inline `new MongoClient`
3. All money values stored and computed in **cents** (integers) — format for display only
4. API routes return `{ error: string }` on failure with the appropriate HTTP status code
5. No `any` types — use TypeScript interfaces in `lib/types.ts`
6. Server components fetch directly from MongoDB; client components call API routes
7. Use a global context for authenticated user state and preferences — no prop drilling

## Environment Variables
```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=bonos_db

# AWS S3 / RustFS
AWS_USERNAME=minioadmin
AWS_PASSWORD=minioadmin1234
AWS_REGION=us-east-1
AWS_URL=http://localhost:10000
AWS_BUCKET=bonos-bucket

# Email
MAILHOG_HOST=localhost
MAIL_PORT=1027

# Next.js
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000

# JWT
JWT_SECRET=magik-link-dev-secret-2026
```

## Testing
- **Playwright**: E2E tests covering registration, login, bond purchase, and other critical flows
- **Jest**: Unit tests for functions in `lib/` (payment processing, data validation, etc.)
- Write tests before implementing new features (TDD)
- Configure CI to run tests automatically

## Git Conventions
- Commit messages: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Feature/fix branches — merge to `main` only when complete
- Logical folder structure: `components/`, `app/`, `lib/`, `utils/`
<!-- END:project-spec -->
