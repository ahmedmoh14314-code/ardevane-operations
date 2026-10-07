import styled from "styled-components";
import { format } from "date-fns";

import BookingDataBox from "../../features/bookings/BookingDataBox";
import StayFolio from "../folio/StayFolio";
import Row from "../../ui/Row";
import Heading from "../../ui/Heading";
import ButtonGroup from "../../ui/ButtonGroup";
import Button from "../../ui/Button";
import ButtonText from "../../ui/ButtonText";
import Breadcrumb from "../../ui/Breadcrumb";
import Spinner from "../../ui/Spinner";

import { useMoveBack } from "../../hooks/useMoveBack";
import { useBooking } from "../bookings/useBooking";
import { useCheckin } from "./useCheckin";
import { hasArrived, toDay } from "../../utils/helpers";
import { bookingStatus } from "../../utils/constants";

const Notice = styled.p`
  font-size: 1.5rem;
  color: var(--color-grey-600);
`;

// Checking in no longer depends on payment: the desk can take cash on the
// folio below now, later in the stay, or at checkout.
function CheckinBooking() {
  const { booking, isLoading } = useBooking();
  const moveBack = useMoveBack();
  const { checkin, isCheckingIn } = useCheckin();

  if (isLoading) return <Spinner />;

  const { id: bookingId, reference, status, startDate } = booking;
  const canCheckIn = status === "reserved" && hasArrived(startDate);

  return (
    <>
      <Breadcrumb to={`/bookings/${bookingId}`} parent="Booking">
        Check in
      </Breadcrumb>

      <Row type="horizontal">
        <Heading as="h1">Check in {reference}</Heading>
        <ButtonText onClick={moveBack}>&larr; Back</ButtonText>
      </Row>

      <BookingDataBox booking={booking} />

      {/* The database refuses these too; this just says why up front */}
      {status !== "reserved" && (
        <Notice>
          This booking is {bookingStatus(status).label.toLowerCase()}, so it
          can't be checked in.
        </Notice>
      )}

      {status === "reserved" && !hasArrived(startDate) && (
        <Notice>
          This stay starts on {format(toDay(startDate), "EEEE, MMM d")}. Check
          in opens on the arrival day.
        </Notice>
      )}

      <StayFolio booking={booking} />

      <ButtonGroup>
        {canCheckIn && (
          <Button onClick={() => checkin(bookingId)} disabled={isCheckingIn}>
            Check in {reference}
          </Button>
        )}
        <Button variation="secondary" onClick={moveBack}>
          Back
        </Button>
      </ButtonGroup>
    </>
  );
}

export default CheckinBooking;
