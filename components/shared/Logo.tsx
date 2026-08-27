import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const sizeMap = {
  sm: { img: 36, badge: "h-10 w-10", text: "text-lg" },
  md: { img: 44, badge: "h-12 w-12", text: "text-xl" },
  lg: { img: 56, badge: "h-16 w-16", text: "text-2xl" },
};

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const sizes = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className={cn("relative flex items-center justify-center shrink-0", sizes.badge)}>
        <Image
          src="/Logo/forgeflow-logo-gradient.svg"
          alt="ForgeFlow AI Logo"
          width={sizes.img}
          height={sizes.img}
          className="h-auto w-auto object-contain transition-transform hover:scale-105 drop-shadow-[0_0_8px_rgba(56,182,255,0.4)]"
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={cn("font-bold tracking-tight text-[#f3f6fc]", sizes.text)}>
            ForgeFlow
          </span>
          <span className="text-[10px] font-mono font-semibold tracking-widest uppercase text-[#38b6ff]">
            AI
          </span>
        </div>
      )}
    </div>
  );
}
