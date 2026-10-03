import { forwardRef, useState } from "react";
import styled from "styled-components";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";

import Input from "./Input";

const Wrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

// Room on the right for the eye
const Field = styled(Input)`
  width: 100%;
  padding-right: 4.8rem;
`;

const Reveal = styled.button`
  position: absolute;
  right: 0.8rem;

  display: flex;
  padding: 0.6rem;
  border: none;
  background: none;
  border-radius: var(--border-radius-sm);

  & svg {
    width: 2rem;
    height: 2rem;
    color: var(--color-grey-500);
  }

  &:hover svg {
    color: var(--color-brand-600);
  }

  &:focus-visible {
    outline: 2px solid var(--color-brand-600);
  }
`;

// A password field with an eye to show what has been typed. It passes its
// ref straight to the input, so react-hook-form's register() works on it
// exactly as it does on a plain Input.
const PasswordInput = forwardRef(function PasswordInput(props, ref) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <Wrapper>
      <Field {...props} ref={ref} type={isRevealed ? "text" : "password"} />

      <Reveal
        type="button"
        onClick={() => setIsRevealed((revealed) => !revealed)}
        aria-label={isRevealed ? "Hide password" : "Show password"}
        aria-pressed={isRevealed}
        disabled={props.disabled}
      >
        {isRevealed ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
      </Reveal>
    </Wrapper>
  );
});

export default PasswordInput;
