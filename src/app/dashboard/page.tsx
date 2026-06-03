import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { paiseToINR } from "@/lib/schema";
import { Package, FileText, ShoppingCart, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user.role === "admin";

  const [productCount] = await sql`SELECT COUNT(*) AS count FROM products WHERE is_active = true`;
  const [quotationCount] = await sql`
    SELECT COUNT(*) AS count FROM quotations
    ${isAdmin ? sql`` : sql`WHERE seller_id = ${session!.user.id}`}
  `;
  const [orderCount] = await sql`
    SELECT COUNT(*) AS count FROM orders
    ${isAdmin ? sql`` : sql`WHERE seller_id = ${session!.user.id}`}
  `;
  const [revenue] = await sql`
    SELECT COALESCE(SUM(total_paise), 0) AS total FROM orders WHERE status != 'cancelled'
    ${isAdmin ? sql`` : sql`AND seller_id = ${session!.user.id}`}
  `;

  const stats = [
    {
      label: "Active Products",
      value: productCount.count as string,
      icon: Package,
      color: "#5bb05b",
      bg: "rgba(91,176,91,0.08)",
    },
    {
      label: "Quotations",
      value: quotationCount.count as string,
      icon: FileText,
      color: "#d4a84b",
      bg: "rgba(212,168,75,0.08)",
    },
    {
      label: "Orders",
      value: orderCount.count as string,
      icon: ShoppingCart,
      color: "#6a9fd0",
      bg: "rgba(74,127,181,0.08)",
    },
    {
      label: isAdmin ? "Total Revenue" : "Your Order Value",
      value: `₹${Number(paiseToINR(Number(revenue.total))).toLocaleString("en-IN")}`,
      icon: TrendingUp,
      color: "#a87fd4",
      bg: "rgba(168,127,212,0.08)",
    },
  ];

  const recentQuotations = await sql`
    SELECT q.id, q.status, q.total_paise, q.created_at, u.name AS seller_name
    FROM quotations q JOIN users u ON u.id = q.seller_id
    ${isAdmin ? sql`` : sql`WHERE q.seller_id = ${session!.user.id}`}
    ORDER BY q.created_at DESC LIMIT 5
  `;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-ink-100">
          Welcome back, {session?.user.name?.split(" ")[0]}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
          {isAdmin ? "Manage your inventory, review quotations and orders." : "Browse products and manage your orders."}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                <Icon size={17} style={{ color }} />
              </div>
            </div>
            <p className="text-2xl font-semibold text-ink-100 inr">{value}</p>
            <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Recent quotations */}
      <div className="card">
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <h2 className="font-display text-base font-semibold text-ink-200">Recent Quotations</h2>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
          {recentQuotations.length === 0 && (
            <div className="px-5 py-8 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
              No quotations yet.
            </div>
          )}
          {recentQuotations.map((q) => {
            const statusColors: Record<string, string> = {
              pending: "badge-yellow",
              approved: "badge-green",
              rejected: "badge-red",
              converted: "badge-blue",
            };
            return (
              <div key={q.id as string} className="px-5 py-3.5 flex items-center justify-between table-row-hover">
                <div>
                  <p className="text-sm font-medium text-ink-200">
                    #{(q.id as string).slice(0, 8).toUpperCase()}
                  </p>
                  {isAdmin && <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{q.seller_name as string}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${statusColors[q.status as string] ?? "badge-gray"}`}>
                    {q.status as string}
                  </span>
                  <span className="inr text-sm text-ink-300">
                    ₹{Number(paiseToINR(Number(q.total_paise))).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
