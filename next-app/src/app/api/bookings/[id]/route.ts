import { NextResponse } from "next/server";
import { updateBookingStatus } from "@/lib/data-store";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();
    const success = await updateBookingStatus(id, status);
    if (!success) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
