import styled from "styled-components";
import { useSearchParams } from "react-router-dom";

import RequestRow from "./RequestRow";
import { useRequests } from "./useRequests";
import Spinner from "../../ui/Spinner";

const Box = styled.section`
  padding: 0.8rem 2.4rem 1.2rem;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
`;

const List = styled.ul`
  & > li:first-child {
    border-top: none;
  }
`;

const Empty = styled.p`
  padding: 4rem 0;
  text-align: center;
  color: var(--color-grey-500);
`;

// Every request the Requests page is filtered to: still to do by default
function RequestQueue() {
  const [searchParams] = useSearchParams();
  const scope = searchParams.get("scope") || "active";
  const type = searchParams.get("type");

  const { isLoading, requests } = useRequests({
    scope,
    type: type === "all" ? null : type,
  });

  if (isLoading) return <Spinner />;

  return (
    <Box>
      {requests.length ? (
        <List>
          {requests.map((request) => (
            <RequestRow request={request} key={request.id} />
          ))}
        </List>
      ) : (
        <Empty>
          {scope === "active"
            ? "Nothing to do. New requests from guests show up here."
            : "No requests here yet."}
        </Empty>
      )}
    </Box>
  );
}

export default RequestQueue;
