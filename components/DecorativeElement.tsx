"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

type Props = {
  src: string;
  alt?: string;
  side: "left" | "right";
  rotate?: number;
  width?: number;
  height?: number;
  className?: string; // allow overrides
};

export default function DecorativeElement({ 
  src, 
  alt = "", 
  side, 
  rotate = 5, 
  width = 240, 
  height = 240,
  className = ""
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);

  // Adjust positioning string based on side
  // ~33% cut off by translate
  const xOffset = side === "right" ? "translate-x-1/3" : "-translate-x-1/3";
  const sideClass = side === "right" ? "right-0" : "left-0";

  return (
    <div 
      ref={ref}
      className={`absolute ${sideClass} ${className} z-0 pointer-events-none select-none`}
      style={{
        width: "clamp(140px, 30vw, " + width + "px)",
        height: "clamp(140px, 30vw, " + height + "px)",
      }}
    >
      <motion.div 
        style={{ y, rotate }}
        className={`relative w-full h-full ${xOffset} will-change-transform motion-reduce:transform-none`}
      >
        <Image 
          src={src}
          alt={alt}
          fill
          className="object-contain"
          sizes={`${width}px`}
          style={{
            filter: "drop-shadow(10px 10px 0px #1a0f0a)"
          }}
        />
      </motion.div>
    </div>
  );
}
