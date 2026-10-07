import supabase from "./supabase";

// The database's own words when it refuses something we can explain
function folioError(error, fallback) {
  console.error(error);

  if (error.code === "23514")
    return new Error("Amounts must be more than zero.");
  if (error.code === "42501")
    return new Error("Only the front desk can change a folio.");

  return new Error(fallback);
}

// A stay's folio: the totals (worked out in the database) and the rows
// behind them
export async function getFolio(bookingId) {
  const [totals, charges, payments] = await Promise.all([
    supabase
      .from("booking_folios")
      .select("accommodation, extras, total, paid, remaining")
      .eq("bookingId", bookingId)
      .single(),
    supabase
      .from("charges")
      .select("id, created_at, description, amount, serviceId")
      .eq("bookingId", bookingId)
      .order("created_at"),
    supabase
      .from("payments")
      .select("id, created_at, amount, method")
      .eq("bookingId", bookingId)
      .order("created_at"),
  ]);

  const error = totals.error || charges.error || payments.error;
  if (error) throw folioError(error, "The folio could not be loaded");

  return {
    totals: totals.data,
    charges: charges.data,
    payments: payments.data,
  };
}

// What the hotel sells besides the night
export async function getServices() {
  const { data, error } = await supabase
    .from("services")
    .select("id, name, category, price")
    .eq("isActive", true)
    .order("name");

  if (error) throw folioError(error, "Services could not be loaded");

  return data;
}

export async function addCharge({ bookingId, serviceId, description, amount }) {
  const { data, error } = await supabase
    .from("charges")
    .insert([{ bookingId, serviceId: serviceId ?? null, description, amount }])
    .select()
    .single();

  if (error) throw folioError(error, "The charge could not be added");

  return data;
}

// Cash only: there is no card or online payment in this app
export async function recordPayment({ bookingId, amount }) {
  const { data, error } = await supabase
    .from("payments")
    .insert([{ bookingId, amount, method: "cash" }])
    .select()
    .single();

  if (error) throw folioError(error, "The payment could not be recorded");

  return data;
}
