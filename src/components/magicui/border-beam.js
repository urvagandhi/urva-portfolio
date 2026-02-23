"use client";

import { cn } from "@/lib/utils";

export const BorderBeam = ({
  className,
  size = 200,          // Kept for prop compat
  delay = 0,
  duration = 10,
  colorFrom = "#58E6D9", // Primary cyan
  colorTo = "#8B5CF6",   // Purple
  borderWidth = 2,
  style,
}) => {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 rounded-[inherit]", className)}
      style={{
        zIndex: 10,
      }}
    >
      <div
        className="absolute inset-[0] rounded-[inherit] overflow-hidden"
        style={{
          margin: `-${borderWidth}px`, // Expand by borderWidth to cover the outer stroke exactly
          padding: `${borderWidth}px`, // Inner box restores to original container size
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          ...style,
        }}
      >
        <div className="absolute top-1/2 left-1/2 h-[500%] w-[500%] -translate-x-1/2 -translate-y-1/2">
          <div
            className="h-full w-full animate-spin"
            style={{
              background: `conic-gradient(from 90deg at 50% 50%, transparent 70%, ${colorTo} 90%, ${colorFrom} 100%)`,
              animationDuration: `${duration}s`,
              animationDelay: `-${delay}s`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
