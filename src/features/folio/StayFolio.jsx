import { useEffect, useState } from "react";
import styled from "styled-components";
import { format } from "date-fns";
import { HiOutlineBanknotes, HiOutlinePlusCircle } from "react-icons/hi2";

import SpinnerMini from "../../ui/SpinnerMini";
import AddChargeForm from "./AddChargeForm";
import RecordPaymentForm from "./RecordPaymentForm";
import { useFolio } from "./useFolio";
import { formatCurrency } from "../../utils/helpers";
import {
  PAYMENT_STATES,
  folioEntries,
  paidShare,
  paymentState,
} from "../../utils/folio";

// ---------------------------------------------------------------------------
// The folio is drawn as the two things a front desk actually holds: the
// guest's receipt (a paper slip, torn off at the bottom, with a stamp once
// it is settled) and the till (what is still owed, how much of it is in,
// and the two things the desk can do about it).
// ---------------------------------------------------------------------------

const StyledFolio = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(30rem, 1fr);
  gap: 2.4rem;
  align-items: start;
  scroll-margin-top: 2.4rem;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

// --- The receipt -----------------------------------------------------------

// The drop shadow follows the torn edge, which a box shadow would not
// It stays in view while the till grows with a form beside it
const Slip = styled.div`
  position: sticky;
  top: 2.4rem;
  filter: drop-shadow(0 0.6rem 1.4rem rgba(23, 43, 34, 0.1));
  padding-bottom: 1.2rem;

  @media (max-width: 960px) {
    position: static;
  }
`;

const Paper = styled.div`
  position: relative;
  padding: 2.8rem 3.2rem 2.4rem;
  background-color: var(--color-grey-0);
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;

  /* The torn-off bottom: a row of small teeth in the paper's own colour */
  &::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1.1rem;
    height: 1.1rem;
    background:
      linear-gradient(135deg, var(--color-grey-0) 0.55rem, transparent 0) 0 0 /
        1.1rem 1.1rem repeat-x,
      linear-gradient(-135deg, var(--color-grey-0) 0.55rem, transparent 0) 0 0 /
        1.1rem 1.1rem repeat-x;
  }

  @media (max-width: 600px) {
    padding: 2.4rem 2rem 2rem;
  }
`;

const Eyebrow = styled.p`
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-brand-600);
`;

const SlipTitle = styled.h2`
  margin-top: 0.4rem;
  font-family: var(--font-display);
  font-size: 2.6rem;
  font-weight: 600;
  color: var(--color-grey-800);
`;

const Perforation = styled.hr`
  margin: 2rem 0 1.2rem;
  border: none;
  border-top: 2px dashed var(--color-grey-200);
`;

const Ledger = styled.ol`
  list-style: none;
  display: flex;
  flex-direction: column;
`;

const Entry = styled.li`
  display: grid;
  grid-template-columns: 5.6rem minmax(0, 1fr) auto;
  align-items: baseline;
  gap: 1.2rem;
  padding: 0.9rem 0;
  animation: entry-in 0.35s ease-out both;

  @keyframes entry-in {
    from {
      opacity: 0;
      transform: translateX(-0.8rem);
    }
  }
`;

const When = styled.time`
  font-size: 1.2rem;
  font-variant-numeric: tabular-nums;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-grey-400);
`;

// The label, then a dotted leader running to the amount, like a till roll
const What = styled.span`
  display: flex;
  align-items: baseline;
  gap: 0.8rem;
  min-width: 0;
  color: var(--color-grey-700);

  & > span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &::after {
    content: "";
    flex: 1;
    min-width: 1.6rem;
    border-bottom: 2px dotted var(--color-grey-300);
    transform: translateY(-0.3rem);
  }

  &[data-kind="payment"] {
    color: var(--color-green-700);
  }
`;

const Mark = styled.i`
  flex-shrink: 0;
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 50%;
  transform: translateY(-0.1rem);
  background-color: ${(props) =>
    ({
      stay: "var(--color-brand-500)",
      charge: "var(--color-yellow-700)",
      payment: "var(--color-green-700)",
    })[props.$kind]};
`;

const Money = styled.span`
  font-family: var(--font-numbers);
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  color: var(--color-grey-800);

  &[data-kind="payment"] {
    color: var(--color-green-700);
  }
`;

