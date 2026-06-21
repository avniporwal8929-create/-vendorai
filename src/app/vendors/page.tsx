"use client";

import React, { useState } from "react";
import { useNexus, Vendor } from "@/context/NexusContext";
import { 
  Store, 
  DollarSign, 
  Clock, 
  Star, 
  TrendingUp, 
  MapPin, 
  Layers,
  ChevronRight,
  TrendingDown
} from "lucide-react";

export default function VendorHub() {
  const { vendors, orders, activeStationFilter } = useNexus();
  const [sortBy, setSortBy] = useState<"rating" | "revenue" | "time">("rating");

  // Filtering
  const filteredVendors = vendors.filter(
    (v) => activeStationFilter === "All" || v.station === activeStationFilter
  );

  // Sorting
  const sortedVendors = [...filteredVendors].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "revenue") return b.revenueGenerated - a.revenueGenerated;
    if (sortBy === "time") return a.averageFulfillmentTime - b.averageFulfillmentTime; // Lower is better
    return 0;
  });

  // Calculate kitchen metrics dynamically based on orders state
  const getActiveOrdersCount = (vendorName: string) => {
    return orders.filter(
      (o) => o.assignedVendor === vendorName && o.status !== "Delivered" && o.status !== "Cancelled"
    ).length;
  };

  const getCompletedOrdersCount = (vendorName: string) => {
    return orders.filter((o) => o.assignedVendor === vendorName && o.status === "Delivered").length;
  };

  return (
    <div className="p-8 space-y-6">
      
      {/* Header Controller */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Store className="w-6 h-6 text-indigo-400" />
            Vendor Performance Network
          </h1>
          <p className="text-xs text-slate-400 mt-1">Audit station food vendor SLA times, passenger ratings, and kitchen occupancy.</p>
        </div>

        {/* Sort Filter toggles */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs text-slate-400">
          <button
            onClick={() => setSortBy("rating")}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              sortBy === "rating" ? "bg-slate-800 text-slate-100 shadow font-bold" : "hover:text-slate-200"
            }`}
          >
            SLA Rating
          </button>
          <button
            onClick={() => setSortBy("revenue")}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              sortBy === "revenue" ? "bg-slate-800 text-slate-100 shadow font-bold" : "hover:text-slate-200"
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setSortBy("time")}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              sortBy === "time" ? "bg-slate-800 text-slate-100 shadow font-bold" : "hover:text-slate-200"
            }`}
          >
            Fulfillment Time
          </button>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedVendors.map((vendor) => {
          const activeVol = getActiveOrdersCount(vendor.name);
          const completedSessionVal = getCompletedOrdersCount(vendor.name);
          const totalEarned = vendor.revenueGenerated + (completedSessionVal * 150); // Add dynamic session bookings

          return (
            <div key={vendor.id} className="glow-card bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 space-y-6 relative overflow-hidden flex flex-col justify-between">
              
              {/* Header metadata */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-150 tracking-wide uppercase">{vendor.name}</h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-600" />
                    {vendor.station}
                  </span>
                </div>
                
                {/* Rating star pill */}
                <div className="bg-amber-400/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded flex items-center gap-1 text-[10px] font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {vendor.rating.toFixed(1)}
                </div>
              </div>

              {/* Vendor Statistics Layout */}
              <div className="grid grid-cols-3 gap-4 border-t border-b border-slate-850/80 py-4.5">
                <div className="text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Fulfill Latency</span>
                  <span className="text-md font-extrabold text-slate-200 mt-1 flex items-center justify-center gap-1 font-mono">
                    <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                    {vendor.averageFulfillmentTime}m
                  </span>
                </div>
                <div className="text-center border-l border-r border-slate-850">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Bookings Done</span>
                  <span className="text-md font-extrabold text-slate-200 mt-1 font-mono">
                    {vendor.ordersCompleted + completedSessionVal}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Gross Sales</span>
                  <span className="text-md font-extrabold text-slate-250 mt-1 flex items-center justify-center gap-0.5 font-mono">
                    ₹{totalEarned}
                  </span>
                </div>
              </div>

              {/* Live Kitchen load info */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-650" />
                  Kitchen Queue:
                </span>
                <div className="flex gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    activeVol > 0 
                      ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse" 
                      : "bg-slate-950 text-slate-600 border border-slate-900"
                  }`}>
                    {activeVol} processing
                  </span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
