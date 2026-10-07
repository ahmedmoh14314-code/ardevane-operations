import { useQuery } from "@tanstack/react-query";
import { getTodayBoard } from "../../services/apiBookings";
import { todayISO } from "../../utils/helpers";
import { splitToday } from "../../utils/operations";

// Arrivals, departures and the guests in house, from one request
export function useTodayActivity() {
  const { isLoading, data } = useQuery({
    queryFn: getTodayBoard,
    queryKey: ["today-activity"],
  });

  return { isLoading, ...splitToday(data, todayISO()) };
}
