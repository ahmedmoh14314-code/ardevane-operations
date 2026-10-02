import styled from "styled-components";
import { Link } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi2";

import PhotoPage from "../ui/PhotoPage";
import Button from "../ui/Button";
import { useMoveBack } from "../hooks/useMoveBack";

const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;

  & > * {
    width: 100%;
  }
`;

function PageNotFound() {
  const moveBack = useMoveBack();

  return (
    <PhotoPage
      eyebrow="Page not found"
      title="This trail doesn't lead anywhere"
      subtitle="The page you're looking for has moved, or it never existed."
    >
      <Actions>
        <Button variation="secondary" size="large" onClick={moveBack}>
          <HiArrowLeft />
          <span>Go back</span>
        </Button>

        <Button size="large" as={Link} to="/dashboard">
          Dashboard
        </Button>
      </Actions>
    </PhotoPage>
  );
}

export default PageNotFound;
