"use client";

import { useLayoutEffect, useRef, type ReactNode, type UIEvent } from "react";
import styles from "./home.module.css";

type PortfolioLoopProps = {
  children: ReactNode;
};

export default function PortfolioLoop({ children }: PortfolioLoopProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const cycleWidthRef = useRef(0);
  const repositioningRef = useRef(false);

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
