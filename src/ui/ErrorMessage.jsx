import styled from "styled-components";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";

const StyledErrorMessage = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.4rem;

  padding: 1.6rem 2rem;
  border: 1px solid var(--color-red-100);
  border-left: 4px solid var(--color-red-700);
  border-radius: var(--border-radius-md);
  background-color: var(--color-grey-0);
  box-shadow: var(--shadow-sm);
`;

const Icon = styled.span`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.6rem;
  height: 3.6rem;
  border-radius: 50%;
  background-color: var(--color-red-100);

  & svg {
    width: 2rem;
    height: 2rem;
    color: var(--color-red-700);
  }
`;

const Title = styled.p`
  font-weight: 600;
  color: var(--color-grey-800);
`;

const Text = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-500);
`;

// Same treatment for every failed query, so errors never look like a blank page
function ErrorMessage({ children }) {
  return (
    <StyledErrorMessage role="alert">
      <Icon aria-hidden="true">
        <HiOutlineExclamationTriangle />
      </Icon>

      <div>
        <Title>We couldn&apos;t load this</Title>
        <Text>{children || "Check your connection and try again."}</Text>
      </div>
    </StyledErrorMessage>
  );
}

export default ErrorMessage;
