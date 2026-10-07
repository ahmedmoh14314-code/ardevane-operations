import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { HiArrowUpOnSquare } from "react-icons/hi2";

import BookingDataBox from "./BookingDataBox";
import BookingStatusTag from "./BookingStatusTag";
import Row from "../../ui/Row";
import Heading from "../../ui/Heading";
import ButtonGroup from "../../ui/ButtonGroup";
import Button from "../../ui/Button";
import ButtonText from "../../ui/ButtonText";
import Breadcrumb from "../../ui/Breadcrumb";
import Spinner from "../../ui/Spinner";
import Modal from "../../ui/Modal";
import ConfirmAction from "../../ui/ConfirmAction";
import Empty from "../../ui/Empty";

import { useMoveBack } from "../../hooks/useMoveBack";
import { useBooking } from "./useBooking";
import { useCheckout } from "../check-in-out/useCheckout";
import { useCancelBooking } from "./useCancelBooking";
import { useNoShow } from "./useNoShow";
import { hasArrived, todayISO } from "../../utils/helpers";
import { BOOKING_SOURCES } from "../../utils/constants";

const HeadingGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem 2.4rem;
  align-items: center;
`;

const Source = styled.span`
  font-size: 1.4rem;
  color: var(--color-grey-500);
`;

function BookingDetail() {
  const { booking, isLoading } = useBooking();
  const { checkout, isCheckingOut } = useCheckout();
  const { cancelBooking, isCancelling } = useCancelBooking();
  const { markNoShow, isMarkingNoShow } = useNoShow();

  const moveBack = useMoveBack();
  const navigate = useNavigate();

  if (isLoading) return <Spinner />;

  if (!booking) return <Empty resourceName="booking" />;

  const { status, id: bookingId, reference, source, startDate } = booking;

  // Check in from the arrival day; a no-show only once that day has passed
  const isReserved = status === "reserved";
  const canCheckIn = isReserved && hasArrived(startDate);
  const canMarkNoShow = isReserved && startDate < todayISO();

  return (
    <>
      <Breadcrumb to="/bookings" parent="Bookings">
        Booking {reference}
      </Breadcrumb>

      <Row type="horizontal">
        <HeadingGroup>
          <Heading as="h1">Booking {reference}</Heading>
          <BookingStatusTag status={status} />
          <Source>Booked via {BOOKING_SOURCES[source]}</Source>
        </HeadingGroup>
        <ButtonText onClick={moveBack}>&larr; Back</ButtonText>
      </Row>

      <BookingDataBox booking={booking} />

      <ButtonGroup>
        {canCheckIn && (
          <Button onClick={() => navigate(`/checkin/${bookingId}`)}>
            Check in
          </Button>
        )}

        {status === "checked_in" && (
          <Button
            variation="secondary"
            onClick={() => checkout(bookingId)}
            disabled={isCheckingOut}
          >
            <HiArrowUpOnSquare />
            <span>Check out</span>
          </Button>
        )}

        <Modal>
          {canMarkNoShow && (
            <Modal.Open opens="no-show">
              <Button variation="secondary">Mark as no-show</Button>
            </Modal.Open>
          )}

          {isReserved && (
            <Modal.Open opens="cancel">
              <Button variation="danger">Cancel booking</Button>
            </Modal.Open>
          )}

          <Modal.Window name="cancel">
            <ConfirmAction
              title={`Cancel ${reference}`}
              message="The stay will be cancelled and its nights freed. The booking stays on record."
              confirmLabel="Cancel booking"
              disabled={isCancelling}
              onConfirm={() => cancelBooking(bookingId)}
            />
          </Modal.Window>

          <Modal.Window name="no-show">
            <ConfirmAction
              title="The guest didn't arrive"
              message={`${reference} will be marked as a no-show and its remaining nights freed. The booking stays on record.`}
              confirmLabel="Mark as no-show"
              disabled={isMarkingNoShow}
              onConfirm={() => markNoShow(bookingId)}
            />
          </Modal.Window>
        </Modal>

        <Button variation="secondary" onClick={moveBack}>
          Back
        </Button>
      </ButtonGroup>
    </>
  );
}

export default BookingDetail;
