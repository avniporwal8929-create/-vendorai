"use client";

import React, { useState, useEffect, useRef } from "react";
import { useNexus } from "@/context/NexusContext";
import { 
  Sparkles, 
  Send, 
  X, 
  Terminal,
  Bot,
  User,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";

interface Message {
  sender: "user" | "copilot";
  text: string;
  timestamp: Date;
}

const PRESETS = [
  { label: "Check Low Stock Items", query: "What inventory should I restock tomorrow?" },
  { label: "Highest Demand Terminal", query: "Which station has the highest demand?" },
  { label: "Vendor SLA Performance", query: "Which vendor is performing best?" },
  { label: "Predict Tomorrow's Demand", query: "Predict tomorrow's demand." }
];

export const AiCopilotDrawer: React.FC = () => {
  const { getAiCopilotResponse } = useNexus();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "copilot",
      text: "### RailQuick Nexus AI Copilot Active.\n\nI am connected to New Delhi and Anand Vihar operations. Ask me about inventory forecasting, delivery routing, and vendor performance logs.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg: Message = {
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await getAiCopilotResponse(textToSend);
      setMessages(prev => [...prev, {
        sender: "copilot",
        text: response,
        timestamp: new Date()
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        sender: "copilot",
        text: "Error executing command query. Verify Supabase socket settings.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Convert custom markdown formatting to basic HTML styles
  const renderMessageContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let trimmed = line.trim();
      
      // Header
      if (trimmed.startsWith("### ")) {
        return <h4 key={idx} className="text-sm font-bold text-slate-100 mt-3 mb-1.5 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-indigo-400" /> {trimmed.substring(4)}</h4>;
      }
      
      // Bullet list items
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        let content = trimmed.substring(2);
        
        // Parse bold highlights inside bullets
        content = content.replace(/\*\*(.*?)\*\*/g, "$1");
        content = content.replace(/`(.*?)`/g, "$1");
        
        return <div key={idx} className="text-xs text-slate-300 pl-4 py-0.5 border-l border-slate-700/80 my-1">{content}</div>;
      }
      
      // Standalone headers/notes
      if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
        return <p key={idx} className="text-xs font-bold text-indigo-400 mt-2">{trimmed.replace(/\*\*/g, "")}</p>;
      }

      // Format bold and backticks inline
      let inlineText: React.ReactNode = line;
      if (line.includes("**") || line.includes("`")) {
        const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
        inlineText = parts.map((part, pIdx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={pIdx} className="text-indigo-300 font-semibold">{part.replace(/\*\*/g, "")}</strong>;
          }
          if (part.startsWith("`") && part.endsWith("`")) {
            return <code key={pIdx} className="bg-slate-950/80 text-rose-400 font-mono px-1 py-0.5 rounded border border-slate-800/60 text-[11px]">{part.replace(/`/g, "")}</code>;
          }
          return part;
        });
      }

      return <p key={idx} className="text-xs text-slate-300 leading-relaxed mb-1 min-h-[4px]">{inlineText}</p>;
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4.5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-slate-100 rounded-full font-bold text-xs shadow-[0_0_20px_rgba(99,102,241,0.5)] border border-indigo-400/30 transition-all hover:scale-105 active:scale-95"
      >
        <Sparkles className="w-4 h-4 animate-pulse text-amber-300" />
        AI Copilot
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-all duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out Drawer */}
      <div className={`fixed top-0 right-0 h-full w-[420px] bg-slate-950 border-l border-slate-800 shadow-2xl z-50 flex flex-col transition-all duration-300 ease-out transform ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-850 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/20">
              <Bot className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">AI Operations Copilot</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-[10px] text-slate-400 font-semibold">Nexus Engine Online</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 text-slate-400 hover:bg-slate-900 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-grid-dots">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 max-w-[85%] ${
              msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}>
              <div className={`p-2 rounded-lg shrink-0 ${
                msg.sender === "user" ? "bg-indigo-600/25 border border-indigo-500/25" : "bg-slate-900 border border-slate-800"
              }`}>
                {msg.sender === "user" ? <User className="w-3.5 h-3.5 text-indigo-300" /> : <Bot className="w-3.5 h-3.5 text-indigo-400" />}
              </div>
              <div className={`p-3 rounded-2xl ${
                msg.sender === "user" 
                  ? "bg-indigo-600 text-slate-100 rounded-tr-none" 
                  : "bg-slate-900/90 text-slate-200 rounded-tl-none border border-slate-800/80 shadow-md"
              }`}>
                {msg.sender === "user" ? (
                  <p className="text-xs">{msg.text}</p>
                ) : (
                  <div>{renderMessageContent(msg.text)}</div>
                )}
                <span className="text-[9px] text-slate-500 block text-right mt-1.5">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-center">
              <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg shrink-0">
                <Bot className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="bg-slate-900/90 border border-slate-800/80 p-3 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Query Presets */}
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-900">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Suggested Queries</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.query)}
                className="text-[10px] font-semibold text-slate-400 hover:text-slate-200 hover:border-slate-700 bg-slate-900 hover:bg-slate-850 px-2 py-1.5 rounded-md border border-slate-800/80 transition-all flex items-center gap-1"
              >
                {p.label}
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div className="p-4 border-t border-slate-900 bg-slate-900/20">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Copilot (e.g. Predict tomorrow's demand)"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-medium"
            />
            <button
              type="submit"
              className="p-2 bg-indigo-600 hover:bg-indigo-500 text-slate-100 rounded-lg shadow transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
