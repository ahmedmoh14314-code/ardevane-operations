import styled, { keyframes } from "styled-components";

const rotate = keyframes`
  to {
    transform: rotate(1turn);
  }
`;

// A thin ring in the brand green
const Spinner = styled.div`
  margin: 4.8rem auto;
  width: 4.8rem;
  aspect-ratio: 1;

  border-radius: 50%;
  border: 3px solid var(--color-brand-100);
  border-top-color: var(--color-brand-600);
  animation: ${rotate} 0.9s infinite linear;

  @media (prefers-reduced-motion: reduce) {
    animation-duration: 3s;
  }
`;

export default Spinner;
