import React, { useRef } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { ArrowLeft, ChevronRight } from "lucide-react";
import InstitutionalNavbar from "@/components/layout/InstitutionalNavbar";

export const GA = "#16a34a";
export const GB = "#22c55e";
export const GC = "#3b82f6";

export function FABackground() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        backgroundImage: "url(/fa-bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
        opacity: 0.55,
      }}
    />
  );
}

export function FAHeader() {
  return (
    <div className="relative z-10 w-full overflow-hidden">
      <img
        src="/fa-header.png"
        alt="Arquitetura Financeira da extraGO"
        style={{
          width: "100%",
          display: "block",
          objectFit: "contain",
          objectPosition: "center",
          maxHeight: "280px",
        }}
      />
    </div>
  );
}

export function FANavBar({ back = "/modelo-de-negocio", backLabel = "← Arquitetura Financeira" }: { back?: string; backLabel?: string }) {
  return <InstitutionalNavbar />;
}

export function GCard({ children, className = "", accent = "", glow = false }: {
  children: React.ReactNode; className?: string; accent?: string; glow?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl border overflow-hidden ${className}`}
      style={{
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(20px) saturate(150%)",
        borderColor: accent ? `${accent}30` : "rgba(0,0,0,0.08)",
        boxShadow: glow && accent
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

export function Pill({ label, color, icon }: { label: string; color: string; icon?: React.ReactNode }) {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3 text-[10px] font-black tracking-[0.14em] uppercase"
      style={{ background: `${color}10`, border: `1px solid ${color}30`, color }}
    >
      {icon}
      {label}
    </div>
  );
}

export function Reveal({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.60, delay, ease: [0.19, 1, 0.22, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Divider() {
  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-10">
      <div className="h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(22,163,74,0.15),transparent)" }} />
    </div>
  );
}

export function SectionCTA({ href, label, variant = "primary" }: { href: string; label: string; variant?: "primary" | "outline" }) {
  return (
    <Link href={href}>
      <button
        className="inline-flex items-center gap-2 rounded-full font-bold text-[13px] px-5 h-[40px] cursor-pointer transition-all"
        style={
          variant === "primary"
            ? { background: GA, color: "#fff", border: `1.5px solid ${GA}`, boxShadow: `0 2px 12px ${GA}30` }
            : { background: "transparent", color: GA, border: `1.5px solid ${GA}40` }
        }
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          if (variant === "primary") { el.style.background = "#15803d"; } else { el.style.background = `${GA}10`; }
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement;
          if (variant === "primary") { el.style.background = GA; } else { el.style.background = "transparent"; }
        }}
      >
        {label}
        <ChevronRight size={14} />
      </button>
    </Link>
  );
}

export function CheckItem({ text, color = GA }: { text: string; color?: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${color}15` }}>
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      </div>
      <span className="text-[13px] text-slate-600 leading-snug">{text}</span>
    </div>
  );
}

export function InfoGrid({ items }: { items: { label: string; value: string; color?: string }[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((item, i) => (
        <GCard key={i} className="p-4 text-center" accent={item.color || GA}>
          <p className="font-black leading-none mb-1 text-[24px] sm:text-[32px]" style={{ color: item.color || GA }}>{item.value}</p>
          <p className="text-[11px] text-slate-500 leading-snug">{item.label}</p>
        </GCard>
      ))}
    </div>
  );
}

export function PageHero({ pill, pillColor = GA, pillIcon, title, titleAccent, subtitle }: {
  pill: string;
  pillColor?: string;
  pillIcon?: React.ReactNode;
  title: string;
  titleAccent?: string;
  subtitle: string;
}) {
  return (
    <section className="relative overflow-hidden px-5 sm:px-10 py-10 sm:py-16">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 70% 50% at 50% 0%,${pillColor}08 0%,transparent 70%)` }}
      />
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <Pill label={pill} color={pillColor} icon={pillIcon} />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
          className="font-black leading-[1.06] mb-4 text-slate-900"
          style={{ fontSize: "clamp(24px,4.5vw,54px)" }}
        >
          {title}
          {titleAccent && (
            <>
              <br />
              <span style={{ color: pillColor }}>{titleAccent}</span>
            </>
          )}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.30 }}
          className="text-slate-500 text-[14px] sm:text-[16px] leading-relaxed max-w-2xl"
        >
          {subtitle}
        </motion.p>
      </div>
    </section>
  );
}
