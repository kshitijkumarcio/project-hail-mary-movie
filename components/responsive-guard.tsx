"use client";

import React, { useEffect, useRef, useState } from "react";
import { Monitor } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useMediaQuery } from "@/hooks/layout-hooks/useMediaQuery";
import { usePathname } from "next/navigation";

export const ResponsiveGuard = ({ children }: { children: React.ReactNode }) => {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [showOverlay, setShowOverlay] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const needsGuard = pathname === "/home" || pathname === "/live-results";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setShowOverlay(!isDesktop && needsGuard);
    }
  }, [isDesktop, mounted, needsGuard]);

  const AstrophageAnimation = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) return;

      const resizeCanvas = () => {
        const parent = canvas.parentElement;
        if (parent) {
          canvas.width = parent.clientWidth;
          canvas.height = parent.clientHeight;
        }
      };
      resizeCanvas();

      const resizeObserver = new ResizeObserver(() => {
        resizeCanvas();
      });
      if (canvas.parentElement) {
        resizeObserver.observe(canvas.parentElement);
      }
      window.addEventListener("resize", resizeCanvas);

      class Particle {
        x: number; y: number; vx: number; vy: number;
        isDarting: boolean; dartTimer: number;
        size: number; angle: number;
        history: { x: number; y: number; life: number; isDarting: boolean }[] = [];

        constructor() {
          this.x = Math.random() * (canvas?.width || window.innerWidth);
          this.y = Math.random() * (canvas?.height || window.innerHeight);
          this.vx = 0;
          this.vy = 0;
          this.isDarting = false;
          this.dartTimer = Math.random() * 400 + 100;
          this.size = 3 + Math.random() * 2;
          this.angle = Math.random() * Math.PI * 2;
        }

        update(w: number, h: number) {
          this.dartTimer--;
          if (this.dartTimer <= 0 && !this.isDarting) {
            this.isDarting = true;
            this.dartTimer = Math.random() * 15 + 10;
            const dartAngle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 15 + 10;
            this.vx = Math.cos(dartAngle) * speed;
            this.vy = Math.sin(dartAngle) * speed;
            this.angle = dartAngle;
          }

          if (this.isDarting) {
            this.x += this.vx;
            this.y += this.vy;
            if (this.dartTimer <= 0) {
              this.isDarting = false;
              this.vx = 0; this.vy = 0;
              this.dartTimer = Math.random() * 600 + 200;
            }
          } else {
            this.x += (Math.random() - 0.5) * 1.5;
            this.y += (Math.random() - 0.5) * 1.5;
          }

          this.history.forEach((h) => { h.life -= 0.05; });
          this.history = this.history.filter((h) => h.life > 0);
          this.history.push({ x: this.x, y: this.y, life: 1, isDarting: this.isDarting });

          let didWrap = false;
          if (this.x < -this.size * 2) { this.x = w + this.size * 2; didWrap = true; }
          if (this.x > w + this.size * 2) { this.x = -this.size * 2; didWrap = true; }
          if (this.y < -this.size * 2) { this.y = h + this.size * 2; didWrap = true; }
          if (this.y > h + this.size * 2) { this.y = -this.size * 2; didWrap = true; }
          if (didWrap) { this.history = []; }
        }

        draw(ctx: CanvasRenderingContext2D) {
          if (this.history.length > 1) {
            ctx.lineCap = "round"; ctx.lineJoin = "round";
            for (let i = 0; i < this.history.length - 1; i++) {
              const h1 = this.history[i];
              const h2 = this.history[i + 1];
              if (!h1.isDarting) continue;
              ctx.beginPath();
              ctx.moveTo(h1.x, h1.y);
              ctx.lineTo(h2.x, h2.y);
              const alpha = Math.max(0, h1.life);
              ctx.strokeStyle = `rgba(255, 215, 0, ${alpha})`;
              ctx.lineWidth = this.size * alpha;
              ctx.stroke();
            }
          }
          ctx.save();
          ctx.translate(this.x, this.y);
          ctx.rotate(this.angle);
          ctx.beginPath();
          const sides = 6;
          for (let i = 0; i < sides; i++) {
            const a = ((Math.PI * 2) / sides) * i;
            const px = this.size * Math.cos(a);
            const py = this.size * Math.sin(a);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fillStyle = this.isDarting ? "#FFD700" : "#8B0000";
          ctx.shadowBlur = 8;
          ctx.shadowColor = this.isDarting ? "#FFD700" : "#8B0000";
          ctx.fill();
          ctx.restore();
        }
      }

      const particles = Array.from({ length: 8 }, () => new Particle());
      let animationId: number;
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p) => {
          p.update(canvas.width, canvas.height);
          p.draw(ctx);
        });
        animationId = requestAnimationFrame(animate);
      };
      animate();

      return () => {
        window.removeEventListener("resize", resizeCanvas);
        resizeObserver.disconnect();
        cancelAnimationFrame(animationId);
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-50"
      />
    );
  };

  if (!mounted) return <>{children}</>;

  return (
    <>
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-9999 flex flex-col items-start justify-center bg-black/95 backdrop-blur-2xl text-white p-6 text-center bg-grid-dashed h-screen w-screen overflow-hidden font-mona-sans"
          >
            <AstrophageAnimation />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="flex flex-col items-start gap-6 md:gap-8 bg-white border-2 border-black rounded-[24px] md:rounded-[32px] p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] md:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] max-w-[90%] md:max-w-xl mx-4 relative z-999"
            >
              <div className="space-y-3 md:space-y-4 w-full text-left">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-black flex items-center gap-1">
                  (Ooops&nbsp;
                  <span className="inline-block -tracking-[6px] -translate-y-px">
                    ---------------
                  </span> )
                </h1>
                <p className="text-zinc-500 font-medium md:text-lg leading-relaxed mt-12">
                  This application is optimized for large displays. Please use a laptop or a desktop.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {!showOverlay && <>{children}</>}
    </>
  );
};
