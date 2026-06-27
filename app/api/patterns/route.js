import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAccess } from "@/lib/subscription";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/patterns
//   (no params)  -> list the signed-in user's saved patterns, newest first,
//                   WITHOUT the heavy `data` blob (good for list views).
//   ?id=<uuid>   -> fetch one full pattern (includes `data`).
//   ?full=1      -> list including every pattern's full `data`.
export async function GET(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const access = await getAccess(supabase, user.id);
  if (!access.allowed) return new NextResponse("Subscription required", { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const full = searchParams.get("full") === "1";

  if (id) {
    const { data, error } = await supabase
      .from("patterns")
      .select("id, name, data, created_at, updated_at")
      .eq("id", id)
      .eq("user_id", user.id) // owner filter (defense-in-depth on top of RLS)
      .single();
    if (error) return new NextResponse(error.message, { status: 404 });
    return NextResponse.json(data);
  }

  const columns = full
    ? "id, name, data, created_at, updated_at"
    : "id, name, created_at, updated_at";
  const { data, error } = await supabase
    .from("patterns")
    .select(columns)
    .eq("user_id", user.id) // owner filter (defense-in-depth on top of RLS)
    .order("created_at", { ascending: false });
  if (error) return new NextResponse(error.message, { status: 500 });

  return NextResponse.json({ patterns: data });
}

// POST /api/patterns  -> save a new pattern for the signed-in user.
// Body: { name?: string, data: object }
export async function POST(request) {
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
    return new NextResponse("Missing pattern data", { status: 400 });
  }

  const name =
    typeof body.name === "string" && body.name.trim()
      ? body.name.trim().slice(0, 120)
      : "Untitled pattern";

  const { data, error } = await supabase
    .from("patterns")
    .insert({ user_id: user.id, name, data: body.data })
    .select("id, name, created_at, updated_at")
    .single();
  if (error) return new NextResponse(error.message, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
