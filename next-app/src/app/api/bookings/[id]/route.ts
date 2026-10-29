import { NextResponse } from "next/server";
import { updateBookingStatus } from "@/lib/data-store";
import { getServerSession } from "@/lib/server-auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();
    const session = await getServerSession(request);

    const result = await updateBookingStatus(
      id,
      status,
      session?.email,
      session?.role
    );

    if (!result.success) {
      const statusCode = result.error?.includes("Unauthorized") ? 403 : 404;
      return NextResponse.json({ success: false, error: result.error || "Could not update booking" }, { status: statusCode });
    }

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
