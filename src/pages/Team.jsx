import SignupForm from "../features/authentication/SignupForm";
import PageHeader from "../ui/PageHeader";

// Team = the employees who can sign in to the dashboard.
// Guests are the people staying at the property, and they live under /guests.
function Team() {
  return (
    <>
      <PageHeader
        eyebrow="Management"
        title="Team"
        description="Add an employee who can sign in to the dashboard."
      />

      <SignupForm />
    </>
  );
}

export default Team;
