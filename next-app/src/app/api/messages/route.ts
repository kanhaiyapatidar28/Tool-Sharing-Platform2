import { NextResponse } from "next/server";
import { addBookingMessage, getBookings } from "@/lib/data-store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId");
    const userEmail = searchParams.get("userEmail");

    const bookings = await getBookings(userEmail || undefined);

    if (bookingId) {
      const b = bookings.find((item) => item.id === bookingId || item._id === bookingId);
      if (!b) {
        return NextResponse.json(
          { success: false, error: "Booking not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        messages: b.messages || [],
        booking: {
          id: b.id,
          toolTitle: b.toolTitle,
          ownerName: b.ownerName,
          renterName: b.renterName,
          renterEmail: b.renterEmail,
        },
      });
    }

    // Return conversation summaries for this user
    const conversations = bookings
      .filter((b) => b.messages && b.messages.length > 0)
      .map((b) => ({
        bookingId: b.id,
        toolTitle: b.toolTitle,
        toolPhoto: b.toolPhoto,
        otherUser:
          userEmail === b.renterEmail
            ? { name: b.ownerName, role: "owner" }
            : { name: b.renterName, role: "borrower" },
        lastMessage: b.messages[b.messages.length - 1],
        messagesCount: b.messages.length,
      }));

    return NextResponse.json({ success: true, conversations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { bookingId, senderName, senderEmail, text } = await request.json();

    if (!bookingId || !text || !text.trim()) {
      return NextResponse.json(
        { success: false, error: "bookingId and text are required" },
        { status: 400 }
      );
    }

    const result = await addBookingMessage(bookingId, {
      senderName: senderName || "User",
      senderEmail: senderEmail || "unknown@toolshare.in",
      text: text.trim(),
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Could not add message" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      messages: result.messages,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
