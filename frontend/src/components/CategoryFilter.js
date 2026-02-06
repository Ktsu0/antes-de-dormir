import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStories } from "../contexts/StoryContext";
import { Filter, X, Sparkles } from "lucide-react";

const CategoryFilter = () => {
  const { categories, filterByCategory } = useStories();
  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState(null);

  const handleFilter = (cat) => {
    if (active === cat) {
      setActive(null);
      filterByCategory(null);
    } else {
      setActive(cat);
      filterByCategory(cat);
    }
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-full border transition-all duration-500 font-medium tracking-tight ${
          active
            ? "glass-morphism border-indigo-500/50 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.25)]"
            : "glass-morphism border-white/5 text-zinc-400 hover:text-white hover:border-white/20"
        }`}
      >
        <Filter className={`w-4 h-4 ${active ? "text-indigo-400" : ""}`} />
        <span>{active || "Filtrar relatos"}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="glass-morphism w-full max-w-2xl rounded-[2.5rem] p-10 relative overflow-hidden"
            >
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">
                        O que você busca?
                      </h3>
                      <p className="text-zinc-500 font-medium">
                        Filtre relatos por sentimento ou tema
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-3 rounded-2xl hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => handleFilter(null)}
                    className={`px-6 py-4 rounded-2xl text-sm font-semibold transition-all border text-left flex items-center justify-between group ${
                      active === null
                        ? "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20"
                        : "bg-white/5 text-zinc-400 border-white/5 hover:border-white/10 hover:text-white"
                    }`}
                  >
                    <span>Todos os Relatos</span>
                    {active === null && (
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    )}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleFilter(cat)}
                      className={`px-6 py-4 rounded-2xl text-sm font-semibold transition-all border text-left flex items-center justify-between group ${
                        active === cat
                          ? "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20"
                          : "bg-white/5 text-zinc-400 border-white/5 hover:border-white/10 hover:text-white hover:bg-white/[0.08]"
                      }`}
                    >
                      <span className="truncate">{cat}</span>
                      {active === cat && (
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CategoryFilter;
