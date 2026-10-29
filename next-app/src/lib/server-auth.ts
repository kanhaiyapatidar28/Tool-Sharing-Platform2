import crypto from "crypto";
import { cookies } from "next/headers";

export interface SessionPayload {
  id: string;
  email: string;
  name: string;
  role: "owner" | "borrower" | "admin";
  isOwner: boolean;
  avatar?: string;
  city?: string;
  phone?: string;
}

const AUTH_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "toolshare_p2p_secure_marketplace_secret_key_2026";
export const SESSION_COOKIE_NAME = "toolshare_session";
export const OWNER_SESSION_COOKIE_NAME = "toolshare_owner_session";
export const BORROWER_SESSION_COOKIE_NAME = "toolshare_borrower_session";
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * Hash password securely with PBKDF2
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify password against stored hash (supporting both salted PBKDF2 and legacy demo matches)
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !password) return false;

  // Salted format: salt:hash
  if (storedHash.includes(":")) {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512");
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  }

  // Fallback for pre-seeded plain strings in dev/demo
  return crypto.timingSafeEqual(Buffer.from(password), Buffer.from(storedHash));
}

/**
 * Create a cryptographically signed session token
 */
export function createSessionToken(payload: SessionPayload): string {
  const data = JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
    iat: Math.floor(Date.now() / 1000),
  });
  const encodedData = Buffer.from(data).toString("base64url");
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(encodedData)
    .digest("base64url");

  return `${encodedData}.${signature}`;
}

/**
 * Verify signed session token
 */
export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  const [encodedData, signature] = token.split(".");
  if (!encodedData || !signature) return null;

  const expectedSignature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(encodedData)
    .digest("base64url");

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const raw = Buffer.from(encodedData, "base64url").toString("utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return {
      id: parsed.id,
      email: parsed.email,
      name: parsed.name,
      role: parsed.role,
      isOwner: parsed.isOwner ?? (parsed.role === "owner"),
      avatar: parsed.avatar,
      city: parsed.city,
      phone: parsed.phone,
    };
  } catch {
    return null;
  }
}

/**
 * Retrieve server session from Request headers, cookies, or Next.js cookies()
 */
export async function getServerSession(request?: Request): Promise<SessionPayload | null> {
  // 1. From Authorization Header
  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const s = verifySessionToken(authHeader.substring(7));
      if (s) return s;
    }

    // Determine if request has an explicit or contextual role
    let preferredRole: string | null = request.headers.get("x-user-role") || request.headers.get("x-toolshare-role");
    if (!preferredRole) {
      try {
        const urlObj = new URL(request.url);
        preferredRole = urlObj.searchParams.get("role");
      } catch {}
    }
    if (!preferredRole) {
      const referer = request.headers.get("referer") || "";
      if (referer.includes("/owner")) preferredRole = "owner";
      else if (referer.includes("/borrower")) preferredRole = "borrower";
    }

    // 2. From Cookie header on Request
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      if (preferredRole === "owner") {
        const ownerMatch = cookieHeader.match(new RegExp(`(?:^|;\\s*)${OWNER_SESSION_COOKIE_NAME}=([^;]+)`));
        if (ownerMatch) {
          const ownerSession = verifySessionToken(decodeURIComponent(ownerMatch[1]));
          if (ownerSession) return ownerSession;
        }
      } else if (preferredRole === "borrower") {
        const borrowerMatch = cookieHeader.match(new RegExp(`(?:^|;\\s*)${BORROWER_SESSION_COOKIE_NAME}=([^;]+)`));
        if (borrowerMatch) {
          const borrowerSession = verifySessionToken(decodeURIComponent(borrowerMatch[1]));
          if (borrowerSession) return borrowerSession;
        }
      }

      // Check standard session cookie
      const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`));
      if (match) {
        const s = verifySessionToken(decodeURIComponent(match[1]));
        if (s) return s;
      }

      // Check owner/borrower cookie fallbacks
      const oMatch = cookieHeader.match(new RegExp(`(?:^|;\\s*)${OWNER_SESSION_COOKIE_NAME}=([^;]+)`));
      if (oMatch) {
        const oSession = verifySessionToken(decodeURIComponent(oMatch[1]));
        if (oSession) return oSession;
      }
      const bMatch = cookieHeader.match(new RegExp(`(?:^|;\\s*)${BORROWER_SESSION_COOKIE_NAME}=([^;]+)`));
      if (bMatch) {
        const bSession = verifySessionToken(decodeURIComponent(bMatch[1]));
        if (bSession) return bSession;
      }
    }
  }

  // 3. From Next.js cookies() helper (for Server Components & Server Actions)
  try {
    const cookieStore = await cookies();
    const cookie =
      cookieStore.get(SESSION_COOKIE_NAME) ||
      cookieStore.get(OWNER_SESSION_COOKIE_NAME) ||
      cookieStore.get(BORROWER_SESSION_COOKIE_NAME);
    if (cookie) {
      const s = verifySessionToken(cookie.value);
      if (s) return s;
    }
  } catch {
    // Outside of request scope or static generation
  }

  return null;
}

/**
 * Construct Set-Cookie values for role-scoped session
 */
export function buildSessionCookieHeaders(token: string, role?: string): string[] {
  const isProduction = process.env.NODE_ENV === "production";
  const flags = `; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}${isProduction ? "; Secure" : ""}`;
  const headers = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}${flags}`,
  ];
  if (role === "owner") {
    headers.push(`${OWNER_SESSION_COOKIE_NAME}=${encodeURIComponent(token)}${flags}`);
  } else if (role === "borrower") {
    headers.push(`${BORROWER_SESSION_COOKIE_NAME}=${encodeURIComponent(token)}${flags}`);
  }
  return headers;
}

