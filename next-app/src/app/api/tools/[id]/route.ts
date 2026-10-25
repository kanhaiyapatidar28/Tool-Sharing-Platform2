import { NextResponse } from "next/server";
import { getToolById } from "@/lib/data-store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tool = await getToolById(id);
    if (!tool) {
      return NextResponse.json({ success: false, error: "Tool not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, tool });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
