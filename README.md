# LOMPO STUDIO IA — Phase 1

Version React de LOMPO STUDIO IA, reconstruite à partir de la V1 (ChatGPT,
vanilla JS) avec une architecture Supabase + Cloudflare Pages, prête pour
Phase 1 (voir audit initial).

## Structure

```
src/
  components/
    layout/     Header, Drawer, BottomNav, Layout (assemblage des 3)
    ui/         Toast, AuthModal, ProSoonModal, ServiceGrid
  pages/        Une page par route (Home, Assistant, ImageGenerate, ...)
  services/     Appels Supabase (auth, crédits, projets, images, assistant)
  store/        AppContext — état global (session, profil, crédits)
  lib/          Client Supabase
  config/       Configuration statique des services (statuts, libellés)
supabase/
  schema.sql              Tables + Row Level Security
  functions/
    consume-credits/      Edge Function FONCTIONNELLE (débit sécurisé des crédits)
    generate-image/       TODO.md — à connecter (Cloudflare Workers AI / HF)
    ask-assistant/        TODO.md — à connecter (Gemini free tier)
```

## Ce qui est réellement fonctionnel dans ce scaffold

- Authentification Supabase (Google/Facebook/e-mail) — à activer côté
  dashboard Supabase avec de vrais identifiants OAuth.
- Statut Pro/admin déterminé **côté serveur** (trigger SQL à l'inscription),
  plus falsifiable depuis le navigateur.
- Crédits internes stockés en base, décrémentés uniquement via l'Edge
  Function `consume-credits` (jamais depuis le client).
- Lecture/écriture réelle des projets.
- Navigation : un clic sur un service PRO ouvre la modale "PRO — BIENTÔT",
  jamais le module lui-même (règle du cahier des charges section 25).

## Ce qui reste à faire avant que ce soit utilisable

1. Créer un projet Supabase, exécuter `supabase/schema.sql`.
2. Copier `.env.example` → `.env.local` et renseigner l'URL + clé anon.
3. Activer les providers Google/Facebook dans Supabase Auth avec de vraies
   clés OAuth (Google Cloud Console / Meta for Developers).
4. Déployer les Edge Functions `generate-image` et `ask-assistant` une fois
   codées (voir leurs TODO.md).
5. `npm install && npm run dev` en local.
6. Déployer sur Cloudflare Pages (dossier de sortie : `dist`, commande de
   build : `npm run build`).

## Ce qui n'est PAS inclus (volontairement)

Vidéo IA, musique, sites, apps générées : aucune API gratuite exploitable
n'existe pour ces services à ce jour (voir audit). Les pages existent en
"PRO — BIENTÔT" pour ne rien simuler comme fonctionnel.
