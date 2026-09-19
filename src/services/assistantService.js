import { supabase } from "../lib/supabaseClient";

// IMPORTANT (voir audit) : ceci appelle une Edge Function `ask-assistant`
// qui n'existe pas encore. Elle devra, côté serveur, appeler l'API Gemini
// (free tier Flash/Flash-Lite) avec la clé API stockée en secret Supabase
// (jamais dans le frontend). Tant que cette fonction n'est pas déployée,
// cet appel échouera — c'est volontaire : mieux vaut une erreur visible
// qu'une fausse réponse simulée comme dans la V1.
export async function askAssistant(question) {
  const { data, error } = await supabase.functions.invoke("ask-assistant", {
    body: { question },
  });
  if (error) throw error;
  return data.answer;
}
