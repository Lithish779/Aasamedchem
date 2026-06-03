import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = session.user.role === "admin";

  const orders = await sql`
    SELECT
      o.id, o.quotation_id, o.status, o.notes, o.total_paise, o.created_at, o.updated_at,
      u.name AS seller_name, u.email AS seller_email,
      COALESCE(
        json_agg(json_build_object(
          'id', oi.id,
          'product_id', oi.product_id,
          'product_name', oi.product_name,
          'ordered_unit', oi.ordered_unit,
          'ordered_qty_display', oi.ordered_qty_display,
          'ordered_qty_base', oi.ordered_qty_base,
          'base_price_paise', oi.base_price_paise,
          'line_total_paise', oi.line_total_paise
        ) ORDER BY oi.created_at) FILTER (WHERE oi.id IS NOT NULL),
        '[]'::json
      ) AS items
    FROM orders o
    JOIN users u ON u.id = o.seller_id
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE ${isAdmin} OR o.seller_id = ${session.user.id}
    GROUP BY o.id, u.name, u.email
    ORDER BY o.created_at DESC
  `;

  return NextResponse.json({ orders });
}
