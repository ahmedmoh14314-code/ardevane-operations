import styled from "styled-components";
import { format, isToday } from "date-fns";
import {
  HiArrowDownOnSquare,
  HiArrowUpOnSquare,
  HiBanknotes,
  HiCheckCircle,
  HiEye,
  HiOutlineCalendarDays,
  HiOutlineChatBubbleLeftEllipsis,
  HiOutlineUserMinus,
  HiXCircle,
} from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

import Table from "../../ui/Table";
import Modal from "../../ui/Modal";
import Menus from "../../ui/Menus";
import ConfirmAction from "../../ui/ConfirmAction";
import InitialsAvatar from "../../ui/InitialsAvatar";
import Button from "../../ui/Button";

import {
  formatCurrency,
  formatDistanceFromNow,
  hasArrived,
  toDay,
  todayISO,
} from "../../utils/helpers";
import { BOOKING_SOURCES } from "../../utils/constants";
import { paymentState } from "../../utils/folio";
import { useCheckout } from "../check-in-out/useCheckout";
import { useCabins } from "../cabins/useCabins";
import { useCancelBooking } from "./useCancelBooking";
import { useNoShow } from "./useNoShow";
import { useAnswerBookingRequest } from "./useBookingRequests";
import BookingStatusTag from "./BookingStatusTag";

// A picture and two lines of text side by side: cabin, guest
const Pair = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  min-width: 0;
`;

const Thumb = styled.img`
  flex-shrink: 0;
  width: 6.4rem;
  height: 4.4rem;
  object-fit: cover;
  border-radius: var(--border-radius-sm);
  background-color: var(--color-grey-100);
`;

const Lines = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;

  & strong {
    font-weight: 600;
    color: var(--color-grey-800);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & span {
    font-size: 1.3rem;
    color: var(--color-grey-500);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const CabinNumber = styled.strong`
  font-family: var(--font-numbers);
  font-variant-numeric: tabular-nums;
`;

const Dates = styled(Pair)`
  & > svg {
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    color: var(--color-grey-500);
  }
`;

const Amount = styled(Lines)`
  & strong {
    font-family: var(--font-numbers);
    font-variant-numeric: tabular-nums;
  }
`;

// Paid in green, still owed in clay, so the desk sees it without opening it
const Paid = styled.span`
  && {
    font-weight: 500;
    color: ${(props) =>
      props.$paid ? "var(--color-green-700)" : "var(--color-red-700)"};
  }
`;

// What the row says about the money, from the stay's folio
function balanceLabel(folio) {
  const state = paymentState(folio);

  if (state === "paid") return "Paid";
  if (state === "credit") return "Overpaid";
  return `${formatCurrency(folio.remaining)} due`;
}

const Note = styled.span`
  display: inline-flex;
  color: var(--color-yellow-700);

  & svg {
    width: 1.6rem;
    height: 1.6rem;
  }
