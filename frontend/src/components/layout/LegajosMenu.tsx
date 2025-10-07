"use client";

import Link from "next/link";
import { useMemo, useState, useCallback } from "react";
import clsx from "clsx";
import * as Icons from "lucide-react";

type MenuItem = {
  id: string;
  label: string;
  href: string;
  icon?: keyof typeof Icons;
};

type FlowStepPreview = {
  id: string;
  name?: string;
  title?: string;
  type?: string;
  order?: number;
};

type FlowMenuItem = MenuItem & {
  steps?: FlowStepPreview[];
};

type Props = {
  items: MenuItem[];
  flowItems?: FlowMenuItem[];
  compact?: boolean;
};

const STEP_ICON_MAP: Record<string, keyof typeof Icons> = {
  start: "PlayCircle",
  form: "FileText",
  evaluation: "CheckCircle2",
  email: "Mail",
  http: "Globe",
  delay: "Clock3",
  condition: "GitBranch",
  database: "Database",
  transform: "Sparkles",
};

function getIcon(name?: keyof typeof Icons) {
  const Ico = name ? (Icons as any)[name] : undefined;
  return typeof Ico === "function" ? Ico : Icons.Folder;
}

function getStepIcon(type?: string) {
  if (!type) return Icons.CircleDot;
  const iconName = STEP_ICON_MAP[type] ?? "CircleDot";
  const Ico = (Icons as any)[iconName];
  return typeof Ico === "function" ? Ico : Icons.CircleDot;
}

export default function LegajosMenu({ items, flowItems, compact = false }: Props) {
  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);
  const safeFlowItems = useMemo(() => (Array.isArray(flowItems) ? flowItems : []), [flowItems]);
  const [expandedFlows, setExpandedFlows] = useState<Record<string, boolean>>({});

  const toggleFlow = useCallback((id: string) => {
    setExpandedFlows((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const shouldRenderFlowDetails = !compact;

  return (
    <nav className="space-y-6">
      <section>
        <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Legajos
        </p>
        <ul className="mt-2 flex flex-col gap-1">
          {safeItems.map((it) => {
            const Ico = getIcon(it.icon);
            return (
              <li key={it.id}>
                <Link
                  href={it.href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/90"
                >
                  <Ico aria-hidden className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  <span>{it.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {safeFlowItems.length > 0 && (
        <section>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Flujos
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {safeFlowItems.map((flow) => {
              const Ico = getIcon(flow.icon);
              const isExpanded = expandedFlows[flow.id] ?? (!compact && safeFlowItems.length <= 3);
              const steps = Array.isArray(flow.steps) ? flow.steps : [];

              if (!shouldRenderFlowDetails) {
                return (
                  <li key={flow.id}>
                    <Link
                      href={flow.href}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/90"
                    >
                      <Ico aria-hidden className="h-4 w-4 text-indigo-500 dark:text-indigo-300" />
                      <span>{flow.label}</span>
                    </Link>
                  </li>
                );
              }

              return (
                <li
                  key={flow.id}
                  className="rounded-lg border border-transparent transition hover:border-slate-200 dark:hover:border-slate-700"
                >
                  <div
                    className={clsx(
                      "flex items-center justify-between gap-2 rounded-lg px-3 py-2",
                      isExpanded
                        ? "bg-slate-100/80 dark:bg-slate-800/60"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800/80"
                    )}
                  >
                    <Link
                      href={flow.href}
                      className="flex flex-1 items-center gap-2 text-sm text-slate-700 dark:text-slate-100"
                    >
                      <Ico aria-hidden className="h-4 w-4 text-indigo-500 dark:text-indigo-300" />
                      <span className="font-medium">{flow.label}</span>
                    </Link>
                    {!!steps.length && (
                      <button
                        type="button"
                        onClick={() => toggleFlow(flow.id)}
                        aria-expanded={isExpanded}
                        aria-label={`Ver nodos de ${flow.label}`}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-slate-500 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        <Icons.ChevronDown
                          aria-hidden
                          className={clsx("h-4 w-4 transition-transform", !isExpanded && "-rotate-90")}
                        />
                      </button>
                    )}
                  </div>

                  {isExpanded && steps.length > 0 && (
                    <ul className="mx-3 mb-3 mt-1 space-y-1 rounded-md border border-slate-100 bg-white/80 p-2 text-xs text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
                      {steps.map((step, index) => {
                        const StepIcon = getStepIcon(step.type);
                        const title = step.title || step.name || `Nodo ${index + 1}`;
                        const stepTypeLabel = step.type
                          ? step.type.charAt(0).toUpperCase() + step.type.slice(1)
                          : "Nodo";
                        return (
                          <li
                            key={step.id ?? `${flow.id}-step-${index}`}
                            className="flex items-center gap-2 rounded-md px-2 py-1"
                          >
                            <StepIcon aria-hidden className="h-4 w-4 text-slate-400" />
                            <span className="flex-1 truncate">{title}</span>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                              {stepTypeLabel}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </nav>
  );
}
