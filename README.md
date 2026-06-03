# AasaMedChem — Inventory & Order Management System

A pharmaceutical inventory and order management platform built with Next.js 14, Neon PostgreSQL, and deployed on Vercel.

---

## Live Demo

> Deploy to Vercel and update this with your live URL.

**Test credentials:**
| Role   | Email               | Password   |
|--------|---------------------|------------|
| Admin  | admin@aasa.com      | admin123   |
| Seller | seller@aasa.com     | seller123  |

---

## Features

### Admin Panel
- ✅ Create, update, delete products with full metadata (name, SKU, category, description)
- ✅ Configure base unit and base price per unit in INR
- ✅ View inventory stock levels
- ✅ Review incoming quotations (with line-item breakdown, unit conversions, pricing)
- ✅ Approve / Reject quotations
- ✅ Convert approved quotations to orders
- ✅ Manage order status (pending → processing → shipped → delivered)

### Seller Portal
- ✅ Browse and search products (by name, SKU, category)
- ✅ View prices in multiple units with real-time conversion preview
- ✅ Add items to cart with any supported unit
- ✅ Submit quotation requests with optional notes
- ✅ Track quotation status
- ✅ View order history and status

### Unit System
Supports: **grams (g)**, **kilograms (kg)**, **litres (L)**, **millilitres (mL)**, **items (item)**

---

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Framework   | Next.js 14 (App Router)           |
| Database    | Neon PostgreSQL (serverless)      |
| Auth        | NextAuth.js (JWT strategy)        |
| Validation  | Zod                               |
| Styling     | Tailwind CSS                      |
| Deployment  | Vercel                            |
| Fonts       | Playfair Display + DM Sans + DM Mono |

**System Design:**
- Next.js handles both frontend and backend (API Routes in `/src/app/api/`)
- Server Components fetch data directly from Neon for SSR pages (dashboard overview)
- Client Components use fetch() to API routes for interactive pages
- NextAuth manages session with JWT; role is embedded in the token

```
Browser → Next.js (Vercel) → API Routes → Neon PostgreSQL
                ↑
         NextAuth session
```

---

## Database Schema

### `users`
| Column       | Type        | Notes                          |
|--------------|-------------|--------------------------------|
| id           | TEXT PK     | gen_random_uuid()              |
| name         | TEXT        |                                |
| email        | TEXT UNIQUE |                                |
| password     | TEXT        | bcrypt hash                    |
| role         | TEXT        | `admin` or `seller`            |
| created_at   | TIMESTAMPTZ |                                |
| updated_at   | TIMESTAMPTZ |                                |

### `products`
| Column            | Type           | Notes                                          |
|-------------------|----------------|------------------------------------------------|
| id                | TEXT PK        |                                                |
| name              | TEXT           |                                                |
| sku               | TEXT UNIQUE    | optional                                       |
| description       | TEXT           | optional                                       |
| category          | TEXT           | optional                                       |
| base_unit         | TEXT           | internal storage unit: `g`, `mL`, or `item`   |
| dimension         | TEXT           | `weight`, `volume`, or `count`                 |
| base_price_paise  | BIGINT         | price per 1 base unit, in paise                |
| stock_base_qty    | NUMERIC(20,6)  | stock in base units                            |
| is_active         | BOOLEAN        | visible to sellers                             |

### `quotations`
| Column       | Type          | Notes                                            |
|--------------|---------------|--------------------------------------------------|
| id           | TEXT PK       |                                                  |
| seller_id    | TEXT FK       | → users                                          |
| status       | TEXT          | `pending`, `approved`, `rejected`, `converted`   |
| notes        | TEXT          |                                                  |
| total_paise  | BIGINT        | sum of all line totals                           |

### `quotation_items`
| Column              | Type          | Notes                                              |
|---------------------|---------------|----------------------------------------------------|
| id                  | TEXT PK       |                                                    |
| quotation_id        | TEXT FK       | → quotations (CASCADE DELETE)                      |
| product_id          | TEXT FK       | → products                                         |
| product_name        | TEXT          | snapshot at time of quotation                      |
| ordered_unit        | TEXT          | unit the seller chose (g, kg, mL, L, item)         |
| ordered_qty_display | NUMERIC(20,6) | quantity as entered by seller                      |
| ordered_qty_base    | NUMERIC(20,6) | converted to base unit (g, mL, or item)            |
| base_price_paise    | BIGINT        | snapshot of product's price at quotation time      |
| line_total_paise    | BIGINT        | ordered_qty_base × base_price_paise                |

### `orders` and `order_items`
Same structure as quotations/quotation_items, plus:
- `orders.quotation_id` — optional FK back to the originating quotation
- `orders.status`: `pending`, `processing`, `shipped`, `delivered`, `cancelled`

