import { NextResponse } from "next/server";
import { getTools, createTool } from "@/lib/data-store";
import { getServerSession } from "@/lib/server-auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const city = searchParams.get("city") || undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;

    const tools = await getTools({ category, search, city, maxPrice });
    return NextResponse.json(
      { success: true, tools, count: tools.length },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=60",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(request);
    const body = await request.json();

    if (!body.title || !body.ratePerDay) {
      return NextResponse.json({ success: false, error: "Title and ratePerDay are required" }, { status: 400 });
    }

    const payload = {
      ...body,
      ownerName: session?.name || body.ownerName || "Tool Owner",
      ownerEmail: session?.email || body.ownerEmail || "owner@toolshare.in",
    };

    const newTool = await createTool(payload);
    return NextResponse.json({ success: true, tool: newTool }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
