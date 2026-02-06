import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PenTool, Globe, Lock, Check } from "lucide-react";
import { useStories } from "../contexts/StoryContext";

const CreateStoryModal = ({ onClose }) => {
  const { categories, addStory } = useStories();
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content || !category) return;

    setLoading(true);
    try {
      await addStory({ content, category, is_anonymous: isAnonymous });
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
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="glass-panel w-full max-w-2xl rounded-[3rem] p-1 relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]"
      >
        <div className="bg-slate-900/40 rounded-[2.9rem] p-8 md:p-12 relative z-10">
          <div className="flex justify-between items-start mb-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600/20 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                <PenTool className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  Expressar Sentimento
                </h2>
                <p className="text-zinc-500 font-medium">
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

            <div className="space-y-6">
              <label className="text-xs font-bold text-zinc-600 uppercase tracking-[0.2em] ml-2">
                Como você define este momento?
              </label>
              <div className="flex flex-wrap gap-2.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-5 py-3 rounded-2xl text-sm font-bold transition-all border ${
                      category === cat
                        ? "bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-500/20 -translate-y-1"
                        : "bg-white/5 border-white/5 text-zinc-500 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {category === cat && (
                      <Check className="w-3 h-3 inline-block mr-2" />
                    )}
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-6 border-t border-white/5">
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => setIsAnonymous(true)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${isAnonymous ? "text-indigo-400 bg-indigo-500/10 border border-indigo-500/20" : "text-zinc-600 hover:text-zinc-400"}`}
                >
                  <Lock className="w-4 h-4" />
                  <span className="text-sm font-bold uppercase tracking-wider">
                    Anônimo
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAnonymous(false)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${!isAnonymous ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" : "text-zinc-600 hover:text-zinc-400"}`}
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
                disabled={loading || !content || !category}
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
