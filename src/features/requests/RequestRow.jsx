import styled from "styled-components";
import { Link } from "react-router-dom";
import { formatDistanceToNowStrict } from "date-fns";
import { HiOutlineClock } from "react-icons/hi2";

import Tag from "../../ui/Tag";
import Button from "../../ui/Button";
import { useMoveRequest } from "./useRequests";
import { formatCurrency } from "../../utils/helpers";
import {
  nextRequestStep,
  requestStatusLabel,
  requestTotal,
  requestType,
} from "../../utils/requests";

const Row = styled.li`
  display: grid;
  grid-template-columns: 13rem minmax(0, 1fr) minmax(0, 1.6fr) 12rem 15rem;
  gap: 1.6rem;
  align-items: center;
  padding: 1.2rem 0;
  border-top: 1px solid var(--color-grey-100);

  /* Urgent requests get a red edge, drawn outside the columns so the rows
     still line up */
  position: relative;

  &[data-urgent="true"]::before {
    content: "";
    position: absolute;
    left: -1.2rem;
    top: 0.8rem;
    bottom: 0.8rem;
    width: 3px;
    border-radius: 3px;
    background-color: var(--color-red-700);
  }

  & .action {
    display: flex;
    justify-content: flex-end;
    white-space: nowrap;
  }

  @media (max-width: 1100px) {
    grid-template-columns: 13rem minmax(0, 1fr) 15rem;

    & .what {
      grid-column: 2 / -1;
      grid-row: 2;
    }
    & .status {
      display: none;
    }
  }
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;

  & strong {
    font-weight: 500;
    color: var(--color-grey-800);
  }

  & span,
  & small {
    font-size: 1.25rem;
    color: var(--color-grey-500);
  }
`;

const Who = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;

  & strong {
    font-family: var(--font-display);
    font-size: 1.6rem;
    font-weight: 600;
    color: var(--color-grey-800);
  }

  & span {
    font-size: 1.3rem;
    color: var(--color-grey-500);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover strong {
    color: var(--color-brand-600);
  }
`;

const When = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  color: var(--color-yellow-700) !important;

  & svg {
    width: 1.4rem;
    height: 1.4rem;
  }
`;

const Done = styled.span`
  font-size: 1.25rem;
  color: var(--color-grey-500);
`;

// One request: where and who, what they asked for, and the one button that
// moves it on
function RequestRow({ request }) {
  const { moveRequest, isMoving } = useMoveRequest();

  const {
    id,
    created_at,
    type,
    status,
    title,
    note,
    priority,
    requestedFor,
    bookingId,
    completedAt,
    request_items: items = [],
    bookings: booking,
  } = request;

  const kind = requestType(type);
  const next = nextRequestStep(type, status);
  const total = requestTotal(items);

  return (
    <Row data-urgent={priority === "urgent" && status !== "completed"}>
      <Tag type={kind.tag}>{kind.label}</Tag>

      <Who to={`/bookings/${bookingId}`}>
        <strong>Cabin {booking?.cabins?.name}</strong>
        <span>{booking?.guests?.fullName}</span>
      </Who>

      <Stack className="what">
        <strong>{title}</strong>
        {note && <span>&ldquo;{note}&rdquo;</span>}
        <small>
          {requestedFor && (
            <When>
              <HiOutlineClock />
              For {requestedFor.slice(0, 5)}
              {" · "}
            </When>
          )}
          {total > 0 &&
            `${formatCurrency(total)} · ${
              status === "completed"
                ? "on the folio"
                : "added to the folio when delivered"
            } · `}
          {formatDistanceToNowStrict(new Date(created_at), { addSuffix: true })}
        </small>
      </Stack>

      <Stack className="status">
        {priority === "urgent" && status !== "completed" && (
          <Tag type="red">Urgent</Tag>
        )}
        <Tag
          type={
            status === "completed"
              ? "green"
              : status === "new"
                ? "silver"
                : "blue"
          }
        >
          {requestStatusLabel(type, status)}
        </Tag>
      </Stack>

      <div className="action">
        {next ? (
          <Button
            size="small"
            variation={status === "new" ? "secondary" : "primary"}
            disabled={isMoving}
            onClick={() => moveRequest({ id, status: next.to })}
          >
            {next.label}
          </Button>
        ) : (
          <Done>
            {requestStatusLabel(type, status)}{" "}
            {formatDistanceToNowStrict(new Date(completedAt ?? created_at), {
              addSuffix: true,
            })}
          </Done>
        )}
      </div>
    </Row>
  );
}

export default RequestRow;
