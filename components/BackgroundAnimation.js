"use client";
import { useEffect, useRef, useState } from "react";

/*
 * BackgroundAnimation — subtly cycles through stars → doves → crosses
 * each phase ~60 seconds, with gentle fade transitions between them.
 * Low opacity, calm movement. Must not distract from content.
 */

const STAR_POSITIONS = [
  [8, 12], [18, 5], [32, 18], [45, 8], [58, 22], [72, 6], [85, 14], [94, 9],
  [12, 35], [25, 42], [38, 28], [52, 38], [66, 31], [79, 44], [91, 36],
  [5, 65], [17, 72], [30, 58], [44, 68], [57, 55], [71, 72], [83, 62], [96, 70],
  [10, 88], [23, 82], [37, 92], [50, 85], [63, 90], [76, 78], [89, 88],
];

function StarField() {
  return (
    <svg
      width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0 }}
      aria-hidden="true"
    >
      {STAR_POSITIONS.map(([cx, cy], i) => {
        const r = 0.4 + ((i * 7 + cx) % 3) * 0.25;
        const delay = (i * 0.37) % 5;
        return (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="rgba(255,248,220,0.85)"
            style={{
              animation: `bgTwinkle ${2.5 + (i % 3) * 1.2}s ease-in-out ${delay}s infinite`,
            }}
          />
        );
      })}
    </svg>
  );
}

function DoveField() {
  const doves = [
    { x: 15, y: 20, scale: 0.7, delay: 0 },
    { x: 70, y: 10, scale: 0.5, delay: 0.8 },
    { x: 40, y: 50, scale: 0.6, delay: 1.5 },
    { x: 85, y: 40, scale: 0.55, delay: 0.3 },
    { x: 25, y: 75, scale: 0.65, delay: 2 },
    { x: 60, y: 80, scale: 0.5, delay: 1.2 },
    { x: 10, y: 55, scale: 0.6, delay: 0.6 },
    { x: 90, y: 65, scale: 0.55, delay: 1.8 },
  ];

  return (
    <svg
      width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0 }}
      aria-hidden="true"
    >
      {doves.map(({ x, y, scale, delay }, i) => (
        <g
          key={i}
          transform={`translate(${x}, ${y}) scale(${scale})`}
          style={{
            animation: `bgDrift ${8 + (i % 3) * 2}s ease-in-out ${delay}s infinite`,
          }}
        >
          {/* Simple dove silhouette */}
          <path
            d="M0,0 C-2,-3 -5,-2 -4,1 C-6,0 -7,3 -4,3 C-4,5 -2,6 0,5 C2,6 4,5 4,3 C7,3 6,0 4,1 C5,-2 2,-3 0,0 Z"
            fill="rgba(240,232,213,0.6)"
          />
          {/* Wing */}
          <path
            d="M-4,1 C-7,-1 -8,-3 -5,-2 Z M4,1 C7,-1 8,-3 5,-2 Z"
            fill="rgba(212,160,23,0.35)"
          />
        </g>
      ))}
    </svg>
  );
}

function CrossField() {
  const crosses = [
    { x: 12, y: 15, size: 3, delay: 0 },
    { x: 75, y: 8, size: 2.5, delay: 0.6 },
    { x: 45, y: 35, size: 3.5, delay: 1.2 },
    { x: 88, y: 55, size: 2.5, delay: 0.3 },
    { x: 22, y: 68, size: 3, delay: 1.8 },
    { x: 60, y: 72, size: 2.5, delay: 0.9 },
    { x: 8, y: 45, size: 3, delay: 0.4 },
    { x: 92, y: 25, size: 2.5, delay: 1.4 },
    { x: 35, y: 85, size: 3, delay: 0.7 },
    { x: 68, y: 45, size: 2, delay: 1.1 },
  ];

  return (
    <svg
      width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0 }}
      aria-hidden="true"
    >
      {crosses.map(({ x, y, size, delay }, i) => (
        <g
          key={i}
          transform={`translate(${x}, ${y})`}
          style={{
            animation: `subtlePulse ${3 + (i % 3) * 0.8}s ease-in-out ${delay}s infinite`,
          }}
        >
          <rect x={-size * 0.18} y={-size * 0.5} width={size * 0.36} height={size} rx={size * 0.1} fill="rgba(212,160,23,0.5)" />
          <rect x={-size * 0.5} y={-size * 0.15} width={size} height={size * 0.3} rx={size * 0.1} fill="rgba(212,160,23,0.5)" />
        </g>
      ))}
    </svg>
  );
}

export default function BackgroundAnimation() {
  const [phase, setPhase] = useState(0); // 0=stars, 1=doves, 2=crosses
  const [opacity, setOpacity] = useState({ stars: 1, doves: 0, crosses: 0 });
  const timerRef = useRef(null);

  useEffect(() => {
    // Cycle phases: 60s each with 3s fade overlap
    const PHASE_DURATION = 60000;
    const FADE_DURATION  = 3000;

    let currentPhase = 0;

    function nextPhase() {
      const next = (currentPhase + 1) % 3;

      // Fade in next phase
      if (next === 0) setOpacity({ stars: 1, doves: 0, crosses: 0 });
      if (next === 1) setOpacity({ stars: 0, doves: 1, crosses: 0 });
      if (next === 2) setOpacity({ stars: 0, doves: 0, crosses: 1 });

      currentPhase = next;
      setPhase(next);
    }

    timerRef.current = setInterval(nextPhase, PHASE_DURATION);
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      {/* Stars */}
      <div style={{
        position: "absolute", inset: 0,
        opacity: opacity.stars,
        transition: "opacity 3s ease",
      }}>
        <StarField />
      </div>

      {/* Doves */}
      <div style={{
        position: "absolute", inset: 0,
        opacity: opacity.doves,
        transition: "opacity 3s ease",
      }}>
        <DoveField />
      </div>

      {/* Crosses */}
      <div style={{
        position: "absolute", inset: 0,
        opacity: opacity.crosses,
        transition: "opacity 3s ease",
      }}>
        <CrossField />
      </div>
    </div>
  );
}
