"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FlaskConical, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/dashboard");
    }
  }

  function fillDemo(role: "admin" | "seller") {
    setForm({
      email: role === "admin" ? "admin@aasa.com" : "seller@aasa.com",
      password: role === "admin" ? "admin123" : "seller123",
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-5" style={{ background: "radial-gradient(circle, #5bb05b 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full opacity-5" style={{ background: "radial-gradient(circle, #d4a84b 0%, transparent 70%)" }} />
        <svg className="absolute inset-0 w-full h-full opacity-[0.015]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="w-full max-w-sm animate-fade-in relative">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: "rgba(91,176,91,0.12)", border: "1px solid rgba(91,176,91,0.2)" }}>
            <FlaskConical size={26} style={{ color: "#5bb05b" }} />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink-100">AasaMedChem</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>Inventory & Order Management</p>
        </div>

        {/* Card */}
        <div className="card p-6 shadow-2xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <h2 className="font-display text-lg mb-5 text-ink-200">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  required
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-2.5 text-ink-500 hover:text-ink-300">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-400 px-3 py-2 rounded-lg" style={{ background: "rgba(201,74,58,0.1)", border: "1px solid rgba(201,74,58,0.2)" }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-5 pt-5" style={{ borderTop: "1px solid var(--color-border)" }}>
            <p className="text-xs text-center mb-3" style={{ color: "var(--color-text-dim)" }}>Demo credentials</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => fillDemo("admin")} className="btn-secondary text-xs py-2">
                Admin demo
              </button>
              <button onClick={() => fillDemo("seller")} className="btn-secondary text-xs py-2">
                Seller demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
