// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Only protect these paths
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

export function middleware(req: NextRequest) {
  const required = process.env.ADMIN_TOKEN;
  // Fail-open if ADMIN_TOKEN isn’t configured, so we don’t 500 on Vercel
  if (!required) return NextResponse.next();

  const token =
    req.headers.get("x-admin-token") ??
    req.cookies.get("admin_token")?.value ??
    "";

  if (token === required) return NextResponse.next();

  // If it’s an API route, respond with JSON 401 (don’t throw)
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Otherwise redirect nicely with a hint
  const url = new URL("/", req.url);
  url.searchParams.set("e", "401");
  const res = NextResponse.redirect(url);
  res.headers.set('WWW-Authenticate', 'Bearer realm="admin"');
  return res;
}
