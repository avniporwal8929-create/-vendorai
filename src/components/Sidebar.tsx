"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNexus } from "@/context/NexusContext";
import { 
  LayoutDashboard, 
  Settings, 
  Brain,
  Activity,
  X
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Vendor Workspace", href: "/", icon: LayoutDashboard },
  { label: "System Settings", href: "/settings", icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { mobileMenuOpen, setMobileMenuOpen } = useNexus();

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-900 bg-slate-950/95 flex flex-col h-full transition-transform duration-300 md:relative md:translate-x-0 md:bg-slate-950/80 backdrop-blur-md shrink-0 ${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {/* Branding */}
        <div className="p-6 border-b border-slate-900/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-650/10 text-indigo-400 rounded-lg border border-indigo-500/25 shadow-[0_0_12px_rgba(99,102,241,0.2)]">
              <Brain className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wider uppercase text-slate-105">RailQuick</h1>
              <span className="text-xs font-semibold text-indigo-400">NEXUS OS</span>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 hover:bg-slate-900 rounded-lg md:hidden text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-indigo-650/15 text-indigo-400 border-l-2 border-indigo-500 shadow-sm"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                }`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* System Status Footer */}
        <div className="p-4 border-t border-slate-900/60 bg-slate-950/50">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium">
              <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
              Core: Online
            </span>
            <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-[10px]">
              Sync: Local fallback
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
