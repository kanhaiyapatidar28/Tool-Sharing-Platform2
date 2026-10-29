"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookingItem, ToolItem } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RealTimeChatModal from "@/components/RealTimeChatModal";
import RealQRCodeModal from "@/components/RealQRCodeModal";
import {
  Compass,
  ShoppingBag,
  CalendarCheck,
  Clock,
  Heart,
  ArrowRight,
  MessageSquare,
  QrCode,
  ShieldCheck,
  RefreshCw,
  Wrench,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function BorrowerDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [allTools, setAllTools] = useState<ToolItem[]>([]);
  const [recentTools, setRecentTools] = useState<ToolItem[]>([]);
  const [featuredTools, setFeaturedTools] = useState<ToolItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [chatBooking, setChatBooking] = useState<BookingItem | null>(null);
  const [handoverQrBooking, setHandoverQrBooking] = useState<BookingItem | null>(null);

  async function loadData() {
    if (!user) return;
    try {
      setLoading(true);
      const [bookingsRes, toolsRes] = await Promise.all([
        fetch(`/api/bookings?userEmail=${encodeURIComponent(user.email)}`, { cache: "no-store" }),
        fetch("/api/tools", { cache: "no-store" }),
      ]);

      const bookingsData = await bookingsRes.json();
      const toolsData = await toolsRes.json();

      if (bookingsData.success && bookingsData.bookings) {
        // Filter rentals where current user is renter
        const myRentals = bookingsData.bookings.filter(
          (b: BookingItem) => (b.renterEmail || "").toLowerCase() === user.email.toLowerCase()
        );
        setBookings(myRentals);
      }

      if (toolsData.success && toolsData.tools) {
        let loadedTools: ToolItem[] = toolsData.tools;
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
        setAllTools(loadedTools);

        // Sort by creation date descending so newly listed tools are prominent
        const byDate = [...loadedTools].sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        setRecentTools(byDate.slice(0, 4));

        const feat = loadedTools.filter((t) => t.featured);
        setFeaturedTools(feat.length > 0 ? feat.slice(0, 4) : byDate.slice(0, 4));
      }
    } catch (err) {
      console.error("Borrower dashboard data error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [user, authLoading]);

  // Real-time synchronization
  useEffect(() => {
    if (typeof window === "undefined") return;

    let chatChannel: BroadcastChannel | null = null;
    let bookingChannel: BroadcastChannel | null = null;
    let toolChannel: BroadcastChannel | null = null;

    try {
      chatChannel = new BroadcastChannel("toolshare_live_chat");
      chatChannel.onmessage = (event) => {
        const data = event.data;
        if (data && (data.bookingId || data.bookingAltId) && data.message) {
          setBookings((prev) =>
            prev.map((b) => {
              if (
                b.id === data.bookingId ||
                b._id === data.bookingId ||
                b.id === data.bookingAltId ||
                b._id === data.bookingAltId
              ) {
                const existing = b.messages || [];
                const already = existing.some(
                  (m) =>
                    m.text === data.message.text &&
                    m.timestamp === data.message.timestamp
                );
                return {
                  ...b,
                  messages: already ? existing : [...existing, data.message],
                };
              }
              return b;
            })
          );
        }
      };

      bookingChannel = new BroadcastChannel("toolshare_booking_sync");
      bookingChannel.onmessage = (event) => {
        const data = event.data;
        if (data?.type === "NEW_BOOKING" && data.booking) {
          const newB = data.booking;
          const uEmail = (user?.email || "bob_borrower@example.com").toLowerCase();
          const rEmail = (newB.renterEmail || "").toLowerCase();
          if (rEmail === uEmail || (!user && rEmail.includes("bob"))) {
            setBookings((prev) => {
              if (prev.some((b) => b.id === newB.id || b._id === newB._id)) return prev;
              return [newB, ...prev];
            });
          }
        }
        if (data?.type === "STATUS_UPDATE" && data.bookingId && data.status) {
          setBookings((prev) =>
            prev.map((b) =>
              b.id === data.bookingId || b._id === data.bookingId
                ? { ...b, status: data.status }
                : b
            )
          );
        }
      };

      toolChannel = new BroadcastChannel("toolshare_tool_sync");
      toolChannel.onmessage = (event) => {
        const data = event.data;
        if (data?.type === "TOOL_CREATED" && data.tool) {
          const newT: ToolItem = data.tool;
          setAllTools((prev) => {
            const exists = prev.some((t) => t.id === newT.id || t._id === newT.id || t.publicId === newT.publicId);
            return exists ? prev : [newT, ...prev];
          });
          setRecentTools((prev) => {
            const exists = prev.some((t) => t.id === newT.id || t._id === newT.id || t.publicId === newT.publicId);
            return exists ? prev : [newT, ...prev.slice(0, 3)];
          });
        }
      };
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "toolshare_booking_sync_event" || e.key === "toolshare_last_booking") {
        try {
          const parsed = JSON.parse(e.newValue || "{}");
          const newB: BookingItem = parsed.booking || parsed;
          if (newB && (newB.id || newB._id)) {
            const uEmail = (user?.email || "bob_borrower@example.com").toLowerCase();
            const rEmail = (newB.renterEmail || "").toLowerCase();
            if (rEmail === uEmail || (!user && rEmail.includes("bob"))) {
              setBookings((prev) => {
                if (prev.some((b) => b.id === newB.id || b._id === newB._id)) return prev;
                return [newB, ...prev];
              });
            }
          }
        } catch {}
      }

      if (e.key === "toolshare_tool_sync_event") {
        try {
          const parsed = JSON.parse(e.newValue || "{}");
          if (parsed?.type === "TOOL_CREATED" && parsed.tool) {
            const newT: ToolItem = parsed.tool;
            setAllTools((prev) => {
              const exists = prev.some((t) => t.id === newT.id || t._id === newT.id || t.publicId === newT.publicId);
              return exists ? prev : [newT, ...prev];
            });
            setRecentTools((prev) => {
              const exists = prev.some((t) => t.id === newT.id || t._id === newT.id || t.publicId === newT.publicId);
              return exists ? prev : [newT, ...prev.slice(0, 3)];
            });
          }
        } catch {}
      }

      if (e.key?.startsWith("toolshare_chat_sync_") || e.key === "toolshare_global_chat_sync") {
        try {
          const parsed = JSON.parse(e.newValue || "{}");
          if (parsed && (parsed.bookingId || parsed.bookingAltId) && parsed.message) {
            setBookings((prev) =>
              prev.map((b) => {
                if (
                  b.id === parsed.bookingId ||
                  b._id === parsed.bookingId ||
                  b.id === parsed.bookingAltId ||
                  b._id === parsed.bookingAltId
                ) {
                  const existing = b.messages || [];
                  const already = existing.some(
                    (m) =>
                      m.text === parsed.message.text &&
                      m.timestamp === parsed.message.timestamp
                  );
                  return {
                    ...b,
                    messages: already ? existing : [...existing, parsed.message],
                  };
                }
                return b;
              })
            );
          }
        } catch {}
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      chatChannel?.close();
      bookingChannel?.close();
      toolChannel?.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, [user]);

  const activeRentals = bookings.filter((b) => b.status === "RENTED" || b.status === "CONFIRMED" || b.status === "APPROVED");
  const completedRentals = bookings.filter((b) => b.status === "COMPLETED");

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-28 pb-16 min-h-[60vh] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 pt-32 pb-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold font-oswald uppercase text-foreground">Sign In Required</h2>
        <p className="text-sm text-muted-foreground">
          Log in with your borrower credentials to view your active tool rentals and reservations.
        </p>
        <Link href="/login">
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
            Sign In as Borrower
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-600 text-white text-[10px] uppercase font-bold tracking-wider">
              Borrower Dashboard
            </Badge>
            <span className="text-xs text-muted-foreground">Namaste, {user.name}</span>
          </div>
          <h1 className="font-oswald text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground mt-1">
            My Tool Rentals & Workspace
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Track your ongoing equipment rentals, communicate with tool owners, and explore local DIY hardware.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/borrower/explore">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-oswald uppercase tracking-wider text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20">
              <Compass className="w-4 h-4 mr-1.5" /> Explore Marketplace
            </Button>
          </Link>
          <Link href="/borrower/bookings">
            <Button variant="outline" className="text-xs font-bold border-border">
              <CalendarCheck className="w-4 h-4 mr-1.5" /> All Rentals ({bookings.length})
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-card rounded-2xl border border-border p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Rentals</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-oswald text-2xl sm:text-3xl font-black text-foreground">
              {activeRentals.length}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Currently rented or confirmed</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completed Projects</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-oswald text-2xl sm:text-3xl font-black text-foreground">
              {completedRentals.length}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Safely returned tools</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Bookings</span>
            <div className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-oswald text-2xl sm:text-3xl font-black text-foreground">
              {bookings.length}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Lifetime platform reservations</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Deposit Security</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-oswald text-2xl sm:text-3xl font-black text-emerald-600">
              100% Protected
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Escrow refund guaranteed</p>
          </div>
        </div>
      </div>

      {/* Ongoing Rentals Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-oswald text-xl font-bold uppercase tracking-tight text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" /> Current & Upcoming Rentals
          </h2>
          <Link href="/borrower/bookings" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
            View All ({bookings.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 bg-card border border-border rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : activeRentals.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-3">
            <Wrench className="w-10 h-10 text-muted-foreground/60 mx-auto" />
            <p className="text-sm font-semibold text-foreground">No active rentals right now</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Need equipment for a home improvement project or carpentry job? Browse hundreds of local tools ready for instant pickup.
            </p>
            <Link href="/borrower/explore">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs mt-2">
                <Compass className="w-3.5 h-3.5 mr-1" /> Explore Available Tools
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activeRentals.map((booking) => (
              <div
                key={booking.id || booking._id}
                className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:border-emerald-500/40 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-neutral-100 overflow-hidden relative shrink-0 border border-border">
                    <Image
                      src={booking.toolPhoto || "/assets/drill machine.png"}
                      alt={booking.toolTitle}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground line-clamp-1">{booking.toolTitle}</span>
                      <Badge className="bg-emerald-600 text-white text-[10px]">
                        {booking.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Owner: <span className="font-semibold text-foreground">{booking.ownerName}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Rental Period: {formatDate(booking.startDate)} → {formatDate(booking.endDate)} ({booking.totalDays} days)
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-col items-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                  <span className="font-oswald text-xl font-bold text-foreground">
                    {formatCurrency(booking.totalPrice)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setChatBooking(booking)}
                      className="h-8 px-2.5 text-xs font-bold"
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-1 text-neutral-600" /> Chat Owner
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setHandoverQrBooking(booking)}
                      className="h-8 px-2.5 text-xs font-bold text-brand border-brand/30 hover:bg-brand/10"
                    >
                      <QrCode className="w-3.5 h-3.5 mr-1" /> Handover QR
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fresh / Newly Listed Equipment Section */}
      {recentTools.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-oswald text-xl font-bold uppercase tracking-tight text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand" /> Newly Listed Equipment
              </h2>
              <p className="text-xs text-muted-foreground">
                Fresh gear recently added by equipment owners in your community.
              </p>
            </div>
            <Link href="/borrower/explore?sort=newest" className="text-xs font-bold text-brand hover:underline flex items-center gap-1">
              Explore All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentTools.map((t) => (
              <Link
                key={t.id || t._id}
                href={`/tools/${t.id || t._id}`}
                className="bg-card border border-border rounded-2xl p-3.5 shadow-xs hover:border-brand/60 transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="absolute top-2.5 right-2.5 z-10">
                  <Badge className="bg-brand text-white text-[9px] px-1.5 py-0 uppercase font-bold tracking-wider shadow-xs">
                    NEW
                  </Badge>
                </div>

                <div className="relative h-32 w-full bg-neutral-100 dark:bg-neutral-900 rounded-xl overflow-hidden mb-2.5 border border-border/50">
                  <Image
                    src={t.images?.[0] || "/assets/drill machine.png"}
                    alt={t.title}
                    fill
                    className="object-contain p-2 group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase">{t.category?.replace(/_/g, " ")}</span>
                  </div>
                  <h4 className="font-oswald text-xs font-bold uppercase text-foreground line-clamp-1 group-hover:text-brand transition-colors">
                    {t.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    By <span className="font-semibold text-foreground">{t.ownerName}</span>
                  </p>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
                    <span className="font-oswald font-black text-brand text-sm">₹{t.ratePerDay}/day</span>
                    <span className="text-[11px] text-muted-foreground">{t.pickupArea || t.city}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Featured Hardware Section */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <h2 className="font-oswald text-xl font-bold uppercase tracking-tight text-foreground flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-600" /> Popular in Community Catalog
          </h2>
          <Link href="/borrower/explore" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
            Browse All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featuredTools.map((t) => (
            <Link
              key={t.id || t._id}
              href={`/tools/${t.id || t._id}`}
              className="bg-card border border-border rounded-2xl p-3 shadow-xs hover:border-emerald-500/50 transition-all flex flex-col justify-between group"
            >
              <div className="relative h-28 w-full bg-neutral-100 rounded-xl overflow-hidden mb-2">
                <Image
                  src={t.images?.[0] || "/assets/drill machine.png"}
                  alt={t.title}
                  fill
                  className="object-contain p-2 group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="space-y-1">
                <h4 className="font-oswald text-xs font-bold uppercase text-foreground line-clamp-1">{t.title}</h4>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-emerald-600">₹{t.ratePerDay}/day</span>
                  <span className="text-muted-foreground">{t.pickupArea || t.city}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Modals */}
      {chatBooking && (
        <RealTimeChatModal
          booking={chatBooking}
          currentUser={user}
          currentUserRole="borrower"
          currentUserName={user?.name || "Bob Borrower"}
          currentUserEmail={user?.email || "bob_borrower@example.com"}
          onClose={() => setChatBooking(null)}
          onMessageSent={(bookingId, updatedMsgs) => {
            setBookings((prev) =>
              prev.map((b) =>
                b.id === bookingId || b._id === bookingId
                  ? { ...b, messages: updatedMsgs }
                  : b
              )
            );
          }}
        />
      )}

      {handoverQrBooking && (
        <RealQRCodeModal
          booking={handoverQrBooking}
          onClose={() => setHandoverQrBooking(null)}
        />
      )}
    </div>
  );
}
