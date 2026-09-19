import { supabase } from "../lib/supabaseClient";

// Connexion Google / Facebook réelle via Supabase Auth (OAuth).
// Nécessite d'activer ces providers dans le dashboard Supabase (Authentication
// > Providers) et d'y renseigner les identifiants OAuth officiels de chaque
// plateforme (Google Cloud Console / Meta for Developers). Rien de tout ça
// n'est gratuit à configurer en clés, mais l'usage Auth Supabase lui-même
// est inclus dans le plan gratuit.
export async function signInWithProvider(provider) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return data.subscription;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
