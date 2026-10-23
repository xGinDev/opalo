"use client";

import { useEffect, useRef } from "react";

const LIFETIME_MS = 550;

/** Dots that follow the mouse and fade out. 2D canvas, only active while points are alive. */
export function CursorTrail({ color }: { color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const points: { x: number; y: number; t: number }[] = [];
    let frame = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const now = performance.now();
      while (points.length && now - points[0].t > LIFETIME_MS) points.shift();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of points) {
        const life = 1 - (now - p.t) / LIFETIME_MS;
        ctx.globalAlpha = life * 0.85;
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5 + life * 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      frame = points.length ? requestAnimationFrame(draw) : 0;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      points.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      if (points.length > 60) points.shift();
      if (!frame) frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [color]);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-40 size-full" />;
}
