import { Fragment } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { format, isToday, isWeekend } from "date-fns";
import { HiOutlineHomeModern } from "react-icons/hi2";

import { useOccupancy, DAYS_VISIBLE } from "./useOccupancy";
import { dayOffset, eachDay } from "../../utils/dates";

import ErrorMessage from "../../ui/ErrorMessage";
import EmptyState from "../../ui/EmptyState";
import { TableSkeleton } from "../../ui/Skeleton";
import { below } from "../../styles/breakpoints";
import { bookingStatus } from "../../utils/constants";

const Board = styled.div`
  border: 1px solid var(--color-grey-200);
  background-color: var(--color-grey-0);
  border-radius: 7px;
  overflow-x: auto;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 14rem repeat(${DAYS_VISIBLE}, minmax(5.2rem, 1fr));
  min-width: 90rem;

  ${below.tablet} {
    min-width: 72rem;
  }
`;

const HeadCell = styled.div`
  padding: 1rem 0.4rem;
  text-align: center;
  font-size: 1.2rem;
  font-weight: 600;

  background-color: ${(props) =>
    props.$today ? "var(--color-brand-600)" : "var(--color-grey-50)"};
  color: ${(props) =>
    props.$today ? "var(--color-brand-50)" : "var(--color-grey-600)"};
  border-bottom: 1px solid var(--color-grey-100);

  & small {
    display: block;
    font-weight: 400;
    opacity: 0.8;
  }
`;

const CabinCell = styled.div`
  padding: 1rem 1.6rem;
  font-family: var(--font-numbers);
  font-variant-numeric: tabular-nums;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-grey-600);

  display: flex;
  align-items: center;
  gap: 0.8rem;

  background-color: var(--color-grey-50);
  border-bottom: 1px solid var(--color-grey-100);
  border-right: 1px solid var(--color-grey-100);
  position: sticky;
  left: 0;
  z-index: 1;
`;

const DayCell = styled.div`
  border-bottom: 1px solid var(--color-grey-100);
  border-right: 1px solid var(--color-grey-100);
  background-color: ${(props) =>
    props.$weekend ? "var(--color-grey-50)" : "transparent"};
  min-height: 4.4rem;
`;

const Stay = styled.button`
  grid-row: ${(props) => props.$row};
  grid-column: ${(props) => props.$from} / ${(props) => props.$to};
  align-self: center;
  z-index: 2;

  margin: 0.4rem;
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: var(--border-radius-sm);

  font-size: 1.2rem;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  color: var(--color-${(props) => props.$color}-700);
  background-color: var(--color-${(props) => props.$color}-100);
  border-left: 3px solid var(--color-${(props) => props.$color}-700);

  &:hover {
    filter: brightness(0.96);
  }

  &:focus-visible {
    outline: 2px solid var(--color-brand-600);
    outline-offset: 1px;
  }
`;

function CalendarTimeline() {
  const { isLoading, error, cabins, bookings, rangeStart } = useOccupancy();
  const navigate = useNavigate();

  if (isLoading) return <TableSkeleton rows={6} />;

  if (error) return <ErrorMessage>{error.message}</ErrorMessage>;

  // Archived cabins still hold history, but they are not part of the plan
  const activeCabins = cabins.filter((cabin) => cabin.is_active !== false);

  if (!activeCabins.length)
    return (
      <EmptyState
        icon={<HiOutlineHomeModern />}
        title="No cabins to plan"
        description="Add a cabin and its stays will show up on this timeline."
      />
    );

  const days = eachDay(rangeStart, DAYS_VISIBLE);

  return (
    <Board>
      <Grid>
        <HeadCell />

        {days.map((day) => (
          <HeadCell key={day.toISOString()} $today={isToday(day)}>
            {format(day, "d")}
            <small>{format(day, "EEE")}</small>
          </HeadCell>
        ))}

        {activeCabins.map((cabin, cabinIndex) => {
          const row = cabinIndex + 2;
          const stays = bookings.filter((b) => b.cabinId === cabin.id);

          return (
            <Fragment key={cabin.id}>
              <CabinCell style={{ gridRow: row }}>
                <HiOutlineHomeModern />
                {cabin.name}
              </CabinCell>

              {days.map((day, dayIndex) => (
                <DayCell
                  key={day.toISOString()}
                  $weekend={isWeekend(day)}
                  style={{ gridRow: row, gridColumn: dayIndex + 2 }}
                />
              ))}

              {stays.map((booking) => {
                // Clamp to the window, so a stay that began earlier still shows
                const start = Math.max(
                  0,
                  dayOffset(booking.startDate, rangeStart),
                );
                const end = Math.min(
                  DAYS_VISIBLE,
                  dayOffset(booking.endDate, rangeStart),
                );

                if (end <= start) return null;

                return (
                  <Stay
                    key={booking.id}
                    $row={row}
                    $from={start + 2}
                    $to={end + 2}
                    $color={bookingStatus(booking.status).tag}
                    onClick={() => navigate(`/bookings/${booking.id}`)}
                    title={`${booking.guests?.fullName} · ${booking.numNights} nights · ${booking.status}`}
                  >
                    {booking.guests?.fullName}
                  </Stay>
                );
              })}
            </Fragment>
          );
        })}
      </Grid>
    </Board>
  );
}

export default CalendarTimeline;
