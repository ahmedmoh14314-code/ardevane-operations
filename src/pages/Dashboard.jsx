import DashboardLayout from "../features/dashboard/DashboardLayout";
import DashboardFilter from "../features/dashboard/DashboardFilter";
import PageHeader from "../ui/PageHeader";
import { useUser } from "../features/authentication/useUser";

function Dashboard() {
  const { user } = useUser();

  const firstName = user?.user_metadata?.fullName?.split(" ").at(0) ?? "there";

  return (
    <>
      <PageHeader
        variant="hero"
        eyebrow="Ardevane Operations"
        title={`Welcome back, ${firstName}`}
        description="Here's what's happening at your mountain stays today."
      >
        <DashboardFilter />
      </PageHeader>

      <DashboardLayout />
    </>
  );
}

export default Dashboard;
