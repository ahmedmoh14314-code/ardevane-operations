import styled from "styled-components";
import {
  HiOutlineBanknotes,
  HiOutlineCalendarDays,
  HiOutlineMoon,
} from "react-icons/hi2";

import { formatCurrency } from "../../utils/helpers";

const Grid = styled.dl`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  gap: 1.6rem;
`;

const Card = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.6rem 2rem;

  display: flex;
  align-items: center;
  gap: 1.6rem;

  & svg {
    width: 2.8rem;
    height: 2.8rem;
    color: var(--color-brand-600);
    flex-shrink: 0;
  }

  & dt {
    font-size: 1.2rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    color: var(--color-grey-500);
  }

  & dd {
    font-size: 2rem;
    font-weight: 500;
    font-family: var(--font-numbers);
    font-variant-numeric: tabular-nums;
    color: var(--color-grey-700);
  }
`;

function GuestStats({ stats }) {
  return (
    <Grid>
      <Card>
        <HiOutlineCalendarDays />
        <div>
          <dt>Stays</dt>
          <dd>{stats.stays}</dd>
        </div>
      </Card>

      <Card>
        <HiOutlineMoon />
        <div>
          <dt>Nights</dt>
          <dd>{stats.nights}</dd>
        </div>
      </Card>

      <Card>
        <HiOutlineBanknotes />
        <div>
          <dt>Total spend</dt>
          <dd>{formatCurrency(stats.spend)}</dd>
        </div>
      </Card>
    </Grid>
  );
}

export default GuestStats;
