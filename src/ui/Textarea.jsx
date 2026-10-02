import styled from "styled-components";
import { field } from "./fieldStyles";

const Textarea = styled.textarea`
  ${field}
  padding: 1rem 1.4rem;
  width: 100%;
  height: 9.6rem;
  resize: vertical;
`;

export default Textarea;
