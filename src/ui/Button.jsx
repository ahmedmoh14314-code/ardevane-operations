import styled, { css } from "styled-components";
import { noForward } from "../utils/styleProps";

const sizes = {
  small: css`
    font-size: 1.3rem;
    padding: 0.6rem 1.4rem;
    font-weight: 600;
    text-align: center;
  `,
  medium: css`
    font-size: 1.4rem;
    padding: 1.1rem 1.8rem;
    font-weight: 500;
  `,
  large: css`
    font-size: 1.6rem;
    padding: 1.3rem 2.6rem;
    font-weight: 500;
  `,
};

// Three kinds, one shape, so every button in the app belongs together:
//
//   primary    filled forest green. The one main action on a screen.
//   secondary  white with an outline. Everything else: Check out, Cancel, Back.
//   danger     filled clay. Only for things that delete.
const variations = {
  primary: css`
    color: #fff;
    background-color: var(--color-brand-600);
    border-color: var(--color-brand-600);

    &:hover:not(:disabled) {
      background-color: var(--color-brand-700);
      border-color: var(--color-brand-700);
    }
  `,
  secondary: css`
    color: var(--color-grey-800);
    background-color: var(--color-grey-0);
    border-color: var(--color-grey-300);

    &:hover:not(:disabled) {
      color: var(--color-brand-700);
      border-color: var(--color-brand-600);
      background-color: var(--color-brand-50);
    }
  `,
  danger: css`
    color: #fff;
    background-color: var(--color-danger);
    border-color: var(--color-danger);

    &:hover:not(:disabled) {
      background-color: var(--color-danger-hover);
      border-color: var(--color-danger-hover);
    }
  `,
};

const Button = styled.button.withConfig(noForward("size", "variation"))`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;

  border: 1.5px solid transparent;
  border-radius: var(--border-radius-sm);
  transition:
    background-color 0.2s,
    border-color 0.2s,
    color 0.2s,
    transform 0.1s;

  &:active:not(:disabled) {
    transform: scale(0.97);
  }

  @media (prefers-reduced-motion: reduce) {
    &:active:not(:disabled) {
      transform: none;
    }
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent-600);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.6;
  }

  & svg {
    width: 1.8rem;
    height: 1.8rem;
  }

  ${(props) => sizes[props.size]}
  ${(props) => variations[props.variation]}
`;
Button.defaultProps = {
  variation: "primary",
  size: "medium",
};

export default Button;
