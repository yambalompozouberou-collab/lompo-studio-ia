import { useNavigate } from "react-router-dom";

const ITEMS = [
  { path: "/", label: "⌂ Accueil" },
  { path: "/assistant", label: "✦ Assistant IA" },
  { path: "/projets", label: "▣ Projets" },
  { path: "/modeles", label: "▦ Modèles" },
  { path: "/parametres", label: "⚙ Paramètres" },
  { path: "/admin", label: "♙ Administration" },
];

export default function Drawer({ open, onClose }) {
  const navigate = useNavigate();
  return (
    <aside className={`drawer${open ? " open" : ""}`}>
      {ITEMS.map((item) => (
        <button
          key={item.path}
          onClick={() => {
            navigate(item.path);
            onClose();
          }}
        >
          {item.label}
        </button>
      ))}
    </aside>
  );
}
