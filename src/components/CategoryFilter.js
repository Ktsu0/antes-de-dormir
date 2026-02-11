import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStories } from "../contexts/StoryContext";
import { Filter, Check, Heart } from "lucide-react";

const CategoryFilter = () => {
  const { categories, filterByCategories, filters, toggleLikedFilter } =
    useStories();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const menuRef = useRef(null);

  // Sincroniza estado local com o filtro global ao abrir
  useEffect(() => {
    if (filters.categories) {
      setSelected(filters.categories);
    }
  }, [filters]);

  const toggleCategory = (catId) => {
    setSelected((prev) => {
      if (prev.includes(catId)) {
        return prev.filter((id) => id !== catId);
      } else {
        return [...prev, catId];
      }
    });
  };

  const toggleAll = () => {
    if (selected.length === categories.length) {
      setSelected([]);
    } else {
      setSelected(categories.map((c) => c.id));
    }
  };

  const applyFilters = () => {
    filterByCategories(selected);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        if (isOpen) {
          filterByCategories(selected);
          setIsOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, selected, filterByCategories]);

  return (
    <div className="space-y-6">
      {/* Versão Desktop: Dropdown e Coleção (Lado a Lado ou Stack) */}
      <div className="hidden lg:flex lg:flex-col gap-4">
        <div className="relative z-50 text-left" ref={menuRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 transition-all group w-full relative z-10 ${
              isOpen ? "rounded-t-2xl border-b-transparent" : "rounded-2xl"
            }`}
          >
            <div className="p-2 bg-indigo-500/20 rounded-lg group-hover:scale-110 transition-transform">
              <Filter className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
                Filtros
              </span>
              <span className="text-sm font-medium text-white">
                Tipos de Relatos
              </span>
            </div>
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0.9, y: -10 }}
                animate={{ opacity: 1, scaleY: 1, y: 0 }}
                exit={{ opacity: 0, scaleY: 0.9, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute top-full left-0 w-full bg-slate-950/90 border border-white/10 border-t-0 rounded-b-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-3xl z-0"
                style={{ marginTop: "-1px", originY: 0 }}
              >
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                  <span className="text-sm font-bold text-white tracking-wide">
                    Categorias
                  </span>
                  <button
                    onClick={toggleAll}
                    className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest"
                  >
                    {selected.length === categories.length ? "Limpar" : "Todos"}
                  </button>
                </div>

                <div className="max-h-[320px] overflow-y-auto p-2 space-y-1 no-scrollbar">
                  {categories.map((cat) => {
                    const isSelected = selected.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all duration-300 ${
                          isSelected
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20"
                            : "text-zinc-400 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <span className="font-medium tracking-tight">
                          {cat.name}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-lg border transition-all flex items-center justify-center ${
                            isSelected
                              ? "bg-white border-white"
                              : "border-white/10 bg-white/5"
                          }`}
                        >
                          {isSelected && (
                            <Check className="w-3 h-3 text-indigo-600 stroke-[4px]" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="p-4 bg-zinc-950/20 border-t border-white/5">
                  <button
                    onClick={applyFilters}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <Check className="w-4 h-4" />
                    <span>Aplicar Filtros</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={toggleLikedFilter}
          className={`flex items-center gap-3 px-6 py-4 border transition-all group w-full rounded-2xl ${
            filters.showLiked
              ? "bg-pink-500/10 border-pink-500/50 shadow-[0_0_20px_rgba(236,72,153,0.15)]"
              : "bg-white/5 hover:bg-white/10 border-white/10"
          }`}
        >
          <div
            className={`p-2 rounded-lg transition-transform group-hover:scale-110 ${
              filters.showLiked ? "bg-pink-500/20" : "bg-zinc-500/20"
            }`}
          >
            <Heart
              className={`w-5 h-5 ${filters.showLiked ? "text-pink-400 fill-pink-400/20" : "text-zinc-400"}`}
            />
          </div>
          <div className="flex flex-col items-start">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${filters.showLiked ? "text-pink-300" : "text-zinc-500"}`}
            >
              Sua Coleção
            </span>
            <span className="text-sm font-medium text-white">
              Relatos Salvos
            </span>
          </div>
        </button>
      </div>

      {/* Versão Mobile: Horizontal Scroll de Pills */}
      <div className="lg:hidden w-full flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mask-linear-right">
          <button
            onClick={toggleLikedFilter}
            className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-full border transition-all font-bold text-[10px] uppercase tracking-wider ${
              filters.showLiked
                ? "bg-pink-500 text-white border-pink-400 shadow-lg shadow-pink-500/30"
                : "bg-white/5 border-white/10 text-zinc-400"
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${filters.showLiked ? "fill-white" : ""}`}
            />
            Seus Relatos
          </button>

          <div className="w-px h-6 bg-white/10 flex-shrink-0" />

          {categories.map((cat) => {
            const isSelected = filters.categories?.includes(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => {
                  const newSelected = isSelected
                    ? (filters.categories || []).filter((id) => id !== cat.id)
                    : [...(filters.categories || []), cat.id];
                  filterByCategories(newSelected);
                }}
                className={`flex-shrink-0 px-5 py-3 rounded-full border transition-all font-bold text-[10px] uppercase tracking-wider ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-500/30"
                    : "bg-white/5 border-white/10 text-zinc-400"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;
