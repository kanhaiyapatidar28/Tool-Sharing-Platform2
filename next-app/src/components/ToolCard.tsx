"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ToolItem } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Star, MapPin, Zap, CheckCircle2 } from "lucide-react";

interface ToolCardProps {
  tool: ToolItem;
  initialWished?: boolean;
}

export default function ToolCard({ tool, initialWished = false }: ToolCardProps) {
  const [isWished, setIsWished] = useState(initialWished);

  const toggleFav = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWished(!isWished);
    try {
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId: tool.id || tool._id }),
      });
    } catch (err) {
      console.warn("Fav toggle failed:", err);
    }
  };

  const getConditionVariant = (cond: string) => {
    switch (cond) {
      case "BRAND_NEW":
        return "success";
      case "LIKE_NEW":
        return "info";
      case "GOOD":
        return "secondary";
      default:
        return "warning";
    }
  };

  const photo = tool.images?.[0] || "/assets/drill machine.png";

  return (
    <Link
      href={`/tools/${tool.id || tool._id}`}
      className="group relative flex flex-col bg-card rounded-3xl border border-border/80 overflow-hidden shadow-sm hover:shadow-2xl hover:border-brand/40 transition-all duration-300 hover:-translate-y-1.5"
    >
      {/* Tool Image Container */}
      <div className="relative w-full h-56 bg-gradient-to-b from-neutral-100 to-neutral-200/60 dark:from-neutral-900 dark:to-neutral-800/80 p-6 flex items-center justify-center overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative w-44 h-44 transition-transform duration-500 group-hover:scale-110 drop-shadow-xl">
          <Image
            src={photo}
            alt={tool.title}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 300px"
          />
        </div>

        {/* Condition Badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge variant={getConditionVariant(tool.condition)} className="text-[10px] font-bold">
            {tool.condition.replace("_", " ")}
          </Badge>
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={toggleFav}
          aria-label="Wishlist"
          className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            isWished
              ? "bg-red-50 text-red-500 shadow-md scale-110"
              : "bg-white/80 dark:bg-black/60 text-muted-foreground hover:text-red-500 hover:scale-110 backdrop-blur-md"
          }`}
        >
          <Heart className={`w-4 h-4 ${isWished ? "fill-red-500" : ""}`} />
        </button>

        {/* Featured / Verified indicator */}
        {tool.featured && (
          <div className="absolute bottom-2 left-3 text-[10px] font-semibold text-brand bg-white/90 dark:bg-black/80 px-2.5 py-0.5 rounded-full border border-brand/20 shadow-sm flex items-center gap-1">
            <Zap className="w-2.5 h-2.5 fill-brand" /> Verified Gear
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-5 space-y-3">
        {/* City and Category */}
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
          <span className="flex items-center gap-1 truncate max-w-[130px]">
            <MapPin className="w-3.5 h-3.5 text-brand shrink-0" />
            {tool.city}
          </span>
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground/80 font-bold">
            {tool.category.replace("_", " ")}
          </span>
        </div>

        {/* Tool Title */}
        <h3 className="font-oswald text-lg font-bold uppercase tracking-tight text-foreground line-clamp-1 group-hover:text-brand transition-colors">
          {tool.title}
        </h3>

        {/* Description Snippet */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {tool.description}
        </p>

        {/* Rating and Owner Trust */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
          <div className="flex items-center gap-1 text-amber-500 font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
            <span>{tool.rating.toFixed(1)}</span>
            <span className="text-muted-foreground font-normal">({tool.reviewsCount})</span>
          </div>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {tool.ownerName}
          </span>
        </div>

        {/* Price and Action Button */}
        <div className="flex items-center justify-between pt-2 mt-auto">
          <div>
            <div className="text-base sm:text-lg font-black text-foreground font-oswald tracking-tight">
              {formatCurrency(tool.ratePerDay)}
              <span className="text-xs font-normal text-muted-foreground"> / day</span>
            </div>
            {tool.deposit > 0 && (
              <div className="text-[10px] text-muted-foreground">
                Deposit: {formatCurrency(tool.deposit)}
              </div>
            )}
          </div>

          <Button
            size="sm"
            className="rounded-xl px-4 font-bold text-xs bg-brand hover:bg-brand-hover shadow-sm"
          >
            Rent Now
          </Button>
        </div>
      </div>
    </Link>
  );
}
