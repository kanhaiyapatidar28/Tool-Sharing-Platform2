"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, getStoredUser } from "@/lib/auth-client";
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
  ShoppingBag,
  Bell,
  Heart,
  CalendarCheck,
  Compass,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isBorrowerRoute = pathname.startsWith("/borrower");
  const isOwnerRoute =
    pathname.startsWith("/owner") ||
    pathname === "/owner-dashboard" ||
    pathname === "/list-tool";

  // Active user for the current portal context
  const activeUser =
    (isBorrowerRoute && user?.role !== "borrower")
      ? (getStoredUser("borrower") || user)
      : (isOwnerRoute && user?.role !== "owner")
      ? (getStoredUser("owner") || user)
      : user;

  const isOwner = isBorrowerRoute
    ? false
    : isOwnerRoute
    ? true
    : activeUser?.role === "owner";

  const isBorrower = isBorrowerRoute
    ? true
    : isOwnerRoute
    ? false
    : activeUser?.role === "borrower" || (!activeUser?.isOwner && Boolean(activeUser));

  const handleLogout = async () => {
    const roleToLogout = isOwner ? "owner" : "borrower";
    await logout(roleToLogout);
    setUserDropdownOpen(false);
    setMobileOpen(false);
    router.push("/login");
  };

  return (
    <header className="sticky top-4 z-50 w-full px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="bg-white/95 backdrop-blur-xl border border-neutral-200/90 rounded-full px-5 sm:px-6 py-2.5 sm:py-3 shadow-xl flex items-center justify-between transition-all">
        {/* Brand Logo & Active Role Tag */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-white shadow-md shadow-brand/40 group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-oswald text-xl uppercase tracking-wider text-neutral-900 font-bold leading-none">
                ToolShare
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-brand leading-tight">
                India
              </span>
            </div>
          </Link>

          {/* Prominent Role Badge after login */}
          {activeUser && (
            <Badge
              variant="outline"
              className={`hidden lg:inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border shadow-2xs ${
                isOwner
                  ? "border-brand/40 text-brand bg-brand/10"
                  : "border-emerald-600/40 text-emerald-700 bg-emerald-50"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  isOwner ? "bg-brand" : "bg-emerald-600"
                }`}
              />
              {isOwner ? "Owner Portal" : "Borrower Portal"}
            </Badge>
          )}
        </div>

        {/* Dynamic Role-Based Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-neutral-100 border border-neutral-200/80 rounded-full px-4 py-1.5 text-xs sm:text-sm text-neutral-700 font-medium">
          {loading ? (
            <div className="h-6 w-48 bg-neutral-200/70 rounded-full animate-pulse" />
          ) : activeUser && isOwner ? (
            /* ================= OWNER NAVBAR ================= */
            <>
              <Link
                href="/owner/dashboard"
                className={`px-3 py-1 rounded-full transition-colors ${
                  pathname === "/owner/dashboard" || pathname === "/owner-dashboard"
                    ? "bg-brand text-white font-semibold shadow-xs"
                    : "hover:text-neutral-900 hover:bg-white"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/owner/tools"
                className={`px-3 py-1 rounded-full transition-colors ${
                  pathname === "/owner/tools"
                    ? "bg-brand text-white font-semibold shadow-xs"
                    : "hover:text-neutral-900 hover:bg-white"
                }`}
              >
                My Tools
              </Link>
              <Link
                href="/owner/tools/new"
                className={`px-3 py-1 rounded-full transition-colors flex items-center gap-1 ${
                  pathname === "/owner/tools/new" || pathname === "/list-tool"
                    ? "bg-brand text-white font-semibold shadow-xs"
                    : "hover:text-neutral-900 hover:bg-white"
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Tool</span>
              </Link>
              <Link
                href="/owner/bookings"
                className={`px-3 py-1 rounded-full transition-colors ${
                  pathname === "/owner/bookings"
                    ? "bg-brand text-white font-semibold shadow-xs"
                    : "hover:text-neutral-900 hover:bg-white"
                }`}
              >
                Incoming Bookings
              </Link>
              <Link
                href="/profile"
                className={`px-3 py-1 rounded-full transition-colors ${
                  pathname === "/profile"
                    ? "bg-brand text-white font-semibold shadow-xs"
                    : "hover:text-neutral-900 hover:bg-white"
                }`}
              >
                Profile
              </Link>
            </>
          ) : activeUser && isBorrower ? (
            /* ================= BORROWER NAVBAR ================= */
            <>
              <Link
                href="/borrower/dashboard"
                className={`px-3 py-1 rounded-full transition-colors ${
                  pathname === "/borrower/dashboard"
                    ? "bg-emerald-600 text-white font-semibold shadow-xs"
                    : "hover:text-neutral-900 hover:bg-white"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/borrower/explore"
                className={`px-3 py-1 rounded-full transition-colors flex items-center gap-1 ${
                  pathname === "/borrower/explore" || pathname === "/browse"
                    ? "bg-emerald-600 text-white font-semibold shadow-xs"
                    : "hover:text-neutral-900 hover:bg-white"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Explore Tools</span>
              </Link>
              <Link
                href="/borrower/bookings"
                className={`px-3 py-1 rounded-full transition-colors flex items-center gap-1 ${
                  pathname === "/borrower/bookings" || pathname === "/bookings"
                    ? "bg-emerald-600 text-white font-semibold shadow-xs"
                    : "hover:text-neutral-900 hover:bg-white"
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>My Rentals</span>
              </Link>
              <Link
                href="/borrower/explore?wishlist=true"
                className={`px-3 py-1 rounded-full transition-colors flex items-center gap-1 ${
                  pathname.includes("wishlist")
                    ? "bg-emerald-600 text-white font-semibold shadow-xs"
                    : "hover:text-neutral-900 hover:bg-white"
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Wishlist</span>
              </Link>
              <Link
                href="/profile"
                className={`px-3 py-1 rounded-full transition-colors ${
                  pathname === "/profile"
                    ? "bg-emerald-600 text-white font-semibold shadow-xs"
                    : "hover:text-neutral-900 hover:bg-white"
                }`}
              >
                Profile
              </Link>
            </>
          ) : (
            /* ================= PUBLIC NAVBAR ================= */
            <>
              <Link
                href="/"
                className={`px-3 py-1 rounded-full transition-colors ${
                  pathname === "/"
                    ? "bg-brand text-white font-semibold shadow-xs"
                    : "hover:text-neutral-900 hover:bg-white"
                }`}
              >
                Home
              </Link>
              <Link
                href="/browse"
                className={`px-3 py-1 rounded-full transition-colors ${
                  pathname === "/browse"
                    ? "bg-brand text-white font-semibold shadow-xs"
                    : "hover:text-neutral-900 hover:bg-white"
                }`}
              >
                Explore
              </Link>
              <Link
                href="/#how-it-works"
                className="px-3 py-1 rounded-full hover:text-neutral-900 hover:bg-white transition-colors"
              >
                How it Works
              </Link>
              <Link
                href="/help"
                className={`px-3 py-1 rounded-full transition-colors ${
                  pathname === "/help"
                    ? "bg-brand text-white font-semibold shadow-xs"
                    : "hover:text-neutral-900 hover:bg-white"
                }`}
              >
                Help
              </Link>
            </>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Action Button depending on role */}
          {activeUser && isOwner && (
            <Link href="/owner/tools/new" className="hidden sm:inline-block">
              <Button
                variant="pill"
                className="h-10 sm:h-11 px-4 sm:px-5 bg-brand hover:bg-brand-hover text-white font-oswald uppercase tracking-wider text-xs sm:text-sm font-bold shadow-lg shadow-brand/30 hover:scale-[1.03] active:scale-[0.98] transition-all rounded-full"
              >
                <PlusCircle className="w-4 h-4 mr-1.5" /> Add Tool
              </Button>
            </Link>
          )}

          {activeUser && isBorrower && (
            <Link href="/borrower/explore" className="hidden sm:inline-block">
              <Button
                variant="pill"
                className="h-10 sm:h-11 px-4 sm:px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-oswald uppercase tracking-wider text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 hover:scale-[1.03] active:scale-[0.98] transition-all rounded-full"
              >
                <Compass className="w-4 h-4 mr-1.5" /> Rent Tools
              </Button>
            </Link>
          )}

          {/* User Profile Menu or Guest Login/Register */}
          {activeUser ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="h-10 sm:h-11 flex items-center gap-1.5 sm:gap-2 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 px-3 sm:px-3.5 rounded-full text-neutral-900 text-xs font-semibold transition-all"
                aria-label="User Account Menu"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-brand/30 flex items-center justify-center shrink-0">
                  {activeUser.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={activeUser.avatar} alt={activeUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5 text-brand" />
                  )}
                </div>
                <span className="font-oswald tracking-wide uppercase max-w-[80px] sm:max-w-[100px] truncate text-neutral-900 font-bold">
                  {activeUser.name.split(" ")[0]}
                </span>
                <span
                  className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shrink-0 shadow-xs text-white ${
                    isOwner ? "bg-brand" : "bg-emerald-600"
                  }`}
                >
                  {isOwner ? "Owner" : "Borrower"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white border border-neutral-200 rounded-2xl p-2 shadow-2xl z-50 text-neutral-900 text-xs animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-neutral-100 mb-1">
                    <p className="font-bold text-sm uppercase font-oswald text-neutral-900">{activeUser.name}</p>
                    <p className="text-[11px] text-neutral-500 truncate">{activeUser.email}</p>
                    <Badge
                      variant={isOwner ? "default" : "info"}
                      className={`mt-1.5 text-[10px] ${isOwner ? "bg-brand text-white" : "bg-emerald-600 text-white"}`}
                    >
                      {isOwner ? "Tool Owner" : "Borrower"}
                    </Badge>
                  </div>

                  {isOwner ? (
                    <>
                      <Link
                        href="/owner/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-neutral-100 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-brand" />
                        <span>Owner Dashboard</span>
                      </Link>
                      <Link
                        href="/owner/tools"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-neutral-100 transition-colors"
                      >
                        <Wrench className="w-4 h-4 text-brand" />
                        <span>My Tool Listings</span>
                      </Link>
                      <Link
                        href="/owner/tools/new"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-neutral-100 transition-colors"
                      >
                        <PlusCircle className="w-4 h-4 text-emerald-600" />
                        <span>Add New Tool</span>
                      </Link>
                      <Link
                        href="/owner/bookings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-neutral-100 transition-colors"
                      >
                        <CalendarCheck className="w-4 h-4 text-brand" />
                        <span>Incoming Bookings</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/borrower/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-neutral-100 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                        <span>Borrower Dashboard</span>
                      </Link>
                      <Link
                        href="/borrower/explore"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-neutral-100 transition-colors"
                      >
                        <Compass className="w-4 h-4 text-emerald-600" />
                        <span>Explore Marketplace</span>
                      </Link>
                      <Link
                        href="/borrower/bookings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-neutral-100 transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4 text-emerald-600" />
                        <span>My Rentals</span>
                      </Link>
                    </>
                  )}

                  <Link
                    href="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-neutral-100 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-neutral-600" />
                    <span>Profile & Account</span>
                  </Link>

                  <Link
                    href="/notifications"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-neutral-100 transition-colors"
                  >
                    <Bell className="w-4 h-4 text-amber-500" />
                    <span>Notifications</span>
                  </Link>

                  <div className="pt-1 mt-1 border-t border-neutral-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="h-10 sm:h-11 px-3 sm:px-3.5 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 font-oswald font-bold text-xs sm:text-sm uppercase tracking-wider rounded-full transition-colors"
                >
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="outline"
                  className="h-10 sm:h-11 px-3.5 sm:px-5 border-neutral-300 text-neutral-900 bg-neutral-100 hover:bg-neutral-200 font-oswald text-xs sm:text-sm font-bold uppercase tracking-wider rounded-full hover:scale-[1.03] active:scale-[0.98] transition-all"
                >
                  Register
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-neutral-700 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors"
            aria-label="Toggle Mobile Navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden mt-2 bg-white border border-neutral-200 rounded-3xl p-5 shadow-2xl text-neutral-900 space-y-3 animate-in fade-in slide-in-from-top-2">
          {activeUser && isOwner ? (
            /* Owner Mobile Menu */
            <>
              <div className="px-2 pb-2 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-neutral-900">{activeUser.name}</p>
                  <p className="text-xs text-neutral-500">{activeUser.email}</p>
                </div>
                <Badge className="bg-brand text-white text-[10px]">Owner</Badge>
              </div>
              <Link
                href="/owner/dashboard"
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-semibold hover:text-brand px-2 py-1.5"
              >
                Dashboard
              </Link>
              <Link
                href="/owner/tools"
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-semibold hover:text-brand px-2 py-1.5"
              >
                My Tools
              </Link>
              <Link
                href="/owner/tools/new"
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-semibold text-brand hover:text-brand-hover px-2 py-1.5"
              >
                + Add New Tool
              </Link>
              <Link
                href="/owner/bookings"
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-semibold hover:text-brand px-2 py-1.5"
              >
                Incoming Bookings
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-semibold hover:text-brand px-2 py-1.5"
              >
                Profile
              </Link>
              <Link
                href="/notifications"
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-semibold hover:text-brand px-2 py-1.5"
              >
                Notifications
              </Link>
            </>
          ) : activeUser && isBorrower ? (
            /* Borrower Mobile Menu */
            <>
              <div className="px-2 pb-2 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-neutral-900">{activeUser.name}</p>
                  <p className="text-xs text-neutral-500">{activeUser.email}</p>
                </div>
                <Badge className="bg-emerald-600 text-white text-[10px]">Borrower</Badge>
              </div>
              <Link
                href="/borrower/dashboard"
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-semibold hover:text-emerald-600 px-2 py-1.5"
              >
                Dashboard
              </Link>
              <Link
                href="/borrower/explore"
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-semibold hover:text-emerald-600 px-2 py-1.5"
              >
                Explore Tools
              </Link>
              <Link
                href="/borrower/bookings"
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-semibold hover:text-emerald-600 px-2 py-1.5"
              >
                My Rentals
              </Link>
              <Link
                href="/borrower/explore?wishlist=true"
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-semibold hover:text-emerald-600 px-2 py-1.5"
              >
                Wishlist
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-semibold hover:text-emerald-600 px-2 py-1.5"
              >
                Profile
              </Link>
            </>
          ) : (
            /* Public Mobile Menu */
            <>
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-semibold hover:text-brand px-2 py-1.5"
              >
                Home
              </Link>
              <Link
                href="/browse"
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-semibold hover:text-brand px-2 py-1.5"
              >
                Explore Tools
              </Link>
              <Link
                href="/#how-it-works"
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-semibold hover:text-brand px-2 py-1.5"
              >
                How it Works
              </Link>
              <Link
                href="/help"
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-semibold hover:text-brand px-2 py-1.5"
              >
                Help & FAQs
              </Link>
            </>
          )}

          {user ? (
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-xs text-neutral-500 truncate">{user.email}</span>
              <button
                onClick={handleLogout}
                className="text-xs font-bold text-red-600 hover:underline"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-neutral-100 flex gap-2">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1">
                <Button variant="default" size="sm" className="w-full bg-brand hover:bg-brand-hover text-white font-bold">
                  Login
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1">
                <Button variant="outline" size="sm" className="w-full border-neutral-300 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold">
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
