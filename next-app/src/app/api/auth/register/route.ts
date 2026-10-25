import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, email, password, role, city, phone } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const assignedRole = role === "owner" ? "owner" : "borrower";
    const newUser = {
      id: `usr-${Date.now()}`,
      name: name || email.split("@")[0],
      email: email.toLowerCase().trim(),
      role: assignedRole,
      isOwner: assignedRole === "owner",
      city: city || "Mumbai",
      phone: phone || "+91 98200 00000",
      avatar:
        assignedRole === "owner"
          ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
          : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    };

    return NextResponse.json({
      success: true,
      user: newUser,
      message: `Account registered successfully as ${assignedRole.toUpperCase()}`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
