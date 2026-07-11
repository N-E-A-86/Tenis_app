import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface CardProps {
  className?: string;
  children: ReactNode;
  hover?: boolean;
}

export default function Card({ className, children, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden",
        hover && "hover:border-emerald-500/50 transition-all duration-300",
        className
      )}
    >
      {children}
    </div>
  );
}
