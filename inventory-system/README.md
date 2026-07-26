# InvenTrack — Inventory & Sales Management System

A full-stack inventory and POS system: **Next.js + Tailwind** frontend, **Node/Express + Sequelize** backend, **MySQL, PostgreSQL, or SQLite** database, **JWT auth**, barcode/QR generation, dashboard analytics, and CSV report exports.

**Want an offline PC app instead of a hosted web app?** See **[README-DESKTOP.md](./README-DESKTOP.md)** — this same project also packages into a native Windows/macOS/Linux installer (Electron + local SQLite file, no server or internet connection needed).

This scaffold implements the core of the original spec end-to-end and is structured so every remaining feature (multi-warehouse transfers, batch/serial tracking, SMS alerts, granular permission editor, etc.) can be added by following the same model → controller → route → page pattern already in place. See **"What's built vs. extension points"** below.

---

## 1. Project structure

```
inventory-system/
├── backend/                 Express API
│   ├── src/
│   │   ├── config/db.js     Sequelize connection (mysql or postgres via .env)
│   │   ├── models/          User, Product, Category, Brand, Supplier, Customer,
│   │   │                    Warehouse, StockMovement, Sale, SaleItem, Purchase, PurchaseItem
│   │   ├── controllers/     Business logic per resource
│   │   ├── routes/          REST endpoints, role-gated
│   │   ├── middleware/      auth (JWT), role (RBAC), error handler
│   │   ├── utils/           product code / barcode / QR / invoice number generators
│   │   └── seed/seed.js     Demo data + login
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── frontend/                 Next.js (App Router) + Tailwind
│   ├── app/                 login, dashboard, inventory, inventory/add, inventory/[id],
│   │                        pos, customers, suppliers, purchases, reports, settings
│   ├── components/          Sidebar, Topbar, StatCard, ProtectedRoute
│   ├── context/AuthContext.js
│   ├── lib/api.js           Axios client with JWT interceptor
│   ├── package.json
│   ├── Dockerfile
│   └── .env.local.example
├── docker-compose.yml        MySQL + backend + frontend, one command up
└── README.md
```

---

## 2. Quick start (local, no Docker)

### Prerequisites
- Node.js 18+
- MySQL 8 or PostgreSQL 14 running locally (or a hosted instance)

### Backend
```bash
cd backend
cp .env.example .env
# edit .env: set DB_DIALECT (mysql|postgres), DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET
npm install
npm run seed     # creates tables + demo data (drops existing tables — dev only)
npm run dev       # http://localhost:5000
```

Demo login created by the seed script:
```
admin@example.com / Password123!      (super_admin)
manager@example.com / Password123!    (manager)
cashier@example.com / Password123!    (salesperson)
```

### Frontend
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev       # http://localhost:3000
```

Open `http://localhost:3000` → redirects to `/login`.

---

## 3. Quick start (Docker)

```bash
docker compose up --build
```
This starts MySQL, the API on `:5000`, and the web app on `:3000`. Run the seed once the DB container is healthy:
```bash
docker compose exec backend npm run seed
```

---

## 4. Switching between MySQL and PostgreSQL

Sequelize handles both. In `backend/.env`:
```
DB_DIALECT=mysql      # or: postgres
DB_HOST=...
DB_PORT=3306          # or: 5432
DB_NAME=...
DB_USER=...
DB_PASSWORD=...
```
Both drivers (`mysql2` and `pg`/`pg-hstore`) are already in `package.json`, so no code changes are needed.

---

## 5. API overview

All endpoints are under `/api`, JWT-protected via `Authorization: Bearer <token>` unless noted.

