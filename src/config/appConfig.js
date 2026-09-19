// Configuration statique de l'app (non secrète).
// Les valeurs de crédits et statuts de service seront à terme lues depuis
// Supabase (table app_settings) pour être modifiables depuis l'Administration
// sans redéployer le code. Pour l'instant : valeurs par défaut de Phase 1.

export const APP_CONFIG = {
  appName: "LOMPO STUDIO IA",
  freeDailyCredits: 20,
  proMonthlyCredits: 500,
  premiumMonthlyCredits: 1500,
  // Statuts possibles : "disponible" | "pro-bientot"
  // L'assistant IA n'est volontairement pas dans cette liste : il a sa
  // propre section dédiée sur l'Accueil (voir Home.jsx), pas une carte ici.
  services: {
    video: { label: "Créer une vidéo", icon: "🎬", status: "pro-bientot" },
    image: { label: "Générer une image", icon: "✨", status: "disponible" },
    editor: { label: "Montage vidéo", icon: "✂️", status: "pro-bientot" },
    music: { label: "Musique Pro", icon: "🎵", status: "pro-bientot" },
    sites: { label: "Création de sites", icon: "🌐", status: "pro-bientot" },
    apps: { label: "Création d'applications", icon: "📱", status: "pro-bientot" },
  },
};

// NOTE IMPORTANTE (voir audit) : "video" et "editor" sont ici en
// "pro-bientot" et non "disponible" comme dans la V1 ChatGPT, car aucune
// API vidéo gratuite n'existe réellement à ce jour (Veo/Flow = payant dès
// le premier appel API). À réévaluer si un vrai fournisseur gratuit apparaît.
