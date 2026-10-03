import { useLayoutEffect, useRef, useState } from "react";
import styled, { css } from "styled-components";

import { below } from "../styles/breakpoints";
import { LOGIN_LEAVE_MS } from "../utils/motion";

// The full-screen photograph with the mark above a frosted card. The login,
// the error screen and the 404 all stand on it, so a guest who lands anywhere
// outside the app still knows whose site this is.
const Layout = styled.main`
  min-height: 100dvh;
  padding: 4rem 2.4rem;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2.4rem;

  background-color: #0e3326;
  background-image: url("/img/login.jpg");
  background-size: cover;
  background-position: center;

  ${below.tablet} {
    padding: 3.2rem 1.6rem;
  }
`;

// On the way out the logo glides down to the middle of the screen, which is
// exactly where the welcome splash picks it up
const Mark = styled.img`
  height: 13rem;
  width: auto;
  filter: none;
  transition: transform ${LOGIN_LEAVE_MS}ms ease-in-out;
  transform: translateY(${(props) => props.$drop}px);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    transform: none;
  }

  ${below.tablet} {
    height: 9rem;
  }
`;

const Card = styled.div`
  width: 46rem;
  max-width: 100%;
  padding: 3.2rem;

  display: flex;
  flex-direction: column;

  border-radius: var(--border-radius-xl);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 2.4rem 6.4rem rgba(12, 32, 24, 0.22);

  background-color: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(16px);

  transition:
    opacity ${LOGIN_LEAVE_MS}ms ease,
    transform ${LOGIN_LEAVE_MS}ms ease;

  ${(props) =>
    props.$leaving &&
    css`
      opacity: 0;
      transform: translateY(1.6rem) scale(0.96);
    `}

  @media (prefers-reduced-motion: reduce) {
    transform: none;
  }

  ${below.tablet} {
    padding: 2.4rem 2rem;
  }
`;

// The card always sits on a bright photo, so its text is dark in both themes
const Eyebrow = styled.p`
  text-align: center;
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #a97d3f;
`;

const Title = styled.h1`
  text-align: center;
  margin-top: 0.4rem;

  font-family: var(--font-display);
  font-size: 3.2rem;
  font-weight: 600;
  line-height: 1.2;
  color: #16281f;

  ${below.tablet} {
    font-size: 2.6rem;
  }
`;

const Subtitle = styled.p`
  text-align: center;
  margin: 0.8rem 0 2.4rem;

  font-size: 1.5rem;
  line-height: 1.5;
  color: #5b6560;
`;

function PhotoPage({ eyebrow, title, subtitle, isLeaving = false, children }) {
  const markRef = useRef(null);
  const [drop, setDrop] = useState(0);

  // How far the logo has to travel to sit in the middle of the screen
  useLayoutEffect(
    function () {
      if (!isLeaving || !markRef.current) return;

      const rect = markRef.current.getBoundingClientRect();
      setDrop(window.innerHeight / 2 - (rect.top + rect.height / 2));
    },
    [isLeaving],
  );

  return (
    <Layout>
      <Mark
        ref={markRef}
        $drop={drop}
        src="/logo-light.png"
        alt="Ardevane Operations"
      />

      <Card $leaving={isLeaving} aria-hidden={isLeaving}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <Title>{title}</Title>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}

        {children}
      </Card>
    </Layout>
  );
}

export default PhotoPage;
