"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookingItem } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RealQRCodeModal from "@/components/RealQRCodeModal";
import RealTimeChatModal from "@/components/RealTimeChatModal";
import {
  Calendar,
  Clock,
  QrCode,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Wrench,
  Sparkles,
} from "lucide-react";

export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQrModal, setActiveQrModal] = useState<BookingItem | null>(null);
  const [chatModalBooking, setChatModalBooking] = useState<BookingItem | null>(null);

  const email = user ? user.email : "borrower@toolshare.in";

  useEffect(() => {
    async function loadBookings() {
      try {
        setLoading(true);
        const res = await fetch(`/api/bookings?userEmail=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (data.bookings) {
          setBookings(data.bookings);
        }
      } catch (err) {
        console.error("Failed to load bookings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, [email]);

  const handleReturnTool = async (id: string) => {
    try {
      await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      setBookings((prev) =>
        prev.map((b) => (b.id === id || b._id === id ? { ...b, status: "COMPLETED" } : b))
      );
    } catch (e) {
      console.error("Return error:", e);
    }
  };

  const getStatusBadge = (status: BookingItem["status"]) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/40">
            ⏳ Pending Approval
          </Badge>
        );
      case "CONFIRMED":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50 dark:bg-blue-950/40">
            ✓ Ready for Pickup
          </Badge>
        );
      case "RENTED":
        return (
          <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 animate-pulse">
            ● Active Rental
          </Badge>
        );
      case "COMPLETED":
        return <Badge variant="success">✓ Completed & Returned</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-28 pb-16 space-y-8">
      {/* Role Notice Banner for Owners viewing Borrower dashboard */}
      {user?.isOwner && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-medium">
            <Wrench className="w-4 h-4 text-brand shrink-0" />
            <span>
              You are logged in with an <strong>Owner Account</strong> ({user.name}). You can switch to your Owner workspace anytime.
            </span>
          </div>
          <Link href="/owner-dashboard">
            <Button size="sm" variant="outline" className="text-xs font-bold border-amber-300 text-amber-800 dark:text-amber-200">
              Open Owner Dashboard <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 border-emerald-300">
              <ShoppingBag className="w-3 h-3 mr-1" /> Borrower Workspace
            </Badge>
            <span className="text-xs text-muted-foreground">• {user ? user.email : "borrower@toolshare.in"}</span>
          </div>
          <h1 className="font-oswald text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground mt-1">
            Borrower Rentals & QR Handover
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Track active tool handovers, show authentic pickup QR codes, and chat with owners in real time.
          </p>
        </div>

        <Link href="/browse">
          <Button variant="default" size="sm" className="font-bold bg-brand hover:bg-brand-hover text-white rounded-full px-5 shadow-md shadow-brand/20">
            + Rent Another Tool
          </Button>
        </Link>
      </div>

      {/* Bookings Feed */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-card border border-border animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-3xl border border-dashed border-border space-y-4">
          <div className="text-4xl">📦</div>
          <h3 className="font-oswald text-xl uppercase font-bold text-foreground">
            No Rentals Yet
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Ready to tackle a home repair or woodworking project? Browse tools in your neighborhood.
          </p>
          <Link href="/browse">
            <Button variant="default" size="sm" className="font-bold bg-brand text-white rounded-full px-6">
              Browse Tools Now
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-card rounded-3xl border border-border/80 p-6 shadow-sm hover:border-brand/40 transition-all flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
            >
              {/* Tool Image & Details */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-2 shrink-0 border border-border flex items-center justify-center overflow-hidden">
                  <Image
                    src={booking.toolPhoto || "/assets/drill machine.png"}
                    alt={booking.toolTitle}
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-oswald text-lg font-bold uppercase text-foreground">
                      {booking.toolTitle}
                    </h3>
                    {getStatusBadge(booking.status)}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Owner: <span className="font-semibold text-foreground">{booking.ownerName}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-brand" /> {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                    </span>
                    <span>•</span>
                    <span className="font-bold text-foreground">
                      {formatCurrency(booking.totalPrice)} ({booking.totalDays} days)
                    </span>
                    <span>•</span>
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Deposit: {formatCurrency(booking.deposit)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-border">
                {/* Real QR Handover Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveQrModal(booking)}
                  className="rounded-2xl text-xs font-bold border-brand/40 hover:bg-brand/10 text-brand flex items-center gap-1.5"
                >
                  <QrCode className="w-4 h-4 text-brand" /> Show Real QR
                </Button>

                {/* Real-time Chat with Owner */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setChatModalBooking(booking)}
                  className="rounded-2xl text-xs font-bold flex items-center gap-1.5 relative"
                >
                  <MessageSquare className="w-4 h-4 text-brand" />
                  Chat with Owner
                  {booking.messages && booking.messages.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-brand" />
                  )}
                </Button>

                {booking.status === "RENTED" && (
                  <Button
                    size="sm"
                    onClick={() => handleReturnTool(booking.id)}
                    className="rounded-2xl text-xs font-bold bg-neutral-900 hover:bg-black text-white"
                  >
                    Return Tool
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REAL QR Code Handover Modal */}
      {activeQrModal && (
        <RealQRCodeModal
          booking={activeQrModal}
          onClose={() => setActiveQrModal(null)}
        />
      )}

      {/* REAL-TIME Cross-Tab Chat Modal */}
      {chatModalBooking && (
        <RealTimeChatModal
          booking={chatModalBooking}
          currentUser={user}
          onClose={() => setChatModalBooking(null)}
          onMessageSent={(bookingId, updatedMessages) => {
            setBookings((prev) =>
              prev.map((b) =>
                b.id === bookingId || b._id === bookingId
                  ? { ...b, messages: updatedMessages }
                  : b
              )
            );
          }}
        />
      )}
    </div>
  );
}
