import { Link } from "react-router-dom";
import styled from "styled-components";

const StyledBreadcrumb = styled.nav`
  display: flex;
  align-items: center;
  gap: 0.8rem;

  font-size: 1.4rem;
  color: var(--color-grey-500);
`;

const Parent = styled(Link)`
  &:hover,
  &:focus-visible {
    color: var(--color-brand-600);
  }
`;

const Current = styled.span`
  font-weight: 500;
  color: var(--color-grey-700);
`;

// Detail pages have no header image on purpose: the employee arrives here in
// the middle of a job and wants the data, not the branding. This is the one
// thing they do need, a way back to the list they came from.
function Breadcrumb({ to, parent, children }) {
  return (
    <StyledBreadcrumb aria-label="Breadcrumb">
      <Parent to={to}>{parent}</Parent>

      <span aria-hidden="true">/</span>

      <Current>{children}</Current>
    </StyledBreadcrumb>
  );
}

export default Breadcrumb;
