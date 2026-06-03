import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sql } from "@/lib/db";
import { toBaseUnit, calculateOrderTotal } from "@/lib/schema";
import { z } from "zod";

const itemSchema = z.object({
  product_id: z.string(),
  ordered_unit: z.enum(["g", "kg", "mL", "L", "item"]),
  ordered_qty_display: z.number().positive(),
});

const quotationSchema = z.object({
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = session.user.role === "admin";

  const quotations = await sql`
    SELECT
      q.id, q.status, q.notes, q.total_paise, q.created_at, q.updated_at,
      u.name AS seller_name, u.email AS seller_email,
      COALESCE(
        json_agg(json_build_object(
          'id', qi.id,
          'product_id', qi.product_id,
          'product_name', qi.product_name,
          'ordered_unit', qi.ordered_unit,
          'ordered_qty_display', qi.ordered_qty_display,
          'ordered_qty_base', qi.ordered_qty_base,
          'base_price_paise', qi.base_price_paise,
          'line_total_paise', qi.line_total_paise
        ) ORDER BY qi.created_at) FILTER (WHERE qi.id IS NOT NULL),
        '[]'::json
      ) AS items
    FROM quotations q
    JOIN users u ON u.id = q.seller_id
    LEFT JOIN quotation_items qi ON qi.quotation_id = q.id
    WHERE ${isAdmin} OR q.seller_id = ${session.user.id}
    GROUP BY q.id, u.name, u.email
    ORDER BY q.created_at DESC
  `;

  return NextResponse.json({ quotations });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = quotationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { notes, items } = parsed.data;

  // Fetch products to validate and get prices
  const productIds = items.map((i) => i.product_id);
  const products = await sql`
    SELECT id, name, base_unit, dimension, base_price_paise, stock_base_qty
    FROM products
    WHERE id = ANY(${productIds}::text[]) AND is_active = true
  `;
  const productMap = new Map(products.map((p) => [p.id as string, p]));

  let totalPaise = 0;
  const lineItems = [];

  for (const item of items) {
    const product = productMap.get(item.product_id);
    if (!product) {
      return NextResponse.json({ error: `Product ${item.product_id} not found` }, { status: 400 });
    }

    const baseQty = toBaseUnit(item.ordered_qty_display, item.ordered_unit as "g"|"kg"|"mL"|"L"|"item");
    const linePaise = calculateOrderTotal(item.ordered_qty_display, item.ordered_unit as "g"|"kg"|"mL"|"L"|"item", product.base_price_paise as number);

    totalPaise += linePaise;
    lineItems.push({
      product_id: item.product_id,
      product_name: product.name as string,
      ordered_unit: item.ordered_unit,
      ordered_qty_display: item.ordered_qty_display,
      ordered_qty_base: baseQty,
      base_price_paise: product.base_price_paise as number,
      line_total_paise: linePaise,
    });
  }

  // Create quotation
  const [quotation] = await sql`
    INSERT INTO quotations (id, seller_id, notes, total_paise)
    VALUES (gen_random_uuid()::text, ${session.user.id}, ${notes ?? null}, ${totalPaise})
    RETURNING *
  `;

  for (const li of lineItems) {
    await sql`
      INSERT INTO quotation_items (
        id, quotation_id, product_id, product_name,
        ordered_unit, ordered_qty_display, ordered_qty_base,
        base_price_paise, line_total_paise
      )
      VALUES (
        gen_random_uuid()::text, ${quotation.id as string},
        ${li.product_id}, ${li.product_name},
        ${li.ordered_unit}, ${li.ordered_qty_display}, ${li.ordered_qty_base},
        ${li.base_price_paise}, ${li.line_total_paise}
      )
    `;
  }

  return NextResponse.json({ quotation }, { status: 201 });
}
