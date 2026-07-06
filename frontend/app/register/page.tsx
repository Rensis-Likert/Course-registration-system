"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { saveSession } from "@/lib/auth";
import type { AuthUser } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    registrationNumber: "",
    course: "",
    yearOfStudy: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch<{ token: string; user: AuthUser }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          registrationNumber: form.registrationNumber,
          course: form.course || undefined,
          yearOfStudy: form.yearOfStudy ? Number(form.yearOfStudy) : undefined,
          password: form.password,
        }),
      });
      saveSession(data.token, data.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Could not create your account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-12">
      <div className="w-full max-w-md card p-8">
        <h2 className="text-2xl font-bold">Create your student account</h2>
        <p className="mb-6 mt-1 text-sm text-slate-500">
          Use your official DeKUT student email and registration number.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Full Name" value={form.fullName} onChange={(v) => update("fullName", v)} required />
          <Field
            label="Student Email"
            type="email"
            value={form.email}
            onChange={(v) => update("email", v)}
            placeholder="firstname.lastname24@students.dkut.ac.ke"
            required
          />
          <Field
            label="Registration Number"
            value={form.registrationNumber}
            onChange={(v) => update("registrationNumber", v)}
            placeholder="C25-01-0489/2023"
            required
          />
          <Field label="Course" value={form.course} onChange={(v) => update("course", v)} placeholder="BSc. Computer Science" />
          <Field
            label="Year of Study"
            type="number"
            value={form.yearOfStudy}
            onChange={(v) => update("yearOfStudy", v)}
            placeholder="3"
          />
          <Field
            label="Password"
            type="password"
            value={form.password}
            onChange={(v) => update("password", v)}
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gold py-3 text-sm font-bold text-navy hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "CREATE ACCOUNT"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-gold-dark hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold"
      />
    </div>
  );
}
