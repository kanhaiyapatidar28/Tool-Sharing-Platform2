import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import {
  verifyPassword,
  createSessionToken,
  buildSessionCookieHeader,
  buildSessionCookieHeaders,
  SessionPayload,
} from "@/lib/server-auth";

// Known verified demo accounts with predefined roles
const DEMO_ACCOUNTS: Array<{
  username: string;
  email: string;
  name: string;
  role: "owner" | "borrower" | "admin";
  isOwner: boolean;
  avatar: string;
  phone: string;
  city: string;
  validPasswords: string[];
}> = [
  {
    username: "owner",
    email: "owner@toolshare.in",
    name: "John Owner",
    role: "owner",
    isOwner: true,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
    phone: "+91 98200 12345",
    city: "Mumbai",
    validPasswords: ["password123", "ownerpassword1"],
  },
  {
    username: "borrower",
    email: "borrower@toolshare.in",
    name: "Bob Borrower",
    role: "borrower",
    isOwner: false,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    phone: "+91 98200 99887",
    city: "Mumbai",
    validPasswords: ["password123", "borrowerpassword1"],
  },
  {
    username: "john_owner",
    email: "john_owner@example.com",
    name: "John Owner",
    role: "owner",
    isOwner: true,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
    phone: "+91 98200 12345",
    city: "Mumbai",
    validPasswords: ["ownerpassword1", "password123"],
  },
  {
    username: "alice_owner",
    email: "alice_owner@example.com",
    name: "Alice Owner",
    role: "owner",
    isOwner: true,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
    phone: "+91 98200 54321",
    city: "Mumbai",
    validPasswords: ["ownerpassword2", "password123"],
  },
  {
    username: "bob_borrower",
    email: "bob_borrower@example.com",
    name: "Bob Borrower",
    role: "borrower",
    isOwner: false,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    phone: "+91 98200 99887",
    city: "Mumbai",
    validPasswords: ["borrowerpassword1", "password123"],
  },
  {
    username: "admin",
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
    isOwner: true,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
    phone: "+91 98200 00000",
    city: "Mumbai",
    validPasswords: ["adminpassword", "password123"],
  },
];

export async function POST(request: Request) {
  try {
    const { emailOrUsername, password, selectedRole, role } = await request.json();

    const normalizedInput = (emailOrUsername || "").toLowerCase().trim();
    if (!normalizedInput || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter your email or username and password." },
        { status: 400 }
      );
    }

    let authenticatedUser: SessionPayload | null = null;

    // 1. Try finding in MongoDB first
    const { isConnected } = await connectToDatabase();
    if (isConnected) {
      try {
        const User = (await import("@/models/User")).default;
        const dbUser = await User.findOne({
          $or: [
            { email: normalizedInput },
            { name: { $regex: `^${normalizedInput}$`, $options: "i" } },
          ],
        });

        if (dbUser && dbUser.password) {
          const isValid = verifyPassword(password, dbUser.password);
          if (isValid) {
            authenticatedUser = {
              id: dbUser._id.toString(),
              name: dbUser.name,
              email: dbUser.email,
              role: (dbUser.role as "owner" | "borrower" | "admin") || (dbUser.isOwner ? "owner" : "borrower"),
              isOwner: dbUser.role === "owner" || Boolean(dbUser.isOwner),
              avatar: dbUser.avatar,
              city: dbUser.city,
              phone: dbUser.phone,
            };
          }
        }
      } catch (err: any) {
        console.warn("MongoDB login check failed:", err.message);
      }
    }

    // 2. Check predefined demo accounts if not matched in DB
    if (!authenticatedUser) {
      const demoMatch = DEMO_ACCOUNTS.find(
        (u) =>
          u.email.toLowerCase() === normalizedInput ||
          u.username.toLowerCase() === normalizedInput
      );

      if (demoMatch) {
        const isValid = demoMatch.validPasswords.some((vp) =>
          verifyPassword(password, vp)
        );
        if (isValid) {
          authenticatedUser = {
            id: `usr-${demoMatch.username}`,
            name: demoMatch.name,
            email: demoMatch.email,
            role: demoMatch.role,
            isOwner: demoMatch.isOwner,
            avatar: demoMatch.avatar,
            city: demoMatch.city,
            phone: demoMatch.phone,
          };
        }
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, error: "Invalid email/username or password. Please verify your credentials." },
        { status: 401 }
      );
    }

    // Role verification: ensure selected role matches registered user role
    const chosenRole = (selectedRole || role || "").toLowerCase().trim();
    if (chosenRole && chosenRole !== "admin") {
      if (authenticatedUser.role !== chosenRole && authenticatedUser.role !== "admin") {
        return NextResponse.json(
          {
            success: false,
            error: `Role mismatch. Your account is registered as '${authenticatedUser.role.toUpperCase()}', but '${chosenRole.toUpperCase()}' was selected. Please switch your selected role to '${authenticatedUser.role.toUpperCase()}'.`,
          },
          { status: 403 }
        );
      }
    }

    // Determine authoritative redirect path based on verified server role
    const redirectUrl =
      authenticatedUser.role === "owner" ? "/owner/dashboard" : "/borrower/dashboard";

    // 3. Issue signed cryptographic session token
    const token = createSessionToken(authenticatedUser);
    const cookieHeaders = buildSessionCookieHeaders(token, authenticatedUser.role);

    const res = new NextResponse(
      JSON.stringify({
        success: true,
        user: authenticatedUser,
        redirectUrl,
        token,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    for (const c of cookieHeaders) {
      res.headers.append("Set-Cookie", c);
    }
    return res;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
