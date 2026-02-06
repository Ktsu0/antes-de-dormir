import React from "react";
import { motion } from "framer-motion";
import { Moon, Sparkles, Stars } from "lucide-react";

const Logo = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 group cursor-pointer select-none"
    >
      <div className="relative">
        <motion.div
          whileHover={{ rotate: 15, scale: 1.1 }}
          className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 p-3 rounded-2xl shadow-xl shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-500 relative z-10"
        >
          <Moon className="text-white w-7 h-7 fill-white/10" />
        </motion.div>

        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />

        <div className="absolute -top-2 -right-2 z-20">
          <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
        </div>
      </div>

      <div className="flex flex-col">
        <h1 className="text-2xl font-black tracking-tighter leading-none flex items-center">
          <span className="text-white">Antes</span>
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent ml-1">
            de Dormir
          </span>
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <div className="h-px w-4 bg-indigo-500/40"></div>
          <span className="text-[10px] text-zinc-500 font-bold tracking-[0.3em] uppercase">
            Relatos do Universo
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default Logo;
