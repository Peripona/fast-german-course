// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

/**
 * Pure function — extracts and validates Basic Auth credentials.
 * Exported for unit testing.
 */
export function checkAuth(authHeader: string | null): boolean {
  if (!authHeader?.startsWith("Basic ")) return false;

  const base64 = authHeader.slice(6);
  const decoded = atob(base64);

  // Split on the first colon only — password may contain colons
  const colonIndex = decoded.indexOf(":");
  if (colonIndex === -1) return false;

  const username = decoded.slice(0, colonIndex);
  const password = decoded.slice(colonIndex + 1);

  return (
    username === process.env.AUTH_USERNAME &&
    password === process.env.AUTH_PASSWORD
  );
}

export function middleware(request: NextRequest) {
  if (!checkAuth(request.headers.get("authorization"))) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Deutsch Tutor"',
      },
    });
  }
  return NextResponse.next();
}

export const config = {
  // Protect all routes except Next.js internals and static assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
