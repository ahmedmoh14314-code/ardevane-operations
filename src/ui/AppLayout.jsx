import { useCallback, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Sidebar from "./Sidebar";
import Header from "./Header";
import WelcomeSplash from "./WelcomeSplash";
import { below } from "../styles/breakpoints";

const StyledAppLayout = styled.div`
  display: grid;
  grid-template-columns: 26rem 1fr;
  grid-template-rows: auto 1fr;
  height: 100dvh;

  /* The sidebar becomes a drawer, so the grid drops to one column */
  ${below.laptop} {
    grid-template-columns: 1fr;
  }
`;

const Main = styled.main`
  background-color: var(--color-grey-50);
  padding: 4rem 4.8rem 6.4rem;
  overflow-y: auto;

  ${below.laptop} {
    padding: 3.2rem 2.4rem 4.8rem;
  }

  ${below.tablet} {
    padding: 2.4rem 1.6rem 4rem;
  }
`;

const Container = styled.div`
  max-width: 140rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 3.2rem;

  ${below.tablet} {
    gap: 2.4rem;
  }
`;

function AppLayout() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { pathname, state } = useLocation();
  const navigate = useNavigate();

  // Only a fresh login carries this. Clearing it means a refresh never
  // shows the splash again.
  const finishWelcome = useCallback(
    () => navigate(pathname, { replace: true, state: null }),
    [navigate, pathname]
  );

  const close = () => setIsNavOpen(false);

  return (
    <StyledAppLayout>
      {state?.welcome && <WelcomeSplash onDone={finishWelcome} />}

      <Header onOpenNav={() => setIsNavOpen(true)} />
      <Sidebar isOpen={isNavOpen} onClose={close} />

      <Main>
        {/* key makes the main region scroll back to the top on every route */}
        <Container key={pathname}>
          <Outlet />
        </Container>
      </Main>
    </StyledAppLayout>
  );
}

export default AppLayout;
