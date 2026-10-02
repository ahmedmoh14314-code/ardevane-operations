import { useSearchParams } from "react-router-dom";
import styled, { css } from "styled-components";

// A segmented control: one white pill, the chosen option filled green
const StyledFilter = styled.div`
  border: 1px solid var(--color-grey-200);
  background-color: var(--color-grey-0);
  box-shadow: var(--shadow-sm);
  border-radius: var(--border-radius-md);
  padding: 0.4rem;
  display: flex;
  gap: 0.2rem;
`;

const FilterButton = styled.button`
  background-color: var(--color-grey-0);
  border: none;

  color: var(--color-grey-600);

  ${(props) =>
    props.$active &&
    css`
      background-color: var(--color-brand-600);
      color: #fff;
    `}

  border-radius: var(--border-radius-sm);
  font-weight: 500;
  font-size: 1.4rem;
  white-space: nowrap;

  padding: 0.6rem 1.4rem;
  transition: background-color 0.2s, color 0.2s;

  &:hover:not(:disabled) {
    color: var(--color-grey-900);
    background-color: var(--color-grey-50);
  }
`;

// The number beside an option, when the option has one
const Count = styled.span`
  margin-left: 0.6rem;
  padding: 0.1rem 0.7rem;
  border-radius: 100px;

  font-size: 1.2rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;

  color: inherit;
  background-color: ${(props) =>
    props.$active ? "rgba(255, 255, 255, 0.2)" : "var(--color-grey-100)"};
`;

// Filter buttons. The choice lives in the URL
function Filter({ filterField, options }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentFilter = searchParams.get(filterField) || options.at(0).value;

  function handleClick(value) {
    searchParams.set(filterField, value);

    if (searchParams.get("page")) searchParams.set("page", 1);

    setSearchParams(searchParams);
  }

  return (
    <StyledFilter>
      {options.map((option) => (
        <FilterButton
          key={option.value}
          onClick={() => handleClick(option.value)}
          $active={option.value === currentFilter}
          disabled={option.value === currentFilter}
        >
          {option.label}
          {option.count !== undefined && (
            <Count $active={option.value === currentFilter}>
              {option.count}
            </Count>
          )}
        </FilterButton>
      ))}
    </StyledFilter>
  );
}

export default Filter;
