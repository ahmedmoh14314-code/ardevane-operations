import PageHeader from "../ui/PageHeader";
import TableOperations from "../ui/TableOperations";
import Filter from "../ui/Filter";
import RequestQueue from "../features/requests/RequestQueue";

// What guests have asked for during their stays, in one queue
function Requests() {
  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Guest requests"
        description="Breakfast, housekeeping, help and repairs asked for from My Stay."
      >
        <TableOperations>
          <Filter
            filterField="scope"
            options={[
              { value: "active", label: "To do" },
              { value: "completed", label: "Done" },
              { value: "all", label: "All" },
            ]}
          />
          <Filter
            filterField="type"
            options={[
              { value: "all", label: "Every kind" },
              { value: "breakfast", label: "Breakfast" },
              { value: "housekeeping", label: "Housekeeping" },
              { value: "support", label: "Help" },
              { value: "maintenance", label: "Repair" },
            ]}
          />
        </TableOperations>
      </PageHeader>

      <RequestQueue />
    </>
  );
}

export default Requests;
