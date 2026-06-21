"use client";

import React, { useState } from "react";
import { useNexus, Order, DeliveryAgent, Vendor } from "@/context/NexusContext";
import { 
  Kanban, 
  Table as TableIcon, 
  Search, 
  MapPin, 
  Train, 
  User, 
  Box, 
  Clock, 
  Compass, 
  CheckCircle,
  Truck,
  PackageCheck,
  ChevronRight,
  UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STATUSES: Order["status"][] = ["Pending", "Confirmed", "Packing", "Out For Delivery", "Delivered", "Cancelled"];

const STATUS_COLORS: Record<Order["status"], string> = {
  Pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  Confirmed: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
  Packing: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
  "Out For Delivery": "bg-sky-500/10 text-sky-400 border border-sky-500/20",
  Delivered: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  Cancelled: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
};

export default function OrderOperations() {
  const { 
    orders, 
    agents, 
    vendors,
    activeStationFilter, 
    updateOrderStatus, 
    assignAgentToOrder,
    assignVendorToOrder 
  } = useNexus();

  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filters
  const filteredOrders = orders.filter((o) => {
    const stationMatch = activeStationFilter === "All" || o.station === activeStationFilter;
    const searchMatch = 
      o.pnr.includes(searchTerm) || 
      o.trainNumber.includes(searchTerm) || 
      o.trainName.toLowerCase().includes(searchTerm.toLowerCase());
    return stationMatch && searchMatch;
  });

  const getStatusList = (status: Order["status"]) => {
    return filteredOrders.filter((o) => o.status === status);
  };

  const handleNextStatus = (order: Order) => {
    const currentIdx = STATUSES.indexOf(order.status);
    if (currentIdx < STATUSES.length - 2) {
      updateOrderStatus(order.id, STATUSES[currentIdx + 1]);
    }
  };

  const activeAgents = agents.filter(a => a.status === "Available");
  const stationVendors = vendors.filter(v => activeStationFilter === "All" || v.station === activeStationFilter);

  // Find order if selectedOrder updates in parent state
  const currentSelectedOrder = orders.find(o => o.id === selectedOrder?.id) || selectedOrder;

  return (
    <div className="p-8 space-y-6 flex flex-col h-full overflow-hidden">
      
      {/* Header Controller */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Order Operations</h1>
          <p className="text-xs text-slate-400 mt-1">Manage station food deliveries, packing sequences, and delivery partners.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle View */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-0.5 flex gap-1 text-xs">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-2 rounded flex items-center gap-1.5 transition-all ${
                viewMode === "kanban" 
                  ? "bg-slate-850 text-indigo-400 shadow-md font-bold" 
                  : "text-slate-450 hover:text-slate-200"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              Kanban View
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded flex items-center gap-1.5 transition-all ${
                viewMode === "table" 
                  ? "bg-slate-850 text-indigo-400 shadow-md font-bold" 
                  : "text-slate-450 hover:text-slate-200"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              Table View
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search PNR / Train"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-medium"
            />
          </div>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-hidden min-h-0">
        <AnimatePresence mode="wait">
          {viewMode === "kanban" ? (
            <motion.div 
              key="kanban"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 h-full overflow-x-auto pb-4"
            >
              {STATUSES.map((status) => {
                const list = getStatusList(status);
                return (
                  <div key={status} className="bg-slate-950/40 border border-slate-900 rounded-xl p-3 flex flex-col h-full min-w-[220px]">
                    <div className="flex items-center justify-between mb-3.5 px-1">
                      <span className="text-xs font-bold text-slate-350 tracking-wide uppercase">{status}</span>
                      <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded-full">
                        {list.length}
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                      {list.map((order) => (
                        <div
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 p-3.5 rounded-xl cursor-pointer transition-all hover:scale-102 flex flex-col gap-2.5 glow-card"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-indigo-400 font-mono tracking-wider">PNR: {order.pnr}</span>
                            <span className="text-[9px] text-slate-500 font-semibold">{order.estimatedDeliveryTime}</span>
                          </div>

                          <div>
                            <span className="text-xs font-bold text-slate-200 block truncate">{order.trainName}</span>
                            <span className="text-[10px] text-slate-450 font-semibold flex items-center gap-1 mt-0.5">
                              <Train className="w-3 h-3 text-slate-500" />
                              Train #{order.trainNumber} • Coach {order.coach} (Seat {order.seat})
                            </span>
                          </div>

                          <div className="border-t border-slate-850 pt-2 flex flex-col gap-1.5">
                            {order.products.map((p, pIdx) => (
                              <div key={pIdx} className="flex justify-between text-[10px] text-slate-400 font-medium">
                                <span>{p.name}</span>
                                <span className="font-bold text-slate-300">x{p.quantity}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-850 mt-1">
                            <span className="text-[9px] text-slate-500 truncate max-w-[100px] font-bold">
                              📍 {order.station.replace(" Railway Station", "")}
                            </span>
                            {order.status !== "Delivered" && order.status !== "Cancelled" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNextStatus(order);
                                }}
                                className="px-2 py-1 bg-indigo-600/20 text-indigo-400 border border-indigo-500/25 rounded text-[8px] font-bold uppercase tracking-wider hover:bg-indigo-600 hover:text-slate-100 transition-all"
                              >
                                {order.status === "Pending" ? "Confirm" :
                                 order.status === "Confirmed" ? "Pack" :
                                 order.status === "Packing" ? "Dispatch" : "Deliver"}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden h-full flex flex-col"
            >
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-4">PNR</th>
                      <th className="p-4">Train Details</th>
                      <th className="p-4">Seat / Coach</th>
                      <th className="p-4">Terminal</th>
                      <th className="p-4">Vendor</th>
                      <th className="p-4">Delivery Partner</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="hover:bg-slate-900/50 cursor-pointer transition-colors text-slate-350"
                      >
                        <td className="p-4 font-mono font-bold text-indigo-400">{order.pnr}</td>
                        <td className="p-4">
                          <span className="font-semibold text-slate-200 block">{order.trainName}</span>
                          <span className="text-[10px] text-slate-500">#{order.trainNumber}</span>
                        </td>
                        <td className="p-4 font-semibold text-slate-300">
                          Coach {order.coach} / Seat {order.seat}
                        </td>
                        <td className="p-4">{order.station.replace(" Railway Station", "")}</td>
                        <td className="p-4 font-medium">{order.assignedVendor}</td>
                        <td className="p-4 font-medium">{order.assignedDeliveryAgent}</td>
                        <td className="p-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${STATUS_COLORS[order.status]}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleNextStatus(order)}
                            disabled={order.status === "Delivered" || order.status === "Cancelled"}
                            className="px-3 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 rounded text-[9px] font-bold text-slate-300 transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Advance
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Detail Drawer */}
      {currentSelectedOrder && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-all"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="fixed top-0 right-0 h-full w-[460px] bg-slate-950 border-l border-slate-800 shadow-2xl z-50 flex flex-col p-6 overflow-y-auto space-y-6">
            
            {/* Drawer Header */}
            <div className="flex justify-between items-center border-b border-slate-850 pb-4">
              <div>
                <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest ${STATUS_COLORS[currentSelectedOrder.status]}`}>
                  {currentSelectedOrder.status}
                </span>
                <h2 className="text-md font-extrabold text-slate-200 mt-1">Order details - PNR {currentSelectedOrder.pnr}</h2>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:bg-slate-900 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* General Metadata */}
            <div className="bg-slate-900/60 p-4 border border-slate-800/80 rounded-xl space-y-3 glow-card">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Train Schedule</span>
                  <span className="font-semibold text-slate-300 block mt-0.5">{currentSelectedOrder.trainName} ({currentSelectedOrder.trainNumber})</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Escort Location</span>
                  <span className="font-semibold text-slate-300 block mt-0.5">Coach {currentSelectedOrder.coach} / Berth Seat {currentSelectedOrder.seat}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs border-t border-slate-850 pt-2.5">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Target Terminal</span>
                  <span className="font-semibold text-slate-300 block mt-0.5">{currentSelectedOrder.station}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Escort Time</span>
                  <span className="font-semibold text-slate-300 block mt-0.5">{currentSelectedOrder.estimatedDeliveryTime}</span>
                </div>
              </div>
            </div>

            {/* Products List */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Booked items</h4>
              <div className="bg-slate-900/30 border border-slate-800 rounded-xl divide-y divide-slate-850">
                {currentSelectedOrder.products.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 text-xs text-slate-300">
                    <span className="font-bold">{p.name}</span>
                    <span className="bg-slate-800 text-indigo-400 px-2 py-0.5 rounded font-bold">Qty {p.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Packing Assistant Panel */}
            <div className="bg-indigo-650/5 border border-indigo-500/20 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-indigo-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">AI Packing Assistant</h4>
              </div>

              {currentSelectedOrder.packingDetails ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 border border-slate-900 rounded font-mono">
                    💡 {currentSelectedOrder.packingDetails.recommendation}
                  </p>
                  <div>
                    <span className="text-[9px] font-bold text-indigo-450 uppercase tracking-wider block mb-1">Suggested Sequence</span>
                    <ol className="space-y-1">
                      {currentSelectedOrder.packingDetails.sequence.map((step, sIdx) => (
                        <li key={sIdx} className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <ChevronRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold bg-slate-950/30 p-2 rounded">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Estimated Pack Time: <strong className="text-slate-200">{currentSelectedOrder.packingDetails.estimatedTime}</strong></span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-medium">Packing advice generates automatically when you advance status to Confirmed or Packing.</p>
              )}
            </div>

            {/* AI Delivery Routing & Assignment */}
            <div className="bg-emerald-650/5 border border-emerald-500/20 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">AI Delivery Routing</h4>
              </div>

              <div className="space-y-3.5">
                {/* Agent Selector */}
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Assigned Agent</label>
                  <div className="flex gap-2">
                    <select
                      value={currentSelectedOrder.assignedDeliveryAgent}
                      onChange={(e) => assignAgentToOrder(currentSelectedOrder.id, e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded px-2 py-1.5 flex-1 focus:outline-none"
                    >
                      <option value="Unassigned">Select Delivery Runner</option>
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.name}>
                          {agent.name} ({agent.status} • SLA: {agent.completionRate}%)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* AI Agent Recommendation Card */}
                {currentSelectedOrder.assignedDeliveryAgent === "Unassigned" && (
                  <div className="bg-slate-950/80 border border-slate-900 p-3 rounded-lg flex gap-2.5 items-start">
                    <UserCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[9px] bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        AI Choice
                      </span>
                      <p className="text-[11px] font-bold text-slate-250 mt-1">Recommended Partner: {activeAgents[0]?.name || "Rajesh Kumar"}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Based on proximity to kitchen location and active completion rate ({activeAgents[0]?.completionRate || 98.4}%).</p>
                    </div>
                  </div>
                )}

                {/* Delivery Path Route */}
                {currentSelectedOrder.deliveryRoute ? (
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-emerald-405 uppercase tracking-wider block">Optimal Dispatch Path</span>
                    <div className="bg-slate-950/80 border border-slate-900 p-2.5 rounded text-[11px] font-medium text-slate-350 flex gap-2 items-start font-mono">
                      <Compass className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{currentSelectedOrder.deliveryRoute}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Deploy dispatch path updates by confirming or advancing the order to packing status.</p>
                )}
              </div>
            </div>

            {/* Vendor Re-Assignment */}
            <div className="space-y-2 pt-2 border-t border-slate-900">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Change Fulfilling Vendor</label>
              <select
                value={currentSelectedOrder.assignedVendor}
                onChange={(e) => assignVendorToOrder(currentSelectedOrder.id, e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded px-2.5 py-1.5 w-full focus:outline-none"
              >
                {stationVendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.name}>
                    {vendor.name} ({vendor.rating} ⭐)
                  </option>
                ))}
              </select>
            </div>

          </div>
        </>
      )}

    </div>
  );
}

// X Icon
const X = ({ className, ...props }: React.ComponentProps<"svg">) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={className}
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
