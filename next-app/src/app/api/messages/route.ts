import { NextResponse } from "next/server";
import { addBookingMessage, getBookings } from "@/lib/data-store";
import { getServerSession } from "@/lib/server-auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(request);
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId");
    const userEmail = (session?.email || searchParams.get("userEmail") || "").toLowerCase().trim();

    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const bookings = await getBookings(userEmail);

    if (bookingId) {
      const b = bookings.find((item) => item.id === bookingId || item._id === bookingId);
      if (!b) {
        return NextResponse.json(
          { success: false, error: "Booking conversation not found or access denied" },
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
    const session = await getServerSession(request);
    const { bookingId, senderName, senderEmail, text } = await request.json();

    if (!bookingId || !text || !text.trim()) {
      return NextResponse.json(
        { success: false, error: "bookingId and text are required" },
        { status: 400 }
      );
    }

    const effectiveName = session?.name || senderName || "User";
    const effectiveEmail = session?.email || senderEmail || "unknown@toolshare.in";

    const result = await addBookingMessage(bookingId, {
      senderName: effectiveName,
      senderEmail: effectiveEmail,
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
