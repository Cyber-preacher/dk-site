// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

function decodeBase64(input: string) {
  try {
    if (typeof atob === "function") return atob(input);
  } catch {
    // fall through to Node fallback
  }

  if (typeof Buffer !== "undefined") {
    try {
      return Buffer.from(input, "base64").toString();
    } catch {
      return "";
    }
  }

  return "";
}

function readBasicAuth(req: NextRequest) {
  const header = req.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    const base64 = header.slice(6).trim();
    return decodeBase64(base64);
  }

  const rawCookie = req.cookies.get("admin_basic")?.value;
  if (!rawCookie) return "";

  const decodedCookie = (() => {
    try {
      return decodeURIComponent(rawCookie);
    } catch {
      return rawCookie;
    }
  })();

  return decodeBase64(decodedCookie);
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

  if (pathname === "/admin" && req.method === "GET") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL("/admin", req.url);
  url.searchParams.set("auth", "required");
  return NextResponse.redirect(url);
}
