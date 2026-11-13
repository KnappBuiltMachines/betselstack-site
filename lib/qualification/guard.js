// Server-side page guard for the Qualification Plan Creator.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAccess } from "@/lib/subscription";

export async function requirePlanAccess(nextPath) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  const access = await getAccess(supabase, user.id);
  if (!access.allowed) redirect("/account");
  return { supabase, user, access };
}

export async function loadPlan(supabase, userId, id) {
  const { data } = await supabase
    .from("qualification_plans")
    .select("id, plan_number, revision, status, title, customer, product_name, sku, risk_level, risk_score, inputs, content, rev_history, created_at, updated_at")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}
