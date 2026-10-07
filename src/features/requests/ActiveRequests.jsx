import styled from "styled-components";
import { Link } from "react-router-dom";

import DashboardBox from "../dashboard/DashboardBox";
import BoxHeader from "../dashboard/BoxHeader";
import RequestRow from "./RequestRow";
import Button from "../../ui/Button";
import { useRequests } from "./useRequests";

const StyledActiveRequests = styled(DashboardBox)`
  grid-column: 1 / -1;
  scroll-margin-top: 2.4rem;
`;

const List = styled.ul`
  & > li:first-child {
    border-top: none;
  }
`;

const Empty = styled.p`
  padding: 1.2rem 0;
  text-align: center;
  color: var(--color-grey-500);
`;

const SHOWN = 5;

// What guests are waiting for right now, urgent repairs first. The full
// queue is one click away.
function ActiveRequests() {
  const { isLoading, requests = [] } = useRequests({ scope: "active" });

  const urgent = requests.filter((r) => r.priority === "urgent").length;

  let subtitle = "Nothing waiting";
  if (requests.length)
    subtitle = `${requests.length} waiting${urgent ? ` · ${urgent} urgent` : ""}`;

  return (
    <StyledActiveRequests id="requests">
      <BoxHeader title="Active requests" subtitle={isLoading ? "…" : subtitle}>
        <Button as={Link} to="/requests" size="small" variation="secondary">
          Open the queue
        </Button>
      </BoxHeader>

      {!isLoading &&
        (requests.length ? (
          <List>
            {requests.slice(0, SHOWN).map((request) => (
              <RequestRow request={request} key={request.id} />
            ))}
          </List>
        ) : (
          <Empty>
            When a guest asks for something from My Stay, it shows up here.
          </Empty>
        ))}
    </StyledActiveRequests>
  );
}

export default ActiveRequests;
