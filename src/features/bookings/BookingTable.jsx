import { useSearchParams } from "react-router-dom";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineRectangleStack,
} from "react-icons/hi2";

import BookingRow from "./BookingRow";
import { useBookings } from "./useBookings";

import Table from "../../ui/Table";
import Menus from "../../ui/Menus";
import Button from "../../ui/Button";
import Pagination from "../../ui/Pagination";
import EmptyState from "../../ui/EmptyState";
import ErrorMessage from "../../ui/ErrorMessage";
import { TableSkeleton } from "../../ui/Skeleton";

function BookingTable() {
  const { bookings, isLoading, error, count, search } = useBookings();
  const [searchParams, setSearchParams] = useSearchParams();

  const status = searchParams.get("status");
  const hasFilter = Boolean(search) || (status && status !== "all");

  function clearFilters() {
    searchParams.delete("search");
    searchParams.delete("status");
    searchParams.delete("page");
    setSearchParams(searchParams);
  }

  if (isLoading) return <TableSkeleton rows={8} />;

  if (error) return <ErrorMessage>{error.message}</ErrorMessage>;

  // Nothing matched, so say what was looked for and offer the way back
  if (!bookings.length && hasFilter)
    return (
      <EmptyState
        icon={<HiOutlineMagnifyingGlass />}
        title={search ? `No booking matches "${search}"` : "No bookings here"}
        description={
          status && status !== "all"
            ? `Nothing found with the status "${status.replace("-", " ")}".`
            : "Try a different guest name, email, cabin or booking id."
        }
        action={
          <Button onClick={clearFilters}>Clear search and filters</Button>
        }
      />
    );

  if (!bookings.length)
    return (
      <EmptyState
        icon={<HiOutlineRectangleStack />}
        title="No bookings yet"
        description="New reservations will show up here as soon as they are created."
      />
    );

  return (
    <Menus>
      <Table
        columns="1.5fr 2.2fr 1.9fr 1.3fr 1.1fr 10rem 3.2rem"
        label="Bookings"
      >
        <Table.Header>
          <div>Cabin</div>
          <div>Guest</div>
          <div>Dates</div>
          <div>Status</div>
          <div>Amount</div>
          <div></div>
          <div></div>
        </Table.Header>

        <Table.Body
          data={bookings}
          render={(booking) => (
            <BookingRow key={booking.id} booking={booking} />
          )}
        />

        <Table.Footer>
          <Pagination count={count} />
        </Table.Footer>
      </Table>
    </Menus>
  );
}

export default BookingTable;