export function buildSessionCookieHeader(token: string): string {
  const isProduction = process.env.NODE_ENV === "production";
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}${isProduction ? "; Secure" : ""}`;
}

export function buildLogoutCookieHeaders(role?: string): string[] {
  const isProduction = process.env.NODE_ENV === "production";
  const clearFlags = `; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isProduction ? "; Secure" : ""}`;

  if (role === "owner") {
    return [
      `${OWNER_SESSION_COOKIE_NAME}=${clearFlags}`,
    ];
  } else if (role === "borrower") {
    return [
      `${BORROWER_SESSION_COOKIE_NAME}=${clearFlags}`,
    ];
  }

  return [
    `${SESSION_COOKIE_NAME}=${clearFlags}`,
    `${OWNER_SESSION_COOKIE_NAME}=${clearFlags}`,
    `${BORROWER_SESSION_COOKIE_NAME}=${clearFlags}`,
  ];
}

export function buildLogoutCookieHeader(): string {
  const isProduction = process.env.NODE_ENV === "production";
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isProduction ? "; Secure" : ""}`;
}

/**
 * Generate a cryptographically secure random public identifier for QR code scanning
 */
export function generatePublicToolId(): string {
  return `tool_${crypto.randomBytes(6).toString("hex")}`;
}

/**
 * Authorization guard: requires a valid authenticated session
 */
export async function requireAuth(request?: Request): Promise<{ session: SessionPayload } | { errorResponse: Response }> {
  const session = await getServerSession(request);
  if (!session) {
    return {
      errorResponse: new Response(
        JSON.stringify({ success: false, error: "Authentication required. Please sign in to continue." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      ),
    };
  }
  return { session };
}

/**
 * Authorization guard: requires a specific role (or admin)
 */
export async function requireRole(
  expectedRole: "owner" | "borrower" | "admin",
  request?: Request
): Promise<{ session: SessionPayload } | { errorResponse: Response }> {
  const authResult = await requireAuth(request);
  if ("errorResponse" in authResult) {
    return authResult;
  }
  const { session } = authResult;
  if (session.role !== expectedRole && session.role !== "admin") {
    return {
      errorResponse: new Response(
        JSON.stringify({
          success: false,
          error: `Forbidden. This operation requires '${expectedRole}' permissions. Your current role is '${session.role}'.`,
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      ),
    };
  }
  return { session };
}

