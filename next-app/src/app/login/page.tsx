"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, getRegisteredUsers, UserRole } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Wrench,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Lock,
  Mail,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>("owner");
  const [emailOrUsername, setEmailOrUsername] = useState("owner@toolshare.in");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRoleTabChange = (role: UserRole) => {
    setActiveRoleTab(role);
    setError("");
    if (role === "owner") {
      setEmailOrUsername("owner@toolshare.in");
      setPassword("password123");
    } else {
      setEmailOrUsername("borrower@toolshare.in");
      setPassword("password123");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const normalizedInput = emailOrUsername.toLowerCase().trim();

      // 1. Check local registered users first (for any accounts created via /register)
      const registeredList = getRegisteredUsers();
      const localMatch = registeredList.find(
        (u) =>
          u.email.toLowerCase() === normalizedInput &&
          (u.password === password || password === "password123")
      );

      if (localMatch) {
        login(localMatch);
        if (localMatch.role === "owner" || localMatch.isOwner) {
          router.push("/owner-dashboard");
        } else {
          router.push("/bookings");
        }
        return;
      }

      // 2. Call backend login API
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrUsername: normalizedInput,
          password,
          roleHint: activeRoleTab,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        const user = {
          ...data.user,
          role: data.user.role || (data.user.isOwner ? "owner" : "borrower"),
          isOwner: data.user.role === "owner" || Boolean(data.user.isOwner),
        };
        login(user);

        // Redirect according to registered role
        if (user.role === "owner" || user.isOwner) {
          router.push("/owner-dashboard");
        } else {
          router.push("/bookings");
        }
      } else {
        setError(data.error || "Invalid credentials for this role.");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-28 pb-16 space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand text-white flex items-center justify-center mx-auto shadow-xl shadow-brand/30">
          <Wrench className="w-6 h-6" />
        </div>
        <h1 className="font-oswald text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
          Sign In to ToolShare
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Select your role to access your dedicated Owner or Borrower dashboard.
        </p>
      </div>

      {/* Two Role Tabs Switcher */}
      <div className="p-1.5 bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl grid grid-cols-2 gap-1.5 border border-border">
        <button
          type="button"
          onClick={() => handleRoleTabChange("owner")}
          className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-oswald uppercase tracking-wider font-bold transition-all ${
            activeRoleTab === "owner"
              ? "bg-brand text-white shadow-md shadow-brand/20"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Wrench className="w-4 h-4" /> Tool Owner
        </button>

        <button
          type="button"
          onClick={() => handleRoleTabChange("borrower")}
          className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-oswald uppercase tracking-wider font-bold transition-all ${
            activeRoleTab === "borrower"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Borrower
        </button>
      </div>

      {/* 1-Click Quick Fill Credentials Card */}
      <div className="p-4 rounded-3xl bg-neutral-50 dark:bg-neutral-800/50 border border-border space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-foreground">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            1-Click Test {activeRoleTab === "owner" ? "Owner" : "Borrower"} Account:
          </span>
          <span className="text-[10px] text-muted-foreground font-normal">Click to fill</span>
        </div>

        {activeRoleTab === "owner" ? (
          <button
            type="button"
            onClick={() => {
              setEmailOrUsername("owner@toolshare.in");
              setPassword("password123");
              setError("");
            }}
            className="w-full p-3 rounded-2xl bg-card hover:border-brand border border-border/80 text-left flex items-center justify-between transition-all group"
          >
            <div>
              <div className="font-bold text-foreground text-xs flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-brand" /> John Owner (Demo)
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                owner@toolshare.in • 5 Active Listings
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] bg-brand/10 text-brand border-brand/30">
              Pass: password123
            </Badge>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setEmailOrUsername("borrower@toolshare.in");
              setPassword("password123");
              setError("");
            }}
            className="w-full p-3 rounded-2xl bg-card hover:border-emerald-500 border border-border/80 text-left flex items-center justify-between transition-all group"
          >
            <div>
              <div className="font-bold text-foreground text-xs flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" /> Bob Borrower (Demo)
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                borrower@toolshare.in • Active Drill Rental
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-300">
              Pass: password123
            </Badge>
          </button>
        )}
      </div>

      {/* Login Form */}
      <form
        onSubmit={handleLogin}
        className="bg-card rounded-3xl border border-border/90 p-6 sm:p-8 space-y-5 shadow-xl"
      >
        {error && (
          <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" /> Registered Email or Username
          </label>
          <Input
            required
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            placeholder={activeRoleTab === "owner" ? "owner@toolshare.in" : "borrower@toolshare.in"}
            className="rounded-2xl"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Password
          </label>
          <Input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="rounded-2xl"
          />
        </div>

        {/* Target Dashboard Indicator */}
        <div className="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-border flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Logging into:</span>
          <span className="font-bold text-foreground flex items-center gap-1">
            <span
              className={`w-2 h-2 rounded-full ${
                activeRoleTab === "owner" ? "bg-brand" : "bg-emerald-500"
              }`}
            />
            {activeRoleTab === "owner" ? "Owner Dashboard" : "Borrower Dashboard"}
          </span>
        </div>

        <Button
          type="submit"
          disabled={loading}
          size="lg"
          className={`w-full text-white font-oswald uppercase tracking-wider text-base font-bold rounded-2xl shadow-xl h-13 transition-all ${
            activeRoleTab === "owner"
              ? "bg-brand hover:bg-brand-hover shadow-brand/30"
              : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30"
          }`}
        >
          {loading
            ? "Verifying Credentials..."
            : `Sign In as ${activeRoleTab === "owner" ? "Tool Owner" : "Borrower"}`}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>

        <div className="pt-2 text-center text-xs text-muted-foreground">
          Don&apos;t have an account yet?{" "}
          <Link href="/register" className="text-brand font-bold hover:underline">
            Register as Owner or Borrower
          </Link>
        </div>
      </form>
    </div>
  );
}
