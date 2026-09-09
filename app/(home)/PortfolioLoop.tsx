"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode, type UIEvent } from "react";
import styles from "./home.module.css";

type PortfolioLoopProps = {
  children: ReactNode;
};

export default function PortfolioLoop({ children }: PortfolioLoopProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const cycleWidthRef = useRef(0);
  // Position de défilement pilotée par l'animation. On l'écrit en absolu dans
  // `scrollLeft` sans jamais relire `scrollLeft` à l'intérieur du rAF : Safari
  // y renvoie une valeur périmée, ce qui fige le `scrollLeft += x`.
  const positionRef = useRef(0);
  const repositioningRef = useRef(false);
  const pausedRef = useRef(false);
  const hoveringRef = useRef(false);
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
    positionRef.current = cycleWidth;

    // Les cycles clonés (0 et 2) restent cliquables et survolables — ils
    // occupent la moitié de la fenêtre pendant la boucle — mais on les sort
    // de l'ordre de tabulation (ils sont déjà `aria-hidden`).
    rail
      .querySelectorAll<HTMLElement>(
        '[data-cycle="0"] a, [data-cycle="0"] button, [data-cycle="2"] a, [data-cycle="2"] button',
      )
      .forEach((element) => {
        element.tabIndex = -1;
      });
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
        !hoveringRef.current &&
        currentTime >= resumeAtRef.current &&
        document.visibilityState === "visible"
      ) {
        pendingDistance += (elapsed / 1000) * 34;
        const wholePixels = Math.floor(pendingDistance);
        if (wholePixels > 0) {
          positionRef.current += wholePixels;
          rail.scrollLeft = positionRef.current;
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

    // Événement de scroll déclenché par l'utilisateur (drag, molette) et non
    // par l'animation : on adopte cette position pour poursuivre la dérive
    // depuis là. Les écritures de l'animation restent, elles, alignées.
    if (Math.abs(rail.scrollLeft - positionRef.current) > 8) {
      positionRef.current = rail.scrollLeft;
    }

    let nextPosition: number | null = null;
    if (rail.scrollLeft < cycleWidth * 0.5) {
      nextPosition = rail.scrollLeft + cycleWidth;
    } else if (rail.scrollLeft > cycleWidth * 1.5) {
      nextPosition = rail.scrollLeft - cycleWidth;
    }

    if (nextPosition === null) return;
    repositioningRef.current = true;
    rail.scrollLeft = nextPosition;
    positionRef.current = nextPosition;
    requestAnimationFrame(() => {
      repositioningRef.current = false;
    });
  };

  return (
    <div
      ref={railRef}
      className={styles.portfolioRail}
      onScroll={keepInsideMiddleCycle}
      onMouseEnter={() => { hoveringRef.current = true; }}
      onMouseLeave={() => {
        hoveringRef.current = false;
        pauseTemporarily(1200);
      }}
      onPointerDown={() => { pausedRef.current = true; }}
      onPointerUp={() => {
        pausedRef.current = false;
        pauseTemporarily();
      }}
      onPointerCancel={() => {
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
        >
          {children}
        </div>
      ))}
    </div>
  );
}
