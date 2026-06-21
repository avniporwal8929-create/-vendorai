"use client";

import React, { useState, useEffect } from "react";
import { useNexus, Order } from "@/context/NexusContext";
import {
  ShoppingCart,
  Package,
  Clock,
  Compass,
  MapPin,
  Train,
  User,
  Box,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Search,
  Bot,
  ChevronLeft,
  Settings,
  Mic,
  Volume2,
  Cpu,
} from "lucide-react";

const PRODUCT_PRICES: Record<string, number> = {
  "Water Bottle": 20,
  "Charger": 350,
  "Tissue": 10,
  "ORS": 30,
  "Sanitizer": 50,
  "Baby Care Kit": 450,
};

const INVENTORY_CATEGORIES: Record<string, string[]> = {
  "Beverages": ["Water Bottle"],
  "Snacks & Health": ["ORS", "Sanitizer"],
  "Baby Care": ["Baby Care Kit"],
  "Utilities": ["Charger", "Tissue"],
};

const STATUS_COLORS: Record<Order["status"], string> = {
  Pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  Confirmed: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
  Packing: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
  "Out For Delivery": "bg-sky-500/10 text-sky-400 border border-sky-500/20",
  Delivered: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  Cancelled: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
};

interface VoiceMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  transcript: string;
  language: "en" | "hi";
  isPlaying?: boolean;
}

// Helper: render plain text safely inside JSX
function renderMessageContent(text: string) {
  return <span className="text-[11px] leading-relaxed">{text}</span>;
}

// Voice Q&A pairs for simulation
const VOICE_QA: Record<"en" | "hi", Array<{ q: string; a: string }>> = {
  en: [
    {
      q: "Which products are running low?",
      a: "Water Bottle and ORS are below reorder threshold at Platform 3. Recommend restocking immediately.",
    },
    {
      q: "What is the next train arriving?",
      a: "Train 12002 Bhopal Shatabdi is arriving at Platform 4 in approximately 8 minutes.",
    },
    {
      q: "How many pending orders do I have?",
      a: "You currently have 3 pending orders. 2 at New Delhi and 1 at Anand Vihar terminal.",
    },
    {
      q: "Which delivery agent is available?",
      a: "Rajesh Kumar and Priya Singh are currently available and near Platform 3.",
    },
  ],
  hi: [
    {
      q: "कौन से उत्पाद कम स्टॉक में हैं?",
      a: "पानी की बोतलें और ओआरएस प्लेटफॉर्म 3 पर रीऑर्डर सीमा से नीचे हैं। तुरंत रीस्टॉक करने की सिफारिश है।",
    },
    {
      q: "अगली ट्रेन कब आ रही है?",
      a: "ट्रेन 12002 भोपाल शताब्दी लगभग 8 मिनट में प्लेटफॉर्म 4 पर पहुंचेगी।",
    },
    {
      q: "मेरे कितने लंबित ऑर्डर हैं?",
      a: "आपके पास अभी 3 लंबित ऑर्डर हैं। 2 नई दिल्ली में और 1 आनंद विहार टर्मिनल में।",
    },
    {
      q: "कौन सा डिलीवरी एजेंट उपलब्ध है?",
      a: "राजेश कुमार और प्रिया सिंह अभी उपलब्ध हैं और प्लेटफॉर्म 3 के पास हैं।",
    },
  ],
};

