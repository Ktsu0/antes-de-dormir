import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Pencil,
  Check,
  X as XIcon,
  BookOpen,
  Heart,
  Sparkles,
  LogOut,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useStories } from "../contexts/StoryContext";
import { useToast } from "../contexts/ToastContext";
import { getUserInitial } from "../utils/user";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const preview = (text, max = 140) => {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "…" : text;
};

const StorySection = ({
  title,
  emptyText,
  loading,
  items,
  showLikes,
  onItemClick,
}) => (
  <div>
    <h2 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 ml-1">
      {title}
    </h2>
    {loading ? (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    ) : items && items.length > 0 ? (
      <div className="space-y-3 max-h-[480px] overflow-y-auto no-scrollbar pr-1">
        {items.map((s) => (
          <button
            key={s.id_relatos}
            type="button"
            onClick={() => onItemClick(s.id_relatos)}
            className="w-full text-left rounded-2xl p-5 bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.07] transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2 gap-3">
              <span className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-widest truncate">
                {s.nomeCategoria || "Geral"}
              </span>
              {showLikes && (
                <span className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-semibold flex-shrink-0">
                  <Heart className="w-3 h-3" />
                  {s.curtidas?.[0]?.count || 0}
                </span>
              )}
            </div>
            <p className="text-zinc-300 text-sm font-light leading-relaxed">
              {preview(s.descricao)}
            </p>
            {s.created_at && (
              <p className="text-[10px] text-zinc-600 font-medium mt-3">
                {formatDistanceToNow(new Date(s.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </p>
            )}
          </button>
        ))}
      </div>
    ) : (
      <p className="text-center text-zinc-600 text-xs font-medium py-10 rounded-2xl bg-white/[0.02] border border-dashed border-white/5">
        {emptyText}
      </p>
    )}
  </div>
);

const ProfilePage = ({ onBack }) => {
  const { user, logout } = useAuth();
  const { openStory } = useStories();
  const { toast } = useToast();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newUsername, setNewUsername] = useState(
    user?.user_metadata?.nomeUser || "",
  );
  const [savingName, setSavingName] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const [
        storiesCountRes,
        likesGivenRes,
        likesReceivedRes,
        writtenRes,
        likedRes,
      ] = await Promise.all([
        supabase
          .from("relatos")
          .select("*", { count: "exact", head: true })
          .eq("id_users", user.id),
        supabase
          .from("curtidas")
          .select("*", { count: "exact", head: true })
          .eq("id_users", user.id),
        supabase
          .from("curtidas")
          .select("id_relatos, relatos!inner(id_users)", {
            count: "exact",
            head: true,
          })
          .eq("relatos.id_users", user.id),
        supabase
          .from("relatos")
          .select("id_relatos, descricao, nomeCategoria, created_at, curtidas(count)")
          .eq("id_users", user.id)
          .order("id_relatos", { ascending: false }),
        supabase
          .from("curtidas")
          .select("relatos(id_relatos, descricao, nomeCategoria, created_at)")
          .eq("id_users", user.id),
      ]);

      if (cancelled) return;

      const liked = (likedRes.data || [])
        .map((c) => c.relatos)
        .filter(Boolean)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setData({
        storiesCount: storiesCountRes.count || 0,
        likesGiven: likesGivenRes.count || 0,
        likesReceived: likesReceivedRes.count || 0,
        written: writtenRes.data || [],
        liked,
      });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    setSavingName(true);
    try {
      const { error: profileError } = await supabase
        .from("users")
        .upsert({ id_users: user.id, nomeUser: newUsername });
      if (profileError) throw profileError;

      const { error: authError } = await supabase.auth.updateUser({
        data: { nomeUser: newUsername },
      });
      if (authError) throw authError;

      setIsEditingName(false);
      toast("Perfil atualizado com sucesso!", "success");
    } catch (error) {
      toast("Erro ao atualizar: " + error.message, "error");
    }
    setSavingName(false);
  };

  if (!user) return null;

  const initial = getUserInitial(user);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-[1400px] mx-auto px-[5vw] lg:px-[8vw] pt-32 lg:pt-40 pb-24"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white transition-colors mb-10"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar aos relatos
      </button>

      <div className="flex flex-col items-center text-center mb-12">
        <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-[2.5rem] bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold shadow-2xl shadow-indigo-500/30 ring-2 ring-white/10 rotate-3 hover:rotate-0 transition-transform duration-500">
          {initial}
        </div>

        {isEditingName ? (
          <form
            onSubmit={handleSaveName}
            className="flex items-center gap-2 mt-6 w-full max-w-xs"
          >
            <input
              type="text"
              autoFocus
              required
              maxLength={30}
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="input-mystical h-12 text-sm text-center flex-1"
              placeholder="Ex: Viajante Estelar"
            />
            <button
              type="submit"
              disabled={savingName}
              className="w-12 h-12 flex-shrink-0 rounded-xl bg-indigo-600 text-white flex items-center justify-center disabled:opacity-30 hover:scale-105 active:scale-95 transition-all"
              title="Salvar"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setIsEditingName(false)}
              className="w-12 h-12 flex-shrink-0 rounded-xl bg-white/5 text-zinc-400 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all"
              title="Cancelar"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </form>
        ) : (
          <button
            onClick={() => {
              setNewUsername(user.user_metadata?.nomeUser || "");
              setIsEditingName(true);
            }}
            className="flex items-center gap-2.5 mt-6 group"
          >
            <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
              {user.user_metadata?.nomeUser || "Viajante Sem Nome"}
            </h1>
            <Pencil className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
          </button>
        )}

        <p className="text-zinc-500 text-sm mt-2">{user.email}</p>

        {user.created_at && (
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-4">
            Na jornada desde{" "}
            {format(new Date(user.created_at), "d 'de' MMMM 'de' yyyy", {
              locale: ptBR,
            })}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
        <div className="rounded-[1.75rem] p-6 text-center bg-indigo-500/10 border border-indigo-500/20">
          <BookOpen className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
          <p className="text-3xl font-bold text-white leading-none tabular-nums">
            {loading ? "—" : data.storiesCount}
          </p>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-2">
            Relatos Escritos
          </p>
        </div>
        <div className="rounded-[1.75rem] p-6 text-center bg-pink-500/10 border border-pink-500/20">
          <Heart className="w-5 h-5 text-pink-400 mx-auto mb-2" />
          <p className="text-3xl font-bold text-white leading-none tabular-nums">
            {loading ? "—" : data.likesReceived}
          </p>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-2">
            Curtidas Recebidas
          </p>
        </div>
        <div className="rounded-[1.75rem] p-6 text-center bg-purple-500/10 border border-purple-500/20">
          <Sparkles className="w-5 h-5 text-purple-400 mx-auto mb-2" />
          <p className="text-3xl font-bold text-white leading-none tabular-nums">
            {loading ? "—" : data.likesGiven}
          </p>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-2">
            Relatos Curtidos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <StorySection
          title="Seus Relatos"
          emptyText="Você ainda não escreveu nenhum relato."
          loading={loading}
          items={data?.written}
          showLikes
          onItemClick={openStory}
        />
        <StorySection
          title="Relatos que Você Curtiu"
          emptyText="Você ainda não curtiu nenhum relato."
          loading={loading}
          items={data?.liked}
          onItemClick={openStory}
        />
      </div>

      <div className="mt-16 flex justify-center">
        <button
          onClick={() => {
            logout();
            onBack();
          }}
          className="flex items-center gap-3 px-6 py-3 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 font-bold text-sm hover:bg-red-500/10 hover:border-red-500/30 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sair da Conta
        </button>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
