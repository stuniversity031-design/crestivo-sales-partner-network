import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (u) => {
    if (!u) { setProfile(null); return; }
    const { data } = await supabase
      .from("profiles")
      .select("id,email,full_name,role,partner_id")
      .eq("id", u.id)
      .single();
    setProfile(data || null);
  };

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user || null;
      if (!active) return;
      setUser(u);
      await loadProfile(u);
      if (active) setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user || null;
      setUser(u);
      setTimeout(() => loadProfile(u), 0);
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? "Invalid email or password." : null;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return <Ctx.Provider value={{ user, profile, loading, signIn, signOut }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
