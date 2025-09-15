import * as React from "react"
import { cn } from "../../lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "subtle" | "strong"
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClasses = {
      default: "bg-white/10 backdrop-blur-md border border-white/20",
      subtle: "bg-white/5 backdrop-blur-sm border border-white/10",
      strong: "bg-white/20 backdrop-blur-lg border border-white/30"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl shadow-xl",
          variantClasses[variant],
          className
        )}
        {...props}
      />
    )
  }
)
GlassCard.displayName = "GlassCard"

export { GlassCard }
