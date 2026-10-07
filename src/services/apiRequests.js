import supabase from "./supabase";

const COLUMNS =
  "id, created_at, type, status, title, note, priority, requestedFor, completedAt, bookingId, request_items(id, name, quantity, unitPrice), bookings(reference, cabins(name), guests(fullName))";

// Requests guests made during their stays. "active" is everything still to
// do, oldest first, urgent ones on top; "completed" is the newest done first.
export async function getRequests({ scope = "active", type } = {}) {
  let query = supabase.from("requests").select(COLUMNS);

  if (scope === "active")
    query = query
      .neq("status", "completed")
      .order("priority", { ascending: false })
      .order("created_at");

  if (scope === "completed")
    query = query
      .eq("status", "completed")
      .order("completedAt", { ascending: false });

  if (scope === "all") query = query.order("created_at", { ascending: false });

  if (type) query = query.eq("type", type);

  const { data, error } = await query;

  if (error) {
    console.error(error);
    throw new Error("Requests could not be loaded");
  }

  return data;
}

// Move a request on. Completing a breakfast order adds it to the folio,
// in the database.
export async function setRequestStatus({ id, status }) {
  const { data, error } = await supabase
    .from("requests")
    .update({ status })
    .eq("id", id)
    .select("id, type, status, title, bookingId")
    .single();

  if (error) {
    console.error(error);
    throw new Error(
      error.code === "22023"
        ? error.message
        : "The request could not be updated",
    );
  }

  return data;
}
