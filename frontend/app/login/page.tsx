"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { saveSession } from "@/lib/auth";
import type { AuthUser } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"student" | "admin">("student");
  const [email, setEmail] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const path = tab === "student" ? "/api/auth/login/student" : "/api/auth/login/admin";
      const payload =
        tab === "student" ? { email, registrationNumber, password } : { email, password };

      const data = await apiFetch<{ token: string; user: AuthUser }>(path, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      saveSession(data.token, data.user);
      // Route based on role
      if (data.user.role === "admin") {
        router.push("/1admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Could not sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left hero panel */}
      <div className="flex flex-col justify-center gap-16 bg-navy px-10 py-12 text-white lg:w-1/2">
        <div>
          <div className="flex items-center gap-2 text-xl font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500">🎓</span>
            De<span className="text-gold">KUT</span>
          </div>
          <p className="mt-1 text-sm text-slate-300">Dedan Kimathi University of Technology</p>
        </div>

        <div className="max-w-md">
          <h1 className="text-3xl font-bold leading-tight">Course Unit Registration</h1>
          <p className="text-3xl font-bold text-gold">made simple.</p>
          <p className="mt-4 text-slate-300">
            Browse, select, and confirm your semester units — all in one place. Check your
            timetable for overlaps before you submit.
          </p>

          <div className="mt-10 space-y-6">
            <Feature
              emoji="🗓️"
              title="Live timetable grid"
              body="See your weekly schedule build in real time as you pick units."
            />
            <Feature
              emoji="⚠️"
              title="Overlap detection"
              body="Instantly flagged if two units overlap — before you submit."
            />
            <Feature
              emoji="🛡️"
              title="Secure with Admin management"
              body="Secure units, slots, and registration windows set by your department."
            />
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center bg-slate-100 px-6 py-12">
        <div className="w-full max-w-md card p-8">
          <div className="mb-6 grid grid-cols-2 overflow-hidden rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setTab("student")}
              className={`rounded-md py-2 text-sm font-semibold transition-colors ${
                tab === "student" ? "bg-white text-navy shadow" : "text-slate-500"
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setTab("admin")}
              className={`rounded-md py-2 text-sm font-semibold transition-colors ${
                tab === "admin" ? "bg-white text-navy shadow" : "text-slate-500"
              }`}
            >
              Admin/Staff
            </button>
          </div>

          <h2 className="text-2xl font-bold">Welcome back</h2>
          <p className="mb-6 mt-1 text-sm text-slate-500">
            Sign in with your {tab === "student" ? "student email and registration number" : "staff email and password"}.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                {tab === "student" ? "Student Email" : "Staff Email"}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  tab === "student"
                    ? "e.g. firstname.lastname24@students.dkut.ac.ke"
                    : "e.g. yourname@dkut.ac.ke"
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold"
              />
            </div>

            {tab === "student" && (
              <div>
                <label className="mb-1 block text-sm font-medium">Registration Number</label>
                <input
                  type="text"
                  required
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="e.g. C25-01-0489/2023"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. YourPassword"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              <div className="mt-1 text-right text-sm">
                <a href="#" className="text-orange-600 hover:underline">
                  Forgot password?
                </a>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gold py-3 text-sm font-bold text-navy transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "SIGN IN"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
            <div className="h-px flex-1 bg-slate-200" />
            or
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* This section now only shows if the student tab is active */}
          {tab === "student" && (
            <p className="text-center text-sm text-slate-500">
              New student?{" "}
              <a href="/register" className="font-medium text-gold-dark hover:underline">
                Create an account
              </a>
            </p>
          )}
          
          <p className="mt-2 text-center text-sm text-slate-500">
            Having problems signing in? Contact{" "}
            <a href="#" className="text-orange-600 hover:underline">
              ICT Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({ emoji, title, body }: { emoji: string; title: string; body: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-white/10 text-lg">
        {emoji}
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-slate-300">{body}</p>
      </div>
    </div>
  );
}