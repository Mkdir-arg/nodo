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
import type {
  ColumnSpan,
  FormLayout,
  GridPlacement,
  LayoutColumnNode,
  LayoutFieldNode,
  LayoutRowNode,
  LayoutSectionNode,
} from "@/lib/forms/types";

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

export interface CanvasNode {
  id: string;
  componentKey: string;
  label: string;
  name: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  row: number;
  col: number;
  colSpan: number;
  options?: Array<{ label: string; value: string }>;
  min?: number;
  max?: number;
  step?: number;
  minDate?: string;
  maxDate?: string;
  accept?: string[];
  maxSizeMB?: number;
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

const OPTION_COMPONENT_KEYS = new Set([
  "select",
  "dropdown",
  "multiselect",
  "select_with_filter",
  "radio",
]);

type PersistedField = Record<string, unknown> & {
  id?: string;
  key?: string;
  name?: string;
  type?: string;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<Record<string, unknown>>;
  min?: number;
  max?: number;
  step?: number;
  minDate?: string;
  maxDate?: string;
  accept?: string[] | string;
  maxSizeMB?: number;
  layout?: GridPlacement;
  componentKey?: string;
};

type PersistedFieldNode = LayoutFieldNode & {
  field?: PersistedField;
  componentKey?: string;
  name?: string;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<Record<string, unknown>>;
  min?: number;
  max?: number;
  step?: number;
  minDate?: string;
  maxDate?: string;
  accept?: string[] | string;
  maxSizeMB?: number;
};

type PersistedColumnNode = LayoutColumnNode & { start?: number };
type PersistedRowNode = LayoutRowNode & { rowIndex?: number };

const COMPONENT_TYPE_MAP: Record<string, string> = {
  text: "text",
  number: "number",
  select: "select",
  date: "date",
  checkbox: "checkbox",
  file: "document",
};

const FIELD_COMPONENT_MAP: Record<string, string> = {
  text: "text",
  textarea: "text",
  number: "number",
  select: "select",
  dropdown: "select",
  multiselect: "select",
  select_with_filter: "select",
  date: "date",
  document: "file",
  checkbox: "checkbox",
};

function mapComponentKeyToFieldType(key: string): string {
  return COMPONENT_TYPE_MAP[key] ?? key;
}

function mapFieldTypeToComponentKey(type?: string): string {
  if (!type) return "text";
  const normalized = type.toLowerCase();
  return FIELD_COMPONENT_MAP[normalized] ?? normalized;
}

function ensureArray<T>(value: T | T[] | undefined | null): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function coerceNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function coerceBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value === "true") return true;
    if (value === "false") return false;
  }
  return undefined;
}

function coerceString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  return undefined;
}

function normalizeOptions(
  value: unknown,
): CanvasNode["options"] | undefined {
  const array = ensureArray(value as Array<Record<string, unknown>>);
  if (array.length === 0) return undefined;
  const result = array
    .map((option) => {
      if (typeof option === "string") {
        return { label: option, value: option };
      }
      if (!option || typeof option !== "object") return null;
      const record = option as Record<string, unknown>;
      const rawValue =
        record.value ?? record.id ?? record.key ?? record.name ?? "";
      const valueString =
        typeof rawValue === "number" || typeof rawValue === "boolean"
          ? String(rawValue)
          : typeof rawValue === "string"
          ? rawValue
          : "";
      const rawLabel = record.label ?? record.name ?? valueString;
      const labelString =
        typeof rawLabel === "string" ? rawLabel : valueString;
      return { label: labelString, value: valueString };
    })
    .filter(
      (option): option is { label: string; value: string } => Boolean(option),
    );
  return result.length > 0 ? result : undefined;
}

function normalizeAccept(value: unknown): string[] | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) {
    const items = value
      .map((item) => (typeof item === "string" ? item : String(item ?? "")))
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    return items.length > 0 ? items : undefined;
  }
  if (typeof value === "string") {
    const items = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    return items.length > 0 ? items : undefined;
  }
  return undefined;
}

function mapCanvasNodeToField(
  node: CanvasNode,
  position: { row: number; col: number; colSpan: number },
): Record<string, unknown> {
  const colSpan = normalizeColSpan(position.colSpan);
  const col = clampColumn(position.col, colSpan);
  const row = Math.max(0, Math.round(position.row));
  const fieldType = mapComponentKeyToFieldType(node.componentKey);
  const base: Record<string, unknown> = {
    id: node.id,
    key: node.name || node.id,
    name: node.name || node.id,
    type: fieldType,
    label: node.label,
    description: node.description ?? "",
    placeholder: node.placeholder ?? "",
    required: Boolean(node.required),
    kind: "field",
    componentKey: node.componentKey,
    layout: {
      i: node.id,
      x: col,
      y: row,
      w: colSpan,
      h: 1,
    } satisfies GridPlacement,
  };

  if (node.options && node.options.length > 0) {
    base.options = node.options.map((option) => ({
      label: option.label ?? "",
      value: option.value ?? "",
    }));
  }

  if (node.min != null) base.min = node.min;
  if (node.max != null) base.max = node.max;
  if (node.step != null) base.step = node.step;
  if (node.minDate) base.minDate = node.minDate;
  if (node.maxDate) base.maxDate = node.maxDate;
  if (node.accept && node.accept.length > 0) base.accept = node.accept;
  if (node.maxSizeMB != null) base.maxSizeMB = node.maxSizeMB;

  return base;
}

