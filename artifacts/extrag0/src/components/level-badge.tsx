import React from "react";

/* ─────────────────────────────────────────────────────────────────────────
   LEVEL BADGES (Freelancer progression tiers)
   Source: /badges/freelancer-badges.png  — 5 badges L→R
   Order:  Iniciante | Júnior | Intermediário | Sênior | Elite
───────────────────────────────────────────────────────────────────────────*/
const FL_BADGE_SRC = "/badges/freelancer-badges.png";
const FL_BADGE_COUNT = 5;

const LEVEL_ORDER: Record<string, number> = {
  bronze: 0,   // Iniciante
  silver: 1,   // Júnior
  gold:   2,   // Intermediário
  elite:  3,   // Sênior
  diamond: 4,  // Elite
};

export const LEVEL_LABELS: Record<string, string> = {
  bronze:  "Iniciante",
  silver:  "Júnior",
  gold:    "Intermediário",
  elite:   "Sênior",
  diamond: "Elite",
};

export const LEVEL_COLORS: Record<string, { text: string; border: string; bg: string }> = {
  bronze:  { text: "text-sky-400",    border: "border-sky-400/30",    bg: "bg-sky-400/10"    },
  silver:  { text: "text-cyan-300",   border: "border-cyan-300/30",   bg: "bg-cyan-300/10"   },
  gold:    { text: "text-teal-400",   border: "border-teal-400/30",   bg: "bg-teal-400/10"   },
  elite:   { text: "text-primary",    border: "border-primary/30",    bg: "bg-primary/10"    },
  diamond: { text: "text-amber-300",  border: "border-amber-300/30",  bg: "bg-amber-300/10"  },
};

/** Sprite-based level badge image */
function LevelSprite({ level, size }: { level: string; size: number }) {
  const idx = LEVEL_ORDER[level] ?? 0;
  const pct = idx === 0 ? 0 : (idx / (FL_BADGE_COUNT - 1)) * 100;
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${FL_BADGE_SRC})`,
        backgroundSize: `${FL_BADGE_COUNT * 100}% auto`,
        backgroundPosition: `${pct}% center`,
        backgroundRepeat: "no-repeat",
        flexShrink: 0,
      }}
      aria-label={LEVEL_LABELS[level] ?? level}
    />
  );
}

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
  const px = IMG_SIZES[size] ?? 20;
  return (
    <span className={`inline-flex flex-shrink-0 ${className}`}>
      <LevelSprite level={lv} size={px} />
    </span>
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
      <LevelSprite level={lv} size={imgPx} />
      {label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   REFERRAL TIER BADGES
   Source: /badges/indicacoes-badges.png  — 3 badges L→R
   Order:  Indicador | Agente de Captação | Embaixador Regional
───────────────────────────────────────────────────────────────────────────*/
const REF_BADGE_SRC = "/badges/indicacoes-badges.png";
const REF_BADGE_COUNT = 3;

export const REFERRAL_TIER_LABELS: Record<string, string> = {
  indicador:           "Indicador",
  agente_captacao:     "Agente de Captação",
  embaixador_regional: "Embaixador Regional",
};

export const REFERRAL_TIER_COLORS: Record<string, { text: string; border: string; bg: string }> = {
  indicador:           { text: "text-sky-400",    border: "border-sky-400/30",    bg: "bg-sky-400/10"  },
  agente_captacao:     { text: "text-teal-400",   border: "border-teal-400/30",   bg: "bg-teal-400/10" },
  embaixador_regional: { text: "text-yellow-400", border: "border-yellow-400/30", bg: "bg-yellow-400/10" },
};

const REFERRAL_TIER_ORDER: Record<string, number> = {
  indicador:           0,
  agente_captacao:     1,
  embaixador_regional: 2,
};

function ReferralSprite({ tier, size }: { tier: string; size: number }) {
  const idx = REFERRAL_TIER_ORDER[tier] ?? 0;
  const pct = idx === 0 ? 0 : (idx / (REF_BADGE_COUNT - 1)) * 100;
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${REF_BADGE_SRC})`,
        backgroundSize: `${REF_BADGE_COUNT * 100}% auto`,
        backgroundPosition: `${pct}% center`,
        backgroundRepeat: "no-repeat",
        flexShrink: 0,
      }}
      aria-label={REFERRAL_TIER_LABELS[tier] ?? tier}
    />
  );
}

