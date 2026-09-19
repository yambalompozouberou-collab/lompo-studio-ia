import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Drawer from "./Drawer";
import BottomNav from "./BottomNav";

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Header onToggleDrawer={() => setDrawerOpen((v) => !v)} />
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <main>
        <Outlet />
      </main>
      <BottomNav />
    </>
  );
}
