import { requirePlanAccess } from "@/lib/qualification/guard";
import PlanWizard from "@/components/qualification/PlanWizard";

export const dynamic = "force-dynamic";
export const metadata = { title: "New Qualification Plan" };

export default async function NewQualificationPlanPage() {
  await requirePlanAccess("/qualification-plans/new");
  return <PlanWizard />;
}
