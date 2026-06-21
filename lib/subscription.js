// Single source of truth for "can this user use the builder?"
// Access = an active Stripe subscription OR a no-card free trial that runs
// for TRIAL_DAYS days from the profile's created_at (set on signup).
const ACTIVE_STATUSES = ["active", "trialing"];
export const TRIAL_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export async function getActiveSubscription(supabase, userId) {
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("current_period_end", { ascending: false })
    .limit(1);

  const sub = data?.[0];
  if (sub && ACTIVE_STATUSES.includes(sub.status)) return sub;
  return null;
}

export async function getAccess(supabase, userId) {
  const sub = await getActiveSubscription(supabase, userId);
  if (sub) {
    return { allowed: true, reason: "subscription", trialDaysLeft: 0, trialEndsAt: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("created_at")
    .eq("id", userId)
    .single();

  if (profile?.created_at) {
    const end = new Date(profile.created_at).getTime() + TRIAL_DAYS * DAY_MS;
    const now = Date.now();
    const trialEndsAt = new Date(end).toISOString();
    if (now < end) {
      const daysLeft = Math.max(1, Math.ceil((end - now) / DAY_MS));
      return { allowed: true, reason: "trial", trialDaysLeft: daysLeft, trialEndsAt };
    }
    return { allowed: false, reason: "expired", trialDaysLeft: 0, trialEndsAt };
  }

  return { allowed: false, reason: "none", trialDaysLeft: 0, trialEndsAt: null };
}
