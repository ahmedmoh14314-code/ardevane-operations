import supabase, { supabaseUrl } from "./supabase";

// Signing in is not enough to use Operations: guests sign in too, on the
// guest website. Staff are the accounts with an active staff_members row.
async function getStaffMembership(userId) {
  const { data, error } = await supabase
    .from("staff_members")
    .select("role, fullName, isActive")
    .eq("userId", userId)
    .eq("isActive", true)
    .maybeSingle();

  if (error) throw new Error("Your access could not be checked");

  return data;
}

// Creates the sign-in account and adds it to the team in one go. Only an
// admin may add staff; the database refuses anyone else.
export async function createStaffMember({ fullName, email, password, role }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        fullName,
        avatar: "",
      },
      // The confirmation email links back to the site the employee was
      // created on: the live site in production, localhost while developing.
      // Supabase only follows it if the address is in its Redirect URLs.
      emailRedirectTo: window.location.origin,
    },
  });

  if (error) throw new Error(error.message);

  // Supabase answers an address that is already registered with a user that
  // has no identities, without telling which addresses exist
  if (!data.user || data.user.identities?.length === 0)
    throw new Error("This email address already has an account");

  const { error: staffError } = await supabase
    .from("staff_members")
    .insert([{ userId: data.user.id, fullName, role }]);

  if (staffError)
    throw new Error(
      "The account was created, but it could not be added to the team",
    );

  return data;
}

export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error("Email or password is incorrect");

  const staff = await getStaffMembership(data.user.id);

  // A guest account, or a member of staff who was removed from the team.
  // Only this sign-in is ended: the guest stays signed in on the website.
  if (!staff) {
    await supabase.auth.signOut({ scope: "local" });
    throw new Error("This account doesn't have access to Ardevane Operations");
  }

  return { ...data.user, staff };
}

export async function getCurrentUser() {
  const { data: session } = await supabase.auth.getSession();

  if (!session.session) return null;

  const { data, error } = await supabase.auth.getUser();

  if (error) throw new Error(error.message);

  const staff = await getStaffMembership(data.user.id);

  return { ...data.user, staff };
}

// Signs out of Operations only. supabase-js signs out every session of the
// account by default, which would also sign the same person out of the
// guest website.
export async function logout() {
  const { error } = await supabase.auth.signOut({ scope: "local" });

  if (error) throw new Error(error.message);
}

export async function updateCurrentUser({ password, fullName, avatar }) {
  let updateData;

  if (password) updateData = { password };

  if (fullName) updateData = { data: { fullName } };

  const { data, error } = await supabase.auth.updateUser(updateData);

  if (error) throw new Error(error.message);

  if (!avatar) return data;

  const fileName = `avatar-${data.user.id}-${Math.random()}`;

  const { error: storageError } = await supabase.storage
    .from("avatars")
    .upload(fileName, avatar);

  if (storageError) throw new Error(storageError.message);

  const { data: updatedUser, error: error2 } = await supabase.auth.updateUser({
    data: {
      avatar: `${supabaseUrl}/storage/v1/object/public/avatars/${fileName}`,
    },
  });

  if (error2) throw new Error(error2.message);

  return updatedUser;
}
