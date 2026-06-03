import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { inrToPaise, unitDimension } from "@/lib/schema";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  base_unit: z.enum(["g", "kg", "mL", "L", "item"]),
  base_price_inr: z.number().positive(),
  stock_base_qty: z.number().min(0),
  is_active: z.boolean().optional().default(true),
});

// GET /api/products - list products (with optional search/filter)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const activeOnly = searchParams.get("active") !== "false";

  const rows = await sql`
    SELECT
      id, name, sku, description, category,
      base_unit, dimension, base_price_paise, stock_base_qty, is_active,
      created_at, updated_at
    FROM products
    WHERE
      (${!activeOnly} OR is_active = true)
      AND (${!search} OR name ILIKE ${"%" + search + "%"} OR sku ILIKE ${"%" + search + "%"} OR description ILIKE ${"%" + search + "%"})
      AND (${!category} OR category = ${category})
    ORDER BY name ASC
  `;

  return NextResponse.json({ products: rows });
}

// POST /api/products - create product (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const d = parsed.data;
  const dimension = unitDimension(d.base_unit as "g" | "kg" | "mL" | "L" | "item");
  const basePricePaise = inrToPaise(d.base_price_inr);

  const [product] = await sql`
    INSERT INTO products (id, name, sku, description, category, base_unit, dimension, base_price_paise, stock_base_qty, is_active)
    VALUES (
      gen_random_uuid()::text,
      ${d.name}, ${d.sku ?? null}, ${d.description ?? null}, ${d.category ?? null},
      ${d.base_unit}, ${dimension}, ${basePricePaise}, ${d.stock_base_qty}, ${d.is_active}
    )
    RETURNING *
  `;

  return NextResponse.json({ product }, { status: 201 });
}
