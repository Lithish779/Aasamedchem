/**
 * Seed script – creates demo users and sample products.
 * Run: node scripts/seed.js
 */
const fs = require("fs");
const path = require("path");
const envPath = fs.existsSync(path.resolve(process.cwd(), ".env.local")) ? ".env.local" : ".env";
require("dotenv").config({ path: envPath });
const { neon } = require("@neondatabase/serverless");
const bcrypt = require("bcryptjs");

const sql = neon(process.env.DATABASE_URL);

async function seed() {
  console.log("Seeding database...");

  const adminPass = await bcrypt.hash("admin123", 12);
  const sellerPass = await bcrypt.hash("seller123", 12);

  // Upsert admin
  await sql`
    INSERT INTO users (id, name, email, password, role)
    VALUES (gen_random_uuid()::text, 'Admin User', 'admin@aasa.com', ${adminPass}, 'admin')
    ON CONFLICT (email) DO NOTHING
  `;

  // Upsert seller
  await sql`
    INSERT INTO users (id, name, email, password, role)
    VALUES (gen_random_uuid()::text, 'Demo Seller', 'seller@aasa.com', ${sellerPass}, 'seller')
    ON CONFLICT (email) DO NOTHING
  `;

  // Sample products
  const products = [
    {
      name: "Paracetamol API",
      sku: "PCM-001",
      description: "Pharmaceutical grade paracetamol active pharmaceutical ingredient",
      category: "APIs",
      base_unit: "g",
      dimension: "weight",
      base_price_paise: 85, // ₹0.85 per gram
      stock_base_qty: 500000, // 500 kg
    },
    {
      name: "Aspirin Powder",
      sku: "ASP-001",
      description: "High purity aspirin powder, USP grade",
      category: "APIs",
      base_unit: "g",
      dimension: "weight",
      base_price_paise: 120, // ₹1.20 per gram
      stock_base_qty: 250000,
    },
    {
      name: "Ethanol 99.9%",
      sku: "ETH-001",
      description: "Pharmaceutical grade ethanol for synthesis",
      category: "Solvents",
      base_unit: "mL",
      dimension: "volume",
      base_price_paise: 18, // ₹0.18 per mL
      stock_base_qty: 1000000, // 1000 L
    },
    {
      name: "Sodium Chloride",
      sku: "NACL-001",
      description: "Reagent grade sodium chloride",
      category: "Reagents",
      base_unit: "g",
      dimension: "weight",
      base_price_paise: 4, // ₹0.04 per gram
      stock_base_qty: 2000000,
    },
    {
      name: "Methanol HPLC Grade",
      sku: "METH-001",
      description: "HPLC grade methanol for analytical use",
      category: "Solvents",
      base_unit: "mL",
      dimension: "volume",
      base_price_paise: 22, // ₹0.22 per mL
      stock_base_qty: 500000,
    },
    {
      name: "Peptide Synthesis Resin",
      sku: "PSR-001",
      description: "Wang resin for solid phase peptide synthesis",
      category: "Resins",
      base_unit: "g",
      dimension: "weight",
      base_price_paise: 4500, // ₹45 per gram
      stock_base_qty: 1000,
    },
    {
      name: "Lab Vials Type-I Glass",
      sku: "VIAL-001",
      description: "Borosilicate glass vials, 10mL, sterile",
      category: "Consumables",
      base_unit: "item",
      dimension: "count",
      base_price_paise: 350, // ₹3.50 per vial
      stock_base_qty: 10000,
    },
    {
      name: "Ibuprofen API",
      sku: "IBU-001",
      description: "Pharmaceutical grade ibuprofen active pharmaceutical ingredient",
      category: "APIs",
      base_unit: "g",
      dimension: "weight",
      base_price_paise: 95, // ₹0.95 per gram
      stock_base_qty: 300000,
    },
  ];

  for (const p of products) {
    await sql`
      INSERT INTO products (id, name, sku, description, category, base_unit, dimension, base_price_paise, stock_base_qty)
      VALUES (
        gen_random_uuid()::text,
        ${p.name}, ${p.sku}, ${p.description}, ${p.category},
        ${p.base_unit}, ${p.dimension}, ${p.base_price_paise}, ${p.stock_base_qty}
      )
      ON CONFLICT (sku) DO NOTHING
    `;
  }

  console.log("✅ Seeding complete.");
  console.log("   Admin:  admin@aasa.com  / admin123");
  console.log("   Seller: seller@aasa.com / seller123");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
