"use client";

import React, { useState } from "react";
import { useNexus } from "@/context/NexusContext";
import { 
  Settings, 
  Database, 
  Lock, 
  Save, 
  Sparkles,
  CheckCircle,
  HelpCircle
} from "lucide-react";

export default function SettingsPage() {
  const { notionConfig, saveNotionConfig } = useNexus();

  const [token, setToken] = useState(notionConfig.integrationToken);
  const [ordersId, setOrdersId] = useState(notionConfig.ordersDbId);
  const [inventoryId, setInventoryId] = useState(notionConfig.inventoryDbId);
  const [vendorsId, setVendorsId] = useState(notionConfig.vendorsDbId);
  const [agentsId, setAgentsId] = useState(notionConfig.agentsDbId);
  
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");
  
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveNotionConfig({
      integrationToken: token,
      ordersDbId: ordersId,
      inventoryDbId: inventoryId,
      vendorsDbId: vendorsId,
      agentsDbId: agentsId
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  return (
    <div className="p-8 space-y-6 max-w-3xl">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          System Configuration Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">Configure Notion API access tokens, Supabase database bindings, and sync endpoints.</p>
      </div>

      {isSaved && (
        <div className="bg-emerald-600/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-2.5 text-xs text-emerald-400 font-bold">
          <CheckCircle className="w-5 h-5 shrink-0" />
          Settings successfully updated. Synch endpoints re-established.
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Notion Integrations */}
        <div className="glow-card bg-slate-900/60 p-6 border border-slate-800 rounded-2xl space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
            <Database className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Notion Workspace Integration</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Internal Integration Token</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-650 absolute left-3 top-2.5" />
                <input
                  type="password"
                  placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Orders Database ID</label>
                <input
                  type="text"
                  placeholder="e.g. 58f2780e1a4f4943960769a68fa9180f"
                  value={ordersId}
                  onChange={(e) => setOrdersId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-250 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Inventory Database ID</label>
                <input
                  type="text"
                  placeholder="e.g. 1a2b3c4d5e6f7g8h9i0j..."
                  value={inventoryId}
                  onChange={(e) => setInventoryId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-250 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Vendors Database ID</label>
                <input
                  type="text"
                  placeholder="e.g. v_xxxxxx"
                  value={vendorsId}
                  onChange={(e) => setVendorsId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-250 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Agents Database ID</label>
                <input
                  type="text"
                  placeholder="e.g. a_xxxxxx"
                  value={agentsId}
                  onChange={(e) => setAgentsId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-250 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Supabase Integration */}
        <div className="glow-card bg-slate-900/60 p-6 border border-slate-800 rounded-2xl space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Supabase Socket Real-Time Database</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Supabase Client Project URL</label>
              <input
                type="text"
                placeholder="https://your-project.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-250 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Supabase Public API Anon Key</label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-slate-100 rounded-lg text-xs font-bold shadow-lg border border-indigo-400/20 transition-all hover:scale-102 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Connection Parameters
          </button>
        </div>

      </form>

    </div>
  );
}
