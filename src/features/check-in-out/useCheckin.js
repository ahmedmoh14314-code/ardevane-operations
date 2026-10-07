import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBooking } from "../../services/apiBookings";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export function useCheckin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: checkin, isLoading: isCheckingIn } = useMutation({
    // Checking in is only that: what is paid lives on the folio
    mutationFn: (bookingId) =>
      updateBooking(bookingId, { status: "checked_in" }),

    onSuccess: (data) => {
      toast.success(`Booking ${data.reference} checked in`);
      queryClient.invalidateQueries({ active: true });
      navigate("/");
    },

    onError: (err) => toast.error(err.message),
  });

  return { checkin, isCheckingIn };
}
