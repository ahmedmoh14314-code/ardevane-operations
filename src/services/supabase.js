import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = "https://wcrznygqwtvajancczhq.supabase.co";
const supabaseKey = "sb_publishable_9lUCcLGvQQZvqswwX4g4BA_dWAyMyMI";
// One shared client for the whole app
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
