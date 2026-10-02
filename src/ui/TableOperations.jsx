import styled from "styled-components";
import { below } from "../styles/breakpoints";

// Search, filters and sort on one line until the screen runs out of room.
// The search takes the spare width and the sort sits at the far end.
const TableOperations = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  flex-wrap: wrap;

  & > :last-child {
    margin-left: auto;
  }

  ${below.tablet} {
    width: 100%;

    & > * {
      flex: 1 1 100%;
      min-width: 0;
    }
  }
`;

export default TableOperations;
