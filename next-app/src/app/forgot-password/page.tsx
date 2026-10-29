"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KeyRound, Mail, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 700);
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-28 pb-16 space-y-8">
      <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-brand font-semibold">
        <ArrowLeft className="w-4 h-4" /> Back to Login
      </Link>

      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto shadow-md">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="font-oswald text-3xl font-black uppercase tracking-tight text-foreground">
          Reset Your Password
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Enter your registered email address to receive password reset instructions.
        </p>
      </div>

      <div className="bg-card rounded-3xl border border-border/80 p-6 sm:p-8 shadow-sm">
        {submitted ? (
          <div className="text-center space-y-4 py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="font-oswald text-xl font-bold uppercase text-foreground">
              Reset Link Sent
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If an account is associated with <strong>{email}</strong>, a secure one-time password reset link has been dispatched to your inbox.
            </p>
            <div className="pt-2">
              <Link href="/login">
                <Button variant="outline" className="w-full font-bold">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Account Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="pl-10 h-12 rounded-xl bg-background"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-brand hover:bg-brand-hover text-white font-oswald uppercase tracking-wider font-bold shadow-md shadow-brand/20 transition-all"
            >
              {loading ? "Sending..." : "Send Password Reset Link"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
