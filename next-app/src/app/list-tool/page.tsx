"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  Sparkles,
  ArrowRight,
  Upload,
  CheckCircle2,
  DollarSign,
  MapPin,
  Tag,
  Wrench,
} from "lucide-react";

const PRESET_ASSETS = [
  { name: "Drill Machine", path: "/assets/drill machine.png" },
  { name: "Rotary Hammer", path: "/assets/Rotary hammer drill.png" },
  { name: "Circular Saw", path: "/assets/Circular Saw.png" },
  { name: "Angle Grinder", path: "/assets/Angle Grinder.png" },
  { name: "Belt Sander", path: "/assets/Belt Sander.png" },
  { name: "Chainsaw", path: "/assets/chainsaw.png" },
  { name: "Pressure Washer", path: "/assets/Pressure washer.png" },
  { name: "Step Ladder", path: "/assets/step ladder.png" },
  { name: "Tool Box", path: "/assets/Tool box.png" },
  { name: "Tile Cutter", path: "/assets/Tile Cutter.png" },
];

export default function ListToolPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("POWER_TOOLS");
  const [condition, setCondition] = useState("LIKE_NEW");
  const [ratePerDay, setRatePerDay] = useState("400");
  const [deposit, setDeposit] = useState("1200");
  const [selectedPhoto, setSelectedPhoto] = useState("/assets/drill machine.png");
  const [city, setCity] = useState("Mumbai");
  const [address, setAddress] = useState("Bandra West, Mumbai");
  const [specPower, setSpecPower] = useState("18V Lithium-Ion");
  const [specWeight, setSpecWeight] = useState("2.2 kg");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !ratePerDay) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || "Professional grade tool in prime working condition.",
          category,
          condition,
          ratePerDay: Number(ratePerDay),
          deposit: Number(deposit || 0),
          images: [selectedPhoto],
          city,
          address,
          specs: {
            "Power Output": specPower || "Corded Electric",
            "Tool Weight": specWeight || "Standard",
          },
          ownerName: user ? user.name : "John Owner",
          ownerEmail: user ? user.email : "john_owner@example.com",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/tools/${data.tool.id || data.tool._id}`);
        }, 1500);
      }
    } catch (err) {
      console.error("Tool listing failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-28 pb-16 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-brand uppercase tracking-wider">
          Owner Portal
        </span>
        <h1 className="font-oswald text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
          List Your Equipment For Rent
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
          Start earning passive income from your tools. Verified neighbors will rent, inspect, and return your equipment safely.
        </p>
      </div>

      {success ? (
        <div className="p-10 rounded-3xl bg-card border border-emerald-500/40 text-center space-y-4 shadow-xl">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h2 className="font-oswald text-2xl font-bold uppercase text-foreground">
            Listing Published to MongoDB!
          </h2>
          <p className="text-xs text-muted-foreground">
            Your tool is now active in the catalog and open for neighbor reservations. Redirecting to your listing...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Card 1: Basic Information */}
          <div className="bg-card rounded-3xl border border-border/80 p-6 sm:p-8 space-y-5 shadow-sm">
            <h3 className="font-oswald text-xl font-bold uppercase tracking-tight text-foreground flex items-center gap-2">
              <Wrench className="w-5 h-5 text-brand" /> 1. Tool Details
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-muted-foreground">
                Tool Title *
              </label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Bosch Professional 18V Cordless Impact Drill"
                className="font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 bg-background border border-border rounded-xl px-4 text-xs font-semibold text-foreground focus:outline-none focus:border-brand"
                >
                  <option value="POWER_TOOLS">⚡ Power Tools</option>
                  <option value="HAND_TOOLS">🔨 Hand Tools</option>
                  <option value="WOODWORKING">🪵 Woodworking</option>
                  <option value="GARDEN">🌿 Garden & Outdoor</option>
                  <option value="CLEANING">🧹 Cleaning & Washers</option>
                  <option value="HEAVY_EQUIPMENT">🏗️ Heavy Equipment</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Condition *
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full h-11 bg-background border border-border rounded-xl px-4 text-xs font-semibold text-foreground focus:outline-none focus:border-brand"
                >
                  <option value="BRAND_NEW">Brand New (Unused, flawless)</option>
                  <option value="LIKE_NEW">Like New (Minimal use, pristine)</option>
                  <option value="GOOD">Good (Light cosmetic signs, 100% functional)</option>
                  <option value="FAIR">Fair (Visible wear, working reliably)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-muted-foreground">
                Description & Included Accessories
              </label>
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention battery count, charger, bits, safety goggles, or carrying case..."
              />
            </div>
          </div>

          {/* Card 2: Select Equipment Photo Preset */}
          <div className="bg-card rounded-3xl border border-border/80 p-6 sm:p-8 space-y-5 shadow-sm">
            <h3 className="font-oswald text-xl font-bold uppercase tracking-tight text-foreground flex items-center gap-2">
              <Upload className="w-5 h-5 text-brand" /> 2. Tool Photo Preset
            </h3>
            <p className="text-xs text-muted-foreground">
              Select one of our high-resolution equipment visuals or enter a custom photo URL:
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {PRESET_ASSETS.map((asset) => (
                <button
                  type="button"
                  key={asset.path}
                  onClick={() => setSelectedPhoto(asset.path)}
                  className={`relative p-2 rounded-2xl border-2 flex flex-col items-center justify-center transition-all bg-neutral-100 dark:bg-neutral-800 ${
                    selectedPhoto === asset.path
                      ? "border-brand shadow-lg shadow-brand/20 scale-105"
                      : "border-border/60 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="relative w-16 h-16">
                    <Image src={asset.path} alt={asset.name} fill className="object-contain" />
                  </div>
                  <span className="text-[10px] font-bold text-foreground mt-1 truncate max-w-[80px]">
                    {asset.name}
                  </span>
                </button>
              ))}
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">
                Custom Image URL (Optional)
              </label>
              <Input
                value={selectedPhoto}
                onChange={(e) => setSelectedPhoto(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          </div>

          {/* Card 3: Pricing & Deposit */}
          <div className="bg-card rounded-3xl border border-border/80 p-6 sm:p-8 space-y-5 shadow-sm">
            <h3 className="font-oswald text-xl font-bold uppercase tracking-tight text-foreground flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-brand" /> 3. Daily Rate & Escrow Deposit
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Daily Rental Rate (₹) *
                </label>
                <Input
                  type="number"
                  required
                  min="50"
                  max="10000"
                  value={ratePerDay}
                  onChange={(e) => setRatePerDay(e.target.value)}
                  placeholder="e.g. 400"
                />
                <span className="text-[10px] text-muted-foreground">
                  Recommended for power tools: ₹300 - ₹600/day
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Refundable Security Deposit (₹)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="50000"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  placeholder="e.g. 1500"
                />
                <span className="text-[10px] text-muted-foreground">
                  Held safely in escrow during rental
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  City Location
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full h-11 bg-background border border-border rounded-xl px-4 text-xs font-semibold text-foreground focus:outline-none focus:border-brand"
                >
                  <option value="Mumbai">Mumbai</option>
                  <option value="Pune">Pune</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Delhi">Delhi</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Neighborhood / Area
                </label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Bandra West, Mumbai"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4">
            <Link href="/browse">
              <Button variant="ghost" type="button" className="font-bold">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={submitting}
              size="lg"
              className="bg-brand hover:bg-brand-hover text-white font-oswald uppercase tracking-wider px-8 rounded-2xl shadow-xl shadow-brand/30"
            >
              {submitting ? "Publishing to MongoDB..." : "Publish Tool Listing"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
