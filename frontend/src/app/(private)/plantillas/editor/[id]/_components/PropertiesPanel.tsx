"use client";

import { type ChangeEvent, useEffect, useMemo, useState } from "react";

import {
  useCanvasGridContext,
  type CanvasNode,
} from "./CanvasGrid";

const OPTION_COMPONENT_KEYS = new Set([
  "select",
  "dropdown",
  "multiselect",
  "select_with_filter",
  "radio",
]);

const PLACEHOLDER_COMPONENT_KEYS = new Set([
  "text",
  "number",
  "select",
  "dropdown",
  "multiselect",
  "select_with_filter",
]);

const NUMBER_COMPONENT_KEYS = new Set(["number"]);
const DATE_COMPONENT_KEYS = new Set(["date"]);
const FILE_COMPONENT_KEYS = new Set(["file"]);

const COL_SPAN_VALUES = Array.from({ length: 12 }, (_, index) => index + 1);

type SelectOption = NonNullable<CanvasNode["options"]>[number];

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .trim();
}

function parseNumber(value: string): number | undefined {
  if (value === "") return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function ensureOptions(options?: CanvasNode["options"]): SelectOption[] {
  if (!Array.isArray(options)) return [];
  return options.map((option) => ({
    label: option.label ?? "",
    value: option.value ?? "",
  }));
}

function OptionEditor({
  option,
  onChange,
  onRemove,
}: {
  option: SelectOption;
  onChange: (option: SelectOption) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white/70 p-3 text-xs dark:border-slate-700 dark:bg-slate-900/50">
      <div className="space-y-1">
        <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Etiqueta
        </label>
        <input
          value={option.label}
          onChange={(event) => onChange({ ...option, label: event.target.value })}
          className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Valor
        </label>
        <div className="flex items-center gap-2">
          <input
            value={option.value}
            onChange={(event) => onChange({ ...option, value: event.target.value })}
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-sm font-medium text-red-500 transition hover:border-red-300 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-slate-700 dark:bg-slate-900 dark:text-red-300 dark:hover:border-red-600 dark:hover:bg-red-900/40"
            aria-label="Eliminar opción"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PropertiesPanel() {
  const { nodes, selectedNodeId, updateNode } = useCanvasGridContext();

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return nodes.find((node) => node.id === selectedNodeId) ?? null;
  }, [nodes, selectedNodeId]);

  const [nameInput, setNameInput] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedNode) {
      setNameInput("");
      setNameError(null);
      return;
    }
    setNameInput(selectedNode.name ?? "");
    setNameError(null);
  }, [selectedNode?.id, selectedNode?.name]);

  useEffect(() => {
    if (!selectedNode) {
      setNameError(null);
      return;
    }

    const currentName = selectedNode.name ?? "";
    if (nameInput !== currentName) {
      return;
    }

    if (!currentName) {
      setNameError("Ingresá un nombre.");
      return;
    }

    const duplicate = nodes.some(
      (node) => node.id !== selectedNode.id && node.name === currentName,
    );
    setNameError(duplicate ? "Ya existe un campo con este nombre." : null);
  }, [nameInput, nodes, selectedNode?.id, selectedNode?.name]);

  const componentKey = selectedNode?.componentKey ?? "";
  const supportsPlaceholder = PLACEHOLDER_COMPONENT_KEYS.has(componentKey);
  const supportsOptions = OPTION_COMPONENT_KEYS.has(componentKey);
  const isNumberField = NUMBER_COMPONENT_KEYS.has(componentKey);
  const isDateField = DATE_COMPONENT_KEYS.has(componentKey);
  const isFileField = FILE_COMPONENT_KEYS.has(componentKey);

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!selectedNode) return;
    const raw = event.target.value;
    const nextValue = slugify(raw);
    setNameInput(nextValue);

    if (!nextValue) {
      setNameError("Ingresá un nombre.");
      return;
    }

    const isDuplicate = nodes.some(
      (node) => node.id !== selectedNode.id && node.name === nextValue,
    );
    if (isDuplicate) {
      setNameError("Ya existe un campo con este nombre.");
      return;
    }

    setNameError(null);
    updateNode(selectedNode.id, { name: nextValue });
  };

  const handleAddOption = () => {
    if (!selectedNode) return;
    const currentOptions = ensureOptions(selectedNode.options);
    let counter = currentOptions.length + 1;
    let value = `option_${counter}`;
    const existingValues = new Set(currentOptions.map((item) => item.value));
    while (existingValues.has(value)) {
      counter += 1;
      value = `option_${counter}`;
    }
    const nextOptions = [
      ...currentOptions,
      { label: `Opción ${counter}`, value },
    ];
    updateNode(selectedNode.id, { options: nextOptions });
  };

  const handleOptionChange = (index: number, option: SelectOption) => {
    if (!selectedNode) return;
    const currentOptions = ensureOptions(selectedNode.options);
    const nextOptions = currentOptions.map((item, itemIndex) =>
      itemIndex === index ? option : item,
    );
    updateNode(selectedNode.id, { options: nextOptions });
  };

  const handleOptionRemove = (index: number) => {
    if (!selectedNode) return;
    const currentOptions = ensureOptions(selectedNode.options);
    const nextOptions = currentOptions.filter((_, itemIndex) => itemIndex !== index);
    updateNode(selectedNode.id, { options: nextOptions });
  };

  if (!selectedNode) {
    return (
      <aside className="flex h-full min-h-0 flex-col gap-4 overflow-hidden rounded-xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Propiedades
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Seleccioná un elemento en el lienzo para editar sus propiedades.
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white/60 p-4 text-center text-xs text-slate-500 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-400">
          Todavía no hay ningún elemento seleccionado.
        </div>
      </aside>
    );
  }

  const options = ensureOptions(selectedNode.options);

  return (
    <aside className="flex h-full min-h-0 flex-col gap-4 overflow-hidden rounded-xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
      <div>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Propiedades
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Configurá el campo seleccionado en el lienzo.
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        <section className="space-y-3 rounded-lg border border-slate-200 bg-white/70 p-3 text-xs dark:border-slate-700 dark:bg-slate-900/40">
          <header className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Información general
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Ajustá la etiqueta y el identificador interno del campo.
            </p>
          </header>

          <div className="space-y-2">
            <div className="space-y-1">
              <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Etiqueta visible
              </label>
              <input
                value={selectedNode.label}
                onChange={(event) =>
                  updateNode(selectedNode.id, { label: event.target.value })
                }
                className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Nombre interno
              </label>
              <input
                value={nameInput}
                onChange={handleNameChange}
                className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="mi-campo"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Utilizá un slug único para enlazar el campo con los datos del formulario.
              </p>
              {nameError ? (
                <p className="text-[11px] font-medium text-red-500 dark:text-red-300">
                  {nameError}
                </p>
              ) : null}
            </div>

            {supportsPlaceholder ? (
              <div className="space-y-1">
                <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Placeholder
                </label>
                <input
                  value={selectedNode.placeholder ?? ""}
                  onChange={(event) =>
                    updateNode(selectedNode.id, {
                      placeholder: event.target.value,
                    })
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="Texto de ejemplo"
                />
              </div>
            ) : null}

            <div className="space-y-1">
              <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Descripción
              </label>
              <textarea
                value={selectedNode.description ?? ""}
                onChange={(event) =>
                  updateNode(selectedNode.id, {
                    description: event.target.value,
                  })
                }
                className="h-20 w-full resize-none rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Texto de ayuda mostrado debajo del campo"
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={Boolean(selectedNode.required)}
                onChange={(event) =>
                  updateNode(selectedNode.id, { required: event.target.checked })
                }
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600"
              />
              El campo es obligatorio
            </label>
          </div>
        </section>

        <section className="space-y-3 rounded-lg border border-slate-200 bg-white/70 p-3 text-xs dark:border-slate-700 dark:bg-slate-900/40">
          <header className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Diseño
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Definí el ancho del campo dentro de la grilla.
            </p>
          </header>

          <div className="space-y-1">
            <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Columnas ocupadas
            </label>
            <select
              value={selectedNode.colSpan ?? 4}
              onChange={(event) => {
                const nextValue = Number(event.target.value);
                if (Number.isNaN(nextValue)) return;
                updateNode(selectedNode.id, { colSpan: nextValue });
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {COL_SPAN_VALUES.map((value) => (
                <option key={value} value={value}>
                  {value} columna{value === 1 ? "" : "s"}
                </option>
              ))}
            </select>
          </div>
        </section>

        {supportsOptions ? (
          <section className="space-y-3 rounded-lg border border-slate-200 bg-white/70 p-3 text-xs dark:border-slate-700 dark:bg-slate-900/40">
            <header className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Opciones
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Editá las alternativas disponibles para el usuario.
              </p>
            </header>

            <div className="space-y-2">
              {options.length === 0 ? (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Agregá al menos una opción para este campo.
                </p>
              ) : (
                options.map((option, index) => (
                  <OptionEditor
                    key={`option-${selectedNode.id}-${index}`}
                    option={option}
                    onChange={(value) => handleOptionChange(index, value)}
                    onRemove={() => handleOptionRemove(index)}
                  />
                ))
              )}
              <button
                type="button"
                onClick={handleAddOption}
                className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900/60"
              >
                Agregar opción
              </button>
            </div>
          </section>
        ) : null}

        {isNumberField ? (
          <section className="space-y-3 rounded-lg border border-slate-200 bg-white/70 p-3 text-xs dark:border-slate-700 dark:bg-slate-900/40">
            <header className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Restricciones numéricas
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Configurá los límites y el incremento para los valores válidos.
              </p>
            </header>

            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Valor mínimo
                </label>
                <input
                  type="number"
                  value={selectedNode.min ?? ""}
                  onChange={(event) =>
                    updateNode(selectedNode.id, {
                      min: parseNumber(event.target.value),
                    })
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Valor máximo
                </label>
                <input
                  type="number"
                  value={selectedNode.max ?? ""}
                  onChange={(event) =>
                    updateNode(selectedNode.id, {
                      max: parseNumber(event.target.value),
                    })
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Incremento
                </label>
                <input
                  type="number"
                  value={selectedNode.step ?? ""}
                  onChange={(event) =>
                    updateNode(selectedNode.id, {
                      step: parseNumber(event.target.value),
                    })
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </section>
        ) : null}

        {isDateField ? (
          <section className="space-y-3 rounded-lg border border-slate-200 bg-white/70 p-3 text-xs dark:border-slate-700 dark:bg-slate-900/40">
            <header className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Rango de fechas
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Definí las fechas mínima y máxima permitidas.
              </p>
            </header>

            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Fecha mínima
                </label>
                <input
                  type="date"
                  value={selectedNode.minDate ?? ""}
                  onChange={(event) =>
                    updateNode(selectedNode.id, {
                      minDate: event.target.value || undefined,
                    })
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Fecha máxima
                </label>
                <input
                  type="date"
                  value={selectedNode.maxDate ?? ""}
                  onChange={(event) =>
                    updateNode(selectedNode.id, {
                      maxDate: event.target.value || undefined,
                    })
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </section>
        ) : null}

        {isFileField ? (
          <section className="space-y-3 rounded-lg border border-slate-200 bg-white/70 p-3 text-xs dark:border-slate-700 dark:bg-slate-900/40">
            <header className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Restricciones del archivo
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Limitá los formatos permitidos y el tamaño máximo de subida.
              </p>
            </header>

            <div className="space-y-2">
              <div className="space-y-1">
                <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Formatos admitidos
                </label>
                <input
                  value={(selectedNode.accept ?? []).join(", ")}
                  onChange={(event) =>
                    updateNode(selectedNode.id, {
                      accept: event.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="pdf, jpg, png"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Separá cada extensión con una coma (por ejemplo: pdf, jpg).
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Tamaño máximo (MB)
                </label>
                <input
                  type="number"
                  value={selectedNode.maxSizeMB ?? ""}
                  onChange={(event) =>
                    updateNode(selectedNode.id, {
                      maxSizeMB: parseNumber(event.target.value),
                    })
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="10"
                />
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </aside>
  );
}
