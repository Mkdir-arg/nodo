"use client";

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useId,
  useMemo,
  useState,
  forwardRef,
  type HTMLAttributes,
  type MutableRefObject,
  type ReactElement,
  type ReactNode,
  type Ref,
  type SyntheticEvent,
} from "react";

import { cn } from "@/lib/utils";

interface TooltipContextValue {
  id: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

function useTooltipContext(): TooltipContextValue {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error("Tooltip components must be used within a Tooltip");
  }
  return context;
}

export interface TooltipProviderProps {
  children: ReactNode;
  delayDuration?: number;
  disableHoverableContent?: boolean;
}

function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>;
}

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (value: T) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(value);
      } else {
        (ref as MutableRefObject<T | null>).current = value;
      }
    });
  };
}

function composeEventHandlers<EventType extends SyntheticEvent>(
  originalHandler: ((event: EventType) => void) | undefined,
  nextHandler: (event: EventType) => void,
) {
  return (event: EventType) => {
    originalHandler?.(event);
    if (!event.defaultPrevented) {
      nextHandler(event);
    }
  };
}

interface TooltipProps {
  children: ReactNode;
}

function Tooltip({ children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const value = useMemo<TooltipContextValue>(
    () => ({ id, open, setOpen }),
    [id, open],
  );

  return (
    <TooltipContext.Provider value={value}>
      <span className="relative inline-flex">{children}</span>
    </TooltipContext.Provider>
  );
}

interface TooltipTriggerProps extends HTMLAttributes<HTMLElement> {
  asChild?: boolean;
  children: ReactElement;
}

const TooltipTrigger = forwardRef<HTMLElement, TooltipTriggerProps>(
  ({ asChild = false, children, ...props }, forwardedRef) => {
    const context = useTooltipContext();

    const handleOpen = () => context.setOpen(true);
    const handleClose = () => context.setOpen(false);

    const describedBy = context.open ? context.id : undefined;

    if (asChild) {
      const child = Children.only(children);
      if (!isValidElement(child)) {
        throw new Error("TooltipTrigger with asChild expects a single React element child.");
      }

      const existingDescribedBy =
        (child.props as Record<string, unknown>)["aria-describedby"] || undefined;
      const composedProps = {
        ...child.props,
        ...props,
        onMouseEnter: composeEventHandlers(child.props.onMouseEnter, handleOpen),
        onMouseLeave: composeEventHandlers(child.props.onMouseLeave, handleClose),
        onFocus: composeEventHandlers(child.props.onFocus, handleOpen),
        onBlur: composeEventHandlers(child.props.onBlur, handleClose),
        ref: mergeRefs((child as any).ref, forwardedRef),
        "aria-describedby": [existingDescribedBy, describedBy]
          .filter(Boolean)
          .join(" ") || undefined,
      };

      return cloneElement(child, composedProps);
    }

    const existingDescribedBy =
      (children.props as Record<string, unknown>)["aria-describedby"] || undefined;

    return cloneElement(children, {
      ...props,
      ref: mergeRefs((children as any).ref, forwardedRef),
      onMouseEnter: composeEventHandlers(children.props.onMouseEnter, handleOpen),
      onMouseLeave: composeEventHandlers(children.props.onMouseLeave, handleClose),
      onFocus: composeEventHandlers(children.props.onFocus, handleOpen),
      onBlur: composeEventHandlers(children.props.onBlur, handleClose),
      "aria-describedby": [existingDescribedBy, describedBy]
        .filter(Boolean)
        .join(" ") || undefined,
    });
  },
);
TooltipTrigger.displayName = "TooltipTrigger";

interface TooltipContentProps extends HTMLAttributes<HTMLDivElement> {
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  (
    {
      className,
      side = "top",
      align = "center",
      sideOffset = 6,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const { id, open } = useTooltipContext();
    if (!open) return null;

    const offsetStyle: Record<string, number> = {};
    if (side === "top") offsetStyle.marginBottom = sideOffset;
    if (side === "bottom") offsetStyle.marginTop = sideOffset;
    if (side === "left") offsetStyle.marginRight = sideOffset;
    if (side === "right") offsetStyle.marginLeft = sideOffset;

    const sideClass =
      side === "bottom"
        ? "top-full"
        : side === "left"
        ? "right-full"
        : side === "right"
        ? "left-full"
        : "bottom-full";

    const alignClass = (() => {
      if (side === "left" || side === "right") {
        if (align === "start") return "top-0";
        if (align === "end") return "bottom-0";
        return "top-1/2 -translate-y-1/2";
      }
      if (align === "start") return "left-0";
      if (align === "end") return "right-0";
      return "left-1/2 -translate-x-1/2";
    })();

    return (
      <div
        ref={ref}
        id={id}
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 min-w-max rounded-md border border-slate-200 bg-slate-900 px-3 py-1.5 text-xs text-slate-50 shadow-md",
          sideClass,
          alignClass,
          className,
        )}
        style={{ ...style, ...offsetStyle }}
        {...props}
      >
        {children}
      </div>
    );
  },
);
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
