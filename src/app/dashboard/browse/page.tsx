"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, ShoppingCart, Plus, Minus, Trash2, FlaskConical, Send, Info } from "lucide-react";
import { paiseToINR, UNIT_TO_BASE, toBaseUnit, calculateOrderTotal, UNITS_FOR_DIMENSION, Unit, UnitDimension, unitDimension } from "@/lib/schema";
import { toast } from "@/components/ui/toaster";

type Product = {
  id: string; name: string; sku: string | null; description: string | null;
  category: string | null; base_unit: Unit; dimension: UnitDimension;
  base_price_paise: number; stock_base_qty: number; is_active: boolean;
};

type CartItem = {
  product: Product;
  quantity: number;
  unit: Unit;
};

const CATEGORIES = ["APIs", "Solvents", "Reagents", "Resins", "Consumables", "Excipients", "Other"];

function formatStock(qty: number, unit: string): string {
  const q = Number(qty);
  if (unit === "g" && q >= 1000) return `${(q / 1000).toLocaleString("en-IN", { maximumFractionDigits: 2 })} kg`;
  if (unit === "mL" && q >= 1000) return `${(q / 1000).toLocaleString("en-IN", { maximumFractionDigits: 2 })} L`;
  return `${q.toLocaleString("en-IN", { maximumFractionDigits: 2 })} ${unit}`;
}

