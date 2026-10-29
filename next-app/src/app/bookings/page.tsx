"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-client";

export default function BookingsRedirect() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === "owner") {
      router.replace("/owner/bookings");
    } else {
      router.replace("/borrower/bookings");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