const Sums = styled.dl`
  position: relative;
  margin-top: 1.6rem;
  padding-top: 1.4rem;
  border-top: 1px solid var(--color-grey-200);
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.6rem 0;
  font-size: 1.45rem;

  & dt {
    padding-right: 2.4rem;
    color: var(--color-grey-500);
  }

  & dd {
    text-align: right;
    font-family: var(--font-numbers);
    font-variant-numeric: tabular-nums;
    color: var(--color-grey-700);
  }

  /* Total gets the accountant's double rule */
  & .total {
    padding-top: 0.8rem;
    margin-top: 0.4rem;
    border-top: 3px double var(--color-grey-300);
    font-weight: 600;
    font-size: 1.7rem;
    color: var(--color-grey-900);
  }

  & .paid {
    color: var(--color-green-700);
  }
`;

// A rubber stamp, a little crooked, once the folio is settled or overpaid
const Stamp = styled.span`
  position: absolute;
  left: 42%;
  bottom: 0.6rem;
  padding: 0.4rem 1.4rem;
  border: 3px solid currentColor;
  border-radius: var(--border-radius-sm);
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: ${(props) =>
    props.$tone === "red" ? "var(--color-red-700)" : "var(--color-green-700)"};
  opacity: 0.8;
  transform: rotate(-11deg);
  pointer-events: none;
  animation: stamp-down 0.4s cubic-bezier(0.2, 1.6, 0.4, 1) both;

  @keyframes stamp-down {
    from {
      opacity: 0;
      transform: rotate(-11deg) scale(1.6);
    }
  }
`;

// --- The till --------------------------------------------------------------

const Till = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2.8rem;
  border-radius: var(--border-radius-xl);
  color: #fff;
  background:
    radial-gradient(
      120% 80% at 100% 0%,
      rgba(178, 214, 198, 0.18),
      transparent 60%
    ),
    linear-gradient(160deg, var(--color-brand-800), var(--color-brand-900));
  box-shadow: var(--shadow-lg);
`;

const Dial = styled.div`
  position: relative;
  width: 20rem;
  aspect-ratio: 1;
  margin: 0 auto;
  display: grid;
  place-items: center;
  text-align: center;
`;

// The paid share of the total, as a ring that fills up. --share is
// registered in GlobalStyles so the ring can animate to its new value.
const Ring = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(
    ${(props) => (props.$tone === "red" ? "#f3b3a0" : "var(--color-brand-200)")}
      calc(var(--share) * 1turn),
    rgba(255, 255, 255, 0.1) 0
  );
  -webkit-mask: radial-gradient(
    farthest-side,
    transparent calc(100% - 1.2rem),
    #000 calc(100% - 1.1rem)
  );
  mask: radial-gradient(
    farthest-side,
    transparent calc(100% - 1.2rem),
    #000 calc(100% - 1.1rem)
  );
  transition: --share 1s cubic-bezier(0.2, 0.8, 0.2, 1);
`;

const DialLabel = styled.p`
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
`;

const DialAmount = styled.p`
  font-family: var(--font-display);
  font-size: 3.4rem;
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
`;

const DialNote = styled.p`
  max-width: 14rem;
  margin: 0.2rem auto 0;
  font-size: 1.15rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.65);
`;

const State = styled.span`
  align-self: center;
  padding: 0.4rem 1.2rem;
  border-radius: 100px;
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background-color: rgba(255, 255, 255, 0.12);
  color: ${(props) =>
    ({
      green: "#bfe6cf",
      blue: "#c6dcf5",
      yellow: "#f6d58e",
      red: "#f3b3a0",
    })[props.$tone]};
`;

const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const Action = styled.button.attrs({ type: "button" })`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.4rem;
  height: auto;
  padding: 1.4rem 1.6rem;
  line-height: 1.35;
  text-align: left;
  font-size: 1.45rem;
  font-weight: 600;
  color: #fff;
  border-radius: var(--border-radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.16);
  background-color: rgba(255, 255, 255, 0.06);
  transition:
    background-color 0.2s,
    border-color 0.2s,
    transform 0.15s;

  & svg {
    width: 2.4rem;
    height: 2.4rem;
    margin-bottom: 0.4rem;
    color: var(--color-brand-200);
  }

  & strong {
    display: block;
    font-weight: 600;
  }

  & small {
    display: block;
    font-size: 1.2rem;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.6);
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.12);
  }

  &:active {
    transform: scale(0.98);
  }

  &[aria-expanded="true"] {
    background-color: rgba(255, 255, 255, 0.16);
    border-color: var(--color-brand-200);
  }
`;

const Closed = styled.p`
  font-size: 1.35rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.65);
`;

