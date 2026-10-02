import styled from "styled-components";
import { HiBars3 } from "react-icons/hi2";

import GlobalSearch from "./GlobalSearch";
import HeaderMenu from "./HeaderMenu";
import UserAvatar from "../features/authentication/UserAvatar";
import ButtonIcon from "./ButtonIcon";
import { below } from "../styles/breakpoints";

const StyledHeader = styled.header`
  background-color: var(--color-grey-0);
  padding: 1.2rem 4.8rem;
  border-bottom: 1px solid var(--color-grey-100);

  display: flex;
  gap: 2.4rem;
  align-items: center;

  ${below.laptop} {
    padding: 1.2rem 1.6rem;
    gap: 1.2rem;
    justify-content: space-between;
  }
`;

const NavToggle = styled.div`
  display: none;

  ${below.laptop} {
    display: block;
  }
`;

const Right = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 2rem;

  ${below.laptop} {
    gap: 1.2rem;
  }
`;

const Divider = styled.span`
  width: 1px;
  height: 2.8rem;
  background-color: var(--color-grey-100);

  ${below.tablet} {
    display: none;
  }
`;

function Header({ onOpenNav }) {
  return (
    <StyledHeader>
      <NavToggle>
        <ButtonIcon onClick={onOpenNav} aria-label="Open navigation">
          <HiBars3 />
        </ButtonIcon>
      </NavToggle>

      <GlobalSearch />

      <Right>
        <HeaderMenu />

        <Divider />

        <UserAvatar />
      </Right>
    </StyledHeader>
  );
}

export default Header;
