import styled from "styled-components";

const StyledBoxHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.6rem;
`;

const Title = styled.h2`
  font-family: var(--font-display);
  font-size: 2.4rem;
  font-weight: 600;
  line-height: 1.2;
  color: var(--color-grey-800);
`;

const Subtitle = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-500);
`;

// The title, the line under it, and whatever control sits on the right
function BoxHeader({ title, subtitle, children }) {
  return (
    <StyledBoxHeader>
      <div>
        <Title>{title}</Title>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
      </div>

      {children}
    </StyledBoxHeader>
  );
}

export default BoxHeader;
