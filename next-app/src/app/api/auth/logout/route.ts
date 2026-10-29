import { NextResponse } from "next/server";
import { buildLogoutCookieHeader } from "@/lib/server-auth";

export async function POST() {
  return new NextResponse(JSON.stringify({ success: true, message: "Logged out successfully" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": buildLogoutCookieHeader(),
    },
  });
}
