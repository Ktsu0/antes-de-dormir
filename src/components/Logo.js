import React from "react";
import { motion } from "framer-motion";
import logoType from "../logoType.png";

import { useStories } from "../contexts/StoryContext";

const Logo = () => {
  const { openRandomStory } = useStories();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={openRandomStory}
      className="logo-container group cursor-pointer"
      title="Toque para uma surpresa mística..."
    >
      <img src={logoType} alt="Antes de Dormir" className="logo-image" />
    </motion.div>
  );
};

export default Logo;
