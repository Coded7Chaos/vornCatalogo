import { motion } from "motion/react";

export function Orb({
  className = "",
  size = 320,
  delay = 0,
}: {
  className?: string;
  size?: number;
  delay?: number;
}) {
  return (
    <motion.div
      className={`pointer-events-none absolute rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(220,222,230,0.6) 40%, rgba(180,185,200,0.25) 70%, rgba(120,125,140,0.05) 100%)",
        filter: "blur(40px)",
        mixBlendMode: "multiply",
      }}
      animate={{
        y: [0, -30, 0],
        x: [0, 20, 0],
        scale: [1, 1.08, 1],
      }}
      transition={{
        duration: 14,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

export function GlassSphere({
  className = "",
  size = 140,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <motion.div
      className={`pointer-events-none absolute rounded-full ${className}`}
      style={{ width: size, height: size }}
      animate={{
        rotate: 360,
        y: [0, -12, 0],
      }}
      transition={{
        rotate: { duration: 40, repeat: Infinity, ease: "linear" },
        y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 180deg, #f5f5f7, #d9d9de, #b7b9c1, #e6e6ea, #f5f5f7)",
          filter: "blur(2px)",
        }}
      />
      <div
        className="absolute inset-[6%] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.95), rgba(255,255,255,0.15) 50%, rgba(0,0,0,0.08) 100%)",
          boxShadow:
            "inset -10px -20px 40px rgba(0,0,0,0.12), inset 10px 10px 30px rgba(255,255,255,0.7), 0 20px 50px rgba(80,90,120,0.15)",
          backdropFilter: "blur(10px)",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          top: "15%",
          left: "20%",
          width: "30%",
          height: "22%",
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.9), rgba(255,255,255,0) 70%)",
          filter: "blur(4px)",
        }}
      />
    </motion.div>
  );
}