const Loading = styled.div`
  display: grid;
  place-items: center;
  min-height: 24rem;
  border-radius: var(--border-radius-xl);
  background-color: var(--color-grey-0);
`;

// The ring starts empty and fills to where the money stands, and moves
// again whenever a payment is recorded
function useAnimatedShare(share) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(share));
    return () => cancelAnimationFrame(frame);
  }, [share]);

  return shown;
}

function StayFolio({ booking }) {
  const { id: bookingId, reference, status } = booking;
  const { totals, charges, payments, isLoading } = useFolio(bookingId);
  const [panel, setPanel] = useState(null);

  const share = useAnimatedShare(totals ? paidShare(totals) : 0);
  const isReady = Boolean(totals);

  // "Take payment" in the bookings list links straight to the folio
  useEffect(() => {
    if (isReady && window.location.hash === "#folio")
      document
        .getElementById("folio")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [isReady]);

  if (isLoading || !totals)
    return (
      <Loading>
        <SpinnerMini />
      </Loading>
    );

  const { accommodation, extras, total, paid, remaining } = totals;
  const state = paymentState(totals);
  const { label, tone } = PAYMENT_STATES[state];
  const entries = folioEntries({ booking, charges, payments });

  // A cancelled booking or a no-show has nothing more to charge or take
  const isOpen = status !== "cancelled" && status !== "no_show";

  const toggle = (name) => setPanel((open) => (open === name ? null : name));
  const close = () => setPanel(null);

  return (
    <StyledFolio id="folio" aria-label="Stay folio">
      <Slip>
        <Paper>
          <Eyebrow>Stay folio</Eyebrow>
          <SlipTitle>{reference}</SlipTitle>

          <Perforation />

          <Ledger>
            {entries.map((entry, index) => (
              <Entry
                key={entry.key}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <When dateTime={entry.at}>
                  {format(new Date(entry.at), "MMM d")}
                </When>
                <What data-kind={entry.kind}>
                  <Mark $kind={entry.kind} aria-hidden />
                  <span>{entry.label}</span>
                </What>
                <Money data-kind={entry.kind}>
                  {entry.amount < 0
                    ? `− ${formatCurrency(-entry.amount)}`
                    : formatCurrency(entry.amount)}
                </Money>
              </Entry>
            ))}
          </Ledger>

          <Sums>
            <dt>Accommodation</dt>
            <dd>{formatCurrency(accommodation)}</dd>
            <dt>Extra charges</dt>
            <dd>{formatCurrency(extras)}</dd>
            <dt className="total">Total</dt>
            <dd className="total">{formatCurrency(total)}</dd>
            <dt>Paid</dt>
            <dd className="paid">{formatCurrency(paid)}</dd>
            <dt>Remaining</dt>
            <dd>{formatCurrency(remaining)}</dd>

            {(state === "paid" || state === "credit") && (
              <Stamp $tone={tone}>
                {state === "paid" ? "Settled" : "Overpaid"}
              </Stamp>
            )}
          </Sums>
        </Paper>
      </Slip>

      <Till>
        <Dial>
          <Ring style={{ "--share": share }} $tone={tone} />
          <div>
            <DialLabel>
              {remaining < 0 ? "Owed to guest" : "Still to pay"}
            </DialLabel>
            <DialAmount>{formatCurrency(Math.abs(remaining))}</DialAmount>
            <DialNote>
              {formatCurrency(paid)} paid
              <br />
              of {formatCurrency(total)}
            </DialNote>
          </div>
        </Dial>

        <State $tone={tone}>{label}</State>

        {isOpen ? (
          <>
            <Actions>
              <Action
                aria-expanded={panel === "charge"}
                onClick={() => toggle("charge")}
              >
                <HiOutlinePlusCircle />
                <strong>Add charge</strong>
                <small>A service or anything else</small>
              </Action>
              <Action
                aria-expanded={panel === "payment"}
                onClick={() => toggle("payment")}
              >
                <HiOutlineBanknotes />
                <strong>Take cash</strong>
                <small>Record a payment</small>
              </Action>
            </Actions>

            {panel === "charge" && (
              <AddChargeForm bookingId={bookingId} onDone={close} />
            )}
            {panel === "payment" && (
              <RecordPaymentForm
                bookingId={bookingId}
                remaining={remaining}
                onDone={close}
              />
            )}
          </>
        ) : (
          <Closed>
            This booking is closed, so nothing more can be charged or taken.
          </Closed>
        )}
      </Till>
    </StyledFolio>
  );
}

export default StayFolio;
