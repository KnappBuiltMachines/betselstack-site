import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAccess } from "@/lib/subscription";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pallet Pattern Creator" };

export default async function BuilderPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/builder");

  const access = await getAccess(supabase, user.id);
  if (!access.allowed) redirect("/pricing");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        background: "var(--ink)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "2px solid var(--amber)",
          padding: "10px 16px",
        }}
      >
        <Link href="/" style={{ fontFamily: "var(--display)", fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--amber)" }}>
          &larr; Betsel Stack
        </Link>
        <Link href="/account" style={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>
          Account
        </Link>
      </div>

      {access.reason === "past_due" && (
        <div style={{ borderBottom: "1px solid rgba(255,107,107,0.5)", background: "rgba(255,107,107,0.12)", color: "#ff8a8a", textAlign: "center", padding: "8px 16px", fontSize: 14 }}>
          Your last payment didn&rsquo;t go through.{" "}
          <Link href="/account" style={{ fontWeight: 600, textDecoration: "underline" }}>
            Update your card to keep access &rarr;
          </Link>
        </div>
      )}

      {access.reason === "trial" && (
        <div style={{ borderBottom: "1px solid rgba(253,180,16,0.4)", background: "rgba(253,180,16,0.1)", color: "var(--amber)", textAlign: "center", padding: "8px 16px", fontSize: 14 }}>
          Free trial &mdash;{" "}
          <strong>
            {access.trialDaysLeft} day{access.trialDaysLeft === 1 ? "" : "s"} left
          </strong>
          . No card on file yet.{" "}
          <Link href="/pricing" style={{ fontWeight: 600, textDecoration: "underline" }}>
            Subscribe to keep access &rarr;
          </Link>
        </div>
      )}

      <iframe
        src="/api/builder"
        title="Pallet Pattern Creator"
        style={{ flex: 1, width: "100%", border: 0, minHeight: 0 }}
      />
    </div>
  );
}
