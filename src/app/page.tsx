"use client";

import React, { useState, useEffect } from "react";
import { useNexus, Order, InventoryItem } from "@/context/NexusContext";
import { 
  ShoppingCart, 
  Package, 
  Send, 
  Sparkles, 
  Clock, 
  Compass, 
  MapPin, 
  Train, 
  User, 
  Box, 
  RefreshCw,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Database,
  Search,
  Bot,
  Activity,
  Star,
  Sliders,
  Sun,
  Flame,
  ArrowRight,
  TrendingUp,
  Cpu
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

const PRODUCT_PRICES: Record<string, number> = {
  "Water Bottle": 20,
  "Charger": 350,
  "Tissue": 10,
  "ORS": 30,
  "Sanitizer": 50,
  "Baby Care Kit": 450,
};

const STATUS_COLORS: Record<Order["status"], string> = {
  Pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  Confirmed: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
  Packing: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
  "Out For Delivery": "bg-sky-500/10 text-sky-400 border border-sky-500/20",
  Delivered: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  Cancelled: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
};

export default function PremiumVendorHub() {
  const { 
    orders, 
    inventory, 
    vendors,
    agents, 
    activeStationFilter, 
    updateOrderStatus, 
    assignAgentToOrder,
    restockProduct,
    addOrder,
    triggerNotionSync
  } = useNexus();

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSimModal, setShowSimModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"inventory" | "forecasting" | "stations" | "performance">("inventory");
  
  // Mobile Tab View Controller
  const [activeMobileView, setActiveMobileView] = useState<"queue" | "details" | "stocks">("queue");

  // Forecasting sliders
  const [temperature, setTemperature] = useState(38);
  const [trafficIndex, setTrafficIndex] = useState(1.2);
  const [isWeekend, setIsWeekend] = useState(false);

  // Simulated Order Form Fields
  const [simPnr, setSimPnr] = useState("");
  const [simTrainNum, setSimTrainNum] = useState("");
  const [simTrainName, setSimTrainName] = useState("");
  const [simCoach, setSimCoach] = useState("");
  const [simSeat, setSimSeat] = useState("");
  const [simProduct, setSimProduct] = useState("Water Bottle");
  const [simQty, setSimQty] = useState(1);

  // Mount check to safeguard Recharts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter Bookings
  const filteredOrders = orders.filter((o) => {
    const stationMatch = activeStationFilter === "All" || o.station === activeStationFilter;
    const searchMatch = 
      o.pnr.includes(searchTerm) || 
      o.trainNumber.includes(searchTerm) || 
      o.trainName.toLowerCase().includes(searchTerm.toLowerCase());
    return stationMatch && searchMatch;
  });

  const filteredInventory = inventory.filter(
    (item) => activeStationFilter === "All" || item.station === activeStationFilter
  );

  const lowStockItems = filteredInventory.filter(i => i.availableStock <= i.reorderLevel);

  // Auto-select booking
  useEffect(() => {
    if (filteredOrders.length > 0 && !selectedOrderId) {
      setSelectedOrderId(filteredOrders[0].id);
    }
  }, [filteredOrders, selectedOrderId]);

  const selectedOrder = orders.find(o => o.id === selectedOrderId) || filteredOrders[0];

  const handleNextStatus = (order: Order) => {
    const statuses: Order["status"][] = ["Pending", "Confirmed", "Packing", "Out For Delivery", "Delivered"];
    const currentIdx = statuses.indexOf(order.status);
    if (currentIdx !== -1 && currentIdx < statuses.length - 1) {
      updateOrderStatus(order.id, statuses[currentIdx + 1]);
    }
  };

  const handleSimulateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simPnr || !simTrainNum || !simCoach || !simSeat) return;

    addOrder({
      pnr: simPnr,
      trainNumber: simTrainNum,
      trainName: simTrainName || "NDLS Shatabdi Exp",
      coach: simCoach.toUpperCase(),
      seat: simSeat,
      station: activeStationFilter === "All" ? "New Delhi Railway Station" : activeStationFilter,
      products: [{ name: simProduct, quantity: simQty }],
      status: "Pending",
      assignedVendor: "Shree Balaji Foods",
      assignedDeliveryAgent: "Unassigned"
    });

    setSimPnr("");
    setSimTrainNum("");
    setSimTrainName("");
    setSimCoach("");
    setSimSeat("");
    setShowSimModal(false);
    
    // Auto switch to list on mobile to see it
    setActiveMobileView("queue");
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await triggerNotionSync();
    setIsSyncing(false);
  };

  const calculateForecastMultiplier = () => {
    let multiplier = trafficIndex;
    if (temperature > 35) multiplier += (temperature - 35) * 0.05;
    if (isWeekend) multiplier += 0.25;
    return multiplier;
  };

  const mult = calculateForecastMultiplier();

  const revenueForecastData = [
    { day: "Mon", Projected: Math.floor(24000 * mult) },
    { day: "Tue", Projected: Math.floor(21500 * mult) },
    { day: "Wed", Projected: Math.floor(28900 * mult) },
    { day: "Thu", Projected: Math.floor(32000 * mult) },
    { day: "Fri", Projected: Math.floor(38400 * mult) },
    { day: "Sat", Projected: Math.floor(41200 * (mult + 0.15)) },
    { day: "Sun", Projected: Math.floor(44000 * (mult + 0.2)) },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gradient-to-b from-[#090e1a] to-[#02050c] text-slate-100 font-sans antialiased">
      
      {/* 1. Global Metrics guidance row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 p-4 md:p-6 border-b border-slate-900/60 bg-slate-955/20 shrink-0">
        
        {/* Metric 1: Vendor SLA Performance */}
        <div className="bg-[#0b101d]/60 backdrop-blur-xl p-3 md:p-4.5 border border-slate-800/60 rounded-2xl flex items-center gap-2.5 md:gap-4 shadow-[0_4px_25px_rgba(0,0,0,0.4)] hover:border-indigo-500/20 transition-all duration-300">
          <div className="p-2 bg-indigo-650/10 text-indigo-400 border border-indigo-500/20 rounded-lg shrink-0">
            <Star className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" />
          </div>
          <div className="min-w-0">
            <span className="text-[8px] md:text-[10px] font-bold text-slate-550 uppercase tracking-wider block truncate">Kitchen SLA</span>
            <span className="text-xs md:text-md font-extrabold text-slate-200 block mt-0.5 tracking-tight truncate">4.8 ⭐</span>
          </div>
        </div>

        {/* Metric 2: Orders state */}
        <div className="bg-[#0b101d]/60 backdrop-blur-xl p-3 md:p-4.5 border border-slate-800/60 rounded-2xl flex items-center gap-2.5 md:gap-4 shadow-[0_4px_25px_rgba(0,0,0,0.4)] hover:border-emerald-500/20 transition-all duration-300">
          <div className="p-2 bg-emerald-650/10 text-emerald-400 border border-emerald-500/20 rounded-lg shrink-0">
            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <span className="text-[8px] md:text-[10px] font-bold text-slate-550 uppercase tracking-wider block truncate">Fulfillments</span>
            <span className="text-xs md:text-md font-extrabold text-slate-200 block mt-0.5 tracking-tight truncate">
              {orders.filter(o => o.status !== "Delivered" && o.status !== "Cancelled").length} active
            </span>
          </div>
        </div>

        {/* Metric 3: Safety stock warnings */}
        <div className="bg-[#0b101d]/60 backdrop-blur-xl p-3 md:p-4.5 border border-slate-800/60 rounded-2xl flex items-center gap-2.5 md:gap-4 shadow-[0_4px_25px_rgba(0,0,0,0.4)] hover:border-amber-500/20 transition-all duration-300">
          <div className="p-2 bg-amber-650/10 text-amber-400 border border-amber-500/20 rounded-lg shrink-0">
            <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
          </div>
          <div className="min-w-0">
            <span className="text-[8px] md:text-[10px] font-bold text-slate-555 uppercase tracking-wider block truncate">Safety Alert</span>
            <span className={`text-xs md:text-md font-extrabold block mt-0.5 tracking-tight truncate ${lowStockItems.length > 0 ? "text-amber-400 animate-pulse" : "text-slate-200"}`}>
              {lowStockItems.length} items
            </span>
          </div>
        </div>

        {/* Metric 4: Platform hotspots */}
        <div className="bg-[#0b101d]/60 backdrop-blur-xl p-3 md:p-4.5 border border-slate-800/60 rounded-2xl flex items-center gap-2.5 md:gap-4 shadow-[0_4px_25px_rgba(0,0,0,0.4)] hover:border-violet-500/20 transition-all duration-300">
          <div className="p-2 bg-violet-650/10 text-violet-400 border border-violet-500/20 rounded-lg shrink-0">
            <Activity className="w-4 h-4 md:w-5 md:h-5 text-violet-400 animate-pulse" />
          </div>
          <div className="min-w-0">
            <span className="text-[8px] md:text-[10px] font-bold text-slate-555 uppercase tracking-wider block truncate">Hotspots</span>
            <span className="text-xs md:text-md font-extrabold text-slate-200 block mt-0.5 tracking-tight truncate">Pl 3 & 5</span>
          </div>
        </div>

      </div>

      {/* 2. Control room actions */}
      <div className="h-14 border-b border-slate-900/60 bg-slate-950/10 px-4 md:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
          <span className="text-[10px] md:text-xs font-bold text-slate-450 uppercase tracking-wider truncate">
            {activeStationFilter === "All" ? "All Terminals" : activeStationFilter.replace(" Railway Station", "")}
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <div className="relative hidden sm:block">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2" />
            <input
              type="text"
              placeholder="Search PNR..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0b101d]/85 border border-slate-800/60 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-250 placeholder-slate-550 focus:outline-none focus:border-indigo-500/60 transition-all min-w-[120px]"
            />
          </div>

          <button
            onClick={() => {
              setSimPnr(Math.floor(1000000000 + Math.random() * 9000000000).toString());
              setSimTrainNum(Math.floor(12000 + Math.random() * 1000).toString());
              setSimTrainName("NDLS Shatabdi Exp");
              setSimCoach("C2");
              setSimSeat(Math.floor(1 + Math.random() * 60).toString());
              setShowSimModal(true);
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-slate-100 rounded-lg text-[10px] md:text-xs font-bold shadow border border-indigo-400/20 transition-all hover:scale-102 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Order
          </button>

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#0b101d] border border-slate-850 hover:border-slate-700 text-slate-350 hover:text-slate-200 text-[10px] md:text-xs font-semibold rounded-lg transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin text-indigo-400" : ""}`} />
            Sync
          </button>
        </div>
      </div>

      {/* 3. Main Split Panel workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 relative">
        
        {/* Left Column: Order Dispatch Queue & Lifecycle (responsive visibility) */}
        <div className={`w-full md:w-[360px] border-r border-slate-900/60 bg-[#03060d]/10 flex-col h-full shrink-0 ${
          activeMobileView === "queue" ? "flex" : "hidden md:flex"
        }`}>
          <div className="p-4 border-b border-slate-900/60 shrink-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Fulfillment Queue</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredOrders.map((order) => {
              const isSelected = order.id === selectedOrderId;
              return (
                <div
                  key={order.id}
                  onClick={() => {
                    setSelectedOrderId(order.id);
                    // On mobile, automatically shift to details view to guide user
                    if (window.innerWidth < 768) {
                      setActiveMobileView("details");
                    }
                  }}
                  className={`border p-4.5 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col gap-3 glow-card ${
                    isSelected 
                      ? "border-indigo-500/40 bg-indigo-950/15 shadow-[0_0_20px_rgba(99,102,241,0.06)]" 
                      : "border-slate-850/80 hover:border-slate-750 bg-[#090d16]/80"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-indigo-400 font-mono tracking-wider bg-indigo-650/10 px-2 py-0.5 rounded border border-indigo-500/10">PNR: {order.pnr}</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-200 block truncate">{order.trainName}</span>
                    <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 mt-1">
                      <Train className="w-3 h-3 text-slate-600" />
                      Train #{order.trainNumber} • Coach {order.coach} (Seat {order.seat})
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-850/60 mt-1 text-[10px]">
                    <span className="text-slate-550 font-bold">
                      📍 {order.station.replace(" Railway Station", "")}
                    </span>
                    {order.status !== "Delivered" && order.status !== "Cancelled" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNextStatus(order);
                        }}
                        className="px-2.5 py-1 bg-indigo-600/15 text-indigo-400 border border-indigo-500/25 rounded text-[8px] font-bold uppercase tracking-wider hover:bg-indigo-600 hover:text-slate-100 transition-all cursor-pointer"
                      >
                        {order.status === "Pending" ? "Confirm" :
                         order.status === "Confirmed" ? "Pack" :
                         order.status === "Packing" ? "Dispatch" : "Deliver"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center/Right Column: Interactive AI Guidance Workspace */}
        <div className={`flex-1 flex-col h-full bg-[#03060d]/20 min-w-0 border-r border-slate-900/60 ${
          activeMobileView === "details" ? "flex" : "hidden md:flex"
        }`}>
          
          {/* Workspace Tabs */}
          <div className="h-12 border-b border-slate-900/60 bg-slate-955/20 px-4 md:px-6 flex items-center gap-4 md:gap-6 shrink-0 text-[10px] md:text-xs overflow-x-auto whitespace-nowrap">
            <button
              onClick={() => setActiveTab("inventory")}
              className={`pb-4 pt-3.5 border-b-2 font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "inventory" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-350"
              }`}
            >
              Inventory Planner
            </button>
            <button
              onClick={() => setActiveTab("forecasting")}
              className={`pb-4 pt-3.5 border-b-2 font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "forecasting" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-350"
              }`}
            >
              Demand Forecasting
            </button>
            <button
              onClick={() => setActiveTab("stations")}
              className={`pb-4 pt-3.5 border-b-2 font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "stations" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-350"
              }`}
            >
              Station Visibility
            </button>
            <button
              onClick={() => setActiveTab("performance")}
              className={`pb-4 pt-3.5 border-b-2 font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "performance" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-350"
              }`}
            >
              Vendor performance
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            
            {/* 1. Selected Order Delivery Assignment details */}
            {selectedOrder ? (
              <div className="glow-card bg-[#0b101d]/60 border border-slate-800/60 rounded-2xl p-4 md:p-5 space-y-4 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-850 pb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-extrabold uppercase tracking-widest shrink-0">
                      Active Escort Guide
                    </span>
                    <strong className="text-slate-300 text-xs font-mono truncate">PNR {selectedOrder.pnr} ({selectedOrder.trainName})</strong>
                  </div>
                  <span className="text-[10px] text-slate-450 font-semibold flex items-center gap-1.5 bg-slate-950/60 px-2 py-1 border border-slate-900 rounded w-fit shrink-0">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    Delivery: {selectedOrder.estimatedDeliveryTime}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* AI Packing */}
                  <div className="bg-[#03060d]/80 border border-slate-900 p-4 rounded-xl space-y-3">
                    <span className="text-[9px] font-bold text-slate-550 uppercase tracking-widest block border-b border-slate-900 pb-1.5 mb-2">AI Packing Sequence</span>
                    {selectedOrder.packingDetails ? (
                      <div className="space-y-2">
                        <p className="text-[11px] font-semibold text-indigo-300 leading-relaxed bg-indigo-950/10 p-2.5 border border-indigo-500/10 rounded font-mono">
                          💡 {selectedOrder.packingDetails.recommendation}
                        </p>
                        <ol className="space-y-1">
                          {selectedOrder.packingDetails.sequence.slice(0, 3).map((step, sIdx) => (
                            <li key={sIdx} className="text-[10px] text-slate-400 flex items-center gap-2 font-medium">
                              <span className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[8px] text-indigo-400 font-mono shrink-0">{sIdx+1}</span>
                              <span className="truncate">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-600 font-medium">Advance status to confirm packing sequence logs.</p>
                    )}
                  </div>

                  {/* AI Delivery runner assignment */}
                  <div className="bg-[#03060d]/80 border border-slate-900 p-4 rounded-xl space-y-3">
                    <span className="text-[9px] font-bold text-slate-555 uppercase tracking-widest block border-b border-slate-900 pb-1.5 mb-2">AI Delivery Route & Runner</span>
                    <div className="space-y-2">
                      <select
                        value={selectedOrder.assignedDeliveryAgent}
                        onChange={(e) => assignAgentToOrder(selectedOrder.id, e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-[10px] text-slate-200 rounded px-2.5 py-1.5 w-full focus:outline-none"
                      >
                        <option value="Unassigned">Assign Delivery Runner</option>
                        {agents.map((agent) => (
                          <option key={agent.id} value={agent.name}>
                            {agent.name} (SLA: {agent.completionRate}%)
                          </option>
                        ))}
                      </select>

                      {selectedOrder.deliveryRoute ? (
                        <div className="text-[10px] text-slate-350 font-mono bg-slate-900/60 p-2.5 border border-slate-850 rounded flex gap-2 items-start leading-relaxed">
                          <Compass className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{selectedOrder.deliveryRoute}</span>
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-605 font-medium">Route recommendations update on confirm.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-550 font-medium text-center py-6 bg-slate-900/30 border border-slate-850 rounded-2xl">Select a booking to view dispatcher guide.</p>
            )}

            {/* 2. Dynamic Tab Sections */}
            
            {/* Tab: Inventory Planner */}
            {activeTab === "inventory" && (
              <div className="space-y-6">
                <div className="glow-card bg-[#0b101d]/60 border border-slate-800/60 rounded-2xl p-5 space-y-4 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-850 pb-3 gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">AI Stock Replenishment Planner</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">Calculates shortages matching scheduled trains.</p>
                    </div>
                    {lowStockItems.length > 0 && (
                      <button
                        onClick={() => {
                          lowStockItems.forEach(i => restockProduct(i.id, i.reorderLevel * 2 - i.availableStock));
                        }}
                        className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-slate-100 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg w-fit"
                      >
                        Restock all
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {filteredInventory.map((item) => {
                      const isLow = item.availableStock <= item.reorderLevel;
                      const isCritical = item.availableStock <= item.reorderLevel / 2;
                      const needed = item.reorderLevel * 2 - item.availableStock;

                      return (
                        <div key={item.id} className="flex justify-between items-center bg-[#03060d]/80 border border-slate-900 p-3.5 rounded-xl text-xs hover:border-slate-750 transition-all">
                          <div className="min-w-0">
                            <span className="font-bold text-slate-200 block truncate">{item.name}</span>
                            <span className="text-[9px] text-slate-500 truncate block">{item.vendor}</span>
                          </div>
                          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                            <div className="text-right">
                              <span className={`font-bold block ${isCritical ? "text-rose-455" : isLow ? "text-amber-400" : "text-slate-300"}`}>
                                {item.availableStock} Units
                              </span>
                              <span className="text-[9px] text-slate-550">Limit: {item.reorderLevel}</span>
                            </div>
                            
                            <div className="w-24 sm:w-32 text-right">
                              {isLow ? (
                                <button
                                  onClick={() => restockProduct(item.id, needed)}
                                  className="px-2 py-1 bg-indigo-650/15 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-650 hover:text-slate-100 rounded text-[9px] font-semibold transition-all cursor-pointer"
                                >
                                  +{needed}
                                </button>
                              ) : (
                                <span className="text-[10px] text-emerald-450 font-bold uppercase tracking-wider">Optimal</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Demand Forecasting */}
            {activeTab === "forecasting" && (
              <div className="space-y-6">
                
                {/* Modifiers */}
                <div className="glow-card bg-[#0b101d]/60 border border-slate-800/60 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
                  
                  {/* Sun Mod */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-455 flex items-center gap-1.5 uppercase tracking-wider">
                      <Sun className="w-3.5 h-3.5 text-amber-505" />
                      Temperature index
                    </span>
                    <input
                      type="range"
                      min="15"
                      max="45"
                      value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))}
                      className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-indigo-550"
                    />
                    <span className="text-[10px] text-slate-200 font-bold block text-right font-mono">{temperature}°C</span>
                  </div>

                  {/* Traffic Mod */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-455 flex items-center gap-1.5 uppercase tracking-wider">
                      <Train className="w-3.5 h-3.5 text-indigo-455" />
                      Passenger traffic
                    </span>
                    <input
                      type="range"
                      min="0.5"
                      max="2.5"
                      step="0.1"
                      value={trafficIndex}
                      onChange={(e) => setTrafficIndex(Number(e.target.value))}
                      className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-indigo-550"
                    />
                    <span className="text-[10px] text-slate-200 font-bold block text-right font-mono">{trafficIndex.toFixed(1)}x</span>
                  </div>

                  {/* Weekend toggler */}
                  <div className="flex justify-between items-center border-t border-slate-850/60 pt-4 md:border-t-0 md:pt-0 md:border-l md:pl-6">
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Weekend modifier</span>
                    <button
                      onClick={() => setIsWeekend(!isWeekend)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-all cursor-pointer ${
                        isWeekend ? "bg-indigo-650 flex justify-end" : "bg-slate-800 flex justify-start"
                      }`}
                    >
                      <span className="w-4 h-4 bg-slate-100 rounded-full shadow-md" />
                    </button>
                  </div>

                </div>

                {/* Graph */}
                <div className="glow-card bg-[#0b101d]/60 border border-slate-800/60 rounded-2xl p-6 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-6">AI Gross Sales Predictions</h3>
                  <div className="h-64">
                    {isMounted ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueForecastData}>
                          <defs>
                            <linearGradient id="projColor" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(75,85,99,0.08)" vertical={false} />
                          <XAxis dataKey="day" stroke="#4b5563" fontSize={10} tickLine={false} />
                          <YAxis stroke="#4b5563" fontSize={10} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", fontSize: "11px" }} />
                          <Area type="monotone" dataKey="Projected" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#projColor)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full bg-slate-950/40 rounded-xl animate-pulse flex items-center justify-center text-xs text-slate-650 font-mono">
                        Loading charts...
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* Tab: Station Visibility */}
            {activeTab === "stations" && (
              <div className="space-y-6">
                <div className="glow-card bg-[#0b101d]/60 border border-slate-800/60 rounded-2xl p-5 space-y-4 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
                  <div className="border-b border-slate-850 pb-3">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Terminal Platform Map & Hotspots</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Real-time occupancy status levels.</p>
                  </div>
                  
                  <div className="space-y-3 text-xs">
                    <div className="bg-[#03060d]/80 border border-slate-900 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <strong className="text-slate-200 block">Platform 1-2 (Gatimaan Express)</strong>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">Estimated arrival: 12:45 PM • Delayed: 5 mins</span>
                      </div>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        Normal flow
                      </span>
                    </div>

                    <div className="bg-[#03060d]/80 border border-slate-900 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <strong className="text-slate-200 block">Platform 3-4 (Local Passenger trains)</strong>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">Shatabdi connection scheduled in 10 mins</span>
                      </div>
                      <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">
                        Slight bottleneck
                      </span>
                    </div>

                    <div className="bg-[#03060d]/80 border border-slate-900 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <strong className="text-slate-200 block">Platform 5-8 (Rajdhani Express)</strong>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">Heavy peak boarding currently active</span>
                      </div>
                      <span className="text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider animate-ping">
                        Peak queue alert
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Vendor Performance */}
            {activeTab === "performance" && (
              <div className="space-y-6">
                <div className="glow-card bg-[#0b101d]/60 border border-slate-800/60 rounded-2xl p-5 space-y-4 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-850 pb-3">
                    Active Kitchen SLA Latency Ratings
                  </h3>
                  
                  <div className="space-y-3 text-xs">
                    {vendors.map((v) => (
                      <div key={v.id} className="flex justify-between items-center bg-[#03060d]/80 border border-slate-900 p-3.5 rounded-xl hover:border-slate-750 transition-all">
                        <div>
                          <span className="font-bold text-slate-200 block">{v.name}</span>
                          <span className="text-[9px] text-slate-500">{v.station}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-indigo-400 block font-mono">{v.averageFulfillmentTime} mins avg</span>
                          <span className="text-[10px] text-slate-455 block mt-0.5">⭐ {v.rating.toFixed(1)} / 5.0</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Panel: Inventory list & AI Chat Co-Pilot (responsive visibility) */}
        <div className={`w-full md:w-[360px] bg-slate-950/60 flex-col h-full shrink-0 ${
          activeMobileView === "stocks" ? "flex" : "hidden md:flex"
        }`}>
          
          {/* Top Half: Inventory Stock Levels */}
          <div className="flex-1 border-b border-slate-900 p-4 flex flex-col overflow-hidden">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Live Stock Levels</span>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {filteredInventory.map((item) => {
                const isLow = item.availableStock <= item.reorderLevel;
                const isCritical = item.availableStock <= item.reorderLevel / 2;

                return (
                  <div key={item.id} className="bg-slate-900/40 border border-slate-850/60 p-3 rounded-xl flex items-center justify-between text-xs glow-card hover:border-slate-700 transition-all">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-200">{item.name}</span>
                        {isLow && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isCritical ? "bg-rose-500 animate-ping" : "bg-amber-500 animate-pulse"}`}></span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">{item.vendor}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className={`font-bold block ${isCritical ? "text-rose-455" : isLow ? "text-amber-400" : "text-slate-100"}`}>
                          {item.availableStock} units
                        </span>
                        <span className="text-[9px] text-slate-550">Limit: {item.reorderLevel}</span>
                      </div>
                      <button
                        onClick={() => restockProduct(item.id, 20)}
                        className="px-2 py-1 bg-slate-950 hover:bg-slate-900 text-[9px] font-bold border border-slate-800 text-slate-350 hover:text-slate-200 rounded transition-all cursor-pointer"
                      >
                        +20
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Half: Mini AI Assistant Panel */}
          <div className="h-[260px] p-4 flex flex-col overflow-hidden bg-slate-900/10 border-t border-slate-900/60">
            <div className="flex items-center gap-1.5 border-b border-slate-900 pb-3 shrink-0 mb-3">
              <Bot className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">AI Guidance Bot</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-auto animate-ping"></span>
            </div>

            {/* Quick Prompts */}
            <div className="flex-1 overflow-y-auto flex flex-col justify-end space-y-3">
              <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl rounded-bl-none text-xs text-slate-300">
                <p className="font-semibold text-indigo-405 flex items-center gap-1 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  Nexus Co-Pilot Insights
                </p>
                <p className="text-[11px] text-slate-450 leading-relaxed font-medium">Use the floating **AI Copilot** button at the bottom-right for full conversational audits.</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Mobile Sticky Bottom Tab Bar */}
      <div className="h-16 border-t border-slate-900 bg-[#070a13]/90 backdrop-blur-md flex items-center justify-around md:hidden shrink-0 z-30 px-4">
        <button
          onClick={() => setActiveMobileView("queue")}
          className={`flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
            activeMobileView === "queue" ? "text-indigo-400 font-bold" : "text-slate-500 hover:text-slate-400"
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider font-bold">Queue</span>
        </button>
        
        <button
          onClick={() => setActiveMobileView("details")}
          className={`flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
            activeMobileView === "details" ? "text-indigo-400 font-bold" : "text-slate-500 hover:text-slate-400"
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider font-bold">Details</span>
        </button>
        
        <button
          onClick={() => setActiveMobileView("stocks")}
          className={`flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
            activeMobileView === "stocks" ? "text-indigo-400 font-bold" : "text-slate-500 hover:text-slate-400"
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider font-bold">Stocks</span>
        </button>
      </div>

      {/* Simulator Modal */}
      {showSimModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[#0b101d] border border-slate-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative glow-card">
            <h2 className="text-xs font-bold text-slate-100 flex items-center gap-2 mb-1 uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-indigo-400" />
              Deploy Simulated Order
            </h2>
            <p className="text-[11px] text-slate-400 mb-6">Create a live booking to verify inventory updates and packaging logs.</p>
            
            <form onSubmit={handleSimulateOrder} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">PNR Number</label>
                  <input
                    type="text"
                    required
                    value={simPnr}
                    onChange={(e) => setSimPnr(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Train ID</label>
                  <input
                    type="text"
                    required
                    value={simTrainNum}
                    onChange={(e) => setSimTrainNum(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Train Name</label>
                  <input
                    type="text"
                    value={simTrainName}
                    onChange={(e) => setSimTrainName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Coach / Seat</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="C2"
                      required
                      value={simCoach}
                      onChange={(e) => setSimCoach(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-1 py-1.5 text-xs text-slate-200 focus:outline-none text-center"
                    />
                    <input
                      type="text"
                      placeholder="35"
                      required
                      value={simSeat}
                      onChange={(e) => setSimSeat(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-1 py-1.5 text-xs text-slate-200 focus:outline-none text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Product Item</label>
                  <select
                    value={simProduct}
                    onChange={(e) => setSimProduct(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    {Object.keys(PRODUCT_PRICES).map((k) => (
                      <option key={k} value={k}>{k} (₹{PRODUCT_PRICES[k]})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Qty</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={simQty}
                    onChange={(e) => setSimQty(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowSimModal(false)}
                  className="px-4 py-2 border border-slate-800 text-slate-405 hover:text-slate-205 text-xs font-semibold rounded-lg hover:bg-slate-950 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-500 text-slate-100 text-xs font-bold rounded-lg shadow-lg transition-all cursor-pointer"
                >
                  Deploy Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
