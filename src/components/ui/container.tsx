import * as React from "react";
import { cn } from "../../lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = "lg", ...props }, ref) => {
    const sizeClasses = {
      sm: "max-w-3xl",
      md: "max-w-5xl",
      lg: "max-w-7xl",
      xl: "max-w-8xl",
      full: "max-w-none",
    };

    return (
      <div
        ref={ref}
        className={cn("mx-auto px-6 md:px-8", sizeClasses[size], className)}
        {...props}
      />
    );
  }
);
Container.displayName = "Container";

export { Container };
