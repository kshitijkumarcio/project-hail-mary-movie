"use client";

import React, { useEffect } from "react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

interface ScrollToButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  targetId: string;
}

const GsapScrollToButton = ({ targetId, children, onClick, ...props }: ScrollToButtonProps) => {
  useEffect(() => {
    gsap.registerPlugin(ScrollToPlugin);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    gsap.to(window, {
      duration: 0.6,
      scrollTo: { y: `#${targetId}`, offsetY: 50 },
      ease: "power3.inOut"
    });
    
    if (onClick) onClick(e);
  };

  return (
    <button onClick={handleClick} className="cursor-pointer" {...props}>
      {children}
    </button>
  );
};

export default GsapScrollToButton;
