import styled from "styled-components";

// The colours a guest can get, all from the status palette
const COLORS = ["green", "blue", "yellow", "indigo", "silver", "red"];

// The same name always gets the same colour
function colorFor(name = "") {
  const sum = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return COLORS[sum % COLORS.length];
}

function initialsOf(name = "") {
  const parts = name.trim().split(/\s+/);
  const first = parts.at(0)?.[0] ?? "";
  const last = parts.length > 1 ? parts.at(-1)[0] : "";

  return (first + last).toUpperCase();
}

const Circle = styled.span`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${(props) => props.$size};
  height: ${(props) => props.$size};
  border-radius: 50%;

  font-size: calc(${(props) => props.$size} * 0.38);
  font-weight: 600;
  letter-spacing: 0.02em;

  color: var(--color-${(props) => props.$color}-700);
  background-color: var(--color-${(props) => props.$color}-100);
`;

// A guest has no photo, so they get their initials in a coloured circle
function InitialsAvatar({ name, size = "4rem" }) {
  return (
    <Circle $size={size} $color={colorFor(name)} aria-hidden="true">
      {initialsOf(name)}
    </Circle>
  );
}

export default InitialsAvatar;
