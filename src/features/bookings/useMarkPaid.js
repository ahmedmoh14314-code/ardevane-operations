import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { updateBooking } from "../../services/apiBookings";

// Record that a booking has been paid, without going through check in
export function useMarkPaid() {
  const queryClient = useQueryClient();

  const { mutate: markPaid, isLoading: isMarkingPaid } = useMutation({
    mutationFn: (bookingId) => updateBooking(bookingId, { isPaid: true }),

    onSuccess: (data) => {
      toast.success(`Booking #${data.id} marked as paid`);
      queryClient.invalidateQueries({ active: true });
    },

    onError: () => toast.error("The payment could not be recorded"),
  });

  return { markPaid, isMarkingPaid };
}
