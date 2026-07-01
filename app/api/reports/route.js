import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAccess } from "@/lib/subscription";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/reports
//   (no params)  -> list the signed-in user's saved reports, newest first,
//                   WITHOUT the heavy `pdf` blob (good for list views).
//   ?id=<uuid>   -> fetch one full report (includes the `pdf` data URI).
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

  if (id) {
    const { data, error } = await supabase
      .from("reports")
      .select("id, name, pdf, created_at, updated_at")
      .eq("id", id)
      .eq("user_id", user.id) // owner filter (defense-in-depth on top of RLS)
      .single();
    if (error) return new NextResponse(error.message, { status: 404 });
    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from("reports")
    .select("id, name, created_at, updated_at")
    .eq("user_id", user.id) // owner filter (defense-in-depth on top of RLS)
    .order("created_at", { ascending: false });
  if (error) return new NextResponse(error.message, { status: 500 });

  return NextResponse.json({ reports: data });
}

// POST /api/reports  -> save a new report PDF for the signed-in user.
// Body: { name?: string, pdf: string }  (pdf is a data: URI or base64 string)
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
  if (!body || typeof body.pdf !== "string" || !body.pdf) {
    return new NextResponse("Missing report PDF", { status: 400 });
  }
  // Guard against oversized payloads (Vercel serverless body limit ~4.5MB).
  if (body.pdf.length > 4400000) {
    return new NextResponse("Report too large", { status: 413 });
  }

  const name =
    typeof body.name === "string" && body.name.trim()
      ? body.name.trim().slice(0, 160)
      : "Untitled report";

  const { data, error } = await supabase
    .from("reports")
    .insert({ user_id: user.id, name, pdf: body.pdf })
    .select("id, name, created_at, updated_at")
    .single();
  if (error) return new NextResponse(error.message, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}

// DELETE /api/reports  -> remove the signed-in user's saved report(s).
//   Accepts a single ?id=<uuid> or a JSON body { ids: [<uuid>, ...] }.
//   Only rows owned by the caller are ever deleted.
export async function DELETE(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const access = await getAccess(supabase, user.id);
  if (!access.allowed) return new NextResponse("Subscription required", { status: 403 });

  let ids = [];
  const { searchParams } = new URL(request.url);
  const qid = searchParams.get("id");
  if (qid) {
    ids = [qid];
  } else {
    try {
      const body = await request.json();
      if (Array.isArray(body?.ids)) ids = body.ids;
    } catch {
      /* no body */
    }
  }
  ids = ids.filter((x) => typeof x === "string" && x.length).slice(0, 200);
  if (!ids.length) return new NextResponse("No ids provided", { status: 400 });

  const { data, error } = await supabase
    .from("reports")
    .delete()
    .in("id", ids)
    .eq("user_id", user.id) // owner filter (defense-in-depth on top of RLS)
    .select("id");
  if (error) return new NextResponse(error.message, { status: 500 });

  return NextResponse.json({ deleted: (data || []).map((r) => r.id) });
}

// PATCH /api/reports  -> rename the signed-in user's saved report.
//   Body: { id: <uuid>, name: <string> }. Only the caller's own row is touched.
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
  const id = typeof body?.id === "string" ? body.id : "";
  const name =
    typeof body?.name === "string" && body.name.trim()
      ? body.name.trim().slice(0, 160)
      : "";
  if (!id) return new NextResponse("Missing id", { status: 400 });
  if (!name) return new NextResponse("Missing name", { status: 400 });

  const { data, error } = await supabase
    .from("reports")
    .update({ name })
    .eq("id", id)
    .eq("user_id", user.id) // owner filter (defense-in-depth on top of RLS)
    .select("id, name, updated_at")
    .single();
  if (error)
    return new NextResponse(error.message, { status: error.code === "PGRST116" ? 404 : 500 });

  return NextResponse.json(data);
}
