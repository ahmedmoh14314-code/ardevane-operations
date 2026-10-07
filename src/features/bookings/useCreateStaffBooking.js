import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { createStaffBooking as createStaffBookingApi } from "../../services/apiBookings";

// A walk-in or phone booking, under the same rules as the guest website
export function useCreateStaffBooking() {
  const queryClient = useQueryClient();

  const { isLoading: isBooking, mutate: createStaffBooking } = useMutation({
    mutationFn: createStaffBookingApi,
    onSuccess: (data) => {
      toast.success(`Booked ${data.reference}`);
      queryClient.invalidateQueries({ active: true });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isBooking, createStaffBooking };
}
