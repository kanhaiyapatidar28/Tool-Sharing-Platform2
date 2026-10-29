import { NextResponse } from "next/server";
import { getToolByPublicId } from "@/lib/data-store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { publicId } = await params;
    if (!publicId) {
      return NextResponse.json({ success: false, error: "QR code identifier is required" }, { status: 400 });
    }

    const tool = await getToolByPublicId(publicId);
    if (!tool) {
      return NextResponse.json(
        { success: false, error: "The scanned tool QR code does not match any registered equipment." },
        { status: 404 }
      );
    }

    // Safety and Privacy: Sanitize public owner info.
    // Strip private email, phone, street address, and internal database structures.
    const sanitizedTool = {
      id: tool.id,
      publicId: tool.publicId,
      title: tool.title,
      description: tool.description,
      category: tool.category,
      condition: tool.condition,
      ratePerDay: tool.ratePerDay,
      deposit: tool.deposit,
      images: tool.images,
      city: tool.city,
      pickupArea: tool.pickupArea || tool.city,
      specs: tool.specs,
      isAvailable: tool.isAvailable,
      isPublished: tool.isPublished !== false,
      rating: tool.rating,
      reviewsCount: tool.reviewsCount,
      owner: {
        name: tool.ownerName.split(" ")[0] || "Verified Owner",
        city: tool.city,
        rating: tool.rating,
        reviewsCount: tool.reviewsCount,
      },
    };

    return NextResponse.json(
      { success: true, tool: sanitizedTool },
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
