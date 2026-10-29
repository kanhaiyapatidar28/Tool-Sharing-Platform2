import React from "react";
import Link from "next/link";
import Image from "next/image";
import ToolCard from "@/components/ToolCard";
import { getTools } from "@/lib/data-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap,
  Repeat,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  SlidersHorizontal,
} from "lucide-react";

const CATEGORIES = [
  { id: "POWER_TOOLS", label: "Power Tools", icon: "⚡", count: "Drills, Drivers & Saws" },
  { id: "HAND_TOOLS", label: "Hand Tools", icon: "🔨", count: "Wrenches & Sets" },
  { id: "WOODWORKING", label: "Woodworking", icon: "🪵", count: "Sanders & Planers" },
  { id: "GARDEN", label: "Garden & Lawn", icon: "🌿", count: "Chainsaws & Cutters" },
  { id: "CLEANING", label: "Pressure Washers", icon: "🧹", count: "145 Bar Dirt Blasters" },
  { id: "HEAVY_EQUIPMENT", label: "Heavy Equipment", icon: "🏗️", count: "Telescopic Ladders" },
];

export default async function HomePage() {
  const allTools = await getTools();
  const featuredTools = allTools.slice(0, 6);

  return (
    <div>
      {/* ==================== HERO SECTION (LIGHT THEME WITH ROUNDED BOTTOM) ==================== */}
      <section className="relative w-full -mt-20 sm:-mt-24 pt-28 sm:pt-32 pb-16 lg:pb-24 bg-white text-neutral-900 overflow-hidden rounded-b-[2.5rem] sm:rounded-b-[3.5rem] lg:rounded-b-[4rem] border-b border-neutral-200/80 shadow-sm">
        {/* Kinetic Background Marquee */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex flex-col justify-around select-none overflow-hidden">
          <div className="whitespace-nowrap font-oswald text-8xl md:text-9xl uppercase font-black tracking-widest text-neutral-900">
            RENT TOOLS • RENT TOOLS • RENT TOOLS • RENT TOOLS • RENT TOOLS
          </div>
          <div className="whitespace-nowrap font-oswald text-8xl md:text-9xl uppercase font-black tracking-widest text-neutral-900">
            BORROW • BUILD • SAVE • EMPOWER • NEIGHBORS
          </div>
        </div>

        {/* Glowing Ambient Radial Gradients */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand/10 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-brand/10 rounded-full blur-[128px] pointer-events-none" />

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          {/* Grid Layout: Left Copy & Right Featured Equipment */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Headline & Action */}
            <div className="lg:col-span-6 space-y-7 sm:space-y-8 py-2">
              <div className="inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full bg-orange-500/10 border border-brand/25 text-xs sm:text-sm font-bold text-brand tracking-wider uppercase backdrop-blur-md shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-brand animate-ping" />
                <span>Local Peer-to-Peer Tool Sharing</span>
              </div>

              <h1 className="font-oswald text-5xl sm:text-6xl md:text-7xl lg:text-[4.6rem] xl:text-[5.4rem] font-black uppercase tracking-tight leading-[0.92] text-neutral-900">
                <span className="block">Why Buy When</span>
                <span className="block">You Can Rent</span>
                <span className="text-gradient block">Nearby?</span>
              </h1>

              <p className="text-base sm:text-lg lg:text-[1.12rem] text-neutral-600 leading-relaxed max-w-xl font-normal">
                Borrow professional-grade power tools, drills, saws, and lawn equipment from verified neighbors in your locality. Save up to 70% with zero maintenance hassle.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-5">
                <Link href="/browse">
                  <Button
                    size="lg"
                    className="h-14 sm:h-15 bg-brand hover:bg-brand-hover text-white font-oswald uppercase tracking-wider px-9 rounded-full shadow-xl shadow-brand/30 hover:scale-105 active:scale-95 transition-all text-base sm:text-lg font-bold"
                  >
                    View Collections <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>

                <Link href="/owner/tools/new">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 sm:h-15 border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-900 font-oswald uppercase tracking-wider px-8 rounded-full text-base sm:text-lg font-bold shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95"
                  >
                    Earn As Owner
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm font-semibold text-neutral-700">
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white border border-neutral-200/90 shadow-xs">
                  <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
                  <span>₹50K Protection</span>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white border border-neutral-200/90 shadow-xs">
                  <Lock className="w-4.5 h-4.5 text-brand" />
                  <span>Verified Owners</span>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white border border-neutral-200/90 shadow-xs">
                  <Sparkles className="w-4.5 h-4.5 text-amber-500" />
                  <span>Instant Pickup</span>
                </div>
              </div>
            </div>

            {/* Right: Floating Hands & Levitating Tool Showcase */}
            <div className="lg:col-span-6 relative h-[540px] sm:h-[600px] lg:h-[660px] w-full flex items-center justify-center select-none overflow-visible">
              {/* Drill & Orbital Background Ensemble (Shifted left together) */}
              <div className="absolute inset-0 flex items-center justify-center -translate-x-6 sm:-translate-x-8 lg:-translate-x-11 pointer-events-none">
                {/* Subtle Ambient Radial Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-88 sm:h-88 lg:w-96 lg:h-96 bg-gradient-to-tr from-brand/15 via-brand/5 to-transparent rounded-full blur-3xl pointer-events-none" />

                {/* Orbital Ring Geometry (Wireframe Planetary Ring matching reference) */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none z-0"
                  viewBox="0 0 620 620"
                  fill="none"
                >
                  {/* Fine primary tilted ellipse */}
                  <ellipse
                    cx="290"
                    cy="320"
                    rx="195"
                    ry="108"
                    transform="rotate(-26 290 320)"
                    stroke="#FF5A1F"
                    strokeOpacity="0.35"
                    strokeWidth="1.2"
                    strokeDasharray="4 4"
                  />
                  {/* Concentric faint background orbit */}
                  <circle
                    cx="290"
                    cy="320"
                    r="158"
                    stroke="#E5E7EB"
                    strokeWidth="1"
                    strokeOpacity="0.8"
                  />
                  {/* Tangent technical lines extending from orbit nodes */}
                  <line x1="85" y1="265" x2="140" y2="265" stroke="#FF5A1F" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="2 2" />
                  <line x1="440" y1="375" x2="495" y2="375" stroke="#FF5A1F" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="2 2" />
                  {/* Orbit anchor nodes */}
                  <circle cx="140" cy="265" r="3.5" fill="#FF5A1F" />
                  <circle cx="440" cy="375" r="3.5" fill="#FF5A1F" />
                  <circle cx="290" cy="162" r="2.5" fill="#9CA3AF" />
                </svg>

                {/* Center Levitating Drill Machine with Smooth Floating Motion */}
                <div className="relative z-10 pointer-events-auto animate-drill-float">
                  <div className="w-[185px] sm:w-[220px] lg:w-[250px] -rotate-[26deg] transition-all duration-500 hover:scale-105 hover:-rotate-[20deg] drop-shadow-[0_28px_40px_rgba(0,0,0,0.22)] cursor-pointer">
                    <Image
                      src="/assets/drill-tight.png"
                      alt="Bosch Professional 18V Impact Drill"
                      width={250}
                      height={308}
                      className="w-full h-auto object-contain"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Top Hand: Hovering from top right (Slightly shorter & shifted right) */}
              <div className="absolute -top-12 sm:-top-16 lg:-top-20 xl:-top-22 right-[-95px] sm:right-[-115px] lg:right-[-140px] xl:right-[-155px] z-20 w-[460px] sm:w-[570px] lg:w-[680px] xl:w-[740px] pointer-events-none drop-shadow-[0_15px_25px_rgba(0,0,0,0.08)]">
                <Image
                  src="/assets/top-hand.png"
                  alt="Top Hand Guiding Tool"
                  width={740}
                  height={291}
                  className="w-full h-auto object-contain"
                  priority
                />
              </div>

              {/* Bottom Hand: Shifted flush into homepage round corner (Slightly shorter & shifted right) */}
              <div className="absolute -bottom-18 sm:-bottom-22 lg:-bottom-26 xl:-bottom-28 right-[-95px] sm:right-[-115px] lg:right-[-140px] xl:right-[-155px] z-20 w-[450px] sm:w-[560px] lg:w-[670px] xl:w-[730px] pointer-events-none drop-shadow-[0_20px_35px_rgba(0,0,0,0.12)]">
                <Image
                  src="/assets/bottom-hand.png"
                  alt="Bottom Hand Supporting Tool"
                  width={730}
                  height={373}
                  className="w-full h-auto object-contain"
                  priority
                />
              </div>

              {/* Technical Spec 1: Power 18V Brushless Motor (matches reference photo typography) */}
              <div className="absolute top-[23%] sm:top-[25%] right-1 sm:right-4 z-30 flex items-start gap-2.5 select-none pointer-events-none">
                <div className="w-[1.5px] h-10 bg-neutral-400/80 mt-1" />
                <div className="text-left leading-none font-mono">
                  <span className="text-[10px] uppercase tracking-[0.28em] text-neutral-400 font-semibold block mb-1">POWER</span>
                  <span className="font-oswald text-2xl sm:text-3xl font-black text-neutral-800 tracking-tight block leading-none mb-1.5">18V</span>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold block leading-tight">BRUSHLESS<br />MOTOR</span>
                </div>
              </div>

              {/* Technical Spec 2: Rent Tools Save Money (matches reference photo typography) */}
              <div className="absolute bottom-[28%] sm:bottom-[30%] right-1 sm:right-4 z-30 flex items-start gap-2.5 select-none pointer-events-none">
                <div className="w-[1.5px] h-12 bg-neutral-400/80 mt-1" />
                <div className="text-left leading-tight font-mono space-y-1">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 font-bold block">RENT</span>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 font-bold block">TOOLS</span>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 font-bold block">SAVE</span>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-brand font-black block">MONEY</span>
                </div>
              </div>

              {/* Quick Rent Action Pill (Aligned under drill) */}
              <Link
                href="/tools/tool-1"
                className="absolute bottom-4 sm:bottom-6 left-[42%] sm:left-[44%] -translate-x-1/2 z-30 inline-flex items-center gap-2 bg-neutral-900 hover:bg-brand text-white px-5 py-2.5 rounded-full text-xs font-oswald uppercase tracking-wider font-bold shadow-xl shadow-black/10 transition-all duration-300 hover:scale-105 active:scale-95 group"
              >
                <span>Rent Bosch 18V Drill • ₹450/day</span>
                <ArrowRight className="w-3.5 h-3.5 text-brand group-hover:text-white transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Page Sections */}
      <div className="space-y-16 sm:space-y-24 pt-12 sm:pt-16">

      {/* ==================== CURVY BENTO SHOWCASE ==================== */}
      <section className="px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Telescopic Ladders */}
          <div className="group relative rounded-3xl bg-white text-neutral-900 p-7 overflow-hidden border border-neutral-200/90 shadow-md flex flex-col justify-between hover:border-brand/40 hover:shadow-xl transition-all duration-300">
            <div>
              <Badge variant="outline" className="text-neutral-600 border-neutral-300 mb-3 text-[10px]">
                Heavy Equipment
              </Badge>
              <h3 className="font-oswald text-2xl font-bold uppercase tracking-tight text-neutral-900 mb-2">
                Compact Storage
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                12.5ft telescopic multi-purpose ladders that collapse to fit into any car trunk.
              </p>
            </div>

            <div className="relative w-full h-44 my-4 flex items-center justify-center">
              <Image
                src="/assets/step ladder.png"
                alt="Step Ladder"
                width={170}
                height={170}
                style={{ width: "auto", height: "auto" }}
                className="object-contain drop-shadow-2xl group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-300"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
              <span className="font-bold text-brand">From ₹200 / day</span>
              <Link
                href="/browse?category=HEAVY_EQUIPMENT"
                className="flex items-center gap-1 text-neutral-600 hover:text-brand font-medium"
              >
                Browse <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Precision Saws & Cutting */}
          <div className="group relative rounded-3xl bg-brand text-white p-7 overflow-hidden shadow-xl shadow-brand/20 flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300">
            <div>
              <Badge variant="outline" className="text-white border-white/40 mb-3 text-[10px] bg-white/10">
                ⭐ Most Popular
              </Badge>
              <h3 className="font-oswald text-2xl font-bold uppercase tracking-tight text-white mb-2">
                Curated Specials
              </h3>
              <p className="text-xs text-white/90 leading-relaxed">
                Carbide tip circular saws & angle grinders checked and calibrated for every cut.
              </p>
            </div>

            <div className="relative w-full h-44 my-4 flex items-center justify-center">
              <Image
                src="/assets/Circular Saw.png"
                alt="Circular Saw"
                width={200}
                height={180}
                style={{ width: "auto", height: "auto" }}
                className="object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-300"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/20 text-xs">
              <span className="font-bold text-white">From ₹450 / day</span>
              <Link
                href="/browse?category=POWER_TOOLS"
                className="flex items-center gap-1 text-white font-bold hover:underline"
              >
                View Collection <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: Deep Washers & Garden */}
          <div className="group relative rounded-3xl bg-white text-neutral-900 p-7 overflow-hidden border border-neutral-200/90 shadow-md flex flex-col justify-between hover:border-brand/40 hover:shadow-xl transition-all duration-300">
            <div>
              <Badge variant="outline" className="text-neutral-600 border-neutral-300 mb-3 text-[10px]">
                Clean & Restore
              </Badge>
              <h3 className="font-oswald text-2xl font-bold uppercase tracking-tight text-neutral-900 mb-2">
                145 Bar Pressure
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                High-efficiency pressure washers with rotating dirt blasters for cars, decks, and walls.
              </p>
            </div>

            <div className="relative w-full h-44 my-4 flex items-center justify-center">
              <Image
                src="/assets/Pressure washer.png"
                alt="Pressure Washer"
                width={180}
                height={170}
                style={{ width: "auto", height: "auto" }}
                className="object-contain drop-shadow-2xl group-hover:scale-105 group-hover:rotate-2 transition-transform duration-300"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
              <span className="font-bold text-brand">From ₹750 / day</span>
              <Link
                href="/browse?category=CLEANING"
                className="flex items-center gap-1 text-neutral-600 hover:text-brand font-medium"
              >
                Browse <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CATEGORIES SELECTOR ==================== */}
      <section className="px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-brand uppercase tracking-wider">
              Explore by Equipment Type
            </span>
            <h2 className="font-oswald text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground mt-1">
              Popular Categories
            </h2>
          </div>
          <Link
            href="/browse"
            className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
          >
            All 6 Categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/browse?category=${cat.id}`}
              className="group p-5 bg-card rounded-2xl border border-border/80 hover:border-brand hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center space-y-2 hover:-translate-y-1"
            >
              <div className="text-3xl p-3 bg-neutral-100 dark:bg-neutral-800 rounded-2xl group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <h4 className="font-oswald uppercase text-sm font-bold text-foreground group-hover:text-brand transition-colors">
                {cat.label}
              </h4>
              <span className="text-[11px] text-muted-foreground">{cat.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ==================== FEATURED TOOLS ==================== */}
      <section className="px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-brand uppercase tracking-wider">
              Handpicked by Neighbors
            </span>
            <h2 className="font-oswald text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground mt-1">
              Available For Rent Today
            </h2>
          </div>
          <Link href="/browse">
            <Button variant="outline" size="sm" className="rounded-full px-5 text-xs font-bold">
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" /> View Filtered Catalog
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuredTools.map((tool) => (
            <ToolCard key={tool.id || tool._id} tool={tool} />
          ))}
        </div>
      </section>

      {/* ==================== ABOUT US SECTION ==================== */}
      <section id="about" className="px-4 sm:px-8 max-w-7xl mx-auto scroll-mt-24">
        <div className="rounded-[2.5rem] bg-card text-foreground p-8 sm:p-12 border border-border/80 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold text-brand uppercase tracking-wider">
                About Our Community
              </span>
              <h2 className="font-oswald text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground leading-tight">
                India&apos;s Neighborhood Equipment Movement
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Most heavy power tools and specialized equipment are used for less than 30 minutes in their entire lifetime before sitting in a dark cupboard. ToolShare empowers Indian apartment communities, DIYers, and hobbyists to share high-performance gear safely and affordably.
              </p>
              <div className="pt-2 flex items-center gap-6">
                <div>
                  <div className="font-oswald text-2xl sm:text-3xl font-black text-brand">70%</div>
                  <div className="text-[11px] text-muted-foreground uppercase font-bold">Average Savings</div>
                </div>
                <div className="w-[1px] h-10 bg-border" />
                <div>
                  <div className="font-oswald text-2xl sm:text-3xl font-black text-emerald-600">100%</div>
                  <div className="text-[11px] text-muted-foreground uppercase font-bold">Tested Handover</div>
                </div>
                <div className="w-[1px] h-10 bg-border" />
                <div>
                  <div className="font-oswald text-2xl sm:text-3xl font-black text-foreground">₹0</div>
                  <div className="text-[11px] text-muted-foreground uppercase font-bold">Storage Clutter</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-border/60 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold text-lg">
                  🤝
                </div>
                <h3 className="font-oswald text-base font-bold uppercase text-foreground">
                  Verified Local Owners
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Connect with actual neighbors in your locality. Inspect tools directly and receive practical usage tips on the spot.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-border/60 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-lg">
                  🛡️
                </div>
                <h3 className="font-oswald text-base font-bold uppercase text-foreground">
                  Deposit Protection
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Transparent security deposits held safely during rental and released immediately upon verified undamaged return.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-border/60 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-lg">
                  📱
                </div>
                <h3 className="font-oswald text-base font-bold uppercase text-foreground">
                  QR Handover Pass
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Dynamic ISO-18004 tokens confirm custody transfer between parties without paperwork or disputes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section id="how-it-works" className="px-4 sm:px-8 max-w-7xl mx-auto scroll-mt-24">
        <div className="rounded-[2.5rem] bg-white text-neutral-900 p-8 sm:p-14 border border-neutral-200/90 shadow-xl">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold text-brand uppercase tracking-wider">
              Simple 3-Step Process
            </span>
            <h2 className="font-oswald text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 mt-1">
              How ToolShare Works
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-2">
              Borrow what you need for a weekend project or earn regular cash from tools resting in your cupboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="relative p-6 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand text-white font-oswald text-xl font-bold flex items-center justify-center">
                1
              </div>
              <h3 className="font-oswald text-xl uppercase font-bold text-neutral-900">
                Book Online In Seconds
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Choose your rental dates, check live availability, and reserve with transparent daily pricing and escrow protection.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand text-white font-oswald text-xl font-bold flex items-center justify-center">
                2
              </div>
              <h3 className="font-oswald text-xl uppercase font-bold text-neutral-900">
                QR Pickup & Inspect
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Meet your neighbor, test the tool on the spot, and scan the dynamic handover QR code to confirm safe handover.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand text-white font-oswald text-xl font-bold flex items-center justify-center">
                3
              </div>
              <h3 className="font-oswald text-xl uppercase font-bold text-neutral-900">
                Return & Deposit Release
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Finish your renovation, hand the tool back, and your deposit returns instantly to your account with a 5-star review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== OWNER CTA BANNER ==================== */}
      <section className="px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="rounded-[2.5rem] bg-gradient-to-r from-brand to-brand-hover text-white p-8 sm:p-14 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider bg-black/20 px-3 py-1 rounded-full text-white">
              Turn Dust into Rupees
            </span>
            <h2 className="font-oswald text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              Have Drills Or Saws Sitting Idle?
            </h2>
            <p className="text-xs sm:text-sm text-white/90 max-w-lg leading-relaxed">
              Most power tools are used for less than 15 minutes in their lifetime. List yours today, help a neighbor build, and earn up to ₹8,000 every month.
            </p>
          </div>

          <Link href="/owner/tools/new" className="shrink-0">
            <Button
              size="lg"
              className="h-13 sm:h-14 bg-white hover:bg-neutral-100 text-neutral-900 font-oswald uppercase tracking-wider px-8 rounded-full shadow-2xl text-base font-bold hover:scale-105 transition-all"
            >
              List Your Tool in 2 Minutes <ArrowRight className="ml-2 w-5 h-5 text-brand" />
            </Button>
          </Link>
        </div>
      </section>
      </div>
    </div>
  );
}
