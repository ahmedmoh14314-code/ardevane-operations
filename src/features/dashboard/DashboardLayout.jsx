import styled from "styled-components";
import { below } from "../../styles/breakpoints";
import { stagger } from "../../styles/animations";
import { useRecentStays } from "./useRecentStays";
import { useRecentBookings } from "./useRecentBookings";
import { StatsSkeleton } from "../../ui/Skeleton";
import Stats from "./Stats";
import { useCabins } from "../cabins/useCabins";
import SalesChart from "./SalesChart";
import DurationChart from "./DurationChart";
import TodayActivity from "../check-in-out/TodayActivity";
import InHouse from "../check-in-out/InHouse";
import TodaySummary from "./TodaySummary";
import { useTodayActivity } from "../check-in-out/useTodayActivity";
import { countConditions } from "../../utils/operations";

const StyledDashboardLayout = styled.div`
  position: relative;
  z-index: 1;
  ${stagger(8, 60)}

  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: auto auto 34rem auto auto;
  gap: 2.4rem;

  ${below.laptop} {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
  }

  ${below.tablet} {
    grid-template-columns: 1fr;
  }
`;

function DashboardLayout() {
  const { bookings, isLoading: isLoading1 } = useRecentBookings();
  const { confirmedStays, isLoading: isLoading2, numDays } = useRecentStays();
  const { cabins, isLoading: isLoading3 } = useCabins();
  const today = useTodayActivity();

  if (isLoading1 || isLoading2 || isLoading3)
    return <StatsSkeleton count={4} />;

  // Archived cabins aren't part of the hotel any more, so they don't count
  const openCabins = cabins.filter((cabin) => cabin.is_active !== false);

  return (
    <StyledDashboardLayout>
      <TodaySummary
        arrivals={today.arrivals.length}
        departures={today.departures.length}
        inHouse={today.inHouse.length}
        conditions={countConditions(openCabins)}
      />
      <Stats
        bookings={bookings}
        confirmedStays={confirmedStays}
        numDays={numDays}
        cabinCount={cabins.length}
      />
      <TodayActivity
        arrivals={today.arrivals}
        departures={today.departures}
        isLoading={today.isLoading}
      />
      <DurationChart confirmedStays={confirmedStays} />
      <InHouse stays={today.inHouse} />
      <SalesChart bookings={bookings} numDays={numDays} />
    </StyledDashboardLayout>
  );
}

export default DashboardLayout;
