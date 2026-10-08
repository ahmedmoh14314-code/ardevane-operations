import styled, { keyframes } from "styled-components";
import { Link } from "react-router-dom";
import { format, formatDistanceToNowStrict } from "date-fns";
import {
  HiArrowLongRight,
  HiCheck,
  HiOutlineChatBubbleLeftEllipsis,
  HiXMark,
} from "react-icons/hi2";

import InitialsAvatar from "../../ui/InitialsAvatar";
import {
  useAnswerBookingRequest,
  useBookingRequests,
} from "./useBookingRequests";
import { formatCurrency, toDay } from "../../utils/helpers";

const Section = styled.section`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
`;

const Head = styled.div`
  display: flex;
  align-items: baseline;
  gap: 1.2rem;

  & h2 {
    font-family: var(--font-display);
    font-size: 2.2rem;
    font-weight: 600;
    color: var(--color-grey-800);
  }

  & p {
    font-size: 1.4rem;
    color: var(--color-grey-500);
  }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(45, 134, 99, 0.45); }
  70% { box-shadow: 0 0 0 0.9rem rgba(45, 134, 99, 0); }
  100% { box-shadow: 0 0 0 0 rgba(45, 134, 99, 0); }
`;

// Something is waiting: a quiet, breathing dot instead of an alarm
const Dot = styled.span`
  align-self: center;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background-color: var(--color-brand-500);
  animation: ${pulse} 2s infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Row = styled.ul`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(28rem, 32rem);
  gap: 1.6rem;
  overflow-x: auto;
  padding-bottom: 0.6rem;
  scroll-snap-type: x mandatory;

  & > li {
    scroll-snap-align: start;
  }
`;

const Card = styled.li`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  transition:
    box-shadow 0.25s,
    transform 0.25s;

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
`;

const Photo = styled.div`
  position: relative;
  height: 9rem;
  background: var(--color-grey-100) center / cover no-repeat;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.55), transparent 70%);
  }

  & span {
    position: absolute;
    left: 1.4rem;
    bottom: 1rem;
    z-index: 1;
    font-family: var(--font-display);
    font-size: 1.8rem;
    font-weight: 600;
    color: #fff;
  }

  & small {
    position: absolute;
    right: 1.2rem;
    top: 1rem;
    z-index: 1;
    padding: 0.3rem 1rem;
    border-radius: 100px;
    font-size: 1.15rem;
    font-weight: 600;
    color: #fff;
    background-color: rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(4px);
  }
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  padding: 1.4rem 1.6rem 1.6rem;
`;

const Guest = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;

  & strong {
    display: block;
    font-weight: 500;
    color: var(--color-grey-800);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & span {
    font-size: 1.25rem;
    color: var(--color-grey-500);
  }

  &:hover strong {
    color: var(--color-brand-600);
  }
`;

// The stay as two big dates, the way a desk calendar reads
const Dates = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.2rem;
  border-radius: var(--border-radius-md);
  background-color: var(--color-grey-50);

  & div {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
  }

  & b {
    font-family: var(--font-display);
    font-size: 2.4rem;
    font-weight: 600;
    color: var(--color-grey-800);
  }

  & em {
    font-style: normal;
    font-size: 1.15rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-grey-500);
  }

  & > svg {
    width: 2.4rem;
    height: 2.4rem;
    color: var(--color-grey-400);
  }
`;

const Meta = styled.p`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-size: 1.35rem;
  color: var(--color-grey-600);

  & strong {
    font-family: var(--font-numbers);
    font-size: 1.7rem;
    font-weight: 600;
    color: var(--color-grey-800);
  }

  & svg {
    width: 1.6rem;
    height: 1.6rem;
    vertical-align: -0.3rem;
  }
`;

const Actions = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.8rem;
`;

const Decline = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4.2rem;
  height: 4.2rem;
  border-radius: 50%;
  border: 1px solid var(--color-grey-200);
  background: none;
  color: var(--color-grey-600);
  transition:
    background-color 0.2s,
    color 0.2s,
    border-color 0.2s;

  & svg {
    width: 2rem;
    height: 2rem;
  }

  &:hover:not(:disabled) {
    color: var(--color-red-700);
    border-color: var(--color-red-100);
    background-color: var(--color-red-100);
  }
`;

const Approve = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  height: 4.2rem;
  border: none;
  border-radius: 100px;
  font-size: 1.45rem;
  font-weight: 600;
  color: #fff;
  background-color: var(--color-brand-600);
  transition: background-color 0.2s;

  & svg {
    width: 1.8rem;
    height: 1.8rem;
  }

  &:hover:not(:disabled) {
    background-color: var(--color-brand-700);
  }
`;

// Bookings made on the website wait here until the hotel says yes or no.
// Shown only while there is something to answer.
function BookingRequests() {
  const { isLoading, requests = [] } = useBookingRequests();
  const { approve, decline, isAnswering } = useAnswerBookingRequest();

  if (isLoading || !requests.length) return null;

  return (
    <Section aria-label="Booking requests">
      <Head>
        <Dot />
        <h2>
          {requests.length === 1
            ? "A booking is waiting for you"
            : `${requests.length} bookings are waiting for you`}
        </h2>
        <p>Their nights are held until you answer.</p>
      </Head>

      <Row>
        {requests.map(
          ({
            id,
            reference,
            created_at,
            startDate,
            endDate,
            numNights,
            numGuests,
            totalPrice,
            observations,
            cabins,
            guests,
          }) => (
            <Card key={id}>
              <Photo style={{ backgroundImage: `url(${cabins.image})` }}>
                <span>Cabin {cabins.name}</span>
                <small>
                  {formatDistanceToNowStrict(new Date(created_at), {
                    addSuffix: true,
                  })}
                </small>
              </Photo>

              <Body>
                <Guest to={`/bookings/${id}`}>
                  <InitialsAvatar name={guests.fullName} />
                  <div>
                    <strong>{guests.fullName}</strong>
                    <span>{reference}</span>
                  </div>
                </Guest>

                <Dates>
                  <div>
                    <em>{format(toDay(startDate), "EEE")}</em>
                    <b>{format(toDay(startDate), "MMM d")}</b>
                  </div>
                  <HiArrowLongRight />
                  <div style={{ alignItems: "flex-end" }}>
                    <em>{format(toDay(endDate), "EEE")}</em>
                    <b>{format(toDay(endDate), "MMM d")}</b>
                  </div>
                </Dates>

                <Meta>
                  <span>
                    {numNights} nights &middot; {numGuests}{" "}
                    {numGuests === 1 ? "guest" : "guests"}
                    {observations && (
                      <>
                        {" "}
                        &middot;{" "}
                        <HiOutlineChatBubbleLeftEllipsis title={observations} />
                      </>
                    )}
                  </span>
                  <strong>{formatCurrency(totalPrice)}</strong>
                </Meta>

                <Actions>
                  <Decline
                    onClick={() => decline(id)}
                    disabled={isAnswering}
                    aria-label={`Decline ${reference}`}
                    title="Decline"
                  >
                    <HiXMark />
                  </Decline>
                  <Approve onClick={() => approve(id)} disabled={isAnswering}>
                    <HiCheck />
                    Approve booking
                  </Approve>
                </Actions>
              </Body>
            </Card>
          ),
        )}
      </Row>
    </Section>
  );
}

export default BookingRequests;
