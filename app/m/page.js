import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAccess } from "@/lib/subscription";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pallet Pattern Creator \u2014 Mobile" };

export default async function MobileBuilderPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/m");

  const access = await getAccess(supabase, user.id);
  if (!access.allowed) redirect("/pricing");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "var(--ink)",
      }}
    >
      <iframe
        src="/api/mobile"
        title="Pallet Pattern Creator (Mobile)"
        style={{ width: "100%", height: "100%", border: 0 }}
      />
    </div>
  );
}
