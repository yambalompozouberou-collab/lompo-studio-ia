import { useToast } from "./Toast";

export default function ProSoonModal({ title, onClose }) {
  const toast = useToast();
  return (
    <div className="modal">
      <div className="modalbox">
        <button className="close" onClick={onClose}>✕</button>
        <span className="badge pro">PRO — BIENTÔT</span>
        <h2>{title}</h2>
        <p>Cette fonctionnalité n'est pas encore connectée à un vrai fournisseur IA. Elle sera activée dès qu'une intégration réelle sera en place.</p>
        <ul>
          <li>Fonctions avancées</li>
          <li>Modèles premium</li>
          <li>Qualité supérieure</li>
        </ul>
        <button
          className="yellow"
          style={{ width: "100%" }}
          onClick={() => {
            onClose();
            toast("Demande enregistrée.");
          }}
        >
          Me prévenir
        </button>
      </div>
    </div>
  );
}
