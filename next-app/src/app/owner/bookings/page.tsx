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
  CheckCircle,
  MessageSquare,
  QrCode,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  DollarSign,
  User,
  Clock,
} from "lucide-react";

export default function OwnerBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("ALL");

  // Modals
  const [chatBooking, setChatBooking] = useState<BookingItem | null>(null);
  const [handoverQrBooking, setHandoverQrBooking] = useState<BookingItem | null>(null);

  useEffect(() => {
    async function loadBookings() {
      if (!user) return;
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/bookings?userEmail=${encodeURIComponent(user.email)}`);
        const data = await res.json();
        if (res.ok && data.success && data.bookings) {
          // Robust owner filter: checks ownerEmail or known aliases
          const incoming = data.bookings.filter((b: BookingItem) => {
            const bEmail = (b.ownerEmail || "").toLowerCase().trim();
            const uEmail = (user.email || "").toLowerCase().trim();
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
        } else {
          setError(data.error || "Failed to load bookings");
        }
      } catch (err: any) {
        setError(err.message || "Network error loading bookings");
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      loadBookings();
    }
  }, [user, authLoading]);

  // Real-time synchronization
  useEffect(() => {
    if (typeof window === "undefined") return;

    let chatChannel: BroadcastChannel | null = null;
    let bookingChannel: BroadcastChannel | null = null;

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
          const uEmail = (user?.email || "").toLowerCase();
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
    } catch {}

    const handleStorage = (e: StorageEvent) => {
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
      window.removeEventListener("storage", handleStorage);
    };
  }, [user]);

  const updateStatus = async (id: string, newStatus: BookingItem["status"]) => {
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
      alert(e.message || "Network error updating booking");
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "PENDING") return b.status === "PENDING";
    if (activeTab === "ACTIVE") return b.status === "CONFIRMED" || b.status === "APPROVED" || b.status === "RENTED";
    if (activeTab === "COMPLETED") return b.status === "COMPLETED" || b.status === "RETURNED";
    if (activeTab === "CANCELLED") return b.status === "CANCELLED";
    return true;
  });

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-28 pb-16 min-h-[60vh] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 pt-32 pb-16 text-center space-y-4">
        <Calendar className="w-12 h-12 text-brand mx-auto" />
        <h2 className="text-2xl font-bold font-oswald uppercase">Authentication Required</h2>
        <p className="text-sm text-muted-foreground">Please sign in as an owner to view your bookings.</p>
        <Link href="/login">
          <Button className="w-full bg-brand text-white font-bold">Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <Link href="/owner/dashboard">
            <Button variant="ghost" size="sm" className="text-xs font-semibold text-muted-foreground hover:text-foreground mb-1 p-0 h-auto">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Badge className="bg-brand text-white text-[10px] uppercase font-bold tracking-wider">
              Incoming Bookings
            </Badge>
            <span className="text-xs text-muted-foreground">{bookings.length} Total Requests</span>
          </div>
          <h1 className="font-oswald text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground mt-1">
            Rental Bookings & Handover
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Approve rental inquiries, chat directly with borrowers, and manage equipment pickup & returns.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border">
        {[
          { key: "ALL", label: `All (${bookings.length})` },
          { key: "PENDING", label: `Pending (${bookings.filter((b) => b.status === "PENDING").length})` },
          { key: "ACTIVE", label: `Active (${bookings.filter((b) => ["CONFIRMED", "APPROVED", "RENTED"].includes(b.status)).length})` },
          { key: "COMPLETED", label: `Completed (${bookings.filter((b) => ["COMPLETED", "RETURNED"].includes(b.status)).length})` },
          { key: "CANCELLED", label: `Cancelled (${bookings.filter((b) => b.status === "CANCELLED").length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? "bg-brand text-white shadow-xs"
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
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-card border border-border rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-12 text-center space-y-3 max-w-md mx-auto">
          <Calendar className="w-12 h-12 text-muted-foreground/60 mx-auto" />
          <h3 className="font-oswald text-xl font-bold uppercase text-foreground">No Bookings Found</h3>
          <p className="text-xs text-muted-foreground">
            There are no bookings matching the selected filter tab.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id || booking._id}
              className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all hover:border-brand/40"
            >
              {/* Tool & Renter Info */}
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
                    <span className="flex items-center gap-1 text-foreground font-semibold">
                      <User className="w-3.5 h-3.5 text-brand" /> {booking.renterName} ({booking.renterEmail})
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      {formatDate(booking.startDate)} → {formatDate(booking.endDate)} ({booking.totalDays} days)
                    </span>
                  </div>

                  {/* Live Chat Message Snippet */}
                  {booking.messages && booking.messages.length > 0 ? (
                    <div className="mt-2 p-2.5 rounded-xl bg-brand/5 border border-brand/20 flex items-start gap-2 text-xs">
                      <MessageSquare className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-foreground">
                          {booking.messages[booking.messages.length - 1].senderName}:
                        </span>{" "}
                        <span className="text-muted-foreground italic">
                          "{booking.messages[booking.messages.length - 1].text}"
                        </span>
                      </div>
                    </div>
                  ) : booking.initialMsg ? (
                    <p className="text-xs text-neutral-600 bg-neutral-50 dark:bg-neutral-900/50 p-2 rounded-xl italic line-clamp-1">
                      "{booking.initialMsg}"
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Financials & Actions */}
              <div className="flex flex-wrap lg:flex-col items-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-border">
                <div className="text-right">
                  <span className="font-oswald text-2xl font-black text-foreground">
                    {formatCurrency(booking.totalPrice)}
                  </span>
                  <p className="text-[10px] text-muted-foreground">
                    Base: ₹{booking.ratePerDay * booking.totalDays} + Fee • Deposit: ₹{booking.deposit}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {booking.status === "PENDING" && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(booking.id || booking._id!, "CONFIRMED")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-9 px-3"
                    >
                      <CheckCircle className="w-4 h-4 mr-1.5" /> Approve Rental
                    </Button>
                  )}

                  {(booking.status === "CONFIRMED" || booking.status === "APPROVED") && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(booking.id || booking._id!, "RENTED")}
                      className="bg-brand hover:bg-brand-hover text-white text-xs font-bold h-9 px-3"
                    >
                      Handover Tool
                    </Button>
                  )}

                  {booking.status === "RETURNED" && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(booking.id || booking._id!, "COMPLETED")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-9 px-3"
                    >
                      <CheckCircle className="w-4 h-4 mr-1.5" /> Confirm Return & Close
                    </Button>
                  )}

                  {booking.status === "RENTED" && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(booking.id || booking._id!, "COMPLETED")}
                      className="bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-bold h-9 px-3"
                    >
                      Complete Rental
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setChatBooking(booking)}
                    className="h-9 px-3 text-xs font-bold hover:border-brand/40"
                  >
                    <MessageSquare className="w-4 h-4 mr-1.5 text-brand" /> Chat {booking.messages?.length ? `(${booking.messages.length})` : ""}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setHandoverQrBooking(booking)}
                    className="h-9 px-3 text-xs font-bold text-brand border-brand/30 hover:bg-brand/10"
                  >
                    <QrCode className="w-4 h-4 mr-1.5" /> Handover QR
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
          currentUserRole="owner"
          currentUserName={user?.name || "John Owner"}
          currentUserEmail={user?.email || "owner@toolshare.in"}
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
