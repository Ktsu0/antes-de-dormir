import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStories } from "../contexts/StoryContext";
import StoryCard from "./StoryCard";
import { Loader2, Moon, Sparkles } from "lucide-react";

const StoryList = () => {
  const { stories, loading } = useStories();

  if (loading && stories.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center py-32 gap-6">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          <Moon className="w-6 h-6 text-indigo-300 absolute inset-0 m-auto animate-pulse" />
        </div>
        <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs animate-pulse">
          Sincronizando com o universo...
        </p>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-32 px-10 glass-morphism-card rounded-[3rem] border-dashed border-white/10"
      >
        <Sparkles className="w-12 h-12 text-zinc-700 mx-auto mb-6" />
        <h3 className="text-xl font-bold text-white mb-2">Silêncio Absoluto</h3>
        <p className="text-zinc-500 font-medium leading-relaxed">
          Nenhum relato ecoou nesta categoria ainda. <br /> Seja o primeiro a
          quebrar o silêncio.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {stories.map((story, index) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.5 }}
          >
            <StoryCard story={story} />
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="text-center py-16">
        <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent w-full mb-8"></div>
        <p className="text-zinc-600 font-bold uppercase tracking-[0.3em] text-[10px]">
          Fim da Transmissão
        </p>
      </div>
    </div>
  );
};

export default StoryList;
