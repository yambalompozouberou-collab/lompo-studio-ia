import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // On avertit clairement plutôt que de laisser planter silencieusement :
  // sans ces variables, aucune fonctionnalité liée au compte ne marchera.
  console.warn(
    "[LOMPO] Variables Supabase manquantes. Copie .env.example vers .env.local et remplis-le."
  );
}

export const supabase = createClient(url, anonKey);
