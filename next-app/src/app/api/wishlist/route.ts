import { NextResponse } from "next/server";
import { getWishlist, toggleWishlist } from "@/lib/data-store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email") || "bob_borrower@example.com";
    const tools = await getWishlist(email);
    return NextResponse.json({ success: true, tools });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email, toolId } = await request.json();
    const isWished = await toggleWishlist(email || "bob_borrower@example.com", toolId);
    return NextResponse.json({ success: true, isWished });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
