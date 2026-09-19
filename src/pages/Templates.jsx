const CATEGORIES = [
  "🎬 Modèles vidéo",
  "🖼️ Modèles image",
  "🎵 Modèles musique",
  "🌐 Modèles sites",
  "📱 Modèles apps",
  "✨ Prompts IA",
];

export default function Templates() {
  return (
    <>
      <h1>Modèles</h1>
      <div className="grid">
        {CATEGORIES.map((c) => (
          <div className="card" key={c}>
            <h3>{c}</h3>
            <p className="muted">Catalogue configurable depuis l'administration.</p>
          </div>
        ))}
      </div>
    </>
  );
}
