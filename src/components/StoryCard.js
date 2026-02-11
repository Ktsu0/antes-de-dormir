import React, { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  MoreHorizontal,
  User,
  Send,
} from "lucide-react";
import { useStories } from "../contexts/StoryContext";
import { useAuth } from "../contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const StoryCard = memo(({ story }) => {
  const { likeStory, addComment, deleteStory } = useStories();
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = story.content.length > 450;
  const displayContent =
    shouldTruncate && !isExpanded
      ? story.content.substring(0, 450) + "..."
      : story.content;

  const isOwner = user && user.id === story.author_id;
  const userName =
    story.author_name || (story.is_anonymous ? "Anônimo" : "Usuário");

  const handleLike = (e) => {
    e.preventDefault();
    if (!user) {
      alert("Você precisa estar logado para curtir este relato.");
      return;
    }
    likeStory(story.id);
  };

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja apagar este relato?")) {
      try {
        await deleteStory(story.id);
      } catch (error) {
        alert("Erro ao apagar: " + error.message);
      }
    }
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
      if (!dateStr) return "Agora";
      return formatDistanceToNow(new Date(dateStr), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch (e) {
      return "Recentemente";
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "Antes de Dormir - Um relato profundo",
      text: `Confira este relato: "${story.content.substring(0, 100)}..."`,
      url: window.location.origin + "?story=" + story.id,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Link copiado para a área de transferência!");
      }
    } catch (err) {
      console.error("Erro ao compartilhar:", err);
    }
  };

  return (
    <div className="story-card group">
      <div className="story-card-header">
        <div className="story-author-info">
          <div className="author-avatar-badge">
            {story.is_anonymous ? (
              <User className="w-6 h-6 text-zinc-500" />
            ) : (
              <span className="text-sm font-bold">{userName[0]}</span>
            )}
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <h3 className="author-name">{userName}</h3>
            <div className="story-meta">
              <span className="story-category-tag">{story.category_name}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-600 text-[10px] lowercase tracking-wide font-medium">
                {timeAgo(story.created_at)}
              </span>
            </div>
          </div>
        </div>

        {isOwner ? (
          <button
            onClick={handleDelete}
            className="text-zinc-500 hover:text-red-400 transition-colors p-2.5 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/10"
            title="Apagar relato"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ) : (
          <button className="text-zinc-500 hover:text-white transition-colors p-2.5 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="story-content-text">
        <p className="whitespace-pre-line leading-relaxed text-zinc-300">
          {displayContent}
        </p>

        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2 group/more"
          >
            <span className="w-4 h-px bg-indigo-500/30 group-hover/more:w-8 transition-all" />
            {isExpanded ? "Recolher Relato" : "Ler Relato Completo"}
          </button>
        )}
      </div>

      <div className="story-actions">
        <button
          onClick={handleLike}
          className={`action-btn like-btn ${story.isLiked ? "active" : ""}`}
        >
          <Heart
            className={`w-5 h-5 ${story.isLiked ? "fill-pink-500 text-pink-500" : ""}`}
          />
          <span>{story.likes}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`action-btn comment-btn ${showComments ? "active" : ""}`}
        >
          <MessageCircle className="w-5 h-5" />
          <span>{story.comentarios?.length || 0}</span>
        </button>

        <button onClick={handleShare} className="action-btn share-btn">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="comments-section">
              <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar pb-4">
                {story.comentarios?.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 text-[10px] border border-white/5 text-zinc-500 font-bold uppercase">
                      {comment.id_users?.slice(0, 2) || "??"}
                    </div>
                    <div className="comment-bubble">
                      <p className="text-zinc-300 text-sm font-light">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
                {(!story.comentarios || story.comentarios.length === 0) && (
                  <p className="text-center text-zinc-600 text-xs py-6 font-light">
                    Sem comentários ainda. Manifeste seu apoio!
                  </p>
                )}
              </div>

              {user ? (
                <form
                  onSubmit={handleCommentSubmit}
                  className="flex flex-col gap-2 pt-2 border-t border-white/5 mt-2"
                >
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Sua mensagem de luz..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      maxLength={600}
                      className="input-mystical h-11 text-sm pr-16"
                    />
                    <span
                      className={`absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold ${commentText.length > 550 ? "text-pink-500" : "text-zinc-600"}`}
                    >
                      {commentText.length}/600
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center gap-2 transition-all disabled:opacity-30 hover:scale-[1.01] active:scale-[0.99] font-bold text-xs uppercase tracking-widest"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Enviar Apoio
                  </button>
                </form>
              ) : (
                <p className="text-center py-4 text-xs text-zinc-500 font-medium">
                  Logue para confortar o próximo.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default StoryCard;
