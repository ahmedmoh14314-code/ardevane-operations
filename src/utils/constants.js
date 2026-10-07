// Rows per page
export const PAGE_SIZE = 10;

// What a member of staff can do in Operations. Kept in step with the
// role check on the staff_members table.
export const STAFF_ROLES = [
  { value: "admin", label: "Administrator" },
  { value: "front_desk", label: "Front desk" },
  { value: "housekeeping", label: "Housekeeping" },
  { value: "maintenance", label: "Maintenance" },
];

export function staffRoleLabel(role) {
  return STAFF_ROLES.find((option) => option.value === role)?.label ?? "Staff";
}
