"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { apiFetch } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import type { Semester } from "@/types";

interface TimetableEntry {
  unitCode: string;
  unitTitle: string;
  sessionType: string;
  day: string;
  startTime: string;
  endTime: string;
  venue: string | null;
}

const DAYS = ["MON", "TUE", "WED", "THUR", "FRI"];
const HOURS = Array.from({ length: 10 }, (_, i) => 8 + i); // 8am - 6pm

function hourLabel(h: number) {
  const period = h < 12 ? "AM" : "PM";
  const hour12 = h > 12 ? h - 12 : h;
  return `${hour12}${period}`;
}

function hourOf(iso: string) {
  return Number(iso.slice(11, 13));
}

export default function TimetablePage() {
  const router = useRouter();
  const [semester, setSemester] = useState<Semester | null>(null);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    (async () => {
      try {
        const data = await apiFetch<{ semester: Semester; entries: TimetableEntry[] }>("/api/timetable");
        setSemester(data.semester);
        setEntries(data.entries);
      } catch (err: any) {
        setError(err.message);
      }
    })();
  }, [router]);

  const legend = useMemo(() => {
    const map = new Map<string, string>();
    entries.forEach((e) => map.set(e.unitCode, e.unitTitle));
    return Array.from(map.entries());
  }, [entries]);

  function entryAt(day: string, hour: number) {
    return entries.find((e) => e.day === day && hourOf(e.startTime) === hour);
  }

  function spanHours(e: TimetableEntry) {
    return Math.max(1, hourOf(e.endTime) - hourOf(e.startTime));
  }

  return (
    <div>
      <Navbar
        semesterLabel={semester ? `${semester.name} — ${semester.academicYear}` : undefined}
        registrationOpen={semester?.registrationOpen}
        registrationDeadline={semester?.registrationDeadline}
      />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="card overflow-x-auto p-6">
          <h1 className="mb-4 text-xl font-bold">
            CS Timetable • {semester ? `${semester.name} ${semester.academicYear}` : ""}
          </h1>
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="bg-navy px-3 py-2 text-left text-white">DAY</th>
                {HOURS.map((h) => (
                  <th key={h} className="bg-navy px-3 py-2 text-left text-white">
                    {hourLabel(h)} - {hourLabel(h + 1)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => {
                const skip = new Set<number>();
                return (
                  <tr key={day} className="border-b border-slate-100">
                    <td className="bg-slate-50 px-3 py-3 font-semibold">{day}</td>
                    {HOURS.map((h) => {
                      if (skip.has(h)) return null;
                      const entry = entryAt(day, h);
                      if (!entry) return <td key={h} className="border border-slate-100 px-3 py-3" />;
                      const span = spanHours(entry);
                      for (let i = 1; i < span; i++) skip.add(h + i);
                      return (
                        <td
                          key={h}
                          colSpan={span}
                          className="border border-slate-100 bg-blue-50 px-3 py-3 text-center"
                        >
                          <p className="font-medium">{entry.unitCode}</p>
                          <p className="text-xs text-slate-500">{entry.venue}</p>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-4 space-y-1">
            {legend.map(([code, title]) => (
              <p key={code} className="flex items-center gap-2 text-sm text-blue-700">
                <span className="h-2 w-2 rounded-full bg-blue-700" />
                {code} - {title}
              </p>
            ))}
            {legend.length === 0 && (
              <p className="text-sm text-slate-400">Register for units in the Unit Catalog to build your timetable.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
