// proxy.js — runs before every page request (Next.js 16 name for "middleware").
//
// Keeps people signed in: Supabase access tokens expire about every hour. Server
// pages can READ cookies but can't WRITE them, so without this step a refreshed
// token was never saved and the user was eventually signed out. Here we refresh
// the session (when needed) and write the new cookies onto the response.
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request) {
  // Visitors who have never signed in have no Supabase cookie — nothing to do.
  const hasSession = request.cookies.getAll().some((c) => c.name.startsWith("sb-"));
  if (!hasSession) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  // Refreshes the session if the access token has expired (do not remove).
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    // Everything except static files, images, and server-to-server endpoints
    // (Stripe / Supabase webhooks and cron jobs never carry a user session).
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|api/cron|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|pdf|txt|xml)$).*)",
  ],
};
