"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { useDraggable } from "@dnd-kit/core";
import clsx from "clsx";

import builderConfig from "../builder.config";
import FieldDraggable from "./FieldDraggable";
import {
  useCanvasGridContext,
  type CanvasPaletteItem,
} from "./CanvasGrid";

interface PaletteCategory {
  id: string;
  label: string;
  items: Array<CanvasPaletteItem>;
}

function buildCategories(): PaletteCategory[] {
  const categories: PaletteCategory[] = [];

  builderConfig.categories.forEach((category) => {
    const items = category.components
      .map((componentKey) => {
        const definition = builderConfig.components[componentKey];
        if (!definition) return null;
        return {
          key: componentKey,
          label: definition.label,
          description: definition.description,
          colSpan: 4,
        } satisfies CanvasPaletteItem;
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    if (items.length === 0) return;

    categories.push({
      id: category.id,
      label: category.label,
      items,
    });
  });

  return categories;
}

interface PaletteItemProps {
  component: CanvasPaletteItem;
  isActive: boolean;
  onFocus: () => void;
  onBlur: (event: FocusEvent<HTMLDivElement>) => void;
}

function PaletteItem({ component, isActive, onFocus, onBlur }: PaletteItemProps) {
  const { addNodeFromPalette } = useCanvasGridContext();
  const { attributes, listeners, setActivatorNodeRef, setNodeRef, isDragging } =
    useDraggable({
      id: `palette-${component.key}`,
      data: { type: "palette", component },
    });

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.defaultPrevented) return;
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        addNodeFromPalette(component);
      }
    },
    [addNodeFromPalette, component],
  );

  return (
    <FieldDraggable
      id={`palette-${component.key}`}
      ref={setNodeRef}
      label={component.label}
      description={component.description}
      variant="palette"
      dragAttributes={attributes}
      dragListeners={listeners}
      setActivatorNodeRef={setActivatorNodeRef}
      className={clsx(isDragging ? "opacity-60" : undefined)}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      aria-selected={isActive}
      aria-grabbed={isDragging}
      data-palette-option="true"
    />
  );
}

export default function Palette() {
  const categories = useMemo(() => buildCategories(), []);
  const isEmpty = categories.length === 0;
  const listRef = useRef<HTMLDivElement | null>(null);
  const [activeOptionKey, setActiveOptionKey] = useState<string | null>(null);

  const handleListKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    const { key } = event;
    if (
      key !== "ArrowDown" &&
      key !== "ArrowUp" &&
      key !== "ArrowLeft" &&
      key !== "ArrowRight" &&
      key !== "Home" &&
      key !== "End"
    ) {
      return;
    }

    const container = listRef.current;
    if (!container) return;
    if (!container.contains(event.target as Node)) return;

    const options = Array.from(
      container.querySelectorAll<HTMLElement>("[data-palette-option=\"true\"]"),
    );
    if (options.length === 0) return;

    const activeElement = document.activeElement as HTMLElement | null;
    const currentIndex = activeElement ? options.indexOf(activeElement) : -1;
    let nextIndex = currentIndex;

    if (key === "Home") {
      nextIndex = 0;
    } else if (key === "End") {
      nextIndex = options.length - 1;
    } else if (key === "ArrowDown" || key === "ArrowRight") {
      nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
    } else if (key === "ArrowUp" || key === "ArrowLeft") {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
    }

    if (nextIndex !== currentIndex && options[nextIndex]) {
      event.preventDefault();
      options[nextIndex].focus();
    }
  }, []);

  const handleOptionFocus = useCallback(
    (key: string) => {
      setActiveOptionKey(key);
    },
    [setActiveOptionKey],
  );

  const handleOptionBlur = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      const container = listRef.current;
      if (!container) {
        setActiveOptionKey(null);
        return;
      }
      const nextTarget = event.relatedTarget as HTMLElement | null;
      if (!nextTarget || !container.contains(nextTarget)) {
        setActiveOptionKey(null);
      }
    },
    [setActiveOptionKey],
  );

  return (
    <aside
      className="flex h-full min-h-0 flex-col gap-4 overflow-hidden rounded-xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
      aria-label="Paleta de componentes"
    >
      <div>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Componentes disponibles
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Arrastrá un componente al lienzo para comenzar a construir la plantilla.
        </p>
      </div>

      <div
        ref={listRef}
        role="listbox"
        aria-label="Componentes disponibles"
        aria-orientation="vertical"
        className="flex-1 space-y-4 overflow-y-auto pr-1"
        onKeyDown={handleListKeyDown}
      >
        {isEmpty ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white/70 p-4 text-xs text-slate-500 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-400">
            Todavía no hay componentes configurados.
          </div>
        ) : (
          categories.map((category) => {
            const headerId = `palette-category-${category.id}`;
            return (
              <section
                key={category.id}
                className="space-y-2"
                role="group"
                aria-labelledby={headerId}
              >
                <header>
                  <h3
                    id={headerId}
                    className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                  >
                    {category.label}
                  </h3>
                </header>
                <div className="space-y-2">
                  {category.items.map((component) => (
                    <PaletteItem
                      key={component.key}
                      component={component}
                      isActive={activeOptionKey === component.key}
                      onFocus={() => handleOptionFocus(component.key)}
                      onBlur={handleOptionBlur}
                    />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </aside>
  );
}
