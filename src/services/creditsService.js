import { supabase } from "../lib/supabaseClient";

// Lecture du profil (plan, rôle). NOTE : credits_internal n'est plus lu ici
// depuis la migration 003_atomic_quotas.sql — pour les quotas image/vidéo,
// voir src/services/quotaService.js (getMyQuotas / consumeQuota), qui lit
// l'état réel côté serveur (quota_config + daily_usage) au lieu de ce
// compteur générique désormais obsolète pour ces services.
export async function getMyProfile() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, plan, role")
    .single();
  if (error) throw error;
  return data;
}

// consumeCredits() et l'Edge Function consume-credits ont été retirés
// (migration 003_atomic_quotas.sql) : ils décrémentaient credits_internal,
// qui ne protège plus aucun service. Les garder aurait laissé un chemin
// mort et trompeur — appelable, mais sans effet sur les vrais quotas.
// Utiliser quotaService.consumeQuota() à la place.
