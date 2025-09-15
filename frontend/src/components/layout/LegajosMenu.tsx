"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import * as Icons from "lucide-react";

type MenuItem = {
  id: string;
  label: string;
  href: string;
  icon?: keyof typeof Icons; // p.ej. "Folder", "FileText", "Users"
};

type Props = {
  items: MenuItem[];
  title?: string;
};

function getIcon(name?: keyof typeof Icons) {
  const Ico = name ? (Icons as any)[name] : undefined;
  return typeof Ico === "function" ? Ico : Icons.Folder;
}

export default function LegajosMenu({ items, title = "Legajos" }: Props) {
  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  return (
    <nav className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        <Button asChild size="sm" variant="secondary">
          <Link href="/legajos/nuevo">Nuevo</Link>
        </Button>
      </div>

      <ul className="flex flex-col gap-1">
        {safeItems.map((it) => {
          const Ico = getIcon(it.icon);
          return (
            <li key={it.id}>
              <Link
                href={it.href}
                className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted"
              >
                <Ico aria-hidden className="h-4 w-4" />
                <span className="text-sm">{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
