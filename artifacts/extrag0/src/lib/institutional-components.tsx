import { useRef, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { motion, useInView } from "framer-motion";

/** Scroll-reveal wrapper — fades in + slides up when element enters viewport. */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.19, 1, 0.22, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Animated counter — counts up to `target` when element enters viewport. */
export function CountUp({
  target,
  suffix = "",
  prefix = "",
  duration = 1800,
}: {
  target?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const value = target ?? 0;
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setCount(Math.round(eased * value));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
}

/** Dark glass card — for use on dark-background pages (e.g. investidores). */
export function GCardDark({
  children,
  className = "",
  accent = "",
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  accent?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl border overflow-hidden ${className}`}
      style={{
        background: "rgba(8,18,36,0.72)",
        backdropFilter: "blur(28px) saturate(160%)",
        borderColor: accent ? `${accent}28` : "rgba(255,255,255,0.09)",
        boxShadow:
          glow && accent
            ? `0 0 0 1px ${accent}12, 0 0 32px ${accent}18, 0 8px 40px rgba(0,0,0,0.45)`
            : "0 4px 24px rgba(0,0,0,0.35)",
      }}
    >
      {accent && (
        <div
          className="absolute inset-x-0 top-0 h-[1.5px]"
          style={{
            background: `linear-gradient(90deg,transparent,${accent}80,transparent)`,
          }}
        />
      )}
      {children}
    </div>
  );
}

/**
 * Section label pill — works on both dark and light backgrounds.
 * Pass `color` as a CSS hex string (e.g. "#7CFC00").
 */
export function Pill({
  label,
  color,
  icon,
}: {
  label: string;
  color: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4 text-[10px] font-black tracking-[0.15em] uppercase"
      style={{ background: `${color}10`, border: `1px solid ${color}28`, color }}
    >
      {icon}
      {label}
    </span>
  );
}

/** Horizontal section divider. Defaults to a dark-page subtle rule. */
export function Divider({ color = "rgba(255,255,255,0.05)" }: { color?: string }) {
  return <div className="w-full h-px" style={{ background: color }} />;
}

const ARQFIN_BG: Record<string, string> = {
  impact:   "/arqfin-bg3.png",
  layer:    "/arqfin-bg1.png",
  flywheel: "/arqfin-bg2.png",
  default:  "/arqfin-bg4.png",
};

const ARQFIN_OVERLAY: Record<string, string> = {
  impact:   "rgba(255,248,235,0.38)",
  layer:    "rgba(255,252,248,0.30)",
  flywheel: "rgba(255,246,220,0.45)",
  default:  "rgba(255,252,248,0.28)",
};

/** Light glass card — for use on light-background pages (e.g. financial-architecture). */
export function GCard({
  children,
  className = "",
  accent = "",
  glow = false,
  bgVariant,
}: {
  children: ReactNode;
  className?: string;
  accent?: string;
  glow?: boolean;
  bgVariant?: "impact" | "layer" | "flywheel" | "default";
}) {
  const hasBg = !!bgVariant;
  const overlay = bgVariant ? ARQFIN_OVERLAY[bgVariant] : undefined;
  const bgImg = bgVariant ? ARQFIN_BG[bgVariant] : undefined;

  return (
    <div
      className={`relative rounded-2xl border overflow-hidden ${className}`}
      style={{
        background: hasBg
          ? `linear-gradient(${overlay}, ${overlay}), url(${bgImg}) center/cover no-repeat`
          : "var(--gcard-bg, rgba(255,255,255,0.88))",
        backdropFilter: hasBg ? undefined : "blur(20px) saturate(150%)",
        borderColor: accent ? `${accent}30` : "rgba(0,0,0,0.08)",
        boxShadow:
          glow && accent
            ? `0 0 0 1px ${accent}18, 0 4px 32px ${accent}14, 0 2px 12px rgba(0,0,0,0.07)`
            : "0 2px 16px rgba(0,0,0,0.07)",
      }}
    >
      {accent && (
        <div
          className="absolute inset-x-0 top-0 h-[2px]"
          style={{ background: `linear-gradient(90deg,transparent,${accent}90,transparent)` }}
        />
      )}
      {children}
    </div>
  );
}

/**
 * Scroll-reveal + slide-up — uses y:36 for a more pronounced entrance.
 * Alias of Reveal with a larger initial y offset, used in dense content pages.
 */
export function ScrollSection({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.19, 1, 0.22, 1] }}
    >
      {children}
    </motion.div>
  );
}
