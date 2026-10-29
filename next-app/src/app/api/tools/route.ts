import { NextResponse } from "next/server";
import { getTools, createTool } from "@/lib/data-store";
import { getServerSession, requireRole } from "@/lib/server-auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const city = searchParams.get("city") || undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const ownerOnly = searchParams.get("ownerOnly") === "true";
    let ownerEmail = searchParams.get("ownerEmail") || undefined;

    let includeUnpublished = false;

    if (ownerOnly) {
      const session = await getServerSession(request);
      if (!session) {
        return NextResponse.json(
          { success: false, error: "Authentication required to view owner listings" },
          { status: 401 }
        );
      }
      if (session.role !== "owner" && session.role !== "admin") {
        return NextResponse.json(
          { success: false, error: "Only owners can access personal tool management" },
          { status: 403 }
        );
      }
      ownerEmail = session.email;
      includeUnpublished = true;
    }

    const tools = await getTools({
      category,
      search,
      city,
      maxPrice,
      ownerEmail,
      includeUnpublished,
    });

    return NextResponse.json(
      { success: true, tools, count: tools.length },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const roleCheck = await requireRole("owner", request);
    if ("errorResponse" in roleCheck) {
      return roleCheck.errorResponse;
    }
    const { session } = roleCheck;

    const body = await request.json();

    if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json({ success: false, error: "Tool title is required" }, { status: 400 });
    }
    if (!body.ratePerDay || isNaN(Number(body.ratePerDay)) || Number(body.ratePerDay) <= 0) {
      return NextResponse.json({ success: false, error: "Valid daily rental rate is required" }, { status: 400 });
    }

    const validCategories = ["POWER_TOOLS", "HAND_TOOLS", "GARDEN", "HEAVY_EQUIPMENT", "WOODWORKING", "CLEANING"];
    const category = validCategories.includes(body.category) ? body.category : "POWER_TOOLS";

    const validConditions = ["BRAND_NEW", "LIKE_NEW", "GOOD", "FAIR"];
    const condition = validConditions.includes(body.condition) ? body.condition : "LIKE_NEW";

    // Strictly server-authoritative ownership fields
    const payload = {
      title: body.title.trim(),
      description: (body.description || "").trim(),
      category,
      condition,
      ratePerDay: Math.round(Number(body.ratePerDay)),
      deposit: Math.max(0, Math.round(Number(body.deposit || 0))),
      images: Array.isArray(body.images) && body.images.length > 0 ? body.images : ["/assets/drill machine.png"],
      city: (body.city || session.city || "Mumbai").trim(),
      address: (body.address || "Andheri West, Mumbai").trim(),
      pickupArea: (body.pickupArea || body.city || "Andheri West").trim(),
      specs: typeof body.specs === "object" && body.specs !== null ? body.specs : {},
      ownerName: session.name,
      ownerEmail: session.email,
      ownerId: session.id,
      isAvailable: body.isAvailable !== false,
      isPublished: body.isPublished !== false,
      model3DType: body.model3DType || "drill",
    };

    const newTool = await createTool(payload);
    return NextResponse.json({ success: true, tool: newTool }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
