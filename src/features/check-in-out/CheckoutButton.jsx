import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import ConfirmAction from "../../ui/ConfirmAction";
import { useCheckout } from "./useCheckout";
import { formatCurrency } from "../../utils/helpers";

// Checking out is never blocked by money, but if something is still owed
// the desk is told once, plainly, before the guest goes
function CheckoutButton({ bookingId, reference, remaining = 0 }) {
  const { checkout, isCheckingOut } = useCheckout();

  const button = (props) => (
    <Button
      variation="secondary"
      size="small"
      disabled={isCheckingOut}
      {...props}
    >
      Check out
    </Button>
  );

  if (remaining <= 0) return button({ onClick: () => checkout(bookingId) });

  return (
    <Modal>
      <Modal.Open opens="checkout">{button()}</Modal.Open>
      <Modal.Window name="checkout">
        <ConfirmAction
          title={`${formatCurrency(remaining)} still to pay`}
          message={`${reference ?? "This stay"} has an unpaid balance. You can take the payment on the booking's folio first, or check the guest out anyway.`}
          confirmLabel="Check out anyway"
          cancelLabel="Not yet"
          disabled={isCheckingOut}
          onConfirm={() => checkout(bookingId)}
        />
      </Modal.Window>
    </Modal>
  );
}

export default CheckoutButton;
