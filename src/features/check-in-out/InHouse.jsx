import styled from "styled-components";
import { Link } from "react-router-dom";
import { format } from "date-fns";

import DashboardBox from "../dashboard/DashboardBox";
import BoxHeader from "../dashboard/BoxHeader";
import InitialsAvatar from "../../ui/InitialsAvatar";
import { formatCurrency, toDay } from "../../utils/helpers";

const StyledInHouse = styled(DashboardBox)`
  grid-column: 1 / -1;
  scroll-margin-top: 2.4rem;
`;

const List = styled.ul`
  display: flex;
  flex-direction: column;
`;

// One guest per line: who, where, until when, and their folio
const Stay = styled.li`
  & > a {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) repeat(3, 10rem);
    gap: 1.6rem;
    align-items: center;
    padding: 1.2rem 0.8rem;
    border-top: 1px solid var(--color-grey-100);
    border-radius: var(--border-radius-sm);
    transition: background-color 0.15s;
  }

  & > a:hover {
    background-color: var(--color-grey-50);
  }

  @media (max-width: 900px) {
    & > a {
      grid-template-columns: minmax(0, 1fr) repeat(3, auto);
    }
    & .where {
      display: none;
    }
  }
`;

const Who = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  min-width: 0;

  & strong {
    display: block;
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
`;

const Where = styled.div`
  font-size: 1.35rem;
  color: var(--color-grey-600);
`;

const Money = styled.div`
  text-align: right;
  font-family: var(--font-numbers);
  font-variant-numeric: tabular-nums;
  font-size: 1.4rem;
  color: var(--color-grey-700);

  & small {
    display: block;
    font-size: 1.05rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-grey-400);
  }

  &[data-owed="true"] {
    font-weight: 600;
    color: var(--color-red-700);
  }

  &[data-owed="false"] {
    color: var(--color-green-700);
  }
`;

const Empty = styled.p`
  padding: 1.6rem 0;
  text-align: center;
  color: var(--color-grey-500);
`;

// Everyone staying tonight. A checked-in booking is the stay, so this is
// just those bookings, with what each one has paid so far.
function InHouse({ stays = [] }) {
  return (
    <StyledInHouse id="in-house">
      <BoxHeader
        title="In house"
        subtitle={
          stays.length
            ? `${stays.length} ${stays.length === 1 ? "stay" : "stays"} checked in right now`
            : "Nobody is checked in right now"
        }
      />

      {stays.length > 0 ? (
        <List>
          {stays.map(
            ({ id, reference, startDate, endDate, guests, cabins, folio }) => {
              const remaining = folio?.remaining ?? 0;

              return (
                <Stay key={id}>
                  <Link to={`/bookings/${id}#folio`}>
                    <Who>
                      <InitialsAvatar name={guests.fullName} />
                      <div>
                        <strong>{guests.fullName}</strong>
                        <span>{reference}</span>
                      </div>
                    </Who>

                    <Where className="where">
                      Cabin {cabins.name}
                      <br />
                      {format(toDay(startDate), "MMM d")} &ndash;{" "}
                      {format(toDay(endDate), "MMM d")}
                    </Where>

                    <Money>
                      <small>Total</small>
                      {formatCurrency(folio?.total ?? 0)}
                    </Money>
                    <Money>
                      <small>Paid</small>
                      {formatCurrency(folio?.paid ?? 0)}
                    </Money>
                    <Money data-owed={remaining > 0}>
                      <small>Remaining</small>
                      {formatCurrency(remaining)}
                    </Money>
                  </Link>
                </Stay>
              );
            },
          )}
        </List>
      ) : (
        <Empty>When a guest is checked in, their stay shows up here.</Empty>
      )}
    </StyledInHouse>
  );
}

export default InHouse;
