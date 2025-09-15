"use client";

import {
  DndContext,
  DragCancelEvent,
  DragEndEvent,
  DragMoveEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { nanoid } from "nanoid";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import FieldDraggable from "./FieldDraggable";
import type { FormLayout } from "@/lib/forms/types";

const GRID_COLUMNS = 12;
const GRID_GAP = 16;
const ROW_HEIGHT = 112;
const DEFAULT_COL_SPAN = 4;
const GRID_DROPPABLE_ID = "canvas-grid";

export interface CanvasPaletteItem {
  key: string;
  label: string;
  description?: string;
  colSpan?: number;
}

interface CanvasNode {
  id: string;
  componentKey: string;
  label: string;
  description?: string;
  row: number;
  col: number;
  colSpan: number;
}

interface GridPosition {
  row: number;
  col: number;
}

interface CanvasPreviewNode extends GridPosition {
  colSpan: number;
  label: string;
}

type DragItemData =
  | { type: "palette"; component: CanvasPaletteItem }
  | { type: "node"; id: string; colSpan: number };

type ActiveDragItem =
  | { type: "palette"; component: CanvasPaletteItem }
  | { type: "node"; node: CanvasNode };

interface CanvasGridContextValue {
  nodes: CanvasNode[];
  previewNode: CanvasPreviewNode | null;
  selectedNodeId: string | null;
  activeNodeId: string | null;
  selectNode: (id: string | null) => void;
  removeNode: (id: string) => void;
  setGridElement: (element: HTMLDivElement | null) => void;
}

const CanvasGridContext = createContext<CanvasGridContextValue | undefined>(
  undefined,
);

function useCanvasGridContext() {
  const context = useContext(CanvasGridContext);
  if (!context) {
    throw new Error("CanvasGrid must be used within a CanvasGridProvider");
  }
  return context;
}

interface CanvasGridProviderProps {
  children: ReactNode;
  layout?: FormLayout;
}

export function CanvasGridProvider({ children, layout }: CanvasGridProviderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const initialNodes = useMemo<CanvasNode[]>(() => {
    if (!layout) return [];
    return [];
  }, [layout]);

  const [nodes, setNodes] = useState<CanvasNode[]>(initialNodes);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<ActiveDragItem | null>(null);
  const [previewPosition, setPreviewPosition] = useState<GridPosition | null>(
    null,
  );
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes]);

  const setGridElement = useCallback((element: HTMLDivElement | null) => {
    gridRef.current = element;
  }, []);

  const selectNode = useCallback((id: string | null) => {
    setSelectedNodeId(id);
  }, []);

  const removeNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== id));
    setSelectedNodeId((current) => (current === id ? null : current));
  }, []);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const data = event.active.data.current as DragItemData | undefined;
      if (!data) return;

      if (data.type === "palette") {
        setActiveItem({ type: "palette", component: data.component });
      } else if (data.type === "node") {
        const node = nodes.find((item) => item.id === data.id);
        if (node) {
          setActiveItem({ type: "node", node });
          setSelectedNodeId(node.id);
        }
      }
    },
    [nodes],
  );

  const handleDragMove = useCallback(
    (event: DragMoveEvent) => {
      const { active, over } = event;
      const data = active.data.current as DragItemData | undefined;
      if (!data) {
        setPreviewPosition(null);
        return;
      }

      if (!over || over.id !== GRID_DROPPABLE_ID) {
        setPreviewPosition(null);
        return;
      }

      const rect =
        active.rect.current.translated ?? active.rect.current.initial ?? null;
      if (!rect) {
        setPreviewPosition(null);
        return;
      }

      const colSpan =
        data.type === "palette"
          ? normalizeColSpan(data.component.colSpan)
          : getNodeColSpan(nodes, data.id);

      const desired = calculateGridPosition(rect, gridRef.current, colSpan);
      if (!desired) {
        setPreviewPosition(null);
        return;
      }

      const resolved = resolvePosition(
        desired,
        colSpan,
        nodes,
        data.type === "node" ? data.id : undefined,
      );
      setPreviewPosition(resolved);
    },
    [nodes],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      const data = active.data.current as DragItemData | undefined;

      setPreviewPosition(null);
      setActiveItem(null);

      if (!data) return;
      if (!over || over.id !== GRID_DROPPABLE_ID) return;

      const rect =
        active.rect.current.translated ?? active.rect.current.initial ?? null;
      if (!rect) return;

      if (data.type === "palette") {
        const colSpan = normalizeColSpan(data.component.colSpan);
        const desired = calculateGridPosition(rect, gridRef.current, colSpan);
        if (!desired) return;

        let createdId: string | null = null;
        setNodes((prev) => {
          const resolved = resolvePosition(desired, colSpan, prev);
          const newNode: CanvasNode = {
            id: nanoid(),
            componentKey: data.component.key,
            label: data.component.label,
            description: data.component.description,
            row: resolved.row,
            col: resolved.col,
            colSpan,
          };
          createdId = newNode.id;
          return [...prev, newNode];
        });
        if (createdId) {
          setSelectedNodeId(createdId);
        }
      } else if (data.type === "node") {
        const existing = nodes.find((node) => node.id === data.id);
        if (!existing) return;
        const desired = calculateGridPosition(
          rect,
          gridRef.current,
          existing.colSpan,
        );
        if (!desired) return;

        setNodes((prev) => {
          const resolved = resolvePosition(desired, existing.colSpan, prev, data.id);
          return prev.map((node) =>
            node.id === data.id
              ? { ...node, row: resolved.row, col: resolved.col }
              : node,
          );
        });
      }
    },
    [nodes],
  );

  const handleDragCancel = useCallback((_: DragCancelEvent) => {
    setPreviewPosition(null);
    setActiveItem(null);
  }, []);

  const previewNode = useMemo<CanvasPreviewNode | null>(() => {
    if (!previewPosition || !activeItem) return null;
    if (activeItem.type === "palette") {
      const colSpan = normalizeColSpan(activeItem.component.colSpan);
      return {
        row: previewPosition.row,
        col: previewPosition.col,
        colSpan,
        label: activeItem.component.label,
      };
    }
    return {
      row: previewPosition.row,
      col: previewPosition.col,
      colSpan: activeItem.node.colSpan,
      label: activeItem.node.label,
    };
  }, [activeItem, previewPosition]);

  const activeNodeId = activeItem?.type === "node" ? activeItem.node.id : null;

  const contextValue = useMemo(
    () => ({
      nodes,
      previewNode,
      selectedNodeId,
      activeNodeId,
      selectNode,
      removeNode,
      setGridElement,
    }),
    [
      nodes,
      previewNode,
      selectedNodeId,
      activeNodeId,
      selectNode,
      removeNode,
      setGridElement,
    ],
  );

  return (
    <CanvasGridContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}
        <DragOverlay dropAnimation={null}>
          {activeItem ? (
            <FieldDraggable
              label={
                activeItem.type === "palette"
                  ? activeItem.component.label
                  : activeItem.node.label
              }
              description={
                activeItem.type === "palette"
                  ? activeItem.component.description
                  : activeItem.node.description
              }
              variant="canvas"
              className="pointer-events-none select-none"
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </CanvasGridContext.Provider>
  );
}

