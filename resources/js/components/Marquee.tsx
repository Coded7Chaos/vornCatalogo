import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, animate } from "motion/react";

export function Marquee({
  items,
  className = "",
  speed = 40,
}: {
  items: string[];
  className?: string;
  speed?: number;
}) {
  const row = [...items, ...items, ...items];
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const loopWidthRef = useRef(0);

  // Measure one loop's width (1/3 of the full track since we tripled items)
  useEffect(() => {
    const measure = () => {
      if (!trackRef.current) return;
      loopWidthRef.current = trackRef.current.scrollWidth / 3;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Auto-scroll via requestAnimationFrame; pauses while dragging
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!dragging && loopWidthRef.current > 0) {
        let next = x.get() - speed * dt;
        if (next <= -loopWidthRef.current) next += loopWidthRef.current;
        x.set(next);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [dragging, speed, x]);

  // Wrap x into [-loopWidth, 0] range after drag so we never run off the end
  const normalize = () => {
    const w = loopWidthRef.current;
    if (!w) return;
    let v = x.get();
    v = ((v % w) + w) % w; // [0, w)
    v = v - w; // (-w, 0]
    x.set(v);
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden cursor-grab active:cursor-grabbing ${className}`}
    >
      <motion.div
        ref={trackRef}
        className="flex w-max gap-12 whitespace-nowrap touch-pan-y select-none"
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -100000, right: 100000 }}
        dragElastic={0}
        dragMomentum={false}
        onDragStart={() => setDragging(true)}
        onDragEnd={(_, info) => {
          setDragging(false);
          // momentum fling
          animate(x, x.get() + info.velocity.x * 0.3, {
            type: "inertia",
            velocity: info.velocity.x,
            power: 0.5,
            timeConstant: 450,
            onComplete: normalize,
          });
        }}
      >
        {row.map((t, i) => (
          <span
            key={i}
            className="flex items-center gap-12 text-[11px] tracking-[0.4em] uppercase text-neutral-500"
          >
            {t}
            <span className="h-1 w-1 rounded-full bg-neutral-400" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}
