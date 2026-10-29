import { NextResponse } from "next/server";
import { buildLogoutCookieHeaders } from "@/lib/server-auth";

export async function POST(request: Request) {
  let role: string | undefined;
  try {
    const body = await request.json();
    role = body?.role;
  } catch {
    // Body is optional
  }

  if (!role) {
    role = request.headers.get("x-user-role") || undefined;
  }
  if (!role) {
    const referer = request.headers.get("referer") || "";
    if (referer.includes("/owner")) role = "owner";
    else if (referer.includes("/borrower")) role = "borrower";
  }

  const cookieHeaders = buildLogoutCookieHeaders(role);

  const res = new NextResponse(
    JSON.stringify({
      success: true,
      message: role ? `Logged out from ${role} successfully` : "Logged out successfully",
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
}
