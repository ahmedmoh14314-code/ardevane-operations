import { createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { HiEllipsisVertical } from "react-icons/hi2";
import styled, { keyframes } from "styled-components";
import { fadeIn } from "../styles/animations";
import { useOutsideClick } from "../hooks/useOutsideClick";

const dropIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-0.4rem);
  }
  to {
    opacity: 1;
    transform: none;
  }
`;

const Menu = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const StyledToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.4rem;
  height: 3.4rem;

  background: none;
  border: none;
  border-radius: 50%;
  transform: translateX(0.8rem);
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--color-brand-50);
  }

  & svg {
    width: 2.2rem;
    height: 2.2rem;
    color: var(--color-grey-600);
  }
`;

const StyledList = styled.ul`
  position: fixed;

  padding: 0.6rem;
  min-width: 18rem;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  box-shadow: var(--shadow-lg);
  border-radius: var(--border-radius-md);
  z-index: 1300;
  animation: ${dropIn} 0.16s ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation-name: ${fadeIn};
  }

  right: ${(props) => props.position.x}px;
  top: ${(props) => props.position.y}px;
`;

const StyledButton = styled.button`
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  border-radius: var(--border-radius-sm);
  padding: 1rem 1.4rem;
  font-size: 1.4rem;
  font-weight: 500;
  color: var(--color-grey-700);
  transition:
    background-color 0.15s,
    color 0.15s;

  display: flex;
  align-items: center;
  gap: 1.2rem;

  &:hover {
    color: var(--color-brand-700);
    background-color: var(--color-brand-50);
  }

  & svg {
    width: 1.8rem;
    height: 1.8rem;
    color: var(--color-grey-500);
    transition: color 0.15s;
  }

  &:hover svg {
    color: var(--color-brand-600);
  }
`;

// One shared openId, so only one menu is open at a time
const MenusContext = createContext();

function Menus({ children }) {
  const [openId, setOpenId] = useState("");
  const [position, setPosition] = useState(null);

  const close = () => setOpenId("");
  const open = setOpenId;

  return (
    <MenusContext.Provider
      value={{ openId, close, open, position, setPosition }}
    >
      {children}
    </MenusContext.Provider>
  );
}

function Toggle({ id }) {
  const { openId, close, open, setPosition } = useContext(MenusContext);

  function handleClick(e) {
    e.stopPropagation();

    const rect = e.target.closest("button").getBoundingClientRect();
    setPosition({
      x: window.innerWidth - rect.width - rect.x,
      y: rect.y + rect.height + 8,
    });

    openId === "" || openId !== id ? open(id) : close();
  }

  return (
    <StyledToggle
      onClick={handleClick}
      aria-label="Open actions menu"
      aria-haspopup="menu"
      aria-expanded={openId === id}
    >
      <HiEllipsisVertical />
    </StyledToggle>
  );
}

function List({ id, children }) {
  const { openId, position, close } = useContext(MenusContext);
  const ref = useOutsideClick(close, false);

  // Escape closes the menu, the same way it closes a modal
  useEffect(
    function () {
      if (openId !== id) return;

      function handleKey(e) {
        if (e.key === "Escape") close();
      }

      document.addEventListener("keydown", handleKey);

      return () => document.removeEventListener("keydown", handleKey);
    },
    [openId, id, close],
  );

  if (openId !== id) return null;

  return createPortal(
    <StyledList position={position} ref={ref} role="menu">
      {children}
    </StyledList>,
    document.body,
  );
}

function Button({ children, icon, onClick }) {
  const { close } = useContext(MenusContext);

  function handleClick() {
    onClick?.();
    close();
  }

  return (
    <li role="none">
      <StyledButton onClick={handleClick} role="menuitem">
        {icon}
        <span>{children}</span>
      </StyledButton>
    </li>
  );
}

Menus.Menu = Menu;
Menus.Toggle = Toggle;
Menus.List = List;
Menus.Button = Button;

export default Menus;
