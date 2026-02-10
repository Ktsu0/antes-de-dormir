import React from "react";
import { motion } from "framer-motion";
import logoType from "../logoType.png";

const Logo = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.05 }}
      className="logo-container group"
    >
      <img src={logoType} alt="Antes de Dormir" className="logo-image" />
    </motion.div>
  );
};

export default Logo;
