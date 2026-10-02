import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import { getBookings } from "../../services/apiBookingsSearch";
import { PAGE_SIZE } from "../../utils/constants";

// Bookings for the current search, filter, sort and page.
// All four live in the URL, so any view can be linked to.
export function useBookings() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  // SEARCH
  const search = searchParams.get("search")?.trim() || "";

  // FILTER
  const filterValue = searchParams.get("status");
  const filter =
    !filterValue || filterValue === "all"
      ? null
      : { field: "status", value: filterValue };

  // SORT
  const sortByRaw = searchParams.get("sortBy") || "startDate-desc";
  const [field, direction] = sortByRaw.split("-");
  const sortBy = { field, direction };

  // PAGE
  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

  // QUERY
  const {
    isLoading,
    data: { data: bookings, count } = {},
    error,
  } = useQuery({
    queryKey: ["bookings", search, filter, sortBy, page],
    queryFn: () => getBookings({ search, filter, sortBy, page }),
  });

  // PRE-FETCHING the neighbouring pages, so paging feels instant
  const pageCount = Math.ceil(count / PAGE_SIZE);

  if (page < pageCount)
    queryClient.prefetchQuery({
      queryKey: ["bookings", search, filter, sortBy, page + 1],
      queryFn: () => getBookings({ search, filter, sortBy, page: page + 1 }),
    });

  if (page > 1)
    queryClient.prefetchQuery({
      queryKey: ["bookings", search, filter, sortBy, page - 1],
      queryFn: () => getBookings({ search, filter, sortBy, page: page - 1 }),
    });

  return { isLoading, error, bookings, count, search };
}
