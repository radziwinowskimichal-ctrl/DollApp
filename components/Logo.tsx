"use client";

import { Truck } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: "sm" | "md" | "lg" | "xl";
}

export function Logo({ className, iconSize = 24, textSize = "md" }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3 group", className)}>
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/50 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative p-2 bg-primary rounded-lg shadow-sm border border-primary/20">
          <Truck 
            size={iconSize} 
            className="text-primary-foreground transform group-hover:scale-110 transition-transform duration-300" 
          />
        </div>
      </div>
      <div className="flex flex-col -gap-0.5">
        <span className={cn(
          "font-black tracking-tighter leading-none text-slate-950 dark:text-white italic uppercase",
          textSize === "sm" && "text-sm",
          textSize === "md" && "text-xl",
          textSize === "lg" && "text-2xl",
          textSize === "xl" && "text-3xl"
        )}>
          Smart
        </span>
        <span className={cn(
          "font-bold tracking-[0.3em] leading-none text-primary uppercase ml-0.5",
          textSize === "sm" && "text-[8px]",
          textSize === "md" && "text-[10px]",
          textSize === "lg" && "text-xs",
          textSize === "xl" && "text-sm"
        )}>
          Trailer
        </span>
      </div>
    </div>
  );
}
