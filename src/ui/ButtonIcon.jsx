import styled from "styled-components";

const ButtonIcon = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;

  background: none;
  border: none;
  border-radius: 50%;
  transition: background-color 0.2s;

  & svg {
    width: 2.2rem;
    height: 2.2rem;
    color: var(--color-grey-600);
    transition: color 0.2s;
  }

  &:hover {
    background-color: var(--color-brand-50);
  }

  &:hover svg {
    color: var(--color-brand-600);
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent-600);
    outline-offset: 2px;
  }
`;

export default ButtonIcon;
