"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ToolItem } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  X,
  Compass,
  ArrowUpDown,
  Wrench,
  ShieldCheck,
  Star,
  RefreshCw,
} from "lucide-react";

const CATEGORIES = [
  { id: "ALL", label: "All Equipment", icon: "🛠️" },
  { id: "POWER_TOOLS", label: "Power Tools", icon: "⚡" },
  { id: "HAND_TOOLS", label: "Hand Tools", icon: "🔨" },
  { id: "WOODWORKING", label: "Woodworking", icon: "🪵" },
  { id: "GARDEN", label: "Garden Gear", icon: "🌿" },
  { id: "CLEANING", label: "Pressure Washers", icon: "🧹" },
  { id: "HEAVY_EQUIPMENT", label: "Heavy Machinery", icon: "🏗️" },
];

const CITIES = ["ALL", "Mumbai", "Pune", "Bangalore", "Delhi"];

function BorrowerExploreContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "ALL";
  const initialSort = (searchParams.get("sort") as any) || "newest";

  const [tools, setTools] = useState<ToolItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("ALL");
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [sortBy, setSortBy] = useState<"newest" | "featured" | "price_asc" | "price_desc" | "rating">(initialSort);

  async function loadTools() {
    try {
      setLoading(true);
      // Public/Borrower catalog query strictly filters published tools on server
      const res = await fetch("/api/tools", { cache: "no-store" });
      const data = await res.json();
      if (data.tools) {
        let loadedTools: ToolItem[] = data.tools;
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("toolshare_custom_tools");
            if (raw) {
              const custom: ToolItem[] = JSON.parse(raw);
              for (const ct of custom) {
                if (ct.isPublished !== false && !loadedTools.some((t) => t.id === ct.id || t._id === ct.id || t.publicId === ct.publicId)) {
                  loadedTools = [ct, ...loadedTools];
                }
              }
            }
          } catch {}
        }
        setTools(loadedTools);
      }
    } catch (err) {
      console.error("Failed to load catalog:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTools();
  }, []);

  // Real-time synchronization when owner lists/edits/deletes equipment
  useEffect(() => {
    if (typeof window === "undefined") return;

    let toolChannel: BroadcastChannel | null = null;
    try {
      toolChannel = new BroadcastChannel("toolshare_tool_sync");
      toolChannel.onmessage = (event) => {
        const data = event.data;
        if (data?.type === "TOOL_CREATED" && data.tool) {
          const newT: ToolItem = data.tool;
          if (newT.isPublished !== false) {
            setTools((prev) => {
              const exists = prev.some((t) => t.id === newT.id || t._id === newT.id || t.publicId === newT.publicId);
              return exists ? prev : [newT, ...prev];
            });
          }
        } else if (data?.type === "TOOL_DELETED" && data.toolId) {
          setTools((prev) => prev.filter((t) => t.id !== data.toolId && t._id !== data.toolId));
        }
      };
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "toolshare_tool_sync_event") {
        try {
          const parsed = JSON.parse(e.newValue || "{}");
          if (parsed?.type === "TOOL_CREATED" && parsed.tool) {
            const newT: ToolItem = parsed.tool;
            if (newT.isPublished !== false) {
              setTools((prev) => {
                const exists = prev.some((t) => t.id === newT.id || t._id === newT.id || t.publicId === newT.publicId);
                return exists ? prev : [newT, ...prev];
              });
            }
          }
        } catch {}
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      toolChannel?.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const filteredTools = useMemo(() => {
    let list = [...tools];

    if (selectedCategory !== "ALL") {
      list = list.filter((t) => t.category === selectedCategory);
    }

    if (selectedCity !== "ALL") {
      list = list.filter((t) => t.city.toLowerCase() === selectedCity.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    list = list.filter((t) => t.ratePerDay <= maxPrice);

    if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else if (sortBy === "price_asc") {
      list.sort((a, b) => a.ratePerDay - b.ratePerDay);
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => b.ratePerDay - a.ratePerDay);
    } else if (sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else {
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return list;
  }, [tools, selectedCategory, selectedCity, searchQuery, maxPrice, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
      {/* Page Header */}
      <div className="space-y-1.5 border-b border-border pb-6">
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-600 text-white text-[10px] uppercase font-bold tracking-wider">
            Borrower Marketplace
          </Badge>
          <span className="text-xs text-muted-foreground">{filteredTools.length} Tools Available</span>
        </div>
        <h1 className="font-oswald text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
          Explore Shared Equipment Catalog
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Rent vetted tools from trusted local owners in your city. Safe payments, refundable deposits, and verified gear.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Search & Location Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by tool name (e.g. drill, circular saw, pressure washer)..."
              className="pl-9 bg-background text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="md:col-span-3 flex items-center gap-2 bg-background border border-input rounded-xl px-3 h-10">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent text-xs sm:text-sm text-foreground w-full focus:outline-hidden"
            >
              <option value="ALL">All Cities (India)</option>
              {CITIES.filter((c) => c !== "ALL").map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 flex items-center gap-2 bg-background border border-input rounded-xl px-3 h-10">
            <ArrowUpDown className="w-4 h-4 text-muted-foreground shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs sm:text-sm text-foreground w-full focus:outline-hidden font-medium"
            >
              <option value="newest">Newest Listed First (Latest)</option>
              <option value="featured">Featured First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Customer Rated</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Price Slider */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border text-xs">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-foreground">Max Daily Rental Rate: ₹{maxPrice}/day</span>
          </div>
          <input
            type="range"
            min="200"
            max="1500"
            step="50"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full sm:w-56 accent-emerald-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Equipment Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-80 bg-card border border-border rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredTools.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-12 text-center space-y-3 max-w-md mx-auto">
          <Wrench className="w-12 h-12 text-muted-foreground/60 mx-auto" />
          <h3 className="font-oswald text-xl font-bold uppercase text-foreground">No Tools Match Filters</h3>
          <p className="text-xs text-muted-foreground">
            Try resetting your price slider or searching across all categories to see more available tools.
          </p>
          <Button
            size="sm"
            onClick={() => {
              setSelectedCategory("ALL");
              setSelectedCity("ALL");
              setSearchQuery("");
              setMaxPrice(1500);
            }}
            variant="outline"
            className="text-xs font-bold"
          >
            Reset All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTools.map((tool) => (
            <div
              key={tool.id || tool._id}
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs hover:border-emerald-500/50 hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Photo */}
                <div className="relative h-44 w-full bg-neutral-100 overflow-hidden">
                  <Image
                    src={tool.images?.[0] || "/assets/drill machine.png"}
                    alt={tool.title}
                    fill
                    className="object-contain p-3 group-hover:scale-105 transition-transform"
                  />
                  <Badge className="absolute top-2.5 left-2.5 bg-neutral-900/80 backdrop-blur-xs text-white text-[10px]">
                    {tool.condition.replace(/_/g, " ")}
                  </Badge>
                  {tool.createdAt && new Date(tool.createdAt).getTime() > new Date("2026-10-25T00:00:00Z").getTime() && (
                    <Badge className="absolute top-2.5 right-2.5 bg-brand text-white text-[9px] font-bold uppercase tracking-wider shadow-xs">
                      NEW
                    </Badge>
                  )}
                  <div className="absolute bottom-2.5 right-2.5 bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-xs font-bold font-oswald">
                    ₹{tool.ratePerDay}/day
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-semibold text-emerald-600 uppercase tracking-wider">{tool.category.replace(/_/g, " ")}</span>
                    <span className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {tool.rating || 4.9}
                    </span>
                  </div>

                  <h3 className="font-oswald text-base font-bold uppercase tracking-tight text-foreground line-clamp-1 group-hover:text-emerald-600 transition-colors">
                    {tool.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {tool.description}
                  </p>

                  <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Pickup: <strong>{tool.pickupArea || tool.city}</strong></span>
                    <span>Deposit: ₹{tool.deposit || 0}</span>
                  </div>
                </div>
              </div>

              {/* Book Action */}
              <div className="p-4 pt-0">
                <Link href={`/tools/${tool.id || tool._id}`}>
                  <Button
                    size="sm"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-oswald uppercase tracking-wider font-bold text-xs h-9"
                  >
                    View & Rent Tool
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BorrowerExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 pt-28 pb-16 min-h-[60vh] flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      }
    >
      <BorrowerExploreContent />
    </Suspense>
  );
}
