import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// CRM routes that require authentication
const PROTECTED_PATHS = ["/schedule", "/templates", "/clients", "/tasks", "/settings"];

function isProtectedRoute(path: string) {
  return PROTECTED_PATHS.some((p) => path.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // For protected CRM routes and /login — use full session handling (redirect if not authed)
  if (isProtectedRoute(path) || path === "/login") {
    return await updateSession(request);
  }

  // For public routes — just pass through, no auth required
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
