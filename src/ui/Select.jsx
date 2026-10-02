import styled from "styled-components";
import { noForward } from "../utils/styleProps";
import { field } from "./fieldStyles";

// The browser arrow is replaced by one drawn in the brand green
const StyledSelect = styled.select.withConfig(noForward("type"))`
  ${field}
  font-size: 1.4rem;
  font-weight: 500;
  padding: 0.9rem 3.6rem 0.9rem 1.4rem;
  background-color: var(--color-grey-0);

  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%231e6b4f'%3E%3Cpath d='M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1.2rem center;
  background-size: 1.6rem;
`;

function Select({ options, value, onChange, ...props }) {
  return (
    <StyledSelect value={value} onChange={onChange} {...props}>
      {options.map((option) => (
        <option value={option.value} key={option.value}>
          {option.label}
        </option>
      ))}
    </StyledSelect>
  );
}

export default Select;
