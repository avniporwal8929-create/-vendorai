"use client";

import React, { useState, useEffect } from "react";
import { useNexus } from "@/context/NexusContext";
import { 
  TrendingUp, 
  Sparkles, 
  Sliders, 
  Sun, 
  Train, 
  Calendar,
  AlertCircle
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

export default function Forecasting() {
  const { orders } = useNexus();
  const [temperature, setTemperature] = useState(38); // Celsius
  const [trafficIndex, setTrafficIndex] = useState(1.2); // multiplier
  const [isWeekend, setIsWeekend] = useState(false);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Dynamic forecasting calculations
  const calculateForecastMultiplier = () => {
    let multiplier = trafficIndex;
    
    // Temperature adjustment (spikes water bottle & ORS)
    if (temperature > 35) {
      multiplier += (temperature - 35) * 0.05;
    }
    
    // Weekend adjustment
    if (isWeekend) {
      multiplier += 0.25;
    }
    
    return multiplier;
  };

  const mult = calculateForecastMultiplier();

  // Forecast Chart 1: Daily Revenue Forecast (Next 7 Days)
  const revenueForecastData = [
    { day: "Mon (Jun 22)", Historic: 24000, Projected: Math.floor(24000 * mult) },
    { day: "Tue (Jun 23)", Historic: 21500, Projected: Math.floor(21500 * mult) },
    { day: "Wed (Jun 24)", Historic: 28900, Projected: Math.floor(28900 * mult) },
    { day: "Thu (Jun 25)", Historic: 32000, Projected: Math.floor(32000 * mult) },
    { day: "Fri (Jun 26)", Historic: 38400, Projected: Math.floor(38450 * mult) },
    { day: "Sat (Jun 27)", Historic: 41200, Projected: Math.floor(41200 * (mult + 0.15)) },
    { day: "Sun (Jun 28)", Historic: 44000, Projected: Math.floor(44000 * (mult + 0.2)) },
  ];

  // Forecast Chart 2: Product Projections based on Temperature
  const productForecastData = [
    { name: "Water Bottle", Base: 120, Forecast: Math.floor(120 * mult * (temperature > 35 ? 1.4 : 1.0)) },
    { name: "ORS Packs", Base: 40, Forecast: Math.floor(40 * mult * (temperature > 35 ? 1.6 : 1.0)) },
    { name: "Tissue Wipes", Base: 180, Forecast: Math.floor(180 * mult) },
    { name: "Charger Cables", Base: 25, Forecast: Math.floor(25 * mult) },
    { name: "Sanitizer", Base: 60, Forecast: Math.floor(60 * mult) },
    { name: "Baby Care Kit", Base: 15, Forecast: Math.floor(15 * mult) },
  ];

  return (
    <div className="p-8 space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-indigo-400" />
          AI Demand Forecasting
        </h1>
        <p className="text-xs text-slate-400 mt-1">Predict train bookings, platform hot-items, and gross terminal revenues.</p>
      </div>

      {/* Main Grid: Left is charts, Right is Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Charts Column */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Revenue Forecast Area Chart */}
          <div className="glow-card bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Gross Sales Projections</h3>
                <p className="text-[10px] text-slate-500 font-medium">Predicting next 7 days based on passenger volumes.</p>
              </div>
              <div className="flex gap-4 text-xs font-semibold text-slate-450">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>Historical Baseline</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>AI Projected</span>
              </div>
            </div>

            <div className="h-72">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueForecastData}>
                    <defs>
                      <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(75,85,99,0.08)" vertical={false} />
                    <XAxis dataKey="day" stroke="#4b5563" fontSize={10} tickLine={false} />
                    <YAxis stroke="#4b5563" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", fontSize: "11px" }} />
                    <Line type="monotone" dataKey="Historic" stroke="#4b5563" strokeDasharray="5 5" strokeWidth={1.5} dot={false} />
                    <Area type="monotone" dataKey="Projected" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProjected)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full bg-slate-950/40 rounded-xl animate-pulse flex items-center justify-center text-xs text-slate-650 font-mono">
                  Loading charts...
                </div>
              )}
            </div>
          </div>

          {/* Product Forecast Bar Chart */}
          <div className="glow-card bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-6">Product Quantity Forecasts</h3>
            <div className="h-64">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productForecastData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(75,85,99,0.08)" vertical={false} />
                    <XAxis dataKey="name" stroke="#4b5563" fontSize={10} tickLine={false} />
                    <YAxis stroke="#4b5563" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", fontSize: "11px" }} />
                    <Bar dataKey="Base" fill="#4b5563" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    <Bar dataKey="Forecast" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full bg-slate-950/40 rounded-xl animate-pulse flex items-center justify-center text-xs text-slate-650 font-mono">
                  Loading charts...
                </div>
              )}
            </div>
          </div>

        </div>

        {/* AI Sim Controller Box */}
        <div className="space-y-6">
          <div className="glow-card bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-6">
            
            <div className="flex items-center gap-2 border-b border-slate-850 pb-4">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-xs font-bold text-slate-250 uppercase tracking-wider">Predictive Sim</h3>
                <p className="text-[10px] text-slate-500 font-medium">Adjust environmental coefficients.</p>
              </div>
            </div>

            {/* Weather slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-450 flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  Temperature (°C)
                </span>
                <span className="text-slate-200">{temperature}°C</span>
              </div>
              <input
                type="range"
                min="15"
                max="45"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              {temperature > 35 && (
                <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider block w-fit">
                  Water & Hydration Spike
                </span>
              )}
            </div>

            {/* Train Traffic Multiplier */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-450 flex items-center gap-1">
                  <Train className="w-3.5 h-3.5 text-indigo-400" />
                  Train Bookings Vol
                </span>
                <span className="text-slate-200">{trafficIndex.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={trafficIndex}
                onChange={(e) => setTrafficIndex(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Weekend Toggle */}
            <div className="flex items-center justify-between text-xs font-semibold border-t border-slate-850 pt-4">
              <span className="text-slate-450 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-rose-455" />
                Weekend traffic
              </span>
              <button
                onClick={() => setIsWeekend(!isWeekend)}
                className={`w-10 h-5.5 rounded-full p-0.5 transition-all duration-300 ${
                  isWeekend ? "bg-indigo-650 flex justify-end" : "bg-slate-800 flex justify-start"
                }`}
              >
                <span className="w-4.5 h-4.5 bg-slate-100 rounded-full shadow-md" />
              </button>
            </div>

            {/* Audit findings card */}
            <div className="bg-slate-950/80 border border-slate-900 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-[9px] bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-extrabold uppercase tracking-widest w-fit">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                AI Inference
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                Forecasted volumes are **{((mult - 1) * 100).toFixed(0)}%** higher than median baseline metrics.
              </p>
              <p className="text-[10px] text-slate-505 leading-normal">
                Recommend increasing NDLS water bottle pre-stage quotas by **{(mult > 1.2) ? "350" : "150"} units** for next morning services.
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
