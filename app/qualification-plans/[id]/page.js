import { notFound } from "next/navigation";
import { requirePlanAccess, loadPlan } from "@/lib/qualification/guard";
import PlanViewer from "@/components/qualification/PlanViewer";

export const dynamic = "force-dynamic";

export default async function QualificationPlanPage({ params }) {
  const { id } = await params;
  const { supabase, user } = await requirePlanAccess(`/qualification-plans/${id}`);
  const plan = await loadPlan(supabase, user.id, id);
  if (!plan) notFound();
  return <PlanViewer initialPlan={plan} />;
}
