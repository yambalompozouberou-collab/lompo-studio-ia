import { useNavigate } from "react-router-dom";
import { useApp } from "../../store/AppContext";

export default function Header({ onToggleDrawer }) {
  const navigate = useNavigate();
  const { getQuota } = useApp();
  // Affiche le quota image par défaut (15/jour) ; le compteur générique
  // credits_internal n'est plus utilisé (voir migration 003_atomic_quotas.sql).
  const imageQuota = getQuota("image");
  const credits = imageQuota ? imageQuota.remaining : "…";

  return (
    <header>
      <button onClick={onToggleDrawer} aria-label="Menu">☰</button>
      <div className="brand" onClick={() => navigate("/")}>
        <img src="/assets/logo.svg" alt="LOMPO STUDIO IA" />
        <b>LOMPO<br /><em>STUDIO IA</em></b>
      </div>
      <div className="right">
        <span>⚡ <b>{credits}</b></span>
        <button onClick={() => navigate("/profil")} aria-label="Profil">◉</button>
      </div>
    </header>
  );
}