/** Referral tier badge icon only */
export function ReferralBadgeIcon({
  tier,
  size = "sm",
  className = "",
}: {
  tier?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const t = tier ?? "indicador";
  const px = IMG_SIZES[size] ?? 20;
  return (
    <span className={`inline-flex flex-shrink-0 ${className}`}>
      <ReferralSprite tier={t} size={px} />
    </span>
  );
}

/** Referral tier badge pill with image + label */
export function ReferralBadge({
  tier,
  size = "sm",
  className = "",
}: {
  tier?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  const t = tier ?? "indicador";
  const colors = REFERRAL_TIER_COLORS[t] ?? REFERRAL_TIER_COLORS.indicador;
  const label = REFERRAL_TIER_LABELS[t] ?? t;
  const imgPx = { xs: 12, sm: 16, md: 22, lg: 28 }[size] ?? 16;
  const textSize = { xs: "text-[9px]", sm: "text-[10px]", md: "text-xs", lg: "text-sm" }[size] ?? "text-[10px]";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-bold tracking-wide ${textSize} ${colors.text} ${colors.border} ${colors.bg} ${className}`}
    >
      <ReferralSprite tier={t} size={imgPx} />
      {label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   CORPORATE BADGES
   Source: /badges/corporate-badges.png  — 4 badges L→R
   Order:  CEO | CMO | CCO | Parceiro
───────────────────────────────────────────────────────────────────────────*/
const CORP_BADGE_SRC = "/badges/corporate-badges.png";
const CORP_BADGE_COUNT = 4;

export const CORPORATE_ROLE_LABELS: Record<string, string> = {
  ceo:      "CEO",
  cmo:      "CMO",
  cco:      "CCO",
  parceiro: "Parceiro",
};

export const CORPORATE_ROLE_COLORS: Record<string, { text: string; border: string; bg: string }> = {
  ceo:      { text: "text-yellow-400", border: "border-yellow-400/30", bg: "bg-yellow-400/10" },
  cmo:      { text: "text-cyan-400",   border: "border-cyan-400/30",   bg: "bg-cyan-400/10"   },
  cco:      { text: "text-blue-400",   border: "border-blue-400/30",   bg: "bg-blue-400/10"   },
  parceiro: { text: "text-lime-400",   border: "border-lime-400/30",   bg: "bg-lime-400/10"   },
};

const CORPORATE_ROLE_ORDER: Record<string, number> = {
  ceo: 0, cmo: 1, cco: 2, parceiro: 3,
};

function CorporateSprite({ role, size }: { role: string; size: number }) {
  const idx = CORPORATE_ROLE_ORDER[role] ?? 0;
  const pct = idx === 0 ? 0 : (idx / (CORP_BADGE_COUNT - 1)) * 100;
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${CORP_BADGE_SRC})`,
        backgroundSize: `${CORP_BADGE_COUNT * 100}% auto`,
        backgroundPosition: `${pct}% center`,
        backgroundRepeat: "no-repeat",
        flexShrink: 0,
      }}
      aria-label={CORPORATE_ROLE_LABELS[role] ?? role}
    />
  );
}

/** Corporate badge icon only */
export function CorporateBadgeIcon({
  role,
  size = "sm",
  className = "",
}: {
  role?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const r = role ?? "parceiro";
  const px = IMG_SIZES[size] ?? 20;
  return (
    <span className={`inline-flex flex-shrink-0 ${className}`}>
      <CorporateSprite role={r} size={px} />
    </span>
  );
}

/** Corporate badge pill with image + label */
export function CorporateBadge({
  role,
  size = "sm",
  className = "",
}: {
  role?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  const r = role ?? "parceiro";
  const colors = CORPORATE_ROLE_COLORS[r] ?? CORPORATE_ROLE_COLORS.parceiro;
  const label = CORPORATE_ROLE_LABELS[r] ?? r;
  const imgPx = { xs: 12, sm: 16, md: 22, lg: 28 }[size] ?? 16;
  const textSize = { xs: "text-[9px]", sm: "text-[10px]", md: "text-xs", lg: "text-sm" }[size] ?? "text-[10px]";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-bold tracking-wide ${textSize} ${colors.text} ${colors.border} ${colors.bg} ${className}`}
    >
      <CorporateSprite role={r} size={imgPx} />
      {label}
    </span>
  );
}

/* ─── Keep LEVEL_IMAGES for any legacy consumers ─── */
export const LEVEL_IMAGES: Record<string, string> = {
  bronze: FL_BADGE_SRC,
  silver: FL_BADGE_SRC,
  gold:   FL_BADGE_SRC,
  elite:  FL_BADGE_SRC,
  diamond: FL_BADGE_SRC,
};

/* ─────────────────────────────────────────────────────────────────────────
   UNIVERSAL BADGE — shows corporate badge if user has corporateRole,
   otherwise shows level badge. Use this everywhere a user badge is needed.
───────────────────────────────────────────────────────────────────────────*/

/** Icon-only: corporate or level depending on user data */
export function UserBadgeIcon({
  user,
  size = "sm",
  className = "",
}: {
  user?: { level?: string; corporateRole?: string | null } | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  if (user?.corporateRole) {
    return <CorporateBadgeIcon role={user.corporateRole} size={size} className={className} />;
  }
  return <LevelBadgeIcon level={user?.level ?? "bronze"} size={size} className={className} />;
}

/** Pill with image + label: corporate or level depending on user data */
export function UserBadge({
  user,
  size = "sm",
  className = "",
}: {
  user?: { level?: string; corporateRole?: string | null } | null;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  if (user?.corporateRole) {
    return <CorporateBadge role={user.corporateRole} size={size} className={className} />;
  }
  return <LevelBadge level={user?.level ?? "bronze"} size={size} className={className} />;
}