| Resource | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Products | `GET /products` (search/filter/pagination), `GET /products/:id`, `POST /products`, `PUT /products/:id`, `DELETE /products/:id`, `POST /products/:id/duplicate`, `POST /products/bulk-import`, `GET /products/low-stock` |
| Categories / Brands | full CRUD |
| Suppliers | full CRUD + `GET /suppliers/:id` (products & purchase history) |
| Customers | full CRUD + `GET /customers/:id` (purchase history, total spend) |
| Sales (POS) | `POST /sales` (checkout, deducts stock in a DB transaction), `GET /sales`, `GET /sales/:id`, `POST /sales/:id/refund`, `GET /sales/held` |
| Purchases | `POST /purchases`, `GET /purchases`, `PATCH /purchases/:id/deliver` (stocks in on delivery) |
| Dashboard | `GET /dashboard/summary`, `GET /dashboard/sales-chart?days=14` |
| Reports | `GET /reports/sales|profit|stock|purchases|inventory-valuation` (add `?format=csv` on sales/stock for download) |

**Product search** (`GET /products?search=&category=&brand=&supplier=&stockStatus=&minPrice=&maxPrice=`) covers name, code, barcode, and description, with `stockStatus=in_stock|low_stock|out_of_stock`.

**Stock integrity**: every quantity change (initial stock, manual adjustment, sale, purchase delivery, refund/return) writes a `StockMovement` row, which powers the product timeline and gives you a full audit trail.

---

## 6. Roles & permissions

`User.role` is one of `super_admin | admin | manager | salesperson | inventory_officer`. Routes use an `allowRoles(...)` middleware, e.g. only `super_admin`/`admin` can delete products, only `super_admin`/`admin`/`manager` can view reports. Adjust the allow-lists in `backend/src/routes/*.routes.js` to match your policy, or replace the enum with a `permissions` JSON column / separate `Permission` table for a fully configurable matrix.

---

## 7. What's built vs. extension points

**Implemented with working logic:**
Dashboard KPIs & charts · Inventory CRUD, search, duplicate, bulk import · Auto product code/barcode/QR generation · Low-stock/out-of-stock detection · Product detail with stock timeline & profit margin · POS with cart, discounts, tax, multiple payment methods, hold sale, refund/return (stock-aware) · Customers with purchase history & loyalty points · Suppliers · Purchase orders with delivery-triggered stock-in · CSV report export · JWT auth + bcrypt + RBAC middleware + rate limiting + Helmet + CORS.

**Stubbed / documented as extension points** (spec called for these; they follow the same patterns above so you can add them without restructuring):
- **Multi-warehouse transfers** — `Warehouse` model and `warehouseId` on `Product` exist; add a `POST /transfers` endpoint that moves quantity between two `Product` rows (or a `WarehouseStock` join table if the same SKU lives in multiple warehouses at once).
- **Batch/serial number tracking** — add a `ProductBatch`/`SerialNumber` child model under `Product`, referenced from `SaleItem`/`PurchaseItem`.
- **Image upload (multiple images, drag-and-drop, Cloudinary)** — `multer` is included; add an `/api/uploads` route and wire `Product.images` (already a JSON array) to it.
- **Barcode/QR label printing sheets** — the QR is generated server-side (`qrcode` lib) and returned as a data URL; `jsbarcode`/`canvas` are included in `package.json` for rendering CODE128 barcodes to add alongside it.
- **Excel export, PDF reports** — CSV export is implemented (`json2csv`); add `exceljs` / `pdfkit` the same way for the other formats.
- **Settings (company info, tax, currency, receipt templates)** — placeholder page + note in `app/settings/page.js`; add a `Settings` model and simple GET/PUT controller.
- **SMS alerts, email receipts, scheduled low-stock notifications** — wire a provider (e.g. Twilio, Nodemailer) into `sale.controller.js` / a cron job calling `product.controller.lowStock`.
- **Activity/audit log UI** — `StockMovement` already gives you inventory audit data; add a general `ActivityLog` model for non-inventory actions (logins, permission changes, etc.) if you need it.

---

## 8. Security notes

- Passwords hashed with bcrypt; JWTs signed with `JWT_SECRET` (set a long random value in production).
- `helmet`, `cors` (locked to `CLIENT_URL`), and `express-rate-limit` are enabled by default.
- Sequelize parameterizes all queries, mitigating SQL injection.
- In production, replace `sequelize.sync({ alter: true })` in `server.js` with proper Sequelize migrations (`sequelize-cli`), and restrict `POST /auth/register` to `super_admin` only.
