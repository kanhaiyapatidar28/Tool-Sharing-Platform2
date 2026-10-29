import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { hashPassword, createSessionToken, buildSessionCookieHeader } from "@/lib/server-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, city, phone } = body;

    const normalizedEmail = (email || "").toLowerCase().trim();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const assignedRole: "owner" | "borrower" = role === "owner" ? "owner" : "borrower";
    const hashedPassword = hashPassword(password);
    const sanitizedName = (name || normalizedEmail.split("@")[0]).trim();
    const avatar =
      assignedRole === "owner"
        ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
        : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80";

    const { isConnected } = await connectToDatabase();
    let savedUserId = `usr-${Date.now()}`;

    if (isConnected) {
      try {
        const User = (await import("@/models/User")).default;
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
          return NextResponse.json(
            { success: false, error: "An account with this email already exists. Please log in." },
            { status: 409 }
          );
        }

        const newUserDoc = await User.create({
          name: sanitizedName,
          email: normalizedEmail,
          password: hashedPassword,
          role: assignedRole,
          isOwner: assignedRole === "owner",
          city: city || "Mumbai",
          phone: phone || "+91 98200 00000",
          avatar,
        });
        savedUserId = newUserDoc._id.toString();
      } catch (err: any) {
        console.warn("MongoDB registration fallback to memory:", err.message);
      }
    }

    const userPayload = {
      id: savedUserId,
      name: sanitizedName,
      email: normalizedEmail,
      role: assignedRole,
      isOwner: assignedRole === "owner",
      avatar,
      city: city || "Mumbai",
      phone: phone || "+91 98200 00000",
    };

    const token = createSessionToken(userPayload);
    const cookieHeader = buildSessionCookieHeader(token);

    const redirectUrl =
      assignedRole === "owner" ? "/owner/dashboard" : "/borrower/dashboard";

    return new NextResponse(
      JSON.stringify({
        success: true,
        user: userPayload,
        token,
        redirectUrl,
        message: `Account created successfully as ${assignedRole.toUpperCase()}`,
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": cookieHeader,
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Registration failed" }, { status: 500 });
  }
}
