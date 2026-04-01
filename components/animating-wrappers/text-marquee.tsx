'use client';
import { useMediaQuery } from '@/hooks/layout-hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import gsap from 'gsap';
import { useEffect, useRef } from 'react';

const Marquee = ({
  children,
  speed,
  startTriggerDesktop,
  startTriggerMobile,
  endTriggerDesktop,
  endTriggerMobile,
  movementDesktop = '+=300px',
  movementMobile = '+=500px',
  reverse = true,
  direction = -1, // -1 for left, 1 for right
}: {
  children: React.ReactNode;
  speed: number;
  startTriggerDesktop?: number | string;
  startTriggerMobile?: number | string;
  endTriggerDesktop?: number | string;
  endTriggerMobile?: number | string;
  movementDesktop?: string;
  movementMobile?: string;
  reverse?: boolean;
  direction?: 1 | -1;
}) => {
  const isMobile = useMediaQuery('(max-width: 881px)');

  const div1 = useRef<HTMLDivElement | null>(null);
  const div2 = useRef<HTMLDivElement | null>(null);
  const slider = useRef<HTMLDivElement | null>(null);

  // Track the current scroll direction (for reverse functionality)
  const scrollDirection = useRef<1 | -1>(1);
  let xPercent = 0;

  const speedDesktop = speed;
  const speedMobile = speed * 4;

  useEffect(() => {
    // Determine triggers based on screen size
    let startTrigger: number | string;
    let endTrigger: number | string;

    if (isMobile === true) {
      startTrigger = startTriggerMobile ?? 0;
      endTrigger = endTriggerMobile ?? '100%';
    } else if (isMobile === false) {
      startTrigger = startTriggerDesktop ?? 0;
      endTrigger = endTriggerDesktop ?? '100%';
    } else {
      // Handle loading state - use default values or return early from useEffect
      return;
    }

    if (slider.current) {
      gsap.to(slider.current, {
        scrollTrigger: {
          trigger: document.documentElement,
          start: startTrigger,
          end: endTrigger,
          scrub: 0.25,
          onUpdate: (self) => {
            // Only track scroll direction if reverse is enabled
            if (reverse) {
              scrollDirection.current = self.direction as 1 | -1;
            }
          },
        },
        x: isMobile ? movementMobile : movementDesktop,
      });
    }

    requestAnimationFrame(animation);
  }, [
    reverse,
    direction,
    startTriggerDesktop,
    endTriggerDesktop,
    startTriggerMobile,
    endTriggerMobile,
    movementDesktop,
    movementMobile,
  ]);

  const animation = () => {
    if (div1.current && div2.current) {
      // Reset position when one of the divs is completely off-screen
      if (xPercent <= -100) {
        xPercent = 0;
      }
      if (xPercent > 0) {
        xPercent = -100;
      }

      gsap.set(div1.current, { xPercent });
      gsap.set(div2.current, { xPercent });

      // Determine the current movement direction:
      // - If reverse is true: use scroll direction (opposite of scroll)
      // - If reverse is false: always use the initial direction prop
      let currentDirection: 1 | -1;

      if (reverse) {
        // Reverse the scroll direction (scroll down = marquee goes opposite)
        currentDirection = (scrollDirection.current * -1) as 1 | -1;
        // Then apply the initial direction preference
        currentDirection = (currentDirection * direction) as 1 | -1;
      } else {
        // Just use the initial direction, ignore scroll
        currentDirection = direction;
      }

      xPercent += isMobile ? speedMobile * currentDirection : speedDesktop * currentDirection;

      requestAnimationFrame(animation);
    }
  };

  return (
    <div ref={slider} className={cn('group relative flex w-full')}>
      <div ref={div1}>{children}</div>
      <div ref={div2}>{children}</div>
    </div>
  );
};

export default Marquee;
