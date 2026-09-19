import { useState } from "react";
import { useApp } from "../store/AppContext";
import { useToast } from "../components/ui/Toast";
import AuthModal from "../components/ui/AuthModal";
import { askAssistant } from "../services/assistantService";

// Mots-clés qui signalent une demande de CRÉATION (pas juste une question)
// -> déclenche l'écran de connexion, conformément à la section 11 du cahier
// des charges. Liste volontairement simple pour la Phase 1 ; à affiner.
const CREATION_INTENT = /\b(cr[ée]e|g[ée]n[èe]re|fais[- ]moi|monte[- ]moi)\b/i;

export default function Assistant() {
  const { user } = useApp();
  const toast = useToast();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAsk() {
    const q = question.trim();
    if (!q) return;

    if (CREATION_INTENT.test(q) && !user) {
      setShowAuth(true);
      return;
    }

    setMessages((m) => [...m, { role: "user", text: q }]);
    setQuestion("");
    setLoading(true);
    try {
      const answer = await askAssistant(q);
      setMessages((m) => [...m, { role: "assistant", text: answer }]);
    } catch (e) {
      toast("Assistant pas encore connecté à un vrai modèle (voir README).");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1>Assistant IA</h1>
      <div className="card">
        <p>🤖 IA générale accessible sans connexion.</p>
        <div className="list">
          {messages.map((m, i) => (
            <div className="row" key={i}>
              {m.role === "user" ? "👤" : "🤖"} {m.text}
            </div>
          ))}
        </div>
        <div className="field">
          <label>Votre question</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ex. Comment créer une vidéo TikTok ?"
          />
        </div>
        <div className="actions">
          <button className="primary" onClick={handleAsk} disabled={loading}>
            {loading ? "..." : "Envoyer →"}
          </button>
        </div>
      </div>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
