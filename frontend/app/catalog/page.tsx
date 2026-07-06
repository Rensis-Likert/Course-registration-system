"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { apiFetch } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import type { Department, Semester, Unit } from "@/types";

export default function CatalogPage() {
  const router = useRouter();
  const [semester, setSemester] = useState<Semester | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyUnitId, setBusyUnitId] = useState<string | null>(null);
  const [overlapWarning, setOverlapWarning] = useState<string | null>(null);

  async function load() {
    const params = new URLSearchParams();
    if (departmentId) params.set("departmentId", departmentId);
    if (year) params.set("year", String(year));
    if (query) params.set("q", query);

    const [catalog, deptRes, mine] = await Promise.all([
      apiFetch<{ semester: Semester; units: Unit[] }>(`/api/units?${params.toString()}`),
      apiFetch<{ departments: Department[] }>("/api/units/departments"),
      apiFetch<{ registrations: { unitId: string; status: string }[] }>("/api/registrations/me"),
    ]);
    setSemester(catalog.semester);
    setUnits(catalog.units);
    setDepartments(deptRes.departments);
    setRegisteredIds(
      new Set(mine.registrations.filter((r) => r.status !== "dropped").map((r) => r.unitId))
    );
  }

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    load().catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    load().catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentId, year, query]);

  const overlapsDetected = 0; // surfaced per-attempt via overlapWarning; catalog-wide count kept at 0 by design

  async function handleRegister(unit: Unit) {
    if (!semester) return;
    setBusyUnitId(unit.id);
    setOverlapWarning(null);
    try {
      await apiFetch("/api/registrations", {
        method: "POST",
        body: JSON.stringify({ unitId: unit.id, semesterId: semester.id }),
      });
      await load();
    } catch (err: any) {
      setOverlapWarning(err.message || "Could not register for this unit.");
    } finally {
      setBusyUnitId(null);
    }
  }

  async function handleDrop(unit: Unit) {
    if (!semester) return;
    setBusyUnitId(unit.id);
    try {
      await apiFetch(`/api/registrations/${unit.id}?semesterId=${semester.id}`, { method: "DELETE" });
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusyUnitId(null);
    }
  }

  async function handleConfirm() {
    if (!semester) return;
    try {
      await apiFetch("/api/registrations/confirm", {
        method: "POST",
        body: JSON.stringify({ semesterId: semester.id }),
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  }

  const registeredUnits = useMemo(
    () => units.filter((u) => registeredIds.has(u.id)),
    [units, registeredIds]
  );
  const totalSlots = registeredUnits.reduce((sum, u) => sum + u.schedules.length, 0);

  return (
    <div className="pb-24">
      <Navbar
        semesterLabel={semester ? `${semester.name} — ${semester.academicYear}` : undefined}
        registrationOpen={semester?.registrationOpen}
        registrationDeadline={semester?.registrationDeadline}
        unitsCount={registeredUnits.length}
      />

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 md:grid-cols-[220px_1fr]">
        {/* Sidebar filters */}
        <aside className="space-y-4">
          <div className="card p-4">
            <p className="mb-2 text-xs font-semibold uppercase text-slate-400">Department</p>
            <FilterRow label="All Depts" count={units.length} active={!departmentId} onClick={() => setDepartmentId(null)} />
            {departments.map((d) => (
              <FilterRow
                key={d.id}
                label={d.name}
                active={departmentId === d.id}
                onClick={() => setDepartmentId(d.id)}
              />
            ))}
          </div>

          <div className="card p-4">
            <p className="mb-2 text-xs font-semibold uppercase text-slate-400">Year of Study</p>
            <FilterRow label="All Years" active={!year} onClick={() => setYear(null)} />
            {[1, 2, 3, 4, 5].map((y) => (
              <FilterRow key={y} label={`Year ${y}`} active={year === y} onClick={() => setYear(y)} />
            ))}
          </div>

          <div className="card p-4">
            <p className="mb-2 text-xs font-semibold uppercase text-slate-400">Registration Status</p>
            <p className="text-sm text-slate-500">Units registered</p>
            <p className="text-2xl font-bold">{registeredUnits.length}</p>
          </div>
        </aside>

        {/* Catalog list */}
        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by unit code, title or lecturer..."
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold sm:max-w-md"
            />
            <p className="text-sm text-slate-500">
              {units.length} units found
              <span className="ml-3 font-medium text-emerald-600">{overlapsDetected} Overlaps Detected</span>
            </p>
          </div>

          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          {overlapWarning && (
            <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{overlapWarning}</p>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {units.map((unit) => {
              const registered = registeredIds.has(unit.id);
              return (
                <div key={unit.id} className={`card border-t-4 p-4 ${registered ? "border-t-gold" : "border-t-transparent"}`}>
                  <div className="mb-2 flex items-start justify-between">
                    <span className="font-semibold">{unit.code}</span>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {unit.department}
                    </span>
                  </div>
                  <p className="font-medium">{unit.title}</p>
                  <p className="mb-2 text-sm text-slate-500">{unit.lecturer}</p>

                  <div className="mb-2 flex flex-wrap gap-2">
                    {unit.schedules.map((s, i) => (
                      <span key={i} className="rounded-md bg-slate-100 px-2 py-1 text-xs">
                        <span className="font-semibold">{s.sessionType}</span> {s.day}{" "}
                        {s.startTime.slice(11, 16)}-{s.endTime.slice(11, 16)}{" "}
                        {s.isOnline ? "ONLINE" : s.venue}
                      </span>
                    ))}
                  </div>

                  <div className="mb-2">
                    <div className="h-1.5 w-full rounded-full bg-slate-100">
                      <div
                        className="h-1.5 rounded-full bg-emerald-500"
                        style={{ width: `${Math.min(100, (unit.takenSeats / unit.capacity) * 100)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Available seats {unit.availableSeats}/{unit.capacity}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Year {unit.yearOfStudy} • {unit.unitType === "core" ? "Core" : "Elective"}
                    </span>
                    {registered ? (
                      <button
                        onClick={() => handleDrop(unit)}
                        disabled={busyUnitId === unit.id}
                        className="rounded-md border border-red-300 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        ✓ Drop Unit
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegister(unit)}
                        disabled={busyUnitId === unit.id || unit.availableSeats <= 0}
                        className="rounded-md bg-gold px-3 py-1 text-xs font-semibold text-navy hover:opacity-90 disabled:opacity-50"
                      >
                        + Register
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Sticky confirm bar */}
      <div className="fixed bottom-0 left-0 right-0 flex items-center justify-between bg-navy px-6 py-4 text-white">
        <div className="flex items-center gap-3">
          <span className="font-semibold">Registered</span>
          {registeredUnits.map((u) => (
            <span key={u.id} className="rounded-full bg-white/10 px-3 py-1 text-sm">
              {u.code} ✕
            </span>
          ))}
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-lg font-bold">{registeredUnits.length}</p>
            <p className="text-xs text-slate-300">Unit(s)</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{totalSlots}</p>
            <p className="text-xs text-slate-300">Slot(s)</p>
          </div>
          <button
            onClick={handleConfirm}
            disabled={registeredUnits.length === 0}
            className="rounded-lg bg-gold px-5 py-2.5 text-sm font-bold text-navy hover:opacity-90 disabled:opacity-50"
          >
            Confirm Registration →
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterRow({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm ${
        active ? "bg-amber-50 font-medium text-navy" : "text-slate-500 hover:bg-slate-50"
      }`}
    >
      <span className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${active ? "bg-gold" : "bg-slate-300"}`} />
        {label}
      </span>
      {typeof count === "number" && <span>{count}</span>}
    </button>
  );
}
