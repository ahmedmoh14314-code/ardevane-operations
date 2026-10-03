import { useEffect } from "react";
import styled from "styled-components";
import { HiXMark } from "react-icons/hi2";

import Logo from "./Logo";
import MainNav from "./MainNav";
import ButtonIcon from "./ButtonIcon";
import { below } from "../styles/breakpoints";

// The whole panel sits on one picture. Its top half is transparent, so the
// logo and the links rest on the cream, and the cabin fills the bottom with
// the tagline written over it.
const StyledSidebar = styled.aside`
  grid-row: 1 / -1;
  min-height: 0;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  gap: 2.4rem;
  padding: 2.4rem 1.6rem 0;

  border-right: 1px solid var(--color-grey-100);
  background-color: var(--color-grey-50);
  background-image:
    linear-gradient(to top, rgba(10, 30, 22, 0.75), rgba(10, 30, 22, 0) 22%),
    url("/img/sidebar.webp");
  background-repeat: no-repeat;
  background-size:
    auto,
    100% auto;

  /* The links never sit on the trees. On a short screen the picture slides
     down a little instead, so the rocks at its foot drop out of view and the
     cabin stays. 86.5rem is where the links end plus the height of the photo
     below its tallest pine. */
  background-position:
    0 0,
    center calc(100% + max(0rem, 86.5rem - 100dvh));

  /* A short laptop screen: a smaller logo and tighter links, so the photo
     does not have to slide as far */
  @media (max-height: 820px) {
    gap: 1.6rem;
    background-position:
      0 0,
      center calc(100% + max(0rem, 78.5rem - 100dvh));

    & img {
      height: 6.4rem;
    }
  }

  /* Below a laptop it leaves the grid and slides in as a drawer */
  ${below.laptop} {
    position: fixed;
    inset: 0 auto 0 0;
    width: 26rem;
    max-width: 85vw;
    z-index: 1200;
    transition: transform 0.25s ease;
    transform: translateX(${(props) => (props.$open ? "0" : "-100%")});
    box-shadow: ${(props) => (props.$open ? "var(--shadow-lg)" : "none")};
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Backdrop = styled.div`
  display: none;

  ${below.laptop} {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 1100;
    background-color: var(--backdrop-color);
    backdrop-filter: blur(2px);
  }
`;

const CloseRow = styled.div`
  display: none;

  ${below.laptop} {
    display: flex;
    justify-content: flex-end;
  }
`;

const Tagline = styled.p`
  margin-top: auto;
  padding-bottom: 2.8rem;
  text-align: center;

  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.7;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #fff;
`;

const Rule = styled.span`
  display: block;
  width: 2.8rem;
  height: 2px;
  margin: 1.2rem auto 0;
  border-radius: 2px;
  background-color: var(--color-accent-on-photo);
`;

function Sidebar({ isOpen, onClose }) {
  // Escape closes the drawer
  useEffect(
    function () {
      if (!isOpen) return;

      function handleKey(e) {
        if (e.key === "Escape") onClose();
      }

      document.addEventListener("keydown", handleKey);

      return () => document.removeEventListener("keydown", handleKey);
    },
    [isOpen, onClose],
  );

  return (
    <>
      {isOpen && <Backdrop onClick={onClose} />}

      <StyledSidebar $open={isOpen}>
        <CloseRow>
          <ButtonIcon onClick={onClose} aria-label="Close navigation">
            <HiXMark />
          </ButtonIcon>
        </CloseRow>

        <Logo onClick={onClose} />
        <MainNav onNavigate={onClose} />

        <Tagline>
          Exceptional stays
          <br />
          powered by
          <br />
          great operations
          <Rule />
        </Tagline>
      </StyledSidebar>
    </>
  );
}

export default Sidebar;
