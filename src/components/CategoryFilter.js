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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Versão Desktop: Mantém o Dropdown elegante */}
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
                className="absolute top-full left-0 w-full bg-slate-900 border border-white/10 border-t-0 rounded-b-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-3xl z-0"
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
      <div className="lg:hidden">
        <motion.button
          onClick={() => setIsMobileMenuOpen(true)}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-[5vh] left-[5vw] z-[9999] w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl text-indigo-400"
        >
          <Filter className="w-6 h-6" />
          {filters.categories?.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg border border-white/20">
              {filters.categories.length}
            </span>
          )}
        </motion.button>
        <AnimatePresence>
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-[10000] flex items-end justify-center px-4 pb-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
              />

              <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
              >
                <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
                      Filtros
                    </span>
                    <h3 className="text-lg font-bold text-white">
                      Explore Relatos
                    </h3>
                  </div>
                  <button
                    onClick={toggleAll}
                    className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest px-4 py-2 bg-white/5 rounded-xl border border-white/10"
                  >
                    {selected.length === categories.length ? "Limpar" : "Todos"}
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                  {/* Botão de Curtidos (Padrão Mobile) */}
                  <button
                    onClick={toggleLikedFilter}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                      filters.showLiked
                        ? "bg-pink-500/20 border-pink-500/50 text-white shadow-lg shadow-pink-500/10"
                        : "bg-white/5 border-white/5 text-zinc-400"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${filters.showLiked ? "fill-pink-500 text-pink-500" : ""}`}
                    />
                    <span className="font-bold text-sm">
                      Seus Relatos Salvos
                    </span>
                  </button>

                  <div className="h-px bg-white/5 mx-2" />

                  {/* Lista de Categorias */}
                  <div className="space-y-2">
                    {categories.map((cat) => {
                      const isSelected = selected.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          onClick={() => toggleCategory(cat.id)}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                            isSelected
                              ? "bg-indigo-600/20 border border-indigo-500/50 text-white"
                              : "bg-white/5 border border-transparent text-zinc-500"
                          }`}
                        >
                          <span className="font-medium text-sm">
                            {cat.name}
                          </span>
                          <div
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                              isSelected
                                ? "bg-indigo-500 border-indigo-400"
                                : "border-white/10 bg-white/5"
                            }`}
                          >
                            {isSelected && (
                              <Check className="w-3 h-3 text-white stroke-[4px]" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-6 bg-zinc-950/30 border-t border-white/5">
                  <button
                    onClick={() => {
                      applyFilters();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-indigo-500/20"
                  >
                    Aplicar Filtros
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CategoryFilter;
