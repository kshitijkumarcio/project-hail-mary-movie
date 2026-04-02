"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  children: React.ReactNode;
  className?: string;
}

const Modal = ({ children, className }: ModalProps) => {
  const router = useRouter();
  const overlay = useRef<HTMLDivElement>(null);
  const centering = useRef<HTMLDivElement>(null);

  const onDismiss = React.useCallback(() => {
    router.back();
  }, [router]);

  const onClick = React.useCallback(
    (e: React.MouseEvent) => {
      if (
        e.target === overlay.current ||
        e.target === centering.current
      ) {
        if (onDismiss) onDismiss();
      }
    },
    [onDismiss, overlay, centering]
  );

  const onKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    },
    [onDismiss]
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    
    // Lock scroll
    const originalStyles = {
      body: document.body.style.overflow,
      html: document.documentElement.style.overflow,
    };
    
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      // Restore scroll
      document.body.style.overflow = originalStyles.body;
      document.documentElement.style.overflow = originalStyles.html;
    };
  }, [onKeyDown]);

  return (
    <div
      ref={overlay}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 md:p-6"
      onClick={onClick}
    >
      <div ref={centering} className="flex min-h-full items-center justify-center">
        <div
          className={cn(
            "relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-[32px] shadow-2xl animate-in fade-in zoom-in duration-300",
            className
          )}
        >
          <button
            onClick={onDismiss}
            className="absolute right-6 top-6 p-2 rounded-full hover:bg-zinc-100 transition-colors z-10 cursor-pointer"
          >
            <X size={20} className="text-zinc-500" />
          </button>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
