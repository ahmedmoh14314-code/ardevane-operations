import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { addCharge, recordPayment } from "../../services/apiFolio";
import { formatCurrency } from "../../utils/helpers";

// After a charge or a payment, the folio and the bookings list (which shows
// what is owed on each row) are out of date
function useRefreshFolio() {
  const queryClient = useQueryClient();

  return (bookingId) => {
    queryClient.invalidateQueries({ queryKey: ["folio", Number(bookingId)] });
    queryClient.invalidateQueries({ queryKey: ["bookings"] });
  };
}

export function useAddCharge() {
  const refresh = useRefreshFolio();

  const { mutate: addChargeTo, isLoading: isAddingCharge } = useMutation({
    mutationFn: addCharge,
    onSuccess: (charge) => {
      toast.success(
        `${charge.description} added: ${formatCurrency(charge.amount)}`,
      );
      refresh(charge.bookingId);
    },
    onError: (err) => toast.error(err.message),
  });

  return { addChargeTo, isAddingCharge };
}

export function useRecordPayment() {
  const refresh = useRefreshFolio();

  const { mutate: recordPaymentFor, isLoading: isRecordingPayment } =
    useMutation({
      mutationFn: recordPayment,
      onSuccess: (payment) => {
        toast.success(`${formatCurrency(payment.amount)} cash recorded`);
        refresh(payment.bookingId);
      },
      onError: (err) => toast.error(err.message),
    });

  return { recordPaymentFor, isRecordingPayment };
}
