"use client";

import {
  ComponentPropsWithoutRef,
  forwardRef,
  type ForwardedRef,
  type ReactNode,
  useCallback,
  useId,
} from "react";
import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { GripVertical, SquareMousePointer, Trash2 } from "lucide-react";
import clsx from "clsx";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FieldDraggableProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onSelect"> {
  label: string;
  description?: string;
  icon?: ReactNode;
  variant?: "palette" | "canvas";
  dragAttributes?: DraggableAttributes;
  dragListeners?: DraggableSyntheticListeners;
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  onDelete?: () => void;
  onSelect?: () => void;
  isSelected?: boolean;
  className?: string;
}

function assignRef<T>(ref: ForwardedRef<T>, value: T) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    // eslint-disable-next-line no-param-reassign -- forwardRef mutable assignment
    ref.current = value;
  }
}

const FieldDraggable = forwardRef<HTMLDivElement, FieldDraggableProps>(
  function FieldDraggable(
    {
      label,
      description,
      icon,
      variant = "palette",
      dragAttributes,
      dragListeners,
      setActivatorNodeRef,
      onDelete,
      onSelect,
      isSelected = false,
      className,
      ...restProps
    },
    forwardedRef,
  ) {
    const handleMoveRef = useCallback(
      (element: HTMLButtonElement | null) => {
        if (variant === "canvas") {
          setActivatorNodeRef?.(element);
        }
      },
      [setActivatorNodeRef, variant],
    );

    const generatedId = useId();
    const labelId = `${generatedId}-label`;
    const descriptionId = description ? `${generatedId}-description` : undefined;

    const baseClass = clsx(
      "outline-none transition focus:outline-none",
      variant === "palette"
        ? "group flex cursor-grab flex-col gap-2 rounded-lg border border-dashed border-slate-300 bg-white/80 p-3 text-left text-sm text-slate-600 hover:border-slate-400 hover:bg-white focus-visible:border-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-900 dark:focus-visible:ring-offset-slate-900"
        : "flex h-full flex-col gap-3 rounded-lg border bg-white p-3 text-left text-sm text-slate-600 shadow-sm focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:focus-visible:ring-offset-slate-900",
      variant === "canvas" && isSelected
        ? "border-indigo-500 shadow-[0_0_0_1px_rgba(79,70,229,0.25)] dark:border-indigo-400"
        : null,
      variant === "canvas" && !isSelected
        ? "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
        : null,
      className,
    );

    const finalProps: Record<string, unknown> = { ...restProps };
    const roleProp = finalProps.role as FieldDraggableProps["role"] | undefined;
    if (roleProp != null) {
      delete finalProps.role;
    }
    const tabIndexProp = finalProps.tabIndex as FieldDraggableProps["tabIndex"] | undefined;
    if (tabIndexProp != null) {
      delete finalProps.tabIndex;
    }
    const ariaDescribedByProp = finalProps["aria-describedby"] as string | undefined;
    if (ariaDescribedByProp != null) {
      delete finalProps["aria-describedby"];
    }
    const ariaLabelledByProp = finalProps["aria-labelledby"] as string | undefined;
    if (ariaLabelledByProp != null) {
      delete finalProps["aria-labelledby"];
    }
    const ariaSelectedProp = finalProps["aria-selected"] as boolean | undefined;
    if (ariaSelectedProp != null) {
      delete finalProps["aria-selected"];
    }
    const ariaRoleDescriptionProp = finalProps["aria-roledescription"] as
      | string
      | undefined;
    if (ariaRoleDescriptionProp != null) {
      delete finalProps["aria-roledescription"];
    }

    const mergedAriaLabelledBy =
      [ariaLabelledByProp, labelId].filter(Boolean).join(" ") || undefined;
    const mergedAriaDescribedBy =
      [ariaDescribedByProp, descriptionId].filter(Boolean).join(" ") || undefined;
    const resolvedRole = roleProp ?? (variant === "palette" ? "option" : "group");
    const resolvedTabIndex = tabIndexProp ?? 0;
    const resolvedAriaSelected =
      ariaSelectedProp ?? (variant === "canvas" ? isSelected : undefined);
    const resolvedAriaRoleDescription =
      ariaRoleDescriptionProp ?? "Elemento arrastrable";

    const {
      role: _ignoredRole,
      tabIndex: _ignoredTabIndex,
      "aria-roledescription": _ignoredAriaRoleDescription,
      ...draggableAttributes
    } = dragAttributes ?? {};

    const rootDraggableAttributes =
      variant === "palette" ? draggableAttributes : undefined;
    const rootDragListeners =
      variant === "palette" ? dragListeners : undefined;

    return (
      <TooltipProvider delayDuration={200} disableHoverableContent>
        <div
          {...(finalProps as ComponentPropsWithoutRef<"div">)}
          ref={(node) => {
            assignRef(forwardedRef, node);
            if (variant === "palette") {
              setActivatorNodeRef?.(node);
            }
          }}
          role={resolvedRole}
          tabIndex={resolvedTabIndex}
          aria-labelledby={mergedAriaLabelledBy}
          aria-describedby={mergedAriaDescribedBy}
          aria-selected={resolvedAriaSelected}
          aria-roledescription={resolvedAriaRoleDescription}
          className={baseClass}
          {...(rootDraggableAttributes ?? {})}
          {...(rootDragListeners ?? {})}
        >
          {variant === "canvas" ? (
            <div className="flex items-center justify-between text-xs text-slate-400">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    ref={handleMoveRef}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-slate-400 transition hover:border-slate-200 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:focus-visible:ring-offset-slate-900"
                    aria-label="Mover elemento"
                    {...(draggableAttributes as DraggableAttributes)}
                    {...(dragListeners ?? {})}
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Mover elemento</TooltipContent>
              </Tooltip>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={onSelect}
                      disabled={!onSelect}
                      className={clsx(
                        "flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-slate-400 transition hover:border-slate-200 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:focus-visible:ring-offset-slate-900",
                        isSelected ? "text-indigo-500 dark:text-indigo-400" : null,
                        !onSelect ? "cursor-not-allowed opacity-50" : null,
                      )}
                      aria-label="Seleccionar elemento"
                    >
                      <SquareMousePointer className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Seleccionar para configurar</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={onDelete}
                      disabled={!onDelete}
                      className={clsx(
                        "flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:hover:border-red-700 dark:hover:bg-red-950/50 dark:hover:text-red-300 dark:focus-visible:ring-offset-slate-900",
                        !onDelete ? "cursor-not-allowed opacity-50" : null,
                      )}
                      aria-label="Eliminar elemento"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Eliminar elemento</TooltipContent>
                </Tooltip>
              </div>
            </div>
          ) : null}

          <div className="flex items-start gap-2">
            {icon ? (
              <span className="mt-0.5 text-slate-400 dark:text-slate-500">{icon}</span>
            ) : null}
            <div className="flex flex-col gap-1">
              <span id={labelId} className="font-medium text-slate-700 dark:text-slate-100">
                {label}
              </span>
              {description ? (
                <span
                  id={descriptionId}
                  className="text-xs text-slate-500 dark:text-slate-400"
                >
                  {description}
                </span>
              ) : null}
            </div>
          </div>

          {variant === "palette" ? (
            <span className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Arrastrar y soltar
            </span>
          ) : null}
        </div>
      </TooltipProvider>
    );
  },
);

export default FieldDraggable;
