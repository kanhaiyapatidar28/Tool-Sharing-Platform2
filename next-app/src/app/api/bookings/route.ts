import { NextResponse } from "next/server";
import { getBookings, createBooking } from "@/lib/data-store";
import { getServerSession } from "@/lib/server-auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedEmail = searchParams.get("userEmail") || undefined;
    const session = await getServerSession(request);

    // Enforce authorization:
    // If authenticated, the user can only query their own bookings (unless admin)
    let effectiveEmail = requestedEmail;
    if (session) {
      if (session.role !== "admin") {
        effectiveEmail = session.email;
      }
    } else if (requestedEmail) {
      // In unauthenticated context, limit to specific email without allowing wildcards
      effectiveEmail = requestedEmail.toLowerCase().trim();
    } else {
      return NextResponse.json(
        { success: false, error: "Authentication required to view bookings" },
        { status: 401 }
      );
    }

    const bookings = await getBookings(effectiveEmail);
    return NextResponse.json({ success: true, bookings, count: bookings.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(request);
    const body = await request.json();

    const { toolId, startDate, endDate, initialMsg, idempotencyKey } = body;

    if (!toolId || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: "Tool ID, start date, and end date are required." },
        { status: 400 }
      );
    }

    // Authoritative identity: use session user if logged in, otherwise require valid renter details
    const renterName = session?.name || body.renterName?.trim();
    const renterEmail = session?.email || body.renterEmail?.toLowerCase().trim();

    if (!renterEmail || !renterEmail.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please log in or provide a valid email address to complete booking." },
        { status: 401 }
      );
    }

    try {
      const newBooking = await createBooking({
        toolId,
        startDate,
        endDate,
        renterName: renterName || "Borrower",
        renterEmail,
        initialMsg,
        idempotencyKey,
      });

      return NextResponse.json({ success: true, booking: newBooking }, { status: 201 });
    } catch (err: any) {
      if (err.message === "TOOL_ALREADY_RESERVED_FOR_DATES") {
        return NextResponse.json(
          {
            success: false,
            error: "This tool is already reserved for the selected dates. Please choose different dates.",
            code: "CONFLICT",
          },
          { status: 409 }
        );
      }
      if (err.message === "START_DATE_IN_PAST") {
        return NextResponse.json(
          { success: false, error: "Reservation start date cannot be in the past." },
          { status: 400 }
        );
      }
      if (err.message === "INVALID_DATE_RANGE") {
        return NextResponse.json(
          { success: false, error: "End date must be on or after start date." },
          { status: 400 }
        );
      }
      if (err.message === "TOOL_NOT_FOUND") {
        return NextResponse.json({ success: false, error: "Equipment not found." }, { status: 404 });
      }
      throw err;
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to process booking" }, { status: 500 });
  }
}
