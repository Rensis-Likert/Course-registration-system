// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  name: string;
  href: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

export default function Sidebar() {
  const pathname = usePathname();

  const navGroups: NavGroup[] = [
    {
      title: "OVERVIEW",
      items: [{ name: "Dashboard", href: "/1admin/dashboard", icon: "⊞" }],
    },
    {
      title: "UNIT MANAGEMENT",
      items: [
        { name: "Unit & Courses", href: "#", icon: "📖" },
        { name: "Timetable", href: "#", icon: "🕒" },
      ],
    },
    {
      title: "STUDENTS",
      items: [
        { name: "All Students", href: "#", icon: "👥", badge: "58" },
        { name: "Registrations", href: "#", icon: "⇌", badge: "3", badgeColor: "bg-red-500" },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        { name: "Reg. Window", href: "#", icon: "🕒" },
        { name: "Department", href: "#", icon: "🏢" },
      ],
    },
  ];

  return (
    // Fixed height, no external scrolling
    <aside className="flex h-screen w-64 flex-shrink-0 flex-col bg-[#0b132b] text-slate-300">
      
      {/* Logo Area */}
      <div className="flex h-[72px] flex-shrink-0 items-center px-6 text-lg font-semibold text-white border-b border-white/5">
        <div>
          DeKUT <span className="ml-1 mr-2 text-gold">Unit Reg</span>
          <div className="text-[10px] font-normal text-slate-400 mt-0.5 uppercase tracking-widest">Admin Panel</div>
        </div>
      </div>

      {/* Navigation (Internal scroll only) */}
      <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
        {navGroups.map((group, i) => (
          <div key={i} className="mb-6">
            <p className="mb-2 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {group.title}
            </p>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative flex items-center justify-between px-6 py-2.5 text-sm transition-colors ${
                      isActive ? "bg-white/10 text-white font-medium" : "hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-0 h-full w-1 bg-gold rounded-r-md" />
                    )}
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{item.icon}</span>
                      {item.name}
                    </div>
                    {item.badge && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${
                          item.badgeColor || "bg-gold text-navy"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-white/10 p-6 text-xs text-slate-500">
        <p className="font-semibold text-slate-400">DeKUT ICT Directorate</p>
        <p>Admin panel v2.0 · 2026</p>
      </div>
    </aside>
  );
}