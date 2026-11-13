// lib/qualification/server.js — shared helpers for the qualification-plan API routes.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAccess } from "@/lib/subscription";
import { buildPlan, emptyInputs } from "@/lib/qualification/engine";

export const LIST_COLUMNS =
  "id, plan_number, revision, status, title, customer, product_name, sku, risk_level, risk_score, created_at, updated_at";

export const STATUSES = ["draft", "in_review", "approved", "obsolete"];

const MAX_INPUT_BYTES = 200_000;

/** Signed-in user with an active subscription or trial, else an error response. */
export async function requireMember() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: new NextResponse("Unauthorized", { status: 401 }) };
  const access = await getAccess(supabase, user.id);
  if (!access.allowed) return { error: new NextResponse("Subscription required", { status: 403 }) };
  return { supabase, user };
}

const str = (v, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Validate wizard inputs and build the row fields (searchable columns + snapshot). */
export function rowFromInputs(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Missing plan inputs");
  if (JSON.stringify(raw).length > MAX_INPUT_BYTES) throw new Error("Plan is too large");

  const inputs = { ...emptyInputs(), ...raw };
  inputs.materials = Array.isArray(inputs.materials) ? inputs.materials.slice(0, 60) : [];
  inputs.customTests = Array.isArray(inputs.customTests) ? inputs.customTests.slice(0, 40) : [];
  inputs.excludedTests = Array.isArray(inputs.excludedTests)
    ? inputs.excludedTests.filter((x) => typeof x === "string").slice(0, 60)
    : [];

  const content = buildPlan(inputs);
  const product = str(inputs.productName, 160);
  return {
    title: str(inputs.title, 200) || (product ? `Qualification Plan — ${product}` : "Untitled qualification plan"),
    customer: str(inputs.customer, 160) || null,
    product_name: product || null,
    sku: str(inputs.sku, 120) || null,
    risk_level: content.risk.level,
    risk_score: content.risk.score,
    inputs,
    content,
  };
}

/** Escape a user search term for a PostgREST `or=(…ilike…)` filter. */
export function searchFilter(q) {
  const term = q.replace(/[%_\\]/g, (m) => "\\" + m).replace(/[(),"]/g, " ").trim().slice(0, 80);
  if (!term) return null;
  const like = `%${term}%`;
  return ["plan_number", "title", "customer", "product_name", "sku"]
    .map((c) => `${c}.ilike.${like}`)
    .join(",");
}

export function today() {
  return new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
