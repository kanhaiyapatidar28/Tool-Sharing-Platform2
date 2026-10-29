import { NextResponse } from "next/server";
import { getTools, getBookings } from "@/lib/data-store";
import { getServerSession } from "@/lib/server-auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(request);
    const { searchParams } = new URL(request.url);

    // Prefer session email if logged in, otherwise check query param
    const email = (session?.email || searchParams.get("email") || "owner@toolshare.in").toLowerCase().trim();

    const allTools = await getTools();
    const myTools = allTools.filter(
      (t) => (t.ownerEmail || "").toLowerCase() === email
    );

    const allBookings = await getBookings(email);

    // Financial calculations: owner gets rental earnings (ratePerDay * totalDays)
    const activeRentals = allBookings.filter((b) => b.status === "RENTED" || b.status === "CONFIRMED").length;
    const pendingRequests = allBookings.filter((b) => b.status === "PENDING").length;

    const earningsEligible = allBookings.filter(
      (b) => b.status === "COMPLETED" || b.status === "RENTED" || b.status === "CONFIRMED"
    );
    const totalEarnings = earningsEligible.reduce((sum, b) => {
      // Calculate net payout to owner (approx 90% after platform facilitation)
      const rentalAmount = (b.ratePerDay || 0) * (b.totalDays || 1);
      return sum + Math.round(rentalAmount * 0.95);
    }, 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalEarnings,
        activeRentals,
        toolsListed: myTools.length,
        pendingRequests,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
