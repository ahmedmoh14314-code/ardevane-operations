import styled from "styled-components";
import { HiOutlineInbox } from "react-icons/hi2";

const StyledEmptyState = styled.div`
  background-color: var(--color-grey-0);
  border: 1px dashed var(--color-grey-200);
  border-radius: var(--border-radius-lg);

  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.2rem;
  padding: 6.4rem 3.2rem;
`;

const IconCircle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 7.2rem;
  height: 7.2rem;
  border-radius: 50%;
  background-color: var(--color-brand-50);
  box-shadow: 0 0 0 0.8rem var(--color-grey-50);
  margin-bottom: 0.8rem;

  & svg {
    width: 3.2rem;
    height: 3.2rem;
    color: var(--color-brand-600);
  }
`;

const Title = styled.h3`
  font-family: var(--font-display);
  font-size: 2.2rem;
  font-weight: 600;
  color: var(--color-grey-800);
`;

const Description = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-500);
  max-width: 46rem;
  line-height: 1.5;
`;

const Actions = styled.div`
  display: flex;
  gap: 1.2rem;
  margin-top: 1.2rem;
  flex-wrap: wrap;
  justify-content: center;
`;

// One empty state for the whole app: icon, title, a line of help, an action.
// `action` is any element, usually a Button or a Modal.Open wrapping one.
function EmptyState({
  icon = <HiOutlineInbox />,
  title,
  description,
  action,
  secondaryAction,
}) {
  return (
    <StyledEmptyState>
      <IconCircle aria-hidden="true">{icon}</IconCircle>

      <Title>{title}</Title>
      {description && <Description>{description}</Description>}

      {(action || secondaryAction) && (
        <Actions>
          {action}
          {secondaryAction}
        </Actions>
      )}
    </StyledEmptyState>
  );
}

export default EmptyState;
