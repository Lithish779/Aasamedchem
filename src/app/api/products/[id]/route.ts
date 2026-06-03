import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sql } from "@/lib/db";
import { inrToPaise } from "@/lib/schema";
import { z } from "zod";

const updateProductSchema = z.object({
  name: z.string().min(1),
  sku: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  base_price_inr: z.number().positive(),
  stock_base_qty: z.number().min(0),
  is_active: z.boolean().optional().default(true),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const d = parsed.data;
  const basePricePaise = inrToPaise(d.base_price_inr);

  const [product] = await sql`
    UPDATE products
    SET
      name = ${d.name},
      sku = ${d.sku ?? null},
      description = ${d.description ?? null},
      category = ${d.category ?? null},
      base_price_paise = ${basePricePaise},
      stock_base_qty = ${d.stock_base_qty},
      is_active = ${d.is_active},
      updated_at = NOW()
    WHERE id = ${params.id}
    RETURNING *
  `;

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [product] = await sql`
    DELETE FROM products
    WHERE id = ${params.id}
    RETURNING id
  `;

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Product deleted successfully" });
}
