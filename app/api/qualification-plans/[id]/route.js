import { NextResponse } from "next/server";
import { requireMember, rowFromInputs, FULL_COLUMNS, today } from "@/lib/qualification/server";
import { nextRevision } from "@/lib/qualification/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function load(supabase, userId, id) {
  return supabase
    .from("qualification_plans")
    .select(FULL_COLUMNS)
    .eq("id", id)
    .eq("user_id", userId) // owner filter (defense-in-depth on top of RLS)
    .single();
}

// GET /api/qualification-plans/:id -> one full plan
export async function GET(_request, { params }) {
  const { id } = await params;
  const { supabase, user, error } = await requireMember();
  if (error) return error;

  const { data, error: dbError } = await load(supabase, user.id, id);
  if (dbError) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(data);
}

// PATCH /api/qualification-plans/:id — edit the plan content.
//   { inputs }                                   -> save edits (Draft / In review only)
//   { inputs, newRevision: true, revisionNote }  -> save as next revision (A -> B)
// Editing an "In review" plan clears any signatures and returns it to Draft.
// Approved / Completed plans can only change through a new revision, which
// clears signatures and results so the new revision is approved and tested on its own.
// Status changes (submit, sign, results, complete, obsolete) go through /workflow.
export async function PATCH(request, { params }) {
  const { id } = await params;
  const { supabase, user, error } = await requireMember();
  if (error) return error;

  let body;
  try {
    body = await request.json();
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }
  if (!body?.inputs) return new NextResponse("Nothing to update", { status: 400 });

  const { data: current, error: loadError } = await load(supabase, user.id, id);
  if (loadError) return new NextResponse("Not found", { status: 404 });

  const locked = ["approved", "completed", "obsolete"].includes(current.status);
  if (locked && !body.newRevision) {
    return new NextResponse("Approved, completed or obsolete plans can only be changed by creating a new revision.", { status: 409 });
  }

  let update;
  try {
    update = rowFromInputs(body.inputs);
  } catch (e) {
    return new NextResponse(e.message, { status: 400 });
  }

  if (body.newRevision) {
    const rev = nextRevision(current.revision);
    const note =
      typeof body.revisionNote === "string" && body.revisionNote.trim()
        ? body.revisionNote.trim().slice(0, 300)
        : "Revised";
    Object.assign(update, {
      revision: rev,
      status: "draft",
      approvals: [],
      approved_at: null,
      results: {},
      completed_at: null,
      rev_history: [
        ...(Array.isArray(current.rev_history) ? current.rev_history : []),
        { rev, date: today(), by: update.inputs.preparedBy || "", note },
      ],
    });
  } else if (current.status === "in_review") {
    Object.assign(update, { status: "draft", approvals: [] });
  }

  const { data, error: dbError } = await supabase
    .from("qualification_plans")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id)
    .select(FULL_COLUMNS)
    .single();
  if (dbError) return new NextResponse(dbError.message, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/qualification-plans/:id
export async function DELETE(_request, { params }) {
  const { id } = await params;
  const { supabase, user, error } = await requireMember();
  if (error) return error;

  const { data, error: dbError } = await supabase
    .from("qualification_plans")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");
  if (dbError) return new NextResponse(dbError.message, { status: 500 });
  if (!data?.length) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json({ deleted: id });
}