`;

// When the stay starts, in words: Today, In 3 days, 2 days ago
function whenLabel(startDate) {
  if (isToday(toDay(startDate))) return "Starts today";

  return formatDistanceFromNow(startDate);
}

function BookingRow({
  booking: {
    id: bookingId,
    reference,
    source,
    startDate,
    endDate,
    numNights,
    numGuests,
    totalPrice,
    folio_total,
    folio_paid,
    folio_remaining,
    status,
    observations,
    guests: { fullName: guestName, email },
    cabins: { id: cabinId, name: cabinName },
  },
}) {
  const navigate = useNavigate();
  const { checkout, isCheckingOut } = useCheckout();
  const { cancelBooking, isCancelling } = useCancelBooking();
  const { markNoShow, isMarkingNoShow } = useNoShow();
  const { approve, decline, isAnswering } = useAnswerBookingRequest();

  // The cabin list is already in the cache, so its photo costs no request
  const { cabins } = useCabins();
  const cabinImage = cabins?.find((cabin) => cabin.id === cabinId)?.image;

  // Check in from the arrival day; a no-show only once that day has passed
  const isReserved = status === "reserved";
  const isPending = status === "pending";
  const canCheckIn = isReserved && hasArrived(startDate);
  const canMarkNoShow = isReserved && startDate < todayISO();
  const isClosed = status === "cancelled" || status === "no_show";

  // The total includes the extra charges; payments come off what is due
  const folio = {
    total: folio_total ?? totalPrice,
    paid: folio_paid ?? 0,
    remaining: folio_remaining ?? totalPrice,
  };
  const isSettled = folio.remaining <= 0;

  return (
    <Table.Row>
      <Pair>
        <Thumb src={cabinImage} alt="" loading="lazy" />
        <Lines>
          <CabinNumber>Cabin {cabinName}</CabinNumber>
          <span>
            {reference} &middot; {numGuests}{" "}
            {numGuests === 1 ? "guest" : "guests"}
            {source !== "website" && ` · ${BOOKING_SOURCES[source]}`}
          </span>
        </Lines>
      </Pair>

      <Pair>
        <InitialsAvatar name={guestName} />
        <Lines>
          <strong>
            {guestName}{" "}
            {observations && (
              <Note title={`Guest note: ${observations}`}>
                <HiOutlineChatBubbleLeftEllipsis />
              </Note>
            )}
          </strong>
          <span>{email}</span>
        </Lines>
      </Pair>

      <Dates>
        <HiOutlineCalendarDays />
        <Lines>
          <strong>
            {format(toDay(startDate), "MMM d")} &ndash;{" "}
            {format(toDay(endDate), "MMM d")}
          </strong>
          <span>
            {numNights} {numNights === 1 ? "night" : "nights"} &middot;{" "}
            {whenLabel(startDate)}
          </span>
        </Lines>
      </Dates>

      <BookingStatusTag status={status} />

      <Amount>
        <strong>{formatCurrency(folio.total)}</strong>
        {!isClosed && <Paid $paid={isSettled}>{balanceLabel(folio)}</Paid>}
      </Amount>

      {/* The one thing the desk does next, one click away */}
      <div>
        {isPending && (
          <Button
            size="small"
            onClick={() => approve(bookingId)}
            disabled={isAnswering}
          >
            Approve
          </Button>
        )}

        {canCheckIn && (
          <Button
            size="small"
            onClick={() => navigate(`/checkin/${bookingId}`)}
          >
            Check in
          </Button>
        )}

        {status === "checked_in" && (
          <Button
            size="small"
            variation="secondary"
            onClick={() => checkout(bookingId)}
            disabled={isCheckingOut}
          >
            Check out
          </Button>
        )}
      </div>

      <Modal>
        <Menus.Menu>
          <Menus.Toggle id={bookingId} />
          <Menus.List id={bookingId}>
            <Menus.Button
              icon={<HiEye />}
              onClick={() => navigate(`/bookings/${bookingId}`)}
            >
              See details
            </Menus.Button>

            {canCheckIn && (
              <Menus.Button
                icon={<HiArrowDownOnSquare />}
                onClick={() => navigate(`/checkin/${bookingId}`)}
              >
                Check in
              </Menus.Button>
            )}

            {status === "checked_in" && (
              <Menus.Button
                icon={<HiArrowUpOnSquare />}
                onClick={() => checkout(bookingId)}
                disabled={isCheckingOut}
              >
                Check out
              </Menus.Button>
            )}

            {isPending && (
              <Menus.Button
                icon={<HiCheckCircle />}
                onClick={() => approve(bookingId)}
                disabled={isAnswering}
              >
                Approve request
              </Menus.Button>
            )}

            {isPending && (
              <Menus.Button
                icon={<HiXCircle />}
                onClick={() => decline(bookingId)}
                disabled={isAnswering}
              >
                Decline request
              </Menus.Button>
            )}

            {!isClosed && !isSettled && (
              <Menus.Button
                icon={<HiBanknotes />}
                onClick={() => navigate(`/bookings/${bookingId}#folio`)}
              >
                Take payment
              </Menus.Button>
            )}

            {canMarkNoShow && (
              <Modal.Open opens="no-show">
                <Menus.Button icon={<HiOutlineUserMinus />}>
                  Mark as no-show
                </Menus.Button>
              </Modal.Open>
            )}

            {isReserved && (
              <Modal.Open opens="cancel">
                <Menus.Button icon={<HiXCircle />}>Cancel booking</Menus.Button>
              </Modal.Open>
            )}
          </Menus.List>
        </Menus.Menu>

        <Modal.Window name="cancel">
          <ConfirmAction
            title={`Cancel ${reference}`}
            message={`${guestName}'s stay in Cabin ${cabinName} will be cancelled and its nights freed. The booking stays on record.`}
            confirmLabel="Cancel booking"
            disabled={isCancelling}
            onConfirm={() => cancelBooking(bookingId)}
          />
        </Modal.Window>

        <Modal.Window name="no-show">
          <ConfirmAction
            title={`${guestName} didn't arrive`}
            message={`${reference} will be marked as a no-show and its remaining nights freed. The booking stays on record.`}
            confirmLabel="Mark as no-show"
            disabled={isMarkingNoShow}
            onConfirm={() => markNoShow(bookingId)}
          />
        </Modal.Window>
      </Modal>
    </Table.Row>
  );
}

export default BookingRow;
