import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { cancelBooking as cancelBookingApi } from "../../services/apiBookings";

// Cancel a reservation. The booking stays on record, marked cancelled.
export function useCancelBooking() {
  const queryClient = useQueryClient();

  const { isLoading: isCancelling, mutate: cancelBooking } = useMutation({
    mutationFn: cancelBookingApi,
    onSuccess: (data) => {
      toast.success(`Booking ${data.reference} cancelled`);
      queryClient.invalidateQueries({ active: true });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isCancelling, cancelBooking };
}
