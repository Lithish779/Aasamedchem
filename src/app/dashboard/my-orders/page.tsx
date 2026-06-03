"use client";
import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { paiseToINR } from "@/lib/schema";

type OrderItem = {
  id: string; product_name: string; ordered_unit: string;
  ordered_qty_display: number; ordered_qty_base: number;
  base_price_paise: number; line_total_paise: number;
};
type Order = {
  id: string; status: string; notes: string | null; total_paise: number;
  created_at: string; items: OrderItem[];
};

const STATUS_COLORS: Record<string, string> = {
  pending: "badge-yellow",
  processing: "badge-blue",
  shipped: "badge-yellow",
  delivered: "badge-green",
  cancelled: "badge-red",
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data.orders ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink-100">My Orders</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>Track the status and details of your active orders</p>
      </div>

      {loading && <div className="text-center py-16 text-sm" style={{ color: "var(--color-text-muted)" }}>Loading…</div>}

      {!loading && orders.length === 0 && (
        <div className="card py-16 text-center">
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>You have no orders yet.</p>
        </div>
      )}

      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="card overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
            {/* Header */}
            <div
              className="px-5 py-4 flex items-center gap-4 cursor-pointer table-row-hover"
              onClick={() => setExpanded(expanded === o.id ? null : o.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {expanded === o.id ? <ChevronDown size={14} style={{ color: "var(--color-text-muted)" }} /> : <ChevronRight size={14} style={{ color: "var(--color-text-muted)" }} />}
                  <span className="font-mono text-sm text-ink-300">#{o.id.slice(0, 8).toUpperCase()}</span>
                  <span className={`badge ${STATUS_COLORS[o.status] ?? "badge-gray"}`}>{o.status}</span>
                </div>
                <div className="mt-1 ml-5">
                  <span className="text-xs" style={{ color: "var(--color-text-dim)" }}>
                    Order created on {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="inr font-semibold text-ink-100">₹{Number(paiseToINR(o.total_paise)).toLocaleString("en-IN")}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{o.items?.length ?? 0} item(s)</p>
              </div>
            </div>

            {/* Expanded items */}
            {expanded === o.id && (
              <div style={{ borderTop: "1px solid var(--color-border)" }}>
                {o.notes && (
                  <div className="px-5 py-3 text-sm" style={{ background: "var(--color-surface-2)", color: "var(--color-text-muted)" }}>
                    <span className="font-medium text-ink-400">Notes: </span>{o.notes}
                  </div>
                )}
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: "var(--color-surface-2)", borderBottom: "1px solid var(--color-border)" }}>
                      <th className="px-5 py-2 text-left font-medium" style={{ color: "var(--color-text-muted)" }}>Product</th>
                      <th className="px-4 py-2 text-left font-medium" style={{ color: "var(--color-text-muted)" }}>Ordered Qty</th>
                      <th className="px-4 py-2 text-left font-medium" style={{ color: "var(--color-text-muted)" }}>Base Qty</th>
                      <th className="px-4 py-2 text-left font-medium" style={{ color: "var(--color-text-muted)" }}>Rate</th>
                      <th className="px-4 py-2 text-right font-medium" style={{ color: "var(--color-text-muted)" }}>Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: "var(--color-border)" }}>
                    {(o.items ?? []).map((item) => (
                      <tr key={item.id} className="table-row-hover">
                        <td className="px-5 py-3 text-ink-200 font-medium">{item.product_name}</td>
                        <td className="px-4 py-3 font-mono text-ink-300">
                          {Number(item.ordered_qty_display).toLocaleString("en-IN", { maximumFractionDigits: 4 })} {item.ordered_unit}
                        </td>
                        <td className="px-4 py-3 font-mono text-ink-400">
                          {Number(item.ordered_qty_base).toLocaleString("en-IN", { maximumFractionDigits: 4 })} (base)
                        </td>
                        <td className="px-4 py-3 inr text-ink-300">₹{paiseToINR(item.base_price_paise)}/base</td>
                        <td className="px-4 py-3 text-right inr font-semibold text-ink-100">
                          ₹{Number(paiseToINR(item.line_total_paise)).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                    <tr style={{ background: "var(--color-surface-2)" }}>
                      <td colSpan={4} className="px-5 py-3 text-right font-medium" style={{ color: "var(--color-text-muted)" }}>Total</td>
                      <td className="px-4 py-3 text-right inr font-bold text-ink-100">
                        ₹{Number(paiseToINR(o.total_paise)).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