function resolveFieldNode(
  node: PersistedFieldNode,
  context: { rowIndex: number; columnStart: number; columnSpan: number },
): CanvasNode {
  const fallbackRow = Math.max(0, Math.round(context.rowIndex));
  const fallbackSpan = normalizeColSpan(context.columnSpan);
  const fallbackCol = clampColumn(context.columnStart, fallbackSpan);

  const rawField: PersistedField = (node.field as PersistedField) ?? {};
  const layout =
    (node.layout as GridPlacement | undefined) ??
    (rawField.layout as GridPlacement | undefined);

  const row =
    coerceNumber(layout?.y) != null
      ? Math.max(0, Math.round(coerceNumber(layout?.y)!))
      : fallbackRow;
  const colSpan = normalizeColSpan(
    coerceNumber(layout?.w) ?? coerceNumber(node.colSpan) ?? fallbackSpan,
  );
  const col =
    coerceNumber(layout?.x) != null
      ? clampColumn(coerceNumber(layout?.x)!, colSpan)
      : fallbackCol;

  const componentKey =
    typeof rawField.componentKey === "string" && rawField.componentKey
      ? rawField.componentKey
      : typeof node.componentKey === "string" && node.componentKey
      ? node.componentKey
      : mapFieldTypeToComponentKey(
          typeof rawField.type === "string" ? rawField.type : undefined,
        );

  const label =
    coerceString(rawField.label) ??
    coerceString((node as Record<string, unknown>).label) ??
    "Campo sin título";

  const name =
    coerceString(node.fieldKey) ??
    coerceString(rawField.key) ??
    coerceString(rawField.name) ??
    coerceString((node as Record<string, unknown>).name) ??
    (typeof node.id === "string" ? node.id : "");

  const description =
    coerceString(rawField.description) ??
    coerceString((node as Record<string, unknown>).description);

  const placeholder =
    coerceString(rawField.placeholder) ??
    coerceString((node as Record<string, unknown>).placeholder);

  const required =
    coerceBoolean(rawField.required) ??
    coerceBoolean((node as Record<string, unknown>).required) ??
    false;

  const options = normalizeOptions(
    rawField.options ?? (node as Record<string, unknown>).options,
  );

  const min = coerceNumber(rawField.min ?? (node as Record<string, unknown>).min);
  const max = coerceNumber(rawField.max ?? (node as Record<string, unknown>).max);
  const step = coerceNumber(
    rawField.step ?? (node as Record<string, unknown>).step,
  );
  const minDate =
    coerceString(rawField.minDate ?? (node as Record<string, unknown>).minDate);
  const maxDate =
    coerceString(rawField.maxDate ?? (node as Record<string, unknown>).maxDate);
  const accept = normalizeAccept(
    rawField.accept ?? (node as Record<string, unknown>).accept,
  );
  const maxSizeMB = coerceNumber(
    rawField.maxSizeMB ?? (node as Record<string, unknown>).maxSizeMB,
  );

  const id =
    coerceString(node.id) ??
    coerceString(rawField.id) ??
    `node-${nanoid()}`;

  return {
    id,
    componentKey,
    label,
    name: name || id,
    description: description ?? undefined,
    placeholder: placeholder ?? undefined,
    required,
    row,
    col,
    colSpan,
    options,
    min: min ?? undefined,
    max: max ?? undefined,
    step: step ?? undefined,
    minDate: minDate ?? undefined,
    maxDate: maxDate ?? undefined,
    accept,
    maxSizeMB: maxSizeMB ?? undefined,
  } satisfies CanvasNode;
}

