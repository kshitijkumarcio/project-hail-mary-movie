'use client';

import { useRef, useState } from 'react';
import { useMotionValue, useSpring, useTransform, motion } from 'motion/react';

interface Props {
  children: React.ReactNode;
}

const ATFDesktopTicketWrapper = ({ children }: Props) => {
  const [isHovered, setIsHovered] = useState(false);
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
    [`-${rotateDepth}deg`, `${rotateDepth}deg`]
  );
  const rotateY = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    [`${rotateDepth}deg`, `-${rotateDepth}deg`] // ✅ Fixed mapping (reversed)
  );

  // ✅ Added translation transforms
  const translateX = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    [`-${translateDepth}px`, `${translateDepth}px`]
  );
  const translateY = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    [`${translateDepth}px`, `-${translateDepth}px`]
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
    <motion.div
      ref={ticketDivRef}
      onPointerEnter={handleMouseEnter}
      onPointerLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      animate={{
        z: isHovered ? 50 : 0, // ✅ Added z-axis movement
      }}
      style={{
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
        translateX: isHovered ? translateX : 0, // ✅ Added translateX
        translateY: isHovered ? translateY : 0, // ✅ Added translateY
        transformStyle: 'preserve-3d',
      }}
      transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
      className="flex h-full w-full"
    >
      {children}
    </motion.div>
  );
};

export default ATFDesktopTicketWrapper;
