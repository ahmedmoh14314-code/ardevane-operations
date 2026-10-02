import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { addDays, startOfDay } from "date-fns";

import { getBookingsInRange } from "../../services/apiBookings";
import { getCabins } from "../../services/apiCabins";

export const DAYS_VISIBLE = 14;

// The calendar shows a window of days starting at ?from (today by default).
// Both the cabins and the bookings that touch that window are loaded.
export function useOccupancy() {
  const [searchParams] = useSearchParams();

  const fromParam = searchParams.get("from");
  const rangeStart = startOfDay(fromParam ? new Date(fromParam) : new Date());
  const rangeEnd = addDays(rangeStart, DAYS_VISIBLE);

  const {
    isLoading: isLoadingCabins,
    data: cabins,
    error: cabinsError,
  } = useQuery({
    queryKey: ["cabins"],
    queryFn: getCabins,
  });

  const {
    isLoading: isLoadingBookings,
    data: bookings,
    error: bookingsError,
  } = useQuery({
    queryKey: ["occupancy", rangeStart.toISOString()],
    queryFn: () =>
      getBookingsInRange(rangeStart.toISOString(), rangeEnd.toISOString()),
  });

  const isLoading = isLoadingCabins || isLoadingBookings;
  const error = cabinsError || bookingsError;

  return { isLoading, error, cabins, bookings, rangeStart, rangeEnd };
}
