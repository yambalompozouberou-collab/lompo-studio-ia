import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../store/AppContext";
import AuthModal from "../components/ui/AuthModal";

export default function Profile() {
  const { user, profile, isPro, logout } = useApp();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <h1>Profil</h1>
      <div className="card">
        <h2>{user ? (profile?.email?.split("@")[0] ?? user.email?.split("@")[0]) : "Visiteur"}</h2>
        <p className="muted">{user ? user.email : "Non connecté"}</p>
        <span className={`badge${isPro ? " pro" : ""}`}>{isPro ? "PRO" : "GRATUIT"}</span>
        <div className="actions">
          {user ? (
            <button className="secondary" onClick={logout}>Se déconnecter</button>
          ) : (
            <button className="primary" onClick={() => setShowAuth(true)}>Se connecter</button>
          )}
          <button className="secondary" onClick={() => navigate("/parametres")}>⚙ Paramètres</button>
        </div>
      </div>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
