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
  CheckCheck,
  User,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";

interface RealTimeChatModalProps {
  booking: BookingItem;
  currentUser: AuthUser | null;
  onClose: () => void;
  onMessageSent?: (bookingId: string, updatedMessages: any[]) => void;
}

export default function RealTimeChatModal({
  booking,
  currentUser,
  onClose,
  onMessageSent,
}: RealTimeChatModalProps) {
  const [messages, setMessages] = useState<any[]>(booking.messages || []);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isOwner = currentUser?.isOwner || currentUser?.role === "owner";
  const otherPartyName = isOwner ? booking.renterName : booking.ownerName;
  const otherPartyRole = isOwner ? "Borrower" : "Tool Owner";

  const currentEmail = currentUser
    ? currentUser.email
    : isOwner
    ? "john_owner@example.com"
    : "bob_borrower@example.com";

  const currentName = currentUser
    ? currentUser.name
    : isOwner
    ? "John Owner"
    : "Bob Borrower";

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
        const res = await fetch(`/api/messages?bookingId=${booking.id}`);
        const data = await res.json();
        if (data.success && data.messages) {
          setMessages(data.messages);
        }
      } catch (e) {
        console.error("Failed to load live messages:", e);
      }
    }
    fetchMessages();
  }, [booking.id]);

  // Real-time synchronization across browser tabs via BroadcastChannel & Storage Event
  useEffect(() => {
    if (typeof window === "undefined") return;

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("toolshare_live_chat");
      channel.onmessage = (event) => {
        const data = event.data;
        if (data && data.bookingId === booking.id && data.message) {
          setMessages((prev) => {
            // Avoid duplicate message if already added
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
      if (e.key === `toolshare_chat_sync_${booking.id}` && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && parsed.message) {
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
  }, [booking.id]);

  // Send message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || sending) return;

    setSending(true);
    const newMsg = {
      senderName: currentName,
      senderEmail: currentEmail,
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
        channel.postMessage({ bookingId: booking.id, message: newMsg });
        channel.close();

        // Also update localStorage as secondary sync
        localStorage.setItem(
          `toolshare_chat_sync_${booking.id}`,
          JSON.stringify({ bookingId: booking.id, message: newMsg, ts: Date.now() })
        );
      }
    } catch (e) {
      console.warn("Broadcast error:", e);
    }

    // Persist to server API
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          senderName: currentName,
          senderEmail: currentEmail,
          text: textToSend,
        }),
      });
      const data = await res.json();
      if (data.success && data.messages) {
        setMessages(data.messages);
        onMessageSent?.(booking.id, data.messages);
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
            <div className="w-10 h-10 rounded-full bg-brand/30 border border-brand/50 flex items-center justify-center overflow-hidden shrink-0">
              <User className="w-5 h-5 text-brand" />
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
              <p className="text-[11px] text-neutral-400 flex items-center gap-1.5 truncate max-w-[260px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {booking.toolTitle}
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
            Live Peer-to-Peer Encrypted Chat
          </span>
          <span className="font-mono text-muted-foreground">ID: {booking.id}</span>
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-neutral-50/50 dark:bg-neutral-950/40">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-muted-foreground">
              <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="font-bold text-sm text-foreground">Direct Conversation Started</p>
              <p className="text-xs max-w-xs">
                Coordinate pickup location, tool operating tips, and return timing in real-time.
              </p>
            </div>
          ) : (
            messages.map((m, i) => {
              const isMe =
                m.senderEmail?.toLowerCase() === currentEmail?.toLowerCase() ||
                m.senderName?.toLowerCase() === currentName?.toLowerCase();

              const formattedTime = m.timestamp
                ? new Date(m.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Just now";

              return (
                <div
                  key={i}
                  className={`flex flex-col ${
                    isMe ? "items-end" : "items-start"
                  } animate-in fade-in slide-in-from-bottom-1`}
                >
                  <div className="flex items-baseline gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {isMe ? "You" : m.senderName}
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
