// Server-side page guard for the Qualification Plan Creator.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAccess } from "@/lib/subscription";
import { FULL_COLUMNS } from "@/lib/qualification/server";

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
    .select(FULL_COLUMNS)
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}
