import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getGuests } from "../../services/apiGuests";

// Guests for the current search, sort and page. All three live in the URL.
export function useGuests() {
  const [searchParams] = useSearchParams();

  const search = searchParams.get("search")?.trim() || "";

  const sortByRaw = searchParams.get("sortBy") || "fullName-asc";
  const [field, direction] = sortByRaw.split("-");
  const sortBy = { field, direction };

  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

  const {
    isLoading,
    data: { data: guests, count } = {},
    error,
  } = useQuery({
    queryKey: ["guests", search, sortBy, page],
    queryFn: () => getGuests({ search, sortBy, page }),
  });

  return { isLoading, error, guests, count, search };
}
