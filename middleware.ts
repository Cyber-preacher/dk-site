// middleware.ts
import { NextResponse } from "next/server";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

// Helper: always return a proper 401 prompt
function unauthorized() {
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
  });
}

export function middleware(req: Request) {
  try {
    // Extra guard: if somehow executed on other paths, bypass.
    const { pathname } = new URL(req.url);
    const isAdminPath =
      pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
    if (!isAdminPath) return NextResponse.next();

    const wantUser = process.env.ADMIN_USER || "";
    const wantPass = process.env.ADMIN_PASS || "";
    if (!wantUser || !wantPass) return unauthorized();

    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Basic ")) return unauthorized();

    // Safe base64 decode (atob can throw if header is malformed)
    let decoded = "";
    try {
      decoded = atob(auth.slice(6));
    } catch {
      return unauthorized();
    }

    const idx = decoded.indexOf(":");
    if (idx < 0) return unauthorized();

    const user = decoded.slice(0, idx);
    const pass = decoded.slice(idx + 1);

    if (user !== wantUser || pass !== wantPass) return unauthorized();

    return NextResponse.next();
  } catch {
    // Never bring the whole site down due to middleware; just pass through.
    return NextResponse.next();
  }
}
