"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getCurrentUser, isLoggedIn } from "@/lib/auth";
import type { AuthUser } from "@/types";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    setUser(getCurrentUser());
  }, [router]);

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold">Account Information</h1>
        <div className="card space-y-4 p-6">
          <Row label="Full Name" value={user?.fullName} />
          <Row label="Email" value={user?.email} />
          {user?.registrationNumber && <Row label="Registration Number" value={user.registrationNumber} />}
          {user?.course && <Row label="Course" value={user.course} />}
          {user?.yearOfStudy && <Row label="Year of Study" value={`Year ${user.yearOfStudy}`} />}
          <Row label="Role" value={user?.role} />
        </div>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between border-b border-slate-100 pb-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium">{value || "—"}</span>
    </div>
  );
}
