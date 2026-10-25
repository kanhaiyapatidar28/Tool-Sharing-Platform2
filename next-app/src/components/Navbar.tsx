"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wrench,
  Menu,
  X,
  User as UserIcon,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Sparkles,
  ShoppingBag,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, login, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const switchAccount = (role: "owner" | "borrower") => {
    if (role === "owner") {
      login({
        id: "usr-owner-1",
        name: "John Owner",
        email: "owner@toolshare.in",
        role: "owner",
        isOwner: true,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
      });
    } else {
      login({
        id: "usr-borrower-1",
        name: "Bob Borrower",
        email: "borrower@toolshare.in",
        role: "borrower",
        isOwner: false,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
      });
    }
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-4 z-50 w-full px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="bg-white/95 backdrop-blur-xl border border-neutral-200/90 rounded-full px-6 py-3 shadow-xl flex items-center justify-between transition-all">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-white shadow-md shadow-brand/40 group-hover:scale-105 transition-transform">
            <Wrench className="w-5 h-5" />
          </div>
          <span className="font-oswald text-xl uppercase tracking-wider text-neutral-900 font-bold">
            Household Tools
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-neutral-100 border border-neutral-200/80 rounded-full px-4 py-1.5 text-sm text-neutral-700 font-medium">
          <Link
            href="/#about"
            className="px-3 py-1 rounded-full hover:text-neutral-900 hover:bg-white transition-colors"
          >
            About Us
          </Link>
          <Link
            href="/#how-it-works"
            className="px-3 py-1 rounded-full hover:text-neutral-900 hover:bg-white transition-colors"
          >
            How it Works
          </Link>
          <div className="w-[1px] h-4 bg-neutral-300 mx-1" />
          <Link
            href="/browse"
            className={`px-3 py-1 rounded-full transition-colors ${
              pathname === "/browse"
                ? "bg-brand text-white font-semibold"
                : "hover:text-neutral-900 hover:bg-white"
            }`}
          >
            Browse Tools
          </Link>
          {user && (
            <Link
              href={user.isOwner ? "/owner-dashboard" : "/bookings"}
              className={`px-3 py-1 rounded-full transition-colors ${
                pathname === "/owner-dashboard" || pathname === "/bookings"
                  ? "bg-neutral-200 text-neutral-900 font-semibold"
                  : "hover:text-neutral-900 hover:bg-white"
              }`}
            >
              {user.isOwner ? "Owner Dashboard" : "My Rentals"}
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link href="/list-tool" className="hidden sm:inline-block">
            <Button
              variant="pill"
              className="h-11 px-5 sm:px-6 bg-brand hover:bg-brand-hover text-white font-oswald uppercase tracking-wider text-sm font-bold shadow-lg shadow-brand/30 hover:shadow-brand/50 hover:scale-[1.03] active:scale-[0.98] transition-all rounded-full"
            >
              <PlusCircle className="w-4 h-4 mr-2" /> List a Tool
            </Button>
          </Link>

          {/* User Profile or Login */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="h-11 flex items-center gap-2.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 px-3.5 rounded-full text-neutral-900 text-xs font-semibold transition-all"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-brand/30 flex items-center justify-center">
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5 text-brand" />
                  )}
                </div>
                <span className="font-oswald tracking-wide uppercase max-w-[90px] truncate text-neutral-900">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white border border-neutral-200 rounded-2xl p-2 shadow-2xl z-50 text-neutral-900 text-xs animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-neutral-100 mb-1">
                    <p className="font-bold text-sm uppercase font-oswald text-neutral-900">{user.name}</p>
                    <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
                    <Badge variant={user.isOwner ? "default" : "info"} className="mt-1.5 text-[10px]">
                      {user.isOwner ? "Tool Owner" : "Borrower"}
                    </Badge>
                  </div>

                  <Link
                    href={user.isOwner ? "/owner-dashboard" : "/bookings"}
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-neutral-100 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-brand" />
                    <span>{user.isOwner ? "Owner Dashboard" : "My Rentals"}</span>
                  </Link>

                  <Link
                    href="/list-tool"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-neutral-100 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-600" />
                    <span>Add New Tool Listing</span>
                  </Link>

                  {/* Quick Role Switcher */}
                  <div className="px-3 py-1.5 my-1 border-t border-b border-neutral-100">
                    <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" /> Switch Role:
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => switchAccount("owner")}
                        className={`px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 ${
                          user.isOwner ? "bg-brand text-white shadow-xs" : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                        }`}
                      >
                        <Wrench className="w-3 h-3" /> Tool Owner
                      </button>
                      <button
                        onClick={() => switchAccount("borrower")}
                        className={`px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 ${
                          !user.isOwner ? "bg-emerald-600 text-white shadow-xs" : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                        }`}
                      >
                        <ShoppingBag className="w-3 h-3" /> Borrower
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="h-11 px-3.5 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 font-oswald font-bold text-xs sm:text-sm uppercase tracking-wider rounded-full transition-colors"
                >
                  Log In
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="outline"
                  className="h-11 px-5 border-neutral-300 text-neutral-900 bg-neutral-100 hover:bg-neutral-200 font-oswald text-xs sm:text-sm font-bold uppercase tracking-wider rounded-full hover:scale-[1.03] active:scale-[0.98] transition-all"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-neutral-700 hover:text-neutral-900"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden mt-2 bg-white border border-neutral-200 rounded-3xl p-5 shadow-2xl text-neutral-900 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="block text-sm font-semibold hover:text-brand"
          >
            Home
          </Link>
          <Link
            href="/browse"
            onClick={() => setMobileOpen(false)}
            className="block text-sm font-semibold hover:text-brand"
          >
            Browse Tools
          </Link>
          <Link
            href="/list-tool"
            onClick={() => setMobileOpen(false)}
            className="block text-sm font-semibold hover:text-brand text-brand"
          >
            + List a Tool
          </Link>
          {user ? (
            <Link
              href={user.isOwner ? "/owner-dashboard" : "/bookings"}
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-semibold hover:text-brand"
            >
              {user.isOwner ? "Owner Dashboard" : "My Bookings"}
            </Link>
          ) : (
            <div className="pt-2 border-t border-white/10 flex gap-2">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1">
                <Button variant="default" size="sm" className="w-full">
                  Login
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1">
                <Button variant="outline" size="sm" className="w-full border-white/20 text-white">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
