"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ToolItem, BookingItem, INITIAL_TOOLS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ToolQRModal from "@/components/ToolQRModal";
import RealTimeChatModal from "@/components/RealTimeChatModal";
import {
  Star,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  Heart,
  Zap,
  Info,
  Check,
  QrCode,
  X,
  Download,
  Wrench,
  Edit3,
  MessageSquare,
} from "lucide-react";

function getConditionVariant(cond: string): "success" | "info" | "secondary" | "warning" {
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
}

export default function ToolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const toolId = params.id as string;

  const initial = INITIAL_TOOLS.find((t) => t.id === toolId || t._id === toolId) || null;
  const [tool, setTool] = useState<ToolItem | null>(initial);
  const [loading, setLoading] = useState(!initial);
  const [selectedPhoto, setSelectedPhoto] = useState<string>(initial?.images?.[0] || "/assets/drill machine.png");

  // Tool QR modal state
  const [showToolQr, setShowToolQr] = useState(false);

  // Booking form state
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowStr = new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(tomorrowStr);
  const [initialMsg, setInitialMsg] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [createdBooking, setCreatedBooking] = useState<BookingItem | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    setBookingError("");
    if (val >= endDate) {
      const nextDay = new Date(new Date(val).getTime() + 86400000).toISOString().split("T")[0];
      setEndDate(nextDay);
    }
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    setBookingError("");
  };

  const isOwner = Boolean(
    user && tool && (
      (tool.ownerId && user.id === tool.ownerId) ||
      (tool.ownerEmail && user.email?.toLowerCase() === tool.ownerEmail?.toLowerCase()) ||
      (user.role === "owner" && tool.ownerName && user.name.toLowerCase() === tool.ownerName.toLowerCase())
    )
  );

  useEffect(() => {
    async function loadTool() {
      try {
        setLoading(true);
        const res = await fetch(`/api/tools/${toolId}`);
        const data = await res.json();
        if (data.tool) {
          setTool(data.tool);
          setSelectedPhoto(data.tool.images?.[0] || "/assets/drill machine.png");
        }
      } catch (err) {
        console.error("Error loading tool:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTool();
  }, [toolId]);

  // Price calculations
  const calculateDays = () => {
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, isNaN(diff) ? 1 : diff);
  };

  const totalDays = calculateDays();
  const dailyRate = tool?.ratePerDay || 0;
  const deposit = tool?.deposit || 0;
  const rentalFee = totalDays * dailyRate;
  const platformFee = Math.round(rentalFee * 0.05);
  const grandTotal = rentalFee + platformFee;

  const handleBooking = async () => {
    if (!tool) return;
    setBookingError("");

    const effectiveName = user ? user.name : guestName.trim();
    const effectiveEmail = user ? user.email : guestEmail.trim().toLowerCase();

    if (!user && (!effectiveName || !effectiveEmail || !effectiveEmail.includes("@"))) {
      setBookingError("Please sign in or enter your name and a valid email address to complete booking.");
      return;
    }

    setIsSubmitting(true);
    try {
      const idempotencyKey = `idem-${tool.id || tool._id}-${startDate}-${endDate}-${Date.now()}`;
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId: tool.id || tool._id,
          startDate,
          endDate,
          renterName: effectiveName,
          renterEmail: effectiveEmail,
          initialMsg: initialMsg || "Requesting rental for DIY home project.",
          idempotencyKey,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBookingSuccess(true);
        setCreatedBooking(data.booking);
        if (typeof window !== "undefined") {
          try {
            const bc = new BroadcastChannel("toolshare_booking_sync");
            bc.postMessage({ type: "NEW_BOOKING", booking: data.booking });
            bc.close();
            localStorage.setItem("toolshare_last_booking", JSON.stringify(data.booking));
            localStorage.setItem(
              "toolshare_booking_sync_event",
              JSON.stringify({
                type: "NEW_BOOKING",
                booking: data.booking,
                timestamp: Date.now(),
              })
            );

            // Also append to toolshare_custom_bookings so other tabs and owner dashboard load it immediately
            const rawCustom = localStorage.getItem("toolshare_custom_bookings");
            const customArr = rawCustom ? JSON.parse(rawCustom) : [];
            const exists = customArr.some((b: any) => b.id === data.booking.id || b._id === data.booking._id);
            if (!exists) {
              customArr.unshift(data.booking);
              localStorage.setItem("toolshare_custom_bookings", JSON.stringify(customArr.slice(0, 50)));
            }
          } catch {}
        }
      } else {
        setBookingError(data.error || "Could not complete booking. Please check dates.");
      }
    } catch (e: any) {
      setBookingError(e.message || "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="h-96 rounded-3xl bg-card border border-border animate-pulse" />
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 text-center space-y-4">
        <h2 className="font-oswald text-2xl font-bold uppercase text-foreground">
          Tool Not Found
        </h2>
        <Link href="/browse">
          <Button variant="default">Back to Browse Tools</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-28 pb-16 space-y-8">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/browse"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[11px] font-bold">
            {tool.category.replace("_", " ")}
          </Badge>
          <Badge variant="success" className="text-[11px] font-bold">
            {tool.condition.replace("_", " ")}
          </Badge>
        </div>
      </div>

      {/* Main Grid: Left Media & Specs / Right Booking Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Visual Showcase & Specifications */}
        <div className="lg:col-span-7 space-y-8">
          {/* Main Visual Box */}
          <div className="relative rounded-3xl bg-[#1A242B] text-white p-6 sm:p-8 overflow-hidden shadow-2xl border border-white/10 min-h-[440px] flex flex-col justify-between">
            {/* Top Bar: Badges and Location */}
            <div className="flex items-center justify-between z-20">
              <div className="flex items-center gap-2">
                <Badge variant={getConditionVariant(tool.condition)} className="text-xs font-bold uppercase tracking-wider">
                  {tool.condition.replace("_", " ")}
                </Badge>
                <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold backdrop-blur-md">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Quality Inspected
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-white/70 font-semibold flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                  <MapPin className="w-3.5 h-3.5 text-brand" /> {tool.city}
                </span>
              </div>
            </div>

            {/* Visual Viewport with Ambient Glow */}
            <div className="relative w-full h-[340px] sm:h-[380px] flex items-center justify-center my-4 group">
              <div className="absolute inset-8 rounded-full bg-brand/10 blur-3xl pointer-events-none group-hover:bg-brand/20 transition-all duration-500" />
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover:scale-105">
                <Image
                  src={selectedPhoto}
                  alt={tool.title}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Thumbnail Gallery & QR Serial Tag Action */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 z-20">
              {tool.images && tool.images.length > 1 ? (
                <div className="flex items-center gap-2 overflow-x-auto">
                  {tool.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedPhoto(img)}
                      className={`relative w-14 h-14 rounded-xl border-2 overflow-hidden bg-white/5 p-1 transition-all ${
                        selectedPhoto === img ? "border-brand scale-105 shadow-lg shadow-brand/20" : "border-white/15 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image src={img} alt="Thumb" fill className="object-contain" />
                    </button>
                  ))}
                </div>
              ) : <div />}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowToolQr(true)}
                className="text-xs font-bold rounded-xl border-white/20 bg-white/10 hover:bg-brand text-white transition-all ml-auto"
              >
                <QrCode className="w-3.5 h-3.5 mr-1.5 text-brand" /> Scan Real Tool QR
              </Button>
            </div>
          </div>

          {/* Description & Overview */}
          <div className="bg-card rounded-3xl border border-border/80 p-6 sm:p-8 space-y-4 shadow-sm">
            <h2 className="font-oswald text-2xl font-bold uppercase tracking-tight text-foreground">
              About This Equipment
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {tool.description}
            </p>

            {/* Safety & Guarantee Callout */}
            <div className="p-4 rounded-2xl bg-brand/5 border border-brand/20 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-brand shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold text-foreground block">
                  ToolShare Verified Quality Guarantee
                </span>
                <p className="text-muted-foreground leading-relaxed">
                  Every tool undergoes testing and safety checklist verification before handover. Backed by our ₹50,000 damage protection guarantee.
                </p>
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          {tool.specs && Object.keys(tool.specs).length > 0 && (
            <div className="bg-card rounded-3xl border border-border/80 p-6 sm:p-8 space-y-4 shadow-sm">
              <h2 className="font-oswald text-xl font-bold uppercase tracking-tight text-foreground">
                Technical Specifications
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(tool.specs).map(([k, v]) => (
                  <div
                    key={k}
                    className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-border/60 flex items-center justify-between text-xs"
                  >
                    <span className="text-muted-foreground font-medium">{k}</span>
                    <span className="font-bold text-foreground">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Owner Profile Card */}
          <div className="bg-card rounded-3xl border border-border/80 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-brand/20 relative shrink-0">
                <Image
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
                  alt={tool.ownerName}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-oswald text-lg font-bold uppercase text-foreground">
                    {tool.ownerName}
                  </h3>
                  <Badge variant="default" className="text-[9px] px-2">
                    Verified Host
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Member since 2024 • Response time: Under 15 mins
                </p>
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                  <span>5.0 (48 reviews)</span>
                </div>
              </div>
            </div>

            <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold">
              Message Owner
            </Button>
          </div>
        </div>

        {/* Right Column: Rental Calculator & Reservation Sidebar */}
        <div className="lg:col-span-5 sticky top-24 space-y-6">
          <div className="bg-card rounded-3xl border border-border/80 p-6 sm:p-8 space-y-6 shadow-xl">
            {/* Price Header */}
            <div className="flex items-baseline justify-between border-b border-border/60 pb-5">
              <div>
                <span className="font-oswald text-3xl font-black text-foreground tracking-tight">
                  {formatCurrency(tool.ratePerDay)}
                </span>
                <span className="text-xs font-normal text-muted-foreground"> / day</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                <span>{tool.rating.toFixed(1)}</span>
                <span className="text-muted-foreground font-normal">({tool.reviewsCount})</span>
              </div>
            </div>

            {/* Date Pickers */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Rental Duration
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-2xl bg-background border border-border">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Pickup Date
                  </span>
                  <input
                    type="date"
                    min={todayStr}
                    value={startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-foreground focus:outline-none mt-1"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-background border border-border">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Return Date
                  </span>
                  <input
                    type="date"
                    min={startDate}
                    value={endDate}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-foreground focus:outline-none mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Guest Borrower Inputs if not logged in */}
            {!user && (
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-border/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                    Borrower Details
                  </span>
                  <Link href="/login" className="text-[11px] text-brand hover:underline font-semibold">
                    Sign in instead
                  </Link>
                </div>
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-brand"
                />
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-brand"
                />
              </div>
            )}

            {/* Note to Owner */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Project Note (Optional)
              </label>
              <textarea
                value={initialMsg}
                onChange={(e) => setInitialMsg(e.target.value)}
                placeholder="Briefly describe what you're building (e.g. kitchen shelves, tile remodeling)..."
                rows={2}
                className="w-full rounded-2xl border border-input bg-background p-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:border-brand"
              />
            </div>

            {/* Pricing Breakdown Table */}
            <div className="space-y-2.5 pt-2 border-t border-border/60 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>
                  {formatCurrency(dailyRate)} × {totalDays} {totalDays === 1 ? "day" : "days"}
                </span>
                <span className="font-bold text-foreground">{formatCurrency(rentalFee)}</span>
              </div>

              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1">
                  Marketplace Service Fee (5%) <Info className="w-3 h-3 text-muted-foreground" />
                </span>
                <span className="font-bold text-foreground">{formatCurrency(platformFee)}</span>
              </div>

              {deposit > 0 && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Refundable Security Deposit (held safely during rental)</span>
                  <span className="font-bold">{formatCurrency(deposit)}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-border font-bold text-sm text-foreground">
                <span>Total Due Now</span>
                <span className="font-oswald text-xl text-brand font-black">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            {/* Booking Error Banner */}
            {bookingError && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs leading-relaxed font-medium">
                ⚠️ {bookingError}
              </div>
            )}

            {/* Booking Action / Modal State */}
            {isOwner ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Wrench className="w-4 h-4 text-brand" /> You are the owner of this equipment
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  As the owner, you cannot book your own listing. You can update this listing, toggle availability, or generate printable equipment QR stickers.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <Link href={`/owner/tools/${tool.id || tool._id}/edit`}>
                    <Button variant="default" size="sm" className="w-full font-bold">
                      <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit Listing
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowToolQr(true)}
                    className="w-full font-bold"
                  >
                    <QrCode className="w-3.5 h-3.5 mr-1.5" /> Print QR Tag
                  </Button>
                </div>
              </div>
            ) : !tool.isAvailable ? (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 space-y-2 text-center">
                <h4 className="font-oswald text-base font-bold uppercase">Equipment Unavailable</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This tool is currently rented or marked unavailable by the owner. Please check back later or explore similar equipment.
                </p>
                <Link href="/borrower/explore" className="block pt-1">
                  <Button variant="outline" size="sm" className="w-full font-bold">
                    Browse Other Tools
                  </Button>
                </Link>
              </div>
            ) : bookingSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 space-y-3 text-center">
                <Check className="w-8 h-8 mx-auto bg-emerald-500 text-white rounded-full p-1.5" />
                <h4 className="font-oswald text-lg font-bold uppercase">Rental Request Sent!</h4>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Your instant rental request for <strong className="text-foreground">{tool.title}</strong> has been sent to <strong className="text-foreground">{tool.ownerName}</strong> and is now visible under Incoming Bookings in their owner dashboard.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {createdBooking && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setShowChatModal(true)}
                      className="w-full font-bold bg-brand hover:bg-brand-hover text-white flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Chat with Owner
                    </Button>
                  )}
                  <Link href="/borrower/bookings" className="block w-full">
                    <Button variant="outline" size="sm" className="w-full font-bold">
                      View My Rentals
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <Button
                size="lg"
                onClick={handleBooking}
                disabled={isSubmitting}
                className="w-full bg-brand hover:bg-brand-hover text-white font-oswald uppercase tracking-wider text-sm font-bold rounded-2xl shadow-xl shadow-brand/30 hover:scale-[1.01]"
              >
                {isSubmitting ? "Confirming Reservation..." : "Instant Rent Equipment"}
              </Button>
            )}

            <p className="text-[11px] text-center text-muted-foreground">
              🔒 No charges until pickup inspection is verified by both parties.
            </p>
          </div>
        </div>
      </div>

      {/* Tool QR Sticker Modal */}
      {showToolQr && tool && (
        <ToolQRModal
          tool={tool}
          onClose={() => setShowToolQr(false)}
        />
      )}

      {/* Real-Time Peer-to-Peer Chat Modal */}
      {showChatModal && createdBooking && (
        <RealTimeChatModal
          booking={createdBooking}
          currentUser={user}
          onClose={() => setShowChatModal(false)}
        />
      )}
    </div>
  );
}
