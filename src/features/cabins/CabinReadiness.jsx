import styled from "styled-components";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";

import HousekeepingTrack from "./HousekeepingTrack";

const Panel = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
  gap: 2.4rem;
  align-items: center;
  padding: 2rem 2.4rem;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    gap: 1.4rem;
  }
`;

const Title = styled.h3`
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-grey-800);
`;

const Note = styled.p`
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  margin-top: 0.4rem;
  font-size: 1.35rem;
  color: var(--color-grey-500);

  &[data-warn="true"] {
    color: var(--color-yellow-700);
  }

  & svg {
    flex-shrink: 0;
    width: 1.8rem;
    height: 1.8rem;
  }
`;

// What the guest's cabin is like right now, on the booking and at check-in.
// Before arrival it says whether the cabin is ready for them; it never
// stops the check-in.
function CabinReadiness({ cabin, status }) {
  const { id, name, condition = "ready" } = cabin;
  const isArriving = status === "reserved";
  const isReady = condition === "ready";

  let note = "Ready for the guest.";
  if (!isArriving) note = "The guest is staying here now.";
  else if (condition === "dirty")
    note = "Not cleaned yet since the last guest left.";
  else if (condition === "cleaning") note = "Being cleaned right now.";
  else if (condition === "out_of_service")
    note = "Out of service. Fix it or move the guest before they arrive.";

  return (
    <Panel aria-label={`Cabin ${name}`}>
      <div>
        <Title>Cabin {name}</Title>
        <Note data-warn={isArriving && !isReady}>
          {isArriving && !isReady && <HiOutlineExclamationTriangle />}
          {note}
        </Note>
      </div>

      <HousekeepingTrack cabinId={id} condition={condition} />
    </Panel>
  );
}

export default CabinReadiness;
