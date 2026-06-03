import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const role = token?.role as string;
    const pathname = req.nextUrl.pathname;

    // Admin paths protection
    if (
      (pathname.startsWith("/dashboard/products") ||
       pathname.startsWith("/dashboard/quotations") ||
       pathname.startsWith("/dashboard/orders")) &&
      role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Seller paths protection
    if (
      (pathname.startsWith("/dashboard/browse") ||
       pathname.startsWith("/dashboard/my-quotations") ||
       pathname.startsWith("/dashboard/my-orders")) &&
      role !== "seller"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
