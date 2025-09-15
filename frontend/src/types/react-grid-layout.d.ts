declare module "react-grid-layout" {
  import * as React from "react";

  export interface Layout {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    maxW?: number;
    minH?: number;
    maxH?: number;
    isDraggable?: boolean;
    isResizable?: boolean;
    static?: boolean;
  }

  export interface ResponsiveProps {
    className?: string;
    layouts?: Record<string, Layout[]>;
    onLayoutChange?: (layout: Layout[]) => void;
    cols?: Record<string, number>;
    rowHeight?: number;
  }

  export interface ReactGridLayoutProps {
    className?: string;
    layout?: Layout[];
    width?: number;
    cols?: number;
    rowHeight?: number;
    onLayoutChange?: (layout: Layout[]) => void;
    children?: React.ReactNode;
  }

  export const Responsive: React.ComponentType<ResponsiveProps>;
  export const WidthProvider: <T>(component: T) => T;

  const ReactGridLayout: React.ComponentType<ReactGridLayoutProps>;
  export default ReactGridLayout;
}
