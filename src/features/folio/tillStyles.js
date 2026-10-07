import styled, { css } from "styled-components";

// The till is a dark panel, so its fields and buttons are drawn light on
// dark instead of the usual cream fields.

export const TillForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  padding: 1.8rem;
  border-radius: var(--border-radius-lg);
  background-color: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  animation: till-open 0.28s ease-out;

  @keyframes till-open {
    from {
      opacity: 0;
      transform: translateY(-0.6rem);
    }
  }
`;

export const TillLabel = styled.label`
  display: block;
  margin-bottom: 0.6rem;
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
`;

const darkField = css`
  width: 100%;
  font-size: 1.5rem;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--border-radius-md);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  &:focus {
    outline: none;
    border-color: var(--color-brand-200);
    box-shadow: 0 0 0 3px rgba(178, 214, 198, 0.25);
  }
`;

export const TillInput = styled.input`
  ${darkField}
  padding: 1rem 1.4rem;
`;

// An amount: a big number with the currency sign sitting inside the field
export const AmountField = styled.div`
  position: relative;

  &::before {
    content: "$";
    position: absolute;
    left: 1.4rem;
    top: 50%;
    transform: translateY(-50%);
    font-family: var(--font-display);
    font-size: 2.2rem;
    color: rgba(255, 255, 255, 0.5);
    pointer-events: none;
  }

  & input {
    ${darkField}
    padding: 0.8rem 1.4rem 0.8rem 3.4rem;
    font-family: var(--font-display);
    font-size: 2.6rem;
    font-variant-numeric: tabular-nums;
  }
`;

export const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
`;

export const Chip = styled.button.attrs({ type: "button" })`
  display: inline-flex;
  align-items: baseline;
  gap: 0.6rem;
  padding: 0.7rem 1.3rem;
  font-size: 1.35rem;
  font-weight: 500;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  transition:
    background-color 0.2s,
    color 0.2s,
    border-color 0.2s;

  & small {
    font-size: 1.2rem;
    opacity: 0.7;
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.5);
  }

  &[aria-pressed="true"] {
    background-color: var(--color-brand-100);
    border-color: var(--color-brand-100);
    color: var(--color-brand-900);
  }
`;

export const TillSubmit = styled.button`
  padding: 1.2rem 1.6rem;
  font-size: 1.5rem;
  font-weight: 600;
  border: none;
  border-radius: var(--border-radius-md);
  background-color: var(--color-brand-100);
  color: var(--color-brand-900);
  transition:
    transform 0.15s,
    background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: #fff;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

export const TillHint = styled.p`
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.6);

  &[data-warn="true"] {
    color: #f6d58e;
  }
`;
