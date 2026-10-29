"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-client";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  QrCode,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Calendar,
  Lock,
  ArrowLeft,
  Share2,
  ExternalLink,
  Wrench,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface SanitizedTool {
  id: string;
  publicId: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  ratePerDay: number;
  deposit: number;
  images: string[];
  city: string;
  pickupArea: string;
  specs?: Record<string, string>;
  isAvailable: boolean;
  isPublished: boolean;
  rating: number;
  reviewsCount: number;
  owner: {
    name: string;
    city: string;
    rating: number;
    reviewsCount: number;
  };
}

export default function ScanToolPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const publicId = params.publicId as string;

  const [tool, setTool] = useState<SanitizedTool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string>("/assets/drill machine.png");
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function fetchToolByQr() {
      if (!publicId) return;
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/tools/scan/${publicId}`);
        const data = await res.json();
        if (res.ok && data.success && data.tool) {
          setTool(data.tool);
          if (data.tool.images && data.tool.images.length > 0) {
            setSelectedPhoto(data.tool.images[0]);
          }
        } else {
          setError(data.error || "The scanned QR code is invalid or has expired.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to scan equipment code.");
      } finally {
        setLoading(false);
      }
    }
    fetchToolByQr();
  }, [publicId]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const isOwner = user && tool && (user.role === "owner" || user.name.toLowerCase().includes(tool.owner.name.toLowerCase()));

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-28 pb-16 px-4">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex items-center justify-center p-8 bg-card rounded-3xl border border-border animate-pulse">
            <div className="text-center space-y-3">
              <QrCode className="w-12 h-12 text-brand animate-spin mx-auto" />
              <p className="text-sm font-semibold text-muted-foreground">
                Resolving equipment QR identifier...
              </p>
            </div>
          </div>
          <div className="h-64 rounded-3xl bg-card border border-border animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="min-h-screen bg-background pt-28 pb-16 px-4">
        <div className="max-w-md mx-auto text-center space-y-6 bg-card border border-border/80 rounded-3xl p-8 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="font-oswald text-2xl font-bold uppercase tracking-tight text-foreground">
              QR Code Not Recognized
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {error || "We could not find active registered equipment matching this physical tag."}
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <Link href="/borrower/explore">
              <Button className="w-full bg-brand hover:bg-brand-hover text-white font-oswald uppercase tracking-wider font-bold rounded-2xl h-12">
                Explore Tool Marketplace
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full rounded-2xl h-12 text-xs font-bold">
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation & Scan Tag Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/borrower/explore"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Marketplace
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-xl bg-card border border-border/80 text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copiedLink ? "Link Copied!" : "Share"}
            </button>
            <Badge variant="outline" className="text-[10px] font-mono tracking-wider">
              ID: {tool.publicId}
            </Badge>
          </div>
        </div>

        {/* Real-time Hardware QR Verified Badge */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-brand/10 via-amber-500/10 to-transparent border border-brand/20 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center text-white shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-0.5">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <span>Hardware QR Verified</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-muted-foreground">
              Official ToolShare equipment tag scanned. Authentic owner profile confirmed.
            </p>
          </div>
        </div>

        {/* Equipment Status Banner if Unavailable */}
        {(!tool.isAvailable || !tool.isPublished) && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-red-600 dark:text-red-400 block">
                Equipment Currently Unavailable for Immediate Handover
              </span>
              <p className="text-muted-foreground">
                {!tool.isPublished
                  ? "This listing has been set to draft or paused by the equipment owner."
                  : "This tool is currently checked out or booked by another community member."}
              </p>
            </div>
          </div>
        )}

        {/* Hero Visual Showcase */}
        <div className="relative rounded-3xl bg-[#1A242B] text-white p-6 sm:p-8 overflow-hidden shadow-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between z-20">
            <Badge className="bg-brand text-white text-xs font-bold uppercase tracking-wider">
              {tool.category.replace("_", " ")}
            </Badge>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/80 font-semibold flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                <MapPin className="w-3.5 h-3.5 text-brand" /> {tool.pickupArea}
              </span>
            </div>
          </div>

          {/* Visual Canvas */}
          <div className="relative w-full h-[280px] sm:h-[320px] flex items-center justify-center my-4 group">
            <div className="absolute inset-8 rounded-full bg-brand/10 blur-3xl pointer-events-none" />
            <div className="relative w-56 h-56 sm:w-72 sm:h-72 drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)]">
              <Image
                src={selectedPhoto}
                alt={tool.title}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Image Thumbnails if multi-image */}
          {tool.images && tool.images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pt-2 z-20">
              {tool.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedPhoto(img)}
                  className={`relative w-12 h-12 rounded-xl border-2 overflow-hidden bg-white/5 p-1 transition-all ${
                    selectedPhoto === img ? "border-brand scale-105" : "border-white/15 opacity-60"
                  }`}
                >
                  <Image src={img} alt="Thumb" fill className="object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Title, Rates & Quick Stats */}
        <div className="bg-card rounded-3xl border border-border/80 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border/60 pb-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Condition: {tool.condition.replace("_", " ")}
                </Badge>
                {tool.isAvailable ? (
                  <Badge variant="success" className="text-xs font-bold">
                    ✓ Available Today
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs font-bold">
                    In Use
                  </Badge>
                )}
              </div>
              <h1 className="font-oswald text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground">
                {tool.title}
              </h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand" /> Pickup Area:{" "}
                <span className="font-semibold text-foreground">{tool.pickupArea}</span>
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <div className="font-oswald text-3xl font-black text-brand tracking-tight">
                {formatCurrency(tool.ratePerDay)}
                <span className="text-xs font-normal text-muted-foreground"> / day</span>
              </div>
              {tool.deposit > 0 && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  + {formatCurrency(tool.deposit)} refundable deposit
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h2 className="font-oswald text-sm font-bold uppercase tracking-wider text-foreground">
              Equipment Overview
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {tool.description}
            </p>
          </div>

          {/* Specifications */}
          {tool.specs && Object.keys(tool.specs).length > 0 && (
            <div className="space-y-3 pt-2">
              <h2 className="font-oswald text-sm font-bold uppercase tracking-wider text-foreground">
                Technical Specifications
              </h2>
              <div className="grid grid-cols-2 gap-2.5">
                {Object.entries(tool.specs).map(([key, val]) => (
                  <div
                    key={key}
                    className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-border/60 text-xs flex flex-col justify-center"
                  >
                    <span className="text-muted-foreground text-[10px] font-medium uppercase">
                      {key}
                    </span>
                    <span className="font-bold text-foreground truncate">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sanitized Public Owner Information */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-border/60 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center font-oswald text-lg font-bold text-brand uppercase">
                {tool.owner.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-oswald font-bold text-sm text-foreground uppercase">
                    Host: {tool.owner.name}
                  </span>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                    Verified Host
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  ⭐ {tool.owner.rating.toFixed(1)} rating ({tool.owner.reviewsCount} completed rentals) • {tool.owner.city}
                </p>
              </div>
            </div>
            <div className="hidden sm:block text-right text-[11px] text-muted-foreground">
              <span className="text-emerald-500 font-bold block">15 min</span> avg response
            </div>
          </div>
        </div>

        {/* Security & Handover Verification Notice */}
        <div className="p-5 rounded-3xl bg-neutral-900 text-neutral-300 border border-neutral-800 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-400 font-oswald font-bold text-xs uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            <span>Important Handover Security Rule</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Scanning this physical QR tag verifies tool authenticity, specifications, and owner affiliation.
            <strong className="text-neutral-200"> Scanning this tag DOES NOT authorize release or pickup of the equipment.</strong> Equipment handover requires a confirmed rental reservation on ToolShare, safety checklist completion, and digital handover confirmation by both parties.
          </p>
        </div>

        {/* Dynamic Contextual Action / Booking CTAs */}
        <div className="bg-card rounded-3xl border border-border/80 p-6 space-y-4 shadow-xl">
          {isOwner ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-brand/10 border border-brand/20 text-xs font-semibold text-brand flex items-center gap-2">
                <Wrench className="w-4 h-4" /> You are the registered owner of this equipment.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link href={`/owner/tools/${tool.id}/edit`}>
                  <Button className="w-full bg-brand hover:bg-brand-hover text-white font-oswald uppercase tracking-wider font-bold rounded-2xl h-12">
                    Edit Tool Details
                  </Button>
                </Link>
                <Link href="/owner/tools">
                  <Button variant="outline" className="w-full rounded-2xl h-12 text-xs font-bold">
                    View Fleet Management
                  </Button>
                </Link>
              </div>
            </div>
          ) : user && user.role === "borrower" ? (
            <div className="space-y-3">
              <Link href={`/tools/${tool.id}`}>
                <Button
                  disabled={!tool.isAvailable || !tool.isPublished}
                  className="w-full bg-brand hover:bg-brand-hover text-white font-oswald uppercase tracking-wider font-bold rounded-2xl h-14 text-base shadow-xl shadow-brand/30 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Reserve This Equipment
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <p className="text-[11px] text-center text-muted-foreground">
                Zero charges until verified inspection during pickup.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <Link href={`/login?redirect=/tools/${tool.id}`}>
                <Button className="w-full bg-brand hover:bg-brand-hover text-white font-oswald uppercase tracking-wider font-bold rounded-2xl h-14 text-base shadow-xl shadow-brand/30 hover:scale-[1.01] transition-all flex items-center justify-center gap-2">
                  Sign In to Rent Equipment
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <span>New to ToolShare?</span>
                <Link href={`/register?role=borrower&redirect=/tools/${tool.id}`} className="text-brand font-bold hover:underline">
                  Create a Borrower Account
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
