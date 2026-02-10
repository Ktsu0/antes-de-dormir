import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useStories } from "../contexts/StoryContext";

const FloatingRandomButton = ({ className, style }) => {
  const { getRandomStory } = useStories();
  const [showModal, setShowModal] = useState(false);
  const [randomStory, setRandomStory] = useState(null);

  const handleRandomStory = async () => {
    const story = await getRandomStory();
    if (story) {
      setRandomStory(story);
      setShowModal(true);
    }
  };

  return (
    <>
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleRandomStory}
        className={
          className || "fixed bottom-10 right-10 z-[100] btn-primary shadow-2xl"
        }
        style={{
          position: "fixed",
          bottom: "2.5rem",
          right: "2.5rem",
          zIndex: 9999,
          ...style,
        }}
      >
        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        <span className="uppercase tracking-wider font-bold text-sm">
          Relato Aleatório
        </span>
      </motion.button>

      <AnimatePresence>
        {showModal && randomStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-white/[0.03] backdrop-blur-[40px] rounded-[3rem] border border-white/10 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden"
            >
              {/* Mystical glow accents */}
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-[100px]" />
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600/15 rounded-full blur-[100px]" />

              {/* Close button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-8 right-8 z-50 w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all group backdrop-blur-xl"
              >
                <X className="w-5 h-5 text-zinc-400 group-hover:text-white transition-all" />
              </button>

              {/* Content Container */}
              <div className="relative z-10 p-12">
                <div className="flex items-center gap-4 mb-12">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                    <Sparkles className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-[10px] font-black text-indigo-400/80 uppercase tracking-[0.4em] mb-0.5">
                      Sorteio Estelar
                    </h2>
                    <p className="text-xl font-bold text-white tracking-tight">
                      Relato Aleatório
                    </p>
                  </div>
                </div>

                <div className="mb-10">
                  <div className="inline-flex items-center px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                    {randomStory.category_name}
                  </div>
                </div>

                {/* Bubble-style content (Matching comment-bubble theme) */}
                <div className="mb-12 p-8 rounded-[2rem] bg-white/5 border border-white/5 relative group/content shadow-inner">
                  <p className="text-2xl text-zinc-100 leading-relaxed font-light italic">
                    "{randomStory.content}"
                  </p>
                  <div className="absolute -left-2 top-8 w-1 h-12 bg-indigo-500/50 rounded-full blur-[2px]" />
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-white/5 flex items-center justify-center text-sm font-bold text-zinc-300">
                      {randomStory.author_name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5">
                        Autor
                      </p>
                      <p className="text-base text-zinc-200 font-medium italic">
                        {randomStory.author_name}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleRandomStory}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Outro Relato</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingRandomButton;
