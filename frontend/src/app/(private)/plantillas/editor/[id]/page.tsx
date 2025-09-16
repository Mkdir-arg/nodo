"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { getPlantillaLayoutQueryOptions, saveLayout, plantillasKeys } from "@/lib/api/plantillas";
import { DynamicFormRenderer } from "@/lib/forms/runtime/DynamicFormRenderer";
import { Toolbar } from "./_components/Toolbar";
import { Palette } from "./_components/Palette";
import { PropertiesPanel } from "./_components/PropertiesPanel";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";
import type { FormLayout, LayoutNode, FieldType, FieldProps } from "@/lib/forms/types";

interface PageProps {
  params: { id: string };
}

function createDefaultField(type: FieldType): FieldProps {
  const baseId = nanoid(6);
  
  switch (type) {
    case "text":
      return { type: "text", name: `texto_${baseId}`, label: "Campo de texto" };
    case "textarea":
      return { type: "textarea", name: `textarea_${baseId}`, label: "Área de texto" };
    case "number":
      return { type: "number", name: `numero_${baseId}`, label: "Campo numérico" };
    case "date":
      return { type: "date", name: `fecha_${baseId}`, label: "Campo de fecha" };
    case "select":
      return { 
        type: "select", 
        name: `select_${baseId}`, 
        label: "Campo de selección",
        options: [
          { label: "Opción 1", value: "opt1" },
          { label: "Opción 2", value: "opt2" }
        ]
      };
    case "checkbox":
      return { type: "checkbox", name: `checkbox_${baseId}`, label: "Checkbox" };
    case "section":
      return { type: "section", title: "Nueva sección" };
    case "tabs":
      return { 
        type: "tabs", 
        tabs: [
          { id: "tab1", title: "Pestaña 1" },
          { id: "tab2", title: "Pestaña 2" }
        ]
      };
    case "repeater":
      return { type: "repeater", itemLabel: "Elemento" };
    default:
      return { type: "text", name: `campo_${baseId}`, label: "Campo" };
  }
}

export default function EditorPage({ params }: PageProps) {
  const [layout, setLayout] = useState<FormLayout>({ version: 1, nodes: [] });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [history, setHistory] = useState<FormLayout[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const queryClient = useQueryClient();

  const { data: plantilla, isLoading } = useQuery({
    ...getPlantillaLayoutQueryOptions(params.id),
    onSuccess: (data) => {
      if (data.layout.nodes.length > 0) {
        setLayout(data.layout);
        setHistory([data.layout]);
        setHistoryIndex(0);
      }
    }
  });

  const saveMutation = useMutation({
    mutationFn: (layout: FormLayout) => saveLayout(params.id, layout),
    onSuccess: () => {
      toast.success("Layout guardado correctamente");
      queryClient.invalidateQueries({ queryKey: plantillasKeys.layout(params.id) });
    },
    onError: () => {
      toast.error("Error al guardar el layout");
    }
  });

  const addToHistory = (newLayout: FormLayout) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newLayout);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleAddField = (type: FieldType) => {
    const newNode: LayoutNode = {
      id: nanoid(),
      kind: type === "section" || type === "tabs" || type === "repeater" ? "container" : "field",
      field: createDefaultField(type),
      containerType: type === "section" || type === "tabs" || type === "repeater" ? type : undefined,
      children: type === "section" || type === "repeater" ? [] : undefined,
      tabsChildren: type === "tabs" ? { tab1: [], tab2: [] } : undefined,
      row: Math.max(0, ...layout.nodes.map(n => n.row + 1)),
      col: 0,
      colSpan: 12
    };

    const newLayout = {
      ...layout,
      nodes: [...layout.nodes, newNode]
    };
    
    setLayout(newLayout);
    addToHistory(newLayout);
    setSelectedNodeId(newNode.id);
  };

  const handleUpdateNode = (nodeId: string, updates: Partial<LayoutNode>) => {
    const newLayout = {
      ...layout,
      nodes: layout.nodes.map(node => 
        node.id === nodeId ? { ...node, ...updates } : node
      )
    };
    
    setLayout(newLayout);
    addToHistory(newLayout);
  };

  const handleDeleteNode = (nodeId: string) => {
    const newLayout = {
      ...layout,
      nodes: layout.nodes.filter(node => node.id !== nodeId)
    };
    
    setLayout(newLayout);
    addToHistory(newLayout);
    setSelectedNodeId(null);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setLayout(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setLayout(history[historyIndex + 1]);
    }
  };

  const handleSave = () => {
    saveMutation.mutate(layout);
  };

  const selectedNode = layout.nodes.find(node => node.id === selectedNodeId) || null;

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col">
        <div className="border-b p-4">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="flex-1 flex">
          <div className="w-64 p-4">
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="flex-1 p-4">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Toolbar
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={handleSave}
        onTogglePreview={() => setIsPreview(!isPreview)}
        isPreview={isPreview}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        isSaving={saveMutation.isPending}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {!isPreview && (
          <div className="p-4 border-r bg-muted/30">
            <Palette onAddField={handleAddField} />
          </div>
        )}
        
        <div className="flex-1 p-4 overflow-auto">
          <Card>
            <CardContent className="p-6">
              {isPreview ? (
                <DynamicFormRenderer
                  layout={layout}
                  onSubmit={(data) => {
                    console.log("Preview form data:", data);
                    toast.success("Formulario enviado (modo preview)");
                  }}
                />
              ) : (
                <div className="grid grid-cols-12 gap-4 min-h-96">
                  {layout.nodes.map((node) => {
                    const colSpanClass = `col-span-${Math.min(12, Math.max(1, node.colSpan))}`;
                    const isSelected = selectedNodeId === node.id;
                    
                    return (
                      <div
                        key={node.id}
                        className={`${colSpanClass} relative group cursor-pointer border-2 border-dashed rounded-lg p-4 transition-colors ${
                          isSelected 
                            ? "border-blue-500 bg-blue-50" 
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedNodeId(node.id)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Seleccionar campo ${node.field?.label || node.id}`}
                      >
                        {node.kind === "field" && node.field && "name" in node.field ? (
                          <div className="pointer-events-none">
                            <div className="text-sm font-medium text-gray-600 mb-2">
                              {node.field.label || node.field.name}
                            </div>
                            <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                              {node.field.type}
                            </div>
                          </div>
                        ) : (
                          <div className="pointer-events-none">
                            <div className="text-sm font-medium text-gray-600 mb-2">
                              Contenedor: {node.containerType}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {layout.nodes.length === 0 && (
                    <div className="col-span-12 text-center py-12 text-gray-500">
                      Arrastra campos desde la paleta para comenzar a diseñar tu formulario
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {!isPreview && (
          <div className="p-4 border-l bg-muted/30">
            <PropertiesPanel
              selectedNode={selectedNode}
              onUpdateNode={handleUpdateNode}
              onDeleteNode={handleDeleteNode}
            />
          </div>
        )}
      </div>
    </div>
  );
}