import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./store/AppContext";
import { ToastProvider } from "./components/ui/Toast";
import Layout from "./components/layout/Layout";

import Home from "./pages/Home";
import Assistant from "./pages/Assistant";
import ImageGenerate from "./pages/ImageGenerate";
import Create from "./pages/Create";
import Projects from "./pages/Projects";
import Templates from "./pages/Templates";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import ComingSoonPage from "./pages/ComingSoonPage";

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="/generer-image" element={<ImageGenerate />} />
              <Route path="/creer-video" element={<ComingSoonPage title="Créer une vidéo" />} />
              <Route path="/montage" element={<ComingSoonPage title="Montage vidéo" />} />
              <Route path="/musique" element={<ComingSoonPage title="Musique Pro" />} />
              <Route path="/sites" element={<ComingSoonPage title="Création de sites" />} />
              <Route path="/applications" element={<ComingSoonPage title="Création d'applications" />} />
              <Route path="/creer" element={<Create />} />
              <Route path="/projets" element={<Projects />} />
              <Route path="/modeles" element={<Templates />} />
              <Route path="/profil" element={<Profile />} />
              <Route path="/parametres" element={<Settings />} />
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AppProvider>
  );
}
