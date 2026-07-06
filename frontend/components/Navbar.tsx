"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession, getCurrentUser } from "@/lib/auth";

const TABS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/catalog", label: "Unit Catalog" },
  { href: "/timetable", label: "My Timetable" },
  { href: "/history", label: "History" },
];

interface NavbarProps {
  semesterLabel?: string;
  registrationOpen?: boolean;
  registrationDeadline?: string;
  unitsCount?: number;
}

export default function Navbar({
  semesterLabel,
  registrationOpen,
  registrationDeadline,
  unitsCount,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = getCurrentUser();

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  function handleLogout() {
    clearSession();
    router.replace("/login");
  }

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3 bg-navy px-6 py-4">
        <div className="text-lg font-semibold text-white">
          DeKUT <span className="text-gold">Unit Reg</span>
        </div>

        <div className="flex items-center gap-3">
          {registrationDeadline && (
            <span
              className={`rounded-full px-4 py-1 text-sm font-medium ${
                registrationOpen ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
              }`}
            >
              {registrationOpen ? "Registration Open" : "Registration Closed"} - Closes{" "}
              {new Date(registrationDeadline).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
          {semesterLabel && (
            <span className="rounded-full bg-slate-600 px-4 py-1 text-sm font-medium text-white">
              {semesterLabel}
            </span>
          )}
          {typeof unitsCount === "number" && (
            <span className="rounded-full bg-gold px-4 py-1 text-sm font-semibold text-navy">
              {unitsCount} Unit{unitsCount === 1 ? "" : "s"}
            </span>
          )}
          <button
            onClick={handleLogout}
            title="Log out"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-light text-sm font-semibold text-gold ring-1 ring-gold/40"
          >
            {initials}
          </button>
        </div>
      </header>

      <nav className="flex gap-8 border-b border-slate-200 bg-white px-6">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`border-b-2 py-4 text-sm font-medium transition-colors ${
                active
                  ? "border-gold text-navy"
                  : "border-transparent text-slate-400 hover:text-navy"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
