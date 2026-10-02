import Search from "../../ui/Search";
import SortBy from "../../ui/SortBy";
import Filter from "../../ui/Filter";
import TableOperations from "../../ui/TableOperations";
import { useBookingCounts } from "./useBookingCounts";

function BookingTableOperations() {
  const { counts } = useBookingCounts();

  // Until the counts arrive the filter shows plain labels
  const countOf = (status) => (counts ? counts[status] || 0 : undefined);

  return (
    <TableOperations>
      <Search
        placeholder="Search guest, email, cabin or #id..."
        label="Search bookings"
      />

      <Filter
        filterField="status"
        options={[
          { value: "all", label: "All", count: countOf("all") },
          {
            value: "checked-out",
            label: "Checked out",
            count: countOf("checked-out"),
          },
          {
            value: "checked-in",
            label: "Checked in",
            count: countOf("checked-in"),
          },
          {
            value: "unconfirmed",
            label: "Unconfirmed",
            count: countOf("unconfirmed"),
          },
        ]}
      />

      <SortBy
        options={[
          { value: "startDate-desc", label: "Sort by date (recent first)" },
          { value: "startDate-asc", label: "Sort by date (earlier first)" },
          { value: "totalPrice-desc", label: "Sort by amount (high first)" },
          { value: "totalPrice-asc", label: "Sort by amount (low first)" },
        ]}
      />
    </TableOperations>
  );
}

export default BookingTableOperations;
