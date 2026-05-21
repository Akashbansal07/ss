import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 400);
          return 100;
        }
        return prev + Math.random() * 4 + 1;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [onComplete]);

  const letters = 'SHRI SWASTIK'.split('');

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center"
      exit={{ opacity: 0, transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }}
    >
      {/* Decorative ring */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.12 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="absolute w-64 h-64 rounded-full border border-[#A8751E]"
        style={{ animationName: 'spin-slow', animationDuration: '20s', animationTimingFunction: 'linear', animationIterationCount: 'infinite' }}
      />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.06 }}
        transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
        className="absolute w-96 h-96 rounded-full border border-[#A8751E]"
      />

      <div className="relative z-10 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-[#A8751E] text-[10px] tracking-[0.6em] mb-6"
        >
          EST. 2026
        </motion.p>

        <div className="overflow-hidden mb-2">
          <div className="flex justify-center">
            {letters.map((char, i) => (
              <motion.span
                key={i}
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="font-['Cormorant_Garamond',serif] text-5xl md:text-7xl text-black tracking-widest inline-block"
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-black/40 text-[10px] tracking-[0.5em]"
        >
          LUXURY JEWELLERY
        </motion.p>
      </div>

      {/* Progress */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48">
        <div className="h-[1px] bg-black/10 w-full">
          <motion.div
            className="h-full loading-bar"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-black/30 text-[10px] mt-3 tracking-widest"
        >
          {Math.min(Math.round(progress), 100)}%
        </motion.p>
      </div>
    </motion.div>
  );
}