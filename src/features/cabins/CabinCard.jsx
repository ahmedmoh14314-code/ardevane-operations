import styled from "styled-components";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  HiArchiveBox,
  HiArrowUturnLeft,
  HiNoSymbol,
  HiOutlineUsers,
  HiPencil,
  HiSquare2Stack,
  HiTrash,
} from "react-icons/hi2";

import CreateCabinForm from "./CreateCabinForm";
import { useDeleteCabin } from "./useDeleteCabin";
import { useCreateCabin } from "./useCreateCabin";
import { useToggleCabinActive } from "./useToggleCabinActive";
import { useCabinCondition } from "./useCabinCondition";

import Modal from "../../ui/Modal";
import ConfirmDelete from "../../ui/ConfirmDelete";
import Menus from "../../ui/Menus";
import Tag from "../../ui/Tag";
import Button from "../../ui/Button";
import { formatCurrency, toDay } from "../../utils/helpers";
import { cabinCondition, nextConditionStep } from "../../utils/operations";

const Card = styled.article`
  display: flex;
  flex-direction: column;
  overflow: hidden;

  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  transition:
    box-shadow 0.2s,
    transform 0.2s;

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  @media (prefers-reduced-motion: reduce) {
    &:hover {
      transform: none;
    }
  }
`;

const Photo = styled.div`
  position: relative;
  aspect-ratio: 16 / 10;
  background-color: var(--color-grey-100);

  & img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: ${(props) => (props.$archived ? 0.45 : 1)};
    filter: ${(props) => (props.$archived ? "grayscale(60%)" : "none")};
  }
`;

// Things that sit on top of the photo, in its corners
const TopLeft = styled.div`
  position: absolute;
  top: 1.2rem;
  left: 1.2rem;
  display: flex;
  gap: 0.6rem;
`;

const DiscountBadge = styled.span`
  font-size: 1.2rem;
  font-weight: 600;
  padding: 0.4rem 1rem;
  border-radius: 100px;
  color: #fff;
  background-color: var(--color-brand-600);
`;

// The cabin's condition, on the photo, so a glance down the grid is enough.
// A solid backing keeps it readable on any picture.
const ConditionSpot = styled.div`
  position: absolute;
  left: 1.2rem;
  bottom: 1.2rem;

  & > span {
    box-shadow: 0 0.2rem 0.8rem rgba(0, 0, 0, 0.18);
  }
`;

// The menu button gets a white disc so it shows on any photo
const MenuSpot = styled.div`
  position: absolute;
  top: 1rem;
  right: 1.8rem;

  & button {
    background-color: rgba(255, 255, 255, 0.92);
    box-shadow: var(--shadow-sm);
  }

  & button:hover {
    background-color: #fff;
  }

  & button svg,
  & button:hover svg {
    color: #374151;
  }
`;

const Body = styled.div`
  flex: 1;
  padding: 1.6rem 1.8rem 1.8rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1.2rem;
`;

const Name = styled.h3`
  font-family: var(--font-display);
  font-size: 2.2rem;
  font-weight: 600;
  color: var(--color-grey-800);
`;

const Price = styled.p`
  text-align: right;
  white-space: nowrap;
  font-family: var(--font-numbers);
  font-variant-numeric: tabular-nums;

  & strong {
    font-size: 1.8rem;
    font-weight: 600;
    color: var(--color-grey-800);
  }

  & span {
    font-size: 1.3rem;
    color: var(--color-grey-500);
  }

  & s {
    display: block;
    font-size: 1.3rem;
    color: var(--color-grey-400);
  }
`;

// Who is staying, when someone is: occupancy comes from the bookings, not
// from the cabin's condition
const Occupant = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.35rem;
  color: var(--color-grey-600);

  &::before {
    content: "";
    flex-shrink: 0;
    width: 0.8rem;
    height: 0.8rem;
    border-radius: 50%;
    background-color: var(--color-indigo-700);
  }

  & strong {
    font-weight: 500;
    color: var(--color-grey-800);
  }

  &:hover strong {
    color: var(--color-brand-600);
  }
`;

// Pinned to the bottom, so every card in a row lines up
const Footer = styled.div`
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.2rem;
  border-top: 1px solid var(--color-grey-100);

  font-size: 1.4rem;
  color: var(--color-grey-600);
`;

const Capacity = styled.span`
  display: flex;
  align-items: center;
  gap: 0.6rem;

  & svg {
    width: 1.8rem;
    height: 1.8rem;
    color: var(--color-brand-600);
  }
