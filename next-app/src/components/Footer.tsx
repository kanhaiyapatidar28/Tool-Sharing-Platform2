import React from "react";
import Link from "next/link";
import { Wrench, ShieldCheck, CheckCircle2, Lock, Sparkles, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1A242B] text-white/80 pt-16 pb-12 border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="font-oswald text-xl uppercase tracking-wider text-white font-bold">
                Household Tools
              </span>
            </Link>
            <p className="text-xs text-white/60 leading-relaxed">
              India&apos;s premier peer-to-peer equipment & tool rental platform. Built with Next.js, MongoDB, and Tailwind CSS.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs font-semibold text-white/80 bg-white/5 border border-white/10 px-3 py-1 rounded-full flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-brand" /> ₹50,000 Tool Protection
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-oswald uppercase text-sm tracking-wider text-white font-bold">
              Explore Tools
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/browse?category=POWER_TOOLS" className="hover:text-brand transition-colors">
                  ⚡ Power Tools & Drills
                </Link>
              </li>
              <li>
                <Link href="/browse?category=WOODWORKING" className="hover:text-brand transition-colors">
                  🪵 Woodworking Saws & Sanders
                </Link>
              </li>
              <li>
                <Link href="/browse?category=GARDEN" className="hover:text-brand transition-colors">
                  🌿 Garden & Chainsaws
                </Link>
              </li>
              <li>
                <Link href="/browse?category=CLEANING" className="hover:text-brand transition-colors">
                  🧹 High Pressure Washers
                </Link>
              </li>
              <li>
                <Link href="/browse?category=HEAVY_EQUIPMENT" className="hover:text-brand transition-colors">
                  🏗️ Ladders & Tile Cutters
                </Link>
              </li>
            </ul>
          </div>

          {/* For Tool Owners */}
          <div className="space-y-3">
            <h4 className="font-oswald uppercase text-sm tracking-wider text-white font-bold">
              For Tool Owners
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/list-tool" className="hover:text-brand transition-colors flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> List Your Tool
                </Link>
              </li>
              <li>
                <Link href="/owner-dashboard" className="hover:text-brand transition-colors">
                  Owner Dashboard & Earnings
                </Link>
              </li>
              <li>
                <span className="text-white/40 cursor-default">Damage Protection Guarantee</span>
              </li>
              <li>
                <span className="text-white/40 cursor-default">Owner Community Guidelines</span>
              </li>
            </ul>
          </div>

          {/* Trust & Guarantee */}
          <div className="space-y-3">
            <h4 className="font-oswald uppercase text-sm tracking-wider text-white font-bold">
              Security & Verification
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-white/70">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Escrow Secured Deposits</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Aadhaar & OTP Verified Members</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <ShieldCheck className="w-3.5 h-3.5 text-brand" />
                <span>QR Handover Verification</span>
              </div>
            </div>
            <div className="pt-2 text-[11px] text-white/50">
              📍 Mumbai • Pune • Bangalore • Delhi NCR
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-4">
          <p>© {new Date().getFullYear()} Household Tools Inc. Made with <Heart className="inline w-3 h-3 text-red-500 mx-0.5 fill-red-500" /> for Indian Communities.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Terms of Rental</span>
            <span>•</span>
            <span className="text-brand font-semibold">Next.js + MongoDB + Tailwind CSS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
