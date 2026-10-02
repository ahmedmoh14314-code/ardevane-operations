import { useEffect, useRef, useState } from "react";
import { useIsFetching } from "@tanstack/react-query";
import styled, { css, keyframes } from "styled-components";
import { below } from "../styles/breakpoints";

// The splash never ends before this, so it never flashes past
const MIN_MS = 900;

// Nor does it outstay a slow connection
const MAX_MS = 4000;

const FADE_MS = 400;

const zoom = keyframes`
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.08);
  }
`;

const appear = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const fill = keyframes`
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
`;

const StyledSplash = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2000;
  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: center;

  background-color: #0e3326;
  transition: opacity ${FADE_MS}ms ease;

  /* Nothing moves, so the logo jumping to the middle is hidden by a fade */
  @media (prefers-reduced-motion: reduce) {
    animation: ${appear} 250ms ease;
  }

  ${(props) =>
    props.$leaving &&
    css`
      opacity: 0;
    `}
`;

// The same photograph as the login page, slowly moving in towards the cabin
const Photo = styled.div`
  position: absolute;
  inset: 0;
  background-image: url("/img/login.jpg");
  background-size: cover;
  background-position: center;
  animation: ${zoom} 1.6s ease-out forwards;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

// A soft cream light behind the logo, so it reads on the bright photo
const Glow = styled.div`
  position: absolute;
  inset: 0;
  background-image: radial-gradient(
    circle at 50% 50%,
    rgba(253, 250, 244, 0.85) 0,
    rgba(253, 250, 244, 0.55) 16rem,
    rgba(253, 250, 244, 0) 34rem
  );
`;

// The logo sits exactly where the login page left it, in the middle
const Mark = styled.div`
  position: relative;

  & img {
    display: block;
    height: 13rem;
    width: auto;
    filter: none;

    ${below.tablet} {
      height: 9rem;
    }
  }
`;

// A thin gold line under the logo that fills while the dashboard loads
const Track = styled.span`
  position: absolute;
  top: calc(100% + 1.6rem);
  left: 50%;
  width: 12rem;
  height: 2px;
  margin-left: -6rem;
  border-radius: 2px;
  overflow: hidden;
  background-color: rgba(22, 40, 31, 0.15);

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background-color: #a97d3f;
    transform-origin: left;
    animation: ${fill} ${MIN_MS}ms ease-out forwards;
  }

  @media (prefers-reduced-motion: reduce) {
    &::after {
      animation: none;
    }
  }
`;

// Shown once, straight after logging in. It covers the dashboard while its
// data loads, then fades away, so the welcome costs no time of its own.
function WelcomeSplash({ onDone }) {
  const isFetching = useIsFetching();
  const [hasMinPassed, setHasMinPassed] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // The dashboard starts fetching a moment after it mounts. Waiting until
  // a fetch has been seen stops the splash leaving before the work begins.
  const sawFetching = useRef(false);

  useEffect(
    function () {
      if (isFetching > 0) sawFetching.current = true;
    },
    [isFetching]
  );

  useEffect(function () {
    const min = setTimeout(() => setHasMinPassed(true), MIN_MS);
    const max = setTimeout(() => setIsLeaving(true), MAX_MS);

    return () => {
      clearTimeout(min);
      clearTimeout(max);
    };
  }, []);

  useEffect(
    function () {
      if (hasMinPassed && sawFetching.current && isFetching === 0)
        setIsLeaving(true);
    },
    [hasMinPassed, isFetching]
  );

  useEffect(
    function () {
      if (!isLeaving) return;

      const done = setTimeout(onDone, FADE_MS);

      return () => clearTimeout(done);
    },
    [isLeaving, onDone]
  );

  return (
    <StyledSplash $leaving={isLeaving} role="status" aria-label="Loading your dashboard">
      <Photo />
      <Glow />

      <Mark>
        <img src="/logo-light.png" alt="Ardevane Operations" />
        <Track />
      </Mark>
    </StyledSplash>
  );
}

export default WelcomeSplash;
