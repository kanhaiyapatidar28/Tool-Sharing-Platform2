"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookingItem } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RealTimeChatModal from "@/components/RealTimeChatModal";
import RealQRCodeModal from "@/components/RealQRCodeModal";
import {
  Calendar,
  Clock,
  CheckCircle,
  MessageSquare,
  QrCode,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  ShoppingBag,
  Compass,
} from "lucide-react";

export default function BorrowerBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("ALL");

  // Modals
  const [chatBooking, setChatBooking] = useState<BookingItem | null>(null);
  const [handoverQrBooking, setHandoverQrBooking] = useState<BookingItem | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      if (!user) return;
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/bookings?userEmail=${encodeURIComponent(user.email)}`);
        const data = await res.json();
        if (res.ok && data.success && data.bookings) {
          // Filter rentals belonging to current borrower
          const myRentals = data.bookings.filter(
            (b: BookingItem) => (b.renterEmail || "").toLowerCase() === user.email.toLowerCase()
          );
          setBookings(myRentals);
        } else {
          setError(data.error || "Failed to load your rentals");
        }
      } catch (err: any) {
        setError(err.message || "Network error loading rentals");
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchBookings();
    }
  }, [user, authLoading]);

  const markReturned = async (id: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RETURNED" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id || b._id === id ? { ...b, status: "RETURNED" } : b))
        );
      } else {
        alert(data.error || "Failed to update return status");
      }
    } catch (e: any) {
      alert(e.message || "Network error updating return status");
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "ACTIVE") return ["PENDING", "CONFIRMED", "APPROVED", "RENTED"].includes(b.status);
    if (activeTab === "COMPLETED") return ["COMPLETED", "RETURNED"].includes(b.status);
    if (activeTab === "CANCELLED") return b.status === "CANCELLED";
    return true;
  });

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
        <ShoppingBag className="w-12 h-12 text-emerald-600 mx-auto" />
        <h2 className="text-2xl font-bold font-oswald uppercase">Authentication Required</h2>
        <p className="text-sm text-muted-foreground">Please sign in as a borrower to view your rental reservations.</p>
        <Link href="/login">
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <Link href="/borrower/dashboard">
            <Button variant="ghost" size="sm" className="text-xs font-semibold text-muted-foreground hover:text-foreground mb-1 p-0 h-auto">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-600 text-white text-[10px] uppercase font-bold tracking-wider">
              Borrower Rentals
            </Badge>
            <span className="text-xs text-muted-foreground">{bookings.length} Total Bookings</span>
          </div>
          <h1 className="font-oswald text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground mt-1">
            My Tool Bookings & Returns
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Track equipment pickup schedules, display handover QR codes to owners, and mark tool returns.
          </p>
        </div>

        <Link href="/borrower/explore">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-oswald uppercase tracking-wider text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20">
            <Compass className="w-4 h-4 mr-1.5" /> Rent More Tools
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border">
        {[
          { key: "ALL", label: `All Bookings (${bookings.length})` },
          { key: "ACTIVE", label: `Active Rentals (${bookings.filter((b) => ["PENDING", "CONFIRMED", "APPROVED", "RENTED"].includes(b.status)).length})` },
          { key: "COMPLETED", label: `Completed (${bookings.filter((b) => ["COMPLETED", "RETURNED"].includes(b.status)).length})` },
          { key: "CANCELLED", label: `Cancelled (${bookings.filter((b) => b.status === "CANCELLED").length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-card border border-border rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-12 text-center space-y-3 max-w-md mx-auto">
          <ShoppingBag className="w-12 h-12 text-muted-foreground/60 mx-auto" />
          <h3 className="font-oswald text-xl font-bold uppercase text-foreground">No Rentals Found</h3>
          <p className="text-xs text-muted-foreground">
            You don't have any tool bookings matching this filter.
          </p>
          <Link href="/borrower/explore">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs mt-2">
              Browse Community Tools
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id || booking._id}
              className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all hover:border-emerald-500/40"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-neutral-100 overflow-hidden relative shrink-0 border border-border">
                  <Image
                    src={booking.toolPhoto || "/assets/drill machine.png"}
                    alt={booking.toolTitle}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-oswald text-lg font-bold uppercase tracking-tight text-foreground line-clamp-1">
                      {booking.toolTitle}
                    </h3>
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

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      Owner: {booking.ownerName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      {formatDate(booking.startDate)} → {formatDate(booking.endDate)} ({booking.totalDays} days)
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Deposit Held: <strong className="text-foreground">₹{booking.deposit}</strong> • Daily Rate: ₹{booking.ratePerDay}/day
                  </p>
                </div>
              </div>

              {/* Price & Actions */}
              <div className="flex flex-wrap lg:flex-col items-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-border">
                <div className="text-right">
                  <span className="font-oswald text-2xl font-black text-foreground">
                    {formatCurrency(booking.totalPrice)}
                  </span>
                  <p className="text-[10px] text-muted-foreground">Total Paid (Includes 5% platform fee)</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {booking.status === "RENTED" && (
                    <Button
                      size="sm"
                      onClick={() => markReturned(booking.id || booking._id!)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-9 px-3"
                    >
                      <CheckCircle className="w-4 h-4 mr-1.5" /> Mark as Returned
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setChatBooking(booking)}
                    className="h-9 px-3 text-xs font-bold"
                  >
                    <MessageSquare className="w-4 h-4 mr-1.5 text-neutral-600" /> Chat Owner
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setHandoverQrBooking(booking)}
                    className="h-9 px-3 text-xs font-bold text-brand border-brand/30 hover:bg-brand/10"
                  >
                    <QrCode className="w-4 h-4 mr-1.5" /> Show Pickup QR
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
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
