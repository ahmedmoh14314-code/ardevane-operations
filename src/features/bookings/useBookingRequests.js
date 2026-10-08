import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import {
  approveBooking,
  cancelBooking,
  getBookingRequests,
} from "../../services/apiBookings";

// Bookings from the website waiting for an answer. Checked every half
// minute while the dashboard is open, so a new one shows up on its own.
export function useBookingRequests() {
  const { isLoading, data: requests } = useQuery({
    queryKey: ["bookings", "requests"],
    queryFn: getBookingRequests,
    refetchInterval: 30 * 1000,
  });

  return { isLoading, requests };
}

// Approve or decline a request. Declining cancels it and frees its nights.
export function useAnswerBookingRequest() {
  const queryClient = useQueryClient();

  const onSuccess = (message) => (data) => {
    toast.success(`${data.reference} ${message}`);
    queryClient.invalidateQueries({ active: true });
  };
  const onError = (err) => toast.error(err.message);

  const approve = useMutation({
    mutationFn: approveBooking,
    onSuccess: onSuccess("approved: it's a reservation now"),
    onError,
  });

  const decline = useMutation({
    mutationFn: cancelBooking,
    onSuccess: onSuccess("declined, and its nights are free again"),
    onError,
  });

  return {
    approve: approve.mutate,
    decline: decline.mutate,
    isAnswering: approve.isLoading || decline.isLoading,
  };
}
