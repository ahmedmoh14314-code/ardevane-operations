import styled from "styled-components";
import { format } from "date-fns";
import {
  HiOutlineEnvelope,
  HiOutlineHomeModern,
  HiOutlineIdentification,
} from "react-icons/hi2";

import Heading from "../../ui/Heading";
import { Flag } from "../../ui/Flag";
import { below } from "../../styles/breakpoints";
import { toDay } from "../../utils/helpers";

const Card = styled.section`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 3.2rem 4rem;

  display: flex;
  flex-direction: column;
  gap: 1.6rem;

  ${below.tablet} {
    padding: 2rem 1.6rem;
  }
`;

const Line = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  flex-wrap: wrap;

  font-size: 1.6rem;
  color: var(--color-grey-600);

  & svg {
    width: 2rem;
    height: 2rem;
    color: var(--color-brand-600);
  }
`;

function formatStay(booking) {
  const from = format(toDay(booking.startDate), "MMM dd yyyy");
  const to = format(toDay(booking.endDate), "MMM dd yyyy");

  return `${from} — ${to}`;
}

function GuestProfile({ guest }) {
  const { email, nationality, countryFlag, nationalID, stats } = guest;
  const stay = stats.currentStay || stats.upcomingStay;

  return (
    <Card>
      <Heading as="h3">Profile</Heading>

      <Line>
        {countryFlag && (
          <Flag
            src={countryFlag}
            alt={nationality ? `Flag of ${nationality}` : ""}
          />
        )}
        <span>{nationality || "Nationality unknown"}</span>
      </Line>

      <Line>
        <HiOutlineEnvelope />
        <span>{email}</span>
      </Line>

      {nationalID && (
        <Line>
          <HiOutlineIdentification />
          <span>National ID {nationalID}</span>
        </Line>
      )}

      {stay && (
        <Line>
          <HiOutlineHomeModern />
          <span>
            {stats.currentStay ? "Currently in" : "Next stay in"} cabin{" "}
            {stay.cabins?.name || "—"} · {formatStay(stay)}
          </span>
        </Line>
      )}
    </Card>
  );
}

export default GuestProfile;
