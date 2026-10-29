"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Wrench,
  ShoppingBag,
  LogOut,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, login, logout, switchRole, loading } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "+91 98200 12345");
      setCity(user.city || "Mumbai");
    }
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-32 pb-16 text-center text-xs text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 pt-32 pb-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto">
          <UserIcon className="w-6 h-6" />
        </div>
        <h2 className="font-oswald text-2xl font-bold uppercase text-foreground">
          Sign In to View Profile
        </h2>
        <p className="text-xs text-muted-foreground">
          Please log in to manage your equipment listings, track rentals, and update contact information.
        </p>
        <Link href="/login">
          <Button variant="default" className="font-bold">
            Go to Login
          </Button>
        </Link>
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    login({
      ...user,
      name,
      phone,
      city,
    });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 pt-28 pb-16 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand uppercase tracking-wider">
            Account Management
          </span>
          <h1 className="font-oswald text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground mt-1">
            My ToolShare Profile
          </h1>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="text-xs font-bold text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/40 self-start sm:self-center"
        >
          <LogOut className="w-3.5 h-3.5 mr-1.5" /> Sign Out
        </Button>
      </div>

      {/* Profile Card */}
      <div className="bg-card rounded-3xl border border-border/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-border/60">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-brand/10 flex items-center justify-center overflow-hidden border-2 border-brand/20 shrink-0">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-8 h-8 text-brand" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-oswald text-2xl font-bold uppercase text-foreground">{user.name}</h2>
              <Badge variant={user.isOwner ? "default" : "info"} className="text-xs font-bold">
                {user.isOwner ? "Tool Owner" : "Borrower"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" /> {user.email}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand" /> {user.city || "Mumbai"} • Verified Member
            </p>
          </div>
        </div>

        {/* Verified Account Role */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-border/60 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Registered Role
            </span>
            <div className="flex items-center gap-2">
              <Badge variant={user.role === "owner" ? "default" : "info"} className="text-xs font-bold uppercase">
                {user.role === "owner" ? "Tool Owner (Host)" : "Borrower (Renter)"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                — Verified & secured by ToolShare auth
              </span>
            </div>
          </div>
          <Link href={user.role === "owner" ? "/owner/dashboard" : "/borrower/dashboard"}>
            <Button size="sm" variant="outline" className="text-xs font-bold rounded-xl">
              Go to Dashboard
            </Button>
          </Link>
        </div>

        {/* Contact Edit Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
          <h3 className="font-oswald text-lg font-bold uppercase text-foreground">
            Contact & Location Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Full Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-xl bg-background"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Primary Email</label>
              <Input value={user.email} disabled className="h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-muted-foreground" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Phone Number</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 rounded-xl bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">City / Neighborhood</label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-11 rounded-xl bg-background"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between">
            {savedMessage ? (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground">Information is shared only with confirmed rental partners.</span>
            )}

            <Button type="submit" variant="default" size="sm" className="font-bold">
              Save Changes
            </Button>
          </div>
        </form>

        {/* Navigation Quick Links */}
        <div className="pt-4 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {user.role === "owner" ? (
            <>
              <Link
                href="/owner/tools"
                className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/40 border border-border/60 hover:border-brand/40 transition-all flex items-center justify-between"
              >
                <div>
                  <h4 className="font-oswald text-sm font-bold uppercase text-foreground">My Tool Fleet</h4>
                  <p className="text-xs text-muted-foreground">Manage listings, edit tools & print QR tags</p>
                </div>
                <ArrowRight className="w-4 h-4 text-brand" />
              </Link>
              <Link
                href="/owner/bookings"
                className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/40 border border-border/60 hover:border-brand/40 transition-all flex items-center justify-between"
              >
                <div>
                  <h4 className="font-oswald text-sm font-bold uppercase text-foreground">Incoming Bookings</h4>
                  <p className="text-xs text-muted-foreground">Approve rentals and manage returns</p>
                </div>
                <ArrowRight className="w-4 h-4 text-brand" />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/borrower/bookings"
                className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/40 border border-border/60 hover:border-brand/40 transition-all flex items-center justify-between"
              >
                <div>
                  <h4 className="font-oswald text-sm font-bold uppercase text-foreground">My Rentals</h4>
                  <p className="text-xs text-muted-foreground">View pickup QR codes and active bookings</p>
                </div>
                <ArrowRight className="w-4 h-4 text-brand" />
              </Link>
              <Link
                href="/borrower/explore"
                className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/40 border border-border/60 hover:border-brand/40 transition-all flex items-center justify-between"
              >
                <div>
                  <h4 className="font-oswald text-sm font-bold uppercase text-foreground">Explore Marketplace</h4>
                  <p className="text-xs text-muted-foreground">Browse verified tools in your city</p>
                </div>
                <ArrowRight className="w-4 h-4 text-brand" />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
