# 🚀 Deployment Guide for Railway (railway.app)

This guide walks you through deploying **AP Teacher Desk / Portal CMS** to [Railway.app](https://railway.app) with a PostgreSQL database.

---

## 📋 Prerequisites

1. A [Railway.app](https://railway.app) account.
2. Your project repository pushed to GitHub.

---

## ⚡ Quick Deployment Steps (5 Minutes)

### Step 1: Create a New Project on Railway
1. Go to [Railway Dashboard](https://railway.app/dashboard).
2. Click **New Project** → Select **Deploy from GitHub repo**.
3. Choose your repository (`portal-cms`).

---

### Step 2: Add a PostgreSQL Database Service
1. In your Railway Project canvas, click **+ New** → **Database** → **Add PostgreSQL**.
2. Railway will automatically provision a production PostgreSQL instance and generate a `DATABASE_URL` variable.

---

### Step 3: Configure Environment Variables

In your Railway App service, go to **Variables** tab and add the following required environment variables:

| Variable Name | Example / Value | Description |
|---|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | Select reference from PostgreSQL service. |
| `NEXTAUTH_SECRET` | `run: openssl rand -base64 32` | Secret key for session encryption. |
| `NEXTAUTH_URL` | `https://${{RAILWAY_PUBLIC_DOMAIN}}` | Public canonical URL. |
| `NEXT_PUBLIC_SITE_URL` | `https://${{RAILWAY_PUBLIC_DOMAIN}}` | Canonical domain for SEO & metadata. |
| `ADMIN_EMAIL` | `admin@apteacherdesk.com` | Email for single-admin login. |
| `ADMIN_PASSWORD_HASH` | `$2a$12$...` | Bcrypt hash generated with `npx tsx scripts/hash-password.ts <password>`. |
| `NODE_ENV` | `production` | Set environment to production. |

---

### Step 4: Generate Public Domain & Deploy

1. In your Railway service settings, go to **Networking** → Click **Generate Domain**.
2. Railway will build your Next.js application using `railway.json`:
   - Runs `npx prisma generate` & `npm run build` during build phase.
   - Runs `npx prisma db push && npm run start` on deploy startup.
3. Access your live application at your `.up.railway.app` URL!

---

## 📊 Database Seeding (Optional Initial Data)

To seed initial categories, posts, or sample data:
1. Open **Railway CLI** or terminal:
   ```bash
   railway run npm run db:seed
   ```
2. Or run seed manually against your production `DATABASE_URL`:
   ```bash
   DATABASE_URL="<your-railway-db-url>" npx tsx prisma/seed.ts
   ```

---

## 🔒 Security Best Practices for Production

* Set a strong `NEXTAUTH_SECRET`.
* Ensure `ADMIN_PASSWORD_HASH` is generated using a strong password.
* Enable SSL/HTTPS on Railway domain (automatic by default).
