import styled, { keyframes } from "styled-components";

const rotate = keyframes`
  to {
    transform: rotate(1turn);
  }
`;

// Sits inside a button, so it takes the button's text colour
const SpinnerMini = styled.span`
  display: inline-block;
  width: 2rem;
  height: 2rem;

  border-radius: 50%;
  border: 2px solid currentColor;
  border-right-color: transparent;
  animation: ${rotate} 0.8s infinite linear;

  @media (prefers-reduced-motion: reduce) {
    animation-duration: 3s;
  }
`;

export default SpinnerMini;
