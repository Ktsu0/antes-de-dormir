import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

const PANEL_SPRING = { type: "spring", damping: 30, stiffness: 300 };

// Base para todo modal de tela cheia (backdrop + painel), com Esc para
// fechar e focus trap. Cada chamador só cuida do próprio conteúdo e do
// visual do painel/backdrop.
const Modal = ({
  onClose,
  children,
  panelClassName,
  backdropClassName = "modal-backdrop",
  wrapperClassName = "fixed inset-0 z-[100] flex items-center justify-center p-4",
}) => {
  const panelRef = useRef(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    panelRef.current?.querySelector(FOCUSABLE_SELECTOR)?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const items = panelRef.current?.querySelectorAll(FOCUSABLE_SELECTOR);
      if (!items || items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [onClose]);

  return (
    <div className={wrapperClassName}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className={backdropClassName}
      />

      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={PANEL_SPRING}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        className={panelClassName}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default Modal;
