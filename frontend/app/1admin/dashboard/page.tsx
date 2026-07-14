// app/1admin/dashboard/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { getCurrentUser, isLoggedIn } from "@/lib/auth";

export default function AdminDashboardPage() {
  const router = useRouter();
  const user = getCurrentUser();

  useEffect(() => {
    if (!isLoggedIn() || user?.role !== "admin") {
      router.replace("/login");
    }
  }, [router, user]);

  return (
    // strict h-screen and hidden overflow prevents double scrolling
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header - Matched to 72px to align with Sidebar logo area */}
        <header className="flex h-[72px] flex-shrink-0 items-center justify-end border-b border-slate-200 bg-navy px-6 text-sm">
          <div className="flex items-center gap-4">
            <span className="rounded-full bg-slate-100 px-4 py-1.5 text-xs font-medium text-slate-600">
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
              Sem 1 • May-Aug • <span className="font-bold text-navy">2026</span> • Reg. <span className="font-bold text-emerald-600">Open</span>
            </span>
            <a href="/catalog" className="flex items-center gap-1 text-slate-500 hover:text-gold transition-colors font-medium">
              ↗ Student View
            </a>
            <div 
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-navy-light text-sm font-semibold text-gold ring-1 ring-gold/40 hover:bg-navy transition-colors" 
              onClick={() => router.push("/1admin/account")}
            >
              {user?.fullName?.split(" ").map(n => n[0]).join("") || "AD"}
            </div>
          </div>
        </header>

        {/* Main Content - Internal scrollable area */}
        <main className="flex-1 overflow-y-auto p-8">
          <p className="font-bold text-gold uppercase text-sm mb-1">Admin Dashboard</p>
          
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-navy">Semester 1: May-August 2026</h1>
              <p className="text-sm text-slate-500">DeKUT Unit Registration System - School of Computing & IT</p>
            </div>
            <div className="flex gap-3">
              <button className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors">
                📥 Export Report
              </button>
              <button className="rounded-md bg-gold px-4 py-2 text-sm font-bold text-navy hover:opacity-90 transition-opacity">
                ⚙ Reg. Window
              </button>
            </div>
          </div>

          {/* Alert Banner */}
          <div className="mb-6 rounded-md border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800 flex items-center gap-2 font-medium">
            ⚠️ Registration closes in 5 days — 58 students have not yet registered. Deadline: 15 July 2026 at 23:59.
          </div>

          {/* Stat Cards */}
          <div className="mb-8 grid grid-cols-5 gap-4">
            <AdminStatCard title="Timetable" value="247" icon="👥" sub="↑ 12 from last semester" subColor="text-emerald-600" borderTop="border-t-red-800" />
            <AdminStatCard title="Registered" value="247" icon="☑️" sub="↑ 76.5% completion rate" subColor="text-emerald-600" borderTop="border-t-emerald-500" />
            <AdminStatCard title="Pending/unregistered" value="247" icon="🕒" sub="⏳ Deadline: 15 July 2026" subColor="text-blue-500" borderTop="border-t-gold" />
            <AdminStatCard title="Active units this sem" value="10" icon="📖" sub="CS Year 3 - 5 depts." subColor="text-slate-500" borderTop="border-t-indigo-500" />
            <AdminStatCard title="Timetable" value="247" icon="⚠️" sub="Needs resolution" subColor="text-red-500" borderTop="border-t-red-500" />
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-2 gap-6 pb-8">
            {/* Registration Progress */}
            <div className="card bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h2 className="font-bold text-navy mb-1 text-lg">Registration Progress</h2>
              <p className="text-sm text-slate-500 mb-8">By department - Sem 1 2025/26</p>
              
              <div className="space-y-6">
                <ProgressBar label="Computing (CS)" percent={82} color="bg-blue-500" />
                <ProgressBar label="Mathematics" percent={74} color="bg-pink-500" />
                <ProgressBar label="Engineering" percent={68} color="bg-gold" />
                <ProgressBar label="Physics" percent={90} color="bg-red-800" />
                <ProgressBar label="Gen. Studies" percent={55} color="bg-navy" />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h2 className="font-bold text-navy mb-1 text-lg">Recent Activity</h2>
              <p className="text-sm text-slate-500 mb-6">Latest student registration actions</p>

              <div className="space-y-5">
                <ActivityRow initials="JD" name="Joe Doe" action="Registered 6 units for Sem 1" time="2 min ago" color="bg-slate-200" />
                <ActivityRow initials="AW" name="Aisha Wambui" action="Dropped CCS 3103 — Distributed Systems" time="1 hr ago" color="bg-emerald-100 text-emerald-700" />
                <ActivityRow initials="JK" name="Admin CS" action="CCS 3103 venue changed to RCL 1" time="Yesterday" color="bg-pink-100 text-pink-700" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Sub-components for clean code
function AdminStatCard({ title, value, icon, sub, subColor, borderTop }: any) {
  return (
    <div className={`card bg-white p-5 rounded-lg shadow-sm border border-slate-200 border-t-4 ${borderTop}`}>
      <div className="mb-3 text-2xl">{icon}</div>
      <p className="text-3xl font-bold text-navy mb-1">{value}</p>
      <p className="text-xs text-slate-500 font-medium mb-3 uppercase tracking-wide">{title}</p>
      <p className={`text-[11px] font-semibold ${subColor}`}>{sub}</p>
    </div>
  );
}

function ProgressBar({ label, percent, color }: any) {
  return (
    <div className="flex items-center text-sm">
      <span className="w-36 flex items-center gap-2 text-slate-700 font-medium">
        <span className={`h-2.5 w-2.5 rounded-sm block ${color}`}></span> {label}
      </span>
      <div className="flex-1 ml-4 h-2.5 rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }}></div>
      </div>
      <span className="ml-4 w-10 text-right font-bold text-navy">{percent}%</span>
    </div>
  );
}

function ActivityRow({ initials, name, action, time, color }: any) {
  return (
    <div className="flex items-start justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
      <div className="flex items-center gap-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${color}`}>
          {initials}
        </div>
        <div>
          <p className="font-bold text-sm text-navy">{name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{action}</p>
        </div>
      </div>
      <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap ml-2 mt-1">{time}</span>
    </div>
  );
}