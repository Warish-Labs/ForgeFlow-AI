import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const sizeMap = {
  sm: { badge: "h-7 w-7 text-xs", text: "text-sm" },
  md: { badge: "h-9 w-9 text-sm", text: "text-base" },
  lg: { badge: "h-12 w-12 text-base", text: "text-xl" },
};

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const sizes = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* Monogram badge — rounded square, accent color fill */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-lg font-bold tracking-tight text-white",
          "bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-cyan)]",
          "ring-1 ring-white/10",
          sizes.badge
        )}
        aria-hidden="true"
      >
        {/* Inner glow */}
        <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/10 to-transparent" />
        <span className="relative z-10 font-mono">FF</span>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-semibold tracking-tight text-[var(--text-primary)]",
              sizes.text
            )}
          >
            ForgeFlow
          </span>
          <span className="text-[10px] font-medium tracking-widest uppercase text-[var(--accent-cyan)] opacity-80">
            AI
          </span>
        </div>
      )}
    </div>
  );
}
