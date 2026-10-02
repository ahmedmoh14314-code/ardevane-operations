import supabase, { supabaseUrl } from "./supabase";

// Read every cabin
export async function getCabins() {
  const { data, error } = await supabase.from("cabins").select("*");

  if (error) {
    console.error(error);
    throw new Error("Cabins could not be loaded");
  }

  return data;
}

// No id means create, an id means edit
export async function createEditCabin(newCabin, id) {
  // Already uploaded? Then keep its URL
  const hasImagePath = newCabin.image?.startsWith?.(supabaseUrl);

  const imageName = `${Math.random()}-${newCabin.image.name}`.replaceAll(
    "/",
    ""
  );
  const imagePath = hasImagePath
    ? newCabin.image
    : `${supabaseUrl}/storage/v1/object/public/cabin-images/${imageName}`;

  // 1. Save the cabin row
  let query = supabase.from("cabins");

  if (!id) query = query.insert([{ ...newCabin, image: imagePath }]);

  if (id) query = query.update({ ...newCabin, image: imagePath }).eq("id", id);

  const { data, error } = await query.select().single();

  if (error) {
    console.error(error);
    throw new Error("Cabin could not be created");
  }

  if (hasImagePath) return data;

  // 2. Upload the image file
  const { error: storageError } = await supabase.storage
    .from("cabin-images")
    .upload(imageName, newCabin.image);

  // Image failed, so undo the row we just made
  if (storageError) {
    await supabase.from("cabins").delete().eq("id", data.id);
    console.error(storageError);
    throw new Error(
      "Cabin image could not be uploaded and the cabin was not created"
    );
  }

  return data;
}

// Delete one cabin
export async function deleteCabin(id) {
  const { data, error } = await supabase.from("cabins").delete().eq("id", id);

  if (error) {
    console.error(error);

    // Postgres code for "still referenced"
    if (error.code === "23503")
      throw new Error("This cabin has bookings, so it cannot be deleted");

    throw new Error("Cabin could not be deleted");
  }

  return data;
}

// Archive instead of delete. A cabin with bookings cannot be removed, and
// its history has to stay readable, so it is flagged inactive instead.
export async function toggleCabinActive({ id, isActive }) {
  const { data, error } = await supabase
    .from("cabins")
    .update({ is_active: isActive })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Cabin could not be updated");
  }

  return data;
}

// Gallery images for one cabin, cover first
export async function getCabinImages(cabinId) {
  const { data, error } = await supabase
    .from("cabin_images")
    .select("*")
    .eq("cabinId", cabinId)
    .order("position");

  if (error) {
    console.error(error);
    throw new Error("Cabin images could not be loaded");
  }

  return data;
}

export async function addCabinImage({ cabinId, file }) {
  const fileName = `${Math.random()}-${file.name}`.replaceAll("/", "");

  const { error: storageError } = await supabase.storage
    .from("cabin-images")
    .upload(fileName, file);

  if (storageError) {
    console.error(storageError);
    throw new Error("Image could not be uploaded");
  }

  const url = `${supabaseUrl}/storage/v1/object/public/cabin-images/${fileName}`;

  // New images go to the end of the gallery
  const existing = await getCabinImages(cabinId);

  const { data, error } = await supabase
    .from("cabin_images")
    .insert([{ cabinId, url, position: existing.length }])
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Image could not be saved");
  }

  return data;
}

export async function deleteCabinImage(imageId) {
  const { error } = await supabase
    .from("cabin_images")
    .delete()
    .eq("id", imageId);

  if (error) {
    console.error(error);
    throw new Error("Image could not be deleted");
  }
}
