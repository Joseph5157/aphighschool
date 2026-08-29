# AP Teacher Desk — Portal CMS & Public Web Application

Full-stack Next.js 14 Web Application & Admin CMS for AP & TS Government Teachers, Employees, and Pensioners.

## 🚀 Key Features

### 1. 🧮 Public Utility Tools Suite (`/tools`)
- **PRC Pay Fixation & Arrears Calculator (`/tools/prc-calculator`)**: Interactive AP RPS 2022 Master Scale pay stage lookup, gross benefit breakdown, and CPS/GPF arrears split.
- **Income Tax Calculator (`/tools/tax-calculator`)**: FY 2025-26 (AY 2026-27) New vs Old Tax Regime comparison with instant DDO Annexure-I statement export.
- **EL & HPL Encashment Bill (`/tools/leave-encashment`)**: Cash equivalent calculator for 15/30-day Earned Leave surrender.
- **GPF & APGLI Balance Estimator (`/tools/gpf-apgli`)**: 7.1% GPF interest growth and APGLI maturity sum projection.
- **CFMS Bill Status Guide (`/tools/cfms-checker`)**: Direct guidance for DDO bill submission status and medical reimbursement tracking.

### 2. 👵 Pensioners & Retired Employee Care Hub (`/pensioners`)
- **Service Pension & Gratuity Calculator (`/pensioners/pension-calculator`)**: Calculates Basic Pension, 40% Commutation lump sum value, DCRG Gratuity (₹16L cap), and EL encashment.
- **180-Month Commutation Restoration Tracker (`/pensioners/commutation-tracker`)**: Recovery timeline countdown + printable restoration application to STO Treasury.
- **6-Office Retirement Clearance Pipeline (`/pensioners/office-pipeline`)**: Step-by-step file clearance roadmap (School DDO ➔ MEO/DEO ➔ State Audit ➔ AG AP Vijayawada ➔ STO Treasury ➔ Bank Branch).

### 3. 📄 Living Documents & Orders Hub (`/orders`, `/posts/[slug]`)
- Verified AP G.O.s (Government Orders) hub with GOIR verification badges, English abstracts, Telugu summaries (`lang="te"`), and full lifecycle tracking (Effective, Superseded, Amendments).

### 4. 🔒 Admin CMS (`/admin`)
- Solo-operator NextAuth credentials authentication with bcrypt hash verification.
- Content creation, draft management, and Related Orders linking.

---

## 🛠️ Prerequisites & Setup

- Docker + Docker Compose
- Node.js 20+
- npm

### 1. Start Stateful Services & Install
```bash
# Start Postgres 16 & Redis 7
docker compose up -d

# Install dependencies
npm install
```

### 2. Configure Environment
Create `.env` file (copied from `.env.example`):
```env
DATABASE_URL="postgresql://portal:portal_dev_password@localhost:5432/portal_dev?schema=public"
REDIS_URL="redis://localhost:6379"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key-ap-teachers-portal-2026"
ADMIN_EMAIL="admin@apteachers.in"
ADMIN_PASSWORD="adminpassword123"
# Note: Escape dollar signs (\$) to prevent dotenv variable expansion
ADMIN_PASSWORD_HASH="\$2a\$10\$8GcYdn2jC4GsBMab92zR9eN.Rl4MQ0irYSHMB1TbxwBLSiawy1JSy"
```

### 3. Database Push & Seed
```bash
# Generate Prisma Client & push schema to Postgres
npx prisma generate
npx prisma db push

# Seed initial categories and test G.O. data
npm run db:seed

# Start Next.js development server
npm run dev
```

Visit `http://localhost:3000` for the public portal and `http://localhost:3000/admin/login` for admin access.

---

## 🧪 Testing

The Vitest test suite covers accessibility (`a11y`), color opacity tokens, navigation, auth guards, pension math, and internal link crawlers.

```bash
# Run full Vitest suite (32 test files / 215 tests)
npm test

# Type check TypeScript definitions
npx tsc --noEmit
```
