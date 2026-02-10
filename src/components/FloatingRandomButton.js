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
              className="relative w-full max-w-2xl bg-gradient-to-br from-purple-900/95 via-indigo-900/95 to-slate-900/95 backdrop-blur-xl rounded-3xl border border-purple-500/30 shadow-2xl overflow-hidden"
            >
              {/* Decorative glows */}
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl" />

              {/* Close button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all group cursor-pointer"
              >
                <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform" />
              </button>

              {/* Content */}
              <div className="relative z-10 p-10">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-6 h-6 text-purple-300" />
                  <h2 className="text-2xl font-bold text-white uppercase tracking-wide">
                    Relato Aleatório
                  </h2>
                </div>

                <div className="mb-6">
                  <span className="inline-block category-pill category-pill-active mb-4">
                    {randomStory.category_name}
                  </span>
                </div>

                <p className="text-xl text-white/90 leading-relaxed mb-8 font-light">
                  {randomStory.content}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <p className="text-sm text-zinc-400">
                    Por:{" "}
                    <span className="text-purple-300 font-semibold">
                      {randomStory.author_name}
                    </span>
                  </p>
                  <button
                    onClick={handleRandomStory}
                    className="btn-glass group"
                  >
                    <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    Outro Relato
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