export function canvasNodesToLayout(
  nodes: CanvasNode[],
  version = 1,
): FormLayout {
  const grouped = new Map<number, CanvasNode[]>();

  nodes.forEach((node) => {
    const span = normalizeColSpan(node.colSpan);
    const row = Math.max(0, Math.round(node.row));
    const col = clampColumn(Math.round(node.col), span);
    const normalized: CanvasNode = {
      ...node,
      row,
      col,
      colSpan: span,
    };
    if (!grouped.has(row)) {
      grouped.set(row, [normalized]);
    } else {
      grouped.get(row)!.push(normalized);
    }
  });

  const sortedRows = Array.from(grouped.entries()).sort((a, b) => a[0] - b[0]);

  const layoutRows: LayoutRowNode[] = sortedRows.map(
    ([rowIndex, rowNodes], rowOrder) => {
      const sortedNodes = [...rowNodes].sort((a, b) => a.col - b.col);
      const columns: LayoutColumnNode[] = sortedNodes.map(
        (node, columnIndex) => {
          const span = normalizeColSpan(node.colSpan);
          const col = clampColumn(node.col, span);
          const field = mapCanvasNodeToField(node, {
            row: rowIndex,
            col,
            colSpan: span,
          });
          const fieldNode: PersistedFieldNode = {
            id: node.id,
            type: "field",
            fieldId: node.id,
            fieldKey: node.name,
            colSpan: span as ColumnSpan,
            componentKey: node.componentKey,
            name: node.name,
            layout: {
              i: node.id,
              x: col,
              y: rowIndex,
              w: span,
              h: 1,
            },
            field,
          };
          const columnNode: PersistedColumnNode = {
            id: `row-${rowOrder}-col-${columnIndex}`,
            type: "column",
            span: span as ColumnSpan,
            start: col,
            children: [fieldNode],
          };
          return columnNode;
        },
      );

      const rowNode: PersistedRowNode = {
        id: `row-${rowOrder}`,
        type: "row",
        rowIndex,
        columns,
      };

      return rowNode;
    },
  );

  return {
    version,
    nodes: layoutRows,
  } satisfies FormLayout;
}

function columnStart(column: PersistedColumnNode): number | undefined {
  if (typeof column.start === "number") return column.start;
  if (
    column.layout &&
    typeof (column.layout as GridPlacement)?.x === "number"
  ) {
    return (column.layout as GridPlacement).x;
  }
  const firstField = ensureArray(column.children).find(
    (child) => (child as LayoutFieldNode).type === "field",
  ) as PersistedFieldNode | undefined;
  if (firstField) {
    const layout =
      (firstField.layout as GridPlacement | undefined) ??
      ((firstField.field as PersistedField)?.layout as GridPlacement | undefined);
    if (layout && typeof layout.x === "number") return layout.x;
  }
  return undefined;
}

function inferRowIndex(row: PersistedRowNode): number | undefined {
  if (typeof row.rowIndex === "number") return row.rowIndex;
  for (const column of ensureArray(row.columns)) {
    const firstField = ensureArray(column.children).find(
      (child) => (child as LayoutFieldNode).type === "field",
    ) as PersistedFieldNode | undefined;
    if (!firstField) continue;
    const layout =
      (firstField.layout as GridPlacement | undefined) ??
      ((firstField.field as PersistedField)?.layout as GridPlacement | undefined);
    if (layout && typeof layout.y === "number") {
      return Math.max(0, Math.round(layout.y));
    }
  }
  return undefined;
}

export function layoutToCanvasNodes(layout?: FormLayout | null): CanvasNode[] {
  if (!layout || !Array.isArray(layout.nodes)) return [];

  const result: CanvasNode[] = [];

  const visitNode = (
    node:
      | LayoutSectionNode
      | LayoutRowNode
      | LayoutColumnNode
      | LayoutFieldNode,
    context: { rowIndex: number; columnStart: number; columnSpan: number },
  ) => {
    if (!node) return;

    if ((node as LayoutSectionNode).type === "section") {
      ensureArray((node as LayoutSectionNode).children).forEach((child) =>
        visitNode(child, context),
      );
      return;
    }

    if ((node as LayoutRowNode).type === "row") {
      const rowNode = node as PersistedRowNode;
      const rowIndex = inferRowIndex(rowNode) ?? context.rowIndex;
      const columns = ensureArray(rowNode.columns);
      const sortedColumns = [...columns].sort((a, b) => {
        const startA = columnStart(a as PersistedColumnNode) ?? 0;
        const startB = columnStart(b as PersistedColumnNode) ?? 0;
        if (startA === startB) return 0;
        return startA - startB;
      });
      let fallbackStart = 0;
      sortedColumns.forEach((column) => {
        const span = normalizeColSpan(
          coerceNumber((column as LayoutColumnNode).span) ?? context.columnSpan,
        );
        const start =
          columnStart(column as PersistedColumnNode) ?? fallbackStart;
        visitNode(column, {
          rowIndex,
          columnStart: start,
          columnSpan: span,
        });
        fallbackStart = start + span;
      });
      return;
    }

    if ((node as LayoutColumnNode).type === "column") {
      const columnNode = node as PersistedColumnNode;
      const span = normalizeColSpan(
        coerceNumber(columnNode.span) ?? context.columnSpan,
      );
      const start = columnStart(columnNode) ?? context.columnStart;
      ensureArray(columnNode.children).forEach((child) =>
        visitNode(child, {
          rowIndex: context.rowIndex,
          columnStart: start,
          columnSpan: span,
        }),
      );
      return;
    }

    if ((node as LayoutFieldNode).type === "field") {
      const canvasNode = resolveFieldNode(node as PersistedFieldNode, context);
      result.push(canvasNode);
    }
  };

  ensureArray(layout.nodes).forEach((node) =>
    visitNode(node, { rowIndex: 0, columnStart: 0, columnSpan: DEFAULT_COL_SPAN }),
  );

  return result.sort((a, b) =>
    a.row === b.row ? a.col - b.col : a.row - b.row,
  );
}

