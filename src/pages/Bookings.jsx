import PageHeader from "../ui/PageHeader";
import BookingTable from "../features/bookings/BookingTable";
import BookingTableOperations from "../features/bookings/BookingTableOperations";

function Bookings() {
  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="All bookings"
        description="Every stay, past and upcoming."
      >
        <BookingTableOperations />
      </PageHeader>

      <BookingTable />
    </>
  );
}

export default Bookings;
