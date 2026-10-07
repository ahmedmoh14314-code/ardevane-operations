import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { updateBooking } from "../../services/apiBookings";

// The guest never came: the booking stays on record and its nights are free
// again. The database only allows this from the arrival day on.
export function useNoShow() {
  const queryClient = useQueryClient();

  const { isLoading: isMarkingNoShow, mutate: markNoShow } = useMutation({
    mutationFn: (bookingId) => updateBooking(bookingId, { status: "no_show" }),
    onSuccess: (data) => {
      toast.success(`Booking ${data.reference} marked as a no-show`);
      queryClient.invalidateQueries({ active: true });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isMarkingNoShow, markNoShow };
}
