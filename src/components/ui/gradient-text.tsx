import * as React from "react";
import { cn } from "../../lib/utils";

interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  gradient?: "default" | "accent" | "success" | "warning";
}

const GradientText = React.forwardRef<HTMLSpanElement, GradientTextProps>(
  ({ className, gradient = "default", ...props }, ref) => {
    const gradientClasses = {
      default: "bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500",
      accent: "bg-gradient-to-r from-blue-500 to-purple-600",
      success: "bg-gradient-to-r from-green-500 to-emerald-600",
      warning: "bg-gradient-to-r from-orange-500 to-red-600",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "bg-clip-text text-transparent",
          gradientClasses[gradient],
          className
        )}
        {...props}
      />
    );
  }
);
GradientText.displayName = "GradientText";

export { GradientText };
