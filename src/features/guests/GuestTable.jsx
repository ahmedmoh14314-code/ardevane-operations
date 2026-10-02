import { useSearchParams } from "react-router-dom";
import { HiOutlineUserGroup, HiOutlineMagnifyingGlass } from "react-icons/hi2";

import GuestRow from "./GuestRow";
import { useGuests } from "./useGuests";

import Table from "../../ui/Table";
import Menus from "../../ui/Menus";
import Pagination from "../../ui/Pagination";
import Button from "../../ui/Button";
import EmptyState from "../../ui/EmptyState";
import { TableSkeleton } from "../../ui/Skeleton";
import ErrorMessage from "../../ui/ErrorMessage";

const COLUMNS = "2.4fr 1.6fr 1.2fr 1.2fr 1fr 3.2rem";

function GuestTable() {
  const { guests, isLoading, error, count, search } = useGuests();
  const [searchParams, setSearchParams] = useSearchParams();

  if (isLoading) return <TableSkeleton rows={8} />;

  if (error) return <ErrorMessage>{error.message}</ErrorMessage>;

  // Nothing matched the search — offer the way out, not just a dead end
  if (!guests.length && search)
    return (
      <EmptyState
        icon={<HiOutlineMagnifyingGlass />}
        title={`No guest matches "${search}"`}
        description="Try a different name, email address or nationality."
        action={
          <Button
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              next.delete("search");
              next.delete("page");
              setSearchParams(next);
            }}
          >
            Clear search
          </Button>
        }
      />
    );

  if (!guests.length)
    return (
      <EmptyState
        icon={<HiOutlineUserGroup />}
        title="No guests yet"
        description="Guests appear here automatically as soon as their first booking is created."
      />
    );

  return (
    <Menus>
      <Table columns={COLUMNS} label="Guests">
        <Table.Header>
          <div>Guest</div>
          <div>Nationality</div>
          <div>Status</div>
          <div>Stays</div>
          <div>Total spend</div>
          <div></div>
        </Table.Header>

        <Table.Body
          data={guests}
          render={(guest) => <GuestRow key={guest.id} guest={guest} />}
        />

        <Table.Footer>
          <Pagination count={count} />
        </Table.Footer>
      </Table>
    </Menus>
  );
}

export default GuestTable;
