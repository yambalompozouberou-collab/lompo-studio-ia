# À construire (Phase 1, étape suivante)

Cette Edge Function doit :
1. Vérifier l'authentification (même schéma que `consume-credits`).
2. Appeler soit :
   - Cloudflare Workers AI (modèle `@cf/stabilityai/stable-diffusion-xl-base-1.0`
     ou `@cf/black-forest-labs/flux-1-schnell`), avec le token Cloudflare
     stocké en secret Supabase (`CF_API_TOKEN`, `CF_ACCOUNT_ID`) ;
   - ou l'Inference API Hugging Face, avec `HF_API_TOKEN` en secret.
3. Retourner l'image (en base64 ou après upload dans Supabase Storage) sous
   la forme `{ imageUrl }`.

À vérifier avant de coder : les quotas gratuits exacts de l'option choisie
dans la documentation officielle au moment de l'implémentation (ils évoluent).
