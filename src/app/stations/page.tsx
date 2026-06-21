"use client";

import React, { useState, useEffect } from "react";
import { useNexus } from "@/context/NexusContext";
import { 
  MapPin, 
  ShoppingCart, 
  DollarSign, 
  Store, 
  AlertTriangle,
  Layers,
  ArrowRight,
  TrendingUp,
  Activity
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const PRODUCT_PRICES: Record<string, number> = {
  "Water Bottle": 20,
  "Charger": 350,
  "Tissue": 10,
  "ORS": 30,
  "Sanitizer": 50,
  "Baby Care Kit": 450,
};

export default function StationManager() {
  const { orders, inventory, vendors } = useNexus();
  const [activeTab, setActiveTab] = useState<"compare" | "NDLS" | "ANVT">("compare");

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // NDLS stats
  const ndlsOrders = orders.filter(o => o.station === "New Delhi Railway Station" && o.status !== "Cancelled");
  const ndlsRevenue = ndlsOrders.reduce((acc, o) => {
    return acc + o.products.reduce((sum, p) => sum + (PRODUCT_PRICES[p.name] || 0) * p.quantity, 0);
  }, 0);
  const ndlsVendors = vendors.filter(v => v.station === "New Delhi Railway Station");
  const ndlsLowStock = inventory.filter(i => i.station === "New Delhi Railway Station" && i.availableStock <= i.reorderLevel).length;

  // ANVT stats
  const anvtOrders = orders.filter(o => o.station === "Anand Vihar Railway Station" && o.status !== "Cancelled");
  const anvtRevenue = anvtOrders.reduce((acc, o) => {
    return acc + o.products.reduce((sum, p) => sum + (PRODUCT_PRICES[p.name] || 0) * p.quantity, 0);
  }, 0);
  const anvtVendors = vendors.filter(v => v.station === "Anand Vihar Railway Station");
  const anvtLowStock = inventory.filter(i => i.station === "Anand Vihar Railway Station" && i.availableStock <= i.reorderLevel).length;

  // Comparison Graph Data
  const compareData = [
    { name: "New Delhi (NDLS)", Orders: ndlsOrders.length, Revenue: ndlsRevenue / 10 }, // Scale revenue for readable double bars
    { name: "Anand Vihar (ANVT)", Orders: anvtOrders.length, Revenue: anvtRevenue / 10 },
  ];

  return (
    <div className="p-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-indigo-400" />
            Station Commerce Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">Compare regional terminal commerce, active booking counts, and inventory levels.</p>
        </div>

        {/* Station Navigation Tabs */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs text-slate-400">
          <button
            onClick={() => setActiveTab("compare")}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === "compare" ? "bg-slate-800 text-slate-100 shadow font-bold" : "hover:text-slate-200"
            }`}
          >
            Terminal Share
          </button>
          <button
            onClick={() => setActiveTab("NDLS")}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === "NDLS" ? "bg-slate-800 text-slate-100 shadow font-bold" : "hover:text-slate-200"
            }`}
          >
            New Delhi (NDLS)
          </button>
          <button
            onClick={() => setActiveTab("ANVT")}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === "ANVT" ? "bg-slate-800 text-slate-100 shadow font-bold" : "hover:text-slate-200"
            }`}
          >
            Anand Vihar (ANVT)
          </button>
        </div>
      </div>

      {activeTab === "compare" ? (
        <div className="space-y-8">
          {/* Side by side comparison stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* NDLS Panel */}
            <div className="glow-card bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-850">
                <h3 className="text-sm font-extrabold text-slate-200 tracking-wide uppercase">New Delhi Railway Station</h3>
                <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold px-2 py-0.5 rounded-full">
                  NDLS Hub
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Bookings Received</span>
                  <span className="text-xl font-extrabold text-slate-100 mt-1 block">{ndlsOrders.length}</span>
                </div>
                <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Gross Sales</span>
                  <span className="text-xl font-extrabold text-slate-200 mt-1 block">₹{ndlsRevenue}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                <span className="flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-slate-500" />
                  {ndlsVendors.length} active kitchens
                </span>
                <span className={`flex items-center gap-1.5 font-bold ${ndlsLowStock > 0 ? "text-amber-400 animate-pulse" : "text-slate-500"}`}>
                  <AlertTriangle className="w-4 h-4" />
                  {ndlsLowStock} low stocks
                </span>
              </div>
            </div>

            {/* ANVT Panel */}
            <div className="glow-card bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-850">
                <h3 className="text-sm font-extrabold text-slate-200 tracking-wide uppercase">Anand Vihar Railway Station</h3>
                <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold px-2 py-0.5 rounded-full">
                  ANVT Hub
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Bookings Received</span>
                  <span className="text-xl font-extrabold text-slate-100 mt-1 block">{anvtOrders.length}</span>
                </div>
                <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl">
                  <span className="text-xl font-extrabold text-slate-200 mt-1 block">₹{anvtRevenue}</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Gross Sales</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                <span className="flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-slate-500" />
                  {anvtVendors.length} active kitchens
                </span>
                <span className={`flex items-center gap-1.5 font-bold ${anvtLowStock > 0 ? "text-amber-400 animate-pulse" : "text-slate-500"}`}>
                  <AlertTriangle className="w-4 h-4" />
                  {anvtLowStock} low stocks
                </span>
              </div>
            </div>
          </div>

          {/* Bar Chart comparing Shares */}
          <div className="glow-card bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-6">Terminal Volume Distribution</h3>
            <div className="h-64">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={compareData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(75,85,99,0.08)" vertical={false} />
                    <XAxis dataKey="name" stroke="#4b5563" fontSize={11} tickLine={false} />
                    <YAxis stroke="#4b5563" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#f3f4f6", fontSize: "11px" }} 
                    />
                    <Bar dataKey="Orders" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full bg-slate-950/40 rounded-xl animate-pulse flex items-center justify-center text-xs text-slate-650 font-mono">
                  Loading charts...
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Detailed Tab View for specific station */
        <div className="space-y-6">
          {/* Headline stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glow-card bg-slate-900/60 p-5 rounded-xl border border-slate-800 flex items-center gap-4">
              <div className="p-3 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-lg">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Station Orders</span>
                <span className="text-xl font-extrabold text-slate-100 mt-1 block">
                  {activeTab === "NDLS" ? ndlsOrders.length : anvtOrders.length}
                </span>
              </div>
            </div>

            <div className="glow-card bg-slate-900/60 p-5 rounded-xl border border-slate-800 flex items-center gap-4">
              <div className="p-3 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Sales</span>
                <span className="text-xl font-extrabold text-slate-100 mt-1 block">
                  ₹{activeTab === "NDLS" ? ndlsRevenue : anvtRevenue}
                </span>
              </div>
            </div>

            <div className="glow-card bg-slate-900/60 p-5 rounded-xl border border-slate-800 flex items-center gap-4">
              <div className="p-3 bg-violet-600/10 text-violet-400 border border-violet-500/20 rounded-lg">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Kitchen Vendors</span>
                <span className="text-xl font-extrabold text-slate-100 mt-1 block">
                  {activeTab === "NDLS" ? ndlsVendors.length : anvtVendors.length}
                </span>
              </div>
            </div>

            <div className="glow-card bg-slate-900/60 p-5 rounded-xl border border-slate-800 flex items-center gap-4">
              <div className="p-3 bg-amber-600/10 text-amber-400 border border-amber-500/20 rounded-lg">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Low Stock Warnings</span>
                <span className="text-xl font-extrabold text-slate-100 mt-1 block">
                  {activeTab === "NDLS" ? ndlsLowStock : anvtLowStock}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Vendor Roster */}
            <div className="glow-card bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">Station Vendors</h3>
              <div className="space-y-4">
                {(activeTab === "NDLS" ? ndlsVendors : anvtVendors).map((vendor, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-slate-850 pb-3 last:border-b-0 last:pb-0 text-xs">
                    <div>
                      <span className="font-bold text-slate-200 block">{vendor.name}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">Fulfillment Speed: {vendor.averageFulfillmentTime} mins</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-indigo-400 block">₹{vendor.revenueGenerated}</span>
                      <span className="text-[10px] text-slate-500">{vendor.ordersCompleted} bookings</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Hotspots */}
            <div className="glow-card bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Station Platform Telemetry</h3>
              <div className="space-y-3">
                <div className="bg-slate-950/40 border border-slate-900 p-3 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">Platform 1-2 (Shatabdi/Gatimaan)</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    High Demand
                  </span>
                </div>
                <div className="bg-slate-950/40 border border-slate-900 p-3 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">Platform 3-4 (Local Passenger Express)</span>
                  <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-550 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    Moderate
                  </span>
                </div>
                <div className="bg-slate-950/40 border border-slate-900 p-3 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">Platform 5-8 (Duronto / Rajdhani Express)</span>
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">
                    Peak Load
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
