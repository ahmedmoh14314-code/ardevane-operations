import styled from "styled-components";
import { useSearchParams } from "react-router-dom";

import RequestRow from "./RequestRow";
import { useRequests } from "./useRequests";
import Spinner from "../../ui/Spinner";

const List = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(34rem, 1fr));
  gap: 1.6rem;
`;

const Empty = styled.p`
  padding: 4rem 0;
  border-radius: var(--border-radius-lg);
  background-color: var(--color-grey-0);
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
    <>
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
    </>
  );
}

export default RequestQueue;
