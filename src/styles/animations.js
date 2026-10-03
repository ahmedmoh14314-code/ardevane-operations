import { css, keyframes } from "styled-components";

// Every entrance in the app comes from here, so they all move the same way.
//
// With reduced motion turned on (Windows "Show animations" off, for one)
// nothing slides or grows any more, but things still fade in, so the app
// keeps its calm feel without any movement.

export const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(0.8rem);
  }
  to {
    opacity: 1;
    transform: none;
  }
`;

// A gentle rise into place, after an optional delay in milliseconds
export const enter = (delay = 0) => css`
  animation: ${fadeUp} 0.4s ease-out ${delay}ms both;

  @media (prefers-reduced-motion: reduce) {
    animation-name: ${fadeIn};
  }
`;

// Children arrive one after another, each a little after the last
export const stagger = (count = 12, step = 50) => css`
  & > * {
    ${enter()}
  }

  ${Array.from(
    { length: count },
    (_, i) => css`
      & > *:nth-child(${i + 1}) {
        animation-delay: ${i * step}ms;
      }
    `,
  )}
`;
