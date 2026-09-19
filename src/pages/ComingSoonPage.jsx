export default function ComingSoonPage({ title }) {
  return (
    <>
      <h1>{title}</h1>
      <div className="card">
        <span className="badge pro">PRO — BIENTÔT</span>
        <p style={{ marginTop: 14 }}>
          Ce module n'est pas encore connecté à un fournisseur IA réel (voir l'audit :
          aucune API gratuite exploitable n'existe actuellement pour ce service).
          L'interface sera activée dès qu'une intégration officielle sera en place.
        </p>
      </div>
    </>
  );
}
