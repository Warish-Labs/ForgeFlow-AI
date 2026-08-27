import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--accent-blue)] text-white hover:bg-[var(--accent-blue)]/80",
        secondary:
          "border-transparent bg-[var(--navy-700)] text-[var(--text-secondary)] hover:bg-[var(--navy-600)]",
        outline:
          "border-[var(--border-default)] text-[var(--text-secondary)]",
        success:
          "border-transparent bg-emerald-900/50 text-emerald-400 border-emerald-800/50",
        planning:
          "border-[var(--border-default)] bg-[var(--navy-700)] text-[var(--text-secondary)]",
        architecture:
          "border-blue-800/50 bg-blue-900/40 text-blue-400",
        roadmap_ready:
          "border-purple-800/50 bg-purple-900/40 text-purple-400",
        exported:
          "border-emerald-800/50 bg-emerald-900/40 text-emerald-400",
        draft:
          "border-[var(--border-default)] bg-[var(--navy-700)] text-[var(--text-secondary)]",
        in_progress:
          "border-blue-800/50 bg-blue-900/40 text-blue-400",
        completed:
          "border-emerald-800/50 bg-emerald-900/40 text-emerald-400",
        archived:
          "border-[var(--border-subtle)] bg-[var(--navy-800)] text-[var(--text-muted)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
