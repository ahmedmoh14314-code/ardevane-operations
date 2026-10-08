// What guests ask for during a stay. There is one lifecycle for every
// request (new → in progress → completed); only the words change with the
// kind of request. Kept in step with the checks on the requests table.

export const REQUEST_TYPES = {
  dining: { label: "Dining", tag: "yellow" },
  housekeeping: { label: "Housekeeping", tag: "blue" },
  support: { label: "Help", tag: "indigo" },
  maintenance: { label: "Repair", tag: "red" },
};

const STEP_WORDS = {
  dining: { in_progress: "Preparing", completed: "Delivered" },
  housekeeping: { in_progress: "In progress", completed: "Completed" },
  support: { in_progress: "In progress", completed: "Resolved" },
  maintenance: { in_progress: "In progress", completed: "Fixed" },
};

export function requestType(type) {
  return REQUEST_TYPES[type] ?? { label: type, tag: "silver" };
}

// "Preparing" for food, "Fixed" for a repair, "New" for anything new
export function requestStatusLabel(type, status) {
  if (status === "new") return "New";
  return STEP_WORDS[type]?.[status] ?? status;
}

// The one button that moves a request on, and its words. A completed
// request has none.
export function nextRequestStep(type, status) {
  if (status === "new")
    return {
      to: "in_progress",
      label: type === "dining" ? "Start preparing" : "Start",
    };

  if (status === "in_progress")
    return {
      to: "completed",
      label: `Mark ${requestStatusLabel(type, "completed").toLowerCase()}`,
    };

  return null;
}

// What a food order costs; free requests come to nothing
export function requestTotal(items = []) {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}
