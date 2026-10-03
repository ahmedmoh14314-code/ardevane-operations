import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { HiOutlineCalendarDays } from "react-icons/hi2";

import Table from "../../ui/Table";
import Tag from "../../ui/Tag";
import Button from "../../ui/Button";
import EmptyState from "../../ui/EmptyState";
import { formatCurrency } from "../../utils/helpers";

const STATUS_COLOR = {
  unconfirmed: "blue",
  "checked-in": "green",
  "checked-out": "silver",
};

function formatDay(date) {
  return format(new Date(date), "MMM dd yyyy");
}

function GuestBookings({ bookings }) {
  const navigate = useNavigate();

  if (!bookings.length)
    return (
      <EmptyState
        icon={<HiOutlineCalendarDays />}
        title="No bookings yet"
        description="This guest has no reservation history on record."
      />
    );

  return (
    <Table columns="1fr 2.4fr 1.2fr 0.8fr 1fr 6rem" label="Booking history">
      <Table.Header>
        <div>Cabin</div>
        <div>Dates</div>
        <div>Status</div>
        <div>Nights</div>
        <div>Amount</div>
        <div></div>
      </Table.Header>

      <Table.Body
        data={bookings}
        render={(booking) => (
          <Table.Row key={booking.id}>
            <span>{booking.cabins?.name || "—"}</span>

            <span>
              {formatDay(booking.startDate)} &mdash;{" "}
              {formatDay(booking.endDate)}
            </span>

            <Tag type={STATUS_COLOR[booking.status] || "silver"}>
              {booking.status.replace("-", " ")}
            </Tag>

            <span>{booking.numNights}</span>

            <span>{formatCurrency(booking.totalPrice)}</span>

            <Button
              size="small"
              variation="secondary"
              onClick={() => navigate(`/bookings/${booking.id}`)}
            >
              Open
            </Button>
          </Table.Row>
        )}
      />
    </Table>
  );
}

export default GuestBookings;
