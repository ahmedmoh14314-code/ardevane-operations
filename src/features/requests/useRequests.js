import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { getRequests, setRequestStatus } from "../../services/apiRequests";
import { requestStatusLabel } from "../../utils/requests";

// Guests ask from their phones, so the queue checks for new requests every
// half minute while it is open. Simple polling; no realtime needed here.
export function useRequests({ scope = "active", type } = {}) {
  const { isLoading, data: requests } = useQuery({
    queryKey: ["requests", scope, type ?? "all"],
    queryFn: () => getRequests({ scope, type }),
    refetchInterval: 30 * 1000,
  });

  return { isLoading, requests };
}

export function useMoveRequest() {
  const queryClient = useQueryClient();

  const { mutate: moveRequest, isLoading: isMoving } = useMutation({
    mutationFn: setRequestStatus,
    onSuccess: (request) => {
      toast.success(
        `${request.title}: ${requestStatusLabel(request.type, request.status).toLowerCase()}`,
      );
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      // A delivered food order is now on the stay's folio
      queryClient.invalidateQueries({ queryKey: ["folio", request.bookingId] });
      queryClient.invalidateQueries({ queryKey: ["today-activity"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { moveRequest, isMoving };
}
