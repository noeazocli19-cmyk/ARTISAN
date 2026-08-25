"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ArtisanAnimationProps {
  onAnimationComplete?: () => void;
}

export default function ArtisanAnimation({ onAnimationComplete }: ArtisanAnimationProps) {
  const [phase, setPhase] = useState<"walk" | "stop" | "drop" | "open" | "done">("walk");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("stop"), 2200);
    const t2 = setTimeout(() => setPhase("drop"), 3000);
    const t3 = setTimeout(() => setPhase("open"), 3800);
    const t4 = setTimeout(() => setPhase("done"), 4600);
    const t5 = setTimeout(() => onAnimationComplete?.(), 5200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, [onAnimationComplete]);

  const walking = phase === "walk";

  return (
    <div className="relative w-full h-[360px] sm:h-[420px] overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50/30 to-white rounded-2xl border border-orange-100">
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-amber-100/60 to-transparent" />

      {/* ===== ARTISAN CHARACTER ===== */}
      <motion.div
        className="absolute bottom-8 z-10"
        initial={{ x: -200 }}
        animate={{ x: phase === "walk" ? 60 : 60 }}
        transition={{ duration: 2.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <svg width="140" height="220" viewBox="0 0 140 220" fill="none">
          <motion.g
            animate={{ y: walking ? [0, -4, 0] : 0 }}
            transition={{ duration: 0.5, repeat: walking ? Infinity : 0, ease: "easeInOut" }}
          >
            {/* Shadow */}
            <ellipse cx="70" cy="210" rx="35" ry="6" fill="#00000010" />

            {/* Hard hat */}
            <rect x="30" y="2" width="80" height="16" rx="8" fill="#F97316" />
            <rect x="40" y="0" width="60" height="10" rx="5" fill="#FB923C" />
            <rect x="50" y="5" width="40" height="4" rx="2" fill="#FDBA74" />

            {/* Head */}
            <circle cx="70" cy="35" r="22" fill="#FBBF7C" />
            {/* Hair */}
            <path d="M 50 25 Q 55 10 70 12 Q 85 10 90 25" fill="#4A3728" />

            {/* Eyes */}
            <ellipse cx="62" cy="33" rx="3" ry="3.5" fill="#1C1917" />
            <ellipse cx="78" cy="33" rx="3" ry="3.5" fill="#1C1917" />
            <ellipse cx="63" cy="32" rx="1.2" ry="1.2" fill="white" />
            <ellipse cx="79" cy="32" rx="1.2" ry="1.2" fill="white" />
            {/* Eyebrows */}
            <rect x="58" y="27" width="10" height="2.5" rx="1.25" fill="#4A3728" />
            <rect x="74" y="27" width="10" height="2.5" rx="1.25" fill="#4A3728" />
            {/* Smile */}
            <path d="M 60 42 Q 70 50 80 42" stroke="#92400E" strokeWidth="2.5" fill="none" strokeLinecap="round" />

            {/* Neck */}
            <rect x="63" y="55" width="14" height="10" rx="4" fill="#FBBF7C" />

            {/* Body - Orange overalls */}
            <rect x="40" y="65" width="60" height="70" rx="10" fill="#F97316" />
            {/* White shirt */}
            <rect x="50" y="65" width="40" height="25" rx="4" fill="white" />
            {/* Pocket */}
            <rect x="80" y="90" width="12" height="10" rx="2" fill="#EA580C" />
            {/* Overall straps */}
            <rect x="50" y="65" width="6" height="25" rx="2" fill="#EA580C" />
            <rect x="84" y="65" width="6" height="25" rx="2" fill="#EA580C" />
            {/* Buttons on straps */}
            <circle cx="53" cy="75" r="2.5" fill="#FCD34D" />
            <circle cx="87" cy="75" r="2.5" fill="#FCD34D" />

            {/* Left arm */}
            <motion.g
              animate={{ rotate: walking ? [0, -20, 0, 20, 0] : phase === "drop" ? -30 : 0 }}
              transition={{ duration: 1, repeat: walking ? Infinity : 0, ease: "easeInOut" }}
              style={{ originX: "40px", originY: "75px" }}
            >
              <rect x="12" y="68" width="28" height="50" rx="13" fill="#FBBF7C" />
              <rect x="14" y="108" width="24" height="14" rx="6" fill="#7C2D12" />
            </motion.g>

            {/* Right arm - holds bag */}
            <motion.g
              animate={{ rotate: walking ? [0, 15, 0, -15, 0] : phase === "drop" ? 25 : phase === "open" || phase === "done" ? 15 : 5 }}
              transition={{ duration: 1, repeat: walking ? Infinity : 0, ease: "easeInOut" }}
              style={{ originX: "100px", originY: "75px" }}
            >
              <rect x="100" y="68" width="28" height="50" rx="13" fill="#FBBF7C" />
              <rect x="102" y="108" width="24" height="14" rx="6" fill="#7C2D12" />
            </motion.g>

            {/* Left leg */}
            <motion.g
              animate={{ rotate: walking ? [0, 15, 0, -15, 0] : 0 }}
              transition={{ duration: 1, repeat: walking ? Infinity : 0, ease: "easeInOut" }}
              style={{ originX: "55px", originY: "135px" }}
            >
              <rect x="45" y="135" width="22" height="55" rx="8" fill="#F97316" />
              <rect x="42" y="180" width="28" height="16" rx="6" fill="#7C2D12" />
              <rect x="42" y="180" width="28" height="5" rx="2" fill="#92400E" />
            </motion.g>

            {/* Right leg */}
            <motion.g
              animate={{ rotate: walking ? [0, -15, 0, 15, 0] : 0 }}
              transition={{ duration: 1, repeat: walking ? Infinity : 0, ease: "easeInOut" }}
              style={{ originX: "85px", originY: "135px" }}
            >
              <rect x="73" y="135" width="22" height="55" rx="8" fill="#F97316" />
              <rect x="70" y="180" width="28" height="16" rx="6" fill="#7C2D12" />
              <rect x="70" y="180" width="28" height="5" rx="2" fill="#92400E" />
            </motion.g>
          </motion.g>
        </svg>
      </motion.div>

      {/* ===== TOOLBOX BAG ===== */}
      <motion.div
        className="absolute z-10"
        initial={{ x: -260 }}
        animate={{
          x: phase === "walk" ? -20 : 160,
          y: phase === "drop" ? [0, -20, 0] : phase === "open" || phase === "done" ? 0 : -8,
        }}
        transition={{
          x: { duration: 2.2, ease: [0.25, 0.46, 0.45, 0.94] },
          y: { duration: 0.5, ease: "easeOut" },
        }}
        style={{ bottom: "32px" }}
      >
        <svg width="90" height="100" viewBox="0 0 90 100" fill="none">
          {/* Bag body */}
          <rect x="5" y="28" width="80" height="65" rx="10" fill="#92400E" />
          <rect x="5" y="28" width="80" height="14" rx="5" fill="#B45309" />
          {/* Stitching */}
          <line x1="10" y1="50" x2="80" y2="50" stroke="#78350F" strokeWidth="1" strokeDasharray="3 3" />
          {/* Buckle */}
          <rect x="33" y="55" width="24" height="14" rx="3" fill="#FCD34D" />
          <rect x="38" y="58" width="14" height="8" rx="2" fill="#92400E" />
          {/* Handle */}
          <path d="M 25 28 Q 45 4 65 28" stroke="#78350F" strokeWidth="6" fill="none" strokeLinecap="round" />
          {/* Tools peeking out */}
          <rect x="70" y="20" width="4" height="25" rx="2" fill="#78716C" />
          <rect x="78" y="22" width="3" height="20" rx="1.5" fill="#A8A29E" />

          {/* Bag flap - opens */}
          <motion.path
            d="M 5 28 L 5 10 Q 5 3 12 3 L 78 3 Q 85 3 85 10 L 85 28"
            fill="#B45309"
            animate={{
              rotate: phase === "open" || phase === "done" ? -75 : 0,
              y: phase === "open" || phase === "done" ? -10 : 0,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ originX: "5px", originY: "28px" }}
          />

          {/* Sparkles when bag opens */}
          <AnimatePresence>
            {(phase === "open" || phase === "done") && (
              <>
                <motion.circle key="s1" cx="60" cy="12" r="4" fill="#FCD34D"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0, 1.8, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }} />
                <motion.circle key="s2" cx="75" cy="6" r="3" fill="#F97316"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: 0.2 }} />
                <motion.circle key="s3" cx="48" cy="2" r="3.5" fill="#FBBF24"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0, 1.6, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
                <motion.path key="s4" d="M 68 -2 L 70 -8 L 72 -2 L 70 4 Z" fill="#FCD34D"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: 0.1 }} />
                <motion.path key="s5" d="M 82 0 L 84 -5 L 86 0 L 84 5 Z" fill="#F97316"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                  transition={{ duration: 0.7, repeat: Infinity, delay: 0.3 }} />
              </>
            )}
          </AnimatePresence>
        </svg>
      </motion.div>

      {/* ===== Welcome indicator ===== */}
      <AnimatePresence>
        {phase === "done" && (
          <motion.div
            className="absolute bottom-10 left-1/2 z-20"
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="flex items-center gap-3 bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full shadow-xl border border-orange-200"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-orange-500 text-xl">?</span>
              <span className="text-sm font-semibold text-orange-700">Bienvenue ! Remplissez le formulaire</span>
              <span className="text-orange-500 text-xl">?</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Watermark */}
      <motion.div
        className="absolute top-5 right-6 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ delay: 1 }}
      >
        <span className="text-5xl font-bold text-orange-600 tracking-tight">Artisan Connect</span>
      </motion.div>
    </div>
  );
}
