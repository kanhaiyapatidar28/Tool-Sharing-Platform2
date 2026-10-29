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
import ToolQRModal from "@/components/ToolQRModal";
import { ToolItem } from "@/lib/constants";
import {
  PlusCircle,
  CheckCircle2,
  DollarSign,
  MapPin,
  Wrench,
  AlertCircle,
  ArrowLeft,
  QrCode,
  ShieldCheck,
} from "lucide-react";

const PRESET_ASSETS = [
  { name: "Impact Drill", path: "/assets/drill machine.png" },
  { name: "Rotary Hammer", path: "/assets/Rotary hammer drill.png" },
  { name: "Circular Saw", path: "/assets/Circular Saw.png" },
  { name: "Angle Grinder", path: "/assets/Angle Grinder.png" },
  { name: "Orbital Sander", path: "/assets/Orbital Sander.png" },
  { name: "Belt Sander", path: "/assets/Belt Sander.png" },
  { name: "Gasoline Chainsaw", path: "/assets/chainsaw.png" },
  { name: "Pressure Washer", path: "/assets/Pressure washer.png" },
  { name: "Step Ladder", path: "/assets/step ladder.png" },
  { name: "Mechanic Tool Box", path: "/assets/Tool box.png" },
  { name: "Tile Cutter", path: "/assets/Tile Cutter.png" },
];

