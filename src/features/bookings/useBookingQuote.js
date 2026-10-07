import { useQuery } from "@tanstack/react-query";
import { quoteBooking } from "../../services/apiBookings";

// The database's own price for a stay, or its reason for refusing it, while
// the desk is still filling in the form
export function useBookingQuote({ cabinId, startDate, endDate, numGuests }) {
  const isComplete = Boolean(cabinId && startDate && endDate && numGuests);

  const {
    isFetching,
    data: quote,
    error,
  } = useQuery({
    queryKey: ["quote", cabinId, startDate, endDate, numGuests],
    queryFn: () =>
      quoteBooking({
        cabinId: Number(cabinId),
        startDate,
        endDate,
        numGuests: Number(numGuests),
      }),
    enabled: isComplete,
    retry: false,
  });

  return { isComplete, isFetching, quote, error };
}
