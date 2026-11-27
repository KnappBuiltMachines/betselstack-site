// Single source of truth for "can this user use the builder?"
// Access = an active Stripe subscription, OR being an added user on someone
// else's active subscription (see lib/team.js), OR a no-card free trial that
// runs for TRIAL_DAYS days from the profile's created_at (set on signup).
import { createAdminClient } from "@/lib/supabase/admin";

//
// "past_due" counts as active: a renewal charge failed and Stripe is still
// retrying it. The customer keeps access during those retries (and sees a
// banner asking them to update their card). If every retry fails, Stripe
// moves the subscription to canceled/unpaid per your Stripe retry settings,
// and access ends then.
const ACTIVE_STATUSES = ["active", "trialing", "past_due"];
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

/**
 * If this user's email is on an active subscriber's added-users list, returns
 * { ownerId, ownerEmail }. Otherwise null.
 *
 * Uses the service-role client because the owner's subscription row is not
 * readable by the member under RLS. Only ever called from server code.
 *
 * Only the first `extra_seats` rows (oldest first) count, where extra_seats is
 * the paid "Additional user" quantity on the owner's Stripe subscription. So a
 * list left over from a cancelled-then-restarted subscription never grants
 * access that isn't paid for.
 */
export async function getTeamSeat(userId) {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return null;
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .maybeSingle();

  let email = profile?.email || null;
  if (!email) {
    const { data } = await admin.auth.admin.getUserById(userId);
    email = data?.user?.email || null;
  }
  if (!email) return null;
  email = email.trim().toLowerCase();

  const { data: row } = await admin
    .from("team_members")
    .select("id, owner_id")
    .eq("email", email)
    .maybeSingle();
  if (!row || row.owner_id === userId) return null;

  const ownerSub = await getActiveSubscription(admin, row.owner_id);
  if (!ownerSub) return null;

  const seats = Number(ownerSub.extra_seats) || 0;
  if (seats < 1) return null;

  const { data: paidRows } = await admin
    .from("team_members")
    .select("id")
    .eq("owner_id", row.owner_id)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true })
    .limit(seats);
  if (!(paidRows || []).some((r) => r.id === row.id)) return null;

  const { data: owner } = await admin
    .from("profiles")
    .select("email")
    .eq("id", row.owner_id)
    .maybeSingle();

  return { ownerId: row.owner_id, ownerEmail: owner?.email || null };
}

export async function getAccess(supabase, userId) {
  const sub = await getActiveSubscription(supabase, userId);
  if (sub) {
    const reason = sub.status === "past_due" ? "past_due" : "subscription";
    return { allowed: true, reason, trialDaysLeft: 0, trialEndsAt: null };
  }

  const seat = await getTeamSeat(userId);
  if (seat) {
    return {
      allowed: true,
      reason: "team",
      trialDaysLeft: 0,
      trialEndsAt: null,
      teamOwnerEmail: seat.ownerEmail,
    };
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
