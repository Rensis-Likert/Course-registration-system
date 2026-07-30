// app/1admin/account/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { getCurrentUser, isLoggedIn } from "@/lib/auth";
import type { AuthUser } from "@/types";

export default function AdminAccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    const currentUser = getCurrentUser();
    if (currentUser?.role !== "admin") {
      router.replace("/dashboard");
      return;
    }
    setUser(currentUser);
  }, [router]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Simple Header */}
        <header className="flex h-16 items-center justify-end border-b bg-[#0b132b] px-6 text-sm text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 font-bold">
            {user?.fullName?.split(" ").map(n => n[0]).join("") || "AD"}
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl px-8 py-12">
          <h1 className="mb-6 text-2xl font-bold text-navy">Admin Profile</h1>
          
          <div className="card space-y-4 p-8 bg-white rounded-lg shadow-sm border border-slate-100">
            <div className="mb-6 flex items-center gap-4 border-b border-slate-100 pb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700">
                {user?.fullName?.split(" ").map(n => n[0]).join("") || "AD"}
              </div>
              <div>
                <h2 className="text-xl font-bold text-navy">{user?.fullName || "System Administrator"}</h2>
                <p className="text-sm text-gold-dark">DeKUT Staff / Admin</p>
              </div>
            </div>

            <Row label="Full Name" value={user?.fullName} />
            <Row label="Email Address" value={user?.email} />
            <Row label="System Role" value={<span className="rounded bg-slate-100 px-2 py-1 text-xs font-bold uppercase tracking-wider text-slate-600">{user?.role}</span>} />
            
            <div className="pt-6 mt-6 border-t border-slate-100">
              <button 
                onClick={() => {
                  window.localStorage.clear();
                  router.push("/login");
                }}
                className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
              >
                Sign Out
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex justify-between py-2">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-navy">{value || "—"}</span>
    </div>
  );
}