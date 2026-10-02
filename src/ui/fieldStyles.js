import { css } from "styled-components";

// The one look every text field shares: a soft cream fill that turns white,
// with a green ring, when you type in it
export const field = css`
  font-size: 1.5rem;
  color: var(--color-grey-800);
  background-color: var(--color-grey-50);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  transition: border-color 0.2s, background-color 0.2s, box-shadow 0.2s;

  &::placeholder {
    color: var(--color-grey-400);
  }

  &:hover:not(:disabled) {
    border-color: var(--color-grey-300);
  }

  &:focus {
    outline: none;
    background-color: var(--color-grey-0);
    border-color: var(--color-brand-600);
    box-shadow: 0 0 0 3px var(--color-brand-100);
  }
`;
