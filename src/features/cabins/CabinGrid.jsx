import styled from "styled-components";
import { useSearchParams } from "react-router-dom";
import { HiOutlineHomeModern } from "react-icons/hi2";

import CabinCard from "./CabinCard";
import { useCabins } from "./useCabins";
import AddCabin from "./AddCabin";
import { useTodayActivity } from "../check-in-out/useTodayActivity";

import Menus from "../../ui/Menus";
import Button from "../../ui/Button";
import Skeleton from "../../ui/Skeleton";
import EmptyState from "../../ui/EmptyState";
import ErrorMessage from "../../ui/ErrorMessage";
import { stagger } from "../../styles/animations";

// As many cards across as fit, each at least 28rem wide
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(28rem, 1fr));
  gap: 2.4rem;
  ${stagger(12, 50)}
`;

const CardSkeleton = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding-bottom: 1.8rem;

  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-lg);
  overflow: hidden;

  & > *:not(:first-child) {
    margin: 0 1.8rem;
  }
`;

function GridSkeleton() {
  return (
    <Grid>
      {Array.from({ length: 6 }, (_, i) => (
        <CardSkeleton key={i}>
          <Skeleton $height="17rem" />
          <Skeleton $width="60%" $height="2.2rem" />
          <Skeleton $width="40%" />
        </CardSkeleton>
      ))}
    </Grid>
  );
}

function CabinGrid() {
  const { isLoading, cabins, error } = useCabins();
  const [searchParams, setSearchParams] = useSearchParams();
  // Who is staying in each cabin: occupancy comes from the bookings
  const { inHouse } = useTodayActivity();

  if (isLoading) return <GridSkeleton />;

  if (error) return <ErrorMessage>{error.message}</ErrorMessage>;

  if (!cabins.length)
    return (
      <EmptyState
        icon={<HiOutlineHomeModern />}
        title="No cabins yet"
        description="Add your first cabin and it will show up here, on the calendar and in every booking."
        action={<AddCabin />}
      />
    );

  // 1. Filter by discount. Few cabins, so this one happens in the browser
  const discountValue = searchParams.get("discount") || "all";

  let filteredCabins = cabins;

  if (discountValue === "no-discount")
    filteredCabins = cabins.filter((cabin) => cabin.discount === 0);

  if (discountValue === "with-discount")
    filteredCabins = cabins.filter((cabin) => cabin.discount > 0);

  // 2. Filter by status. Archived cabins are hidden unless asked for
  const statusValue = searchParams.get("status") || "active";

  if (statusValue === "active")
    filteredCabins = filteredCabins.filter(
      (cabin) => cabin.is_active !== false,
    );

  if (statusValue === "archived")
    filteredCabins = filteredCabins.filter(
      (cabin) => cabin.is_active === false,
    );

  // 3. Sort
  const sortBy = searchParams.get("sortBy") || "name-asc";
  const [field, direction] = sortBy.split("-");
  const modifier = direction === "asc" ? 1 : -1;

  const sortedCabins = [...filteredCabins].sort((a, b) =>
    typeof a[field] === "string"
      ? a[field].localeCompare(b[field]) * modifier
      : (a[field] - b[field]) * modifier,
  );

  function clearFilters() {
    searchParams.delete("discount");
    searchParams.delete("status");
    setSearchParams(searchParams);
  }

  if (!sortedCabins.length)
    return (
      <EmptyState
        icon={<HiOutlineHomeModern />}
        title="No cabins match this filter"
        description={
          statusValue === "archived"
            ? "Nothing has been archived yet."
            : "Try a different discount or status filter."
        }
        action={<Button onClick={clearFilters}>Clear filters</Button>}
      />
    );

  return (
    <Menus>
      <Grid>
        {sortedCabins.map((cabin) => (
          <CabinCard
            cabin={cabin}
            stay={inHouse.find((booking) => booking.cabinId === cabin.id)}
            key={cabin.id}
          />
        ))}
      </Grid>
    </Menus>
  );
}

export default CabinGrid;
