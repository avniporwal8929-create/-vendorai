"use client";

import React, { useState } from "react";
import { useNexus } from "@/context/NexusContext";
import { 
  RefreshCw, 
  MapPin, 
  Bell, 
  AlertTriangle,
  CheckCircle2,
  Database
} from "lucide-react";
import { usePathname } from "next/navigation";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { 
    activeStationFilter, 
    setActiveStationFilter, 
    triggerNotionSync,
    inventory,
    orders
  } = useNexus();

  const [isSyncing, setIsSyncing] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);

  // Get active page title
  const getPageTitle = () => {
    switch (pathname) {
      case "/": return "Command Center Dashboard";
      case "/orders": return "Order Operations Hub";
      case "/inventory": return "Inventory Management System";
      case "/delivery": return "Delivery Operations Panel";
      case "/vendors": return "Vendor Performance Network";
      case "/stations": return "Station Commerce Hubs";
      case "/forecasting": return "AI Predictive Forecasting";
      case "/reports": return "Operational Report Center";
      case "/notion-sync": return "Notion Backend Integration";
      case "/settings": return "System Settings";
      default: return "Nexus OS";
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await triggerNotionSync();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Compute live warnings/alerts
  const lowStockCount = inventory.filter(i => i.availableStock <= i.reorderLevel).length;
  const pendingOrdersCount = orders.filter(o => o.status === "Pending").length;
  const totalAlerts = lowStockCount + pendingOrdersCount;

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/40 backdrop-blur-md px-8 flex items-center justify-between shrink-0 z-20">
      <div>
        <h2 className="text-lg font-bold text-slate-100">{getPageTitle()}</h2>
        <p className="text-xs text-slate-500 font-medium">Real-time terminal logistics and food supply chain</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Station Select Toggle */}
        <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-0.5 text-xs text-slate-400">
          <button
            onClick={() => setActiveStationFilter("All")}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeStationFilter === "All"
                ? "bg-slate-800 text-slate-100 shadow"
                : "hover:text-slate-200"
            }`}
          >
            All Terminals
          </button>
          <button
            onClick={() => setActiveStationFilter("New Delhi Railway Station")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-all ${
              activeStationFilter === "New Delhi Railway Station"
                ? "bg-slate-800 text-indigo-400 shadow"
                : "hover:text-slate-200"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            NDLS
          </button>
          <button
            onClick={() => setActiveStationFilter("Anand Vihar Railway Station")}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-all ${
              activeStationFilter === "Anand Vihar Railway Station"
                ? "bg-slate-800 text-indigo-400 shadow"
                : "hover:text-slate-200"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            ANVT
          </button>
        </div>

        {/* Sync Button */}
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className={`flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 rounded-lg text-xs font-semibold text-slate-300 transition-all ${
            isSyncing ? "opacity-75 cursor-not-allowed" : ""
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-indigo-400" : ""}`} />
          {isSyncing ? "Syncing..." : "Notion Sync"}
        </button>

        {/* Alerts Center Dropdown/Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
            className="p-2 text-slate-400 bg-slate-900 border border-slate-800 rounded-lg hover:text-slate-200 transition-all relative"
          >
            <Bell className="w-4 h-4" />
            {totalAlerts > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center text-[9px] font-bold text-slate-100 shadow-[0_0_8px_rgba(99,102,241,0.5)]">
                {totalAlerts}
              </span>
            )}
          </button>

          {/* Quick Notification Panel */}
          {showNotificationDrawer && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowNotificationDrawer(false)}
              />
              <div className="absolute right-0 mt-2.5 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-50 glow-card">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <h4 className="text-xs font-bold text-slate-200 tracking-wider uppercase">System Alerts</h4>
                  <span className="text-[10px] bg-slate-800 text-indigo-400 px-2 py-0.5 rounded font-bold">
                    {totalAlerts} issues
                  </span>
                </div>
                
                <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1">
                  {lowStockCount > 0 && (
                    <div className="flex gap-2.5 items-start">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-slate-200">Inventory Alert</p>
                        <p className="text-[10px] text-slate-400">{lowStockCount} items at or below critical reorder limits.</p>
                      </div>
                    </div>
                  )}
                  {pendingOrdersCount > 0 && (
                    <div className="flex gap-2.5 items-start">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <p className="text-xs font-semibold text-slate-200">Pending Bookings</p>
                        <p className="text-[10px] text-slate-400">{pendingOrdersCount} orders waiting for vendor confirm state.</p>
                      </div>
                    </div>
                  )}
                  {totalAlerts === 0 && (
                    <p className="text-xs text-slate-500 text-center py-4">All operations running smoothly. 0 warnings.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
