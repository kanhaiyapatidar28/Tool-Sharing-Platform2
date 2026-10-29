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
} from "lucide-react";

export default function OwnerDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
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

  useEffect(() => {
    async function loadDashboardData() {
      if (!ownerEmail) return;
      try {
        setLoading(true);
        setError(null);

        const [toolsRes, bookingsRes, statsRes] = await Promise.all([
          fetch("/api/tools?ownerOnly=true"),
          fetch(`/api/bookings?userEmail=${encodeURIComponent(ownerEmail)}`),
          fetch(`/api/owner/stats?email=${encodeURIComponent(ownerEmail)}`),
        ]);

        const toolsData = await toolsRes.json();
        const bookingsData = await bookingsRes.json();
        const statsData = await statsRes.json();

        if (toolsData.success && toolsData.tools) {
          setTools(toolsData.tools);
        }
        if (bookingsData.success && bookingsData.bookings) {
          // Filter incoming bookings where current user is the owner
          const incoming = bookingsData.bookings.filter(
            (b: BookingItem) => (b.ownerEmail || "").toLowerCase() === ownerEmail.toLowerCase()
          );
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

    if (!authLoading) {
      loadDashboardData();
    }
  }, [ownerEmail, authLoading]);

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
      } else {
        alert(data.error || "Failed to update booking status");
      }
    } catch (e: any) {
      alert(e.message || "Network error updating booking status");
    }
  };

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

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/owner/tools/new">
            <Button className="bg-brand hover:bg-brand-hover text-white font-oswald uppercase tracking-wider text-xs sm:text-sm font-bold shadow-md shadow-brand/20">
              <PlusCircle className="w-4 h-4 mr-1.5" /> List New Tool
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Recent Incoming Bookings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-oswald text-xl font-bold uppercase tracking-tight text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand" /> Incoming Rental Requests
            </h2>
            <Link href="/owner/bookings" className="text-xs font-bold text-brand hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-card border border-border rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-3">
              <Calendar className="w-10 h-10 text-muted-foreground/60 mx-auto" />
              <p className="text-sm font-semibold text-foreground">No rental bookings yet</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                When borrowers request your tools or scan your QR stickers, bookings will appear here for your review and approval.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id || booking._id}
                  className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-brand/40 shadow-xs"
                >
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
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground line-clamp-1">{booking.toolTitle}</span>
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
                      <p className="text-xs text-muted-foreground">
                        Renter: <span className="font-semibold text-foreground">{booking.renterName}</span> ({booking.renterEmail})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Dates: {formatDate(booking.startDate)} → {formatDate(booking.endDate)} ({booking.totalDays} days)
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
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
                        className="h-8 px-2 text-xs"
                        title="Chat with borrower"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setHandoverQrBooking(booking)}
                        className="h-8 px-2 text-xs"
                        title="Handover verification QR"
                      >
                        <QrCode className="w-3.5 h-3.5 text-brand" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
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
              {tools.slice(0, 4).map((tool) => (
                <div
                  key={tool.id || tool._id}
                  className="bg-card border border-border rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs hover:border-brand/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-neutral-100 overflow-hidden relative shrink-0 border border-border">
                      <Image
                        src={tool.images?.[0] || "/assets/drill machine.png"}
                        alt={tool.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-foreground line-clamp-1">{tool.title}</h4>
                      <p className="text-[11px] text-muted-foreground font-semibold">
                        ₹{tool.ratePerDay}/day • {tool.pickupArea || tool.city}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${tool.isPublished !== false ? "bg-emerald-500" : "bg-neutral-400"}`} />
                        <span className="text-[10px] text-muted-foreground">
                          {tool.isPublished !== false ? "Published" : "Draft"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
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
              ))}
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
