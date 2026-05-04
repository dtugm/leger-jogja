import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/auth/login", "/auth/signup"];
const HOME_ROUTE = "/catalog";
const LOGIN_ROUTE = "/auth/login";

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/"),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isAuthenticated = Boolean(request.cookies.get("token")?.value);

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(isAuthenticated ? HOME_ROUTE : LOGIN_ROUTE, request.url),
    );
  }

  if (!isAuthenticated && !isPublicRoute(pathname)) {
    const url = new URL(LOGIN_ROUTE, request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL(HOME_ROUTE, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};