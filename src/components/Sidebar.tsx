"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Truck, 
  Store, 
  MapPin, 
  TrendingUp, 
  FileText, 
  Database, 
  Settings, 
  Brain,
  Activity
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Vendor Workspace", href: "/", icon: LayoutDashboard },
  { label: "System Settings", href: "/settings", icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/80 backdrop-blur-md flex flex-col h-full z-30 shrink-0">
      {/* Branding */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.2)]">
          <Brain className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-wider uppercase text-slate-100">RailQuick</h1>
          <span className="text-xs font-semibold text-indigo-400">NEXUS OS v1.0</span>
        </div>
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
              className={`flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-indigo-600/15 text-indigo-400 border-l-2 border-indigo-500 shadow-sm"
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
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/50">
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
  );
};
