import {
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { HiXMark } from "react-icons/hi2";
import styled from "styled-components";
import { useOutsideClick } from "../hooks/useOutsideClick";

const StyledModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-lg);
  padding: 3.2rem 4rem;
  transition: all 0.5s;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: var(--backdrop-color);
  backdrop-filter: blur(4px);
  z-index: 1000;
  transition: all 0.5s;
`;

const Button = styled.button`
  position: absolute;
  top: 1.6rem;
  right: 1.6rem;

  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.6rem;
  height: 3.6rem;

  background: none;
  border: none;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--color-brand-50);
  }

  & svg {
    width: 2.2rem;
    height: 2.2rem;
    color: var(--color-grey-500);
  }

  &:hover svg {
    color: var(--color-brand-600);
  }
`;

// Tracks which window is open, by name
const ModalContext = createContext();

function Modal({ children }) {
  const [openName, setOpenName] = useState("");

  const close = () => setOpenName("");
  const open = setOpenName;

  return (
    <ModalContext.Provider value={{ openName, close, open }}>
      {children}
    </ModalContext.Provider>
  );
}

function Open({ children, opens: opensWindowName }) {
  const { open } = useContext(ModalContext);

  return cloneElement(children, { onClick: () => open(opensWindowName) });
}

function Window({ children, name }) {
  const { openName, close } = useContext(ModalContext);
  const ref = useOutsideClick(close);
  const isOpen = name === openName;

  useEffect(
    function () {
      if (!isOpen) return;

      function handleKey(e) {
        if (e.key === "Escape") close();
      }

      document.addEventListener("keydown", handleKey);

      // Move focus inside, so the keyboard lands in the dialog
      ref.current?.querySelector("input, button, textarea, select")?.focus();

      return () => document.removeEventListener("keydown", handleKey);
    },
    [isOpen, close, ref]
  );

  if (!isOpen) return null;

  return createPortal(
    <Overlay>
      <StyledModal ref={ref} role="dialog" aria-modal="true">
        <Button onClick={close} aria-label="Close dialog">
          <HiXMark />
        </Button>

        <div>{cloneElement(children, { onCloseModal: close })}</div>
      </StyledModal>
    </Overlay>,
    document.body
  );
}

Modal.Open = Open;
Modal.Window = Window;

export default Modal;
