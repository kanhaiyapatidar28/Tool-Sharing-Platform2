"use client";

import React, { useState, useEffect, use } from "react";
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
  Wrench,
  DollarSign,
  ArrowLeft,
  QrCode,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
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

export default function EditToolListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [tool, setTool] = useState<ToolItem | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("POWER_TOOLS");
  const [condition, setCondition] = useState("LIKE_NEW");
  const [ratePerDay, setRatePerDay] = useState("");
  const [deposit, setDeposit] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState("/assets/drill machine.png");
  const [city, setCity] = useState("Mumbai");
  const [pickupArea, setPickupArea] = useState("Andheri West");
  const [isPublished, setIsPublished] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    async function loadTool() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/tools/${id}`);
        const data = await res.json();
        if (res.ok && data.success && data.tool) {
          const t: ToolItem = data.tool;
          setTool(t);
          setTitle(t.title);
          setDescription(t.description);
          setCategory(t.category);
          setCondition(t.condition);
          setRatePerDay(String(t.ratePerDay));
          setDeposit(String(t.deposit || 0));
          setSelectedPhoto(t.images?.[0] || "/assets/drill machine.png");
          setCity(t.city);
          setPickupArea(t.pickupArea || t.city);
          setIsPublished(t.isPublished !== false);
          setIsAvailable(t.isAvailable !== false);
        } else {
          setError(data.error || "Tool not found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load tool details");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadTool();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !ratePerDay) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/tools/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          condition,
          ratePerDay: Number(ratePerDay),
          deposit: Number(deposit || 0),
          images: [selectedPhoto],
          city,
          pickupArea,
          isPublished,
          isAvailable,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        if (data.tool) setTool(data.tool);
        setTimeout(() => {
          router.push("/owner/tools");
        }, 1200);
      } else {
        setError(data.error || "Failed to update tool listing");
      }
    } catch (err: any) {
      setError(err.message || "Network error updating tool");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this listing?")) return;
    try {
      const res = await fetch(`/api/tools/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/owner/tools");
      } else {
        alert(data.error || "Failed to delete tool");
      }
    } catch (err: any) {
      alert(err.message || "Network error deleting tool");
    }
  };

  if (loading || authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-28 pb-16 min-h-[60vh] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="max-w-md mx-auto px-4 pt-32 pb-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold font-oswald uppercase text-foreground">Equipment Not Found</h2>
        <p className="text-sm text-muted-foreground">{error || "This tool does not exist or has been removed."}</p>
        <Link href="/owner/tools">
          <Button className="bg-brand text-white font-bold">Back to My Tools</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <Link href="/owner/tools">
            <Button variant="ghost" size="sm" className="text-xs font-semibold text-muted-foreground hover:text-foreground mb-1 p-0 h-auto">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to My Tools
            </Button>
          </Link>
          <h1 className="font-oswald text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
            Edit Equipment Listing
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Update pricing, condition, pickup location, or publication status for this tool.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setQrModalOpen(true)}
            className="text-xs font-bold text-brand border-brand/30"
          >
            <QrCode className="w-4 h-4 mr-1.5" /> View QR Tag
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={handleDelete}
            className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-1.5" /> Delete
          </Button>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-3 text-emerald-600 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Listing updated successfully! Redirecting...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Specs */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
          <h2 className="font-oswald text-lg font-bold uppercase tracking-tight text-foreground flex items-center gap-2">
            <Wrench className="w-5 h-5 text-brand" /> Equipment Specifications
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Tool Name & Model *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-background text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Description & Inclusions
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
                  Condition *
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-brand"
                >
                  <option value="BRAND_NEW">Brand New</option>
                  <option value="LIKE_NEW">Like New</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Photo */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
          <h2 className="font-oswald text-lg font-bold uppercase tracking-tight text-foreground flex items-center gap-2">
            Tool Photo
          </h2>

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

        {/* Step 3: Pricing & Status */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
          <h2 className="font-oswald text-lg font-bold uppercase tracking-tight text-foreground flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-brand" /> Pricing & Publication Status
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
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Refundable Deposit (₹)
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
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                City *
              </label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="bg-background"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Pickup Neighborhood *
              </label>
              <Input
                value={pickupArea}
                onChange={(e) => setPickupArea(e.target.value)}
                required
                className="bg-background"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded text-brand focus:ring-brand"
              />
              <div>
                <span className="text-xs font-bold text-foreground">Published in Shared Catalog</span>
                <p className="text-[11px] text-muted-foreground">Uncheck to hide this tool from public search and explore</p>
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
                <p className="text-[11px] text-muted-foreground">Uncheck if tool is undergoing maintenance or in repair</p>
              </div>
            </label>
          </div>
        </div>

        {/* Buttons */}
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
            {submitting ? "Saving Updates..." : "Save Changes"}
          </Button>
        </div>
      </form>

      {/* QR Modal */}
      {qrModalOpen && tool && (
        <ToolQRModal tool={tool} onClose={() => setQrModalOpen(false)} />
      )}
    </div>
  );
}
