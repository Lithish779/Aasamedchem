"use client";
import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronRight, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { paiseToINR } from "@/lib/schema";
import { toast } from "@/components/ui/toaster";

type QuotationItem = {
  id: string; product_name: string; ordered_unit: string;
  ordered_qty_display: number; ordered_qty_base: number;
  base_price_paise: number; line_total_paise: number;
};
type Quotation = {
  id: string; status: string; notes: string | null; total_paise: number;
  created_at: string; seller_name: string; seller_email: string;
  items: QuotationItem[];
};

const STATUS_COLORS: Record<string, string> = {
  pending: "badge-yellow", approved: "badge-green",
  rejected: "badge-red", converted: "badge-blue",
};

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchQuotations = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/quotations");
    const data = await res.json();
    setQuotations(data.quotations ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchQuotations(); }, [fetchQuotations]);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    const res = await fetch(`/api/quotations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast(`Quotation ${status === "converted" ? "converted to order" : status}.`, "success");
      fetchQuotations();
    } else {
      toast("Failed to update.", "error");
    }
    setUpdating(null);
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink-100">Quotations</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>Review and manage incoming quotation requests</p>
      </div>

      {loading && <div className="text-center py-16 text-sm" style={{ color: "var(--color-text-muted)" }}>Loading…</div>}

      {!loading && quotations.length === 0 && (
        <div className="card py-16 text-center">
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No quotations found.</p>
        </div>
      )}

      <div className="space-y-3">
        {quotations.map((q) => (
          <div key={q.id} className="card overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
            {/* Header */}
            <div
              className="px-5 py-4 flex items-center gap-4 cursor-pointer table-row-hover"
              onClick={() => setExpanded(expanded === q.id ? null : q.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {expanded === q.id ? <ChevronDown size={14} style={{ color: "var(--color-text-muted)" }} /> : <ChevronRight size={14} style={{ color: "var(--color-text-muted)" }} />}
                  <span className="font-mono text-sm text-ink-300">#{q.id.slice(0, 8).toUpperCase()}</span>
                  <span className={`badge ${STATUS_COLORS[q.status] ?? "badge-gray"}`}>{q.status}</span>
                </div>
                <div className="mt-1 ml-5 flex items-center gap-3">
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{q.seller_name} · {q.seller_email}</span>
                  <span className="text-xs" style={{ color: "var(--color-text-dim)" }}>
                    {new Date(q.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="inr font-semibold text-ink-100">₹{Number(paiseToINR(q.total_paise)).toLocaleString("en-IN")}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{q.items?.length ?? 0} item(s)</p>
              </div>
              {q.status === "pending" && (
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => updateStatus(q.id, "approved")}
                    disabled={updating === q.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{ background: "rgba(91,176,91,0.12)", color: "#5bb05b", border: "1px solid rgba(91,176,91,0.2)" }}
                  >
                    <CheckCircle size={12} /> Approve
                  </button>
                  <button
                    onClick={() => updateStatus(q.id, "rejected")}
                    disabled={updating === q.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{ background: "rgba(201,74,58,0.12)", color: "#e06a5a", border: "1px solid rgba(201,74,58,0.2)" }}
                  >
                    <XCircle size={12} /> Reject
                  </button>
                </div>
              )}
              {q.status === "approved" && (
                <button
                  onClick={(e) => { e.stopPropagation(); updateStatus(q.id, "converted"); }}
                  disabled={updating === q.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: "rgba(74,127,181,0.12)", color: "#6a9fd0", border: "1px solid rgba(74,127,181,0.2)" }}
                >
                  <ArrowRight size={12} /> Convert to Order
                </button>
              )}
            </div>

            {/* Expanded items */}
            {expanded === q.id && (
              <div style={{ borderTop: "1px solid var(--color-border)" }}>
                {q.notes && (
                  <div className="px-5 py-3 text-sm" style={{ background: "var(--color-surface-2)", color: "var(--color-text-muted)" }}>
                    <span className="font-medium text-ink-400">Notes: </span>{q.notes}
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
                    {(q.items ?? []).map((item) => (
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
                        ₹{Number(paiseToINR(q.total_paise)).toLocaleString("en-IN")}
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