function normalizeColSpan(colSpan?: number): number {
  if (!colSpan || Number.isNaN(colSpan)) return DEFAULT_COL_SPAN;
  const rounded = Math.max(1, Math.round(colSpan));
  return Math.min(GRID_COLUMNS, rounded);
}

function getNodeColSpan(nodes: CanvasNode[], id: string): number {
  const node = nodes.find((item) => item.id === id);
  return node ? normalizeColSpan(node.colSpan) : DEFAULT_COL_SPAN;
}

function clampColumn(col: number, colSpan: number): number {
  const maxStart = GRID_COLUMNS - colSpan;
  if (maxStart <= 0) return 0;
  if (col < 0) return 0;
  if (col > maxStart) return maxStart;
  return col;
}

function resolvePosition(
  desired: GridPosition,
  colSpan: number,
  nodes: CanvasNode[],
  movingId?: string,
): GridPosition {
  const span = normalizeColSpan(colSpan);
  let row = Math.max(0, desired.row);
  let col = clampColumn(desired.col, span);

  for (let attempt = 0; attempt < 800; attempt += 1) {
    const hasCollision = nodes.some((node) => {
      if (node.id === movingId) return false;
      if (node.row !== row) return false;
      const startA = node.col;
      const endA = node.col + node.colSpan;
      const startB = col;
      const endB = col + span;
      return startA < endB && startB < endA;
    });

    if (!hasCollision) {
      return { row, col };
    }

    col += 1;
    if (col > GRID_COLUMNS - span) {
      col = 0;
      row += 1;
    }
  }

  return { row, col: clampColumn(desired.col, span) };
}

