"use client";

import React from "react";
import { useNexus } from "@/context/NexusContext";
import { 
  Truck, 
  UserCheck, 
  Activity, 
  Clock, 
  Compass, 
  MapPin, 
  Star,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const AGENT_STATUS_COLORS = {
  Available: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  "On Delivery": "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
  Break: "bg-slate-800 text-slate-500 border border-slate-800",
};

export default function DeliveryOperations() {
  const { orders, agents, assignAgentToOrder } = useNexus();

  // Filter out unassigned orders
  const unassignedOrders = orders.filter(
    (o) => o.assignedDeliveryAgent === "Unassigned" && o.status !== "Cancelled" && o.status !== "Delivered"
  );

  // Compute metrics
  const activeRunnersCount = agents.filter(a => a.status === "Available").length;
  const totalCompleted = agents.reduce((acc, a) => acc + a.completedDeliveries, 0);
  const avgSla = (agents.reduce((acc, a) => acc + a.completionRate, 0) / agents.length).toFixed(1);
  const avgSpeed = (agents.reduce((acc, a) => acc + a.averageDeliveryTime, 0) / agents.length).toFixed(1);

  const getBestAgent = () => {
    const available = agents.filter(a => a.status === "Available");
    if (available.length === 0) return null;
    return available.sort((a, b) => b.completionRate - a.completionRate)[0];
  };

  const recommendedAgent = getBestAgent() || agents[0];

  return (
    <div className="p-8 space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <Truck className="w-6 h-6 text-indigo-400" />
          Delivery Operations
        </h1>
        <p className="text-xs text-slate-400 mt-1">Deploy delivery runners, track platform SLA compliance, and dispatch escorts.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glow-card bg-slate-900/60 p-5 rounded-xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-lg">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Runners Active</span>
            <span className="text-2xl font-extrabold text-slate-100 mt-1 block">{activeRunnersCount} / {agents.length}</span>
          </div>
        </div>

        <div className="glow-card bg-slate-900/60 p-5 rounded-xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Dispatches</span>
            <span className="text-2xl font-extrabold text-slate-100 mt-1 block">{totalCompleted}</span>
          </div>
        </div>

        <div className="glow-card bg-slate-900/60 p-5 rounded-xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-violet-600/10 text-violet-400 border border-violet-500/20 rounded-lg">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Average SLA Rate</span>
            <span className="text-2xl font-extrabold text-slate-100 mt-1 block">{avgSla}%</span>
          </div>
        </div>

        <div className="glow-card bg-slate-900/60 p-5 rounded-xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-amber-600/10 text-amber-400 border border-amber-500/20 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Avg Transit Time</span>
            <span className="text-2xl font-extrabold text-slate-100 mt-1 block">{avgSpeed} mins</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Agent list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glow-card bg-slate-900/40 border border-slate-800 rounded-xl p-5">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">Runner Registry</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-450 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3">Partner Name</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Deliveries</th>
                    <th className="p-3">SLA Compliance</th>
                    <th className="p-3">Avg Delivery Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {agents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-slate-900/30 transition-colors text-slate-350">
                      <td className="p-3 font-bold text-slate-200">{agent.name}</td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                          AGENT_STATUS_COLORS[agent.status]
                        }`}>
                          {agent.status}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-300">{agent.completedDeliveries} dispatches</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-100">{agent.completionRate}%</span>
                          <div className="w-14 h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${agent.completionRate}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-indigo-400">{agent.averageDeliveryTime} mins</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column: AI Recommendation Engine */}
        <div className="space-y-6">
          <div className="glow-card bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-4 shrink-0">
              <Compass className="w-5 h-5 text-indigo-400 animate-pulse" />
              <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">AI Escort Recommender</h3>
                <p className="text-[10px] text-slate-500 font-medium">Automatic runner-to-PNR dispatch matching.</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 max-h-[360px] pr-1">
              {unassignedOrders.length === 0 ? (
                <div className="text-center py-8">
                  <span className="inline-block p-2 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 rounded-full mb-2">
                    <CheckCircle className="w-5 h-5" />
                  </span>
                  <p className="text-xs text-slate-400 font-semibold">All active dispatches assigned!</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Simulate a booking in the Command Center to trigger new recommendations.</p>
                </div>
              ) : (
                unassignedOrders.map((order) => {
                  const platform = Math.floor(Math.random() * 8) + 1;
                  const estRoute = `Platform ${platform} -> Coach ${order.coach}`;
                  const agentChoice = recommendedAgent ? recommendedAgent.name : "Rajesh Kumar";
                  const confidence = recommendedAgent ? recommendedAgent.completionRate : 98.4;

                  return (
                    <div key={order.id} className="bg-slate-900/90 border border-slate-850 p-4 rounded-xl space-y-3.5 glow-card">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-indigo-400 font-mono">PNR: {order.pnr}</span>
                        <span className="text-[9px] text-slate-500 font-bold">{order.estimatedDeliveryTime}</span>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-slate-200 block">{order.trainName}</span>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">📍 Coach {order.coach} (Seat {order.seat}) • {order.station.replace(" Railway Station", "")}</span>
                      </div>

                      <div className="bg-slate-950/80 border border-slate-900 p-2.5 rounded text-[10px] space-y-1">
                        <span className="text-[8px] bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-widest block w-fit mb-1">AI Recommendation</span>
                        <div className="flex justify-between text-slate-300">
                          <span>Delivery Runner:</span>
                          <strong className="text-slate-100">{agentChoice}</strong>
                        </div>
                        <div className="flex justify-between text-slate-350">
                          <span>Route Path:</span>
                          <strong>{estRoute}</strong>
                        </div>
                        <div className="flex justify-between text-slate-350">
                          <span>Matching SLA:</span>
                          <strong className="text-emerald-450">{confidence}% Confidence</strong>
                        </div>
                      </div>

                      <button
                        onClick={() => assignAgentToOrder(order.id, agentChoice)}
                        className="w-full py-2 bg-indigo-650 hover:bg-indigo-600 active:bg-indigo-700 text-slate-100 rounded text-[10px] font-bold uppercase tracking-wider border border-indigo-400/20 shadow-md transition-all hover:scale-102"
                      >
                        Deploy Agent {agentChoice.split(" ")[0]}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
