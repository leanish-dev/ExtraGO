import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

function Empty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 text-balance rounded-lg border-dashed p-6 text-center md:p-12",
        className
      )}
      {...props}
    />
  );
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-header"
      className={cn("flex max-w-sm flex-col items-center gap-2 text-center", className)}
      {...props}
    />
  );
}

const emptyMediaVariants = cva(
  "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function EmptyMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  );
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-title"
      className={cn("text-lg font-medium tracking-tight", className)}
      {...props}
    />
  );
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        "text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4",
        className
      )}
      {...props}
    />
  );
}

function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-content"
      className={cn("flex w-full min-w-0 max-w-sm flex-col items-center gap-4 text-balance text-sm", className)}
      {...props}
    />
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

function EmptyState({ icon, title, description, actionLabel, actionHref, onAction, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-14 px-4 text-center", className)}>
      <div className="relative mb-5">
        <div className="empty-icon-ring">
          <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.04)] flex items-center justify-center text-muted-foreground/70 relative z-10"
            style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>
            {icon}
          </div>
        </div>
        <div className="absolute inset-0 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(124,252,0,0.18) 0%, transparent 70%)", filter: "blur(12px)" }} />
      </div>
      <p className="text-base font-semibold mb-1.5">{title}</p>
      {description && <p className="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">{description}</p>}
      {actionLabel && (
        actionHref ? (
          <Link href={actionHref}>
            <Button className="bg-primary text-black hover:bg-primary/90 neon-glow border-none font-semibold rounded-xl px-6 btn-shimmer">
              {actionLabel}
            </Button>
          </Link>
        ) : onAction ? (
          <Button onClick={onAction} className="bg-primary text-black hover:bg-primary/90 neon-glow border-none font-semibold rounded-xl px-6 btn-shimmer">
            {actionLabel}
          </Button>
        ) : null
      )}
    </div>
  );
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
  EmptyState,
};
