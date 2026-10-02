import styled from "styled-components";
import { useSearchParams } from "react-router-dom";
import { addDays, format, startOfDay } from "date-fns";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

import Button from "../../ui/Button";
import { DAYS_VISIBLE } from "./useOccupancy";

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  flex-wrap: wrap;
`;

const RangeLabel = styled.p`
  font-size: 1.4rem;
  font-weight: 500;
  color: var(--color-grey-600);
  font-family: var(--font-numbers);
  font-variant-numeric: tabular-nums;
`;

// Moves the visible window backwards and forwards. The start date lives in
// the URL, so a specific week can be linked to.
function CalendarToolbar() {
  const [searchParams, setSearchParams] = useSearchParams();

  const fromParam = searchParams.get("from");
  const rangeStart = startOfDay(fromParam ? new Date(fromParam) : new Date());

  function moveTo(date) {
    searchParams.set("from", format(date, "yyyy-MM-dd"));
    setSearchParams(searchParams);
  }

  function goToday() {
    searchParams.delete("from");
    setSearchParams(searchParams);
  }

  const rangeEnd = addDays(rangeStart, DAYS_VISIBLE - 1);

  return (
    <Toolbar>
      <Button
        size="small"
        variation="secondary"
        onClick={() => moveTo(addDays(rangeStart, -DAYS_VISIBLE))}
      >
        <HiChevronLeft aria-hidden="true" /> Earlier
      </Button>

      <Button size="small" variation="secondary" onClick={goToday}>
        Today
      </Button>

      <Button
        size="small"
        variation="secondary"
        onClick={() => moveTo(addDays(rangeStart, DAYS_VISIBLE))}
      >
        Later <HiChevronRight aria-hidden="true" />
      </Button>

      <RangeLabel>
        {format(rangeStart, "MMM dd")} &mdash; {format(rangeEnd, "MMM dd yyyy")}
      </RangeLabel>
    </Toolbar>
  );
}

export default CalendarToolbar;
