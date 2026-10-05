// Handles the email-confirmation / password-reset redirect from Supabase.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/safe-next";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Only same-site paths are allowed; anything else goes to /account.
  const next = safeNext(searchParams.get("next"), "/account");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback] code exchange failed:", error.message);
      return NextResponse.redirect(`${origin}/login?error=link_expired`);
    }
  }
  return NextResponse.redirect(`${origin}${next}`);
}
