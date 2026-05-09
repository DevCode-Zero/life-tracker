import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect all app routes
  const protectedPaths = [
    "/dashboard",
    "/habits",
    "/budget",
    "/nutrition",
    "/workout",
    "/settings",
  ];
  const isProtected = protectedPaths.some((p) =>
    request.nextUrl.pathname.startsWith(p),
  );

  if (isProtected) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // Redirect logged-in users from home/login to dashboard
  if (
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/auth/login")
  ) {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/habits/:path*",
    "/budget/:path*",
    "/nutrition/:path*",
    "/workout/:path*",
    "/settings/:path*",
    "/auth/login",
  ],
};
