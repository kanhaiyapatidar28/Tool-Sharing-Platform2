"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  ChevronDown,
  Wrench,
  ShoppingBag,
  ShieldCheck,
  Mail,
  Phone,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FAQItem {
  q: string;
  a: string;
  category: "borrower" | "owner" | "security";
}

const FAQS: FAQItem[] = [
  {
    category: "borrower",
    q: "How does the rental process work for borrowers?",
    a: "Browse the catalog for tools in your neighborhood, select your rental dates, and reserve the tool. When you meet the owner, inspect the equipment together, show your dynamic QR code for handover verification, and you're ready to build! Return the tool on time to receive your full deposit back.",
  },
  {
    category: "borrower",
    q: "How does the security deposit work?",
    a: "A security deposit is authorized when you book. It ensures responsible handling and gives tool owners confidence. When you return the tool in good working order and the owner confirms receipt, the deposit hold is immediately released.",
  },
  {
    category: "borrower",
    q: "What happens if a tool breaks during normal use?",
    a: "Normal wear and tear (such as a dull drill bit) is expected. If a mechanical issue occurs, message the owner immediately through the booking chat with a photo or description. We help mediate repairs or replacements fairly.",
  },
  {
    category: "owner",
    q: "How do I list my tools and start earning?",
    a: "Click '+ List a Tool' in the top navigation. Enter the tool's brand and model, select its category, set your desired daily rental rate and security deposit, choose a sample photo, and publish! Your listing appears immediately in the community catalog.",
  },
  {
    category: "owner",
    q: "How and when do I get paid?",
    a: "You earn 95% of the total rental amount for each completed booking (ToolShare retains a 5% marketplace maintenance fee). Payouts accumulate in your Owner Dashboard and are credited to your UPI or bank account upon successful return.",
  },
  {
    category: "security",
    q: "What is the QR Handover code?",
    a: "Every confirmed booking generates a unique, tamper-proof ISO-18004 QR code containing the rental ID, equipment tag, and security PIN. Scanning or presenting this code at pickup establishes proof of delivery.",
  },
  {
    category: "security",
    q: "How are members verified?",
    a: "Members register with verified email addresses and phone numbers. Both parties build community reputation with mutual 5-star ratings and authentic project reviews on each tool.",
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "borrower" | "owner" | "security">("all");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const filteredFaqs = FAQS.filter((item) => {
    const matchesCat = activeCategory === "all" || item.category === activeCategory;
    const matchesQuery =
      !searchQuery.trim() ||
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-28 pb-16 space-y-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-brand font-semibold">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5" /> Support & Knowledge Center
        </div>
        <h1 className="font-oswald text-4xl sm:text-5xl font-black uppercase tracking-tight text-foreground">
          How Can We Help You?
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
          Find answers about equipment rentals, security deposits, QR verification, and owner payouts.
        </p>

        {/* Search */}
        <div className="relative max-w-xl mx-auto pt-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g. deposit, pickup, earnings, broken tool)..."
            className="pl-11 pr-4 h-12 rounded-2xl bg-card border-border/80 text-sm shadow-sm"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeCategory === "all"
              ? "bg-brand text-white shadow-md shadow-brand/20"
              : "bg-card border border-border text-foreground hover:border-brand/40"
          }`}
        >
          All Topics
        </button>
        <button
          onClick={() => setActiveCategory("borrower")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeCategory === "borrower"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "bg-card border border-border text-foreground hover:border-emerald-500/40"
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" /> For Borrowers
        </button>
        <button
          onClick={() => setActiveCategory("owner")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeCategory === "owner"
              ? "bg-brand text-white shadow-md shadow-brand/20"
              : "bg-card border border-border text-foreground hover:border-brand/40"
          }`}
        >
          <Wrench className="w-3.5 h-3.5" /> For Tool Owners
        </button>
        <button
          onClick={() => setActiveCategory("security")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeCategory === "security"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "bg-card border border-border text-foreground hover:border-blue-500/40"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" /> Safety & Deposits
        </button>
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-3xl border border-dashed border-border/80 p-6 space-y-2">
            <p className="text-sm font-semibold text-foreground">No matching questions found.</p>
            <p className="text-xs text-muted-foreground">Try different keywords or browse all categories.</p>
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div
                key={idx}
                className="bg-card rounded-2xl border border-border/80 overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-oswald text-base font-bold uppercase tracking-tight text-foreground hover:text-brand transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${
                      isExpanded ? "rotate-180 text-brand" : ""
                    }`}
                  />
                </button>
                {isExpanded && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Direct Contact Banner */}
      <div className="rounded-3xl bg-neutral-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-oswald text-xl font-bold uppercase text-white">
            Still Have Questions?
          </h3>
          <p className="text-xs text-white/70">
            Our neighborhood equipment team is here to assist you daily from 9 AM to 8 PM IST.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="mailto:support@toolshare.in"
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white text-xs font-bold font-oswald uppercase tracking-wider px-5 py-3 rounded-full transition-all"
          >
            <Mail className="w-4 h-4" /> support@toolshare.in
          </a>
        </div>
      </div>
    </div>
  );
}
