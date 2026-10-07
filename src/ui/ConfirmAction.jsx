import styled from "styled-components";
import Button from "./Button";
import Heading from "./Heading";

const StyledConfirmAction = styled.div`
  width: 40rem;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;

  & p {
    color: var(--color-grey-500);
    margin-bottom: 1.2rem;
  }

  & div {
    display: flex;
    justify-content: flex-end;
    gap: 1.2rem;
  }
`;

// "Are you sure?" for an action that can't simply be undone, such as
// cancelling a booking. Lives inside a Modal.Window.
function ConfirmAction({
  title,
  message,
  confirmLabel,
  onConfirm,
  disabled,
  onCloseModal,
}) {
  function handleConfirm() {
    onConfirm();
    onCloseModal?.();
  }

  return (
    <StyledConfirmAction>
      <Heading as="h3">{title}</Heading>
      <p>{message}</p>

      <div>
        <Button
          variation="secondary"
          disabled={disabled}
          onClick={onCloseModal}
        >
          Keep it
        </Button>
        <Button variation="danger" disabled={disabled} onClick={handleConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </StyledConfirmAction>
  );
}

export default ConfirmAction;
