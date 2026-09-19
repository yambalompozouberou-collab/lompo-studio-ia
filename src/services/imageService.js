import { supabase } from "../lib/supabaseClient";
import { consumeQuota, refundQuota } from "./quotaService";

// IMPORTANT (voir audit, section "Génération d'images") : la génération
// réelle passera par une Edge Function `generate-image` qui appellera soit
// Cloudflare Workers AI (flux-1-schnell), soit l'Inference API Hugging Face,
// avec la clé stockée en secret serveur. Cette fonction n'existe pas encore
// (voir supabase/functions/generate-image/TODO.md) : tant qu'elle n'est pas
// déployée, l'appel à l'Edge Function ci-dessous échouera intentionnellement
// plutôt que de simuler un résultat.
//
// Quota : 15 générations/jour pour le compte gratuit (quota_config), vérifié
// et décrémenté de façon atomique côté PostgreSQL AVANT l'appel au
// fournisseur — on ne veut jamais appeler une API (potentiellement
// facturée à LOMPO) si le quota est déjà dépassé.
export async function generateImage({ prompt, format }) {
  const quota = await consumeQuota("image", 1);

  if (!quota.allowed) {
    const err = new Error(
      quota.reason === "quota_exceeded"
        ? `Quota d'images atteint pour aujourd'hui (${quota.used_amount}/${quota.quota_limit}). Réinitialisation à minuit UTC.`
        : `Génération refusée (${quota.reason}).`
    );
    err.quota = quota;
    throw err;
  }

  try {
    const { data, error } = await supabase.functions.invoke("generate-image", {
      body: { prompt, format },
    });
    if (error) throw error;
    return data.imageUrl;
  } catch (err) {
    // La génération a échoué après consommation du quota : on rembourse
    // pour que l'utilisateur ne perde pas une unité sur un échec.
    try {
      await refundQuota("image", 1);
    } catch {
      // Si le remboursement échoue aussi, on ne masque pas l'erreur
      // d'origine — mais on ne peut pas garantir le remboursement ici.
    }
    throw err;
  }
}