`;

function CabinCard({ cabin, stay }) {
  const { isDeleting, deleteCabin } = useDeleteCabin();
  const { isCreating, createCabin } = useCreateCabin();
  const { toggleActive } = useToggleCabinActive();
  const { changeCondition, isChanging } = useCabinCondition();

  const {
    id: cabinId,
    name,
    maxCapacity,
    regularPrice,
    discount,
    image,
    description,
    is_active: isActive = true,
    condition = "ready",
  } = cabin;

  const { label: conditionLabel, tag: conditionTag } =
    cabinCondition(condition);
  const nextStep = nextConditionStep(condition);

  // What a guest actually pays per night
  const nightlyPrice = regularPrice - (discount || 0);

  function handleDuplicate() {
    createCabin({
      name: `Copy of ${name}`,
      maxCapacity,
      regularPrice,
      discount,
      image,
      description,
    });
  }

  return (
    <Card>
      <Photo $archived={!isActive}>
        <img src={image} alt={`Cabin ${name}`} loading="lazy" />

        {discount > 0 && (
          <TopLeft>
            <DiscountBadge>Save {formatCurrency(discount)}</DiscountBadge>
          </TopLeft>
        )}

        {isActive && (
          <ConditionSpot>
            <Tag type={conditionTag}>{conditionLabel}</Tag>
          </ConditionSpot>
        )}

        <MenuSpot>
          <Modal>
            <Menus.Menu>
              <Menus.Toggle id={cabinId} />

              <Menus.List id={cabinId}>
                <Menus.Button
                  icon={<HiSquare2Stack />}
                  onClick={handleDuplicate}
                  disabled={isCreating}
                >
                  Duplicate
                </Menus.Button>

                <Modal.Open opens="edit">
                  <Menus.Button icon={<HiPencil />}>Edit</Menus.Button>
                </Modal.Open>

                {condition !== "out_of_service" && (
                  <Menus.Button
                    icon={<HiNoSymbol />}
                    onClick={() =>
                      changeCondition({
                        id: cabinId,
                        condition: "out_of_service",
                      })
                    }
                  >
                    Take out of service
                  </Menus.Button>
                )}

                {/* Archiving keeps the booking history, deleting does not */}
                <Menus.Button
                  icon={isActive ? <HiArchiveBox /> : <HiArrowUturnLeft />}
                  onClick={() =>
                    toggleActive({ id: cabinId, isActive: !isActive })
                  }
                >
                  {isActive ? "Archive" : "Restore"}
                </Menus.Button>

                <Modal.Open opens="delete">
                  <Menus.Button icon={<HiTrash />}>Delete</Menus.Button>
                </Modal.Open>
              </Menus.List>

              <Modal.Window name="edit">
                <CreateCabinForm cabinToEdit={cabin} />
              </Modal.Window>

              <Modal.Window name="delete">
                <ConfirmDelete
                  resourceName="cabins"
                  disabled={isDeleting}
                  onConfirm={() => deleteCabin(cabinId)}
                />
              </Modal.Window>
            </Menus.Menu>
          </Modal>
        </MenuSpot>
      </Photo>

      <Body>
        <TitleRow>
          <Name>Cabin {name}</Name>

          <Price>
            <strong>{formatCurrency(nightlyPrice)}</strong>
            <span> / night</span>
            {discount > 0 && <s>{formatCurrency(regularPrice)}</s>}
          </Price>
        </TitleRow>

        {stay && (
          <Occupant to={`/bookings/${stay.id}`}>
            <span>
              In house: <strong>{stay.guests.fullName}</strong> until{" "}
              {format(toDay(stay.endDate), "MMM d")}
            </span>
          </Occupant>
        )}

        <Footer>
          <Capacity>
            <HiOutlineUsers />
            Up to {maxCapacity} guests
          </Capacity>

          {/* The usual next step for the cabin, one click away */}
          {!isActive ? (
            <Tag type="silver">Archived</Tag>
          ) : (
            nextStep && (
              <Button
                size="small"
                variation={condition === "dirty" ? "primary" : "secondary"}
                disabled={isChanging}
                onClick={() =>
                  changeCondition({ id: cabinId, condition: nextStep.to })
                }
              >
                {nextStep.label}
              </Button>
            )
          )}
        </Footer>
      </Body>
    </Card>
  );
}

export default CabinCard;
