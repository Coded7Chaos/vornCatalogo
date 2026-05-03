import { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
  type PanInfo,
} from "motion/react";
import { Plus, Check } from "lucide-react";
import type { Look } from "./LookViewer";
import { useCart } from "../cart/CartStore";
import { toast } from "sonner";

export function LookSection({
  look,
  index,
  total,
}: {
  look: Look;
  index: number;
  total: number;
}) {
  const { addItem } = useCart();
  const [colorIdx, setColorIdx] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [hDir, setHDir] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [isAdded, setIsAdded] = useState(false);
  const [showSizeError, setShowSizeError] = useState(false);
  
  const variant = look.variants[colorIdx] || { name: "", color: "#000", images: [], sizes: [] };
  const image = (variant.images && variant.images.length > 0) ? (variant.images[imgIdx] ?? variant.images[0]) : null;

  useEffect(() => {
    setSelectedSize("");
  }, [colorIdx, look]);

  const handleAddToCart = () => {
    if (!selectedSize && variant.sizes?.length > 0) {
      setShowSizeError(true);
      setTimeout(() => setShowSizeError(false), 2000);
      toast.error("Por favor, selecciona una talla para continuar", {
        position: "top-center",
        duration: 2000,
      });
      return;
    }
    
    addItem({
      id: look.id,
      name: look.name,
      price: look.price,
      color: variant.color,
      colorName: variant.name,
      image: image || "",
      size: selectedSize,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const dragX = useMotionValue(0);
  const bgX = useTransform(dragX, [-400, 400], [30, -30]);
  const titleX = useTransform(dragX, [-400, 400], [60, -60]);
  const prevHint = useTransform(dragX, [0, 120], [0, 1]);
  const nextHint = useTransform(dragX, [-120, 0], [1, 0]);

  const goImage = (n: number) => {
    if (!variant.images || variant.images.length === 0) return;
    setHDir(n > 0 ? 1 : -1);
    setImgIdx((i) => (i + n + variant.images.length) % variant.images.length);
  };

  const pickColor = (i: number) => {
    if (i === colorIdx) return;
    setColorIdx(i);
    const newLen = look.variants[i]?.images?.length || 0;
    if (imgIdx >= newLen) setImgIdx(0);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const tx = info.offset.x + info.velocity.x * 0.18;
    if (Math.abs(tx) > 70) {
      if (tx < 0) goImage(1);
      else goImage(-1);
    }
    animate(dragX, 0, { type: "spring", stiffness: 220, damping: 28 });
  };

  return (
    <section
      className="relative flex w-full flex-col items-stretch px-4 pb-5 md:px-6 md:pb-10"
      style={{
        scrollSnapAlign: "start",
        scrollSnapStop: "always",
        minHeight: "100svh",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 80px)",
      }}
    >
      {/* Ghost title */}
      <motion.h1
        initial={{ opacity: 0, y: 30, filter: "blur(20px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: false, amount: 0.4 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{
          x: titleX,
          fontSize: "clamp(60px, 22vw, 260px)",
          fontWeight: 700,
          letterSpacing: "-0.08em",
          lineHeight: 1,
          color: "rgba(20,20,30,0.05)",
        }}
        className="pointer-events-none absolute left-1/2 top-[18%] -translate-x-1/2 whitespace-nowrap text-center md:top-[12%]"
      >
        {look.name}
      </motion.h1>

      {/* Per-section color glow */}
      <motion.div
        key={`glow-${colorIdx}`}
        initial={{ opacity: 0, scale: 0.7 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false, amount: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          x: bgX,
          background: `radial-gradient(circle, ${variant.color}55 0%, ${variant.color}22 50%, transparent 80%)`,
          filter: "blur(60px)",
        }}
      />

      {/* TOP INFO CARD */}
      <div
        className="relative z-10 mx-auto mt-2 w-full max-w-[480px] rounded-xl border border-white/50 px-3 py-3 md:max-w-none md:w-[340px] md:absolute md:left-6 md:top-28 md:rounded-2xl md:px-6 md:py-5"
        style={{
          background: "rgba(255,255,255,0.6)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          boxShadow: "0 8px 30px rgba(30,30,50,0.07)",
        }}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2.5">
            <div className="min-w-0">
              <motion.div 
                animate={showSizeError ? { 
                  color: ["#737373", "#171717", "#737373", "#171717", "#737373"],
                } : {}}
                transition={{ duration: 0.8 }}
                className="flex items-center justify-center flex-row text-[9px] tracking-[0.25em] uppercase text-neutral-500 md:text-[9px]"
              >
                Tallas disponibles: {variant.sizes?.length > 0 ? (
                variant.sizes.map(size => (
                  <button 
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      setShowSizeError(false);
                    }}
                    className={`flex items-center justify-center min-w-[0px] mx-[3px] rounded border pl-[5px] pr-[3px] py-0.5 text-[9px] font-bold transition-all cursor-pointer text-center ${
                      selectedSize === size 
                        ? 'border-neutral-900 bg-neutral-900 text-white' 
                        : 'border-neutral-200 bg-white/50 text-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    {size}
                  </button>
                ))
              ) : (
                <span className="text-[10px] text-neutral-400">Sin tallas</span>
              )}
              </motion.div>
              <div
                className="mt-0.5 truncate md:mt-1"
                style={{
                  fontSize: "18px",
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}
              >
                {look.name}
              </div>
              <div className="text-[11px] text-neutral-600 md:text-[12px]">
                {look.description}
              </div>
            </div>
            <div className="shrink-0 text-right">
              
              <button 
                onClick={handleAddToCart}
                className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] tracking-[0.15em] uppercase transition md:text-[10px] ${
                  isAdded ? "bg-emerald-500 text-white" : "bg-neutral-900 text-white hover:bg-neutral-700"
                }`}
              >
                {isAdded ? (
                  <>Added <Check className="h-3 w-3" /></>
                ) : (
                  <>Add <Plus className="h-3 w-3" /></>
                )}
              </button>
            </div>
          </div>
          <div className="flex flex-row justify-between">
          {/* Color dots */}
          <div className="mt-1 flex items-center gap-2">
            {look.variants.map((v, i) => (
              <button
                key={v.name}
                onClick={() => pickColor(i)}
                aria-label={v.name}
                className="relative h-6 w-6 rounded-full transition"
                style={{
                  outline:
                    i === colorIdx
                      ? "1.5px solid rgba(20,20,30,0.9)"
                      : "1px solid rgba(20,20,30,0.1)",
                  outlineOffset: "2px",
                }}
              >
                <span
                  className="block h-full w-full rounded-full border border-white/80"
                  style={{
                    background: v.color,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                  }}
                />
              </button>
            ))}
            <span className="ml-1 text-[10px] tracking-[0.1em] text-neutral-500 font-medium">
              {variant.name}
            </span>
          </div>
          <div className="text-[22px] tabular-nums font-medium min-w-[90px]">{ Number(look.price) % 1 === 0 ? Number(look.price) : Number(look.price).toFixed(2) } Bs.</div>
          </div>
        </div>
      </div>

      {/* IMAGE STAGE */}
      <motion.div
        className="relative mt-3 flex flex-1 items-end justify-center cursor-grab active:cursor-grabbing select-none md:mt-0"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        style={{ x: dragX, minHeight: "55vh", touchAction: "pan-y" }}
        onDragEnd={onDragEnd}
      >
        <motion.div
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[10px] tracking-[0.3em] uppercase text-neutral-700"
          style={{ opacity: prevHint }}
        >
          ←
        </motion.div>
        <motion.div
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] tracking-[0.3em] uppercase text-neutral-700"
          style={{ opacity: nextHint }}
        >
          →
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, filter: "blur(22px)" }}
          whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          viewport={{ once: false, amount: 0.4 }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-0 flex h-full w-full items-end justify-center"
        >
          <AnimatePresence mode="popLayout" custom={hDir}>
            {image ? (
                <motion.img
                  key={imgIdx}
                  src={image}
                  alt={`${look.name} — ${variant.name}`}
                  initial={{ opacity: 0, scale: 1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute bottom-0 h-full w-auto select-none object-contain pointer-events-none"
                  style={{
                    filter:
                      "drop-shadow(0 40px 60px rgba(40,44,60,0.18)) drop-shadow(0 10px 20px rgba(40,44,60,0.12))",
                  }}
                  draggable={false}
                />
            ) : (
                <div key="no-img" className="h-full w-full flex items-center justify-center text-neutral-300 italic text-[12px]">Sin imagen</div>
            )}
          </AnimatePresence>
        </motion.div>

        <div
          className="pointer-events-none absolute bottom-0 h-14 w-[70%] rounded-[50%] md:h-24 md:w-[60%]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(40,44,60,0.18), transparent 70%)",
            filter: "blur(14px)",
          }}
        />
      </motion.div>

      {/* Thumbnails + counter */}
      <div className="relative z-10 mt-3 flex flex-col items-center gap-1.5 md:mt-0 md:absolute md:bottom-10 md:left-1/2 md:-translate-x-1/2 md:gap-2">
        <div
          className="flex items-center gap-1.5 rounded-full border border-white/50 px-2 py-1.5 md:gap-2 md:px-3 md:py-2"
          style={{
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
          }}
        >
          {variant.images?.map((src, i) => (
            <button
              key={`${colorIdx}-${i}`}
              onClick={() => {
                setHDir(i > imgIdx ? 1 : -1);
                setImgIdx(i);
              }}
              className="relative h-9 w-7 overflow-hidden rounded-md md:h-12 md:w-9"
              style={{
                outline:
                  i === imgIdx
                    ? "1.5px solid rgba(20,20,30,0.9)"
                    : "1px solid rgba(20,20,30,0.08)",
                outlineOffset: i === imgIdx ? "2px" : "0",
              }}
            >
              <img
                src={src}
                alt=""
                className="h-full w-full object-cover"
                style={{
                  filter: i === imgIdx ? "none" : "grayscale(0.4) opacity(0.6)",
                  transition: "filter 0.4s",
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
