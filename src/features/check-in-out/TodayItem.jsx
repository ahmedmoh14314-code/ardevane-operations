import styled from "styled-components";
import { Link } from "react-router-dom";

import Tag from "../../ui/Tag";
import { Flag } from "../../ui/Flag";
import Button from "../../ui/Button";
import CheckoutButton from "./CheckoutButton";
import { formatCurrency, todayISO } from "../../utils/helpers";

const StyledTodayItem = styled.li`
  display: grid;
  grid-template-columns: 9rem 2rem minmax(0, 1fr) auto 9.6rem;
  gap: 1.2rem;
  align-items: center;

  font-size: 1.4rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-grey-100);

  &:first-child {
    border-top: 1px solid var(--color-grey-100);
  }
`;

const Guest = styled(Link)`
  display: flex;
  flex-direction: column;
  min-width: 0;

  & strong {
    font-weight: 500;
    color: var(--color-grey-800);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & span {
    font-size: 1.25rem;
    color: var(--color-grey-500);
  }

  &:hover strong {
    color: var(--color-brand-600);
  }
`;

// What is still owed, in clay, so nobody leaves without the desk knowing
const Balance = styled.span`
  font-size: 1.3rem;
  font-weight: 500;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  color: ${(props) =>
    props.$owed ? "var(--color-red-700)" : "var(--color-green-700)"};
`;

function TodayItem({ activity }) {
  const { id, reference, status, endDate, guests, cabins, folio } = activity;
  const remaining = folio?.remaining ?? 0;
  const isArrival = status === "reserved";
  const isLate = !isArrival && endDate < todayISO();

  return (
    <StyledTodayItem>
      {isArrival ? (
        <Tag type="green">Arriving</Tag>
      ) : (
        <Tag type={isLate ? "red" : "yellow"}>
          {isLate ? "Overdue" : "Departing"}
        </Tag>
      )}

      <Flag src={guests.countryFlag} alt={`Flag of ${guests.nationality}`} />

      <Guest to={`/bookings/${id}`}>
        <strong>{guests.fullName}</strong>
        <span>
          Cabin {cabins.name} &middot; {reference}
        </span>
      </Guest>

      <Balance $owed={remaining > 0}>
        {remaining > 0 ? `${formatCurrency(remaining)} due` : "Paid"}
      </Balance>

      {isArrival ? (
        <Button size="small" as={Link} to={`/checkin/${id}`}>
          Check in
        </Button>
      ) : (
        <CheckoutButton
          bookingId={id}
          reference={reference}
          remaining={remaining}
        />
      )}
    </StyledTodayItem>
  );
}

export default TodayItem;
