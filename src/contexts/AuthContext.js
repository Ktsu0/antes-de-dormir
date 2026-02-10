import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // Se temos um usuário mas ele não está na nossa tabela 'users', tentamos cadastrar
      if (currentUser) {
        ensureProfileExists(currentUser);
      }

      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        ensureProfileExists(currentUser);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Função auxiliar para garantir que o usuário tenha um perfil na tabela pública
  const ensureProfileExists = async (user) => {
    const { data: profile } = await supabase
      .from("users")
      .select("id_users")
      .eq("id_users", user.id)
      .maybeSingle();

    if (!profile) {
      await supabase.from("users").insert([
        {
          id_users: user.id,
          nomeUser:
            user.user_metadata?.nomeUser ||
            user.user_metadata?.full_name ||
            user.email.split("@")[0],
        },
      ]);
    }
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signUp = async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) throw error;

    if (data?.user) {
      await ensureProfileExists(data.user);
    }

    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    login,
    signUp,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
