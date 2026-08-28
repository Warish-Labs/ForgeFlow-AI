import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/projects(.*)",
  "/admin(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  // Protect authenticated app routes
  if (isProtectedRoute(request)) {
    await auth.protect();
  }

  const response = NextResponse.next();

  // Apply X-Robots-Tag: noindex on all authenticated app routes
  // This keeps the workspace out of search engines (PRD SEO requirement)
  if (isProtectedRoute(request)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
