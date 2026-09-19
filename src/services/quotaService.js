import { supabase } from "../lib/supabaseClient";

// Remplace creditsService.consumeCredits() / l'ancienne Edge Function
// consume-credits pour les services couverts par le moteur de quotas
// (voir supabase/migrations/003_atomic_quotas.sql).
//
// La vérification ET la décrémentation se font en une seule opération
// atomique côté PostgreSQL (fonction consume_quota) : impossible de
// dépasser le quota même avec deux requêtes simultanées, et impossible
// pour le frontend de modifier used_amount directement (RLS interdit
// toute écriture cliente sur daily_usage).

// service: "image" | "video"
// amount: nombre d'unités à consommer (1 génération pour image ;
// nombre de crédits pour vidéo, selon durée/résolution/modèle une fois
// ce service construit)
export async function consumeQuota(service, amount = 1) {
  const { data, error } = await supabase.rpc("consume_quota", {
    p_service: service,
    p_amount: amount,
  });
  if (error) throw error;

  // Les fonctions Postgres "returns table" renvoient un tableau de lignes ;
  // consume_quota n'en renvoie toujours qu'une seule.
  const result = Array.isArray(data) ? data[0] : data;

  if (!result) {
    throw new Error("Réponse invalide du moteur de quotas.");
  }
  return result; // { allowed, service, usage_date, used_amount, quota_limit, remaining, reason }
}

// Symétrique de consumeQuota : à appeler si l'appel au fournisseur échoue
// APRÈS que le quota a été décrémenté, pour ne pas pénaliser l'utilisateur
// d'une génération qui n'a rien produit. Ne fait jamais descendre le
// compteur sous zéro (voir refund_quota côté SQL).
export async function refundQuota(service, amount = 1) {
  const { data, error } = await supabase.rpc("refund_quota", {
    p_service: service,
    p_amount: amount,
  });
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

// Lecture de l'état des quotas pour l'utilisateur connecté, tous services
// actifs confondus (image, video, ...). Utilisé pour l'affichage
// "crédits disponibles / consommés / prochaine réinitialisation".
export async function getMyQuotas() {
  const { data, error } = await supabase.rpc("get_my_quotas");
  if (error) throw error;
  return data ?? []; // [{ service, unit, quota_limit, used_amount, remaining, usage_date, resets_at }]
}
