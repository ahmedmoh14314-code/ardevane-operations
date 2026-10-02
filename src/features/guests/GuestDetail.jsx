import { useGuest } from "./useGuest";
import GuestStats from "./GuestStats";
import GuestProfile from "./GuestProfile";
import GuestBookings from "./GuestBookings";

import Row from "../../ui/Row";
import Heading from "../../ui/Heading";
import Tag from "../../ui/Tag";
import ButtonText from "../../ui/ButtonText";
import Breadcrumb from "../../ui/Breadcrumb";
import Empty from "../../ui/Empty";
import ErrorMessage from "../../ui/ErrorMessage";
import { DetailSkeleton, StatsSkeleton } from "../../ui/Skeleton";
import { useMoveBack } from "../../hooks/useMoveBack";

function guestTag(stats) {
  if (stats.currentStay) return <Tag type="green">Staying now</Tag>;
  if (stats.upcomingStay) return <Tag type="blue">Arriving soon</Tag>;
  if (stats.lastStay) return <Tag type="silver">Past guest</Tag>;

  return <Tag type="silver">No stays</Tag>;
}

function GuestDetail() {
  const { guest, isLoading, error } = useGuest();
  const moveBack = useMoveBack();

  if (isLoading)
    return (
      <>
        <StatsSkeleton count={3} />
        <DetailSkeleton lines={4} />
      </>
    );

  if (error) return <ErrorMessage>{error.message}</ErrorMessage>;

  if (!guest) return <Empty resourceName="guest" />;

  return (
    <>
      <Breadcrumb to="/guests" parent="Guests">
        {guest.fullName}
      </Breadcrumb>

      <Row type="horizontal">
        <Heading as="h1">{guest.fullName}</Heading>
        {guestTag(guest.stats)}
        <ButtonText onClick={moveBack}>&larr; Back</ButtonText>
      </Row>

      <GuestStats stats={guest.stats} />

      <GuestProfile guest={guest} />

      <Row type="vertical">
        <Heading as="h3">Booking history</Heading>
        <GuestBookings bookings={guest.bookings} />
      </Row>
    </>
  );
}

export default GuestDetail;