function calculateGridPosition(
  rect: DOMRect,
  gridElement: HTMLDivElement | null,
  colSpan: number,
): GridPosition | null {
  if (!gridElement) return null;
  const gridRect = gridElement.getBoundingClientRect();
  const style = window.getComputedStyle(gridElement);
  const paddingLeft = parseFloat(style.paddingLeft || "0");
  const paddingRight = parseFloat(style.paddingRight || "0");
  const paddingTop = parseFloat(style.paddingTop || "0");
  const paddingBottom = parseFloat(style.paddingBottom || "0");
  const columnGap = parseFloat(style.columnGap || `${GRID_GAP}`);
  const rowGap = parseFloat(style.rowGap || `${GRID_GAP}`);

  const contentWidth = gridRect.width - paddingLeft - paddingRight;
  const columnWidth =
    (contentWidth - columnGap * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
  if (!Number.isFinite(columnWidth) || columnWidth <= 0) {
    return null;
  }

  const trackWidth = columnWidth + columnGap;
  const trackHeight = ROW_HEIGHT + rowGap;

  const centerX = rect.left + rect.width / 2 - gridRect.left - paddingLeft;
  const centerY = rect.top + rect.height / 2 - gridRect.top - paddingTop;

  const approximateCol = centerX / trackWidth - (colSpan - 1) / 2;
  const approximateRow = centerY / trackHeight;

  const col = clampColumn(Math.round(approximateCol), normalizeColSpan(colSpan));
  const row = Math.max(0, Math.round(approximateRow));

  return { row, col };
}

interface CanvasNodeItemProps {
  node: CanvasNode;
  isSelected: boolean;
}

function CanvasNodeItem({ node, isSelected }: CanvasNodeItemProps) {
  const { selectNode, removeNode, activeNodeId } = useCanvasGridContext();
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: node.id,
    data: { type: "node", id: node.id, colSpan: node.colSpan },
  });

  const style: CSSProperties = {
    gridColumn: `${node.col + 1} / span ${node.colSpan}`,
    gridRow: `${node.row + 1}`,
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    zIndex: isDragging || activeNodeId === node.id ? 40 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative h-full">
      <FieldDraggable
        label={node.label}
        description={node.description}
        variant="canvas"
        dragAttributes={attributes}
        dragListeners={listeners}
        setActivatorNodeRef={setActivatorNodeRef}
        onDelete={() => removeNode(node.id)}
        onSelect={() => selectNode(node.id)}
        isSelected={isSelected}
        className={clsx("h-full", isDragging ? "opacity-0" : "opacity-100")}
      />
    </div>
  );
}

export default function CanvasGrid() {
  const { nodes, previewNode, selectedNodeId, setGridElement } =
    useCanvasGridContext();
  const { setNodeRef, isOver } = useDroppable({ id: GRID_DROPPABLE_ID });

  const registerGridRef = useCallback(
    (element: HTMLDivElement | null) => {
      setGridElement(element);
      setNodeRef(element);
    },
    [setGridElement, setNodeRef],
  );

  const sortedNodes = useMemo(
    () =>
      [...nodes].sort((a, b) =>
        a.row === b.row ? a.col - b.col : a.row - b.row,
      ),
    [nodes],
  );

  const totalRows = useMemo(() => {
    const maxRow = sortedNodes.reduce(
      (acc, node) => Math.max(acc, node.row + 1),
      0,
    );
    const previewRow = previewNode ? previewNode.row + 1 : 0;
    return Math.max(6, Math.max(maxRow, previewRow) + 1);
  }, [sortedNodes, previewNode]);

  const cells = useMemo(() => {
    const items: ReactNode[] = [];
    for (let row = 0; row < totalRows; row += 1) {
      for (let col = 0; col < GRID_COLUMNS; col += 1) {
        items.push(
          <div
            key={`cell-${row}-${col}`}
            className="rounded-md border border-dashed border-slate-200/70 bg-white/40 transition dark:border-slate-700/50 dark:bg-slate-900/30"
          />,
        );
      }
    }
    return items;
  }, [totalRows]);

  const showPlaceholder = sortedNodes.length === 0 && !previewNode;

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
      <header className="flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Lienzo
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Arrastrá componentes desde la paleta y soltálos sobre la grilla de 12 columnas.
          </p>
        </div>
      </header>
      <div className="relative mt-4 flex-1 overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50/70 dark:border-slate-700 dark:bg-slate-950/40">
        <div className="absolute inset-0 overflow-auto p-4">
          <div
            ref={registerGridRef}
            className={clsx(
              "relative grid min-h-[24rem] w-full grid-cols-12 gap-4",
              isOver ? "bg-indigo-500/5" : "bg-transparent",
            )}
            style={{ gridAutoRows: `${ROW_HEIGHT}px` }}
          >
            {cells}
            {previewNode ? (
              <div
                className="pointer-events-none z-20 rounded-lg border-2 border-indigo-400/80 bg-indigo-400/10"
                style={{
                  gridColumn: `${previewNode.col + 1} / span ${previewNode.colSpan}`,
                  gridRow: `${previewNode.row + 1}`,
                }}
              />
            ) : null}
            {sortedNodes.map((node) => (
              <CanvasNodeItem
                key={node.id}
                node={node}
                isSelected={selectedNodeId === node.id}
              />
            ))}
          </div>
        </div>
        {showPlaceholder ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-8 text-center text-xs text-slate-500 dark:text-slate-400">
            Soltá un componente sobre la grilla para comenzar. Luego podés arrastrarlos para reubicarlos.
          </div>
        ) : null}
      </div>
    </section>
  );
}
