import styled from "styled-components";
import { noForward } from "../utils/styleProps";

// A pill with a dot in front, so the state reads by shape as well as colour.
// The type picks the colour: green, blue, yellow, silver, red, indigo.
const Tag = styled.span.withConfig(noForward("type"))`
  width: fit-content;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;

  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.5rem 1.2rem;
  border-radius: 100px;

  color: var(--color-${(props) => props.type}-700);
  background-color: var(--color-${(props) => props.type}-100);

  &::before {
    content: "";
    width: 0.6rem;
    height: 0.6rem;
    border-radius: 50%;
    background-color: currentColor;
  }
`;

export default Tag;
