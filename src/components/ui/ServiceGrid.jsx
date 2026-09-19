import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { APP_CONFIG } from "../../config/appConfig";
import ProSoonModal from "./ProSoonModal";

// Règle du cahier des charges (section 25) : cliquer sur un service
// n'ouvre QUE ce service, jamais un mélange de plusieurs modules.
const ROUTES = {
  video: "/creer-video",
  image: "/generer-image",
  editor: "/montage",
  music: "/musique",
  sites: "/sites",
  apps: "/applications",
};

export default function ServiceGrid() {
  const navigate = useNavigate();
  const [proModal, setProModal] = useState(null);

  function handleClick(key) {
    const service = APP_CONFIG.services[key];
    if (service.status === "pro-bientot") {
      setProModal(service.label);
      return;
    }
    navigate(ROUTES[key]);
  }

  return (
    <>
      <div className="grid">
        {Object.entries(APP_CONFIG.services).map(([key, service]) => (
          <button key={key} className="service" onClick={() => handleClick(key)}>
            {service.status === "pro-bientot" && <span className="status">PRO — BIENTÔT</span>}
            <div className="icon">{service.icon}</div>
            <h3>{service.label}</h3>
          </button>
        ))}
      </div>
      {proModal && <ProSoonModal title={proModal} onClose={() => setProModal(null)} />}
    </>
  );
}
