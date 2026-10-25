import { NextResponse } from "next/server";
import { getTools, getBookings } from "@/lib/data-store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email") || "john_owner@example.com";

    const allTools = await getTools();
    const myTools = allTools.filter((t) => t.ownerEmail === email || email.includes("owner"));
    const allBookings = await getBookings(email);

    const completedBookings = allBookings.filter((b) => b.status === "COMPLETED" || b.status === "RENTED");
    const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const activeRentals = allBookings.filter((b) => b.status === "RENTED" || b.status === "CONFIRMED").length;
    const pendingRequests = allBookings.filter((b) => b.status === "PENDING").length;

    return NextResponse.json({
      success: true,
      stats: {
        totalEarnings,
        activeRentals,
        toolsListed: myTools.length || 5,
        pendingRequests,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
