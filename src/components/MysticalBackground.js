import React, { useState, useEffect, useRef, useCallback } from "react";
import icon1 from "../assets/icon1.png";
import icon2 from "../assets/icon2.png";
import icon3 from "../assets/icon3.png";

const ICONS = [icon1, icon2, icon3];
const ANIMATION_DURATION = 8000; // 8 seconds total
const FADE_DURATION = 2000; // 2 seconds fade in/out
const VISIBLE_DURATION = 4000; // 4 seconds fully visible
const MAX_SIMULTANEOUS = 3; // Maximum 3 icons visible at once

const MysticalBackground = () => {
  const [activeIcons, setActiveIcons] = useState([]);
  const [iconCounter, setIconCounter] = useState(0);
  const animationFrameRef = useRef();

  const generateRandomPosition = useCallback((existingIcons) => {
    const minDistance = 25; // Minimum distance between icons (%)
    let attempts = 0;

    while (attempts < 50) {
      const x = 10 + Math.random() * 80; // 10-90%
      const y = 15 + Math.random() * 75; // 15-90% (avoid header area)

      const validPosition = existingIcons.every((icon) => {
        const dx = x - icon.x;
        const dy = y - icon.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance >= minDistance;
      });

      if (validPosition) return { x, y };
      attempts++;
    }

    return {
      x: 10 + Math.random() * 80,
      y: 15 + Math.random() * 75,
    };
  }, []);

  const createNewIcon = useCallback(
    (counter) => {
      const { x, y } = generateRandomPosition(activeIcons);
      const size = 30 + Math.random() * 30; // 30-60px
      const iconSrc = ICONS[Math.floor(Math.random() * ICONS.length)];

      return {
        id: counter,
        x,
        y,
        size,
        icon: iconSrc,
        createdAt: Date.now(),
        opacity: 0,
      };
    },
    [activeIcons, generateRandomPosition],
  );

  useEffect(() => {
    // Initialize with 3 icons
    const initialIcons = [];
    for (let i = 0; i < MAX_SIMULTANEOUS; i++) {
      const { x, y } = generateRandomPosition(initialIcons);
      const size = 30 + Math.random() * 30;
      const iconSrc = ICONS[Math.floor(Math.random() * ICONS.length)];

      initialIcons.push({
        id: i,
        x,
        y,
        size,
        icon: iconSrc,
        createdAt: Date.now() + i * (ANIMATION_DURATION / MAX_SIMULTANEOUS),
        opacity: 0,
      });
    }
    setActiveIcons(initialIcons);
    setIconCounter(MAX_SIMULTANEOUS);
  }, [generateRandomPosition]);

  // Smooth opacity animation loop
  useEffect(() => {
    const updateOpacity = () => {
      const now = Date.now();

      setActiveIcons((prevIcons) => {
        return prevIcons.map((icon) => {
          const age = now - icon.createdAt;
          let newOpacity = 0;

          if (age < FADE_DURATION) {
            // Fading in
            newOpacity = (age / FADE_DURATION) * 0.5;
          } else if (age < FADE_DURATION + VISIBLE_DURATION) {
            // Fully visible
            newOpacity = 0.5;
          } else if (age < ANIMATION_DURATION) {
            // Fading out
            const fadeOutProgress =
              (age - FADE_DURATION - VISIBLE_DURATION) / FADE_DURATION;
            newOpacity = 0.5 * (1 - fadeOutProgress);
          }

          return { ...icon, opacity: newOpacity };
        });
      });

      animationFrameRef.current = requestAnimationFrame(updateOpacity);
    };

    animationFrameRef.current = requestAnimationFrame(updateOpacity);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Icon lifecycle management
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      setActiveIcons((prevIcons) => {
        // Remove icons that have completed their animation
        const remainingIcons = prevIcons.filter((icon) => {
          const age = now - icon.createdAt;
          return age < ANIMATION_DURATION;
        });

        // Add new icon if we have less than MAX_SIMULTANEOUS
        if (remainingIcons.length < MAX_SIMULTANEOUS) {
          const newIcon = createNewIcon(iconCounter);
          setIconCounter((prev) => prev + 1);
          return [...remainingIcons, newIcon];
        }

        return remainingIcons;
      });
    }, ANIMATION_DURATION / MAX_SIMULTANEOUS); // Check every ~2.6 seconds

    return () => clearInterval(interval);
  }, [iconCounter, createNewIcon]);

  return (
    <>
      <div className="fixed inset-0 z-[-10] overflow-hidden bg-gradient-to-b from-[#0a0118] via-[#1a0b2e] to-[#16213e]">
        {/* Mystical gradient orbs */}
        <div
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: "10s", animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-violet-800/10 rounded-full blur-[100px] animate-pulse"
          style={{ animationDuration: "12s", animationDelay: "4s" }}
        />

        {/* Dynamically rotating icons with smooth transitions */}
        {activeIcons.map((item) => (
          <div
            key={item.id}
            className="absolute pointer-events-none"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              opacity: item.opacity,
              transition: "opacity 0.1s linear",
            }}
          >
            <img
              src={item.icon}
              alt=""
              style={{
                width: `${item.size}px`,
                height: `${item.size}px`,
                filter: "drop-shadow(0 0 15px rgba(139, 92, 246, 0.3))",
              }}
            />
          </div>
        ))}

        {/* Subtle stars */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
                 radial-gradient(1px 1px at 20% 30%, white, transparent),
                 radial-gradient(1px 1px at 60% 70%, white, transparent),
                 radial-gradient(1px 1px at 50% 50%, white, transparent),
                 radial-gradient(1px 1px at 80% 10%, white, transparent),
                 radial-gradient(1px 1px at 90% 60%, white, transparent),
                 radial-gradient(2px 2px at 33% 50%, #a78bfa, transparent),
                 radial-gradient(2px 2px at 75% 25%, #c084fc, transparent)
               `,
            backgroundSize:
              "200px 200px, 250px 250px, 300px 300px, 200px 200px, 250px 250px, 350px 350px, 400px 400px",
            backgroundPosition:
              "0 0, 40px 60px, 130px 270px, 70px 100px, 150px 200px, 200px 100px, 250px 250px",
          }}
        />
      </div>
    </>
  );
};

export default MysticalBackground;
