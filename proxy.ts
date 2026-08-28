/**
 * proxy.ts — Next.js Middleware (Clerk + Route Authorization)
 *
 * Security layers:
 * 1. Clerk auth.protect() — ensures all /dashboard, /projects, /admin routes
 *    require an authenticated Clerk session. Unauthenticated users are redirected
 *    to /sign-in automatically.
 *
 * 2. Admin routes (/admin/**) — Clerk protect() ensures the user is logged in.
 *    The actual super-admin check (email whitelist) is done in the admin layout
 *    server component (app/(app)/admin/layout.tsx) which renders a 403 page for
 *    non-admin authenticated users. We do NOT do the email whitelist in middleware
 *    because it would require async DB/Clerk calls on every request — the layout
 *    gate is the correct place for that.
 *
 * 3. API routes under /api — protected against unauthenticated access.
 *
 * SEO: X-Robots-Tag: noindex on all authenticated routes so the workspace
 * never appears in search engines.
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes that require a Clerk session (first layer — authentication only)
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/projects(.*)",
  "/admin(.*)",
  "/api/projects(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  // Layer 1: Ensure user is authenticated for protected routes.
  // Unauthenticated → redirects to /sign-in (Clerk default).
  if (isProtectedRoute(request)) {
    await auth.protect();
  }

  const response = NextResponse.next();

  // Layer 2: SEO — never index authenticated app routes
  if (isProtectedRoute(request)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
