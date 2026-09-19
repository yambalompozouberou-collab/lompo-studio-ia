import { useEffect, useState } from "react";
import { useApp } from "../store/AppContext";
import { supabase } from "../lib/supabaseClient";
import { APP_CONFIG } from "../config/appConfig";

// Accès protégé par RLS côté serveur (voir schema.sql : seules les lignes
// où profiles.role = 'admin' peuvent lire la table `profiles` en entier).
// Ce garde-fou côté client est un confort d'UX, pas la sécurité réelle.
export default function Admin() {
  const { isAdmin, loading } = useApp();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
    supabase
      .from("profiles")
      .select("id, plan", { count: "exact" })
      .then(({ data, count }) => {
        const proCount = (data || []).filter((p) => p.plan === "pro").length;
        setStats({ total: count ?? data?.length ?? 0, pro: proCount });
      });
  }, [isAdmin]);

  if (loading) return <p className="muted">Chargement...</p>;
  if (!isAdmin) {
    return (
      <>
        <h1>Administration</h1>
        <p className="muted">Accès réservé aux comptes administrateurs.</p>
      </>
    );
  }

  return (
    <>
      <h1>Administration</h1>
      <div className="stats">
        <div className="stat">Utilisateurs<br /><b>{stats?.total ?? "…"}</b></div>
        <div className="stat">Comptes Pro<br /><b>{stats?.pro ?? "…"}</b></div>
        <div className="stat">Services actifs<br /><b>{Object.values(APP_CONFIG.services).filter(s => s.status === "disponible").length}</b></div>
        <div className="stat">Revenus<br /><b>0 FCFA</b></div>
      </div>

      <h2>Services</h2>
      <div className="list">
        {Object.entries(APP_CONFIG.services).map(([key, s]) => (
          <div className="row" key={key}>
            <span>{s.icon} {s.label}</span>
            <b>{s.status === "disponible" ? "Disponible" : "PRO — BIENTÔT"}</b>
          </div>
        ))}
      </div>
      <p className="muted" style={{ marginTop: 14 }}>
        Édition des crédits, coûts par fonctionnalité et statuts de service :
        à brancher sur la table `app_settings` (Phase 1, prochaine étape).
      </p>
    </>
  );
}
