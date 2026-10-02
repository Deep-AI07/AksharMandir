# 🛕 Akshar Mandir - Production Deployment Guide

This guide provides end-to-end instructions for deploying the **Akshar Mandir Sanctum** full-stack e-commerce web application to production.

---

## 📋 Architecture Overview

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion.
  - Generates static assets in `frontend/dist/`.
  - Configured with client-side SPA routing (`vercel.json` and `_redirects`).
- **Backend**: Node.js, Express, TypeScript, Prisma ORM.
  - Compiles TypeScript to `backend/dist/`.
  - Includes REST APIs (`/api/products`, `/api/orders`, `/api/auth`, `/api/cart`, `/api/coupons`, etc.).
  - Can serve as an independent API or simultaneously serve the built frontend.
- **Database**: Prisma ORM with SQLite (`backend/prisma/dev.db`) by default.
  - Zero-configuration for single servers, VPS, or persistent volume containers.
  - Fully compatible with PostgreSQL (Supabase, Neon, AWS RDS) for serverless deployments.

---

## 🚀 Deployment Options

### Option 1: Vercel (Frontend) + Render / Railway (Backend) `[Recommended]`

This architecture separates the static frontend CDN from the backend API for maximum speed and scale.

#### Step 1: Deploy Backend (Render / Railway / Fly.io)
1. Push this repository to GitHub or GitLab.
2. In [Render.com](https://render.com) or [Railway.app](https://railway.app), create a new **Web Service** linked to your repository.
3. Configure the service settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Node Version**: `>= 18.x`
4. Set the Environment Variables:
   ```env
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=generate_a_secure_random_string_here_e.g_akshar_mandir_secret_key_2026
   JWT_EXPIRES_IN=7d
   DATABASE_URL="file:./dev.db"
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```
5. Deploy the backend service and copy its public URL (e.g., `https://akshar-mandir-api.onrender.com`).
6. Test API health by visiting: `https://akshar-mandir-api.onrender.com/api/health`

#### Step 2: Deploy Frontend (Vercel)
1. In [Vercel](https://vercel.com), click **Add New Project** and import the same repository.
2. Set the Project Configuration:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   ```env
   VITE_API_URL=https://akshar-mandir-api.onrender.com/api
   ```
   *(Replace with your actual backend URL from Step 1)*
4. Click **Deploy**. Vercel will build the frontend with full SPA routing support (`vercel.json`).

---

### Option 2: Unified Single Service (Render, Railway, VPS, EC2, or Docker)

The backend is pre-configured to automatically serve `frontend/dist` and handle client-side SPA routing when both are built together.

1. In your host dashboard or terminal, build both frontend and backend:
   ```bash
   npm run build
   ```
2. Start the unified production server:
   ```bash
   npm run start
   ```
3. The server runs on `http://0.0.0.0:5000` (or the dynamic `$PORT` provided by your cloud host) serving both the frontend web app and the `/api` routes on the exact same domain. No CORS configuration is required.

---

## 🔑 Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | No | `5000` | Port for the backend server |
| `NODE_ENV` | Yes | `production` | Enables production optimizations and security |
| `JWT_SECRET` | Yes | - | Secret key used for signing JWT tokens |
| `JWT_EXPIRES_IN` | No | `7d` | Token lifetime |
| `DATABASE_URL` | Yes | `file:./dev.db` | Prisma database connection string |
| `FRONTEND_URL` | No | `http://localhost:3000` | Allowed CORS origin (comma-separated for multiples) |
| `PAYMENT_MODE` | No | `development` | Payment gateway mode |
| `STORE_NAME` | No | `Akshar Mandir` | Brand name for invoice headers |
| `STORE_PHONE` | No | `+91 98765 43210` | Customer care phone |
| `STORE_EMAIL` | No | `care@aksharmandir.com` | Customer care email |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | No | `/api` (in prod) | Full URL to API (e.g. `https://api.yourdomain.com/api`). Leave empty if unified. |

---

## 🗄️ Database & Initial Data

The application database has been cleaned of all sample/mock orders, fake carts, and dummy user requests.

### Database Contents:
- **8 Authentic Handcrafted Mandirs** with detailed specifications, wood types, finishes, dimensions, and high-resolution visuals.
- **6 Mandir Categories**: Teakwood, Sheesham, Marble Carved, Wall Mounted, Floor Standing, Luxury Custom.
- **Live Coupons**:
  - `DIVINE10`: 10% off (up to ₹5,000) on orders above ₹10,000.
  - `WELCOME500`: Flat ₹500 off on orders above ₹2,000.
- **Zero Mock Orders / Zero Fake Carts**: Pure real-time customer data only.

### Re-seeding / Initializing a Fresh Database:
If deploying on a new server or PostgreSQL database:
```bash
# Generate Prisma Client
npm --prefix backend run prisma:generate

# Push schema to database
npm --prefix backend run prisma:push

# Seed authentic products, categories, coupons, and master admin
npm --prefix backend run prisma:seed
```

---

## 🛡️ Default Master Admin Credentials

When the database is seeded, an administrator account is automatically prepared:

- **Email**: `admin@aksharmandir.com`
- **Password**: `Admin@123`
- **Admin Portal URL**: `/admin/login`

> **Security Advisory:** After initial deployment, log into the admin dashboard at `/admin/login` and update your master credentials or database password.

---

## 🧪 Post-Deployment Sanity Checklist

1. [ ] **Health Endpoint**: Navigate to `https://<your-backend>/api/health` — should return `{"status":"healthy"}`.
2. [ ] **Catalog Display**: Home page, `/collection`, and `/category/:slug` display all 8 handcrafted mandir products.
3. [ ] **Live Cart & Wishlist**: Adding a product to cart updates badge counters instantly and persists across navigation.
4. [ ] **Checkout Flow**: Real-time address submission, payment method selection, coupon verification (`DIVINE10`), and real order placement.
5. [ ] **Order Tracking**: Newly placed orders generate unique `AKM-YYYY-XXXX` tracking IDs, downloadable PDF receipts, and order statuses.
6. [ ] **Admin Dashboard**: Access `/admin/login` with your credentials to manage products, categories, coupons, and view live incoming customer orders.

---

*Akshar Mandir Sanctum is ready for live publishing!*
