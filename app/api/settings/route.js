import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAccess } from "@/lib/subscription";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/settings  -> the signed-in user's saved settings.
//   Returns { data: {...}, updated_at } or { data: {} } if none yet.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const access = await getAccess(supabase, user.id);
  if (!access.allowed) return new NextResponse("Subscription required", { status: 403 });

  const { data, error } = await supabase
    .from("user_settings")
    .select("data, updated_at")
    .eq("user_id", user.id) // owner filter (defense-in-depth on top of RLS)
    .maybeSingle();
  if (error) return new NextResponse(error.message, { status: 500 });

  return NextResponse.json(data || { data: {} });
}

// PUT /api/settings  -> create or update the signed-in user's settings.
// Body: { data: object }
export async function PUT(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const access = await getAccess(supabase, user.id);
  if (!access.allowed) return new NextResponse("Subscription required", { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }
  if (!body || typeof body.data !== "object" || body.data === null) {
    return new NextResponse("Missing settings data", { status: 400 });
  }

  const { data, error } = await supabase
    .from("user_settings")
    .upsert(
      { user_id: user.id, data: body.data, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    )
    .select("data, updated_at")
    .single();
  if (error) return new NextResponse(error.message, { status: 500 });

  return NextResponse.json(data, { status: 200 });
}
