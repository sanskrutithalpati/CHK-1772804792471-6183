import React from 'react';
import { motion } from 'motion/react';

interface CareerAvatarProps {
  expression: 'neutral' | 'happy' | 'thinking' | 'speaking';
  size?: number;
}

export const CareerAvatar: React.FC<CareerAvatarProps> = ({ expression, size = 100 }) => {
  const isSpeaking = expression === 'speaking';
  const isThinking = expression === 'thinking';
  const isHappy = expression === 'happy';

  return (
    <motion.div
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center rounded-full bg-indigo-600 shadow-xl"
      animate={{
        scale: isSpeaking ? [1, 1.05, 1] : 1,
      }}
      transition={{
        duration: 0.5,
        repeat: isSpeaking ? Infinity : 0,
        ease: "easeInOut"
      }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full p-4"
      >
        {/* Eyes */}
        <motion.circle
          cx="35"
          cy="40"
          r="5"
          fill="white"
          animate={{
            scaleY: isThinking ? [1, 0.1, 1] : 1,
            translateY: isThinking ? -2 : 0
          }}
          transition={{ duration: 0.2, repeat: isThinking ? Infinity : 0, repeatDelay: 2 }}
        />
        <motion.circle
          cx="65"
          cy="40"
          r="5"
          fill="white"
          animate={{
            scaleY: isThinking ? [1, 0.1, 1] : 1,
            translateY: isThinking ? -2 : 0
          }}
          transition={{ duration: 0.2, repeat: isThinking ? Infinity : 0, repeatDelay: 2.2 }}
        />

        {/* Mouth */}
        {isHappy ? (
          <motion.path
            d="M30 65 C 30 75, 70 75, 70 65"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
          />
        ) : isSpeaking ? (
          <motion.ellipse
            cx="50"
            cy="70"
            rx="10"
            ry="5"
            fill="white"
            animate={{
              ry: [5, 12, 5],
              rx: [10, 12, 10]
            }}
            transition={{ duration: 0.2, repeat: Infinity }}
          />
        ) : isThinking ? (
          <motion.path
            d="M40 70 L 60 70"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            animate={{ x: [-2, 2, -2] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        ) : (
          <motion.path
            d="M35 70 Q 50 65 65 70"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
          />
        )}
      </svg>
      
      {/* Decorative elements */}
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />
    </motion.div>
  );
};
