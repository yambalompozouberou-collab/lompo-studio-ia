import { supabase } from "../lib/supabaseClient";

export async function listMyProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("id, title, type, status, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createProject({ title, type }) {
  const { data, error } = await supabase
    .from("projects")
    .insert({ title, type, status: "en_cours" })
    .select()
    .single();
  if (error) throw error;
  return data;
}
