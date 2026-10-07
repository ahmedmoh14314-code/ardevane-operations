import styled, { css, keyframes } from "styled-components";
import {
  HiCheck,
  HiOutlineNoSymbol,
  HiOutlineSparkles,
  HiOutlineTrash,
  HiOutlineHomeModern,
} from "react-icons/hi2";

import { useCabinCondition } from "./useCabinCondition";

// ---------------------------------------------------------------------------
// The housekeeping cycle of a cabin as a track the staff can tap:
//
//   Dirty ─› Cleaning ─› Ready
//
// The current step is lit in its colour, the steps behind it are ticked,
// and tapping any step moves the cabin there. A cabin out of service shows
// as a striped band instead, with one way back.
// ---------------------------------------------------------------------------

const STEPS = [
  { value: "dirty", label: "Dirty", tone: "red", icon: HiOutlineTrash },
  {
    value: "cleaning",
    label: "Cleaning",
    tone: "blue",
    icon: HiOutlineSparkles,
  },
  { value: "ready", label: "Ready", tone: "green", icon: HiOutlineHomeModern },
];

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const Label = styled.p`
  display: flex;
  justify-content: space-between;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-grey-400);
`;

const Track = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.4rem;
  padding: 0.4rem;
  border-radius: var(--border-radius-md);
  background-color: var(--color-grey-50);
  border: 1px solid var(--color-grey-100);
`;

// The cleaning step breathes while someone is at work
const breathe = keyframes`
  50% { box-shadow: 0 0 0 0.4rem var(--color-blue-100); }
`;

const Step = styled.button.attrs({ type: "button" })`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 0;
  padding: 0.7rem 0.4rem;
  border: none;
  border-radius: var(--border-radius-sm);
  background: transparent;
  font-size: 1.25rem;
  font-weight: 500;
  white-space: nowrap;
  color: var(--color-grey-400);
  transition:
    background-color 0.25s,
    color 0.25s,
    box-shadow 0.25s;

  & svg {
    flex-shrink: 0;
    width: 1.6rem;
    height: 1.6rem;
  }

  /* A small arrow between steps, so it reads as a cycle */
  &:not(:last-child)::after {
    content: "›";
    position: absolute;
    right: -0.45rem;
    top: 50%;
    transform: translateY(-55%);
    font-size: 1.4rem;
    color: var(--color-grey-300);
    pointer-events: none;
  }

  &:hover:not(:disabled) {
    color: var(--color-grey-700);
    background-color: var(--color-grey-0);
  }

  ${(props) =>
    props.$state === "done" &&
    css`
      color: var(--color-grey-500);
    `}

  ${(props) =>
    props.$state === "current" &&
    css`
      font-weight: 600;
      color: var(--color-${props.$tone}-700);
      background-color: var(--color-${props.$tone}-100);
      box-shadow: var(--shadow-sm);

      &:hover:not(:disabled) {
        color: var(--color-${props.$tone}-700);
        background-color: var(--color-${props.$tone}-100);
      }
    `}

  ${(props) =>
    props.$state === "current" &&
    props.$tone === "blue" &&
    css`
      animation: ${breathe} 2.4s ease-in-out infinite;

      @media (prefers-reduced-motion: reduce) {
        animation: none;
      }
    `}

  &:disabled {
    cursor: wait;
  }
`;

// Out of service: hazard stripes, so nobody mistakes it for a free cabin
const OutBand = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  padding: 0.8rem 0.8rem 0.8rem 1.2rem;
  border-radius: var(--border-radius-md);
  color: var(--color-silver-700);
  background:
    repeating-linear-gradient(
      -45deg,
      transparent 0 0.8rem,
      rgba(0, 0, 0, 0.05) 0.8rem 1.6rem
    ),
    var(--color-silver-100);
  border: 1px dashed var(--color-grey-300);

  & strong {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 1.3rem;
    font-weight: 600;
  }

  & svg {
    width: 1.8rem;
    height: 1.8rem;
  }

  & button {
    padding: 0.6rem 1.2rem;
    font-size: 1.25rem;
    font-weight: 600;
    border: none;
    border-radius: var(--border-radius-sm);
    color: #fff;
    background-color: var(--color-brand-600);
    white-space: nowrap;
  }

  & button:hover:not(:disabled) {
    background-color: var(--color-brand-700);
  }
`;

const Hint = styled.span`
  letter-spacing: normal;
  text-transform: none;
  font-weight: 500;
  color: var(--color-grey-500);
`;

function HousekeepingTrack({ cabinId, condition = "ready", label = true }) {
  const { changeCondition, isChanging } = useCabinCondition();

  const move = (to) => {
    if (to !== condition) changeCondition({ id: cabinId, condition: to });
  };

  if (condition === "out_of_service")
    return (
      <Wrap>
        {label && <Label>Housekeeping</Label>}
        <OutBand>
          <strong>
            <HiOutlineNoSymbol />
            Out of service
          </strong>
          <button disabled={isChanging} onClick={() => move("ready")}>
            Back in service
          </button>
        </OutBand>
      </Wrap>
    );

  const current = STEPS.findIndex((step) => step.value === condition);

  return (
    <Wrap>
      {label && (
        <Label>
          Housekeeping
          {condition === "dirty" && <Hint>Needs cleaning</Hint>}
          {condition === "cleaning" && <Hint>Being cleaned</Hint>}
        </Label>
      )}

      <Track role="group" aria-label="Housekeeping">
        {STEPS.map(({ value, label: stepLabel, tone, icon: Icon }, index) => {
          const state =
            index === current ? "current" : index < current ? "done" : "todo";

          return (
            <Step
              key={value}
              $state={state}
              $tone={tone}
              aria-pressed={state === "current"}
              title={
                state === "current"
                  ? `This cabin is ${stepLabel.toLowerCase()}`
                  : `Mark as ${stepLabel.toLowerCase()}`
              }
              disabled={isChanging}
              onClick={() => move(value)}
            >
              {state === "done" ? <HiCheck /> : <Icon />}
              <span>{stepLabel}</span>
            </Step>
          );
        })}
      </Track>
    </Wrap>
  );
}

export default HousekeepingTrack;
