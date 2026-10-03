import styled from "styled-components";
import { noForward } from "../utils/styleProps";

const ButtonText = styled.button.withConfig(noForward("type"))`
  color: var(--color-brand-600);
  font-weight: 500;
  text-align: center;
  background: none;
  border: none;
  border-radius: var(--border-radius-sm);

  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 0.4rem;
  transition:
    color 0.2s,
    text-decoration-color 0.2s;

  &:hover,
  &:active {
    color: var(--color-brand-700);
    text-decoration-color: var(--color-accent-600);
  }
`;

export default ButtonText;
