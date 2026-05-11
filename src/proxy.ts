import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_PREFIXES = ["authjs.session-token", "__Secure-authjs.session-token"];

function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some((c) =>
    SESSION_COOKIE_PREFIXES.some((prefix) => c.name.startsWith(prefix))
  );
}

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path.startsWith("/admin") || path.startsWith("/account")) {
    if (!hasSessionCookie(request)) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
