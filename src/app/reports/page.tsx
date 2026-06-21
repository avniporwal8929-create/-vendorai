"use client";

import React, { useState } from "react";
import { useNexus } from "@/context/NexusContext";
import { 
  FileText, 
  Printer, 
  Download, 
  Calendar, 
  CheckCircle,
  TrendingUp,
  AlertTriangle
} from "lucide-react";

export default function ReportingCenter() {
  const { orders, inventory, vendors, agents } = useNexus();
  const [reportType, setReportType] = useState<"daily" | "weekly">("daily");

  const handlePrint = () => {
    window.print();
  };

  // Compute values
  const completedOrders = orders.filter(o => o.status === "Delivered");
  const totalRevenue = completedOrders.reduce((acc, o) => {
    const orderVal = o.products.reduce((sum, p) => {
      const price = p.name === "Water Bottle" ? 20 :
                    p.name === "Charger" ? 350 :
                    p.name === "Tissue" ? 10 :
                    p.name === "ORS" ? 30 :
                    p.name === "Sanitizer" ? 50 : 450;
      return sum + (price * p.quantity);
    }, 0);
    return acc + orderVal;
  }, 0);

  const lowStockCount = inventory.filter(i => i.availableStock <= i.reorderLevel).length;

  return (
    <div className="p-8 space-y-6">
      
      {/* Page Header (Hides in Print) */}
      <div className="flex justify-between items-center no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" />
            Operational Report Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">Generate print-ready logistics sheets, vendor rosters, and SLA audit trails.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs text-slate-400">
            <button
              onClick={() => setReportType("daily")}
              className={`px-3.5 py-1.5 rounded-md font-medium transition-all ${
                reportType === "daily" ? "bg-slate-800 text-slate-100 shadow font-bold" : "hover:text-slate-200"
              }`}
            >
              Daily Report
            </button>
            <button
              onClick={() => setReportType("weekly")}
              className={`px-3.5 py-1.5 rounded-md font-medium transition-all ${
                reportType === "weekly" ? "bg-slate-800 text-slate-100 shadow font-bold" : "hover:text-slate-200"
              }`}
            >
              Weekly Growth
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-650 hover:bg-indigo-600 active:bg-indigo-700 text-slate-100 rounded-lg text-xs font-bold shadow border border-indigo-500/20 transition-all hover:scale-102"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* Report Preview Document */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 max-w-4xl mx-auto shadow-2xl relative glow-card bg-grid-dots">
        
        {/* Printable Header */}
        <div className="border-b border-slate-850 pb-6 mb-6 flex justify-between items-start">
          <div>
            <h2 className="text-md font-extrabold text-slate-150 uppercase tracking-widest">RailQuick Operations</h2>
            <span className="text-[10px] text-indigo-400 font-mono font-bold block mt-1 uppercase tracking-wider">
              {reportType === "daily" ? "Daily Telemetry Audit Sheet" : "Weekly Growth Performance Audit"}
            </span>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono">
            <p>Nexus Database V1.0</p>
            <p className="mt-0.5">Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-4">
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">I. Executive Summary</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              This document compiles operational compliance audits across active station hubs (NDLS, ANVT). 
              All product volumes, fulfillment latency indices, and delivery runner SLA counts have been parsed 
              from active local cache logs and mapped to corresponding schema registries.
            </p>
          </div>

          {/* Key Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
            <div className="bg-slate-950/60 border border-slate-900 p-3.5 rounded-xl text-center">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Fulfillments</span>
              <span className="text-lg font-bold text-slate-200 mt-1 block">{completedOrders.length} bookings</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-900 p-3.5 rounded-xl text-center">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Revenue</span>
              <span className="text-lg font-bold text-slate-200 mt-1 block">₹{totalRevenue}</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-900 p-3.5 rounded-xl text-center">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Low Stocks</span>
              <span className="text-lg font-bold text-slate-200 mt-1 block">{lowStockCount} items</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-900 p-3.5 rounded-xl text-center">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Sync Status</span>
              <span className="text-lg font-bold text-emerald-400 mt-1 block uppercase text-[11px] tracking-wider">Optimal</span>
            </div>
          </div>

          {/* Section II: Vendor Latencies */}
          <div className="pt-2">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3.5">II. Kitchen Vendor Fulfillment Speeds</h4>
            <div className="bg-slate-950/40 border border-slate-900 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-850 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                    <th className="p-3">Vendor</th>
                    <th className="p-3">Terminal</th>
                    <th className="p-3">Rating</th>
                    <th className="p-3">Speed SLA</th>
                    <th className="p-3 text-right">Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {vendors.map((vendor) => (
                    <tr key={vendor.id} className="text-slate-350">
                      <td className="p-3 font-bold text-slate-300">{vendor.name}</td>
                      <td className="p-3">{vendor.station.replace(" Railway Station", "")}</td>
                      <td className="p-3">⭐ {vendor.rating.toFixed(1)}</td>
                      <td className="p-3 font-semibold text-indigo-400">{vendor.averageFulfillmentTime} mins</td>
                      <td className="p-3 text-right font-mono">{vendor.ordersCompleted} orders</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section III: Delivery SLA */}
          <div className="pt-4">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3.5">III. Delivery Runner Compliance Reports</h4>
            <div className="bg-slate-950/40 border border-slate-900 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-850 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                    <th className="p-3">Runner Name</th>
                    <th className="p-3">Registry Status</th>
                    <th className="p-3">Completed Sessions</th>
                    <th className="p-3 text-right">Completion Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {agents.map((agent) => (
                    <tr key={agent.id} className="text-slate-350">
                      <td className="p-3 font-bold text-slate-300">{agent.name}</td>
                      <td className="p-3">{agent.status}</td>
                      <td className="p-3 font-mono">{agent.completedDeliveries} dispatches</td>
                      <td className="p-3 text-right font-bold text-emerald-450">{agent.completionRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Printable Footer */}
        <div className="border-t border-slate-850 pt-6 mt-8 flex justify-between items-center text-[10px] text-slate-500 font-mono">
          <span>RailQuick Nexus Operations System Report</span>
          <span>Security Tag: RQ-NEXUS-9042X</span>
        </div>

      </div>

    </div>
  );
}
