import { NextResponse } from "next/server";
import { getBookings, createBooking } from "@/lib/data-store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get("userEmail") || undefined;
    const bookings = await getBookings(userEmail);
    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newBooking = await createBooking(body);
    return NextResponse.json({ success: true, booking: newBooking }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
