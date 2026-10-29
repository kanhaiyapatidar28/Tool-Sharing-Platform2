import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Eye, FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Privacy Policy | ToolShare India",
  description: "Learn how ToolShare collects, protects, and handles your user data and equipment rental transactions.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-28 pb-16 space-y-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-brand font-semibold">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" /> Data Security & Compliance
        </div>
        <h1 className="font-oswald text-4xl sm:text-5xl font-black uppercase tracking-tight text-foreground">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Last updated: October 2026 • Effective for all ToolShare India members and equipment transactions.
        </p>
      </div>

      <div className="bg-card rounded-3xl border border-border/80 p-6 sm:p-10 shadow-sm space-y-8 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
        <section className="space-y-3">
          <h2 className="font-oswald text-xl font-bold uppercase text-foreground flex items-center gap-2">
            <Lock className="w-5 h-5 text-brand" /> 1. Overview & Commitment
          </h2>
          <p>
            ToolShare (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting the privacy and personal data of our tool owners and borrowers.
            This policy outlines how we collect, store, encrypt, and process information when you use the ToolShare platform, browse tool listings, or book equipment.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-oswald text-xl font-bold uppercase text-foreground flex items-center gap-2">
            <Eye className="w-5 h-5 text-brand" /> 2. Information We Collect
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Account Information:</strong> Name, verified email address, phone number, and city for profile creation and identity attribution.</li>
            <li><strong>Listing Data:</strong> Tool descriptions, equipment photos, specifications, rental rates, and pickup neighborhood locations.</li>
            <li><strong>Rental Handover Records:</strong> Booking dates, timestamps, return status, and dynamic ISO-18004 QR handover signatures.</li>
            <li><strong>Communications:</strong> Messages exchanged between owners and renters strictly related to tool handovers and project specifications.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-oswald text-xl font-bold uppercase text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand" /> 3. Data Storage & Security Safeguards
          </h2>
          <p>
            We implement industry-standard cryptographic practices:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>Passphrases are salted and hashed using high-iteration PBKDF2 algorithms before database persistence.</li>
            <li>Session cookies use <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-xs">HttpOnly</code>, <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-xs">SameSite=Lax</code>, and secure transmission flags.</li>
            <li>Exact street addresses are only revealed to confirmed renters once a booking has been approved and confirmed.</li>
            <li>We do not sell, rent, or monetize your personal information to third-party advertising networks.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-oswald text-xl font-bold uppercase text-foreground">
            4. Your Rights
          </h2>
          <p>
            You have the right to inspect, update, or request the deletion of your account profile and associated tool listings at any time by contacting our support team or visiting your <Link href="/profile" className="text-brand hover:underline font-semibold">User Profile</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
