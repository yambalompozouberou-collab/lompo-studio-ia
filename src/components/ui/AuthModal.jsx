import { useState } from "react";
import { signInWithProvider, signInWithEmail, signUpWithEmail } from "../../services/authService";
import { useToast } from "./Toast";

export default function AuthModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const toast = useToast();

  async function handleOAuth(provider) {
    try {
      await signInWithProvider(provider);
      // La redirection OAuth quitte la page ; rien d'autre à faire ici.
    } catch (e) {
      toast(e.message || "Connexion impossible.");
    }
  }

  async function handleEmailSubmit(e) {
    e.preventDefault();
    try {
      if (mode === "login") await signInWithEmail(email, password);
      else await signUpWithEmail(email, password);
      onClose();
    } catch (e2) {
      toast(e2.message || "Erreur d'authentification.");
    }
  }

  return (
    <div className="modal">
      <div className="modalbox">
        <button className="close" onClick={onClose}>✕</button>
        <h2>Connexion</h2>
        <button className="auth google" onClick={() => handleOAuth("google")}>
          🌐 Continuer avec Google
        </button>
        <button className="auth facebook" onClick={() => handleOAuth("facebook")}>
          f Continuer avec Facebook
        </button>
        <hr />
        <form onSubmit={handleEmailSubmit} className="form">
          <div className="field">
            <label>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              required
            />
          </div>
          <div className="field">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="primary" type="submit">
            {mode === "login" ? "Se connecter" : "Créer un compte"}
          </button>
        </form>
        <p className="muted" style={{ cursor: "pointer" }} onClick={() => setMode(mode === "login" ? "signup" : "login")}>
          {mode === "login" ? "Pas de compte ? Créez-en un." : "Déjà un compte ? Connectez-vous."}
        </p>
      </div>
    </div>
  );
}
