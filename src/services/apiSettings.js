import supabase from "./supabase";

// The app has a single settings row
export async function getSettings() {
  // Only one row exists, so .single() is safe here
  const { data, error } = await supabase.from("settings").select("*").single();

  if (error) {
    console.error(error);
    throw new Error("Settings could not be loaded");
  }

  return data;
}

// Save one setting
export async function updateSetting(newSetting) {
  const { data, error } = await supabase
    .from("settings")
    // newSetting is one field, like { breakfastPrice: 20 }
    .update(newSetting)
    // That one row always has id 1
    .eq("id", 1)
    .single();

  if (error) {
    console.error(error);
    throw new Error("Settings could not be updated");
  }

  return data;
}
