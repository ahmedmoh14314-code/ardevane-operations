import { useQuery } from "@tanstack/react-query";
import { getBookingCounts } from "../../services/apiBookings";

// How many bookings are in each status, for the numbers on the filter.
// The key starts with "bookings", so a check in or a delete refreshes it.
export function useBookingCounts() {
  const { isLoading, data: counts } = useQuery({
    queryKey: ["bookings", "counts"],
    queryFn: getBookingCounts,
  });

  return { isLoading, counts };
}
