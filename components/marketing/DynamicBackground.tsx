"use client";

import { motion } from "framer-motion";

export function DynamicBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0B0B0F]">
      <motion.div
        animate={{ x: [-20, 20, -20], y: [-10, 30, -10], scale: [1, 1.2, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute -left-[10%] -top-[10%] h-[70vh] w-[70vw] rounded-full bg-[#FFD600] opacity-[0.06] blur-[120px]"
      />
      <motion.div
        animate={{ x: [20, -20, 20], y: [30, -10, 30], scale: [1.2, 1, 1.2] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute -right-[10%] top-[10%] h-[60vh] w-[60vw] rounded-full bg-[#FF4646] opacity-[0.04] blur-[100px]"
      />
      <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
    </div>
  );
}
