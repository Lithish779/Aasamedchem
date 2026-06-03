"use client";

import React, { useState } from "react";
import { Search, X, CheckCircle, Mail, Phone, Building, MessageSquare, ArrowRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  base_unit: string;
  base_price_paise: string;
}

interface LandingClientProps {
  products: Product[];
  session: any;
}

export function LandingClient({ products, session }: LandingClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quoteProduct, setQuoteProduct] = useState("");
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    company: "",
    quantity: "",
    unit: "kg",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Extract unique categories
  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  function handleOpenQuote(productName: string = "") {
    setQuoteProduct(productName);
    setIsQuoteOpen(true);
    setIsSubmitted(false);
  }

  async function handleQuoteSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    setIsSubmitted(true);
    // Reset form after delay
    setTimeout(() => {
      setIsQuoteOpen(false);
      setIsSubmitted(false);
      setFormData({
        name: session?.user?.name || "",
        email: session?.user?.email || "",
        company: "",
        quantity: "",
        unit: "kg",
        message: "",
      });
    }, 3000);
  }

  return (
    <>
      {/* Top Bar Quote Button trigger & Header Search trigger */}
      {/* (Instead of duplicate code, we can hook triggers via global state or custom hooks, but rendering the interactive elements in page.tsx by importing LandingClient is cleaner) */}

      {/* Hero section buttons & search bar */}
      <section className="bg-white py-12 px-6 border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h2 className="font-display text-3xl font-semibold text-gray-900" id="products-catalog">
                Product Catalog & Inventory
              </h2>
              <p className="text-gray-500 mt-1">Explore our current inventory of premium pharmaceutical APIs, solvents, and resins.</p>
            </div>
            
            {/* Search and filter controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  id="catalog-search"
                  placeholder="Search products, SKU..."
                  className="pub-input pl-9 pr-4 py-2 w-64 shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              </div>
              
              <select
                id="category-filter"
                className="pub-input px-3 py-2 bg-white shadow-sm cursor-pointer"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-500 card bg-gray-50 border-dashed border-2">
                No products found matching your criteria.
              </div>
            ) : (
              filteredProducts.map((p) => (
                <div key={p.id} className="pub-card flex flex-col justify-between p-5 h-full">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                        {p.category}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">SKU: {p.sku}</span>
                    </div>

                    <h3 className="text-base font-semibold text-gray-900 mb-1">{p.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">{p.description}</p>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between pt-3 border-t border-gray-100">
                      <div>
                        <span className="text-xs text-gray-400 block">Base Price</span>
                        <span className="text-sm font-semibold text-gray-900">
                          ₹{(Number(p.base_price_paise) / 100).toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500 font-medium"> / {p.base_unit}</span>
                      </div>
                      <button
                        onClick={() => handleOpenQuote(p.name)}
                        className="pub-btn-green text-xs px-3 py-1.5 rounded-md flex items-center gap-1"
                        id={`quote-btn-${p.id}`}
                      >
                        Inquire <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Floating Action Button for Quick Quote */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => handleOpenQuote()}
          className="pub-btn-quote shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold uppercase tracking-wider"
          id="floating-quote-btn"
        >
          <Mail size={16} /> Request A Quote
        </button>
      </div>

      {/* Quote Request Modal */}
      {isQuoteOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden pub-card transform scale-100 transition-all duration-300">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold font-display">Request a Commercial Quote</h3>
                <p className="text-xs text-slate-400">Receive custom bulk pricing and lead times from our sales team.</p>
              </div>
              <button
                onClick={() => setIsQuoteOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
                id="close-modal-btn"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 animate-bounce">
                    <CheckCircle size={32} />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Inquiry Submitted Successfully!</h4>
                  <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                    Thank you. One of our procurement officers will contact you at <strong>{formData.email}</strong> within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleQuoteSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="quote-name">Full Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          id="quote-name"
                          className="pub-input w-full pl-9 pr-3 py-2"
                          placeholder="Your name"
                          value={formData.name}
                          onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                          required
                        />
                        <Mail className="absolute left-3 top-3 text-gray-400" size={14} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="quote-company">Company</label>
                      <div className="relative">
                        <input
                          type="text"
                          id="quote-company"
                          className="pub-input w-full pl-9 pr-3 py-2"
                          placeholder="Company name"
                          value={formData.company}
                          onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))}
                          required
                        />
                        <Building className="absolute left-3 top-3 text-gray-400" size={14} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="quote-email">Email Address</label>
                    <input
                      type="email"
                      id="quote-email"
                      className="pub-input w-full px-3 py-2"
                      placeholder="business@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="quote-product">Product Needed</label>
                      <select
                        id="quote-product"
                        className="pub-input w-full px-3 py-2 cursor-pointer bg-white"
                        value={quoteProduct}
                        onChange={(e) => setQuoteProduct(e.target.value)}
                        required
                      >
                        <option value="">-- Select a product --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.name}>
                            {p.name} ({p.sku})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="quote-quantity">Quantity</label>
                      <div className="flex">
                        <input
                          type="number"
                          id="quote-quantity"
                          className="pub-input w-full rounded-r-none px-3 py-2"
                          placeholder="100"
                          value={formData.quantity}
                          onChange={(e) => setFormData((p) => ({ ...p, quantity: e.target.value }))}
                          required
                        />
                        <select
                          id="quote-unit"
                          className="pub-input rounded-l-none border-l-0 px-2 py-2 cursor-pointer bg-gray-50 text-gray-600"
                          value={formData.unit}
                          onChange={(e) => setFormData((p) => ({ ...p, unit: e.target.value }))}
                        >
                          <option value="g">g</option>
                          <option value="kg">kg</option>
                          <option value="mL">mL</option>
                          <option value="L">L</option>
                          <option value="item">item</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="quote-message">Requirements / Message</label>
                    <div className="relative">
                      <textarea
                        id="quote-message"
                        className="pub-input w-full pl-9 pr-3 py-2 h-20 resize-none"
                        placeholder="Detail custom specs, delivery schedules, packaging preferences..."
                        value={formData.message}
                        onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                      />
                      <MessageSquare className="absolute left-3 top-3 text-gray-400" size={14} />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="pub-btn-green w-full py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium"
                    id="submit-quote-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      "Submit Quote Request"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
