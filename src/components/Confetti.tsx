'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiProps {
  active: boolean;
  onComplete?: () => void;
}

export default function Confetti({ active, onComplete }: ConfettiProps) {
  const [pieces, setPieces] = useState<Array<{ id: number; x: number; y: number; color: string; size: number; rotation: number; duration: number }>>([]);

  useEffect(() => {
    if (active) {
      const colors = ['#FF6B6B', '#4ECDC4', '#A78BFA', '#FFB74D', '#66BB6A', '#EC407A', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6B9D'];
      const newPieces = Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100 - 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 10,
        rotation: Math.random() * 360,
        duration: 1.5 + Math.random() * 2,
      }));
      setPieces(newPieces);
      setTimeout(() => {
        setPieces([]);
        if (onComplete) onComplete();
      }, 3000);
    }
  }, [active, onComplete]);

  return (
    <AnimatePresence>
      {active && pieces.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              className="absolute rounded-full"
              style={{
                width: piece.size,
                height: piece.size,
                backgroundColor: piece.color,
                left: `${piece.x}%`,
                top: `${piece.y}%`,
                boxShadow: `0 0 10px ${piece.color}80`,
              }}
              initial={{ y: 0, opacity: 1, rotate: 0 }}
              animate={{
                y: [0, -window.innerHeight * 0.6, window.innerHeight * 0.8],
                x: [0, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200],
                opacity: [1, 1, 0],
                rotate: [0, piece.rotation, piece.rotation * 2],
              }}
              transition={{
                duration: piece.duration,
                ease: 'easeOut',
              }}
              exit={{ opacity: 0 }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}