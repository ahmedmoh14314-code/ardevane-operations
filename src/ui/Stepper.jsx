import styled from "styled-components";
import { HiMinus, HiPlus } from "react-icons/hi2";

const StyledStepper = styled.div`
  display: inline-flex;
  align-items: stretch;
  overflow: hidden;

  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
`;

const Step = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4.8rem;

  border: none;
  background: none;
  color: var(--color-grey-700);
  transition:
    background-color 0.15s,
    color 0.15s;

  & svg {
    width: 1.8rem;
    height: 1.8rem;
  }

  &:hover:not(:disabled) {
    color: var(--color-brand-700);
    background-color: var(--color-brand-50);
  }

  &:disabled {
    color: var(--color-grey-300);
  }

  &:focus-visible {
    outline: 2px solid var(--color-brand-600);
    outline-offset: -2px;
  }
`;

const Value = styled.input`
  width: 8.4rem;
  padding: 1rem 0;
  text-align: center;

  font-size: 1.8rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--color-grey-800);

  border: none;
  border-left: 1px solid var(--color-grey-200);
  border-right: 1px solid var(--color-grey-200);
  background: none;

  &:focus {
    outline: none;
    background-color: var(--color-brand-50);
  }
`;

// A number with a minus and a plus either side. Typing works too: the number
// is left alone while typing, so 10 can be typed past a minimum of 3, and it
// is brought back between min and max when the field is left.
function Stepper({
  value,
  onChange,
  min = 0,
  max = Infinity,
  prefix = "",
  label,
}) {
  function clamp(n) {
    return Math.min(max, Math.max(min, n));
  }

  function handleTyping(e) {
    const digits = e.target.value.replace(/\D/g, "");

    onChange(digits === "" ? 0 : Number(digits));
  }

  return (
    <StyledStepper>
      <Step
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
      >
        <HiMinus />
      </Step>

      <Value
        inputMode="numeric"
        value={`${prefix}${value}`}
        onChange={handleTyping}
        onBlur={() => onChange(clamp(value))}
        aria-label={label}
      />

      <Step
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
      >
        <HiPlus />
      </Step>
    </StyledStepper>
  );
}

export default Stepper;
