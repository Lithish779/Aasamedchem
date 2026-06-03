"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  FlaskConical, LayoutDashboard, Package, ShoppingCart,
  FileText, LogOut, ChevronDown
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

interface SidebarProps { role: string; userName: string; userEmail: string; }

export function Sidebar({ role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const [userOpen, setUserOpen] = useState(false);
  const isAdmin = role === "admin";

  const adminLinks = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/dashboard/products", icon: Package, label: "Products" },
    { href: "/dashboard/quotations", icon: FileText, label: "Quotations" },
    { href: "/dashboard/orders", icon: ShoppingCart, label: "Orders" },
  ];

  const sellerLinks = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/dashboard/browse", icon: Package, label: "Browse Products" },
    { href: "/dashboard/my-quotations", icon: FileText, label: "My Quotations" },
    { href: "/dashboard/my-orders", icon: ShoppingCart, label: "My Orders" },
  ];

  const links = isAdmin ? adminLinks : sellerLinks;

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 flex flex-col z-20" style={{ background: "var(--color-surface)", borderRight: "1px solid var(--color-border)" }}>
      {/* Logo */}
      <div className="p-5 flex items-center gap-2.5" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(91,176,91,0.12)" }}>
          <FlaskConical size={16} style={{ color: "#5bb05b" }} />
        </div>
        <div>
          <p className="font-display text-sm font-semibold text-ink-100">AasaMedChem</p>
          <p className="text-[10px]" style={{ color: "var(--color-text-dim)" }}>{isAdmin ? "Admin Panel" : "Seller Portal"}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] uppercase tracking-widest px-3 py-2" style={{ color: "var(--color-text-dim)" }}>
          {isAdmin ? "Administration" : "Catalog & Orders"}
        </p>
        {links.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={clsx("sidebar-link", pathname === href && "active")}
          >
            <Icon size={16} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="p-3" style={{ borderTop: "1px solid var(--color-border)" }}>
        <button
          onClick={() => setUserOpen((v) => !v)}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-ink-900 transition-colors"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: isAdmin ? "rgba(91,176,91,0.15)" : "rgba(74,127,181,0.15)", color: isAdmin ? "#5bb05b" : "#6a9fd0" }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 text-left overflow-hidden">
            <p className="text-xs font-medium text-ink-200 truncate">{userName}</p>
            <p className="text-[10px] truncate" style={{ color: "var(--color-text-dim)" }}>{role}</p>
          </div>
          <ChevronDown size={12} style={{ color: "var(--color-text-muted)" }} />
        </button>

        {userOpen && (
          <div className="mt-1 rounded-lg overflow-hidden" style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
            <div className="px-3 py-2 border-b" style={{ borderColor: "var(--color-border)" }}>
              <p className="text-xs text-ink-400 truncate">{userEmail}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs hover:bg-ink-800 transition-colors text-left"
              style={{ color: "#e06a5a" }}
            >
              <LogOut size={13} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
