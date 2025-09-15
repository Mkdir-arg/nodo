import builderConfig from "../builder.config";
import FieldDraggable from "./FieldDraggable";

interface PaletteCategory {
  id: string;
  label: string;
  items: Array<{
    key: string;
    label: string;
    description?: string;
  }>;
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
        };
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

export default function Palette() {
  const categories = buildCategories();
  const isEmpty = categories.length === 0;

  return (
    <aside className="flex h-full min-h-0 flex-col gap-4 overflow-hidden rounded-xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
      <div>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Componentes disponibles</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Arrastrá un componente al lienzo para comenzar a construir la plantilla.
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {isEmpty ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white/70 p-4 text-xs text-slate-500 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-400">
            Todavía no hay componentes configurados.
          </div>
        ) : (
          categories.map((category) => (
            <section key={category.id} className="space-y-2">
              <header>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {category.label}
                </h3>
              </header>
              <div className="space-y-2">
                {category.items.map((component) => (
                  <FieldDraggable
                    key={component.key}
                    label={component.label}
                    description={component.description}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </aside>
  );
}
