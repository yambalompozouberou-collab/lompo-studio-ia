# À construire (Phase 1, étape suivante)

Cette Edge Function doit appeler l'API Gemini (free tier Flash / Flash-Lite
via Google AI Studio) avec la clé API stockée en secret Supabase
(`GEMINI_API_KEY`), et retourner `{ answer }`.

À vérifier avant de coder : les quotas exacts du free tier au moment de
l'implémentation (ils changent régulièrement, cf. audit).