export function canvasNodesToPreviewSchema(nodes: CanvasNode[]) {
  const sorted = [...nodes].sort((a, b) =>
    a.row === b.row ? a.col - b.col : a.row - b.row,
  );
  const fields = sorted.map((node) =>
    mapCanvasNodeToField(node, {
      row: Math.max(0, Math.round(node.row)),
      col: clampColumn(Math.round(node.col), normalizeColSpan(node.colSpan)),
      colSpan: normalizeColSpan(node.colSpan),
    }),
  );
  return { nodes: fields };
}

function slugifyName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .trim();
}

function generateUniqueName(
  base: string,
  nodes: CanvasNode[],
  currentId?: string,
): string {
  const existing = new Set(
    nodes
      .filter((node) => (currentId ? node.id !== currentId : true))
      .map((node) => node.name)
      .filter(Boolean),
  );

  const initial = slugifyName(base) || "campo";
  if (!existing.has(initial)) return initial;

  let counter = 2;
  let candidate = `${initial}-${counter}`;
  while (existing.has(candidate)) {
    counter += 1;
    candidate = `${initial}-${counter}`;
  }
  return candidate;
}

function buildDefaultOptions(componentKey: string) {
  if (!OPTION_COMPONENT_KEYS.has(componentKey)) return undefined;
  return [
    { label: "Opción 1", value: "option_1" },
    { label: "Opción 2", value: "option_2" },
  ];
}

interface CanvasGridContextValue {
  nodes: CanvasNode[];
  previewNode: CanvasPreviewNode | null;
  selectedNodeId: string | null;
  activeNodeId: string | null;
  selectNode: (id: string | null) => void;
  removeNode: (id: string) => void;
  updateNode: (id: string, patch: Partial<CanvasNode>) => void;
  setGridElement: (element: HTMLDivElement | null) => void;
}

const CanvasGridContext = createContext<CanvasGridContextValue | undefined>(
  undefined,
);

export function useCanvasGridContext() {
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

  const initialNodes = useMemo<CanvasNode[]>(() => layoutToCanvasNodes(layout), [layout]);

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

  const updateNode = useCallback(
    (id: string, patch: Partial<CanvasNode>) => {
      setNodes((prev) => {
        const index = prev.findIndex((node) => node.id === id);
        if (index < 0) return prev;

        const nextNodes = [...prev];
        const current = nextNodes[index];
        let updated: CanvasNode = { ...current, ...patch };

        if (patch.colSpan != null) {
          const numericColSpan =
            typeof patch.colSpan === "number"
              ? patch.colSpan
              : Number(patch.colSpan);
          const desiredColSpan = normalizeColSpan(
            Number.isNaN(numericColSpan) ? current.colSpan : numericColSpan,
          );
          const resolved = resolvePosition(
            { row: current.row, col: current.col },
            desiredColSpan,
            prev,
            id,
          );
          updated = {
            ...updated,
            colSpan: desiredColSpan,
            row: resolved.row,
            col: resolved.col,
          };
        }

        nextNodes[index] = updated;
        return nextNodes;
      });
    },
    [],
  );

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
          const id = nanoid();
          const name = generateUniqueName(data.component.label, prev);
          const newNode: CanvasNode = {
            id,
            componentKey: data.component.key,
            label: data.component.label,
            name,
            description: data.component.description ?? "",
            placeholder: "",
            required: false,
            row: resolved.row,
            col: resolved.col,
            colSpan,
            options: buildDefaultOptions(data.component.key),
            min: undefined,
            max: undefined,
            step: undefined,
            minDate: undefined,
            maxDate: undefined,
            accept: data.component.key === "file" ? [] : undefined,
            maxSizeMB: undefined,
          };
          createdId = id;
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
      updateNode,
      setGridElement,
    }),
    [
      nodes,
      previewNode,
      selectedNodeId,
      activeNodeId,
      selectNode,
      removeNode,
      updateNode,
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
