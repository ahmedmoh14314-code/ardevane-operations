import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getGuest } from "../../services/apiGuests";

export function useGuest() {
  const { guestId } = useParams();

  const {
    isLoading,
    data: guest,
    error,
  } = useQuery({
    queryKey: ["guest", guestId],
    queryFn: () => getGuest(guestId),
    // A missing guest is a real answer, not a network blip
    retry: false,
  });

  return { isLoading, guest, error };
}
