import { NextResponse } from "next/server";
import { getToolById, updateTool, deleteTool } from "@/lib/data-store";
import { requireRole } from "@/lib/server-auth";

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const roleCheck = await requireRole("owner", request);
    if ("errorResponse" in roleCheck) {
      return roleCheck.errorResponse;
    }
    const { session } = roleCheck;

    const { id } = await params;
    const body = await request.json();

    const result = await updateTool(id, body, session.email, session.role);
    if (!result.success) {
      const status = result.error?.includes("Forbidden") ? 403 : 404;
      return NextResponse.json({ success: false, error: result.error }, { status });
    }

    return NextResponse.json({ success: true, tool: result.tool });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const roleCheck = await requireRole("owner", request);
    if ("errorResponse" in roleCheck) {
      return roleCheck.errorResponse;
    }
    const { session } = roleCheck;

    const { id } = await params;
    const result = await deleteTool(id, session.email, session.role);
    if (!result.success) {
      const status = result.error?.includes("Forbidden") ? 403 : 404;
      return NextResponse.json({ success: false, error: result.error }, { status });
    }

    return NextResponse.json({ success: true, message: "Listing deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
