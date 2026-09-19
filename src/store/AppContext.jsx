import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChange, getSession, signOut as authSignOut } from "../services/authService";
import { getMyProfile } from "../services/creditsService";
import { getMyQuotas } from "../services/quotaService";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null); // { plan, role }
  // quotas: [{ service, unit, quota_limit, used_amount, remaining, usage_date, resets_at }]
  const [quotas, setQuotas] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const p = await getMyProfile();
      setProfile(p);
    } catch {
      setProfile(null);
    }
  }, []);

  const refreshQuotas = useCallback(async () => {
    try {
      const q = await getMyQuotas();
      setQuotas(q);
    } catch {
      setQuotas([]);
    }
  }, []);

  useEffect(() => {
    getSession().then((s) => {
      setSession(s);
      setLoading(false);
      if (s) {
        refreshProfile();
        refreshQuotas();
      }
    });
    const sub = onAuthStateChange((s) => {
      setSession(s);
      if (s) {
        refreshProfile();
        refreshQuotas();
      } else {
        setProfile(null);
        setQuotas([]);
      }
    });
    return () => sub.unsubscribe();
  }, [refreshProfile, refreshQuotas]);

  // Accès pratique : getQuota("image") -> { remaining, quota_limit, ... } | undefined
  const getQuota = useCallback(
    (service) => quotas.find((q) => q.service === service),
    [quotas]
  );

  const isPro = profile?.plan === "pro";
  const isAdmin = profile?.role === "admin";

  async function logout() {
    await authSignOut();
    setProfile(null);
    setQuotas([]);
  }

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    isPro,
    isAdmin,
    quotas,
    getQuota,
    loading,
    refreshProfile,
    refreshQuotas,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp doit être utilisé dans <AppProvider>");
  return ctx;
}
