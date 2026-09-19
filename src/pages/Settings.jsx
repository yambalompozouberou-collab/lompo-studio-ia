import { useToast } from "../components/ui/Toast";

const SECTIONS = [
  "👤 Compte",
  "🎨 Apparence",
  "🤖 Génération IA",
  "✂️ Montage vidéo",
  "🎵 Audio et musique",
  "⚡ Crédits et abonnement",
  "💳 Paiements — Orange Money / Moov Money",
  "🔔 Notifications",
  "☁️ Stockage",
  "🔐 Confidentialité et sécurité",
  "❓ Aide",
];

export default function Settings() {
  const toast = useToast();
  return (
    <>
      <h1>Paramètres</h1>
      <div className="list">
        {SECTIONS.map((s) => (
          <div className="row" key={s} onClick={() => toast(`Configuration à venir : ${s}`)}>
            <span>{s}</span>
            <b>›</b>
          </div>
        ))}
      </div>
    </>
  );
}
