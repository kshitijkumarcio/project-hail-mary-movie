"use client";
import Image from "next/image";
import { images } from "@/constants";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import FlipTextButton from "../ui/flip-text-button";
import { cn } from "@/lib/utils";
import GsapScrollToButton from "../ui/gsap-scroll-to-button";
import Marquee from "../animating-wrappers/text-marquee";

const INITIAL_TIME = 506346; // 0005:20:39:06 in seconds

const formatTime = (totalSeconds: number) => {
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  return `${String(days).padStart(4, "0")}:${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

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
      x: number;
      y: number;
      vx: number;
      vy: number;
      isDarting: boolean;
      dartTimer: number;
      size: number;
      angle: number;
      history: { x: number; y: number; life: number; isDarting: boolean }[] =
        [];

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
            this.vx = 0;
            this.vy = 0;
            this.dartTimer = Math.random() * 600 + 200;
          }
        } else {
          this.x += (Math.random() - 0.5) * 1.5;
          this.y += (Math.random() - 0.5) * 1.5;
        }

        this.history.forEach((h) => {
          h.life -= 0.05;
        });
        this.history = this.history.filter((h) => h.life > 0);
        this.history.push({
          x: this.x,
          y: this.y,
          life: 1,
          isDarting: this.isDarting,
        });

        let didWrap = false;
        if (this.x < -this.size * 2) {
          this.x = w + this.size * 2;
          didWrap = true;
        }
        if (this.x > w + this.size * 2) {
          this.x = -this.size * 2;
          didWrap = true;
        }
        if (this.y < -this.size * 2) {
          this.y = h + this.size * 2;
          didWrap = true;
        }
        if (this.y > h + this.size * 2) {
          this.y = -this.size * 2;
          didWrap = true;
        }

        if (didWrap) {
          this.history = [];
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        if (this.history.length > 1) {
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
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

const ATF = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const ticketDivRef = useRef<HTMLDivElement>(null);

  // Motion values for tracking mouse position
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring values for smooth animation
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  // Transform parameters
  const rotateDepth = 15; // Degrees of rotation
  const translateDepth = 18; // Pixels of translation

  // Transform mouse position to rotation values
  const rotateX = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    [`-${rotateDepth}deg`, `${rotateDepth}deg`],
  );
  const rotateY = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    [`${rotateDepth}deg`, `-${rotateDepth}deg`], // ✅ Fixed mapping (reversed)
  );

  // ✅ Added translation transforms
  const translateX = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    [`-${translateDepth}px`, `${translateDepth}px`],
  );
  const translateY = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    [`${translateDepth}px`, `-${translateDepth}px`],
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ticketDivRef.current) return;

    const rect = ticketDivRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <div className="min-h-[120svh] w-full relative bg-grid-dashed overflow-hidden">
      <AstrophageAnimation />
      {/* ticket design */}
      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-[125%] z-998 aspect-5/1.75 w-[50dvw] perspective-[1000]">
        {/* ticket 1 */}
        <motion.div
          ref={ticketDivRef}
          onPointerEnter={handleMouseEnter}
          onPointerLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          animate={{
            rotate: !isHovered ? "3deg" : "0deg",
            z: isHovered ? 50 : 0, // ✅ Added z-axis movement
          }}
          style={{
            rotateX: isHovered ? rotateX : 0,
            rotateY: isHovered ? rotateY : 0,
            translateX: isHovered ? translateX : 0, // ✅ Added translateX
            translateY: isHovered ? translateY : 0, // ✅ Added translateY
            transformStyle: "preserve-3d",
          }}
          transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
          className="absolute left-1/2 z-778 h-full w-full -translate-x-1/2 overflow-hidden rounded-[8px] shadow-2xl"
        >
          <div className="flex h-full w-full rounded-[8px] overflow-hidden">
            {/* Left section */}
            <div className="h-full w-full max-w-[78%] ">
              <div className="relative h-full w-full">
                <Image
                  src={images.ticketP1}
                  alt="Barcode"
                  placeholder="blur"
                  fill
                  priority
                  unoptimized
                  className="object-cover object-left"
                />
              </div>
            </div>

            {/* Divider with transparent holes */}
            <div
              className="relative flex h-full max-h-[364px] min-w-4 flex-col items-center justify-between bg-black"
              style={{
                maskImage: `
              radial-gradient(circle at 50% 0%, transparent 0, transparent 8px, white 8px),
      radial-gradient(circle at 50% 100%, transparent 0, transparent 8px, white 8px),
      ${Array.from({ length: 36 })
        .map((_, i) => {
          const position = 5 + i * (90 / 35); // distribute 36 holes across 90% height
          return `radial-gradient(circle at 50% ${position}%, transparent 0, transparent 1.5px, white 1.5px)`;
        })
        .join(",\n      ")}
        `,
                WebkitMaskImage: `
        radial-gradient(circle at 50% 0%, transparent 0, transparent 8px, white 4px),
        radial-gradient(circle at 50% 100%, transparent 0, transparent 8px, white 4px),
        ${Array.from({ length: 36 })
          .map((_, i) => {
            const position = 5 + i * (90 / 35);
            return `radial-gradient(circle at 50% ${position}%, transparent 0, transparent 1.5px, white 1.5px)`;
          })
          .join(",\n      ")}
        `,
                maskComposite: "intersect",
                WebkitMaskComposite: "source-in",
              }}
            ></div>

            {/* Right section */}
            <div className="h-full flex w-full max-w-[22%]">
              <div className="relative h-full w-full">
                <Image
                  src={images.ticketP2}
                  fill
                  placeholder="blur"
                  unoptimized
                  alt=""
                  priority
                  sizes="500px"
                  className="object-cover object-center"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ticket 2 */}
        <motion.div
          animate={{
            rotate: !isHovered ? "-6deg" : "0deg",
            z: isHovered ? 25 : 0, // ✅ Added z-axis movement (less than main ticket)
          }}
          style={{
            rotateX: isHovered ? rotateX : 0,
            rotateY: isHovered ? rotateY : 0,
            translateX: isHovered ? translateX : 0, // ✅ Added translateX
            translateY: isHovered ? translateY : 0, // ✅ Added translateY
            transformStyle: "preserve-3d",
          }}
          transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
          className="pointer-events-none shadow-2xl absolute left-1/2 z-777 h-full w-full -translate-x-1/2 overflow-hidden rounded-[8px]"
        >
          <div className="flex h-full w-full rounded-[8px] overflow-hidden">
            <div className="h-full w-full max-w-[78%] bg-[#AAAAAA]"></div>
            <div
              className="relative flex h-full max-h-[364px] min-w-4 flex-col items-center justify-between bg-[#AAAAAA]"
              style={{
                maskImage: `
                radial-gradient(circle at 50% 0%, transparent 0, transparent 8px, black 8px),
        radial-gradient(circle at 50% 100%, transparent 0, transparent 8px, black 8px),
        ${Array.from({ length: 36 })
          .map((_, i) => {
            const position = 5 + i * (90 / 35); // distribute 36 holes across 90% height
            return `radial-gradient(circle at 50% ${position}%, transparent 0, transparent 1.5px, black 1.5px)`;
          })
          .join(",\n        ")}
          `,
                WebkitMaskImage: `
          radial-gradient(circle at 50% 0%, transparent 0, transparent 8px, black 4px),
          radial-gradient(circle at 50% 100%, transparent 0, transparent 8px, black 4px),
          ${Array.from({ length: 36 })
            .map((_, i) => {
              const position = 5 + i * (90 / 35);
              return `radial-gradient(circle at 50% ${position}%, transparent 0, transparent 1.5px, black 1.5px)`;
            })
            .join(",\n        ")}
          `,
                maskComposite: "intersect",
                WebkitMaskComposite: "source-in",
              }}
            ></div>
            <div className="h-full w-full max-w-[22%] bg-[#AAAAAA]"></div>
          </div>
        </motion.div>
      </div>

      {/* border elements */}
      <div className="w-full flex flex-col justify-between h-screen px-6 py-6">
        <div className="flex justify-between">
          <div className="flex-1">
            <p className="text-black font-semibold -translate-y-2 text-[24px] font-mona-sans">
              STRATT VATT
            </p>
          </div>
          <div className="flex-1 flex justify-center">
            <p className="uppercase font-mona-sans text-[12px] font-medium text-black/50">
              Welcome aboard
            </p>
          </div>
          <div className="flex flex-1 flex-col items-end">
            <p className="text-black/50 text-[12px] font-mona-sans ">
              TIME TO ENGINE CUTOFF:{" "}
              <span className="font-semibold">{formatTime(timeLeft)}</span>
            </p>
          </div>
        </div>

        <div className="flex justify-between w-full">
          <div className="gap-10 flex flex-col">
            <p className="text-black/50 animate-pulse text-[12px] font-mona-sans ">
              APPROACHING: <span className="font-semibold">TAU CETI</span>
            </p>
            <p className="text-black text-[12px]  font-mona-sans ">
              <span className="font-semibold">
                (SCROLL DOWN{" "}
                <span className="tracking-[-2px]">--------------</span>&nbsp;)
              </span>
            </p>
          </div>

          <div className="flex flex-col items-end gap-10">
            <p className="text-black/50 animate-pulse text-[12px] font-mona-sans ">
              ASTROPHAGE REMAINING:{" "}
              <span className="font-semibold">20,906 KG</span>
            </p>
            <p className="text-black/50 text-[12px] animate-pulse font-mona-sans ">
              CONSUMPTION RATE: <span className="font-semibold">6.045 G/S</span>
            </p>
          </div>
        </div>
      </div>

      {/* marquee */}
      <div className="absolute top-1/4 translate-y-3 w-full">
        <Marquee speed={0.05} direction={-1} reverse={true}>
          <div className="flex gap-x-10 w-full">
            <p className="text-black whitespace-nowrap font-mona-sans text-[60px]">
              (Amaze <span className="-tracking-[6px]">------</span>)
            </p>
            <p className="text-black whitespace-nowrap font-mona-sans text-[60px]">
              (Amaze <span className="-tracking-[6px]">------</span>)
            </p> <p className="text-black whitespace-nowrap font-mona-sans text-[60px]">
              (Amaze <span className="-tracking-[6px]">------</span>)
            </p> <p className="text-black whitespace-nowrap font-mona-sans text-[60px]">
              (Amaze <span className="-tracking-[6px]">------</span>)
            </p>
            <p className="text-black whitespace-nowrap font-mona-sans text-[60px]">
              (Amaze <span className="-tracking-[6px]">------</span>)
            </p>
            <p className="text-black whitespace-nowrap font-mona-sans text-[60px]">
              (Amaze <span className="-tracking-[6px]">------</span>)
            </p>
            <p className="text-black whitespace-nowrap font-mona-sans text-[60px]">
              (Amaze <span className="-tracking-[6px]">------</span>)
            </p>
            <p className="text-black whitespace-nowrap font-mona-sans text-[60px]">
              (Amaze <span className="-tracking-[6px]">------</span>)
            </p>
          </div>
        </Marquee>
      </div>

      {/* message */}
      <div className="absolute 2xl:top-[64svh] top-[65svh] left-1/2 -translate-x-1/2 flex flex-col justify-center gap-1 items-center">
        <p className="text-[16px] font-mona-sans text-black/60 max-w-[500px] font-medium tracking-wide text-center">
          👋🏼 Hey there! We fellow Swapbookers are going to watch Project Hail
          Mary this weekend. Would you like to join us?
        </p>

        <GsapScrollToButton
          targetId="voting-form"
          type="button"
          className="bg-linear-to-br from-amber-400 via-black to-black cursor-pointer rounded-[8px] h-10 px-6 2xl:mt-11 mt-9 relative"
        >
          <FlipTextButton maxHeight="max-h-10">
            <p
              className={cn(
                "text-white font-mona-sans font-medium text-[14px]",
                "whitespace-nowrap tracking-wide",
              )}
            >
              Yess!&nbsp; Would love to!
            </p>
          </FlipTextButton>
        </GsapScrollToButton>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-20 bg-linear-to-t from-dull-white to-transparent"></div>
    </div>
  );
};

export default ATF;
