import { useState } from "react";
import styled from "styled-components";
import {
  HiArrowRight,
  HiOutlineEnvelope,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineLockClosed,
} from "react-icons/hi2";

import Button from "../../ui/Button";
import SpinnerMini from "../../ui/SpinnerMini";

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

// A field is the input plus the icon sitting inside it.
const Field = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  & > svg {
    position: absolute;
    left: 1.4rem;
    width: 2rem;
    height: 2rem;
    color: var(--color-grey-400);
    pointer-events: none;
  }
`;

const Input = styled.input`
  width: 100%;
  font-size: 1.5rem;
  padding: 1.4rem 4.8rem;

  color: var(--color-grey-700);
  background-color: var(--color-grey-50);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);

  &::placeholder {
    color: var(--color-grey-400);
  }

  &:focus {
    outline: 2px solid var(--color-brand-600);
    outline-offset: -1px;
    background-color: var(--color-grey-0);
  }
`;

const Reveal = styled.button`
  position: absolute;
  right: 1.2rem;
  border: none;
  background: none;
  padding: 0.4rem;
  display: flex;
  border-radius: var(--border-radius-tiny);

  & svg {
    width: 2rem;
    height: 2rem;
    color: var(--color-grey-400);
  }

  &:hover svg {
    color: var(--color-grey-600);
  }
`;

const Options = styled.div`
  display: flex;
  align-items: center;
  padding: 0.4rem 0 0.8rem;
  font-size: 1.4rem;
`;

const Remember = styled.label`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--color-grey-600);

  & input {
    width: 1.8rem;
    height: 1.8rem;
    accent-color: var(--color-brand-600);
  }
`;

function LoginForm({ login, isLoading }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRevealed, setIsRevealed] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();

    if (!email || !password) return;

    login(
      { email, password },
      {
        onSettled: () => {
          setEmail("");
          setPassword("");
        },
      }
    );
  }

  return (
    <StyledForm onSubmit={handleSubmit}>
      <Field>
        <HiOutlineEnvelope />
        <Input
          type="email"
          id="email"
          placeholder="Email address"
          aria-label="Email address"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </Field>

      <Field>
        <HiOutlineLockClosed />
        <Input
          type={isRevealed ? "text" : "password"}
          id="password"
          placeholder="Password"
          aria-label="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />

        <Reveal
          type="button"
          onClick={() => setIsRevealed((r) => !r)}
          aria-label={isRevealed ? "Hide password" : "Show password"}
        >
          {isRevealed ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
        </Reveal>
      </Field>

      <Options>
        <Remember>
          <input type="checkbox" defaultChecked />
          <span>Keep me signed in</span>
        </Remember>
      </Options>

      <Button size="large" disabled={isLoading}>
        {isLoading ? (
          <SpinnerMini />
        ) : (
          <>
            <span>Log in</span>
            <HiArrowRight />
          </>
        )}
      </Button>
    </StyledForm>
  );
}

export default LoginForm;
