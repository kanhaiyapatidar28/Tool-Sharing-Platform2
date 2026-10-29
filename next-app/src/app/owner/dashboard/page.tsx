"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ToolItem, BookingItem } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ToolQRModal from "@/components/ToolQRModal";
import RealTimeChatModal from "@/components/RealTimeChatModal";
import RealQRCodeModal from "@/components/RealQRCodeModal";
import {
  DollarSign,
  Package,
  Clock,
  PlusCircle,
  CheckCircle,
  XCircle,
  Calendar,
  ShieldCheck,
  MessageSquare,
  QrCode,
  ArrowRight,
  Wrench,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Filter,
  X,
  User,
} from "lucide-react";

export default function OwnerDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [selectedToolFilter, setSelectedToolFilter] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeRentals: 0,
    toolsListed: 0,
    pendingRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [qrModalTool, setQrModalTool] = useState<ToolItem | null>(null);
  const [chatBooking, setChatBooking] = useState<BookingItem | null>(null);
  const [handoverQrBooking, setHandoverQrBooking] = useState<BookingItem | null>(null);

  const ownerEmail = user?.email;

  async function loadDashboardData() {
    if (!ownerEmail) return;
    try {
      setLoading(true);
      setError(null);

      const [toolsRes, bookingsRes, statsRes] = await Promise.all([
        fetch("/api/tools?ownerOnly=true", { cache: "no-store" }),
        fetch(`/api/bookings?userEmail=${encodeURIComponent(ownerEmail)}`, { cache: "no-store" }),
        fetch(`/api/owner/stats?email=${encodeURIComponent(ownerEmail)}`, { cache: "no-store" }),
      ]);

      const toolsData = await toolsRes.json();
      const bookingsData = await bookingsRes.json();
      const statsData = await statsRes.json();

      if (toolsData.success && toolsData.tools) {
        let loadedTools: ToolItem[] = toolsData.tools;
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("toolshare_custom_tools");
            if (raw) {
              const custom: ToolItem[] = JSON.parse(raw);
              const matching = custom.filter((ct) => {
                const ctEmail = (ct.ownerEmail || "").toLowerCase();
                return (
                  ctEmail === ownerEmail.toLowerCase() ||
                  (ownerEmail.includes("john") && (ctEmail.includes("john") || ctEmail === "owner@toolshare.in")) ||
                  (ownerEmail.includes("alice") && ctEmail.includes("alice"))
                );
              });
              for (const ct of matching) {
                if (!loadedTools.some((t) => t.id === ct.id || t._id === ct.id || t.publicId === ct.publicId)) {
                  loadedTools = [ct, ...loadedTools];
                }
              }
            }
          } catch {}
        }
        setTools(loadedTools);
      }
      if (bookingsData.success && bookingsData.bookings) {
        // Robust owner filter: checks ownerEmail or known aliases
        const incoming = bookingsData.bookings.filter((b: BookingItem) => {
          const bEmail = (b.ownerEmail || "").toLowerCase().trim();
          const uEmail = ownerEmail.toLowerCase().trim();
          if (bEmail === uEmail) return true;
          if (
            uEmail.includes("john") &&
            (bEmail.includes("john") ||
              bEmail === "owner@toolshare.in" ||
              (b.ownerName || "").toLowerCase().includes("john"))
          ) {
            return true;
          }
          if (
            uEmail.includes("alice") &&
            (bEmail.includes("alice") ||
              (b.ownerName || "").toLowerCase().includes("alice"))
          ) {
            return true;
          }
          return false;
        });
        setBookings(incoming);
      }
      if (statsData.success && statsData.stats) {
        setStats(statsData.stats);
      }
    } catch (err: any) {
      console.error("Owner dashboard fetch failed:", err);
      setError("Failed to load dashboard metrics. Please refresh.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading) {
      loadDashboardData();
    }
  }, [ownerEmail, authLoading]);

  // Real-time synchronization across browser tabs (messages, new bookings, tools, status updates)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let chatChannel: BroadcastChannel | null = null;
    let bookingChannel: BroadcastChannel | null = null;
    let toolChannel: BroadcastChannel | null = null;

    try {
      chatChannel = new BroadcastChannel("toolshare_live_chat");
      chatChannel.onmessage = (event) => {
        const data = event.data;
        if (data && data.bookingId && data.message) {
          setBookings((prev) =>
            prev.map((b) => {
              if (b.id === data.bookingId || b._id === data.bookingId) {
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
          const uEmail = (ownerEmail || "").toLowerCase();
          const bEmail = (newB.ownerEmail || "").toLowerCase();
          const matches =
            bEmail === uEmail ||
            (uEmail.includes("john") &&
              (bEmail.includes("john") ||
                bEmail === "owner@toolshare.in" ||
                (newB.ownerName || "").toLowerCase().includes("john"))) ||
            (uEmail.includes("alice") &&
              (bEmail.includes("alice") ||
                (newB.ownerName || "").toLowerCase().includes("alice")));

          if (matches) {
            setBookings((prev) => {
              const exists = prev.some(
                (b) => b.id === newB.id || b._id === newB._id
              );
              if (exists) return prev;
              return [newB, ...prev];
            });
          }
        }
      };

      toolChannel = new BroadcastChannel("toolshare_tool_sync");
      toolChannel.onmessage = (event) => {
        const data = event.data;
        if (data?.type === "TOOL_CREATED" && data.tool) {
          const newT: ToolItem = data.tool;
          const uEmail = (ownerEmail || "").toLowerCase();
          const tEmail = (newT.ownerEmail || "").toLowerCase();
          const matches =
            tEmail === uEmail ||
            (uEmail.includes("john") && (tEmail.includes("john") || tEmail === "owner@toolshare.in")) ||
            (uEmail.includes("alice") && tEmail.includes("alice"));

          if (matches) {
            setTools((prev) => {
              const exists = prev.some((t) => t.id === newT.id || t._id === newT.id || t.publicId === newT.publicId);
              if (exists) return prev;
              return [newT, ...prev];
            });
            setStats((prev) => ({
              ...prev,
              toolsListed: prev.toolsListed + 1,
            }));
          }
        }
      };
    } catch (e) {
      console.warn("BroadcastChannel error:", e);
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "toolshare_tool_sync_event") {
        try {
          const parsed = JSON.parse(e.newValue || "{}");
          if (parsed?.type === "TOOL_CREATED" && parsed.tool) {
            const newT: ToolItem = parsed.tool;
            const uEmail = (ownerEmail || "").toLowerCase();
            const tEmail = (newT.ownerEmail || "").toLowerCase();
            const matches =
              tEmail === uEmail ||
              (uEmail.includes("john") && (tEmail.includes("john") || tEmail === "owner@toolshare.in")) ||
              (uEmail.includes("alice") && tEmail.includes("alice"));

            if (matches) {
              setTools((prev) => {
                const exists = prev.some((t) => t.id === newT.id || t._id === newT.id || t.publicId === newT.publicId);
                if (exists) return prev;
                return [newT, ...prev];
              });
              setStats((prev) => ({
                ...prev,
                toolsListed: prev.toolsListed + 1,
              }));
            }
          }
        } catch {}
      }

      if (e.key?.startsWith("toolshare_chat_sync_")) {
        try {
          const parsed = JSON.parse(e.newValue || "{}");
          if (parsed && parsed.bookingId && parsed.message) {
            setBookings((prev) =>
              prev.map((b) => {
                if (b.id === parsed.bookingId || b._id === parsed.bookingId) {
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
  }, [ownerEmail]);

  const updateBookingStatus = async (id: string, newStatus: BookingItem["status"]) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id || b._id === id ? { ...b, status: newStatus } : b))
        );
        // Broadcast change
        if (typeof window !== "undefined") {
          try {
            const ch = new BroadcastChannel("toolshare_booking_sync");
            ch.postMessage({ type: "STATUS_UPDATE", bookingId: id, status: newStatus });
            ch.close();
          } catch {}
        }
      } else {
        alert(data.error || "Failed to update booking status");
      }
    } catch (e: any) {
      alert(e.message || "Network error updating booking status");
    }
  };

  // Filtered bookings based on selected tool
  const displayedBookings = selectedToolFilter
    ? bookings.filter((b) => {
        const selectedTool = tools.find((t) => t.id === selectedToolFilter || t._id === selectedToolFilter);
        return (
          b.toolId === selectedToolFilter ||
          (selectedTool && b.toolTitle.toLowerCase() === selectedTool.title.toLowerCase())
        );
      })
    : bookings;

  const selectedToolObject = tools.find(
    (t) => t.id === selectedToolFilter || t._id === selectedToolFilter
  );

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-28 pb-16 min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-brand animate-spin" />
          <p className="text-sm font-semibold text-muted-foreground">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 pt-32 pb-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto">
          <Wrench className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold font-oswald uppercase text-foreground">Sign In Required</h2>
        <p className="text-sm text-muted-foreground">
          You must be logged in as an equipment owner to access the Owner Workspace.
        </p>
        <Link href="/login">
          <Button className="w-full bg-brand hover:bg-brand-hover text-white font-bold">
            Log In as Owner
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-brand text-white text-[10px] uppercase font-bold tracking-wider">
              Owner Dashboard
            </Badge>
            <span className="text-xs text-muted-foreground">Welcome back, {user.name}</span>
          </div>
          <h1 className="font-oswald text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground mt-1">
            Equipment Fleet & Earnings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your peer-to-peer rental fleet, approve incoming requests, and generate QR asset tags.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadDashboardData()}
            className="text-xs font-bold border-border"
            title="Refresh fleet and booking data"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin text-brand" : ""}`} /> Refresh
          </Button>
          <Link href="/owner/tools/new">
            <Button className="bg-brand hover:bg-brand-hover text-white font-oswald uppercase tracking-wider text-xs font-bold shadow-md shadow-brand/20">
              <PlusCircle className="w-4 h-4 mr-1.5" /> List New Equipment
            </Button>
          </Link>
          <Link href="/owner/tools">
            <Button variant="outline" className="text-xs font-bold border-border">
              <Package className="w-4 h-4 mr-1.5" /> Manage Tools ({tools.length})
            </Button>
          </Link>
          <Link href="/owner/bookings">
            <Button variant="outline" className="text-xs font-bold border-border">
              <Calendar className="w-4 h-4 mr-1.5" /> All Bookings ({bookings.length})
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-card rounded-2xl border border-border p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Earnings</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-oswald text-2xl sm:text-3xl font-black text-foreground">
              {formatCurrency(stats.totalEarnings)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Calculated from confirmed rentals</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Rentals</span>
            <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-oswald text-2xl sm:text-3xl font-black text-foreground">
              {stats.activeRentals}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Tools currently with borrowers</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fleet Listed</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-oswald text-2xl sm:text-3xl font-black text-foreground">
              {tools.length}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Published & draft tools</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Inquiries</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-oswald text-2xl sm:text-3xl font-black text-foreground">
              {bookings.filter((b) => b.status === "PENDING").length}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Awaiting your approval</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Incoming Bookings & Tool Fleet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2 Cols): Recent Incoming Bookings */}
        <div id="incoming-requests" className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-oswald text-xl font-bold uppercase tracking-tight text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand" /> Incoming Rental Requests
              </h2>
              <p className="text-xs text-muted-foreground">
                All requests submitted by borrowers for your tools appear here in real time.
              </p>
            </div>
            <Link href="/owner/bookings" className="text-xs font-bold text-brand hover:underline flex items-center gap-1 self-start sm:self-auto">
              View All ({bookings.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Interactive Tool Filter Bar */}
          {tools.length > 0 && (
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/40 border border-border/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-brand" /> Filter by Equipment:
                </span>
                {selectedToolFilter && (
                  <button
                    onClick={() => setSelectedToolFilter(null)}
                    className="text-[11px] text-brand hover:underline font-bold flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Show All Equipment
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedToolFilter(null)}
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    !selectedToolFilter
                      ? "bg-brand text-white shadow-xs"
                      : "bg-card border border-border text-foreground hover:border-brand/40"
                  }`}
                >
                  All Tools ({bookings.length})
                </button>
                {tools.map((t) => {
                  const count = bookings.filter(
                    (b) =>
                      b.toolId === t.id ||
                      b.toolId === t._id ||
                      b.toolTitle.toLowerCase() === t.title.toLowerCase()
                  ).length;
                  return (
                    <button
                      key={t.id || t._id}
                      onClick={() => setSelectedToolFilter(t.id || t._id!)}
                      className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        selectedToolFilter === (t.id || t._id)
                          ? "bg-brand text-white shadow-xs"
                          : "bg-card border border-border text-foreground hover:border-brand/40"
                      }`}
                    >
                      <span className="truncate max-w-[150px]">{t.title}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        selectedToolFilter === (t.id || t._id)
                          ? "bg-white/20 text-white"
                          : "bg-neutral-100 dark:bg-neutral-800 text-muted-foreground"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Filter Banner */}
          {selectedToolObject && (
            <div className="p-3 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-between text-xs">
              <span className="font-semibold text-brand flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" /> Showing requests for:{" "}
                <strong className="text-foreground">{selectedToolObject.title}</strong>
              </span>
              <button
                onClick={() => setSelectedToolFilter(null)}
                className="text-[11px] text-muted-foreground hover:text-foreground font-bold"
              >
                Clear filter
              </button>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-card border border-border rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : displayedBookings.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-3">
              <Calendar className="w-10 h-10 text-muted-foreground/60 mx-auto" />
              <p className="text-sm font-semibold text-foreground">
                {selectedToolFilter ? "No rental requests for this tool yet" : "No rental bookings yet"}
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {selectedToolFilter
                  ? "When a borrower requests this particular tool, the incoming request and chat will appear here."
                  : "When borrowers request your tools or scan your QR stickers, bookings will appear here for your review and approval."}
              </p>
              {selectedToolFilter && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedToolFilter(null)}
                  className="text-xs font-bold"
                >
                  View All Incoming Bookings
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {displayedBookings.slice(0, 8).map((booking) => {
                const latestMsg =
                  booking.messages && booking.messages.length > 0
                    ? booking.messages[booking.messages.length - 1]
                    : null;

                return (
                  <div
                    key={booking.id || booking._id}
                    className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex flex-col gap-3 transition-all hover:border-brand/40 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Tool & Renter Info */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-14 h-14 rounded-xl bg-neutral-100 overflow-hidden relative shrink-0 border border-border">
                          <Image
                            src={booking.toolPhoto || "/assets/drill machine.png"}
                            alt={booking.toolTitle}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-foreground line-clamp-1">
                              {booking.toolTitle}
                            </span>
                            <Badge
                              variant={
                                booking.status === "CONFIRMED" || booking.status === "APPROVED"
                                  ? "default"
                                  : booking.status === "RENTED"
                                  ? "info"
                                  : booking.status === "PENDING"
                                  ? "warning"
                                  : "outline"
                              }
                              className="text-[10px]"
                            >
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-brand" />
                            Renter: <span className="font-semibold text-foreground">{booking.renterName}</span> ({booking.renterEmail})
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                            Dates: {formatDate(booking.startDate)} → {formatDate(booking.endDate)} ({booking.totalDays} days)
                          </p>
                        </div>
                      </div>

                      {/* Financials & Status Actions */}
                      <div className="flex flex-wrap sm:flex-col items-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                        <span className="font-oswald text-lg font-bold text-foreground">
                          {formatCurrency(booking.totalPrice)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {booking.status === "PENDING" && (
                            <Button
                              size="sm"
                              onClick={() => updateBookingStatus(booking.id || booking._id!, "CONFIRMED")}
                              className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                            >
                              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                            </Button>
                          )}

                          {(booking.status === "CONFIRMED" || booking.status === "APPROVED") && (
                            <Button
                              size="sm"
                              onClick={() => updateBookingStatus(booking.id || booking._id!, "RENTED")}
                              className="h-8 px-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold"
                            >
                              Handover
                            </Button>
                          )}

                          {booking.status === "RENTED" && (
                            <Button
                              size="sm"
                              onClick={() => updateBookingStatus(booking.id || booking._id!, "COMPLETED")}
                              className="h-8 px-2.5 bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-bold"
                            >
                              Complete
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setChatBooking(booking)}
                            className="h-8 px-2 text-xs font-bold hover:border-brand/40"
                            title="Chat with borrower"
                          >
                            <MessageSquare className="w-3.5 h-3.5 mr-1 text-brand" />
                            Chat {booking.messages?.length ? `(${booking.messages.length})` : ""}
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setHandoverQrBooking(booking)}
                            className="h-8 px-2 text-xs font-bold border-brand/30 hover:bg-brand/10 text-brand"
                            title="Handover verification QR"
                          >
                            <QrCode className="w-3.5 h-3.5 mr-1" />
                            Pickup QR
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Live Interaction / Chat Message Snippet */}
                    {latestMsg ? (
                      <div className="p-3 rounded-xl bg-brand/5 border border-brand/20 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <MessageSquare className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                          <div className="text-xs min-w-0">
                            <span className="font-bold text-foreground">
                              Latest message from {latestMsg.senderName}:
                            </span>
                            <p className="text-muted-foreground italic truncate mt-0.5">
                              "{latestMsg.text}"
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setChatBooking(booking)}
                          className="text-[11px] text-brand hover:underline font-bold whitespace-nowrap self-center"
                        >
                          Reply in Chat →
                        </button>
                      </div>
                    ) : booking.initialMsg ? (
                      <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-border/60 text-xs text-muted-foreground italic">
                        Project note: "{booking.initialMsg}"
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Fleet Management & Quick QR */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-oswald text-xl font-bold uppercase tracking-tight text-foreground flex items-center gap-2">
              <Package className="w-5 h-5 text-brand" /> My Fleet Listings
            </h2>
            <Link href="/owner/tools" className="text-xs font-bold text-brand hover:underline flex items-center gap-1">
              All ({tools.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="h-48 bg-card border border-border rounded-2xl animate-pulse" />
          ) : tools.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-6 text-center space-y-3">
              <Wrench className="w-10 h-10 text-muted-foreground/60 mx-auto" />
              <p className="text-sm font-semibold text-foreground">No equipment listed yet</p>
              <Link href="/owner/tools/new">
                <Button size="sm" className="bg-brand text-white font-bold text-xs mt-2">
                  <PlusCircle className="w-3.5 h-3.5 mr-1" /> Add Your First Tool
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {tools.map((tool) => {
                const requestCount = bookings.filter(
                  (b) =>
                    b.toolId === tool.id ||
                    b.toolId === tool._id ||
                    b.toolTitle.toLowerCase() === tool.title.toLowerCase()
                ).length;
                const isSelected = selectedToolFilter === (tool.id || tool._id);

                return (
                  <div
                    key={tool.id || tool._id}
                    className={`bg-card border rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs transition-all ${
                      isSelected
                        ? "border-brand ring-2 ring-brand/20 bg-brand/5"
                        : "border-border hover:border-brand/40"
                    }`}
                  >
                    <div
                      onClick={() => {
                        setSelectedToolFilter(isSelected ? null : tool.id || tool._id!);
                        const el = document.getElementById("incoming-requests");
                        el?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                    >
                      <div className="w-12 h-12 rounded-xl bg-neutral-100 overflow-hidden relative shrink-0 border border-border">
                        <Image
                          src={tool.images?.[0] || "/assets/drill machine.png"}
                          alt={tool.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-foreground truncate">{tool.title}</h4>
                        <p className="text-[11px] text-muted-foreground font-semibold">
                          ₹{tool.ratePerDay}/day • {tool.pickupArea || tool.city}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={requestCount > 0 ? "default" : "outline"}
                            className="text-[9px] px-1.5 py-0"
                          >
                            {requestCount} {requestCount === 1 ? "Request" : "Requests"}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {tool.isPublished !== false ? "✓ Active" : "Draft"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setQrModalTool(tool)}
                        className="h-8 px-2 text-xs border-border text-brand hover:bg-brand/10"
                        title="View Equipment QR Tag"
                      >
                        <QrCode className="w-4 h-4" />
                      </Button>
                      <Link href={`/owner/tools/${tool.id || tool._id}/edit`}>
                        <Button size="sm" variant="ghost" className="h-8 px-2 text-xs">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {qrModalTool && (
        <ToolQRModal tool={qrModalTool} onClose={() => setQrModalTool(null)} />
      )}

      {chatBooking && (
        <RealTimeChatModal
          booking={chatBooking}
          currentUser={user}
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
