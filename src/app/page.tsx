import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { LandingClient } from "@/components/public/LandingClient";
import Link from "next/link";
import { FlaskConical, Shield, Award, Truck, Calendar, Newspaper, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aasa Medchem — Premium Chemical & Pharmaceutical Ingredients",
  description: "Industry leading distributor of high-purity APIs, solvents, resins, and lab consumables. Customer value focus dedicated to solutions.",
};

export default async function IndexPage() {
  const session = await getServerSession(authOptions);
  
  // Fetch active products to display in catalog
  let products: any[] = [];
  try {
    products = await sql`
      SELECT id, name, sku, description, category, base_unit, base_price_paise 
      FROM products 
      WHERE is_active = true 
      ORDER BY category ASC, name ASC
    `;
  } catch (error) {
    console.error("Failed to load products for public landing:", error);
  }

  return (
    <div className="public-page min-h-screen text-gray-800">
      
      {/* 1. TOP UTILITY BAR */}
      <div className="pub-top-bar px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-4 text-xs tracking-wider">
          <span>Delhi Office: 011-257-7967</span>
          <span className="hidden md:inline text-gray-500">|</span>
          <span>Mumbai Office: 022-333-7784</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="#products-catalog" className="text-xs font-semibold hover:text-emerald-400 transition-colors uppercase tracking-wide">
            View Pricing
          </Link>
          <span className="text-gray-500 text-xs">|</span>
          <Link href="#contact-us" className="text-xs font-semibold hover:text-emerald-400 transition-colors uppercase tracking-wide">
            Support Portal
          </Link>
        </div>
      </div>

      {/* 2. MAIN HEADER NAVBAR */}
      <header className="pub-nav sticky top-0 z-40 px-6 py-4 shadow-md bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <FlaskConical size={20} />
            </div>
            <div>
              <span className="font-display text-xl font-bold text-gray-900 tracking-tight block">Aasa Medchem</span>
              <span className="text-[10px] text-gray-400 font-semibold tracking-widest uppercase block -mt-1">Chemical Company</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link href="#about-us" className="pub-nav-link">About Us</Link>
            <Link href="#products-catalog" className="pub-nav-link">Products</Link>
            <Link href="#services" className="pub-nav-link">Services</Link>
            <Link href="#why-us" className="pub-nav-link">Supplier Partners</Link>
            <Link href="#news-events" className="pub-nav-link">News & Events</Link>
            <Link href="#contact-us" className="pub-nav-link">Contact</Link>
          </nav>

          {/* Client Portal Access */}
          <div className="flex items-center gap-3">
            {session ? (
              <Link 
                href="/dashboard" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all duration-200"
                id="portal-dashboard-btn"
              >
                Portal Dashboard <ArrowUpRight size={14} />
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="border-2 border-emerald-600 hover:bg-emerald-50 text-emerald-700 font-semibold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all duration-200"
                id="portal-login-btn"
              >
                Client Portal
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 3. HERO BANNER */}
      <section className="pub-hero relative min-h-[520px] flex items-center px-6 text-white py-16">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/70 to-transparent pointer-events-none" />
        
        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className="max-w-xl animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Purity & Solution Driven
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4 tracking-tight">
              AN INDUSTRY LEADER
            </h1>
            
            <p className="text-lg text-slate-200 mb-8 font-light leading-relaxed">
              Customer value focus dedicated to solutions. We supply pharmaceutical grade active pharmaceutical ingredients (APIs), specialty solvents, and chemical reagents with absolute precision.
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <Link href="#products-catalog" className="pub-btn-green px-6 py-3 rounded-lg text-sm font-semibold tracking-wide flex items-center gap-2 shadow-lg">
                Explore Catalog
              </Link>
              <Link href="#about-us" className="border border-white/40 hover:border-white bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. VALUE PROPOSITION SECTION */}
      <section className="bg-slate-50 py-12 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-sm border border-gray-100 shrink-0">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Regulatory Standards</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Compliance with ISO and WHO guidelines. We provide complete analysis certificates (COA) for all items.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-sm border border-gray-100 shrink-0">
              <Award size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Premium Grade Purity</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Rigorous quality inspection in certified labs ensures our chemical compounds satisfy analytical criteria.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-sm border border-gray-100 shrink-0">
              <Truck size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Global Logistics</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Cold chain storage and prompt freight coordination for sensitive medical substances worldwide.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE SHOWCASE & SEARCH (LOADS THE DYNAMIC CLIENT COMPONENT) */}
      <LandingClient products={products} session={session} />

      {/* 6. ABOUT US & SERVICES */}
      <section className="bg-slate-50 py-16 px-6 border-b border-gray-200" id="about-us">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-2">About Us</span>
            <h2 className="font-display text-3xl font-bold text-gray-950 mb-6 leading-snug">
              Providing High-Performance Chemistry for Pharmaceutical Advancements
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              At Aasa Medchem, we are specialized in bulk ingredient procurement and chemical solutions distribution. We bridge the gap between quality manufacturers and formulation laboratories across Asia, offering tailored sourcing, precise warehousing, and thorough logistics.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We leverage an advanced real-time digital inventory system—our Client Portal—to guarantee transparency. Registered clients can request instant quotations, review active stock levels, and track commercial orders online with maximum ease.
            </p>
          </div>
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm text-center">
              <p className="text-3xl font-bold text-emerald-600 mb-1">100%</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quality Audited</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm text-center">
              <p className="text-3xl font-bold text-emerald-600 mb-1">500k+</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Grams in Stock</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm text-center col-span-2">
              <p className="text-xl font-bold text-gray-900 mb-1">ISO 9001:2015</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Certified Distributor</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. NEWS & ANNOUNCEMENTS */}
      <section className="bg-white py-16 px-6 border-b border-gray-200" id="news-events">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-2">Corporate Feed</span>
            <h2 className="font-display text-3xl font-bold text-gray-900">Recent News & Announcements</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="pub-card flex flex-col justify-between overflow-hidden">
              <div className="p-6">
                <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5 mb-3">
                  <Calendar size={13} /> June 01, 2026
                </span>
                <h3 className="font-semibold text-gray-950 mb-2 hover:text-emerald-600 transition-colors">
                  Aasa Medchem Expands API Logistics and Distribution Facility in Delhi
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  We are proud to announce the launching of our upgraded climate-controlled API warehouse facility, enhancing capacity for sensitive biological ingredients by 150%.
                </p>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs font-semibold text-emerald-700">
                <span>Read Full Article</span>
                <Newspaper size={14} />
              </div>
            </div>

            {/* Card 2 */}
            <div className="pub-card flex flex-col justify-between overflow-hidden">
              <div className="p-6">
                <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5 mb-3">
                  <Calendar size={13} /> May 18, 2026
                </span>
                <h3 className="font-semibold text-gray-950 mb-2 hover:text-emerald-600 transition-colors">
                  Understanding Active Pharmaceutical Ingredients (APIs) Grade Standards
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  A review of USP grade paracetamol sourcing parameters and chemical validation measures implemented at our testing site to secure flawless purity.
                </p>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs font-semibold text-emerald-700">
                <span>Read Technical Note</span>
                <Newspaper size={14} />
              </div>
            </div>

            {/* Card 3 */}
            <div className="pub-card flex flex-col justify-between overflow-hidden">
              <div className="p-6">
                <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5 mb-3">
                  <Calendar size={13} /> April 24, 2026
                </span>
                <h3 className="font-semibold text-gray-950 mb-2 hover:text-emerald-600 transition-colors">
                  Upcoming Sourcing Webinars: Bio-Active Synthetics and Reagents
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Register for our upcoming virtual panel featuring lead organic synthesis scientists discussing polymer resins and the next era of chemical sourcing solutions.
                </p>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs font-semibold text-emerald-700">
                <span>Register Online</span>
                <Newspaper size={14} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="pub-footer py-16 px-6 text-sm" id="contact-us">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-gray-800 pb-12 mb-12">
          {/* Logo & Contact details */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <FlaskConical size={20} />
              </div>
              <span className="font-display text-lg font-bold text-white tracking-tight">Aasa Medchem</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-sm leading-relaxed">
              Customer value focus dedicated to solutions. High-purity pharmaceutical substances, solvents, and specialty compounds.
            </p>
            <div className="space-y-2 text-gray-400">
              <p>Email: <strong className="text-white">procurement@aasamed.com</strong></p>
              <p>Inquiries: <strong className="text-white">sales@aasamed.com</strong></p>
              <p>Address: <strong className="text-white">Industrial Area Ph-1, Okhla, New Delhi, 110020</strong></p>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold uppercase tracking-wider text-xs mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-gray-400">
              <li><Link href="#about-us" className="hover:text-white transition-colors">Corporate Profile</Link></li>
              <li><Link href="#products-catalog" className="hover:text-white transition-colors">Active Products</Link></li>
              <li><Link href="#why-us" className="hover:text-white transition-colors">Supplier Partnerships</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Client login portal</Link></li>
            </ul>
          </div>

          {/* Regulatory */}
          <div>
            <h4 className="text-white font-semibold uppercase tracking-wider text-xs mb-4">Legal & Regulatory</h4>
            <ul className="space-y-2.5 text-gray-400">
              <li><span className="hover:text-white transition-colors cursor-pointer">Quality Manual</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">COA Validation API</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Privacy Statement</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Terms of Sale</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-xs">
          <p>© {new Date().getFullYear()} Aasa Medchem Chemical Company. All rights reserved.</p>
          <p>Designed in compliance with WHO Good Distribution Practices (GDP) standard guidelines.</p>
        </div>
      </footer>

    </div>
  );
}
