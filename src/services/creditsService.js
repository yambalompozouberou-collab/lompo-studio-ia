import { supabase } from "../lib/supabaseClient";

export async function getMyProfile() {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData?.user) throw new Error("Utilisateur non connecté.");

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, plan, role")
    .eq("id", authData.user.id)
    .single();
  if (error) throw error;
  return data;
}
