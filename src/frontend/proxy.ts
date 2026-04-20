import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    const isAuthPage = request.nextUrl.pathname.startsWith("/auth");

    if (!token && !isAuthPage) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    if (token && isAuthPage) {
        return NextResponse.redirect(new URL("/demo", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/demo/:path*"],
};