"use client";

import {
  forwardRef,
  type ForwardedRef,
  type ReactNode,
  useCallback,
} from "react";
import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { GripVertical, SquareMousePointer, Trash2 } from "lucide-react";
import clsx from "clsx";

interface FieldDraggableProps {
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

    const baseClass = clsx(
      variant === "palette"
        ? "group flex cursor-grab flex-col gap-2 rounded-lg border border-dashed border-slate-300 bg-white/80 p-3 text-left text-sm text-slate-600 transition hover:border-slate-400 hover:bg-white dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-900"
        : "flex h-full flex-col gap-3 rounded-lg border bg-white p-3 text-left text-sm text-slate-600 shadow-sm transition dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200",
      variant === "canvas" && isSelected
        ? "border-indigo-500 shadow-[0_0_0_1px_rgba(79,70,229,0.25)] dark:border-indigo-400"
        : null,
      variant === "canvas" && !isSelected
        ? "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
        : null,
      className,
    );

    const paletteDragProps =
      variant === "palette"
        ? { ...(dragAttributes ?? {}), ...(dragListeners ?? {}) }
        : {};

    return (
      <div
        ref={(node) => {
          assignRef(forwardedRef, node);
          if (variant === "palette") {
            setActivatorNodeRef?.(node);
          }
        }}
        className={baseClass}
        {...paletteDragProps}
      >
        {variant === "canvas" ? (
          <div className="flex items-center justify-between text-xs text-slate-400">
            <button
              type="button"
              ref={handleMoveRef}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-slate-400 transition hover:border-slate-200 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              aria-label="Mover elemento"
              {...(dragAttributes ?? {})}
              {...(dragListeners ?? {})}
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onSelect}
                disabled={!onSelect}
                className={clsx(
                  "flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-slate-400 transition hover:border-slate-200 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100",
                  isSelected ? "text-indigo-500 dark:text-indigo-400" : null,
                  !onSelect ? "cursor-not-allowed opacity-50" : null,
                )}
                aria-label="Seleccionar elemento"
              >
                <SquareMousePointer className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onDelete}
                disabled={!onDelete}
                className={clsx(
                  "flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 dark:hover:border-red-700 dark:hover:bg-red-950/50 dark:hover:text-red-300",
                  !onDelete ? "cursor-not-allowed opacity-50" : null,
                )}
                aria-label="Eliminar elemento"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex items-start gap-2">
          {icon ? (
            <span className="mt-0.5 text-slate-400 dark:text-slate-500">{icon}</span>
          ) : null}
          <div className="flex flex-col gap-1">
            <span className="font-medium text-slate-700 dark:text-slate-100">{label}</span>
            {description ? (
              <span className="text-xs text-slate-500 dark:text-slate-400">{description}</span>
            ) : null}
          </div>
        </div>

        {variant === "palette" ? (
          <span className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Arrastrar y soltar
          </span>
        ) : null}
      </div>
    );
  },
);

export default FieldDraggable;
