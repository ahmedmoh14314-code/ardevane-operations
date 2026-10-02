import styled from "styled-components";
import { HiArrowPath } from "react-icons/hi2";

import GlobalStyles from "../styles/GlobalStyles";
import PhotoPage from "./PhotoPage";
import Button from "./Button";

// What actually broke, for whoever reports it. Kept small and quiet.
const Details = styled.p`
  margin-bottom: 2.4rem;
  padding: 1.2rem 1.6rem;

  font-family: var(--font-numbers);
  font-size: 1.3rem;
  color: #7d2e1a;
  background-color: rgba(248, 226, 218, 0.8);
  border-radius: var(--border-radius-sm);
  overflow-wrap: anywhere;
`;

// Shown when a page crashes. It sits outside the router, so it cannot link;
// trying again reloads the app from the dashboard.
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <>
      <GlobalStyles />

      <PhotoPage
        eyebrow="Something went wrong"
        title="We hit a snag on the trail"
        subtitle="This page ran into a problem. Try again, and if it keeps happening, let the team know what you were doing."
      >
        {error?.message && <Details>{error.message}</Details>}

        <Button size="large" onClick={resetErrorBoundary}>
          <HiArrowPath />
          <span>Try again</span>
        </Button>
      </PhotoPage>
    </>
  );
}

export default ErrorFallback;
