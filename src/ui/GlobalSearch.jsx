import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { HiMagnifyingGlass } from "react-icons/hi2";

import { below } from "../styles/breakpoints";

const Wrapper = styled.form`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 36rem;

  ${below.laptop} {
    display: none;
  }
`;

const Field = styled.input`
  width: 100%;
  font-size: 1.4rem;
  padding: 0.9rem 5.6rem 0.9rem 3.8rem;

  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  background-color: var(--color-grey-50);
  color: var(--color-grey-700);

  &::placeholder {
    color: var(--color-grey-400);
  }

  &:focus {
    background-color: var(--color-grey-0);
  }
`;

const Icon = styled(HiMagnifyingGlass)`
  position: absolute;
  left: 1.2rem;
  width: 1.8rem;
  height: 1.8rem;
  color: var(--color-grey-400);
  pointer-events: none;
`;

const Shortcut = styled.kbd`
  position: absolute;
  right: 1rem;

  font-family: inherit;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;

  color: var(--color-grey-500);
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-tiny);
  pointer-events: none;
`;

// Searching here hands the term to the bookings list, which already knows how
// to search a guest name, an email or a cabin. Cmd+K (Ctrl+K) jumps here from
// anywhere, the way it does in the design.
function GlobalSearch() {
  const [term, setTerm] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(function () {
    function handleKey(e) {
      if (e.key !== "k" || !(e.metaKey || e.ctrlKey)) return;

      e.preventDefault();
      inputRef.current?.focus();
    }

    document.addEventListener("keydown", handleKey);

    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();

    if (!term.trim()) return;

    navigate(`/bookings?search=${encodeURIComponent(term.trim())}`);
    setTerm("");
    inputRef.current?.blur();
  }

  return (
    <Wrapper onSubmit={handleSubmit} role="search">
      <Icon />

      <Field
        ref={inputRef}
        type="search"
        value={term}
        placeholder="Search guests, bookings, cabins"
        aria-label="Search guests, bookings and cabins"
        onChange={(e) => setTerm(e.target.value)}
      />

      <Shortcut>⌘K</Shortcut>
    </Wrapper>
  );
}

export default GlobalSearch;
