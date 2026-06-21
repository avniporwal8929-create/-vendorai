"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Cpu,
  ChevronLeft,
  Settings,
  Terminal,
  UserCheck
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

interface ChatMessage {
  sender: "user" | "copilot";
  text: string;
  timestamp: Date;
}

export default function MobileVendorApp() {
  const { 
    orders, 
    inventory, 
    vendors,
    agents, 
    syncLogs, 
    activeStationFilter, 
    setActiveStationFilter,
    updateOrderStatus, 
    assignAgentToOrder,
    restockProduct,
    addOrder,
    triggerNotionSync,
    getAiCopilotResponse,
    notionConfig,
    saveNotionConfig
  } = useNexus();

  // Mobile App Navigation
  const [activeTab, setActiveTab] = useState<"orders" | "stocks" | "ai" | "config">("orders");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSimModal, setShowSimModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // AI Chat States
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: "copilot",
      text: "### Nexus Active.\nAsk me about stock replenishments, runner SLAs, or peak train volumes.",
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Settings states
  const [notionToken, setNotionToken] = useState(notionConfig.integrationToken);
  const [ordersDbId, setOrdersDbId] = useState(notionConfig.ordersDbId);
  const [inventoryDbId, setInventoryDbId] = useState(notionConfig.inventoryDbId);
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);

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

  // Mount check
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isTyping]);

  // Sync settings when loaded
  useEffect(() => {
    setNotionToken(notionConfig.integrationToken);
    setOrdersDbId(notionConfig.ordersDbId);
    setInventoryDbId(notionConfig.inventoryDbId);
  }, [notionConfig]);

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
  const selectedOrder = orders.find(o => o.id === selectedOrderId);

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
    
    // Select the new order
    const lastOrder = orders[0];
    if (lastOrder) setSelectedOrderId(lastOrder.id);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await triggerNotionSync();
    setIsSyncing(false);
  };

  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: "user", text: userMsg, timestamp: new Date() }]);
    setChatInput("");
    setIsTyping(true);

    const response = await getAiCopilotResponse(userMsg);
    setChatMessages(prev => [...prev, { sender: "copilot", text: response, timestamp: new Date() }]);
    setIsTyping(false);
  };

  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveNotionConfig({
      integrationToken: notionToken,
      ordersDbId: ordersDbId,
      inventoryDbId: inventoryDbId
    });
    setIsSettingsSaved(true);
    setTimeout(() => setIsSettingsSaved(false), 3000);
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

  const renderMessageContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let trimmed = line.trim();
      if (trimmed.startsWith("### ")) {
        return <h4 key={idx} className="text-[11px] font-bold text-slate-100 mt-2 mb-1 flex items-center gap-1"><Sparkles className="w-3 h-3 text-indigo-400" /> {trimmed.substring(4)}</h4>;
      }
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return <div key={idx} className="text-[10px] text-slate-350 pl-3 border-l border-slate-700/80 my-1">{trimmed.substring(2).replace(/\*\*/g, "")}</div>;
      }
      return <p key={idx} className="text-[10px] text-slate-300 leading-normal mb-1">{line.replace(/\*\*/g, "")}</p>;
    });
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#090e1a] to-[#02050c] overflow-hidden select-none relative">
      
      {/* Dynamic Header */}
      <header className="h-14 border-b border-slate-900/60 bg-[#040812]/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-650/15 text-indigo-400 border border-indigo-500/20 rounded-lg">
            <Cpu className="w-4.5 h-4.5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-xs tracking-wider uppercase text-slate-200">RailQuick</h1>
            <span className="text-[9px] font-bold text-indigo-400 block">NEXUS APP</span>
          </div>
        </div>

        {/* Station Select Toggle inside app header */}
        <select
          value={activeStationFilter}
          onChange={(e) => setActiveStationFilter(e.target.value)}
          className="bg-slate-900 border border-slate-850 text-[10px] font-bold text-slate-300 rounded-md px-2 py-1 focus:outline-none"
        >
          <option value="All">All Terminals</option>
          <option value="New Delhi Railway Station">NDLS Station</option>
          <option value="Anand Vihar Railway Station">ANVT Station</option>
        </select>
      </header>

      {/* Main Screen Router Content */}
      <div className="flex-1 overflow-hidden min-h-0 relative">

        {/* SCREEN 1: Orders (Nested Stack: List vs Details) */}
        {activeTab === "orders" && (
          <div className="h-full flex flex-col overflow-hidden">
            {!selectedOrderId ? (
              /* ORDER LIST SCREEN */
              <div className="h-full flex flex-col overflow-hidden">
                <div className="p-3 border-b border-slate-900 flex justify-between items-center bg-[#040812]/20 shrink-0 gap-3">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
                    <input
                      type="text"
                      placeholder="Search PNR..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
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
                    className="p-1.5 bg-indigo-650 hover:bg-indigo-600 text-slate-100 rounded-lg shadow-md border border-indigo-400/20 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className="border border-slate-850 bg-[#090d16]/80 p-4 rounded-2xl cursor-pointer hover:border-indigo-500/20 transition-all duration-300 flex flex-col gap-2.5 glow-card"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-indigo-400 font-mono tracking-wider bg-indigo-650/10 px-2 py-0.5 rounded border border-indigo-500/10">PNR: {order.pnr}</span>
                        <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${STATUS_COLORS[order.status]}`}>
                          {order.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-200 block truncate">{order.trainName}</span>
                        <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 mt-1 font-mono">
                          Coach {order.coach} / Seat {order.seat}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2.5 border-t border-slate-850/60 text-[9px] text-slate-550 font-bold">
                        <span>📍 {order.station.replace(" Railway Station", "")}</span>
                        <span className="text-slate-400 font-mono">{order.estimatedDeliveryTime}</span>
                      </div>
                    </div>
                  ))}

                  {filteredOrders.length === 0 && (
                    <p className="text-xs text-slate-650 text-center py-12">No pending bookings.</p>
                  )}
                </div>
              </div>
            ) : (
              /* ORDER DETAILS SCREEN (With Back button) */
              selectedOrder && (
                <div className="h-full flex flex-col overflow-hidden bg-[#03060d]/10">
                  <div className="h-11 border-b border-slate-900 bg-[#040812]/40 px-3 flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedOrderId(null)}
                      className="p-1 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-slate-250 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-xs font-bold text-slate-350">Order Detail stack</span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-5">
                    
                    {/* Header PNR */}
                    <div className="bg-[#0b101d]/60 border border-slate-850 p-4 rounded-2xl space-y-2 glow-card shadow">
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${STATUS_COLORS[selectedOrder.status]}`}>
                          {selectedOrder.status}
                        </span>
                        <strong className="text-[10px] text-slate-500 font-mono">PNR: {selectedOrder.pnr}</strong>
                      </div>
                      <h3 className="text-xs font-extrabold text-slate-200 mt-1">{selectedOrder.trainName} • #{selectedOrder.trainNumber}</h3>
                      <div className="flex justify-between text-[10px] text-slate-450 border-t border-slate-850/60 pt-2 mt-2">
                        <span>Coach {selectedOrder.coach} / Seat {selectedOrder.seat}</span>
                        <span>Time: {selectedOrder.estimatedDeliveryTime}</span>
                      </div>
                    </div>

                    {/* Products details */}
                    <div className="bg-[#03060d]/60 border border-slate-900 p-4 rounded-xl space-y-2.5">
                      <span className="text-[9px] font-bold text-slate-550 uppercase tracking-widest block border-b border-slate-900 pb-1.5">Items list</span>
                      {selectedOrder.products.map((p, idx) => (
                        <div key={idx} className="flex justify-between text-xs font-bold text-slate-300">
                          <span>{p.name}</span>
                          <span className="text-indigo-400 font-mono">Qty {p.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* AI Packing Sequence details */}
                    <div className="bg-indigo-650/5 border border-indigo-500/20 p-4 rounded-xl space-y-3">
                      <div className="flex items-center gap-1.5">
                        <Box className="w-4.5 h-4.5 text-indigo-400" />
                        <span className="text-xs font-bold text-slate-250 uppercase tracking-wider">AI Packing Assistant</span>
                      </div>
                      {selectedOrder.packingDetails ? (
                        <div className="space-y-3">
                          <p className="text-[11px] font-semibold text-indigo-300 leading-normal bg-indigo-950/20 p-2.5 border border-indigo-500/10 rounded font-mono">
                            💡 {selectedOrder.packingDetails.recommendation}
                          </p>
                          <ol className="space-y-1">
                            {selectedOrder.packingDetails.sequence.map((step, sIdx) => (
                              <li key={sIdx} className="text-[10px] text-slate-400 flex items-center gap-1.5 font-medium">
                                <span className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center text-[8px] text-indigo-400 font-mono shrink-0">{sIdx+1}</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-550">Fulfillment sequences generate automatically on confirm.</p>
                      )}
                    </div>

                    {/* AI Delivery routing & partner */}
                    <div className="bg-emerald-650/5 border border-emerald-500/20 p-4 rounded-xl space-y-3">
                      <div className="flex items-center gap-1.5">
                        <Compass className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold text-slate-250 uppercase tracking-wider">AI Platform Routing</span>
                      </div>
                      <div className="space-y-3.5">
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
                          <div className="text-[10px] text-slate-350 font-mono bg-slate-950/80 p-2.5 border border-slate-900 rounded flex gap-2 items-start leading-relaxed">
                            <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{selectedOrder.deliveryRoute}</span>
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-605">Route suggestions update when status changes.</p>
                        )}
                      </div>
                    </div>

                    {/* Next Action button */}
                    {selectedOrder.status !== "Delivered" && selectedOrder.status !== "Cancelled" && (
                      <button
                        onClick={() => handleNextStatus(selectedOrder)}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-slate-100 rounded-xl text-xs font-bold uppercase tracking-wider shadow border border-indigo-400/20 transition-all cursor-pointer"
                      >
                        Advance Order Status
                      </button>
                    )}

                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* SCREEN 2: Stocks (Inventory Planner) */}
        {activeTab === "stocks" && (
          <div className="h-full flex flex-col overflow-hidden p-4 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-900/60 pb-3 shrink-0">
              <div>
                <h3 className="text-xs font-bold text-slate-205 uppercase tracking-wider">Replenishment Planner</h3>
                <p className="text-[9px] text-slate-550 mt-0.5">Safety margins based on scheduled traffic.</p>
              </div>
              {lowStockItems.length > 0 && (
                <button
                  onClick={() => {
                    lowStockItems.forEach(i => restockProduct(i.id, i.reorderLevel * 2 - i.availableStock));
                  }}
                  className="px-2.5 py-1 bg-indigo-650 hover:bg-indigo-600 text-slate-100 text-[9px] font-bold rounded uppercase tracking-wider transition-all"
                >
                  Restock All
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {filteredInventory.map((item) => {
                const isLow = item.availableStock <= item.reorderLevel;
                const isCritical = item.availableStock <= item.reorderLevel / 2;
                const needed = item.reorderLevel * 2 - item.availableStock;

                return (
                  <div key={item.id} className="flex justify-between items-center bg-[#090d16]/80 border border-slate-850 p-3 rounded-xl text-xs glow-card">
                    <div className="min-w-0">
                      <span className="font-bold text-slate-200 block truncate">{item.name}</span>
                      <span className="text-[9px] text-slate-500 block truncate">{item.vendor}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className={`font-bold block ${isCritical ? "text-rose-455" : isLow ? "text-amber-400" : "text-slate-300"}`}>
                          {item.availableStock} Units
                        </span>
                        <span className="text-[9px] text-slate-550 font-mono">Limit: {item.reorderLevel}</span>
                      </div>
                      
                      <div className="w-16 text-right">
                        {isLow ? (
                          <button
                            onClick={() => restockProduct(item.id, needed)}
                            className="px-2 py-1 bg-indigo-650/15 text-indigo-400 border border-indigo-500/20 rounded text-[9px] font-semibold transition-all"
                          >
                            +{needed}
                          </button>
                        ) : (
                          <span className="text-[9px] text-emerald-450 font-bold uppercase tracking-wider">Optimal</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SCREEN 3: AI Assist (Forecasting & Chatbot) */}
        {activeTab === "ai" && (
          <div className="h-full flex flex-col overflow-hidden">
            
            {/* Top modifiers (Forecasting sim) */}
            <div className="p-4 border-b border-slate-900 bg-[#040812]/20 shrink-0 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-indigo-400" /> AI Forecasting modifiers</span>
                <span className="text-[9px] text-slate-550 font-mono">Estimated mult: {mult.toFixed(1)}x</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-semibold text-slate-450">
                    <span>Temp</span>
                    <span>{temperature}°C</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="45"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-550"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-semibold text-slate-450">
                    <span>Bookings</span>
                    <span>{trafficIndex.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={trafficIndex}
                    onChange={(e) => setTrafficIndex(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-550"
                  />
                </div>
              </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-grid-dots relative">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex gap-2 max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}>
                  <div className={`p-2 rounded-lg shrink-0 w-8 h-8 flex items-center justify-center ${
                    msg.sender === "user" ? "bg-indigo-650/20 text-indigo-400 border border-indigo-500/20" : "bg-slate-900 border border-slate-800"
                  }`}>
                    {msg.sender === "user" ? <User className="w-3.5 h-3.5 text-indigo-300" /> : <Bot className="w-3.5 h-3.5 text-indigo-400" />}
                  </div>
                  <div className={`p-3 rounded-2xl ${
                    msg.sender === "user" 
                      ? "bg-indigo-650 text-slate-100 rounded-tr-none" 
                      : "bg-[#090d16]/95 text-slate-205 rounded-tl-none border border-slate-850/80 shadow-md"
                  }`}>
                    {msg.sender === "user" ? (
                      <p className="text-[11px] leading-normal">{msg.text}</p>
                    ) : (
                      <div>{renderMessageContent(msg.text)}</div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2 max-w-[80%] mr-auto items-center">
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg shrink-0 w-8 h-8 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  </div>
                  <div className="bg-[#090d16]/95 border border-slate-850/80 p-2.5 rounded-2xl rounded-tl-none flex gap-1 items-center">
                    <span className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce"></span>
                    <span className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleChatSend} className="p-3 border-t border-slate-900 bg-[#040812]/20 flex gap-2 shrink-0">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask Copilot (e.g. Predict tomorrow)"
                className="flex-1 bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-550 focus:outline-none"
              />
              <button
                type="submit"
                className="p-2 bg-indigo-650 hover:bg-indigo-600 text-slate-105 rounded-lg shadow-md border border-indigo-500/20 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        )}

        {/* SCREEN 4: Config (Notion Sync & Connection settings) */}
        {activeTab === "config" && (
          <div className="h-full flex flex-col overflow-hidden p-4 space-y-5">
            <div className="border-b border-slate-900/60 pb-3 shrink-0">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Notion database mapping</h3>
              <p className="text-[9px] text-slate-500 mt-0.5">Map API parameters to Notion pages.</p>
            </div>

            {isSettingsSaved && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg text-[10px] text-emerald-450 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Notion credentials saved successfully.
              </div>
            )}

            <form onSubmit={handleSettingsSave} className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div>
                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Integration Token</label>
                <input
                  type="password"
                  placeholder="secret_xxxxxxxxxxxxxxxxxx"
                  value={notionToken}
                  onChange={(e) => setNotionToken(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-250 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Orders DB ID</label>
                <input
                  type="text"
                  placeholder="db_orders_ndls_xxx"
                  value={ordersDbId}
                  onChange={(e) => setOrdersDbId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-250 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Inventory DB ID</label>
                <input
                  type="text"
                  placeholder="db_inventory_ndls_xxx"
                  value={inventoryDbId}
                  onChange={(e) => setInventoryDbId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-250 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-slate-100 rounded-lg text-xs font-bold shadow border border-indigo-400/20 cursor-pointer"
              >
                Save configurations
              </button>
            </form>

            <div className="bg-slate-900/40 border border-slate-850 p-3.5 rounded-2xl space-y-2">
              <span className="text-[8px] bg-slate-950 text-slate-500 border border-slate-900 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-widest block w-fit">
                Sync telemetry status
              </span>
              <p className="text-[10px] text-slate-450 leading-relaxed">
                Database synchronization maps <strong>Title</strong> parameters to PNR codes and <strong>Relation</strong> parameters to inventory assets.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Sticky Bottom Native Tab Bar */}
      <nav className="h-16 border-t border-slate-900 bg-[#040812]/95 backdrop-blur-md flex items-center justify-around shrink-0 z-30 px-3 pb-2">
        <button
          onClick={() => {
            setActiveTab("orders");
            setSelectedOrderId(null); // Reset detail stack when tapping tab
          }}
          className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
            activeTab === "orders" ? "text-indigo-400 font-extrabold" : "text-slate-500 hover:text-slate-400"
          }`}
        >
          <ShoppingCart className="w-4.5 h-4.5" />
          <span className="text-[8px] uppercase tracking-widest">Orders</span>
        </button>
        
        <button
          onClick={() => setActiveTab("stocks")}
          className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
            activeTab === "stocks" ? "text-indigo-400 font-extrabold" : "text-slate-500 hover:text-slate-400"
          }`}
        >
          <Package className="w-4.5 h-4.5" />
          <span className="text-[8px] uppercase tracking-widest">Stocks</span>
        </button>
        
        <button
          onClick={() => setActiveTab("ai")}
          className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
            activeTab === "ai" ? "text-indigo-400 font-extrabold" : "text-slate-500 hover:text-slate-400"
          }`}
        >
          <Sparkles className="w-4.5 h-4.5" />
          <span className="text-[8px] uppercase tracking-widest">AI Assist</span>
        </button>
        
        <button
          onClick={() => setActiveTab("config")}
          className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
            activeTab === "config" ? "text-indigo-400 font-extrabold" : "text-slate-500 hover:text-slate-400"
          }`}
        >
          <Settings className="w-4.5 h-4.5" />
          <span className="text-[8px] uppercase tracking-widest">Config</span>
        </button>
      </nav>

      {/* Simulator Modal */}
      {showSimModal && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[#0b101d] border border-slate-800 p-5 rounded-2xl w-full max-w-xs shadow-2xl relative glow-card">
            <h2 className="text-xs font-bold text-slate-100 flex items-center gap-1.5 mb-1 uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-indigo-405" />
              Simulate booking
            </h2>
            <p className="text-[10px] text-slate-450 mb-4">Deploy simulated train bookings.</p>
            
            <form onSubmit={handleSimulateOrder} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[8px] font-bold text-slate-500 uppercase block mb-0.5">PNR</label>
                  <input
                    type="text"
                    required
                    value={simPnr}
                    onChange={(e) => setSimPnr(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[8px] font-bold text-slate-550 uppercase block mb-0.5">Train ID</label>
                  <input
                    type="text"
                    required
                    value={simTrainNum}
                    onChange={(e) => setSimTrainNum(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-[8px] font-bold text-slate-500 block mb-0.5">Coach</label>
                  <input
                    type="text"
                    placeholder="C2"
                    required
                    value={simCoach}
                    onChange={(e) => setSimCoach(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[8px] font-bold text-slate-550 block mb-0.5">Seat</label>
                  <input
                    type="text"
                    placeholder="35"
                    required
                    value={simSeat}
                    onChange={(e) => setSimSeat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-1 py-1 text-xs text-slate-200 focus:outline-none text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-[8px] font-bold text-slate-500 block mb-0.5">Product</label>
                  <select
                    value={simProduct}
                    onChange={(e) => setSimProduct(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-xs text-slate-200 focus:outline-none"
                  >
                    {Object.keys(PRODUCT_PRICES).map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[8px] font-bold text-slate-500 block mb-0.5">Qty</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={simQty}
                    onChange={(e) => setSimQty(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowSimModal(false)}
                  className="px-3 py-1.5 border border-slate-800 text-slate-400 text-[10px] font-semibold rounded hover:bg-slate-950 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-[10px] font-bold rounded shadow transition-all cursor-pointer"
                >
                  Deploy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
