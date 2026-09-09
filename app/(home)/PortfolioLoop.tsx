"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode, type UIEvent } from "react";
import styles from "./home.module.css";

type PortfolioLoopProps = {
  children: ReactNode;
};

export default function PortfolioLoop({ children }: PortfolioLoopProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const cycleWidthRef = useRef(0);
  const repositioningRef = useRef(false);
  const pausedRef = useRef(false);
  const resumeAtRef = useRef(0);

  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const first = rail.querySelector<HTMLElement>('[data-cycle="0"] > *');
    const second = rail.querySelector<HTMLElement>('[data-cycle="1"] > *');
    if (!first || !second) return;

    const cycleWidth = second.offsetLeft - first.offsetLeft;
    if (cycleWidth <= 0) return;

    cycleWidthRef.current = cycleWidth;
    rail.scrollLeft = cycleWidth;
  }, [children]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let animationFrame = 0;
    let previousTime = performance.now();
    let pendingDistance = 0;

    const animate = (currentTime: number) => {
      const elapsed = Math.min(currentTime - previousTime, 50);
      previousTime = currentTime;

      if (
        !pausedRef.current &&
        currentTime >= resumeAtRef.current &&
        document.visibilityState === "visible"
      ) {
        pendingDistance += (elapsed / 1000) * 18;
        const wholePixels = Math.floor(pendingDistance);
        if (wholePixels > 0) {
          rail.scrollLeft += wholePixels;
          pendingDistance -= wholePixels;
        }
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const pauseTemporarily = (delay = 4000) => {
    resumeAtRef.current = performance.now() + delay;
  };

  const keepInsideMiddleCycle = (event: UIEvent<HTMLDivElement>) => {
    if (repositioningRef.current) return;

    const rail = event.currentTarget;
    const cycleWidth = cycleWidthRef.current;
    if (!cycleWidth) return;

    let nextPosition: number | null = null;
    if (rail.scrollLeft < cycleWidth * 0.5) {
      nextPosition = rail.scrollLeft + cycleWidth;
    } else if (rail.scrollLeft > cycleWidth * 1.5) {
      nextPosition = rail.scrollLeft - cycleWidth;
    }

    if (nextPosition === null) return;
    repositioningRef.current = true;
    rail.scrollLeft = nextPosition;
    requestAnimationFrame(() => {
      repositioningRef.current = false;
    });
  };

  return (
    <div
      ref={railRef}
      className={styles.portfolioRail}
      onScroll={keepInsideMiddleCycle}
      onPointerDown={() => { pausedRef.current = true; }}
      onPointerUp={() => {
        pausedRef.current = false;
        pauseTemporarily();
      }}
      onWheel={() => pauseTemporarily()}
      onKeyDown={() => pauseTemporarily()}
      onFocus={() => { pausedRef.current = true; }}
      onBlur={() => {
        pausedRef.current = false;
        pauseTemporarily();
      }}
    >
      {[0, 1, 2].map((cycle) => (
        <div
          key={cycle}
          data-cycle={cycle}
          className={styles.portfolioCycle}
          aria-hidden={cycle === 1 ? undefined : true}
          inert={cycle === 1 ? undefined : true}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
