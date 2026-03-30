import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "gold" | "wsop" | "wynn";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "text-foreground border border-border",
    destructive: "bg-destructive text-destructive-foreground",
    gold: "bg-[#4D3F12] text-[#FFE066] border border-[#AA7C11]/50 shadow-[0_0_10px_rgba(212,175,55,0.1)]",
    wsop: "bg-gradient-to-r from-red-950 to-red-900 text-red-100 border border-red-800/50",
    wynn: "bg-gradient-to-r from-blue-950 to-indigo-950 text-blue-100 border border-blue-800/50",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