export default function NewToolListingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("POWER_TOOLS");
  const [condition, setCondition] = useState("LIKE_NEW");
  const [ratePerDay, setRatePerDay] = useState("450");
  const [deposit, setDeposit] = useState("1200");
  const [selectedPhoto, setSelectedPhoto] = useState("/assets/drill machine.png");
  const [city, setCity] = useState("Mumbai");
  const [pickupArea, setPickupArea] = useState("Andheri West");
  const [address, setAddress] = useState("Andheri West, Mumbai");
  const [isPublished, setIsPublished] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [specPower, setSpecPower] = useState("18V Lithium-Ion Brushless");
  const [specWeight, setSpecWeight] = useState("2.2 kg");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdTool, setCreatedTool] = useState<ToolItem | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !ratePerDay) {
      setError("Please fill in the equipment title and daily rental rate.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description || "Heavy-duty equipment in prime working condition, checked and verified for rental.",
          category,
          condition,
          ratePerDay: Number(ratePerDay),
          deposit: Number(deposit || 0),
          images: [selectedPhoto],
          city,
          pickupArea,
          address,
          isPublished,
          isAvailable,
          specs: {
            "Power Output": specPower || "Cordless 18V",
            "Tool Weight": specWeight || "Standard",
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.tool) {
        setCreatedTool(data.tool);
      } else {
        setError(data.error || "Failed to publish tool listing.");
      }
    } catch (err: any) {
      setError(err.message || "Network error submitting tool listing.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2">
        <Link href="/owner/tools">
          <Button variant="ghost" size="sm" className="text-xs font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to My Tools
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-1.5 border-b border-border pb-6">
        <Badge className="bg-brand text-white text-[10px] uppercase font-bold tracking-wider">
          Owner Portal
        </Badge>
        <h1 className="font-oswald text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
          List a New Tool for Rent
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Publish your equipment to the shared community catalog. An scannable QR sticker code will be generated automatically.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Equipment Details */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
          <h2 className="font-oswald text-lg font-bold uppercase tracking-tight text-foreground flex items-center gap-2">
            <Wrench className="w-5 h-5 text-brand" /> 1. Equipment Specifications
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Tool Name & Model *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Bosch Professional 18V Brushless Rotary Hammer"
                required
                className="bg-background text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Description & Inclusions
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention inclusions (e.g. 2x batteries, charger, carrying case, drill bits) and safety rules."
                rows={3}
                className="bg-background text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-brand"
                >
                  <option value="POWER_TOOLS">Power Tools</option>
                  <option value="HAND_TOOLS">Hand Tools</option>
                  <option value="GARDEN">Garden & Landscaping</option>
                  <option value="HEAVY_EQUIPMENT">Heavy Equipment</option>
                  <option value="WOODWORKING">Woodworking</option>
                  <option value="CLEANING">Cleaning & Pressure Washers</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                  Equipment Condition *
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-brand"
                >
                  <option value="BRAND_NEW">Brand New (Flawless)</option>
                  <option value="LIKE_NEW">Like New (Minimal Wear)</option>
                  <option value="GOOD">Good (Reliable Working Condition)</option>
                  <option value="FAIR">Fair (Functional with cosmetic wear)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Equipment Photo Selection */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
          <h2 className="font-oswald text-lg font-bold uppercase tracking-tight text-foreground flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-brand" /> 2. Tool Photo (Select Preset or Upload)
          </h2>
          <p className="text-xs text-muted-foreground">
            Select a high-resolution preview asset from our verified hardware library:
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {PRESET_ASSETS.map((asset) => (
              <button
                type="button"
                key={asset.path}
                onClick={() => setSelectedPhoto(asset.path)}
                className={`relative p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                  selectedPhoto === asset.path
                    ? "border-brand bg-brand/5 ring-2 ring-brand/30 shadow-xs"
                    : "border-border hover:border-neutral-400 bg-background"
                }`}
              >
                <div className="relative w-12 h-12">
                  <Image src={asset.path} alt={asset.name} fill className="object-contain" />
                </div>
                <span className="text-[10px] font-semibold text-foreground line-clamp-1">{asset.name}</span>
                {selectedPhoto === asset.path && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand absolute top-1 right-1" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Pricing & Pickup Logistics */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
          <h2 className="font-oswald text-lg font-bold uppercase tracking-tight text-foreground flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-brand" /> 3. Pricing & Pickup Logistics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Daily Rental Price (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground font-bold">₹</span>
                <Input
                  type="number"
                  min="50"
                  step="50"
                  value={ratePerDay}
                  onChange={(e) => setRatePerDay(e.target.value)}
                  className="pl-8 bg-background font-oswald text-base font-bold"
                  required
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Recommended for power tools: ₹350 - ₹800 / day</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Refundable Security Deposit (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground font-bold">₹</span>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  className="pl-8 bg-background font-oswald text-base font-bold"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Held securely and refunded after equipment return</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                City / Region *
              </label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai, Pune, Bangalore"
                required
                className="bg-background"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Pickup Neighborhood / Area *
              </label>
              <Input
                value={pickupArea}
                onChange={(e) => setPickupArea(e.target.value)}
                placeholder="e.g. Andheri West, Bandra, Kothrud"
                required
                className="bg-background"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Safe public neighborhood shown to borrowers</p>
            </div>
          </div>

          {/* Visibility and Availability Switches */}
          <div className="pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded text-brand focus:ring-brand"
              />
              <div>
                <span className="text-xs font-bold text-foreground">Publish to Shared Catalog</span>
                <p className="text-[11px] text-muted-foreground">Allow borrowers to discover this tool in search & explore</p>
              </div>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 rounded text-brand focus:ring-brand"
              />
              <div>
                <span className="text-xs font-bold text-foreground">Available for Immediate Booking</span>
                <p className="text-[11px] text-muted-foreground">Uncheck if currently being serviced or reserved offline</p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <Link href="/owner/tools">
            <Button type="button" variant="ghost" className="text-xs text-muted-foreground">
              Cancel
            </Button>
          </Link>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto h-11 px-8 bg-brand hover:bg-brand-hover text-white font-oswald uppercase tracking-wider text-sm font-bold shadow-lg shadow-brand/30"
          >
            {submitting ? "Publishing to Fleet..." : "Publish Tool & Generate QR Tag"}
          </Button>
        </div>
      </form>

      {/* Post-Creation Success & QR Modal */}
      {createdTool && (
        <ToolQRModal
          tool={createdTool}
          onClose={() => {
            setCreatedTool(null);
            router.push("/owner/tools");
          }}
        />
      )}
    </div>
  );
}
