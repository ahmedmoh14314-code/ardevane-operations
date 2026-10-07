import styled from "styled-components";
import { format } from "date-fns";
import {
  HiOutlineArrowDownOnSquare,
  HiOutlineArrowUpOnSquare,
  HiOutlineHome,
  HiOutlineNoSymbol,
  HiOutlineSparkles,
  HiOutlineTrash,
} from "react-icons/hi2";

import Stat from "./Stat";
import { below } from "../../styles/breakpoints";

const StyledTodaySummary = styled.section`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const Label = styled.h2`
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-grey-500);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 1.6rem;

  ${below.laptop} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  ${below.tablet} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

// The first thing on the dashboard: what needs attention today. People
// first (arrivals, departures, in house), then the cabins that aren't ready.
function TodaySummary({ arrivals, departures, inHouse, conditions }) {
  return (
    <StyledTodaySummary aria-label="Today">
      <Label>Today &middot; {format(new Date(), "EEEE, MMM d")}</Label>

      <Grid>
        <Stat
          title="Arrivals"
          color="green"
          icon={<HiOutlineArrowDownOnSquare />}
          value={arrivals}
        />
        <Stat
          title="Departures"
          color="yellow"
          icon={<HiOutlineArrowUpOnSquare />}
          value={departures}
        />
        <Stat
          title="In house"
          color="indigo"
          icon={<HiOutlineHome />}
          value={inHouse}
        />
        <Stat
          title="Dirty"
          color="red"
          icon={<HiOutlineTrash />}
          value={conditions.dirty}
        />
        <Stat
          title="Cleaning"
          color="blue"
          icon={<HiOutlineSparkles />}
          value={conditions.cleaning}
        />
        <Stat
          title="Out of service"
          color="silver"
          icon={<HiOutlineNoSymbol />}
          value={conditions.out_of_service}
        />
      </Grid>
    </StyledTodaySummary>
  );
}

export default TodaySummary;
