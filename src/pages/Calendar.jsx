import CalendarTimeline from "../features/calendar/CalendarTimeline";
import CalendarToolbar from "../features/calendar/CalendarToolbar";
import PageHeader from "../ui/PageHeader";

function Calendar() {
  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Occupancy"
        description="Which cabin is free, and when."
      >
        <CalendarToolbar />
      </PageHeader>

      <CalendarTimeline />
    </>
  );
}

export default Calendar;
