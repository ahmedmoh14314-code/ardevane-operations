import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { HiEye } from "react-icons/hi2";

import Table from "../../ui/Table";
import Menus from "../../ui/Menus";
import Tag from "../../ui/Tag";
import { Flag } from "../../ui/Flag";
import { formatCurrency } from "../../utils/helpers";
import { below } from "../../styles/breakpoints";

const Guest = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;

  & span:first-child {
    font-weight: 600;
    color: var(--color-grey-600);
    font-family: var(--font-numbers);
    font-variant-numeric: tabular-nums;
  }

  & span:last-child {
    color: var(--color-grey-500);
    font-size: 1.2rem;
  }
`;

const Country = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.4rem;
  color: var(--color-grey-600);
`;

const Stacked = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;

  & span:first-child {
    font-weight: 500;
  }

  & span:last-child {
    color: var(--color-grey-500);
    font-size: 1.2rem;
  }
`;

const Amount = styled.div`
  font-family: var(--font-numbers);
  font-variant-numeric: tabular-nums;
  font-weight: 500;
`;

// Hidden on narrow screens, where the card layout takes over
const Secondary = styled.div`
  ${below.tablet} {
    display: none;
  }
`;

function stayLabel(stats) {
  if (stats.currentStay) return { type: "green", text: "Staying now" };
  if (stats.upcomingStay) return { type: "blue", text: "Arriving soon" };
  if (stats.lastStay) return { type: "silver", text: "Past guest" };
  return { type: "silver", text: "No stays" };
}

function GuestRow({ guest }) {
  const navigate = useNavigate();
  const { id, fullName, email, nationality, countryFlag, stats } = guest;
  const label = stayLabel(stats);

  return (
    <Table.Row>
      <Guest>
        <span>{fullName}</span>
        <span>{email}</span>
      </Guest>

      <Secondary>
        <Country>
          {countryFlag && (
            <Flag
              src={countryFlag}
              alt={nationality ? `Flag of ${nationality}` : ""}
            />
          )}
          <span>{nationality || "—"}</span>
        </Country>
      </Secondary>

      <Tag type={label.type}>{label.text}</Tag>

      <Secondary>
        <Stacked>
          <span>{stats.stays} stays</span>
          <span>{stats.nights} nights</span>
        </Stacked>
      </Secondary>

      <Amount>{formatCurrency(stats.spend)}</Amount>

      <Menus.Menu>
        <Menus.Toggle id={id} />
        <Menus.List id={id}>
          <Menus.Button
            icon={<HiEye />}
            onClick={() => navigate(`/guests/${id}`)}
          >
            See profile
          </Menus.Button>
        </Menus.List>
      </Menus.Menu>
    </Table.Row>
  );
}

export default GuestRow;
