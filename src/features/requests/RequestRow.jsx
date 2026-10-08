import styled, { css } from "styled-components";
import { Link } from "react-router-dom";
import { format, formatDistanceToNowStrict } from "date-fns";
import {
  HiArrowRight,
  HiCheck,
  HiOutlineClock,
  HiOutlineLifebuoy,
  HiOutlineSparkles,
  HiOutlineWrenchScrewdriver,
} from "react-icons/hi2";

import { useMoveRequest } from "./useRequests";
import { formatCurrency, toDay } from "../../utils/helpers";
import {
  nextRequestStep,
  requestStatusLabel,
  requestTotal,
  requestType,
} from "../../utils/requests";

function CutleryIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      {...props}
    >
      <path d="M7 3v7a2 2 0 0 0 2 2v9M11 3v7a2 2 0 0 1-2 2M7 3v4M9 3v4M11 3v4" />
      <path d="M17 21V3c-2 1.5-3 4-3 7v4h3" />
    </svg>
  );
}

const kindIcons = {
  dining: CutleryIcon,
  housekeeping: HiOutlineSparkles,
  support: HiOutlineLifebuoy,
  maintenance: HiOutlineWrenchScrewdriver,
};

const Card = styled.li`
  display: flex;
  flex-direction: column;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: box-shadow 0.25s;

  &:hover {
    box-shadow: var(--shadow-md);
  }

  ${(props) =>
    props.$done &&
    css`
      opacity: 0.8;
    `}
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1.4rem 1.6rem 0;
`;

// The kind of request, as a round icon in its colour
const Kind = styled.span`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  color: var(--color-${(props) => props.$tone}-700);
  background-color: var(--color-${(props) => props.$tone}-100);

  & svg {
    width: 2rem;
    height: 2rem;
  }
`;

const Who = styled(Link)`
  flex: 1;
  min-width: 0;

  & strong {
    display: block;
    font-family: var(--font-display);
    font-size: 1.65rem;
    font-weight: 600;
    color: var(--color-grey-800);
  }

  & span {
    font-size: 1.25rem;
    color: var(--color-grey-500);
    text-transform: capitalize;
  }

  &:hover strong {
    color: var(--color-brand-600);
  }
`;

const Status = styled.span`
  flex-shrink: 0;
  padding: 0.4rem 1.1rem;
  border-radius: 100px;
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--color-${(props) => props.$tone}-700);
  background-color: var(--color-${(props) => props.$tone}-100);
`;

const Body = styled.div`
  flex: 1;
  padding: 1.4rem 1.6rem;
`;

// A food order: every dish as its own photo, the count on it
const Dishes = styled.ul`
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.2rem;
`;

const Dish = styled.li`
  flex: 0 0 10.5rem;

  & figure {
    position: relative;
    aspect-ratio: 4 / 3;
    border-radius: var(--border-radius-md);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
        135deg,
        var(--color-yellow-100),
        var(--color-grey-100)
      )
      center / cover no-repeat;
    color: var(--color-yellow-700);
  }

  & figure > svg {
    width: 2.6rem;
    height: 2.6rem;
    opacity: 0.6;
  }

  & b {
    position: absolute;
    right: 0.6rem;
    top: 0.6rem;
    min-width: 2.6rem;
    padding: 0.2rem 0.7rem;
    border-radius: 100px;
    font-size: 1.25rem;
    text-align: center;
    color: #fff;
    background-color: rgba(23, 30, 26, 0.75);
    backdrop-filter: blur(4px);
  }

  & span {
    display: block;
    margin-top: 0.6rem;
    font-size: 1.25rem;
    line-height: 1.3;
    color: var(--color-grey-700);
  }
`;

const Title = styled.p`
  font-size: 1.6rem;
  font-weight: 500;
  color: var(--color-grey-800);
`;

const Note = styled.p`
  margin-top: 0.6rem;
  font-size: 1.35rem;
  font-style: italic;
  color: var(--color-grey-500);
`;

const Urgent = styled.span`
  display: inline-block;
  margin-bottom: 0.6rem;
  padding: 0.2rem 0.9rem;
  border-radius: 100px;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #fff;
  background-color: var(--color-red-700);
`;

