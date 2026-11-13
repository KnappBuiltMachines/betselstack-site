import { requirePlanAccess } from "@/lib/qualification/guard";
import PlanList from "@/components/qualification/PlanList";

export const dynamic = "force-dynamic";

export default async function QualificationPlansPage() {
  await requirePlanAccess("/qualification-plans");
  return <PlanList />;
}
