import { useNavigate } from "react-router-dom";
import { useApp } from "../store/AppContext";
import ServiceGrid from "../components/ui/ServiceGrid";

export default function Home() {
  const navigate = useNavigate();
  const { getQuota } = useApp();
  const imageQuota = getQuota("image");
  const videoQuota = getQuota("video");

  return (
    <>
      <section className="hero">
        <span className="badge">STUDIO CRÉATIF IA • ÉVOLUTIF</span>
        <h1>LOMPO STUDIO IA</h1>
        <p>Créez, générez et montez vos vidéos, images, musiques, sites et applications.</p>
        <div className="actions">
          <button className="yellow" onClick={() => navigate("/generer-image")}>
            ✨ Générer avec IA
          </button>
        </div>
      </section>

      <h2>Services</h2>
      <ServiceGrid />

      <h2>Assistant IA</h2>
      <div className="card">
        <p><b>Posez une question sans connexion.</b></p>
        <p className="muted">
          Pour créer une vidéo, une image, de la musique, un site ou une application,
          l'IA vous demandera de vous connecter.
        </p>
        <button className="primary" onClick={() => navigate("/assistant")}>
          Ouvrir l'assistant →
        </button>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        {imageQuota ? (
          <>
            ✨ <b>{imageQuota.remaining}/{imageQuota.quota_limit} images</b> restantes aujourd'hui
          </>
        ) : (
          <>✨ <b>15 images/jour</b> (connectez-vous pour voir votre quota)</>
        )}
        <br />
        {videoQuota ? (
          <>🎬 <b>{videoQuota.remaining}/{videoQuota.quota_limit} crédits vidéo</b> restants aujourd'hui<br /></>
        ) : (
          <>🎬 <b>50 crédits vidéo/jour</b> (bientôt disponible)<br /></>
        )}
        <small className="muted">Réinitialisation quotidienne à minuit UTC.</small>
      </div>
    </>
  );
}
