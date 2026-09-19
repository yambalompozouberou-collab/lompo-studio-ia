import { useEffect, useState } from "react";
import { useApp } from "../store/AppContext";
import { listMyProjects } from "../services/projectsService";

export default function Projects() {
  const { user } = useApp();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    listMyProjects()
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <>
        <h1>Mes projets</h1>
        <p className="muted">Connectez-vous pour voir vos projets.</p>
      </>
    );
  }

  return (
    <>
      <h1>Mes projets</h1>
      <div className="list">
        {loading && <p className="muted">Chargement...</p>}
        {!loading && projects.length === 0 && <p className="muted">Aucun projet pour l'instant.</p>}
        {projects.map((p) => (
          <div className="row" key={p.id}>
            🎬 <span><b>{p.title}</b><br /><small className="muted">{p.status}</small></span>
            <b>›</b>
          </div>
        ))}
      </div>
    </>
  );
}
