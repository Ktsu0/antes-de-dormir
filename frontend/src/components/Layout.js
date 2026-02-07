import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import MysticalBackground from "./MysticalBackground";

const Layout = ({ children }) => {
  return (
    <div className="relative min-h-screen selection:bg-purple-500/30">
      <MysticalBackground />

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