export default function MobileVendorApp() {
  const {
    orders,
    inventory,
    agents,
    activeStationFilter,
    setActiveStationFilter,
    updateOrderStatus,
    assignAgentToOrder,
    restockProduct,
    addOrder,
    notionConfig,
    saveNotionConfig,
  } = useNexus();

  // Navigation
  const [activeTab, setActiveTab] = useState<"orders" | "stocks" | "voice" | "config">("orders");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSimModal, setShowSimModal] = useState(false);

  // Settings states
  const [notionToken, setNotionToken] = useState(notionConfig.integrationToken);
  const [ordersDbId, setOrdersDbId] = useState(notionConfig.ordersDbId);
  const [inventoryDbId, setInventoryDbId] = useState(notionConfig.inventoryDbId);
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);

  // Simulated Order Form Fields
  const [simPnr, setSimPnr] = useState("");
  const [simTrainNum, setSimTrainNum] = useState("");
  const [simTrainName, setSimTrainName] = useState("");
  const [simCoach, setSimCoach] = useState("");
  const [simSeat, setSimSeat] = useState("");
  const [simProduct, setSimProduct] = useState("Water Bottle");
  const [simQty, setSimQty] = useState(1);

  // AI Voice Assistant States
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState<"en" | "hi">("en");
  const [qaIndex, setQaIndex] = useState(0);
  const [voiceLogs, setVoiceLogs] = useState<VoiceMessage[]>([
    {
      id: "v-start",
      sender: "bot",
      text: "Nexus Regional Voice Assistant Online. Tap mic to talk.",
      transcript: "नेक्सस क्षेत्रीय वॉयस असिस्टेंट ऑनलाइन है। बोलने के लिए माइक टैप करें।",
      language: "hi",
    },
  ]);

  // Filtered data
  const filteredOrders = orders.filter((o) => {
    const stationMatch = activeStationFilter === "All" || o.station === activeStationFilter;
    const searchMatch =
      o.pnr.includes(searchTerm) ||
      o.trainNumber.includes(searchTerm) ||
      o.trainName.toLowerCase().includes(searchTerm.toLowerCase());
    return stationMatch && searchMatch;
  });

  // filteredInventory: filter inventory by station if needed; otherwise return all
  const filteredInventory = inventory.filter((item) => {
    if (activeStationFilter === "All") return true;
    return item.station === activeStationFilter || !item.station;
  });

  const lowStockItems = filteredInventory.filter((i) => i.availableStock <= i.reorderLevel);
  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  const handleNextStatus = (order: Order) => {
    const statuses: Order["status"][] = [
      "Pending",
      "Confirmed",
      "Packing",
      "Out For Delivery",
      "Delivered",
    ];
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
      station:
        activeStationFilter === "All"
          ? "New Delhi Railway Station"
          : activeStationFilter,
      products: [{ name: simProduct, quantity: simQty }],
      status: "Pending",
      assignedVendor: "Shree Balaji Foods",
      assignedDeliveryAgent: "Unassigned",
    });

    setSimPnr("");
    setSimTrainNum("");
    setSimTrainName("");
    setSimCoach("");
    setSimSeat("");
    setShowSimModal(false);
  };

  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveNotionConfig({
      integrationToken: notionToken,
      ordersDbId: ordersDbId,
      inventoryDbId: inventoryDbId,
    });
    setIsSettingsSaved(true);
    setTimeout(() => setIsSettingsSaved(false), 3000);
  };

  // Voice simulation — cycles through Q&A pairs
  const startVoiceAudit = () => {
    if (isListening) return;
    setIsListening(true);

    const pairs = VOICE_QA[voiceLang];
    const pair = pairs[qaIndex % pairs.length];

    setTimeout(() => {
      setIsListening(false);

      const userLog: VoiceMessage = {
        id: `v-user-${Date.now()}`,
        sender: "user",
        text: pair.q,
        transcript: pair.q,
        language: voiceLang,
      };
      setVoiceLogs((prev) => [...prev, userLog]);

      setTimeout(() => {
        const botLog: VoiceMessage = {
          id: `v-bot-${Date.now()}`,
          sender: "bot",
          text: pair.a,
          transcript: pair.a,
          language: voiceLang,
          isPlaying: true,
        };
        setVoiceLogs((prev) => [...prev, botLog]);
        setQaIndex((i) => i + 1);

        // Use Web Speech API for TTS if available
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(pair.a);
          utterance.lang = voiceLang === "hi" ? "hi-IN" : "en-IN";
          utterance.rate = 0.9;
          window.speechSynthesis.speak(utterance);
        }

        setTimeout(() => {
          setVoiceLogs((prev) =>
            prev.map((l) => (l.id === botLog.id ? { ...l, isPlaying: false } : l))
          );
        }, 4000);
      }, 1000);
    }, 2500);
  };

  const triggerTtsAudio = (msgId: string, text: string) => {
    setVoiceLogs((prev) =>
      prev.map((l) => (l.id === msgId ? { ...l, isPlaying: true } : l))
    );

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voiceLang === "hi" ? "hi-IN" : "en-IN";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }

    setTimeout(() => {
      setVoiceLogs((prev) =>
        prev.map((l) => (l.id === msgId ? { ...l, isPlaying: false } : l))
      );
    }, 4000);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#090e1a] to-[#02050c] overflow-hidden select-none relative">

      {/* ── Header ── */}
      <header className="h-14 border-b border-slate-900/60 bg-[#040812]/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 rounded-lg">
            <Cpu className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-xs tracking-wider uppercase text-slate-200">RailQuick</h1>
            <span className="text-[9px] font-bold text-indigo-400 block">NEXUS APP</span>
          </div>
        </div>

        <select
          value={activeStationFilter}
          onChange={(e) => setActiveStationFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300 rounded-md px-2 py-1 focus:outline-none"
        >
          <option value="All">All Terminals</option>
          <option value="New Delhi Railway Station">NDLS Station</option>
          <option value="Anand Vihar Railway Station">ANVT Station</option>
        </select>
      </header>

      {/* ── Main Screen Router ── */}
      <div className="flex-1 overflow-hidden min-h-0 relative">

        {/* ═══════════════════════════════════════════
            SCREEN 1 — ORDERS
        ═══════════════════════════════════════════ */}
        {activeTab === "orders" && (
          <div className="h-full flex flex-col overflow-hidden">
            {!selectedOrderId ? (

              /* ORDER LIST */
              <div className="h-full flex flex-col overflow-hidden">
                {/* Toolbar */}
                <div className="p-3 border-b border-slate-900 flex justify-between items-center bg-[#040812]/20 shrink-0 gap-3">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
                    <input
                      type="text"
                      placeholder="Search PNR, train…"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
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
                    className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-slate-100 rounded-lg shadow-md border border-indigo-400/20 shrink-0 cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Low stock alert banner */}
                {lowStockItems.length > 0 && (
                  <div className="mx-3 mt-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 flex items-center gap-2 shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-[10px] text-amber-400 font-bold">
                      {lowStockItems.length} item{lowStockItems.length > 1 ? "s" : ""} running low — check Stocks tab
                    </span>
                  </div>
                )}

                {/* Order Cards */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                      <Train className="w-10 h-10 text-slate-700" />
                      <p className="text-xs text-slate-500 font-semibold">No orders found</p>
                      <p className="text-[10px] text-slate-600">Tap + to simulate a new booking</p>
                    </div>
                  ) : (
                    filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrderId(order.id)}
                        className="border border-slate-800 bg-[#090d16]/80 p-4 rounded-2xl cursor-pointer hover:border-indigo-500/30 transition-all duration-300 flex flex-col gap-2.5 active:scale-[0.98]"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-indigo-400 font-mono tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10">
                            PNR: {order.pnr}
                          </span>
                          <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${STATUS_COLORS[order.status]}`}>
                            {order.status}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-200 block truncate">{order.trainName}</span>
                          <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 mt-1 font-mono">
                            <Train className="w-3 h-3" /> #{order.trainNumber} &nbsp;|&nbsp; Coach {order.coach} / Seat {order.seat}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2.5 border-t border-slate-800/60 text-[9px] text-slate-500 font-bold">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {order.station.replace(" Railway Station", "")}
                          </span>
                          <span className="text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {order.estimatedDeliveryTime ?? "ETA: ~12 min"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            ) : (
              /* ORDER DETAIL */
              selectedOrder && (
                <div className="h-full flex flex-col overflow-hidden bg-[#03060d]/10">
                  {/* Sub-header */}
                  <div className="h-11 border-b border-slate-900 bg-[#040812]/40 px-3 flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedOrderId(null)}
                      className="p-1 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-xs font-bold text-slate-300">Order Detail</span>
                    <span className={`ml-auto inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${STATUS_COLORS[selectedOrder.status]}`}>
                      {selectedOrder.status}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-5">

                    {/* ── ORDER LOCATION TRACKER ── */}
                    <div className="bg-[#0b101d]/60 border border-slate-800/60 rounded-2xl p-4 space-y-4 shadow">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-extrabold uppercase tracking-widest shrink-0">
                          Live Order Tracker
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold font-mono">PNR: {selectedOrder.pnr}</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs font-extrabold text-slate-200 block">{selectedOrder.trainName}</span>
                        <p className="text-[10px] text-emerald-400 font-semibold">
                          Status: On-Time. Arriving Platform 4 in 6 mins.
                        </p>
                      </div>

                      {/* Progress bar tracker */}
                      <div className="relative pt-2">
                        <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-800 z-0" />
                        <div className="absolute top-4 left-0 w-2/3 h-0.5 bg-indigo-500 z-0" />
                        <div className="flex justify-between relative z-10 text-[9px] font-bold text-slate-500">
                          {[
                            { label: "Kitchen", done: true },
                            { label: "Packed", done: true },
                            { label: "Platform 4", active: true },
                            { label: "Coach Seat", done: false },
                          ].map((step, idx) => (
                            <div key={idx} className="flex flex-col items-center">
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                                  step.done
                                    ? "bg-indigo-600 text-slate-100 border-slate-950"
                                    : step.active
                                    ? "bg-indigo-600 text-slate-100 border-indigo-400/50 animate-pulse"
                                    : "bg-slate-900 text-slate-600 border-slate-800"
                                }`}
                              >
                                {step.done ? "✓" : step.active ? "●" : "○"}
                              </span>
                              <span className={`mt-1.5 ${step.active ? "text-indigo-400" : ""}`}>
                                {step.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Platform directions — fixed JSX arrow syntax */}
                      <div className="bg-slate-950/80 border border-slate-900 p-3 rounded-xl flex gap-2 items-start leading-relaxed text-[10px] font-medium text-slate-300">
                        <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                            Platform Drop Directions
                          </span>
                          Exit kitchen{" "}
                          <span className="text-indigo-400 font-bold">{"→"}</span>{" "}
                          Escalator 2 down to Platform 4{" "}
                          <span className="text-indigo-400 font-bold">{"→"}</span>{" "}
                          Walk 50m north to Coach berth position:{" "}
                          <strong className="text-slate-200">{selectedOrder.coach} / Seat {selectedOrder.seat}</strong>
                        </div>
                      </div>
                    </div>

                    {/* ── PRODUCTS LIST ── */}
                    <div className="bg-[#03060d]/60 border border-slate-900 p-4 rounded-xl space-y-2.5">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block border-b border-slate-900 pb-1.5">
                        Items Ordered
                      </span>
                      {selectedOrder.products.map((p, idx) => (
                        <div key={idx} className="flex justify-between text-xs font-bold text-slate-300">
                          <span>{p.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-indigo-400 font-mono">Qty {p.quantity}</span>
                            <span className="text-slate-500 font-mono text-[10px]">
                              ₹{(PRODUCT_PRICES[p.name] ?? 0) * p.quantity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* ── AI PACKING ASSISTANT ── */}
                    <div className="bg-indigo-500/5 border border-indigo-500/20 p-4 rounded-xl space-y-3">
                      <div className="flex items-center gap-1.5">
                        <Box className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">AI Packing Guide</span>
                      </div>
                      {selectedOrder.packingDetails ? (
                        <div className="space-y-3">
                          <p className="text-[11px] font-semibold text-indigo-300 leading-normal bg-indigo-950/20 p-2.5 border border-indigo-500/10 rounded font-mono">
                            💡 {selectedOrder.packingDetails.recommendation}
                          </p>
                          <ol className="space-y-1">
                            {selectedOrder.packingDetails.sequence.map((step, sIdx) => (
                              <li key={sIdx} className="text-[10px] text-slate-400 flex items-center gap-1.5 font-medium">
                                <span className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[8px] text-indigo-400 font-mono shrink-0">
                                  {sIdx + 1}
                                </span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-500">Packing sequences auto-generate when order is confirmed.</p>
                      )}
                    </div>

                    {/* ── AI DELIVERY ROUTING ── */}
                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl space-y-3">
                      <div className="flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">AI Platform Routing</span>
                      </div>
                      <select
                        value={selectedOrder.assignedDeliveryAgent}
                        onChange={(e) => assignAgentToOrder(selectedOrder.id, e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-[10px] text-slate-200 rounded px-2.5 py-1.5 w-full focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Unassigned">Assign Delivery Runner</option>
                        {agents.map((agent) => (
                          <option key={agent.id} value={agent.name}>
                            {agent.name} (SLA: {agent.completionRate}%)
                          </option>
                        ))}
                      </select>
                      {selectedOrder.deliveryRoute ? (
                        <div className="text-[10px] text-slate-300 font-mono bg-slate-950/80 p-2.5 border border-slate-900 rounded flex gap-2 items-start leading-relaxed">
                          <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{selectedOrder.deliveryRoute}</span>
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-500">Route suggestions appear after status advances.</p>
                      )}
                    </div>

                    {/* Advance Status */}
                    {selectedOrder.status !== "Delivered" && selectedOrder.status !== "Cancelled" && (
                      <button
                        onClick={() => handleNextStatus(selectedOrder)}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-slate-100 rounded-xl text-xs font-bold uppercase tracking-wider shadow border border-indigo-400/20 transition-all cursor-pointer"
                      >
                        Advance to Next Stage →
                      </button>
                    )}
                    {selectedOrder.status === "Delivered" && (
                      <div className="w-full py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Order Delivered
                      </div>
                    )}

                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════
            SCREEN 2 — STOCKS / INVENTORY
        ═══════════════════════════════════════════ */}
        {activeTab === "stocks" && (
          <div className="h-full flex flex-col overflow-hidden p-4 space-y-4">
            {/* Header row */}
            <div className="flex justify-between items-center border-b border-slate-900/60 pb-3 shrink-0">
              <div>
                <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Inventory Planner</h2>
                <p className="text-[9px] text-slate-500 mt-0.5">Categorised stock with safety levels</p>
              </div>
              {lowStockItems.length > 0 && (
                <button
                  onClick={() => {
                    lowStockItems.forEach((i) =>
                      restockProduct(i.id, i.reorderLevel * 2 - i.availableStock)
                    );
                  }}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-[9px] font-bold rounded uppercase tracking-wider transition-all cursor-pointer"
                >
                  Restock All ({lowStockItems.length})
                </button>
              )}
            </div>

            {/* Low stock summary */}
            {lowStockItems.length > 0 && (
              <div className="bg-rose-500/8 border border-rose-500/20 rounded-xl p-3 flex items-start gap-2 shrink-0">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-rose-400">
                    {lowStockItems.length} item{lowStockItems.length > 1 ? "s" : ""} need restocking
                  </p>
                  <p className="text-[9px] text-slate-500 mt-0.5">
                    {lowStockItems.map((i) => i.name).join(", ")}
                  </p>
                </div>
              </div>
            )}

            {/* Categorised inventory */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-1">
              {Object.keys(INVENTORY_CATEGORIES).map((catName) => {
                const catProdNames = INVENTORY_CATEGORIES[catName];
                const catItems = filteredInventory.filter((item) => catProdNames.includes(item.name));
                if (catItems.length === 0) return null;

                return (
                  <div key={catName} className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        {catName}
                      </span>
                      <div className="flex-1 h-px bg-slate-900" />
                    </div>

                    <div className="space-y-2.5">
                      {catItems.map((item) => {
                        const isLow = item.availableStock <= item.reorderLevel;
                        const isCritical = item.availableStock <= item.reorderLevel / 2;
                        const needed = item.reorderLevel * 2 - item.availableStock;
                        const maxLevel = item.reorderLevel * 2;
                        const percent = Math.min(100, Math.floor((item.availableStock / maxLevel) * 100));

                        return (
                          <div
                            key={item.id}
                            className={`bg-[#090d16]/85 border p-3 rounded-xl space-y-2 transition-colors ${
                              isCritical
                                ? "border-rose-500/30"
                                : isLow
                                ? "border-amber-500/30"
                                : "border-slate-800"
                            }`}
                          >
                            <div className="flex justify-between items-start text-xs">
                              <div>
                                <span className="font-bold text-slate-200 block">{item.name}</span>
                                <span className="text-[9px] text-slate-500 font-semibold truncate max-w-[130px] block">
                                  {item.vendor}
                                </span>
                              </div>
                              <div className="text-right">
                                <span
                                  className={`font-bold block text-sm ${
                                    isCritical
                                      ? "text-rose-400 animate-pulse"
                                      : isLow
                                      ? "text-amber-400"
                                      : "text-slate-200"
                                  }`}
                                >
                                  {item.availableStock}
                                  <span className="text-[9px] font-normal text-slate-500 ml-1">units</span>
                                </span>
                                <span className="text-[8px] text-slate-500 block mt-0.5">
                                  Min: {item.reorderLevel}
                                </span>
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-900/50">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isCritical
                                      ? "bg-gradient-to-r from-rose-600 to-rose-400"
                                      : isLow
                                      ? "bg-gradient-to-r from-amber-600 to-amber-400"
                                      : "bg-gradient-to-r from-emerald-600 to-emerald-400"
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              <span className="text-[8px] text-slate-500 font-mono w-7 text-right shrink-0">
                                {percent}%
                              </span>
                              <button
                                onClick={() => restockProduct(item.id, needed > 0 ? needed : 25)}
                                className="px-2 py-0.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-[9px] font-bold text-indigo-400 rounded shrink-0 cursor-pointer transition-colors"
                              >
                                {needed > 0 ? `+${needed}` : "+25"}
                              </button>
                            </div>

                            {/* Status tag */}
                            {(isCritical || isLow) && (
                              <div
                                className={`text-[8px] font-bold px-2 py-0.5 rounded w-fit ${
                                  isCritical
                                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                }`}
                              >
                                {isCritical ? "⚠ CRITICAL — Restock Now" : "⚡ LOW STOCK"}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            SCREEN 3 — AI VOICE CHATBOT
        ═══════════════════════════════════════════ */}
        {activeTab === "voice" && (
          <div className="h-full flex flex-col overflow-hidden">

            {/* Language toggle header */}
            <div className="p-4 border-b border-slate-900 bg-[#040812]/20 shrink-0 flex justify-between items-center gap-4">
              <div>
                <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-indigo-400" />
                  Regional Voice Assistant
                </h2>
                <p className="text-[9px] text-slate-500 mt-0.5">
                  {voiceLang === "hi" ? "हिंदी में बात करें" : "Speaks in your regional language"}
                </p>
              </div>

              <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-[9px] font-bold">
                <button
                  onClick={() => setVoiceLang("hi")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    voiceLang === "hi" ? "bg-indigo-600 text-slate-100" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  हिंदी
                </button>
                <button
                  onClick={() => setVoiceLang("en")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    voiceLang === "en" ? "bg-indigo-600 text-slate-100" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Chat log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {voiceLogs.map((log) => {
                const isBot = log.sender === "bot";
                return (
                  <div
                    key={log.id}
                    className={`flex gap-2.5 max-w-[88%] ${!isBot ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`p-2 rounded-lg shrink-0 w-8 h-8 flex items-center justify-center ${
                        !isBot
                          ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20"
                          : "bg-slate-900 border border-slate-800"
                      }`}
                    >
                      {!isBot ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`p-3 rounded-2xl ${
                        !isBot
                          ? "bg-indigo-600 text-slate-100 rounded-tr-none"
                          : "bg-[#090d16]/95 text-slate-200 rounded-tl-none border border-[#1b233a] shadow-lg"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5 border-b border-white/5 pb-1 justify-between">
                        <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest">
                          {isBot ? "AI Voice" : "You"}
                        </span>
                        {isBot && (
                          <button
                            onClick={() => triggerTtsAudio(log.id, log.text)}
                            className="p-1 hover:bg-slate-900 rounded text-indigo-400 transition-colors"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Message text */}
                      {renderMessageContent(log.text)}

                      {/* Waveform */}
                      {log.isPlaying && (
                        <div className="flex gap-0.5 items-center mt-2.5 bg-slate-950/80 p-2 border border-slate-900 rounded-lg">
                          <span className="text-[8px] text-indigo-400 uppercase font-bold tracking-wider font-mono mr-1.5 animate-pulse">
                            Playing
                          </span>
                          {[3, 5, 8, 5, 3, 6, 4].map((h, i) => (
                            <span
                              key={i}
                              className="w-0.5 bg-indigo-400 rounded animate-bounce"
                              style={{
                                height: `${h * 2}px`,
                                animationDelay: `${i * 0.08}s`,
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mic panel */}
            <div className="p-5 border-t border-slate-900 bg-[#040812]/40 shrink-0 flex flex-col items-center justify-center space-y-3.5">
              {isListening ? (
                <div className="flex gap-1.5 items-center justify-center h-8">
                  {[3, 6, 8, 5, 2, 6, 4, 7].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 bg-indigo-500 rounded-full animate-bounce"
                      style={{ height: `${h * 3}px`, animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono text-center">
                  {voiceLang === "hi" ? "बोलने के लिए माइक दबाएं" : "Tap microphone to speak"}
                </p>
              )}

              <button
                onClick={startVoiceAudit}
                disabled={isListening}
                className={`w-14 h-14 rounded-full flex items-center justify-center border shadow-lg transition-all duration-300 transform active:scale-95 cursor-pointer ${
                  isListening
                    ? "bg-indigo-600 text-slate-100 border-indigo-500 animate-pulse shadow-[0_0_25px_rgba(99,102,241,0.5)]"
                    : "bg-[#0b101d] text-indigo-400 border-slate-800 hover:border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.06)]"
                }`}
              >
                <Mic className={`w-6 h-6 ${isListening ? "animate-pulse" : ""}`} />
              </button>

              {/* Quick voice prompts */}
              <div className="flex flex-wrap gap-1.5 justify-center max-w-xs">
                {(voiceLang === "hi"
                  ? ["स्टॉक चेक", "अगली ट्रेन", "डिलीवरी"]
                  : ["Check stock", "Next train", "Pending orders"]
                ).map((label) => (
                  <button
                    key={label}
                    onClick={startVoiceAudit}
                    disabled={isListening}
                    className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-[9px] text-slate-400 rounded-full hover:border-indigo-500/30 hover:text-indigo-400 transition-colors cursor-pointer"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            SCREEN 4 — CONFIG / NOTION SYNC
        ═══════════════════════════════════════════ */}
        {activeTab === "config" && (
          <div className="h-full flex flex-col overflow-hidden p-4 space-y-5">
            <div className="border-b border-slate-900/60 pb-3 shrink-0">
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Notion Database Mapping</h2>
              <p className="text-[9px] text-slate-500 mt-0.5">Map API parameters to Notion pages.</p>
            </div>

            {isSettingsSaved && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg text-[10px] text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Notion credentials saved successfully.
              </div>
            )}

            <form onSubmit={handleSettingsSave} className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div>
                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Integration Token
                </label>
                <input
                  type="password"
                  placeholder="secret_xxxxxxxxxxxxxxxxxx"
                  value={notionToken}
                  onChange={(e) => setNotionToken(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Orders DB ID
                </label>
                <input
                  type="text"
                  placeholder="db_orders_ndls_xxx"
                  value={ordersDbId}
                  onChange={(e) => setOrdersDbId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Inventory DB ID
                </label>
                <input
                  type="text"
                  placeholder="db_inventory_ndls_xxx"
                  value={inventoryDbId}
                  onChange={(e) => setInventoryDbId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-slate-100 rounded-lg text-xs font-bold shadow border border-indigo-400/20 cursor-pointer transition-colors"
              >
                Save Configuration
              </button>
            </form>

            {/* Integration status */}
            <div className="shrink-0 space-y-2">
              <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Integration Status</p>
              {[
                { label: "Orders Sync", ok: false },
                { label: "Inventory Sync", ok: false },
                { label: "Vendor Reports", ok: false },
              ].map(({ label, ok }) => (
                <div
                  key={label}
                  className="flex justify-between items-center bg-slate-950 border border-slate-900 rounded-lg px-3 py-2"
                >
                  <span className="text-[10px] text-slate-400 font-semibold">{label}</span>
                  <span
                    className={`text-[8px] font-bold px-2 py-0.5 rounded ${
                      ok
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-slate-900 text-slate-500 border border-slate-800"
                    }`}
                  >
                    {ok ? "Connected" : "Not Configured"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── Sticky Bottom Tab Bar ── */}
      <nav className="h-16 border-t border-slate-900 bg-[#040812]/95 backdrop-blur-md flex items-center justify-around shrink-0 z-30 px-3 pb-2">
        {([
          { tab: "orders", icon: <ShoppingCart className="w-4 h-4" />, label: "Orders" },
          { tab: "stocks", icon: <Package className="w-4 h-4" />, label: "Stocks", badge: lowStockItems.length },
          { tab: "voice", icon: <Mic className="w-4 h-4" />, label: "AI Voice" },
          { tab: "config", icon: <Settings className="w-4 h-4" />, label: "Config" },
        ] as const).map(({ tab, icon, label, badge }) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (tab === "orders") setSelectedOrderId(null);
            }}
            className={`flex flex-col items-center gap-1 transition-colors cursor-pointer relative ${
              activeTab === tab ? "text-indigo-400 font-extrabold" : "text-slate-500 hover:text-slate-400"
            }`}
          >
            <div className="relative">
              {icon}
              {badge && badge > 0 && (
                <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-rose-500 text-white text-[7px] font-bold rounded-full flex items-center justify-center">
                  {badge}
                </span>
              )}
            </div>
            <span className="text-[8px] uppercase tracking-widest">{label}</span>
            {activeTab === tab && (
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-400 rounded-full" />
            )}
          </button>
        ))}
      </nav>

      {/* ── Simulate Booking Modal ── */}
      {showSimModal && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[#0b101d] border border-slate-800 p-5 rounded-2xl w-full max-w-xs shadow-2xl relative">
            <h2 className="text-xs font-bold text-slate-100 flex items-center gap-1.5 mb-1 uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-indigo-400" />
              Simulate Booking
            </h2>
            <p className="text-[10px] text-slate-400 mb-4">Deploy a simulated train booking.</p>

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
                  <label className="text-[8px] font-bold text-slate-500 uppercase block mb-0.5">Train ID</label>
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
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[8px] font-bold text-slate-500 block mb-0.5">Seat</label>
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
