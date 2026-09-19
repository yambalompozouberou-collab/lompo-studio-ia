import { useNavigate } from "react-router-dom";

const ITEMS = [
  { path: "/", icon: "⌂", label: "Accueil" },
  { path: "/creer", icon: "＋", label: "Créer" },
  { path: "/projets", icon: "▣", label: "Projets" },
  { path: "/modeles", icon: "▦", label: "Modèles" },
  { path: "/profil", icon: "♙", label: "Profil" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  return (
    <nav className="bottomnav">
      {ITEMS.map((item) => (
        <button key={item.path} onClick={() => navigate(item.path)}>
          {item.icon}
          <small>{item.label}</small>
        </button>
      ))}
    </nav>
  );
}
