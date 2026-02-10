import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { User, LogOut } from "lucide-react";
import Logo from "./Logo";
import { supabase } from "../lib/supabase";

const Header = ({ onOpenCreate }) => {
  const { user, login, logout, signUp } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    setLoading(true);
    try {
      const { error: profileError } = await supabase
        .from("users")
        .upsert({ id_users: user.id, nomeUser: newUsername });

      if (profileError) throw profileError;

      const { error: authError } = await supabase.auth.updateUser({
        data: { nomeUser: newUsername },
      });

      if (authError) throw authError;

      setShowProfileEdit(false);
      alert("Perfil atualizado com sucesso!");
    } catch (error) {
      alert("Erro ao atualizar: " + error.message);
    }
    setLoading(false);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signUp(email, password, { nomeUser: username });
      }
      setShowAuthModal(false);
    } catch (error) {
      if (error.message.includes("rate limit")) {
        alert(
          "Ops! Muitas tentativas em pouco tempo. Por segurança, aguarde alguns minutos antes de tentar novamente ou use o login social.",
        );
      } else if (error.message.includes("Invalid login credentials")) {
        alert("E-mail ou senha incorretos. Verifique seus dados.");
      } else {
        alert("Erro: " + error.message);
      }
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error) {
      alert("Erro Google: " + error.message);
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="header-main"
      >
        <div className="header-container">
          <div className="flex items-center gap-6">
            <Logo />
          </div>

          <div className="header-interactive">
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onOpenCreate}
                    className="btn-primary flex items-center gap-2"
                  >
                    <span>✍️</span> Escrever Fato
                  </motion.button>

                  <div className="relative">
                    <motion.button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="profile-button group"
                    >
                      <div className="profile-avatar">
                        {(
                          user.user_metadata?.nomeUser?.[0] || user.email?.[0]
                        ).toUpperCase()}
                      </div>
                    </motion.button>

                    <AnimatePresence>
                      {showProfileMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="profile-dropdown"
                        >
                          <div className="px-5 py-4 border-b border-white/5">
                            <p className="text-sm font-bold text-white truncate">
                              {user.email}
                            </p>
                          </div>

                          <div className="p-2 space-y-1">
                            <button
                              onClick={() => {
                                setNewUsername(
                                  user.user_metadata?.nomeUser || "",
                                );
                                setShowProfileEdit(true);
                                setShowProfileMenu(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all group"
                            >
                              <User className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                              Editar Perfil
                            </button>
                            <button
                              onClick={() => {
                                logout();
                                setShowProfileMenu(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-400/10 rounded-2xl transition-all group"
                            >
                              <LogOut className="w-4 h-4 text-red-500/50 group-hover:text-red-400 transition-colors" />
                              Sair
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-sm font-bold text-zinc-400 hover:text-white transition"
                >
                  Entrar
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="auth-modal-content"
            >
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-6 right-6 p-2 rounded-2xl hover:bg-white/5 text-zinc-500 transition-colors z-10"
              >
                ✕
              </button>

              <div className="relative z-10 flex flex-col items-center mb-10">
                <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/40 rotate-6 hover:rotate-0 transition-transform duration-500">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight text-center">
                  {isLogin ? "Bem-vindo de volta" : "Inicie sua Jornada"}
                </h2>
                <p className="text-zinc-500 text-sm mt-3 text-center max-w-[280px] font-medium leading-relaxed">
                  Acesse relatos únicos e compartilhe sua história com
                  segurança.
                </p>
              </div>

              <div className="relative z-10 space-y-6">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoogleLogin}
                  className="google-auth-button"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    ></path>
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    ></path>
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    ></path>
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    ></path>
                  </svg>
                  Entrar com Google
                </motion.button>

                <div className="flex items-center gap-4 py-2">
                  <div className="h-px bg-white/5 flex-1"></div>
                  <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                    Ou com Email
                  </span>
                  <div className="h-px bg-white/5 flex-1"></div>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  {!isLogin && (
                    <input
                      type="text"
                      required
                      className="input-mystical h-14 text-sm"
                      placeholder="Como deseja ser chamado?"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  )}
                  <input
                    type="email"
                    required
                    className="input-mystical h-14 text-sm"
                    placeholder="Seu endereço de email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    type="password"
                    required
                    className="input-mystical h-14 text-sm"
                    placeholder="Sua senha secreta"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 rounded-2xl btn-primary text-base font-bold mt-2"
                  >
                    {loading
                      ? "Sincronizando..."
                      : isLogin
                        ? "Entrar"
                        : "Registre-se"}
                  </motion.button>
                </form>

                <div className="mt-4 pt-6 text-center">
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-xs text-zinc-500 hover:text-indigo-400 font-bold tracking-tight transition-colors uppercase gap-2 flex items-center justify-center mx-auto"
                  >
                    {isLogin ? (
                      <>
                        Novo por aqui?{" "}
                        <span className="text-white hover:underline">
                          Cadastre-se
                        </span>
                      </>
                    ) : (
                      <>
                        Já possui uma conta?{" "}
                        <span className="text-white hover:underline">
                          Entrar
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProfileEdit && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileEdit(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white/[0.03] backdrop-blur-[40px] rounded-[3rem] border border-white/10 p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Editar Perfil
              </h3>
              <p className="text-zinc-500 text-sm mb-8">
                Escolha como sua alma será identificada nos relatos públicos.
              </p>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-600 uppercase tracking-widest ml-1">
                    Seu Nome Místico
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={30}
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="input-mystical w-full h-14"
                    placeholder="Ex: Viajante Estelar"
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowProfileEdit(false)}
                    className="flex-1 h-14 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-14 rounded-2xl btn-primary font-bold shadow-lg shadow-indigo-500/20"
                  >
                    {loading ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
