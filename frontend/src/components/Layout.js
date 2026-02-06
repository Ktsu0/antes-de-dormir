import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const Layout = ({ children }) => {
  return (
    <div className="relative min-h-screen selection:bg-indigo-500/30">
      {/* Background Layer */}
      <div className="mystical-bg" />
      <div className="mystical-stars" />

      {/* Atmosphere Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Content Area */}
      <div className="relative z-0">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Layout;
