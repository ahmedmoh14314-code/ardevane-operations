import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import styled from "styled-components";
import {
  HiChevronDown,
  HiOutlineCalendarDays,
  HiOutlineCog6Tooth,
  HiOutlineHome,
  HiOutlineHomeModern,
  HiOutlineIdentification,
  HiOutlineRectangleStack,
  HiOutlineUserGroup,
} from "react-icons/hi2";

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const NavList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

// The section title is the button that opens and closes its group
const SectionToggle = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  border: none;
  background: none;
  padding: 0.6rem 1.6rem;
  margin-bottom: 0.4rem;
  border-radius: var(--border-radius-sm);

  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-grey-500);

  &:hover {
    color: var(--color-grey-800);
  }

  & svg {
    width: 1.6rem;
    height: 1.6rem;
    transition: transform 0.2s;
    transform: rotate(${(props) => (props.$open ? "180deg" : "0deg")});
  }

  @media (prefers-reduced-motion: reduce) {
    & svg {
      transition: none;
    }
  }
`;

// The page you are on gets a soft beige pill with a gold edge, the way it
// reads in the design. Everything else is quiet until you hover it.
const StyledNavLink = styled(NavLink)`
  &:link,
  &:visited {
    display: flex;
    align-items: center;
    gap: 1.2rem;

    color: var(--color-grey-700);
    font-size: 1.5rem;
    font-weight: 500;
    padding: 1.2rem 1.6rem;
    border-left: 3px solid transparent;
    border-radius: var(--border-radius-md);
    transition: background-color 0.2s, color 0.2s;

    @media (max-height: 820px) {
      padding: 0.9rem 1.6rem;
    }
  }

  &:hover,
  &:active {
    color: var(--color-grey-900);
    background-color: var(--color-grey-100);
  }

  &.active:link,
  &.active:visited {
    color: var(--color-grey-900);
    background-color: var(--color-grey-100);
    border-left-color: var(--color-accent-600);
    font-weight: 600;
  }

  &:focus-visible {
    outline: 2px solid var(--color-brand-600);
    outline-offset: -2px;
  }

  & svg {
    width: 2.2rem;
    height: 2.2rem;
    color: var(--color-grey-500);
    transition: color 0.2s;
  }

  &:hover svg,
  &:active svg {
    color: var(--color-grey-700);
  }

  &.active:link svg,
  &.active:visited svg {
    color: var(--color-brand-700);
  }

  @media (prefers-reduced-motion: reduce) {
    &,
    & svg {
      transition: none;
    }
  }
`;

// Grouped so the sidebar reads as a product, not a flat list of pages.
// OPERATIONS is the day-to-day work, MANAGEMENT is the setup behind it.
const SECTIONS = [
  {
    items: [{ to: "/dashboard", label: "Dashboard", icon: <HiOutlineHome /> }],
  },
  {
    label: "Operations",
    items: [
      { to: "/bookings", label: "Bookings", icon: <HiOutlineRectangleStack /> },
      { to: "/calendar", label: "Calendar", icon: <HiOutlineCalendarDays /> },
      { to: "/cabins", label: "Cabins", icon: <HiOutlineHomeModern /> },
      { to: "/guests", label: "Guests", icon: <HiOutlineUserGroup /> },
    ],
  },
  {
    label: "Management",
    items: [
      { to: "/team", label: "Team", icon: <HiOutlineIdentification /> },
      { to: "/settings", label: "Settings", icon: <HiOutlineCog6Tooth /> },
    ],
  },
];

// The group the current page belongs to, so it is the one shown open
function sectionOf(pathname) {
  const section = SECTIONS.find(
    (section) =>
      section.label && section.items.some((item) => pathname.startsWith(item.to))
  );

  return section?.label ?? "Operations";
}

// Only one group is open at a time, so every link fits without scrolling.
function MainNav({ onNavigate }) {
  const { pathname } = useLocation();
  const [openSection, setOpenSection] = useState(() => sectionOf(pathname));

  // Arriving on a page from somewhere else (the search, a link) opens its group
  useEffect(
    function () {
      setOpenSection(sectionOf(pathname));
    },
    [pathname]
  );

  function toggle(label) {
    setOpenSection((open) => (open === label ? null : label));
  }

  return (
    <Nav aria-label="Main">
      {SECTIONS.map((section, i) => {
        const isOpen = !section.label || openSection === section.label;
        const listId = `nav-${section.label || "main"}`;

        return (
          <div key={section.label || i}>
            {section.label && (
              <SectionToggle
                type="button"
                $open={isOpen}
                aria-expanded={isOpen}
                aria-controls={listId}
                onClick={() => toggle(section.label)}
              >
                <span>{section.label}</span>
                <HiChevronDown />
              </SectionToggle>
            )}

            {isOpen && (
              <NavList id={listId}>
                {section.items.map((item) => (
                  <li key={item.to}>
                    <StyledNavLink to={item.to} onClick={onNavigate}>
                      {item.icon}
                      <span>{item.label}</span>
                    </StyledNavLink>
                  </li>
                ))}
              </NavList>
            )}
          </div>
        );
      })}
    </Nav>
  );
}

export default MainNav;
