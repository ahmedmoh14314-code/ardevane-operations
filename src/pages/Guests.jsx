import GuestTable from "../features/guests/GuestTable";
import GuestTableOperations from "../features/guests/GuestTableOperations";
import PageHeader from "../ui/PageHeader";

function Guests() {
  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Guests"
        description="Everyone who has ever stayed with you."
      >
        <GuestTableOperations />
      </PageHeader>

      <GuestTable />
    </>
  );
}

export default Guests;
