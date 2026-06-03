"use client";
import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronRight, CheckCircle, Package, Truck, Home, XCircle } from "lucide-react";
import { paiseToINR } from "@/lib/schema";
import { toast } from "@/components/ui/toaster";

type OrderItem = {
  id: string; product_name: string; ordered_unit: string;
  ordered_qty_display: number; ordered_qty_base: number;
  base_price_paise: number; line_total_paise: number;
};
type Order = {
  id: string; status: string; notes: string | null; total_paise: number;
  created_at: string; seller_name: string; seller_email: string;
  items: OrderItem[];
};

const STATUS_COLORS: Record<string, string> = {
  pending: "badge-yellow",
  processing: "badge-blue",
  shipped: "badge-yellow",
  delivered: "badge-green",
  cancelled: "badge-red",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data.orders ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast(`Order updated to ${status}.`, "success");
      fetchOrders();
    } else {
      toast("Failed to update status.", "error");
    }
    setUpdating(null);
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink-100">Orders</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>Monitor fulfillment status of processed transactions</p>
      </div>

      {loading && <div className="text-center py-16 text-sm" style={{ color: "var(--color-text-muted)" }}>Loading…</div>}

      {!loading && orders.length === 0 && (
        <div className="card py-16 text-center">
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No orders found.</p>
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
                <div className="mt-1 ml-5 flex items-center gap-3">
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{o.seller_name} · {o.seller_email}</span>
                  <span className="text-xs" style={{ color: "var(--color-text-dim)" }}>
                    {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="inr font-semibold text-ink-100">₹{Number(paiseToINR(o.total_paise)).toLocaleString("en-IN")}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{o.items?.length ?? 0} item(s)</p>
              </div>
              
              {/* Status Actions */}
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                {o.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateStatus(o.id, "processing")}
                      disabled={updating === o.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ background: "rgba(74,127,181,0.12)", color: "#6a9fd0", border: "1px solid rgba(74,127,181,0.2)" }}
                    >
                      <Package size={12} /> Process
                    </button>
                    <button
                      onClick={() => updateStatus(o.id, "cancelled")}
                      disabled={updating === o.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ background: "rgba(201,74,58,0.12)", color: "#e06a5a", border: "1px solid rgba(201,74,58,0.2)" }}
                    >
                      <XCircle size={12} /> Cancel
                    </button>
                  </>
                )}
                {o.status === "processing" && (
                  <>
                    <button
                      onClick={() => updateStatus(o.id, "shipped")}
                      disabled={updating === o.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ background: "rgba(212,168,75,0.12)", color: "#d4a84b", border: "1px solid rgba(212,168,75,0.2)" }}
                    >
                      <Truck size={12} /> Ship
                    </button>
                    <button
                      onClick={() => updateStatus(o.id, "cancelled")}
                      disabled={updating === o.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ background: "rgba(201,74,58,0.12)", color: "#e06a5a", border: "1px solid rgba(201,74,58,0.2)" }}
                    >
                      <XCircle size={12} /> Cancel
                    </button>
                  </>
                )}
                {o.status === "shipped" && (
                  <button
                    onClick={() => updateStatus(o.id, "delivered")}
                    disabled={updating === o.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{ background: "rgba(91,176,91,0.12)", color: "#5bb05b", border: "1px solid rgba(91,176,91,0.2)" }}
                  >
                    <Home size={12} /> Deliver
                  </button>
                )}
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
                      <th className="px-4 py-2 text-left font-medium" style={{ color: "var(--color-text-muted)" }}>Base Qty (internal)</th>
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
