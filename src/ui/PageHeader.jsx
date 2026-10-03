import styled, { css } from "styled-components";

import { noForward } from "../utils/styleProps";
import { below } from "../styles/breakpoints";

// The top of every page.
//
//   hero   the dashboard only. The mountain photograph runs edge to edge under
//          the top bar and fades into the page, and the stat cards ride up over
//          its bottom edge, the way they do in the design.
//   band   every other page. No photograph, just the brand: the gold eyebrow,
//          the serif title and a line of description.
//
// Detail pages get neither. They use <Breadcrumb> instead.

const fade = (stop) => css`
  background-image:
    linear-gradient(
      to top,
      rgb(var(--header-fade-rgb)) 0%,
      rgba(var(--header-fade-rgb), 0) 22%
    ),
    linear-gradient(
      to right,
      rgb(var(--header-fade-rgb)) 0%,
      rgb(var(--header-fade-rgb)) ${stop},
      rgba(var(--header-fade-rgb), 0) calc(${stop} + 30%)
    ),
    url("/img/hero.webp");
`;

const hero = css`
  position: relative;

  /* Steps out of the page padding so the photo reaches the edges */
  margin: -4rem -4.8rem -10rem;
  padding: 3.6rem 4.8rem 11rem;

  ${fade("18%")}
  background-repeat: no-repeat;
  background-size:
    auto,
    auto,
    100% auto;
  background-position:
    0 0,
    0 0,
    right top;

  ${below.laptop} {
    margin: -3.2rem -2.4rem -10rem;
    padding-left: 2.4rem;
    padding-right: 2.4rem;
  }

  ${below.tablet} {
    margin: -2.4rem -1.6rem -8rem;
    padding: 2.4rem 1.6rem 10rem;

    ${fade("35%")}
    background-size: auto, auto, auto 100%;
  }
`;

// The title gets its own line and the tools sit under it across the full
// width, so a long toolbar never squeezes the title or spills off the page.
// The dashboard's single filter is small enough to sit beside its title.
const StyledPageHeader = styled.header.withConfig(noForward("variant"))`
  display: flex;
  flex-direction: column;
  gap: 2rem;

  /* Pulls the table up to its toolbar, so the two read as one block */
  margin-bottom: -1.2rem;

  ${(props) => props.variant === "hero" && hero}

  ${(props) =>
    props.variant === "hero" &&
    css`
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-start;
      gap: 2.4rem;
    `}

  ${below.tablet} {
    flex-direction: column;
    align-items: stretch;
    gap: 1.6rem;
  }
`;

const Text = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const Eyebrow = styled.p`
  font-size: 1.3rem;
  font-weight: 500;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--color-accent-600);
`;

const Title = styled.h1.withConfig(noForward("variant"))`
  font-family: var(--font-display);
  font-weight: 600;
  line-height: 1.15;
  color: var(--color-grey-800);
  font-size: 3.6rem;

  ${(props) =>
    props.variant === "hero" &&
    css`
      font-size: 4.4rem;
    `}

  ${below.tablet} {
    font-size: 2.6rem;

    ${(props) =>
      props.variant === "hero" &&
      css`
        font-size: 3rem;
      `}
  }
`;

const Description = styled.p`
  font-size: 1.6rem;
  color: var(--color-grey-600);

  ${below.phone} {
    display: none;
  }
`;

const Actions = styled.div.withConfig(noForward("variant"))`
  display: flex;
  align-items: center;
  gap: 1.2rem;

  ${(props) =>
    props.variant === "hero"
      ? css`
          flex-shrink: 0;
        `
      : css`
          /* The toolbar takes the whole row */
          & > * {
            flex: 1;
          }
        `}
`;

function PageHeader({
  variant = "band",
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <StyledPageHeader variant={variant}>
      <Text>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}

        <Title variant={variant}>{title}</Title>

        {description && <Description>{description}</Description>}
      </Text>

      {children && <Actions variant={variant}>{children}</Actions>}
    </StyledPageHeader>
  );
}

export default PageHeader;
