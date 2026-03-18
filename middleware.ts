import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const employeeProtectedRoutes = ["/checkout", "/favorites", "/my-orders", "/profile", "/feedback", "/wishlist", "/order-confirmation"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Employee-protected routes – redirect to home if no session
  if (employeeProtectedRoutes.some((route) => pathname.startsWith(route))) {
    const employeeSession = request.cookies.get("employee_session")?.value
    if (!employeeSession) {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/checkout/:path*",
    "/favorites/:path*",
    "/my-orders/:path*",
    "/profile/:path*",
    "/feedback/:path*",
    "/wishlist/:path*",
    "/order-confirmation/:path*",
  ],
}
