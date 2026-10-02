import styled, { keyframes } from "styled-components";

const shimmer = keyframes`
  from { background-position: -200% 0; }
  to   { background-position:  200% 0; }
`;

// A grey block that stands in for content while it loads
const Skeleton = styled.span`
  display: block;
  border-radius: ${(props) => (props.$circle ? "50%" : "var(--border-radius-sm)")};
  width: ${(props) => props.$width || "100%"};
  height: ${(props) => props.$height || "1.6rem"};

  background-image: linear-gradient(
    90deg,
    var(--color-grey-100) 25%,
    var(--color-grey-200) 37%,
    var(--color-grey-100) 63%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.4s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Box = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.6rem 2.4rem;

  display: flex;
  flex-direction: column;
  gap: 1.2rem;

  &:not(:last-child) {
    margin-bottom: 1.2rem;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  gap: 1.6rem;
`;

// A list of grey rows, used while a table loads
function TableSkeleton({ rows = 6 }) {
  const items = Array.from({ length: rows });

  return (
    <div role="status" aria-label="Loading results">
      {items.map((_, i) => (
        <Box key={i}>
          <Skeleton $width="35%" $height="1.6rem" />
          <Skeleton $width="60%" $height="1.2rem" />
        </Box>
      ))}
    </div>
  );
}

// Grey cards for the dashboard numbers
function StatsSkeleton({ count = 4 }) {
  const items = Array.from({ length: count });

  return (
    <Grid role="status" aria-label="Loading statistics">
      {items.map((_, i) => (
        <Box key={i}>
          <Skeleton $width="50%" $height="1.2rem" />
          <Skeleton $width="35%" $height="2.4rem" />
        </Box>
      ))}
    </Grid>
  );
}

// A grey panel, used while a detail page loads
function DetailSkeleton({ lines = 5 }) {
  const items = Array.from({ length: lines });

  return (
    <Box role="status" aria-label="Loading details">
      <Skeleton $width="40%" $height="2.8rem" />
      {items.map((_, i) => (
        <Skeleton key={i} $width={`${90 - i * 10}%`} />
      ))}
    </Box>
  );
}

export default Skeleton;
export { TableSkeleton, StatsSkeleton, DetailSkeleton };
