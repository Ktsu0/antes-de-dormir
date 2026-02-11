import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useStories } from "../contexts/StoryContext";

const FloatingRandomButton = () => {
  const { openRandomStory } = useStories();

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={openRandomStory}
      className="btn-primary flex items-center gap-3 px-[6vw] lg:px-8 py-[2vh] lg:py-5 rounded-full shadow-2xl pointer-events-auto"
      style={{
        position: "fixed",
        bottom: "5vh",
        right: "5vw",
        zIndex: 9999,
        background: "linear-gradient(135deg, #6366f1, #a855f7)",
        boxShadow: "0 20px 40px -10px rgba(99, 102, 241, 0.5)",
      }}
    >
      <Sparkles className="w-6 h-6" />
      <span className="uppercase tracking-[0.2em] font-black text-[10px] md:text-xs">
        Relato Aleatório
      </span>
    </motion.button>
  );
};

export default FloatingRandomButton;
