import Search from "../../ui/Search";
import SortBy from "../../ui/SortBy";
import TableOperations from "../../ui/TableOperations";

function GuestTableOperations() {
  return (
    <TableOperations>
      <Search
        placeholder="Search name, email or nationality..."
        label="Search guests"
      />

      <SortBy
        options={[
          { value: "fullName-asc", label: "Name (A-Z)" },
          { value: "fullName-desc", label: "Name (Z-A)" },
          { value: "nationality-asc", label: "Nationality (A-Z)" },
          { value: "created_at-desc", label: "Newest first" },
          { value: "created_at-asc", label: "Oldest first" },
        ]}
      />
    </TableOperations>
  );
}

export default GuestTableOperations;
