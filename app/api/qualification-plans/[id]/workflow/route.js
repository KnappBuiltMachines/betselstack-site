import { NextResponse } from "next/server";
import { requireMember, FULL_COLUMNS } from "@/lib/qualification/server";
import { approversOf, buildPlan, RESULT_OPTIONS, OUTCOME_LABELS } from "@/lib/qualification/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const str = (v, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const bad = (msg, status = 400) => new NextResponse(msg, { status });

// POST /api/qualification-plans/:id/workflow   Body: { action, ... }
//
//   submit                      Draft -> In review (signatures start empty)
//   sign      { approverId, name, confirm: true }
//                               Records an electronic signature with a SERVER
//                               timestamp. When every approver has signed, the
//                               plan becomes Approved automatically.
//   withdraw                    In review -> Draft (clears signatures)
//   results   { results: { [testId]: { result, date, value, by } } }
//                               Approved plans only. Does not change the plan.
//   complete  { outcome, notes, name }
//                               Approved -> Completed with a qualification outcome
//   reopen                      Completed -> Approved (to correct results)
//   obsolete                    Any -> Obsolete
export async function POST(request, { params }) {
  const { id } = await params;
  const { supabase, user, error } = await requireMember();
  if (error) return error;

  let body;
  try {
    body = await request.json();
  } catch {
    return bad("Invalid JSON");
  }

  const { data: plan, error: loadError } = await supabase
    .from("qualification_plans")
    .select(FULL_COLUMNS)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (loadError) return bad("Not found", 404);

  const now = new Date().toISOString();
  const approvals = Array.isArray(plan.approvals) ? plan.approvals : [];
  let update = null;

  switch (body?.action) {
    case "submit": {
      if (plan.status !== "draft") return bad("Only draft plans can be submitted for approval.", 409);
      update = { status: "in_review", approvals: [], approved_at: null };
      break;
    }

    case "withdraw": {
      if (plan.status !== "in_review") return bad("Only plans in review can be withdrawn.", 409);
      update = { status: "draft", approvals: [] };
      break;
    }

    case "sign": {
      if (plan.status !== "in_review") return bad("Submit the plan for approval before signing.", 409);
      const approvers = approversOf(plan.inputs);
      const approver = approvers.find((a) => a.id === body.approverId);
      if (!approver) return bad("Unknown approver role.");
      if (approvals.some((a) => a.approverId === approver.id)) return bad(`${approver.role} has already signed.`, 409);
      const name = str(body.name, 120);
      if (name.length < 2) return bad("Type your full name to sign.");
      if (body.confirm !== true) return bad("Confirm the approval statement to sign.");

      const next = [
        ...approvals,
        { approverId: approver.id, role: approver.role, name, email: user.email || "", userId: user.id, signedAt: now },
      ];
      const allSigned = approvers.every((a) => next.some((s) => s.approverId === a.id));
      update = { approvals: next, ...(allSigned ? { status: "approved", approved_at: now } : {}) };
      break;
    }

    case "results": {
      if (plan.status !== "approved") return bad("Results can be recorded once the plan is approved.", 409);
      const content = plan.content?.tests ? plan.content : buildPlan(plan.inputs);
      const ids = new Set([...(content.tests || []), ...(content.lineTrials || [])].map((t) => t.id));
      const incoming = body.results && typeof body.results === "object" ? body.results : {};
      const tests = { ...(plan.results?.tests || {}) };
      for (const [tid, r] of Object.entries(incoming)) {
        if (!ids.has(tid) || !r || typeof r !== "object") continue;
        tests[tid] = {
          result: RESULT_OPTIONS.includes(r.result) ? r.result : "",
          date: str(r.date, 20),
          value: str(r.value, 1000),
          by: str(r.by, 120),
          updatedAt: now,
        };
      }
      update = { results: { ...(plan.results || {}), tests } };
      break;
    }

    case "complete": {
      if (plan.status !== "approved") return bad("Only approved plans can be completed.", 409);
      if (!OUTCOME_LABELS[body.outcome]) return bad("Choose a qualification outcome.");
      const name = str(body.name, 120);
      if (name.length < 2) return bad("Type your full name to complete the qualification.");
      update = {
        status: "completed",
        completed_at: now,
        results: {
          ...(plan.results || {}),
          conclusion: { outcome: body.outcome, notes: str(body.notes, 4000), name, email: user.email || "", userId: user.id, at: now },
        },
      };
      break;
    }

    case "reopen": {
      if (plan.status !== "completed") return bad("Only completed plans can be reopened.", 409);
      const { conclusion, ...rest } = plan.results || {};
      update = { status: "approved", completed_at: null, results: rest };
      break;
    }

    case "obsolete": {
      update = { status: "obsolete" };
      break;
    }

    default:
      return bad("Unknown action.");
  }

  const { data, error: dbError } = await supabase
    .from("qualification_plans")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id)
    .select(FULL_COLUMNS)
    .single();
  if (dbError) return bad(dbError.message, 500);
  return NextResponse.json(data);
}
