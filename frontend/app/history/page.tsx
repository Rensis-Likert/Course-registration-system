"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { apiFetch } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import type { HistoryRow } from "@/types";

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700",
  approved: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  dropped: "bg-slate-200 text-slate-600",
  rejected: "bg-red-100 text-red-700",
};

export default function HistoryPage() {
  const router = useRouter();
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    apiFetch<{ history: HistoryRow[] }>("/api/history")
      .then((d) => setRows(d.history))
      .catch((e) => setError(e.message));
  }, [router]);

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-bold">Registration History</h1>
        <p className="mb-6 text-sm text-slate-500">Past and current semester units registration.</p>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-4 py-3">Semester</th>
                <th className="px-4 py-3">Unit Code</th>
                <th className="px-4 py-3">Unit Title</th>
                <th className="px-4 py-3">Lecturer</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="px-4 py-3">{row.semester}</td>
                  <td className="px-4 py-3">{row.unitCode}</td>
                  <td className="px-4 py-3">{row.unitTitle}</td>
                  <td className="px-4 py-3">{row.lecturer}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[row.status] || "bg-slate-100 text-slate-600"}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    No registration history yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
