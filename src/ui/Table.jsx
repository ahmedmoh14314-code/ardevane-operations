import { createContext, useContext } from "react";
import styled from "styled-components";
import { below } from "../styles/breakpoints";
import { stagger } from "../styles/animations";

const StyledTable = styled.div`
  border: 1px solid var(--color-grey-100);

  font-size: 1.4rem;
  background-color: var(--color-grey-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;

  /* On a phone the table turns into a list of cards, so the frame goes away */
  ${below.tablet} {
    border: none;
    background-color: transparent;
    border-radius: 0;
    overflow: visible;
  }
`;

const CommonRow = styled.div`
  display: grid;
  grid-template-columns: ${(props) => props.$columns};
  column-gap: 2.4rem;
  align-items: center;
  transition: none;
`;

const StyledHeader = styled(CommonRow)`
  padding: 1.4rem 2.4rem;

  background-color: var(--color-grey-0);
  border-bottom: 1px solid var(--color-grey-100);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-grey-500);

  /* Column headings mean nothing once the rows stack */
  ${below.tablet} {
    display: none;
  }
`;

const StyledBody = styled.section`
  margin: 0.4rem 0;
  ${stagger(10, 30)}

  ${below.tablet} {
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }
`;

const StyledRow = styled(CommonRow)`
  padding: 1.4rem 2.4rem;
  transition: background-color 0.15s;

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-grey-100);
  }

  &:hover {
    background-color: var(--color-grey-50);
  }

  ${below.tablet} {
    grid-template-columns: 1fr;
    row-gap: 0.8rem;
    justify-items: start;
    padding: 1.6rem;

    background-color: var(--color-grey-0);
    border: 1px solid var(--color-grey-100);
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-sm);

    &:not(:last-child) {
      border-bottom: 1px solid var(--color-grey-100);
    }
  }
`;

const Footer = styled.footer`
  background-color: var(--color-grey-0);
  border-top: 1px solid var(--color-grey-100);
  display: flex;
  justify-content: center;
  padding: 1.2rem;

  // :has() hides the footer when it holds nothing
  &:not(:has(*)) {
    display: none;
  }

  ${below.tablet} {
    background-color: transparent;
    padding: 1.6rem 0 0;
  }
`;

const Empty = styled.p`
  font-size: 1.6rem;
  font-weight: 500;
  text-align: center;
  margin: 2.4rem;
`;

// Column widths are set once and read by header and rows
const TableContext = createContext();

function Table({ columns, children, label }) {
  return (
    <TableContext.Provider value={{ columns }}>
      <StyledTable role="table" aria-label={label}>
        {children}
      </StyledTable>
    </TableContext.Provider>
  );
}

function Header({ children }) {
  const { columns } = useContext(TableContext);

  return (
    <StyledHeader role="row" $columns={columns} as="header">
      {children}
    </StyledHeader>
  );
}

function Row({ children }) {
  const { columns } = useContext(TableContext);

  return (
    <StyledRow role="row" $columns={columns}>
      {children}
    </StyledRow>
  );
}

function Body({ data, render }) {
  if (!data?.length) return <Empty>No data to show at the moment</Empty>;

  return <StyledBody>{data.map(render)}</StyledBody>;
}

Table.Header = Header;
Table.Body = Body;
Table.Row = Row;
Table.Footer = Footer;

export default Table;
