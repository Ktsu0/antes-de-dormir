import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Dices } from "lucide-react";
import { useStories } from "../contexts/StoryContext";

const FloatingRandomButton = () => {
  const { getRandomStory } = useStories();

  const handleRandomStory = async () => {
    const story = await getRandomStory();
    if (story) {
      alert(`Momento Aleatório:\n\n${story.content}`);
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.08, y: -4 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", damping: 15 }}
      onClick={handleRandomStory}
      className="fixed bottom-10 right-10 z-[60] group flex items-center gap-4 pl-5 pr-8 py-5 bg-slate-950/80 backdrop-blur-2xl border border-indigo-500/30 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_80px_rgba(99,102,241,0.3)] hover:border-indigo-400/50 transition-all"
    >
      <div className="relative">
        <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-transform duration-500">
          <Dices className="w-6 h-6" />
        </div>
        <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-0 group-hover:opacity-40 transition-opacity" />
      </div>
      <div className="text-left">
        <p className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-[0.2em] leading-none mb-1">
          Descobrir
        </p>
        <p className="font-bold text-white uppercase tracking-wider text-sm">
          Relato aleatório
        </p>
      </div>
    </motion.button>
  );
};

export default FloatingRandomButton;
