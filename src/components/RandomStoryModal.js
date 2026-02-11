import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Heart, MessageCircle, Send } from "lucide-react";
import { useStories } from "../contexts/StoryContext";
import { useAuth } from "../contexts/AuthContext";

const RandomStoryModal = () => {
  const {
    randomStoryModal,
    closeRandomStory,
    openRandomStory,
    likeStory,
    addComment,
  } = useStories();
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);

  if (!randomStoryModal.isOpen || !randomStoryModal.story) return null;

  const { story } = randomStoryModal;

  const handleLike = () => {
    if (!user) {
      alert("Você precisa estar logado para curtir.");
      return;
    }
    likeStory(story.id);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await addComment(story.id, commentText);
      setCommentText("");
      alert("Comentário enviado com sucesso!");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={closeRandomStory}
      >
        <motion.div
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 30, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-slate-900/40 backdrop-blur-[40px] rounded-[3rem] border border-white/10 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden"
        >
          {/* Subtle Glows */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 p-8 md:p-12">
            <div className="flex justify-between items-start mb-10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <Sparkles className="w-7 h-7 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-1">
                    Sorteio Estelar
                  </h2>
                  <p className="text-2xl font-bold text-white tracking-tight">
                    Relato Aleatório
                  </p>
                </div>
              </div>
              <button
                onClick={closeRandomStory}
                className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all group"
              >
                <X className="w-6 h-6 text-zinc-400 group-hover:text-white" />
              </button>
            </div>

            {/* Content Card */}
            <div className="mb-10 p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 relative group shadow-inner">
              <p className="text-xl md:text-2xl text-zinc-100 leading-relaxed font-light italic">
                "{story.content}"
              </p>
              <div className="absolute -left-1 top-10 w-1 h-16 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
            </div>

            {/* Interaction Row */}
            <div className="flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm border border-white/10">
                  {story.author_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                    Autor
                  </p>
                  <p className="text-zinc-200 font-medium">
                    {story.author_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all ${
                    story.isLiked
                      ? "bg-pink-500/10 border-pink-500/20 text-pink-500"
                      : "bg-white/5 border-white/5 text-zinc-400 hover:text-pink-400 hover:border-pink-400/20"
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${story.isLiked ? "fill-pink-500" : ""}`}
                  />
                  <span className="font-bold text-sm">{story.likes || 0}</span>
                </button>

                <button
                  onClick={() => setShowCommentInput(!showCommentInput)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all ${
                    showCommentInput
                      ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                      : "bg-white/5 border-white/5 text-zinc-400 hover:text-indigo-400 hover:border-indigo-400/20"
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-bold text-sm">Comentar</span>
                </button>
              </div>
            </div>

            {/* Comment Input (Expanding) */}
            <AnimatePresence>
              {showCommentInput && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={handleComment}
                  className="mt-6 pt-6 border-t border-white/5 flex gap-3"
                >
                  <input
                    type="text"
                    placeholder="Deixe uma palavra de luz..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="input-mystical h-12 text-sm"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center disabled:opacity-30 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/20"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Footer Cycle Button */}
            <div className="mt-10">
              <button
                onClick={openRandomStory}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-right transition-all duration-500 rounded-2xl text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4" />
                Sortear Outra Estrela
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RandomStoryModal;
