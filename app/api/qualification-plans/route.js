import { NextResponse } from "next/server";
import { requireMember, rowFromInputs, searchFilter, LIST_COLUMNS, STATUSES, today } from "@/lib/qualification/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/qualification-plans?q=<search>&status=<draft|in_review|approved|obsolete>
//   Lists the signed-in user's plans (newest first). Search matches plan number,
//   title, customer, product and SKU.
export async function GET(request) {
  const { supabase, user, error } = await requireMember();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";

  let query = supabase
    .from("qualification_plans")
    .select(LIST_COLUMNS)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(500);

  if (STATUSES.includes(status)) query = query.eq("status", status);
  const filter = q ? searchFilter(q) : null;
  if (filter) query = query.or(filter);

  const { data, error: dbError } = await query;
  if (dbError) return new NextResponse(dbError.message, { status: 500 });
  return NextResponse.json({ plans: data });
}

// POST /api/qualification-plans  Body: { inputs }
//   Creates a plan. The database assigns the plan number (QP-YYYY-NNNN).
export async function POST(request) {
  const { supabase, user, error } = await requireMember();
  if (error) return error;

  let body;
  try {
    body = await request.json();
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  let row;
  try {
    row = rowFromInputs(body?.inputs);
  } catch (e) {
    return new NextResponse(e.message, { status: 400 });
  }

  const { data, error: dbError } = await supabase
    .from("qualification_plans")
    .insert({
      ...row,
      user_id: user.id,
      revision: "A",
      status: "draft",
      rev_history: [{ rev: "A", date: today(), by: row.inputs.preparedBy || "", note: "Initial release" }],
    })
    .select(LIST_COLUMNS)
    .single();
  if (dbError) return new NextResponse(dbError.message, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
