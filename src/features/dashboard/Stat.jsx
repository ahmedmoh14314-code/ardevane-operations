import styled, { css } from "styled-components";
import { Link } from "react-router-dom";
import { useCountUp } from "../../hooks/useCountUp";

const StyledStat = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);

  padding: 2rem;
  display: grid;
  grid-template-columns: 5.6rem 1fr;
  grid-template-rows: auto auto;
  column-gap: 1.6rem;
  row-gap: 0.4rem;

  /* A stat that opens the list behind its number */
  ${(props) =>
    props.$link &&
    css`
      cursor: pointer;
      transition:
        box-shadow 0.2s,
        transform 0.2s,
        border-color 0.2s;

      &:hover {
        border-color: var(--color-grey-200);
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
      }

      @media (prefers-reduced-motion: reduce) {
        &:hover {
          transform: none;
        }
      }
    `}
`;

const Icon = styled.div`
  grid-row: 1 / -1;
  aspect-ratio: 1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  background-color: var(--color-${(props) => props.color}-100);

  & svg {
    width: 2.8rem;
    height: 2.8rem;
    color: var(--color-${(props) => props.color}-700);
  }
`;

const Title = styled.h5`
  align-self: end;
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-weight: 600;
  color: var(--color-grey-500);
`;

const Value = styled.p`
  font-family: var(--font-display);
  font-size: 3rem;
  line-height: 1;
  font-weight: 500;
  color: var(--color-grey-800);
`;

// value is a plain number; format turns it into what is shown, like $1,200.
// With "to", the stat opens what it counts: another page ("/cabins?…") or
// a section further down this one ("#in-house").
function Stat({ icon, title, value, format = (n) => n, color, to }) {
  const shown = useCountUp(Number.isFinite(value) ? value : 0);

  const content = (
    <>
      <Icon color={color}>{icon}</Icon>
      <Title>{title}</Title>
      <Value>{format(shown)}</Value>
    </>
  );

  if (!to) return <StyledStat>{content}</StyledStat>;

  if (to.startsWith("#"))
    return (
      <StyledStat
        as="a"
        href={to}
        $link
        onClick={(e) => {
          e.preventDefault();
          document
            .getElementById(to.slice(1))
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      >
        {content}
      </StyledStat>
    );

  return (
    <StyledStat as={Link} to={to} $link>
      {content}
    </StyledStat>
  );
}

export default Stat;
