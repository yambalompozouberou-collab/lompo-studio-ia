import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../store/AppContext";
import { useToast } from "../components/ui/Toast";
import AuthModal from "../components/ui/AuthModal";
import { generateImage } from "../services/imageService";

export default function ImageGenerate() {
  const { user, getQuota, refreshQuotas } = useApp();
  const imageQuota = getQuota("image");
  const toast = useToast();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [format, setFormat] = useState("1:1");
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  async function handleGenerate() {
    if (!user) {
      setShowAuth(true);
      return;
    }
    if (!prompt.trim()) {
      toast("Décrivez votre image.");
      return;
    }
    setLoading(true);
    try {
      const url = await generateImage({ prompt, format });
      setImageUrl(url);
      toast("Image générée.");
    } catch (e) {
      // Message précis si c'est un refus de quota (voir imageService.js),
      // message générique sinon (ex. Edge Function pas encore déployée).
      toast(e.quota ? e.message : "Génération indisponible pour l'instant (backend à connecter).");
    } finally {
      setLoading(false);
      refreshQuotas(); // reflète la consommation (ou le remboursement en cas d'échec)
    }
  }

  return (
    <>
      <h1>Générer une image</h1>
      <div className="card form">
        <div className="field">
          <label>Format</label>
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            <option>1:1</option>
            <option>9:16</option>
            <option>16:9</option>
          </select>
        </div>
        <div className="field">
          <label>Description</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Décrivez l'image à générer..."
          />
        </div>
        {imageQuota && (
          <p className="muted">
            {imageQuota.remaining}/{imageQuota.quota_limit} générations restantes aujourd'hui (reset à minuit UTC)
          </p>
        )}
        <button
          className="yellow"
          onClick={handleGenerate}
          disabled={loading || (imageQuota && imageQuota.remaining <= 0)}
        >
          {loading ? "Génération..." : "Générer →"}
        </button>
        {imageUrl && <img src={imageUrl} alt="Résultat généré" style={{ maxWidth: "100%", borderRadius: 12 }} />}
      </div>
      <button className="secondary" style={{ marginTop: 14 }} onClick={() => navigate("/projets")}>
        Voir mes projets
      </button>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
