"use client";

import React, { useEffect, useState } from "react";
import { Monitor } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useMediaQuery } from "@/hooks/layout-hooks/useMediaQuery";

export const ResponsiveGuard = () => {
  const isDesktop = useMediaQuery("(min-width: 1300px)");
  const [showOverlay, setShowOverlay] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setShowOverlay(!isDesktop);
    }
  }, [isDesktop, mounted]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {showOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl text-white p-6 text-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex flex-col items-center max-w-md gap-6"
          >
            <div className="p-6 rounded-full bg-white/5 border border-white/10 mb-2">
              <Monitor size={48} strokeWidth={1.5} className="text-white/80" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Screen Size Not Supported
              </h1>
              <p className="text-white/60 text-lg leading-relaxed">
                This application is optimized for large displays. Please ensure your screen width is at least 1300 pixels to continue.
              </p>
            </div>

            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="h-px w-12 bg-white/20" />
              <p className="text-xs uppercase tracking-[0.2em] text-white/40 font-medium">
                Desktop Experience Required
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

