import UpdateSettingsForm from "../features/settings/UpdateSettingsForm";
import PageHeader from "../ui/PageHeader";

function Settings() {
  return (
    <>
      <PageHeader
        eyebrow="Management"
        title="Hotel settings"
        description="The defaults every new booking is priced against."
      />

      <UpdateSettingsForm />
    </>
  );
}

export default Settings;
