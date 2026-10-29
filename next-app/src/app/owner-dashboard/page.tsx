"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ToolItem, BookingItem } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RealTimeChatModal from "@/components/RealTimeChatModal";
import RealQRCodeModal from "@/components/RealQRCodeModal";
import {
  DollarSign,
  Package,
  Clock,
  PlusCircle,
  TrendingUp,
  CheckCircle,
  XCircle,
  Calendar,
  ExternalLink,
  ShieldCheck,
  MessageSquare,
  QrCode,
  ArrowRight,
  ShoppingBag,
  Wrench,
  Check,
  X,
} from "lucide-react";

export default function OwnerDashboardPage() {
  const { user, switchRole } = useAuth();
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [stats, setStats] = useState({
    totalEarnings: 8450,
    activeRentals: 3,
    toolsListed: 5,
    pendingRequests: 1,
  });
  const [loading, setLoading] = useState(true);

  // Modals
  const [chatBooking, setChatBooking] = useState<BookingItem | null>(null);
  const [qrModalBooking, setQrModalBooking] = useState<BookingItem | null>(null);
  const [verifyPinModal, setVerifyPinModal] = useState<BookingItem | null>(null);
  const [enteredPin, setEnteredPin] = useState("");
  const [pinSuccess, setPinSuccess] = useState(false);

  const ownerEmail = user ? user.email : "owner@toolshare.in";

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [toolsRes, bookingsRes, statsRes] = await Promise.all([
          fetch("/api/tools"),
          fetch(`/api/bookings?userEmail=${encodeURIComponent(ownerEmail)}`),
          fetch(`/api/owner/stats?email=${encodeURIComponent(ownerEmail)}`),
        ]);

        const toolsData = await toolsRes.json();
        const bookingsData = await bookingsRes.json();
        const statsData = await statsRes.json();

        if (toolsData.tools) {
          setTools(
            toolsData.tools.filter(
              (t: any) =>
                (t.ownerEmail && t.ownerEmail.toLowerCase() === ownerEmail.toLowerCase()) ||
                (user && t.ownerName.toLowerCase() === user.name.toLowerCase())
            )
          );
        }
        if (bookingsData.bookings) {
          setBookings(bookingsData.bookings);
        }
        if (statsData.stats) {
          setStats(statsData.stats);
        }
      } catch (e) {
        console.error("Owner data load failed:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [ownerEmail]);

  const updateStatus = async (id: string, newStatus: BookingItem["status"]) => {
    try {
      await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setBookings((prev) =>
        prev.map((b) => (b.id === id || b._id === id ? { ...b, status: newStatus } : b))
      );
    } catch (e) {
      console.error("Status update error:", e);
    }
  };

  const handleVerifyPin = async () => {
    if (!verifyPinModal) return;
    setPinSuccess(true);
    await updateStatus(verifyPinModal.id || verifyPinModal._id!, "RENTED");
    setTimeout(() => {
      setPinSuccess(false);
      setVerifyPinModal(null);
      setEnteredPin("");
    }, 1500);
  };

  const isBorrowerRole = user && !user.isOwner && user.role === "borrower";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-28 pb-16 space-y-8">
      {/* Role Protection Banner for Borrowers visiting Owner Dashboard */}
      {isBorrowerRole && (
        <div className="p-4 rounded-3xl bg-blue-500/10 border border-blue-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-medium">
            <ShoppingBag className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              You are logged in as a <strong>Borrower</strong> ({user.name}). Want to start listing equipment and earning payouts?
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => switchRole("owner")}
              className="text-xs font-bold bg-brand hover:bg-brand-hover text-white rounded-xl"
            >
              Switch to Owner Role
            </Button>
            <Link href="/bookings">
              <Button size="sm" variant="outline" className="text-xs font-bold border-blue-300">
                Go to Borrower Rentals <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-bold uppercase tracking-wider text-brand bg-brand/10 border-brand/30">
              <Wrench className="w-3 h-3 mr-1" /> Tool Owner Workspace
            </Badge>
            <span className="text-xs text-muted-foreground">• {user ? user.email : "owner@toolshare.in"}</span>
          </div>
          <h1 className="font-oswald text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground mt-1">
            Owner Dashboard & Inventory
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your equipment catalog, verify borrower handover QR codes, and chat with renters in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/list-tool">
            <Button size="sm" className="bg-brand hover:bg-brand-hover text-white font-oswald uppercase tracking-wider font-bold rounded-full px-5 shadow-lg shadow-brand/25">
              <PlusCircle className="w-4 h-4 mr-1.5" /> List New Equipment
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-3xl border border-border/80 p-5 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Total Payouts</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-oswald text-3xl font-black text-foreground">
            {formatCurrency(stats.totalEarnings)}
          </div>
          <div className="text-[11px] text-emerald-600 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3 h-3" /> +18% vs last month
          </div>
        </div>

        <div className="bg-card rounded-3xl border border-border/80 p-5 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Active Rentals</span>
            <Clock className="w-4 h-4 text-brand" />
          </div>
          <div className="font-oswald text-3xl font-black text-foreground">
            {stats.activeRentals}
          </div>
          <span className="text-[11px] text-muted-foreground">Currently with borrowers</span>
        </div>

        <div className="bg-card rounded-3xl border border-border/80 p-5 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Tools Listed</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <div className="font-oswald text-3xl font-black text-foreground">
            {stats.toolsListed}
          </div>
          <span className="text-[11px] text-muted-foreground">Available in locality</span>
        </div>

        <div className="bg-card rounded-3xl border border-border/80 p-5 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Protection Fund</span>
            <ShieldCheck className="w-4 h-4 text-brand" />
          </div>
          <div className="font-oswald text-3xl font-black text-foreground">
            ₹50,000
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">100% Guaranteed</span>
        </div>
      </div>

      {/* Pending / Active Rental Requests with REAL-TIME Chat & QR Verification */}
      <div className="bg-card rounded-3xl border border-border/80 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-oswald text-2xl font-bold uppercase tracking-tight text-foreground">
              Rental Requests & Live Chat
            </h3>
            <p className="text-xs text-muted-foreground">
              Approve reservations, verify handover QR codes, and chat directly with borrowers.
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-bold">
            {bookings.length} Total Records
          </Badge>
        </div>

        {bookings.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No booking requests at this moment. New requests from neighbors will appear here!
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div
                key={b.id || b._id}
                className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-border/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-xl bg-white dark:bg-neutral-900 p-1 shrink-0 border border-border flex items-center justify-center overflow-hidden">
                    <Image
                      src={b.toolPhoto || "/assets/drill machine.png"}
                      alt={b.toolTitle}
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-oswald text-base font-bold uppercase text-foreground">
                        {b.toolTitle}
                      </h4>
                      <Badge variant="secondary" className="text-[10px]">
                        {b.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Borrower: <strong className="text-foreground">{b.renterName}</strong> ({b.renterEmail})
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Calendar className="w-3 h-3 text-brand" />
                      {formatDate(b.startDate)} — {formatDate(b.endDate)} • Earnings: <strong className="text-foreground">{formatCurrency(b.totalPrice)}</strong>
                    </div>
                  </div>
                </div>

                {/* Actions: Chat with Borrower, Verify QR, Status Updates */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-border">
                  {/* Real-time Chat with Borrower Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setChatBooking(b)}
                    className="rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-brand" />
                    Chat with Borrower
                    {b.messages && b.messages.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-brand" />
                    )}
                  </Button>

                  {/* Real QR Inspection / Handover Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQrModalBooking(b)}
                    className="rounded-xl text-xs font-bold border-brand/40 text-brand flex items-center gap-1"
                  >
                    <QrCode className="w-3.5 h-3.5" /> View Handover QR
                  </Button>

                  {b.status === "CONFIRMED" && (
                    <Button
                      size="sm"
                      onClick={() => setVerifyPinModal(b)}
                      className="bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Verify & Handover
                    </Button>
                  )}

                  {b.status === "RENTED" && (
                    <Badge variant="outline" className="text-xs font-mono font-bold text-emerald-600 border-emerald-300 bg-emerald-50 py-1.5">
                      ● Tool In Use
                    </Badge>
                  )}

                  {b.status === "RETURNED" && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(b.id || b._id!, "COMPLETED")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                    >
                      Inspect & Release Deposit
                    </Button>
                  )}

                  <Link href={`/tools/${b.toolId}`}>
                    <Button variant="ghost" size="sm" className="text-xs">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Tools Inventory */}
      <div className="bg-card rounded-3xl border border-border/80 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-oswald text-2xl font-bold uppercase tracking-tight text-foreground">
              Equipment Inventory ({tools.length})
            </h3>
            <p className="text-xs text-muted-foreground">
              Your registered power equipment available for neighborhood rental.
            </p>
          </div>
          <Link href="/list-tool">
            <Button variant="outline" size="sm" className="font-bold text-xs rounded-xl">
              <PlusCircle className="w-3.5 h-3.5 mr-1 text-brand" /> Add Equipment
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl border border-border/80 p-4 space-y-3 flex flex-col justify-between hover:border-brand/40 transition-colors"
            >
              <div className="space-y-2">
                <div className="w-full h-36 rounded-xl bg-white dark:bg-neutral-900 p-2 border border-border flex items-center justify-center overflow-hidden">
                  <Image
                    src={tool.images?.[0] || "/assets/drill machine.png"}
                    alt={tool.title}
                    width={140}
                    height={140}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div>
                  <h4 className="font-oswald text-base font-bold uppercase text-foreground line-clamp-1">
                    {tool.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {tool.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <div>
                  <span className="font-oswald text-base font-black text-foreground">
                    {formatCurrency(tool.ratePerDay)}
                  </span>
                  <span className="text-[10px] text-muted-foreground"> /day</span>
                </div>
                <Link href={`/tools/${tool.id}`}>
                  <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold rounded-lg">
                    View Live <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* REAL-TIME Cross-Tab Chat Modal */}
      {chatBooking && (
        <RealTimeChatModal
          booking={chatBooking}
          currentUser={user}
          onClose={() => setChatBooking(null)}
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

      {/* REAL QR Code Modal */}
      {qrModalBooking && (
        <RealQRCodeModal
          booking={qrModalBooking}
          onClose={() => setQrModalBooking(null)}
        />
      )}

      {/* Handover Verification Dialog */}
      {verifyPinModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl border border-border p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand">
                Handover Verification
              </span>
              <button
                onClick={() => setVerifyPinModal(null)}
                className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="font-oswald text-xl font-bold uppercase text-foreground">
              Verify Borrower Handover
            </h3>

            <p className="text-xs text-muted-foreground">
              Scan borrower&apos;s dynamic QR code or enter their 4-digit security PIN shown on their screen.
            </p>

            <div className="space-y-2">
              <input
                type="text"
                maxLength={4}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="e.g. 8492"
                className="w-full text-center font-mono text-2xl tracking-widest font-black h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-border focus:border-brand focus:outline-none"
              />
            </div>

            {pinSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-bold flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" /> Handover Verified! Tool Marked In Use.
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVerifyPinModal(null)}
                className="flex-1 font-bold rounded-xl"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleVerifyPin}
                className="flex-1 bg-brand hover:bg-brand-hover text-white font-bold rounded-xl"
              >
                Confirm Pickup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
