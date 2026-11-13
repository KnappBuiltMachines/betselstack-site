import { notFound } from "next/navigation";
import { requirePlanAccess, loadPlan } from "@/lib/qualification/guard";
import PlanWizard from "@/components/qualification/PlanWizard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit Qualification Plan" };

export default async function EditQualificationPlanPage({ params }) {
  const { id } = await params;
  const { supabase, user } = await requirePlanAccess(`/qualification-plans/${id}/edit`);
  const plan = await loadPlan(supabase, user.id, id);
  if (!plan) notFound();
  return <PlanWizard plan={plan} />;
}
