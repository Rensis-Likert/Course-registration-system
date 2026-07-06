"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { apiFetch } from "@/lib/api";
import { getCurrentUser, isLoggedIn } from "@/lib/auth";
import type { DashboardStats, Notice, RegisteredUnit, Semester } from "@/types";

interface DashboardData {
  semester: Semester | null;
  student: { fullName: string; course: string | null; yearOfStudy: number | null } | null;
  stats: DashboardStats;
  registeredUnits: RegisteredUnit[];
}

function formatSchedule(u: RegisteredUnit) {
  return u.schedules
    .map((s) => `${s.day} ${s.startTime.slice(11, 16)}${s.venue ? ` • ${s.venue}` : ""}`)
    .join(" • ");
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    (async () => {
      try {
        const [dash, notesRes] = await Promise.all([
          apiFetch<DashboardData>("/api/dashboard"),
          apiFetch<{ notices: Notice[] }>("/api/notices"),
        ]);
        setData(dash);
        setNotices(notesRes.notices);
      } catch (err: any) {
        setError(err.message || "Could not load your dashboard.");
      }
    })();
  }, [router]);

  const user = getCurrentUser();

  return (
    <div>
      <Navbar
        semesterLabel={data?.semester ? `${data.semester.name} — ${data.semester.academicYear}` : undefined}
        registrationOpen={data?.semester?.registrationOpen}
        registrationDeadline={data?.semester?.registrationDeadline}
        unitsCount={data?.stats.unitsRegistered}
      />

      <main className="mx-auto max-w-6xl px-6 py-8">
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Good Morning, {(data?.student?.fullName || user?.fullName || "Student").split(" ")[0]}
            </h1>
            <p className="text-sm text-slate-500">
              {data?.semester ? `${data.semester.name} • ${data.semester.academicYear}` : ""}
              {data?.student?.course ? ` • ${data.student.course}` : ""}
              {data?.student?.yearOfStudy ? `, Year ${data.student.yearOfStudy}` : ""}
            </p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard value={data?.stats.unitsRegistered ?? "—"} label="Units registered" barColor="bg-gold" />
          <StatCard value={data?.stats.totalSlots ?? "—"} label="Total slots" barColor="bg-violet-500" />
          <StatCard value={data?.stats.timetableClashes ?? "—"} label="Timetable clashes" barColor="bg-emerald-500" />
          <StatCard value={data?.stats.daysToDeadline ?? "—"} label="Days to deadline" barColor="bg-navy" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Registered Units</h2>
              <a href="/catalog" className="text-sm font-medium text-gold-dark hover:underline">
                Manage →
              </a>
            </div>
            <div className="space-y-3">
              {data?.registeredUnits.length ? (
                data.registeredUnits.map((u) => (
                  <div key={u.id} className="border-l-4 border-gold pl-3">
                    <p className="font-medium">{u.code}</p>
                    <p className="text-sm text-slate-500">{u.title}</p>
                    <p className="text-xs text-slate-400">{formatSchedule(u)}</p>
                    <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      {u.status === "pending" ? "Pending approval" : u.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">
                  You haven&apos;t registered for any units yet. Head to the Unit Catalog to get started.
                </p>
              )}
            </div>
          </section>

          <section className="card p-6">
            <h2 className="mb-4 font-semibold">Notices</h2>
            <div className="space-y-3">
              {notices.length ? (
                notices.map((n) => (
                  <div key={n.id} className="rounded-lg bg-slate-50 border-l-4 border-navy p-3">
                    <p className="font-medium">{n.title}</p>
                    <p className="text-sm text-slate-500">{n.body}</p>
                    <p className="mt-1 text-xs text-slate-400">Posted by: {n.postedBy}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No notices right now.</p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function StatCard({ value, label, barColor }: { value: number | string; label: string; barColor: string }) {
  return (
    <div className="card p-5">
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
      <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100">
        <div className={`h-1.5 w-1/3 rounded-full ${barColor}`} />
      </div>
    </div>
  );
}
