"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { BookingItem } from "@/lib/constants";
import { AuthUser } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Send,
  Sparkles,
  User,
  MessageSquare,
} from "lucide-react";

interface RealTimeChatModalProps {
  booking: BookingItem;
  currentUser?: AuthUser | null;
  currentUserRole?: "owner" | "borrower";
  currentUserName?: string;
  currentUserEmail?: string;
  onClose: () => void;
  onMessageSent?: (bookingId: string, updatedMessages: any[]) => void;
}

export default function RealTimeChatModal({
  booking,
  currentUser,
  currentUserRole,
  currentUserName,
  currentUserEmail,
  onClose,
  onMessageSent,
}: RealTimeChatModalProps) {
  const [messages, setMessages] = useState<any[]>(booking.messages || []);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Determine if the current viewer is acting as the Owner or the Borrower
  const isOwner =
    currentUserRole === "owner" ||
    (!currentUserRole && (currentUser?.isOwner || currentUser?.role === "owner")) ||
    (typeof window !== "undefined" && window.location.pathname.startsWith("/owner")) ||
    Boolean(
      currentUserEmail &&
        booking.ownerEmail &&
        currentUserEmail.toLowerCase().trim() === booking.ownerEmail.toLowerCase().trim()
    ) ||
    Boolean(
      currentUser?.email &&
        booking.ownerEmail &&
        currentUser.email.toLowerCase().trim() === booking.ownerEmail.toLowerCase().trim()
    );

  const currentEmail =
    currentUserEmail ||
    currentUser?.email ||
    (isOwner
      ? (booking.ownerEmail || "owner@toolshare.in")
      : (booking.renterEmail || "bob_borrower@example.com"));

  const currentName =
    currentUserName ||
    currentUser?.name ||
    (isOwner
      ? (booking.ownerName || "John Owner")
      : (booking.renterName || "Bob Borrower"));

  const otherPartyName = isOwner
    ? (booking.renterName || "Borrower")
    : (booking.ownerName || "Tool Owner");

  const otherPartyRole = isOwner ? "Borrower" : "Tool Owner";

  const bId = booking.id || booking._id;
  const bAltId = booking._id || booking.id;

  // Helper to reliably identify if a message was sent by Owner vs Borrower
  const isMessageFromOwner = (m: any): boolean => {
    // 1. Explicit senderRole tag
    if (m.senderRole === "owner") return true;
    if (m.senderRole === "borrower") return false;

    // 2. Exact email matching against booking metadata
    const sEmail = (m.senderEmail || "").toLowerCase().trim();
    const bOwnerEmail = (booking.ownerEmail || "").toLowerCase().trim();
    const bRenterEmail = (booking.renterEmail || "").toLowerCase().trim();

    if (sEmail && bOwnerEmail && sEmail === bOwnerEmail) return true;
    if (sEmail && bRenterEmail && sEmail === bRenterEmail) return false;

    // 3. Known default email keywords
    if (sEmail.includes("owner") || sEmail.includes("john") || sEmail.includes("alice")) return true;
    if (sEmail.includes("borrower") || sEmail.includes("renter") || sEmail.includes("bob")) return false;

    // 4. Exact name matching
    const sName = (m.senderName || "").toLowerCase().trim();
    const bOwnerName = (booking.ownerName || "").toLowerCase().trim();
    const bRenterName = (booking.renterName || "").toLowerCase().trim();

    if (sName && bOwnerName && sName === bOwnerName) return true;
    if (sName && bRenterName && sName === bRenterName) return false;
    if (sName.includes("owner") || sName.includes("john")) return true;
    if (sName.includes("borrower") || sName.includes("bob")) return false;

    // 5. Booking initial message is always sent by the borrower
    if (booking.initialMsg && m.text && m.text.trim() === booking.initialMsg.trim()) {
      return false;
    }

    return false;
  };

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial fetch from API
  useEffect(() => {
    async function fetchMessages() {
      try {
        const targetId = bId || "";
        const res = await fetch(
          `/api/messages?bookingId=${encodeURIComponent(targetId)}&userEmail=${encodeURIComponent(
            currentEmail
          )}`
        );
        const data = await res.json();
        if (data.success && data.messages) {
          setMessages(data.messages);
        }
      } catch (e) {
        console.error("Failed to load live messages:", e);
      }
    }
    fetchMessages();
  }, [bId, currentEmail]);

  // Real-time synchronization across browser tabs via BroadcastChannel & Storage Event
  useEffect(() => {
    if (typeof window === "undefined") return;

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("toolshare_live_chat");
      channel.onmessage = (event) => {
        const data = event.data;
        if (
          data &&
          data.message &&
          (data.bookingId === bId ||
            data.bookingId === bAltId ||
            data.bookingAltId === bId ||
            data.bookingAltId === bAltId)
        ) {
          setMessages((prev) => {
            const exists = prev.some(
              (m) =>
                m.text === data.message.text &&
                m.timestamp === data.message.timestamp
            );
            if (exists) return prev;
            return [...prev, data.message];
          });
        }
      };
    } catch (e) {
      console.warn("BroadcastChannel not supported:", e);
    }

    const handleStorage = (e: StorageEvent) => {
      if (
        (e.key === `toolshare_chat_sync_${bId}` ||
          (bAltId && e.key === `toolshare_chat_sync_${bAltId}`) ||
          e.key === "toolshare_global_chat_sync") &&
        e.newValue
      ) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (
            parsed &&
            parsed.message &&
            (parsed.bookingId === bId ||
              parsed.bookingId === bAltId ||
              parsed.bookingAltId === bId ||
              parsed.bookingAltId === bAltId)
          ) {
            setMessages((prev) => {
              const exists = prev.some(
                (m) =>
                  m.text === parsed.message.text &&
                  m.timestamp === parsed.message.timestamp
              );
              if (exists) return prev;
              return [...prev, parsed.message];
            });
          }
        } catch (err) {
          // ignore
        }
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      channel?.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, [bId, bAltId]);

  // Send message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || sending) return;

    setSending(true);
    const newMsg = {
      senderName: currentName,
      senderEmail: currentEmail,
      senderRole: isOwner ? ("owner" as const) : ("borrower" as const),
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    // Optimistically update local state immediately
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInput("");

    // Broadcast across tabs in real-time
    try {
      if (typeof window !== "undefined") {
        const channel = new BroadcastChannel("toolshare_live_chat");
        channel.postMessage({
          bookingId: bId,
          bookingAltId: bAltId,
          toolTitle: booking.toolTitle,
          message: newMsg,
        });
        channel.close();

        // Also update localStorage as secondary sync
        const payload = JSON.stringify({
          bookingId: bId,
          bookingAltId: bAltId,
          toolTitle: booking.toolTitle,
          message: newMsg,
          ts: Date.now(),
        });
        if (bId) localStorage.setItem(`toolshare_chat_sync_${bId}`, payload);
        if (bAltId && bAltId !== bId)
          localStorage.setItem(`toolshare_chat_sync_${bAltId}`, payload);
        localStorage.setItem("toolshare_global_chat_sync", payload);
      }
    } catch (e) {
      console.warn("Broadcast error:", e);
    }

    if (onMessageSent && bId) {
      onMessageSent(bId, updatedMessages);
    }

    // Persist to server API
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: bId,
          senderName: currentName,
          senderEmail: currentEmail,
          senderRole: isOwner ? "owner" : "borrower",
          text: textToSend,
        }),
      });
      const data = await res.json();
      if (data.success && data.messages) {
        setMessages(data.messages);
        if (onMessageSent && bId) {
          onMessageSent(bId, data.messages);
        }
      }
    } catch (e) {
      console.error("Message send failed:", e);
    } finally {
      setSending(false);
    }
  };

  // Role-specific quick suggested chips
  const quickChips = isOwner
    ? [
        "Yes, tool is fully charged & ready!",
        "Available for pickup at my address anytime.",
        "Please have your Handover QR code ready.",
        "Inspection passed! All accessories returned safely.",
      ]
    : [
        "Hi! Picking up the equipment in 15 minutes.",
        "Does this tool include the battery charger?",
        "Where should we meet for the handover?",
        "All work finished, returning tool in great condition!",
      ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-card rounded-3xl border border-border/90 flex flex-col max-w-lg w-full h-[580px] shadow-2xl overflow-hidden relative">
        {/* Chat Header */}
        <div className="p-4 bg-neutral-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-neutral-800 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 relative">
              {booking.toolPhoto ? (
                <Image
                  src={booking.toolPhoto}
                  alt={booking.toolTitle}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-brand/20 flex items-center justify-center text-brand">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-oswald text-base font-bold uppercase tracking-wide">
                  {otherPartyName}
                </h3>
                <Badge
                  variant="outline"
                  className="text-[9px] uppercase tracking-wider font-bold py-0 h-4 border-brand/40 text-brand bg-brand/10"
                >
                  {otherPartyRole}
                </Badge>
              </div>
              <p className="text-[11px] text-neutral-300 font-semibold flex items-center gap-1.5 truncate max-w-[260px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="truncate">Equipment: {booking.toolTitle}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real-time Indicator banner */}
        <div className="bg-orange-500/10 border-b border-brand/20 px-4 py-1.5 flex items-center justify-between text-[10px] text-brand font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Real-Time Live Chat &bull; {booking.toolTitle}
          </span>
          <span className="font-mono text-muted-foreground text-[9px]">
            ID: {bId}
          </span>
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-neutral-50/50 dark:bg-neutral-950/40">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-muted-foreground">
              <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="font-bold text-sm text-foreground">
                Direct Conversation Started
              </p>
              <p className="text-xs max-w-xs">
                Coordinate pickup location, tool operating tips, and return
                timing in real-time.
              </p>
            </div>
          ) : (
            messages.map((m, i) => {
              const msgFromOwner = isMessageFromOwner(m);
              // For Owner viewer: Owner messages are "Me" (right), Borrower messages are "Other" (left)
              // For Borrower viewer: Borrower messages are "Me" (right), Owner messages are "Other" (left)
              const isMe = isOwner ? msgFromOwner : !msgFromOwner;

              const formattedTime = m.timestamp
                ? new Date(m.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Just now";

              const senderLabel = isMe
                ? "You"
                : msgFromOwner
                ? (booking.ownerName || "Owner")
                : (booking.renterName || "Borrower");

              return (
                <div
                  key={i}
                  className={`flex flex-col ${
                    isMe ? "items-end" : "items-start"
                  } animate-in fade-in slide-in-from-bottom-1`}
                >
                  <div className="flex items-baseline gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {senderLabel}
                    </span>
                    <span className="text-[9px] text-muted-foreground/70">
                      {formattedTime}
                    </span>
                  </div>

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-sm leading-relaxed ${
                      isMe
                        ? "bg-brand text-white rounded-br-none"
                        : "bg-white dark:bg-neutral-800 text-foreground border border-border/80 rounded-bl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggested Replies */}
        <div className="px-3 pt-2 bg-card border-t border-border/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-muted-foreground shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Quick:
          </span>
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(chip)}
              className="text-[10px] font-medium whitespace-nowrap px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-brand hover:text-white border border-border/80 text-foreground transition-all shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-card border-t border-border flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={`Message ${otherPartyName}...`}
            className="flex-1 rounded-full text-xs h-10 px-4 bg-neutral-100 dark:bg-neutral-800 border-none focus-visible:ring-1 focus-visible:ring-brand"
          />
          <Button
            size="sm"
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || sending}
            className="rounded-full w-10 h-10 p-0 bg-brand hover:bg-brand-hover text-white shadow-md shadow-brand/30 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
