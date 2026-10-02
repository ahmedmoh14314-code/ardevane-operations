import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { HiMagnifyingGlass, HiXMark } from "react-icons/hi2";

import { useDebounce } from "../hooks/useDebounce";

const Wrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  flex: 1 1 26rem;
`;

const Field = styled.input`
  width: 100%;
  font-size: 1.4rem;
  padding: 0.8rem 3.6rem;

  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-grey-0);
  box-shadow: var(--shadow-sm);
  color: var(--color-grey-700);

  &::placeholder {
    color: var(--color-grey-400);
  }
`;

const SearchIcon = styled(HiMagnifyingGlass)`
  position: absolute;
  left: 1rem;
  width: 1.8rem;
  height: 1.8rem;
  color: var(--color-grey-400);
  pointer-events: none;
`;

const ClearButton = styled.button`
  position: absolute;
  right: 0.6rem;
  border: none;
  background: none;
  padding: 0.4rem;
  border-radius: var(--border-radius-sm);

  display: flex;
  align-items: center;

  &:hover {
    background-color: var(--color-grey-100);
  }

  & svg {
    width: 1.6rem;
    height: 1.6rem;
    color: var(--color-grey-500);
  }
`;

// The search term lives in the URL like the other filters, so a search can be
// linked to. Typing waits 300ms before it changes the URL, so one request goes
// out per pause instead of one per key.
function Search({ paramName = "search", placeholder = "Search...", label }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlValue = searchParams.get(paramName) || "";

  const [value, setValue] = useState(urlValue);
  const debounced = useDebounce(value, 300);

  useEffect(
    function () {
      if (debounced === urlValue) return;

      searchParams.set(paramName, debounced);

      if (!debounced) searchParams.delete(paramName);

      // A new search always starts on page one
      if (searchParams.get("page")) searchParams.set("page", 1);

      setSearchParams(searchParams, { replace: true });
    },
    [debounced, urlValue, paramName, searchParams, setSearchParams]
  );

  return (
    <Wrapper>
      <SearchIcon />

      <Field
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={label || placeholder}
        onChange={(e) => setValue(e.target.value)}
      />

      {value && (
        <ClearButton
          type="button"
          onClick={() => setValue("")}
          aria-label="Clear search"
        >
          <HiXMark />
        </ClearButton>
      )}
    </Wrapper>
  );
}

export default Search;
