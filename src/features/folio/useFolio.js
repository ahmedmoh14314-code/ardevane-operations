import { useQuery } from "@tanstack/react-query";
import { getFolio, getServices } from "../../services/apiFolio";

export function useFolio(bookingId) {
  const { isLoading, data, error } = useQuery({
    queryKey: ["folio", Number(bookingId)],
    queryFn: () => getFolio(bookingId),
    enabled: Boolean(bookingId),
  });

  return { isLoading, error, ...data };
}

// The list hardly changes, so it is fetched once per visit
export function useServices() {
  const { isLoading, data: services } = useQuery({
    queryKey: ["services"],
    queryFn: getServices,
    staleTime: 5 * 60 * 1000,
  });

  return { isLoading, services };
}
