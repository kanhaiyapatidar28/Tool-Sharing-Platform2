"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ToolCard from "@/components/ToolCard";
import { ToolItem, INITIAL_TOOLS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  X,
  Sparkles,
  ArrowUpDown,
  Filter,
} from "lucide-react";

const CATEGORIES = [
  { id: "ALL", label: "All Categories", icon: "🛠️" },
  { id: "POWER_TOOLS", label: "Power Tools", icon: "⚡" },
  { id: "HAND_TOOLS", label: "Hand Tools", icon: "🔨" },
  { id: "WOODWORKING", label: "Woodworking", icon: "🪵" },
  { id: "GARDEN", label: "Garden & Outdoor", icon: "🌿" },
  { id: "CLEANING", label: "Pressure Washers", icon: "🧹" },
  { id: "HEAVY_EQUIPMENT", label: "Heavy Equipment", icon: "🏗️" },
];

const CITIES = ["ALL", "Mumbai", "Pune", "Bangalore", "Delhi"];

function BrowseContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "ALL";

  const [tools, setTools] = useState<ToolItem[]>(INITIAL_TOOLS);
  const [loading, setLoading] = useState(false);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("ALL");
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [sortBy, setSortBy] = useState<"newest" | "featured" | "price_asc" | "price_desc" | "rating">("newest");

  async function loadTools() {
    try {
      setLoading(true);
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
      console.error("Failed to fetch tools:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTools();
  }, []);

  // Real-time synchronization
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

  // Filter & sort logic
  const filteredTools = useMemo(() => {
    let list = [...tools].filter((t) => t.isPublished !== false);

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

  const resetFilters = () => {
    setSelectedCategory("ALL");
    setSearchQuery("");
    setSelectedCity("ALL");
    setMaxPrice(1000);
    setSortBy("newest");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-28 pb-16 space-y-8">
      {/* Page Title & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-oswald text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
              Browse Tools & Equipment
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Find verified power tools, saws, drills, and ladders near your neighborhood.
            </p>
          </div>

          <div className="text-xs font-semibold text-muted-foreground bg-card border border-border px-3.5 py-1.5 rounded-full shadow-sm self-start sm:self-center">
            {filteredTools.length} {filteredTools.length === 1 ? "tool" : "tools"} available
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by tool name (e.g. Impact Drill, Circular Saw, Pressure Washer)..."
            className="pl-11 pr-10 h-13 rounded-2xl bg-card border-border/80 text-sm shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Horizontal Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? "bg-brand text-white shadow-md shadow-brand/30 scale-105"
                : "bg-card border border-border text-foreground hover:border-brand/40"
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Filter Toolbar: City, Price, Sort, Reset */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* City Selector */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-4 h-4 text-brand" />
            <span className="font-semibold text-foreground">City:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-background border border-border rounded-xl px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:border-brand"
            >
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city === "ALL" ? "All Locations" : city}
                </option>
              ))}
            </select>
          </div>

          {/* Max Daily Rate Slider */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground pl-2 border-l border-border">
            <span>Max Price:</span>
            <input
              type="range"
              min="200"
              max="1500"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-24 accent-brand cursor-pointer"
            />
            <span className="font-bold text-foreground min-w-[50px]">₹{maxPrice}/day</span>
          </div>
        </div>

        {/* Sort Dropdown & Reset */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-background border border-border rounded-xl px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:border-brand"
            >
              <option value="newest">Newest Listed First (Latest)</option>
              <option value="featured">Featured First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {(selectedCategory !== "ALL" || selectedCity !== "ALL" || searchQuery || maxPrice < 1000) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs text-brand hover:text-brand-hover h-8 px-2 font-bold"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Tools Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 rounded-3xl bg-card border border-border animate-pulse p-6" />
          ))}
        </div>
      ) : filteredTools.length === 0 ? (
        <div className="text-center py-16 px-4 bg-card rounded-3xl border border-dashed border-border/80 space-y-4">
          <div className="text-4xl">🔍</div>
          <h3 className="font-oswald text-xl uppercase font-bold text-foreground">
            No Tools Found
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            We couldn&apos;t find any equipment matching your criteria. Try adjusting the price slider or resetting filters.
          </p>
          <Button variant="default" size="sm" onClick={resetFilters} className="font-bold">
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id || tool._id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-muted-foreground">Loading catalog...</div>}>
      <BrowseContent />
    </Suspense>
  );
}
