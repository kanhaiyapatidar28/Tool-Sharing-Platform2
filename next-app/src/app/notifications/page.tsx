"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Calendar,
  AlertCircle,
  QrCode,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NotificationItem {
  id: string;
  type: "pickup" | "booking" | "deposit" | "alert";
  title: string;
  description: string;
  time: string;
  read: boolean;
  link?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    type: "pickup",
    title: "Equipment Pickup Tomorrow",
    description: "Your reservation for 'Bosch High Torque Impact Drill' begins tomorrow at 10:00 AM. Ensure your handover QR is ready.",
    time: "2 hours ago",
    read: false,
    link: "/bookings",
  },
  {
    id: "notif-2",
    type: "booking",
    title: "Rental Confirmed & Verified",
    description: "John Owner approved your booking request for the Bosch 18V Drill. Pickup neighborhood: Bandra West, Mumbai.",
    time: "Yesterday",
    read: false,
    link: "/bookings",
  },
  {
    id: "notif-3",
    type: "deposit",
    title: "Deposit Hold Released",
    description: "Your deposit of ₹1,500 for the Kärcher Pressure Washer was released after successful return inspection.",
    time: "3 days ago",
    read: true,
  },
  {
    id: "notif-4",
    type: "alert",
    title: "Community Safety Reminder",
    description: "Remember to wear safety glasses and test equipment triggers before operating circular saws or angle grinders.",
    time: "5 days ago",
    read: true,
    link: "/terms",
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "pickup":
        return <QrCode className="w-5 h-5 text-brand" />;
      case "booking":
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case "deposit":
        return <ShieldCheck className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 pt-28 pb-16 space-y-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-brand font-semibold">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold uppercase tracking-wider">
            <Bell className="w-3.5 h-3.5" /> Updates & Alerts
          </div>
          <h1 className="font-oswald text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground mt-1">
            Notifications Center
          </h1>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-center">
            <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs font-bold">
              Mark all read
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll} className="text-xs font-bold text-muted-foreground">
              Clear all
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-3xl border border-dashed border-border/80 p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-muted-foreground">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="font-oswald text-lg font-bold uppercase text-foreground">
              No Unread Notifications
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              You are all caught up! New handover updates and booking notifications will show up here.
            </p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                item.read
                  ? "bg-card border-border/60 opacity-80"
                  : "bg-card border-brand/40 shadow-sm ring-1 ring-brand/10"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                {getIcon(item.type)}
              </div>

              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-oswald text-sm font-bold uppercase text-foreground truncate">
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                {item.link && (
                  <div className="pt-2">
                    <Link
                      href={item.link}
                      className="text-xs font-bold text-brand hover:underline inline-flex items-center gap-1"
                    >
                      View Details <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
