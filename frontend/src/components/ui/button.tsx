import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import clsx from "clsx";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "secondary";
  size?: "default" | "sm";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      asChild = false,
      variant = "default",
      size = "default",
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const classes = clsx(
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none",
      {
        "bg-primary text-primary-foreground hover:bg-primary/90": variant === "default",
        "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
      },
      {
        "h-10 px-4 py-2": size === "default",
        "h-9 px-3": size === "sm",
      },
      className
    );
    return <Comp ref={ref} className={classes} {...props} />;
  }
);
Button.displayName = "Button";

export { Button };