---

## Unit Storage & Conversion Strategy

### Internal Base Units

| Dimension | Base Unit | Rationale                                      |
|-----------|-----------|------------------------------------------------|
| Weight    | gram (g)  | Smallest practical pharma weight unit          |
| Volume    | mL        | Smallest practical pharma volume unit          |
| Count     | item      | No conversion needed                           |

Products must declare one of: `g`, `mL`, or `item` as their `base_unit`. The dimension is derived automatically:
- `g` → weight (can also be ordered in `kg`)
- `mL` → volume (can also be ordered in `L`)
- `item` → count

### Conversion Factors

| From | To   | Factor |
|------|------|--------|
| kg   | g    | × 1000 |
| g    | kg   | ÷ 1000 |
| L    | mL   | × 1000 |
| mL   | L    | ÷ 1000 |
| item | item | × 1    |

These live in `src/lib/schema.ts` as `UNIT_TO_BASE`.

### Price Storage

All prices are stored as **BIGINT in paise** (1 INR = 100 paise) to avoid floating-point rounding errors. The `base_price_paise` field represents the price for **1 base unit** (1 gram, 1 mL, or 1 item).

**INR ↔ Paise conversion:**
- INR → paise: `Math.round(inr * 100)` (avoids float issues)
- Paise → INR display: `(paise / 100).toFixed(2)`

### Where Conversions Happen

1. **On quotation submission** (`/api/quotations` POST):
   - `ordered_qty_base = ordered_qty_display × UNIT_TO_BASE[ordered_unit]`
   - `line_total_paise = ordered_qty_base × base_price_paise`

2. **On display** (browse page):
   - Price per display unit = `base_price_paise × UNIT_TO_BASE[display_unit]`
   - Live line total = `ordered_qty_display × UNIT_TO_BASE[unit] × base_price_paise`

3. **In the admin quotation view**: both `ordered_qty_display` and `ordered_qty_base` are shown so admins can verify conversion correctness.

### Data Type Rationale

- `BIGINT` for paise: max ~92 quadrillion paise (~920 trillion INR). Safe for any realistic pharma order.
- `NUMERIC(20,6)` for quantities: 14 digits before decimal, 6 after. Handles both very small quantities (0.000001 g) and very large ones (millions of units) without floating-point loss.
- `TEXT` for UUIDs: simpler interop with Neon's serverless driver; gen_random_uuid()::text produces standard UUIDs.

---

## Setup: Run Locally

### 1. Clone & install

```bash
git clone <your-repo>
cd aasa-medchem
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
```

### 3. Create Neon database

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project → copy the connection string
3. Paste into `DATABASE_URL` in `.env.local`

### 4. Run migrations & seed

```bash
npm run db:migrate   # creates tables
npm run db:seed      # creates demo users + products
```

### 5. Start dev server

```bash
npm run dev
# → http://localhost:3000
```

---

## Deploy to Vercel

1. Push code to GitHub
2. Import repo in [vercel.com/new](https://vercel.com/new)
3. Add environment variables:
   - `DATABASE_URL` (your Neon connection string)
   - `NEXTAUTH_SECRET` (random 32-byte base64 string)
   - `NEXTAUTH_URL` (your Vercel deployment URL, e.g. `https://aasa-medchem.vercel.app`)
4. Deploy

**Re-deploy:** push to `main` branch (auto-deploy) or trigger manually in Vercel dashboard.

After first deploy, run migrations against production Neon DB:
```bash
# set DATABASE_URL to production in your shell, then:
node scripts/migrate.js
node scripts/seed.js
```

---

## Using the Application

### Admin flow
1. Log in as `admin@aasa.com` / `admin123`
2. **Products** → Add/edit/delete products, set base unit and price
3. **Quotations** → Review incoming requests, approve/reject, convert to orders
4. **Orders** → Update order status as fulfilment progresses

### Seller flow
1. Log in as `seller@aasa.com` / `seller123`
2. **Browse Products** → Search/filter products
3. Select quantity + unit (e.g. 2 kg for a gram-based product)
4. See real-time price preview including unit conversion
5. Add to cart → Submit Quotation Request
6. **My Quotations** → Track approval status
7. **My Orders** → View confirmed orders

---

## Git Workflow

Commits follow a feature-by-feature incremental style:
- `init: project scaffold and config`
- `feat: database schema and migration script`
- `feat: nextauth credentials provider`
- `feat: products CRUD API routes`
- `feat: quotations and orders API`
- `feat: admin dashboard UI`
- `feat: seller browse and cart UI`
- `docs: README`

---

## License

MIT
