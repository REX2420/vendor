import { NextResponse, NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const vendor_token = req.cookies.get("vendor_token");
  
  // unauthorized vendor cannot go to starting "/vendor" route.
  if (pathname.startsWith("/vendor")) {
    if (typeof vendor_token === "undefined") {
      return NextResponse.redirect(new URL("/signin", req.url));
    }
  }
  
  if (pathname === "/signin") {
    if (vendor_token) {
      return NextResponse.redirect(new URL("/vendor/dashboard", req.url));
    }
  }
  
  if (pathname === "/signup") {
    if (vendor_token) {
      return NextResponse.redirect(new URL("/vendor/dashboard", req.url));
    }
  }
  
  if (pathname.startsWith("/vendor/shop")) {
    if (typeof vendor_token === "undefined") {
      return NextResponse.redirect(new URL("/signin", req.url));
    }
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
