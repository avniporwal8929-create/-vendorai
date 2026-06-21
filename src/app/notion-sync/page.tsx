"use client";

import React, { useState } from "react";
import { useNexus, SyncLog } from "@/context/NexusContext";
import { 
  Database, 
  RefreshCw, 
  Layers, 
  Code, 
  ExternalLink,
  CheckCircle,
  Clock,
  Sparkles,
  Info
} from "lucide-react";

const DATABASES = [
  { 
    name: "Orders Database", 
    desc: "Stores passenger PNR bookings, coach/seat targets, and order state.",
    notionId: "db_orders_ndls_9042",
    properties: [
      { name: "PNR Number", type: "Title (Text)" },
      { name: "Train ID", type: "Select" },
      { name: "Coach / Seat", type: "Rich Text" },
      { name: "Products", type: "Relation (Inventory DB)" },
      { name: "Status", type: "Status (Select)" },
      { name: "Delivery Partner", type: "Relation (Agents DB)" }
    ]
  },
  { 
    name: "Inventory Database", 
    desc: "Tracks item stock limits, safety reorder marks, and kitchen owners.",
    notionId: "db_inventory_ndls_1180",
    properties: [
      { name: "Product Name", type: "Title (Text)" },
      { name: "Available Stock", type: "Number" },
      { name: "Reorder Limit", type: "Number" },
      { name: "Station Hub", type: "Select" },
      { name: "Kitchen Vendor", type: "Relation (Vendors DB)" }
    ]
  },
  { 
    name: "Vendors Database", 
    desc: "Roster of station kitchens, licensing, and fulfillment SLA ratings.",
    notionId: "db_vendors_ndls_2850",
    properties: [
      { name: "Kitchen Name", type: "Title (Text)" },
      { name: "Station Hub", type: "Select" },
      { name: "Orders Done", type: "Number" },
      { name: "Revenue (INR)", type: "Number" },
      { name: "Avg Latency (Min)", type: "Number" }
    ]
  },
  { 
    name: "Delivery Agents Database", 
    desc: "Runner registries, shifts, active assignments, and completion speeds.",
    notionId: "db_agents_ndls_3042",
    properties: [
      { name: "Runner Name", type: "Title (Text)" },
      { name: "Shift Status", type: "Select" },
      { name: "Dispatches Done", type: "Number" },
      { name: "Completion Rate (%)", type: "Number" }
    ]
  }
];

export default function NotionSync() {
  const { syncLogs, triggerNotionSync, notionConfig } = useNexus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeSchemaDb, setActiveSchemaDb] = useState<string | null>(null);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      await triggerNotionSync();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Filter Notion specific logs
  const notionLogs = syncLogs.filter(
    (log) => log.message.toLowerCase().includes("notion") || log.message.toLowerCase().includes("sync")
  );

  return (
    <div className="p-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-400" />
            Notion Integration Desk
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configure database mapping properties, inspect schemas, and synchronize registries.</p>
        </div>

        <button
          onClick={handleSyncNow}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-slate-100 rounded-lg text-xs font-bold shadow border border-indigo-500/20 transition-all hover:scale-102"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Syncing Workspace..." : "Sync Databases"}
        </button>
      </div>

      {/* Sync Status Banner */}
      <div className="bg-indigo-650/5 border border-indigo-500/20 p-5 rounded-xl flex gap-4 items-start">
        <div className="p-2.5 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-lg shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xs font-extrabold text-slate-200 tracking-wider uppercase mb-1 flex items-center gap-1.5">
            Operational Workspace Sync Mode: {notionConfig.isConfigured ? "Connected" : "Simulated Local Registry"}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            By default, RailQuick Nexus OS uses a high-fidelity local state engine. If you want to connect real Notion pages, configure integration tokens and database IDs in the <span className="font-semibold text-indigo-400">System Settings</span> module.
          </p>
        </div>
      </div>

      {/* Database Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DATABASES.map((db, idx) => {
          const customDbId = 
            db.name.includes("Orders") ? notionConfig.ordersDbId :
            db.name.includes("Inventory") ? notionConfig.inventoryDbId :
            db.name.includes("Vendors") ? notionConfig.vendorsDbId : notionConfig.agentsDbId;

          return (
            <div key={idx} className="glow-card bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">{db.name}</h3>
                  <span className="text-[10px] bg-slate-950 border border-slate-900 font-mono text-slate-500 px-2 py-0.5 rounded">
                    {customDbId || db.notionId}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">{db.desc}</p>
              </div>

              <div className="flex gap-3 mt-6 border-t border-slate-850 pt-4 text-xs font-semibold">
                <button
                  onClick={() => setActiveSchemaDb(activeSchemaDb === db.name ? null : db.name)}
                  className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  {activeSchemaDb === db.name ? "Hide Properties" : "Inspect Schema"}
                </button>
                <a 
                  href="https://notion.so" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-350 transition-colors ml-auto"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Notion
                </a>
              </div>

              {/* Schema Inspector */}
              {activeSchemaDb === db.name && (
                <div className="mt-4 bg-slate-950/80 border border-slate-900 rounded-xl p-3.5 space-y-2">
                  <span className="text-[8px] bg-slate-900 text-slate-500 border border-slate-800 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-widest block w-fit mb-2">
                    Property Schemas
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    {db.properties.map((prop, pIdx) => (
                      <div key={pIdx} className="flex justify-between border-b border-slate-900 pb-1.5 last:border-0 last:pb-0">
                        <span className="text-slate-400 font-medium">{prop.name}</span>
                        <code className="text-indigo-400 font-mono">{prop.type}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sync Webhook Log Stream */}
      <div className="glow-card bg-slate-900/40 border border-slate-800 rounded-xl p-6">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">Notion Webhook Handshake Logs</h3>
        <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
          {notionLogs.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">No Notion synch events logs. Trigger a database sync above.</p>
          ) : (
            notionLogs.map((log, idx) => (
              <div key={idx} className="text-xs border-b border-slate-900/40 pb-3 flex gap-2 font-mono">
                <span className="text-[10px] text-slate-600 mt-0.5 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <div>
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider mr-1.5 shrink-0 ${
                    log.type === "success" ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/20" :
                    log.type === "warning" ? "bg-amber-600/10 text-amber-400 border border-amber-500/20" :
                    "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20"
                  }`}>
                    {log.type}
                  </span>
                  <p className="text-slate-350 inline font-medium text-[11px]">{log.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
