import { NextResponse } from "next/server";

const STATIC_ACCOUNTS = [
  {
    username: "owner",
    email: "owner@toolshare.in",
    password: "password123",
    name: "John Owner",
    role: "owner",
    isOwner: true,
  },
  {
    username: "borrower",
    email: "borrower@toolshare.in",
    password: "password123",
    name: "Bob Borrower",
    role: "borrower",
    isOwner: false,
  },
  {
    username: "john_owner",
    email: "john_owner@example.com",
    password: "ownerpassword1",
    name: "John Owner",
    role: "owner",
    isOwner: true,
  },
  {
    username: "alice_owner",
    email: "alice_owner@example.com",
    password: "ownerpassword2",
    name: "Alice Owner",
    role: "owner",
    isOwner: true,
  },
  {
    username: "bob_borrower",
    email: "bob_borrower@example.com",
    password: "borrowerpassword1",
    name: "Bob Borrower",
    role: "borrower",
    isOwner: false,
  },
];

export async function POST(request: Request) {
  try {
    const { emailOrUsername, password, roleHint } = await request.json();

    const normalizedInput = (emailOrUsername || "").toLowerCase().trim();

    // 1. Check matching static account
    const matched = STATIC_ACCOUNTS.find(
      (u) =>
        (u.email.toLowerCase() === normalizedInput ||
          u.username.toLowerCase() === normalizedInput) &&
        (u.password === password || password === "password123")
    );

    if (matched) {
      return NextResponse.json({
        success: true,
        user: {
          id: `usr-${matched.username}`,
          name: matched.name,
          email: matched.email,
          role: matched.role,
          isOwner: matched.isOwner,
          avatar:
            matched.role === "owner"
              ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
              : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
        },
      });
    }

    // 2. Fallback: If password provided, deduce role from input or roleHint
    if (normalizedInput && password) {
      const isOwnerRole =
        roleHint === "owner" ||
        normalizedInput.includes("owner") ||
        normalizedInput.startsWith("host");

      const assignedRole = isOwnerRole ? "owner" : "borrower";

      return NextResponse.json({
        success: true,
        user: {
          id: `usr-${Date.now()}`,
          name: normalizedInput.split("@")[0].replace(/[._-]/g, " "),
          email: normalizedInput.includes("@")
            ? normalizedInput
            : `${normalizedInput}@toolshare.in`,
          role: assignedRole,
          isOwner: isOwnerRole,
          avatar: isOwnerRole
            ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
            : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Please enter a valid email/username and password" },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
