import * as React from "react";
import { cn } from "../../lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: "sm" | "md" | "lg" | "xl";
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, spacing = "lg", ...props }, ref) => {
    const spacingClasses = {
      sm: "py-12",
      md: "py-16",
      lg: "py-20",
      xl: "py-24 md:py-32",
    };

    return (
      <section
        ref={ref}
        className={cn(spacingClasses[spacing], className)}
        {...props}
      />
    );
  }
);
Section.displayName = "Section";

export { Section };
