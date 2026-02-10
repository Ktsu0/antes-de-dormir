import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, PenTool, Globe, Lock } from "lucide-react";
import { useStories } from "../contexts/StoryContext";
import { CATEGORIES } from "../data/mockStories";

const CreateStoryModal = ({ onClose }) => {
  const { addStory } = useStories();
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content || !selectedCategory) return;

    setLoading(true);
    try {
      // Find the category ID from Supabase that matches the selected category name
      await addStory({
        content,
        categoryName: selectedCategory,
        is_anonymous: isAnonymous,
      });
      onClose();
    } catch (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="modal-backdrop"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="modal-panel"
      >
        <div className="modal-inner">
          <div className="modal-header">
            <div className="flex items-center gap-5">
              <div className="modal-icon-wrapper">
                <PenTool className="w-8 h-8" />
              </div>
              <div>
                <h2 className="modal-title">Expressar Sentimento</h2>
                <p className="modal-subtitle">
                  Sua história será ouvida com respeito.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-2xl hover:bg-white/5 text-zinc-500 hover:text-white transition-all border border-transparent hover:border-white/5"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-4">
              <label className="text-xs font-bold text-zinc-600 uppercase tracking-[0.2em] ml-2">
                Conte sua história
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="input-mystical min-h-[280px] text-lg leading-relaxed pt-6 no-scrollbar"
                placeholder="Hoje eu percebi que..."
                required
              />
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-zinc-600 uppercase tracking-[0.2em] ml-2">
                Como você define este momento?
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-6 py-4 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl text-white text-base focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer hover:border-white/20"
                required
              >
                <option
                  value=""
                  disabled
                  className="bg-slate-900 text-zinc-400"
                >
                  Selecione uma categoria...
                </option>
                {CATEGORIES.map((categoryName, index) => (
                  <option
                    key={index}
                    value={categoryName}
                    className="bg-slate-900 text-white py-2"
                  >
                    {categoryName}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-footer-actions">
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => setIsAnonymous(true)}
                  className={`privacy-toggle-btn anonymous ${!isAnonymous ? "inactive" : ""}`}
                >
                  <Lock className="w-4 h-4" />
                  <span className="text-sm font-bold uppercase tracking-wider">
                    Anônimo
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAnonymous(false)}
                  className={`privacy-toggle-btn public ${isAnonymous ? "inactive" : ""}`}
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-bold uppercase tracking-wider">
                    Público
                  </span>
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || !content || !selectedCategory}
                className="btn-primary w-full md:w-auto min-w-[200px]"
              >
                {loading ? "Manifestando..." : "Liberar Relato"}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateStoryModal;
