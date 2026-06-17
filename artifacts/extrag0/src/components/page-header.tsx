import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  badge?: React.ReactNode;
  accent?: boolean;
}

export function PageHeader({ title, subtitle, action, className, badge, accent }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
      className={cn("flex items-start justify-between gap-4 mb-6 sm:mb-8", className)}
    >
      <div className="flex-1 min-w-0">
        {badge && <div className="mb-2">{badge}</div>}
        <h1 className={cn(
          "text-xl sm:text-2xl font-bold tracking-tight leading-tight neon-text-gradient"
        )}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-white/70 mt-1 leading-relaxed">{subtitle}</p>
        )}
      </div>
      {action && (
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex-shrink-0"
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}
