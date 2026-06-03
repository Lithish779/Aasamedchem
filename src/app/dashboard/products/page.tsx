"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Search, X, FlaskConical } from "lucide-react";
import { paiseToINR } from "@/lib/schema";
import { toast } from "@/components/ui/toaster";

type Product = {
  id: string; name: string; sku: string | null; description: string | null;
  category: string | null; base_unit: string; dimension: string;
  base_price_paise: number; stock_base_qty: number; is_active: boolean;
};

const UNITS = ["g", "kg", "mL", "L", "item"] as const;
const CATEGORIES = ["APIs", "Solvents", "Reagents", "Resins", "Consumables", "Excipients", "Other"];

function formatStock(qty: number, unit: string): string {
  const q = Number(qty);
  if (unit === "g" && q >= 1000) return `${(q / 1000).toLocaleString("en-IN", { maximumFractionDigits: 2 })} kg`;
  if (unit === "mL" && q >= 1000) return `${(q / 1000).toLocaleString("en-IN", { maximumFractionDigits: 2 })} L`;
  return `${q.toLocaleString("en-IN", { maximumFractionDigits: 2 })} ${unit}`;
}

const emptyForm = { name: "", sku: "", description: "", category: "", base_unit: "g" as string, base_price_inr: "", stock_base_qty: "", is_active: true };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ active: "false" });
    if (search) params.set("search", search);
    if (categoryFilter) params.set("category", categoryFilter);
    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data.products ?? []);
    setLoading(false);
  }, [search, categoryFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  function openCreate() {
    setEditProduct(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setEditProduct(p);
    setForm({
      name: p.name, sku: p.sku ?? "", description: p.description ?? "",
      category: p.category ?? "", base_unit: p.base_unit,
      base_price_inr: paiseToINR(p.base_price_paise),
      stock_base_qty: String(p.stock_base_qty), is_active: p.is_active,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name || !form.base_price_inr) return;
    setSaving(true);
    const payload = {
      name: form.name,
      sku: form.sku || undefined,
      description: form.description || undefined,
      category: form.category || undefined,
      base_unit: form.base_unit,
      base_price_inr: parseFloat(form.base_price_inr as string),
      stock_base_qty: parseFloat(form.stock_base_qty as string) || 0,
      is_active: form.is_active,
    };

    const url = editProduct ? `/api/products/${editProduct.id}` : "/api/products";
    const method = editProduct ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

    if (res.ok) {
      toast(editProduct ? "Product updated." : "Product created.", "success");
      setModalOpen(false);
      fetchProducts();
    } else {
      toast("Failed to save product.", "error");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) { toast("Product deleted.", "success"); fetchProducts(); }
    else toast("Failed to delete.", "error");
  }

  const dimLabel: Record<string, string> = { weight: "Weight", volume: "Volume", count: "Count" };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-100">Products</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>Manage your pharmaceutical inventory</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={15} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-2.5" style={{ color: "var(--color-text-dim)" }} />
          <input className="input pl-8 text-sm" placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="select w-44" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-surface-2)" }}>
              {["Product", "SKU", "Category", "Base Unit", "Price/base", "Stock", "Status", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "var(--color-border)" }}>
            {loading && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>Loading…</td></tr>
            )}
            {!loading && products.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>No products found.</td></tr>
            )}
            {products.map((p) => (
              <tr key={p.id} className="table-row-hover">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(91,176,91,0.08)" }}>
                      <FlaskConical size={13} style={{ color: "#5bb05b" }} />
                    </div>
                    <div>
                      <p className="font-medium text-ink-200">{p.name}</p>
                      {p.description && <p className="text-xs mt-0.5 truncate max-w-48" style={{ color: "var(--color-text-dim)" }}>{p.description}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink-400">{p.sku ?? "—"}</td>
                <td className="px-4 py-3">
                  {p.category ? <span className="badge badge-gray">{p.category}</span> : <span style={{ color: "var(--color-text-dim)" }}>—</span>}
                </td>
                <td className="px-4 py-3 text-ink-300 font-mono text-xs">{p.base_unit} <span className="text-ink-500">({dimLabel[p.dimension]})</span></td>
                <td className="px-4 py-3 inr text-ink-200">₹{paiseToINR(p.base_price_paise)}/{p.base_unit}</td>
                <td className="px-4 py-3 text-ink-300">{formatStock(p.stock_base_qty, p.base_unit)}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${p.is_active ? "badge-green" : "badge-red"}`}>{p.is_active ? "Active" : "Inactive"}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(p)} className="btn-ghost p-1.5 text-ink-400 hover:text-ink-200">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="btn-ghost p-1.5 text-ink-400 hover:text-red-400">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="card w-full max-w-lg animate-slide-up" style={{ background: "var(--color-surface)" }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
              <h2 className="font-display text-base font-semibold text-ink-100">{editProduct ? "Edit Product" : "New Product"}</h2>
              <button onClick={() => setModalOpen(false)} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="label">Product Name *</label>
                  <input className="input" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="label">SKU</label>
                  <input className="input" value={form.sku} onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select className="select" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                    <option value="">None</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">Description</label>
                  <textarea className="input resize-none" rows={2} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Base Unit (internal storage)</label>
                  <select className="select" value={form.base_unit} onChange={(e) => setForm((p) => ({ ...p, base_unit: e.target.value }))} disabled={!!editProduct}>
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <p className="text-[10px] mt-1" style={{ color: "var(--color-text-dim)" }}>g→Weight · mL→Volume · item→Count. Cannot change after creation.</p>
                </div>
                <div>
                  <label className="label">Price per {form.base_unit} (₹ INR) *</label>
                  <input type="number" step="0.01" min="0" className="input" value={form.base_price_inr} onChange={(e) => setForm((p) => ({ ...p, base_price_inr: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Stock (in {form.base_unit})</label>
                  <input type="number" step="0.000001" min="0" className="input" value={form.stock_base_qty} onChange={(e) => setForm((p) => ({ ...p, stock_base_qty: e.target.value }))} />
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <input type="checkbox" id="active" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} className="w-4 h-4 rounded" />
                  <label htmlFor="active" className="text-sm text-ink-300">Active / visible to sellers</label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4" style={{ borderTop: "1px solid var(--color-border)" }}>
              <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? "Saving…" : "Save Product"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
