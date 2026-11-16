import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAccess } from "@/lib/subscription";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Settings keys saved independently of the Pallet Builder's own settings.
const SEPARATE_KEYS = ["qpBranding"];
const MAX_KEY_BYTES = 700_000; // room for a compressed logo image

// GET /api/settings  -> the signed-in user's saved settings.
//   Returns { data: {...}, updated_at } or { data: {} } if none yet.
//   Keys in SEPARATE_KEYS are left out unless asked for with ?with=<key>,
//   so the Pallet Builder never loads (or re-saves) them.
export async function GET(request) {
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

  const want = new URL(request.url).searchParams.getAll("with");
  const out = { ...(data?.data || {}) };
  for (const k of SEPARATE_KEYS) if (!want.includes(k)) delete out[k];
  return NextResponse.json(data ? { ...data, data: out } : { data: {} });
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

  // Keys owned by other tools (e.g. Qualification Plan branding) are kept as
  // they are on the server, so a full save from the Pallet Builder never
  // overwrites them with a stale copy. Those keys change only through PATCH.
  const { data: existing } = await supabase
    .from("user_settings")
    .select("data")
    .eq("user_id", user.id)
    .maybeSingle();
  const merged = { ...body.data };
  for (const k of SEPARATE_KEYS) {
    if (existing?.data && k in existing.data) merged[k] = existing.data[k];
    else delete merged[k];
  }

  const { data, error } = await supabase
    .from("user_settings")
    .upsert(
      { user_id: user.id, data: merged, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    )
    .select("data, updated_at")
    .single();
  if (error) return new NextResponse(error.message, { status: 500 });

  return NextResponse.json(data, { status: 200 });
}

// PATCH /api/settings  -> update one separately-owned key without touching the rest.
// Body: { key: "qpBranding", value: object | null }
export async function PATCH(request) {
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
  if (!body || !SEPARATE_KEYS.includes(body.key)) return new NextResponse("Unknown settings key", { status: 400 });
  if (body.value !== null && (typeof body.value !== "object" || Array.isArray(body.value))) {
    return new NextResponse("Invalid settings value", { status: 400 });
  }
  if (JSON.stringify(body.value ?? null).length > MAX_KEY_BYTES) {
    return new NextResponse("Settings too large — try a smaller logo image", { status: 413 });
  }

  const { data: existing, error: readError } = await supabase
    .from("user_settings")
    .select("data")
    .eq("user_id", user.id)
    .maybeSingle();
  if (readError) return new NextResponse(readError.message, { status: 500 });

  const next = { ...(existing?.data || {}) };
  if (body.value === null) delete next[body.key];
  else next[body.key] = body.value;

  const { data, error } = await supabase
    .from("user_settings")
    .upsert({ user_id: user.id, data: next, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
    .select("data, updated_at")
    .single();
  if (error) return new NextResponse(error.message, { status: 500 });

  return NextResponse.json(data, { status: 200 });
}
