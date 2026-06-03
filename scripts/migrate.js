/**
 * Database Migration Script
 * Run: node scripts/migrate.js
 *
 * Schema Design Notes:
 * - users: role-based (admin | seller)
 * - products: base_unit is internal storage unit; base_price_paise is price per base unit in paise
 * - orders/quotations: store ordered_unit and ordered_quantity_base (converted to base) for integrity
 */

const fs = require("fs");
const path = require("path");
const envPath = fs.existsSync(path.resolve(process.cwd(), ".env.local")) ? ".env.local" : ".env";
require("dotenv").config({ path: envPath });
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log("Running migrations...");

  // Users table
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name        TEXT NOT NULL,
      email       TEXT UNIQUE NOT NULL,
      password    TEXT NOT NULL,
      role        TEXT NOT NULL CHECK (role IN ('admin', 'seller')),
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // Products table
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name                TEXT NOT NULL,
      sku                 TEXT UNIQUE,
      description         TEXT,
      category            TEXT,
      base_unit           TEXT NOT NULL CHECK (base_unit IN ('g','kg','mL','L','item')),
      dimension           TEXT NOT NULL CHECK (dimension IN ('weight','volume','count')),
      base_price_paise    BIGINT NOT NULL CHECK (base_price_paise >= 0),
      stock_base_qty      NUMERIC(20,6) NOT NULL DEFAULT 0 CHECK (stock_base_qty >= 0),
      is_active           BOOLEAN NOT NULL DEFAULT TRUE,
      created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  // Note: base_unit for weight products is 'g', volume is 'mL', count is 'item'
  // base_price_paise = price per 1 base unit (1g, 1mL, or 1 item)

  // Quotations table
  await sql`
    CREATE TABLE IF NOT EXISTS quotations (
      id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      seller_id       TEXT NOT NULL REFERENCES users(id),
      status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','converted')),
      notes           TEXT,
      total_paise     BIGINT NOT NULL DEFAULT 0,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // Quotation line items
  await sql`
    CREATE TABLE IF NOT EXISTS quotation_items (
      id                        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      quotation_id              TEXT NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
      product_id                TEXT NOT NULL REFERENCES products(id),
      product_name              TEXT NOT NULL,
      ordered_unit              TEXT NOT NULL CHECK (ordered_unit IN ('g','kg','mL','L','item')),
      ordered_qty_display       NUMERIC(20,6) NOT NULL,
      ordered_qty_base          NUMERIC(20,6) NOT NULL,
      base_price_paise          BIGINT NOT NULL,
      line_total_paise          BIGINT NOT NULL,
      created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // Orders table (converted from approved quotation or placed directly)
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      quotation_id    TEXT REFERENCES quotations(id),
      seller_id       TEXT NOT NULL REFERENCES users(id),
      status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','shipped','delivered','cancelled')),
      notes           TEXT,
      total_paise     BIGINT NOT NULL DEFAULT 0,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS order_items (
      id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      order_id            TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id          TEXT NOT NULL REFERENCES products(id),
      product_name        TEXT NOT NULL,
      ordered_unit        TEXT NOT NULL CHECK (ordered_unit IN ('g','kg','mL','L','item')),
      ordered_qty_display NUMERIC(20,6) NOT NULL,
      ordered_qty_base    NUMERIC(20,6) NOT NULL,
      base_price_paise    BIGINT NOT NULL,
      line_total_paise    BIGINT NOT NULL,
      created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // Indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_quotations_seller ON quotations(seller_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id)`;

  console.log("✅ Migration complete.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
