"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, saveRegisteredUser, UserRole } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Wrench,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  MapPin,
  Lock,
  Mail,
  User,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>("owner");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Register with backend API
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || email.split("@")[0],
          email,
          password,
          role: selectedRole,
          city,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Registration failed");
      }

      // Log in with authenticated user session returned by server
      login(data.user);

      // Role-based redirect to respective dashboard
      if (data.redirectUrl) {
        router.push(data.redirectUrl);
      } else if (selectedRole === "owner") {
        router.push("/owner/dashboard");
      } else {
        router.push("/borrower/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 pt-28 pb-16 space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand text-white flex items-center justify-center mx-auto shadow-xl shadow-brand/30">
          <Wrench className="w-6 h-6" />
        </div>
        <h1 className="font-oswald text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
          Create Your Account
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
          Choose your account type below. Your registered credentials grant instant access to your dedicated workspace.
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block text-center">
          Select Your Role
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Role 1: Tool Owner */}
          <button
            type="button"
            onClick={() => setSelectedRole("owner")}
            className={`p-5 rounded-3xl border-2 text-left transition-all duration-300 relative flex flex-col justify-between ${
              selectedRole === "owner"
                ? "bg-brand/5 border-brand shadow-xl shadow-brand/10 ring-2 ring-brand/20"
                : "bg-card border-border hover:border-neutral-300"
            }`}
          >
            {selectedRole === "owner" && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
            <div>
              <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-3">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="font-oswald text-lg font-bold uppercase tracking-tight text-foreground">
                Tool Owner
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                List equipment, approve rental requests, verify borrower QR codes, and earn monthly payouts.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px]">
              <span className="font-bold text-brand">Owner Dashboard</span>
              <Badge variant="outline" className="text-[10px] bg-brand/10 text-brand border-brand/30">
                Earn Income
              </Badge>
            </div>
          </button>

          {/* Role 2: Borrower */}
          <button
            type="button"
            onClick={() => setSelectedRole("borrower")}
            className={`p-5 rounded-3xl border-2 text-left transition-all duration-300 relative flex flex-col justify-between ${
              selectedRole === "borrower"
                ? "bg-emerald-500/5 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/20"
                : "bg-card border-border hover:border-neutral-300"
            }`}
          >
            {selectedRole === "borrower" && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="font-oswald text-lg font-bold uppercase tracking-tight text-foreground">
                Borrower
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Browse catalog, book tools from neighbors, generate instant pickup QR codes, and chat with owners.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px]">
              <span className="font-bold text-emerald-600">Borrower Dashboard</span>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-300">
                Save 70%
              </Badge>
            </div>
          </button>
        </div>
      </div>

      {/* Registration Form */}
      <form
        onSubmit={handleRegister}
        className="bg-card rounded-3xl border border-border/90 p-6 sm:p-8 space-y-5 shadow-xl"
      >
        {error && (
          <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Full Name
          </label>
          <Input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Vikram Verma"
            className="rounded-2xl"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" /> Email Address
          </label>
          <Input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vikram@example.com"
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
            placeholder="Create password (min 6 chars)"
            className="rounded-2xl"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> City / Locality
          </label>
          <Input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Mumbai, Pune, Bangalore"
            className="rounded-2xl"
          />
        </div>

        {/* Selected Role Confirmation Banner */}
        <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-border flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-foreground block">
              Registering as:{" "}
              <span className={selectedRole === "owner" ? "text-brand" : "text-emerald-600"}>
                {selectedRole === "owner" ? "Tool Owner (Host)" : "Borrower (Renter)"}
              </span>
            </span>
            <span className="text-[11px] text-muted-foreground">
              Direct access to {selectedRole === "owner" ? "Owner Dashboard" : "Borrower Rentals"}
            </span>
          </div>
          <Badge
            variant={selectedRole === "owner" ? "default" : "info"}
            className="uppercase text-[10px] font-bold"
          >
            {selectedRole}
          </Badge>
        </div>

        <Button
          type="submit"
          disabled={loading}
          size="lg"
          className="w-full bg-brand hover:bg-brand-hover text-white font-oswald uppercase tracking-wider text-base font-bold rounded-2xl shadow-xl shadow-brand/30 h-13"
        >
          {loading ? "Registering Account..." : `Complete ${selectedRole.toUpperCase()} Registration`}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>

        <div className="pt-2 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-brand font-bold hover:underline">
            Sign In Here
          </Link>
        </div>
      </form>
    </div>
  );
}
