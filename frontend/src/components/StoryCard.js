import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  User,
  Send,
} from "lucide-react";
import { useStories } from "../contexts/StoryContext";
import { useAuth } from "../contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const StoryCard = ({ story }) => {
  const { likeStory, addComment } = useStories();
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isLiked, setIsLiked] = useState(false);

  const getUserName = () => {
    if (story.is_anonymous) return "Anônimo";
    const u = story.users;
    if (Array.isArray(u)) return u[0]?.name || "Usuário";
    return u?.name || "Usuário";
  };

  const userName = getUserName();

  const handleLike = () => {
    setIsLiked(!isLiked);
    likeStory(story.id);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await addComment(story.id, commentText);
      setCommentText("");
    } catch (error) {
      alert(error.message);
    }
  };

  const timeAgo = (dateStr) => {
    try {
      return formatDistanceToNow(new Date(dateStr), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch (e) {
      return "Recentemente";
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="glass-morphism-card rounded-[2rem] p-8 mb-8 group"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-xl shadow-indigo-500/20 ring-1 ring-white/10 overflow-hidden relative group-hover:rotate-3 transition-transform">
            {story.is_anonymous ? <User className="w-6 h-6" /> : userName[0]}
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white tracking-tight leading-none mb-1.5">
              {userName}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-400/80 uppercase tracking-widest">
                {story.category}
              </span>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              <p className="text-xs text-zinc-500 font-medium">
                {timeAgo(story.created_at)}
              </p>
            </div>
          </div>
        </div>
        <button className="text-zinc-500 hover:text-white transition-colors p-2.5 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-8">
        <p className="text-zinc-200 leading-[1.7] whitespace-pre-line text-[1.1rem] font-light tracking-wide selection:bg-indigo-500/40">
          {story.content}
        </p>
      </div>

      <div className="flex items-center gap-4 border-t border-white/5 pt-6">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl transition-all font-semibold text-sm ${
            isLiked
              ? "bg-pink-500/10 text-pink-500 border-pink-500/20"
              : "text-zinc-400 hover:text-pink-400 hover:bg-pink-400/5"
          } border border-transparent`}
        >
          <motion.div
            whileTap={{ scale: 1.4 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-pink-500" : ""}`} />
          </motion.div>
          <span>{story.likes + (isLiked ? 1 : 0)}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl transition-all font-semibold text-sm ${
            showComments
              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
              : "text-zinc-400 hover:text-indigo-400 hover:bg-indigo-400/5"
          } border border-transparent`}
        >
          <MessageCircle className="w-5 h-5" />
          <span>{story.comentarios?.length || 0}</span>
        </button>

        <button className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-zinc-400 hover:text-blue-400 hover:bg-blue-400/5 transition-all ml-auto">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
              <div className="space-y-5 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                {story.comentarios?.map((comment) => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={comment.id}
                    className="flex gap-4 group/comment"
                  >
                    <div className="w-9 h-9 rounded-xl bg-zinc-800/80 flex items-center justify-center flex-shrink-0 text-[10px] border border-white/5 text-zinc-400 font-bold">
                      {comment.user_id?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-none p-4 flex-1 text-sm shadow-sm group-hover/comment:border-indigo-500/20 transition-all">
                      <p className="text-zinc-300 leading-relaxed font-light">
                        {comment.content}
                      </p>
                      <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider mt-3">
                        {timeAgo(comment.created_at)}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {(!story.comentarios || story.comentarios.length === 0) && (
                  <p className="text-center text-zinc-600 text-sm py-8 italic font-light">
                    Seja o primeiro a deixar uma mensagem de apoio.
                  </p>
                )}
              </div>

              {user ? (
                <form
                  onSubmit={handleCommentSubmit}
                  className="flex gap-3 sticky bottom-0 bg-transparent"
                >
                  <input
                    type="text"
                    placeholder="Escreva algo gentil..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="input-mystical h-12"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:grayscale hover:scale-105 active:scale-95"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              ) : (
                <div className="text-center py-5 bg-white/5 rounded-[1.5rem] border border-white/5">
                  <p className="text-zinc-500 text-sm font-medium">
                    Faça login para compartilhar apoio.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StoryCard;
