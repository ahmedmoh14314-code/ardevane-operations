import UpdateSettingsForm from "../features/settings/UpdateSettingsForm";
import PageHeader from "../ui/PageHeader";

function Settings() {
  return (
    <>
      <PageHeader
        eyebrow="Management"
        title="Hotel settings"
        description="Configure your booking rules and pricing to match your property."
      />

      <UpdateSettingsForm />
    </>
  );
}

export default Settings;
