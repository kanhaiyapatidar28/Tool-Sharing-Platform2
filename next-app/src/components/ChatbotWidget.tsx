"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Sparkles, Wrench, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  sender: "bot" | "user";
  text: string;
  time: string;
}

const FAQ_SUGGESTIONS = [
  "How does tool deposit work?",
  "Can I rent for just 1 day?",
  "How do I list my tools?",
  "What if a tool gets damaged?",
];

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Namaste! 👋 I'm your ToolShare assistant. Looking to rent heavy tools or earn by listing your equipment? Ask me anything!",
      time: "Just now",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputValue.trim();
    if (!text) return;

    const userMsg: Message = {
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");

    // Simulate smart AI response
    setTimeout(() => {
      let reply = "I can definitely help with that!";
      const lower = text.toLowerCase();

      if (lower.includes("deposit") || lower.includes("security")) {
        reply = "Security deposits are held safely in escrow during your rental. As soon as you return the tool in good condition, the full deposit is refunded to your UPI or original payment method within 1 hour! 🛡️";
      } else if (lower.includes("1 day") || lower.includes("minimum") || lower.includes("duration")) {
        reply = "Yes! All tools can be rented for as little as 1 single day. You can select your pickup and return dates easily on each tool's booking calendar. 📅";
      } else if (lower.includes("list") || lower.includes("earn") || lower.includes("owner")) {
        reply = "Listing takes under 2 minutes! Just click '+ List a Tool' in the top bar, upload your tool photos, set your daily price and deposit, and neighbors nearby can start booking. You keep 90% of all earnings! 💰";
      } else if (lower.includes("damage") || lower.includes("broken") || lower.includes("insurance")) {
        reply = "Every verified rental is covered by our ₹50,000 ToolShare Protection Plan. Normal wear & tear is accepted, and any severe damage is evaluated via photos and covered by our guarantee fund. 🔒";
      } else if (lower.includes("drill") || lower.includes("saw") || lower.includes("recommend")) {
        reply = "Our top booked tool is the Bosch 18V High-Torque Impact Drill at ₹450/day and the DeWalt Circular Saw at ₹600/day. Head over to the 'Browse Tools' page to check real-time availability! ⚡";
      } else {
        reply = "Great question! ToolShare connects verified neighbors for secure peer-to-peer equipment sharing. You can browse tools, verify rental dates, and communicate directly with owners through our platform.";
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 bg-brand hover:bg-brand-hover text-white px-5 py-3.5 rounded-full shadow-2xl shadow-brand/40 transition-all duration-300 hover:scale-105"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
          </div>
          <span className="font-oswald uppercase tracking-wider text-sm font-bold">
            Tool Assistant
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-[#1A242B] border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-4 bg-brand-surface border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-brand flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-oswald text-sm uppercase tracking-wider font-bold">
                  ToolShare AI Helper
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Online • Instant answers
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  m.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed shadow-sm ${
                    m.sender === "user"
                      ? "bg-brand text-white rounded-br-none"
                      : "bg-white/10 border border-white/10 text-white/90 rounded-bl-none"
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-white/40 mt-1 px-1">{m.time}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ Pills */}
          <div className="px-3 py-2 bg-black/20 border-t border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar">
            {FAQ_SUGGESTIONS.map((faq, i) => (
              <button
                key={i}
                onClick={() => handleSend(faq)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-[10px] text-white/70 hover:text-white transition-colors shrink-0"
              >
                {faq}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-brand-surface border-t border-white/10 flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about deposits, tools, or listing..."
              className="flex-1 bg-black/30 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-brand"
            />
            <Button
              size="icon"
              onClick={() => handleSend()}
              className="w-9 h-9 rounded-xl bg-brand hover:bg-brand-hover text-white shadow-md shadow-brand/30 shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
