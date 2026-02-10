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
  const [isLiked, setIsLiked] = useState(false);

  const isOwner = user && user.id === story.author_id;

  const getUserName = () => {
    if (story.is_anonymous) return "Anônimo";
    return story.author_name || "Usuário";
  };

  const userName = getUserName();

  const handleLike = () => {
    if (!user) {
      alert("Você precisa estar logado para curtir este relato.");
      return;
    }
    setIsLiked(!isLiked);
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

  return (
    <div className="story-card group">
      <div className="story-card-header">
        <div className="story-author-info">
          <div className="author-avatar-badge">
            {story.is_anonymous ? <User className="w-6 h-6" /> : userName[0]}
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <h3 className="author-name">{userName}</h3>
            <div className="story-meta">
              <span className="story-category-tag">
                Categoria: {story.category_name}
              </span>
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
        <p className="whitespace-pre-line">{story.content}</p>
      </div>

      <div className="story-actions">
        <button
          onClick={handleLike}
          className={`action-btn like-btn ${isLiked ? "active" : ""}`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? "fill-pink-500" : ""}`} />
          <span>{story.likes + (isLiked ? 1 : 0)}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`action-btn comment-btn ${showComments ? "active" : ""}`}
        >
          <MessageCircle className="w-5 h-5" />
          <span>{story.comentarios?.length || 0}</span>
        </button>

        <button className="action-btn share-btn">
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
          >
            <div className="comments-section">
              <div className="space-y-5 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                {story.comentarios?.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className="w-9 h-9 rounded-xl bg-zinc-800/80 flex items-center justify-center flex-shrink-0 text-[10px] border border-white/5 text-zinc-400 font-bold">
                      {comment.id_users?.slice(0, 2).toUpperCase() || "??"}
                    </div>
                    <div className="comment-bubble">
                      <p className="text-zinc-300 leading-relaxed font-light">
                        {comment.content}
                      </p>
                    </div>
                  </div>
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
    </div>
  );
});

export default StoryCard;
