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

// Every booking status, with the words and the colour used everywhere in
// the dashboard. Kept in step with the status check on the bookings table.
export const BOOKING_STATUSES = {
  // Booked on the website, waiting for the hotel to approve or decline it
  pending: { label: "Pending", tag: "yellow" },
  reserved: { label: "Reserved", tag: "blue" },
  checked_in: { label: "Checked in", tag: "green" },
  checked_out: { label: "Checked out", tag: "silver" },
  cancelled: { label: "Cancelled", tag: "red" },
  no_show: { label: "No-show", tag: "indigo" },
};

export function bookingStatus(status) {
  return BOOKING_STATUSES[status] ?? { label: status, tag: "silver" };
}

// Where a booking came from
export const BOOKING_SOURCES = {
  website: "Website",
  walk_in: "Walk-in",
  phone: "Phone",
};

export function staffRoleLabel(role) {
  return STAFF_ROLES.find((option) => option.value === role)?.label ?? "Staff";
}
