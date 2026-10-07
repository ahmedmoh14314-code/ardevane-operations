import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import CreateBookingForm from "./CreateBookingForm";

// "New booking", for walk-in and phone guests
function AddBooking() {
  return (
    <Modal>
      <Modal.Open opens="booking-form">
        <Button>New booking</Button>
      </Modal.Open>
      <Modal.Window name="booking-form">
        <CreateBookingForm />
      </Modal.Window>
    </Modal>
  );
}

export default AddBooking;
