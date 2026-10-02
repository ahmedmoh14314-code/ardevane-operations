import { Link } from "react-router-dom";
import styled from "styled-components";
import { useDarkMode } from "../context/DarkModeContext";

// The logo is the way home, the same as on any site
const StyledLogo = styled(Link)`
  display: block;
  text-align: center;
  border-radius: var(--border-radius-md);

  &:focus-visible {
    outline: 2px solid var(--color-brand-600);
    outline-offset: 4px;
  }
`;

const Img = styled.img`
  height: 9.6rem;
  width: auto;

  /* The global rule dims every image in dark mode. The logo is artwork, so
     it opts out. */
  filter: none;
`;

function Logo({ onClick }) {
  const { isDarkMode } = useDarkMode();

  const src = isDarkMode ? "/logo-dark.png" : "/logo-light.png";

  return (
    <StyledLogo to="/dashboard" onClick={onClick} aria-label="Go to dashboard">
      <Img src={src} alt="Ardevane Operations" />
    </StyledLogo>
  );
}

export default Logo;
