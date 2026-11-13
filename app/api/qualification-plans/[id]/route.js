import { NextResponse } from "next/server";
import { requireMember, rowFromInputs, LIST_COLUMNS, STATUSES, today } from "@/lib/qualification/server";
import { nextRevision } from "@/lib/qualification/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FULL = `${LIST_COLUMNS}, inputs, content, rev_history`;

async function load(supabase, userId, id) {
  return supabase
    .from("qualification_plans")
    .select(FULL)
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

// PATCH /api/qualification-plans/:id
//   Body (any of):
//     { inputs }                       -> save edits (regenerates the plan)
//     { inputs, newRevision: true, revisionNote }
//                                      -> save as next revision (A -> B) and log it
//     { status }                       -> draft | in_review | approved | obsolete
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

  const { data: current, error: loadError } = await load(supabase, user.id, id);
  if (loadError) return new NextResponse("Not found", { status: 404 });

  const update = {};

  if (body?.inputs) {
    if (current.status === "approved" && !body.newRevision) {
      return new NextResponse("Approved plans can only be changed by creating a new revision.", { status: 409 });
    }
    try {
      Object.assign(update, rowFromInputs(body.inputs));
    } catch (e) {
      return new NextResponse(e.message, { status: 400 });
    }
    if (body.newRevision) {
      const rev = nextRevision(current.revision);
      const note =
        typeof body.revisionNote === "string" && body.revisionNote.trim()
          ? body.revisionNote.trim().slice(0, 300)
          : "Revised";
      update.revision = rev;
      update.status = "draft";
      update.rev_history = [
        ...(Array.isArray(current.rev_history) ? current.rev_history : []),
        { rev, date: today(), by: update.inputs.preparedBy || "", note },
      ];
    }
  }

  if (typeof body?.status === "string" && !body.newRevision) {
    if (!STATUSES.includes(body.status)) return new NextResponse("Invalid status", { status: 400 });
    update.status = body.status;
  }

  if (!Object.keys(update).length) return new NextResponse("Nothing to update", { status: 400 });

  const { data, error: dbError } = await supabase
    .from("qualification_plans")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id)
    .select(FULL)
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
