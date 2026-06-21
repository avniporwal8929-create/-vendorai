"use client";

import React, { useState } from "react";
import { useNexus, InventoryItem } from "@/context/NexusContext";
import { 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Sparkles, 
  ArrowRight,
  TrendingDown,
  Database
} from "lucide-react";

export default function InventoryControl() {
  const { 
    inventory, 
    activeStationFilter, 
    restockProduct,
    syncLogs
  } = useNexus();

  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null);
  const [restockAmount, setRestockAmount] = useState(50);
  const [showAiAudit, setShowAiAudit] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);

  // Filters
  const filteredInventory = inventory.filter(
    (item) => activeStationFilter === "All" || item.station === activeStationFilter
  );

  const lowStockItems = filteredInventory.filter(
    (item) => item.availableStock <= item.reorderLevel
  );

  const criticalItems = filteredInventory.filter(
    (item) => item.availableStock <= item.reorderLevel / 2
  );

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockItem) return;
    restockProduct(restockItem.id, restockAmount);
    setRestockItem(null);
  };

  const runAiAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      setShowAiAudit(true);
    }, 1200);
  };

  // Stock status styling
  const getStockStatus = (item: InventoryItem) => {
    if (item.availableStock <= item.reorderLevel / 2) {
      return { label: "Critical", style: "bg-rose-500/10 text-rose-400 border border-rose-500/20" };
    }
    if (item.availableStock <= item.reorderLevel) {
      return { label: "Low Stock", style: "bg-amber-500/10 text-amber-400 border border-amber-500/20" };
    }
    return { label: "Optimal", style: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" };
  };

  return (
    <div className="p-8 space-y-6">
      
      {/* Header Controller */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-400" />
            Inventory Control
          </h1>
          <p className="text-xs text-slate-400">Monitor storage health indices, catalog products, and deploy stock updates.</p>
        </div>

        <button
          onClick={runAiAudit}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-650 text-slate-100 rounded-lg text-xs font-bold shadow-lg border border-indigo-400/20 transition-all hover:scale-102"
        >
          <Sparkles className="w-4 h-4 animate-pulse text-amber-300" />
          {isAuditing ? "Auditing stock levels..." : "Run AI Restock Audit"}
        </button>
      </div>

      {/* Health Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glow-card bg-slate-900/60 p-5 rounded-xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Optimal Items</span>
            <span className="text-2xl font-extrabold text-slate-100 mt-1 block">
              {filteredInventory.length - lowStockItems.length} / {filteredInventory.length}
            </span>
          </div>
        </div>

        <div className="glow-card bg-slate-900/60 p-5 rounded-xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-amber-600/10 text-amber-400 border border-amber-500/20 rounded-lg">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Low Stock Alerts</span>
            <span className="text-2xl font-extrabold text-slate-100 mt-1 block">{lowStockItems.length}</span>
          </div>
        </div>

        <div className="glow-card bg-slate-900/60 p-5 rounded-xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-rose-600/10 text-rose-400 border border-rose-500/20 rounded-lg">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Critical Shortages</span>
            <span className="text-2xl font-extrabold text-rose-400 mt-1 block">{criticalItems.length}</span>
          </div>
        </div>
      </div>

      {/* AI Audit Dialog Overlay */}
      {showAiAudit && (
        <div className="bg-indigo-650/5 border border-indigo-500/20 p-5 rounded-xl flex gap-4 items-start relative overflow-hidden">
          <div className="p-2.5 bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 rounded-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-sm font-extrabold text-slate-150 uppercase tracking-wider">AI Restock Purchase Recommendations</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              I identified **{lowStockItems.length} items** below thresholds. Here is the generated restock manifest matching active flight passenger volumes:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {lowStockItems.map((item, idx) => {
                const suggestion = item.reorderLevel * 2 - item.availableStock;
                return (
                  <div key={idx} className="bg-slate-950/60 border border-slate-900 p-3 rounded flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-200 block">{item.name}</span>
                      <span className="text-[10px] text-slate-500">{item.station}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-indigo-400 font-bold block">+{suggestion} Units</span>
                      <span className="text-[9px] text-slate-500">PO Draft Ready</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3.5 pt-2">
              <button
                onClick={() => {
                  // Apply all PO restocks
                  lowStockItems.forEach(item => {
                    restockProduct(item.id, item.reorderLevel * 2 - item.availableStock);
                  });
                  setShowAiAudit(false);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-slate-100 font-bold text-xs rounded transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Approve & Dispatch POs
              </button>
              <button
                onClick={() => setShowAiAudit(false)}
                className="px-3 py-2 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded hover:bg-slate-950 transition-all"
              >
                Dismiss Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Inventory List */}
      <div className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-450 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">Product Name</th>
                <th className="p-4">Terminal Station</th>
                <th className="p-4">Fulfilling Vendor</th>
                <th className="p-4">Stock Level</th>
                <th className="p-4">Reorder Limit</th>
                <th className="p-4">Health Index</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredInventory.map((item) => {
                const status = getStockStatus(item);
                const percent = Math.min(100, Math.floor((item.availableStock / (item.reorderLevel * 2)) * 100));

                return (
                  <tr key={item.id} className="hover:bg-slate-900/30 transition-colors text-slate-350">
                    <td className="p-4 font-bold text-slate-200">{item.name}</td>
                    <td className="p-4 flex items-center gap-1.5 font-medium">
                      <span>📍</span>
                      {item.station.replace(" Railway Station", "")}
                    </td>
                    <td className="p-4 text-xs font-medium">{item.vendor}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100">{item.availableStock}</span>
                        <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              status.label === "Critical" ? "bg-rose-500" :
                              status.label === "Low Stock" ? "bg-amber-500" : "bg-emerald-500"
                            }`} 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-450">{item.reorderLevel} units</td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${status.style}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setRestockItem(item);
                          setRestockAmount(item.reorderLevel * 2 - item.availableStock);
                        }}
                        className="px-3 py-1 bg-slate-950 hover:bg-slate-900 text-[10px] font-bold border border-slate-850 hover:border-slate-700 text-slate-300 rounded transition-all"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment Form Modal */}
      {restockItem && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative glow-card">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-indigo-400" />
              Adjust Stock Levels
            </h2>
            <p className="text-[11px] text-slate-450 mb-6">
              Manually add restock batches for **{restockItem.name}** at *{restockItem.station.replace(" Railway Station", "")}*.
            </p>

            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Current Stock</label>
                <input
                  type="text"
                  disabled
                  value={`${restockItem.availableStock} Units (Reorder Level: ${restockItem.reorderLevel})`}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-500 font-medium"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Add Stock Count</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-bold"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setRestockItem(null)}
                  className="px-4 py-2 border border-slate-800 text-slate-450 hover:text-slate-200 text-xs font-semibold rounded hover:bg-slate-950 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-xs font-bold rounded shadow transition-all"
                >
                  Commit Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