const Foot = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  padding: 1.2rem 1.6rem;
  border-top: 1px solid var(--color-grey-100);
  background-color: var(--color-grey-50);
`;

const Meta = styled.p`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem 1.2rem;
  font-size: 1.25rem;
  color: var(--color-grey-500);

  & svg {
    width: 1.4rem;
    height: 1.4rem;
    vertical-align: -0.2rem;
  }

  & strong {
    font-family: var(--font-numbers);
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-grey-800);
  }

  & .when {
    font-weight: 600;
    color: var(--color-yellow-700);
  }
`;

const Move = styled.button`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1.6rem;
  border: none;
  border-radius: 100px;
  font-size: 1.35rem;
  font-weight: 600;
  white-space: nowrap;
  color: #fff;
  background-color: var(--color-brand-600);
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: var(--color-brand-700);
  }

  & svg {
    width: 1.6rem;
    height: 1.6rem;
  }

  ${(props) =>
    props.$first &&
    css`
      color: var(--color-brand-700);
      background-color: var(--color-brand-100);

      &:hover:not(:disabled) {
        background-color: var(--color-brand-200);
      }
    `}
`;

// One request: who and where, what they asked for (the dishes themselves
// for a food order), and the one button that moves it on
function RequestRow({ request }) {
  const { moveRequest, isMoving } = useMoveRequest();

  const {
    id,
    created_at,
    type,
    status,
    title,
    note,
    priority,
    requestedFor,
    requestedDate,
    bookingId,
    completedAt,
    request_items: items = [],
    bookings: booking,
  } = request;

  const kind = requestType(type);
  const KindIcon = kindIcons[type] ?? HiOutlineSparkles;
  const next = nextRequestStep(type, status);
  const total = requestTotal(items);
  const isDone = status === "completed";
  const statusTone = isDone ? "green" : status === "new" ? "silver" : "blue";

  const ago = (date) =>
    formatDistanceToNowStrict(new Date(date), { addSuffix: true });

  return (
    <Card $done={isDone}>
      <Head>
        <Kind $tone={kind.tag} title={kind.label}>
          <KindIcon />
        </Kind>
        <Who to={`/bookings/${bookingId}`}>
          <strong>Cabin {booking?.cabins?.name}</strong>
          <span>{booking?.guests?.fullName?.toLowerCase()}</span>
        </Who>
        <Status $tone={statusTone}>{requestStatusLabel(type, status)}</Status>
      </Head>

      <Body>
        {priority === "urgent" && !isDone && <Urgent>Urgent</Urgent>}

        {items.length > 0 ? (
          <Dishes>
            {items.map((item) => (
              <Dish key={item.id}>
                <figure
                  style={
                    item.services?.image
                      ? { backgroundImage: `url(${item.services.image})` }
                      : undefined
                  }
                >
                  {!item.services?.image && <CutleryIcon />}
                  <b>×{item.quantity}</b>
                </figure>
                <span>{item.name}</span>
              </Dish>
            ))}
          </Dishes>
        ) : (
          <Title>{title}</Title>
        )}

        {note && <Note>&ldquo;{note}&rdquo;</Note>}
      </Body>

      <Foot>
        <Meta>
          {(requestedFor || requestedDate) && (
            <span className="when">
              <HiOutlineClock />{" "}
              {[
                requestedDate && format(toDay(requestedDate), "EEE MMM d"),
                requestedFor?.slice(0, 5),
              ]
                .filter(Boolean)
                .join(", ")}
            </span>
          )}
          {total > 0 && <strong>{formatCurrency(total)}</strong>}
          <span>
            {isDone
              ? `${requestStatusLabel(type, status)} ${ago(completedAt ?? created_at)}`
              : ago(created_at)}
          </span>
        </Meta>

        {next && (
          <Move
            $first={status === "new"}
            disabled={isMoving}
            onClick={() => moveRequest({ id, status: next.to })}
          >
            {status === "new" ? <HiArrowRight /> : <HiCheck />}
            {next.label}
          </Move>
        )}
      </Foot>
    </Card>
  );
}

export default RequestRow;
