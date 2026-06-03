import React from "react";
import iniciante from "@assets/file_0000000000b0720e823904394b50a903_1780446428386.png";
import junior from "@assets/file_000000000860720ea1185b225f2f3df2_1780446428484.png";
import intermediario from "@assets/file_000000004834720e8de5cc5b14e3eb4c_1780446428511.png";
import senior from "@assets/file_000000009060720e844d1e584da5e83f_1780446428526.png";

export const LEVEL_IMAGES: Record<string, string> = {
  bronze: iniciante,
  silver: junior,
  gold: intermediario,
  elite: senior,
};

export const LEVEL_LABELS: Record<string, string> = {
  bronze: "Iniciante",
  silver: "Júnior",
  gold: "Intermediário",
  elite: "Sênior",
};

export const LEVEL_COLORS: Record<string, { text: string; border: string; bg: string }> = {
  bronze: { text: "text-sky-400", border: "border-sky-400/30", bg: "bg-sky-400/10" },
  silver: { text: "text-cyan-300", border: "border-cyan-300/30", bg: "bg-cyan-300/10" },
  gold: { text: "text-teal-400", border: "border-teal-400/30", bg: "bg-teal-400/10" },
  elite: { text: "text-primary", border: "border-primary/30", bg: "bg-primary/10" },
};

const IMG_SIZES: Record<string, number> = { xs: 14, sm: 20, md: 28, lg: 40, xl: 56 };

/** Standalone badge image only (no label) */
export function LevelBadgeIcon({
  level,
  size = "sm",
  className = "",
}: {
  level?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const lv = level ?? "bronze";
  const src = LEVEL_IMAGES[lv] ?? LEVEL_IMAGES.bronze;
  const px = IMG_SIZES[size] ?? 20;
  return (
    <img
      src={src}
      alt={LEVEL_LABELS[lv] ?? lv}
      width={px}
      height={px}
      className={`object-contain flex-shrink-0 ${className}`}
      style={{ imageRendering: "auto" }}
    />
  );
}

/** Badge pill with image + label text */
export function LevelBadge({
  level,
  size = "sm",
  className = "",
}: {
  level?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  const lv = level ?? "bronze";
  const colors = LEVEL_COLORS[lv] ?? LEVEL_COLORS.bronze;
  const label = LEVEL_LABELS[lv] ?? lv;
  const imgPx = { xs: 12, sm: 16, md: 22, lg: 28 }[size] ?? 16;
  const textSize = { xs: "text-[9px]", sm: "text-[10px]", md: "text-xs", lg: "text-sm" }[size] ?? "text-[10px]";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-bold tracking-wide ${textSize} ${colors.text} ${colors.border} ${colors.bg} ${className}`}
    >
      <img
        src={LEVEL_IMAGES[lv]}
        alt={label}
        width={imgPx}
        height={imgPx}
        className="object-contain flex-shrink-0"
      />
      {label}
    </span>
  );
}