export default function BrowseProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ active: "true" });
    if (search) params.set("search", search);
    if (categoryFilter) params.set("category", categoryFilter);
    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data.products ?? []);
    setLoading(false);
  }, [search, categoryFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  function addToCart(p: Product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === p.id);
      if (existing) {
        return prev;
      }
      return [...prev, { product: p, quantity: 1, unit: p.base_unit }];
    });
    toast(`Added ${p.name} to cart.`, "info");
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }

  function updateCartItemQty(productId: string, qty: number) {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: Math.max(0.000001, qty) } : item
      )
    );
  }

  function updateCartItemUnit(productId: string, unit: Unit) {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, unit } : item
      )
    );
  }

  async function submitQuotation() {
    if (cart.length === 0) return;
    setSubmitting(true);

    const payload = {
      notes: notes || undefined,
      items: cart.map((item) => ({
        product_id: item.product.id,
        ordered_unit: item.unit,
        ordered_qty_display: item.quantity,
      })),
    };

    const res = await fetch("/api/quotations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast("Quotation submitted successfully!", "success");
      setCart([]);
      setNotes("");
    } else {
      toast("Failed to submit quotation.", "error");
    }
    setSubmitting(false);
  }

  // Calculate order total
  const cartTotalPaise = cart.reduce((sum, item) => {
    return sum + calculateOrderTotal(item.quantity, item.unit, item.product.base_price_paise);
  }, 0);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink-100">Browse Catalog</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>Search products and build your quotation request</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Products Search & List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-2.5" style={{ color: "var(--color-text-dim)" }} />
              <input className="input pl-8 text-sm" placeholder="Search by name, SKU, or category…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="select w-44" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="text-center py-16 text-sm" style={{ color: "var(--color-text-muted)" }}>Loading catalog…</div>
          ) : products.length === 0 ? (
            <div className="card py-16 text-center">
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No products found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((p) => (
                <div key={p.id} className="card p-5 flex flex-col justify-between hover:border-brand-dim/30 transition-all">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(91,176,91,0.08)" }}>
                          <FlaskConical size={14} style={{ color: "#5bb05b" }} />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-ink-200">{p.name}</h3>
                          {p.sku && <span className="font-mono text-[10px]" style={{ color: "var(--color-text-dim)" }}>{p.sku}</span>}
                        </div>
                      </div>
                      {p.category && <span className="badge badge-gray">{p.category}</span>}
                    </div>

                    <p className="text-xs line-clamp-2 mt-2 mb-3" style={{ color: "var(--color-text-muted)" }}>
                      {p.description || "No description provided."}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs py-2 px-3 rounded-lg bg-ink-900 border" style={{ borderColor: "var(--color-border)" }}>
                      <div>
                        <p style={{ color: "var(--color-text-dim)" }}>Rate</p>
                        <p className="font-medium text-ink-200 inr">₹{paiseToINR(p.base_price_paise)} / {p.base_unit}</p>
                      </div>
                      <div>
                        <p style={{ color: "var(--color-text-dim)" }}>Stock</p>
                        <p className="font-medium text-ink-200">{formatStock(p.stock_base_qty, p.base_unit)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() => addToCart(p)}
                      disabled={cart.some((item) => item.product.id === p.id)}
                      className="btn-secondary w-full text-xs py-2 flex items-center justify-center gap-2 hover:border-brand/40"
                    >
                      <Plus size={13} /> {cart.some((item) => item.product.id === p.id) ? "Added to Cart" : "Add to Quotation"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quotation Cart Panel */}
        <div className="card p-5 space-y-4 sticky top-6">
          <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: "var(--color-border)" }}>
            <ShoppingCart size={16} className="text-brand" />
            <h2 className="font-display text-base font-semibold text-ink-200">Quotation Cart</h2>
            <span className="ml-auto badge badge-gray font-mono">{cart.length} item(s)</span>
          </div>

          {cart.length === 0 ? (
            <div className="py-12 text-center text-xs" style={{ color: "var(--color-text-muted)" }}>
              Your cart is empty. Add products from the catalog to build a quotation request.
            </div>
          ) : (
            <>
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1">
                {cart.map((item) => {
                  const dims = UNITS_FOR_DIMENSION[item.product.dimension];
                  const lineTotal = calculateOrderTotal(item.quantity, item.unit, item.product.base_price_paise);
                  const baseQty = toBaseUnit(item.quantity, item.unit);

                  return (
                    <div key={item.product.id} className="p-3.5 rounded-lg bg-ink-900 border space-y-3 relative group" style={{ borderColor: "var(--color-border)" }}>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="absolute right-2 top-2 text-ink-500 hover:text-red-400 p-1 rounded transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>

                      <div>
                        <h4 className="text-xs font-semibold text-ink-200 truncate pr-6">{item.product.name}</h4>
                        <p className="text-[10px]" style={{ color: "var(--color-text-dim)" }}>Rate: ₹{paiseToINR(item.product.base_price_paise)}/{item.product.base_unit}</p>
                      </div>

                      {/* Quantity & Unit Selectors */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--color-text-dim)" }}>Qty</label>
                          <input
                            type="number"
                            step="any"
                            min="0.000001"
                            className="input text-xs py-1 px-2 mt-0.5"
                            value={item.quantity}
                            onChange={(e) => updateCartItemQty(item.product.id, parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--color-text-dim)" }}>Unit</label>
                          <select
                            className="select text-xs py-1 px-2 mt-0.5 w-full"
                            value={item.unit}
                            onChange={(e) => updateCartItemUnit(item.product.id, e.target.value as Unit)}
                          >
                            {dims.map((u) => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </div>
                      </div>

                      {/* Conversion explanation & total */}
                      <div className="pt-2 border-t flex flex-col gap-1" style={{ borderColor: "var(--color-border)" }}>
                        <div className="flex items-center gap-1 text-[9px]" style={{ color: "var(--color-text-dim)" }}>
                          <Info size={9} />
                          <span>
                            {item.quantity} {item.unit} = {baseQty} {item.product.base_unit} (base)
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs pt-1">
                          <span style={{ color: "var(--color-text-muted)" }}>Total:</span>
                          <span className="inr font-bold text-brand">₹{paiseToINR(lineTotal)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="label text-[10px]">Quotation Notes (optional)</label>
                <textarea
                  className="input text-xs resize-none"
                  rows={2}
                  placeholder="E.g. delivery preferences, packaging..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Pricing breakdown */}
              <div className="pt-3 border-t space-y-2" style={{ borderColor: "var(--color-border)" }}>
                <div className="flex justify-between text-sm font-semibold">
                  <span style={{ color: "var(--color-text-muted)" }}>Quotation Total:</span>
                  <span className="inr text-ink-100">₹{Number(paiseToINR(cartTotalPaise)).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <button
                onClick={submitQuotation}
                disabled={submitting}
                className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 mt-2"
              >
                <Send size={13} /> {submitting ? "Sending Request..." : "Request Quotation"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
