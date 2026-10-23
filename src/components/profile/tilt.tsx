"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

const MAX_DEG = 8;

/** Rotates its content up to ~8° following the mouse (Figma: "Inclinación 3D"). */
export function Tilt({
  enabled,
  children,
  className,
  wrapperClassName,
}: {
  enabled: boolean;
  children: React.ReactNode;
  className?: string;
  wrapperClassName?: string;
}) {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 150, damping: 18 });
  const springY = useSpring(rotateY, { stiffness: 150, damping: 18 });

  useEffect(() => {
    if (!enabled) {
      rotateX.set(0);
      rotateY.set(0);
      return;
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      rotateY.set(x * MAX_DEG * 2);
      rotateX.set(-y * MAX_DEG * 2);
    };
    const reset = () => {
      rotateX.set(0);
      rotateY.set(0);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", reset);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", reset);
    };
  }, [enabled, rotateX, rotateY]);

  return (
    <div className={cn("[perspective:1100px]", wrapperClassName)}>
      <motion.div className={className} style={{ rotateX: springX, rotateY: springY, transformStyle: "preserve-3d" }}>
        {children}
      </motion.div>
    </div>
  );
}
