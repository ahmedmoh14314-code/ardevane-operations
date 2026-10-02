import styled from "styled-components";
import { format, isToday } from "date-fns";
import {
  HiArrowDownOnSquare,
  HiArrowUpOnSquare,
  HiBanknotes,
  HiEye,
  HiOutlineCalendarDays,
  HiOutlineChatBubbleLeftEllipsis,
  HiTrash,
} from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

import Tag from "../../ui/Tag";
import Table from "../../ui/Table";
import Modal from "../../ui/Modal";
import Menus from "../../ui/Menus";
import ConfirmDelete from "../../ui/ConfirmDelete";
import InitialsAvatar from "../../ui/InitialsAvatar";
import Button from "../../ui/Button";

import { formatCurrency, formatDistanceFromNow } from "../../utils/helpers";
import { useCheckout } from "../check-in-out/useCheckout";
import { useCabins } from "../cabins/useCabins";
import { useDeleteBooking } from "./useDeleteBooking";
import { useMarkPaid } from "./useMarkPaid";

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

const Note = styled.span`
  display: inline-flex;
  color: var(--color-yellow-700);

  & svg {
    width: 1.6rem;
    height: 1.6rem;
  }
`;

const STATUS_TAG = {
  unconfirmed: "yellow",
  "checked-in": "green",
  "checked-out": "silver",
};

// When the stay starts, in words: Today, In 3 days, 2 days ago
function whenLabel(startDate) {
  if (isToday(new Date(startDate))) return "Starts today";

  return formatDistanceFromNow(startDate);
}

function BookingRow({
  booking: {
    id: bookingId,
    startDate,
    endDate,
    numNights,
    numGuests,
    totalPrice,
    status,
    isPaid,
    observations,
    guests: { fullName: guestName, email },
    cabins: { id: cabinId, name: cabinName },
  },
}) {
  const navigate = useNavigate();
  const { checkout, isCheckingOut } = useCheckout();
  const { deleteBooking, isDeleting } = useDeleteBooking();
  const { markPaid, isMarkingPaid } = useMarkPaid();

  // The cabin list is already in the cache, so its photo costs no request
  const { cabins } = useCabins();
  const cabinImage = cabins?.find((cabin) => cabin.id === cabinId)?.image;

  return (
    <Table.Row>
      <Pair>
        <Thumb src={cabinImage} alt="" loading="lazy" />
        <Lines>
          <CabinNumber>Cabin {cabinName}</CabinNumber>
          <span>
            {numGuests} {numGuests === 1 ? "guest" : "guests"}
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
            {format(new Date(startDate), "MMM d")} &ndash;{" "}
            {format(new Date(endDate), "MMM d")}
          </strong>
          <span>
            {numNights} {numNights === 1 ? "night" : "nights"} &middot;{" "}
            {whenLabel(startDate)}
          </span>
        </Lines>
      </Dates>

      <Tag type={STATUS_TAG[status]}>{status.replace("-", " ")}</Tag>

      <Amount>
        <strong>{formatCurrency(totalPrice)}</strong>
        <Paid $paid={isPaid}>{isPaid ? "Paid" : "Payment due"}</Paid>
      </Amount>

      {/* The one thing the desk does next, one click away */}
      <div>
        {status === "unconfirmed" && (
          <Button
            size="small"
            onClick={() => navigate(`/checkin/${bookingId}`)}
          >
            Check in
          </Button>
        )}

        {status === "checked-in" && (
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

            {status === "unconfirmed" && (
              <Menus.Button
                icon={<HiArrowDownOnSquare />}
                onClick={() => navigate(`/checkin/${bookingId}`)}
              >
                Check in
              </Menus.Button>
            )}

            {status === "checked-in" && (
              <Menus.Button
                icon={<HiArrowUpOnSquare />}
                onClick={() => checkout(bookingId)}
                disabled={isCheckingOut}
              >
                Check out
              </Menus.Button>
            )}

            {!isPaid && (
              <Menus.Button
                icon={<HiBanknotes />}
                onClick={() => markPaid(bookingId)}
                disabled={isMarkingPaid}
              >
                Mark as paid
              </Menus.Button>
            )}

            <Modal.Open opens="delete">
              <Menus.Button icon={<HiTrash />}>Delete booking</Menus.Button>
            </Modal.Open>
          </Menus.List>
        </Menus.Menu>

        <Modal.Window name="delete">
          <ConfirmDelete
            resourceName="booking"
            disabled={isDeleting}
            onConfirm={() => deleteBooking(bookingId)}
          />
        </Modal.Window>
      </Modal>
    </Table.Row>
  );
}

export default BookingRow;
