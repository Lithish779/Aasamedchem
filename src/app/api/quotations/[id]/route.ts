import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sql } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "converted"]),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const [quotation] = await sql`
    UPDATE quotations SET status = ${parsed.data.status}, updated_at = NOW()
    WHERE id = ${params.id}
    RETURNING *
  `;

  if (!quotation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // If status is updated to converted, convert to order and deduct stock
  if (parsed.data.status === "converted") {
    const items = await sql`
      SELECT * FROM quotation_items WHERE quotation_id = ${params.id}
    `;

    const [order] = await sql`
      INSERT INTO orders (id, quotation_id, seller_id, total_paise)
      SELECT gen_random_uuid()::text, ${params.id}, seller_id, total_paise
      FROM quotations WHERE id = ${params.id}
      RETURNING *
    `;

    for (const item of items) {
      await sql`
        INSERT INTO order_items (
          id, order_id, product_id, product_name,
          ordered_unit, ordered_qty_display, ordered_qty_base,
          base_price_paise, line_total_paise
        )
        VALUES (
          gen_random_uuid()::text, ${order.id as string},
          ${item.product_id as string}, ${item.product_name as string},
          ${item.ordered_unit as string}, ${item.ordered_qty_display as number},
          ${item.ordered_qty_base as number}, ${item.base_price_paise as number},
          ${item.line_total_paise as number}
        )
      `;

      // Decrement product inventory by converted base quantity
      await sql`
        UPDATE products
        SET stock_base_qty = GREATEST(0, stock_base_qty - ${item.ordered_qty_base as number})
        WHERE id = ${item.product_id as string}
      `;
    }
  }

  return NextResponse.json({ quotation });
}
