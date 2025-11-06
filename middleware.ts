// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

function readBasicAuth(req: NextRequest) {
  const header = req.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    const base64 = header.slice(6).trim();
    try {
      return Buffer.from(base64, "base64").toString();
    } catch {
      return "";
    }
  }

  const cookie = req.cookies.get("admin_basic")?.value;
  if (!cookie) return "";

  try {
    return Buffer.from(cookie, "base64").toString();
  } catch {
    return "";
  }
}

export function middleware(req: NextRequest) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;

  if (!user || !pass) {
    return NextResponse.next();
  }

  const credentials = readBasicAuth(req);
  const expected = `${user}:${pass}`;

  if (credentials === expected) {
    return NextResponse.next();
  }

  const pathname = req.nextUrl.pathname;

  // Let the admin UI render so you can enter creds locally.
  if (pathname === "/admin" && req.method === "GET") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Unauthorized" },
      {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
      }
    );
  }

  const url = new URL("/admin", req.url);
  url.searchParams.set("auth", "required");
  const res = NextResponse.redirect(url);
  res.headers.set("WWW-Authenticate", 'Basic realm="Admin"');
  return res;
}
