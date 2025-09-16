"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { getPlantillaLayoutQueryOptions, saveLayout, plantillasKeys } from "@/lib/api/plantillas";
import { DynamicFormRenderer } from "@/lib/forms/runtime/DynamicFormRenderer";
import { Toolbar } from "./_components/Toolbar";
import { Palette } from "./_components/Palette";
import { PropertiesPanel } from "./_components/PropertiesPanel";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/lib/toast";
import type { FormLayout, LayoutNode, FieldType, FieldProps } from "@/lib/forms/types";

const FIELD_DEFAULTS: Record<FieldType, Partial<FieldProps>> = {
  text: { type: "text", label: "Campo de texto" },
  textarea: { type: "textarea", label: "Área de texto" },
  number: { type: "number", label: "Campo numérico" },
  date: { type: "date", label: "Campo de fecha" },
  select: { type: "select", label: "Campo de selección", options: [{ label: "Opción 1", value: "opt1" }] },
  checkbox: { type: "checkbox", label: "Checkbox" },
  section: { type: "section", title: "Nueva sección" },
  tabs: { type: "tabs", tabs: [{ id: "tab1", title: "Pestaña 1" }] },
  repeater: { type: "repeater", itemLabel: "Elemento" },
  multiselect: { type: "multiselect", label: "Multi selección", options: [] },
  radio: { type: "radio", label: "Radio", options: [] },
  switch: { type: "switch", label: "Switch" },
  file: { type: "file", label: "Archivo" }
};

function createDefaultField(type: FieldType): FieldProps {
  const id = nanoid(4);
  return {
    ...FIELD_DEFAULTS[type],
    name: `${type}_${id}`
  } as FieldProps;
}

export default function EditorPage({ params }: { params: { id: string } }) {
  const [layout, setLayout] = useState<FormLayout>({ version: 1, nodes: [] });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [history, setHistory] = useState<FormLayout[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const queryClient = useQueryClient();

  const { isLoading } = useQuery({
    ...getPlantillaLayoutQueryOptions(params.id),
    select: (data) => {
      if (data.layout.nodes.length && !layout.nodes.length) {
        setLayout(data.layout);
        setHistory([data.layout]);
        setHistoryIndex(0);
      }
      return data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: () => saveLayout(params.id, layout),
    onSuccess: () => {
      toast.success("Guardado");
      queryClient.invalidateQueries({ queryKey: plantillasKeys.layout(params.id) });
    },
    onError: () => toast.error("Error al guardar")
  });

  const updateLayout = useCallback((newLayout: FormLayout) => {
    setLayout(newLayout);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newLayout);
    setHistory(newHistory.slice(-20)); // Limitar historial
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleAddField = useCallback((type: FieldType) => {
    const isContainer = ["section", "tabs", "repeater"].includes(type);
    const newNode: LayoutNode = {
      id: nanoid(),
      kind: isContainer ? "container" : "field",
      field: createDefaultField(type),
      containerType: isContainer ? type as any : undefined,
      children: type === "section" || type === "repeater" ? [] : undefined,
      tabsChildren: type === "tabs" ? { tab1: [] } : undefined,
      row: layout.nodes.length,
      col: 0,
      colSpan: 12
    };

    updateLayout({ ...layout, nodes: [...layout.nodes, newNode] });
    setSelectedNodeId(newNode.id);
  }, [layout, updateLayout]);

  const handleUpdateNode = useCallback((nodeId: string, updates: Partial<LayoutNode>) => {
    updateLayout({
      ...layout,
      nodes: layout.nodes.map(node => 
        node.id === nodeId ? { ...node, ...updates } : node
      )
    });
  }, [layout, updateLayout]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    updateLayout({
      ...layout,
      nodes: layout.nodes.filter(node => node.id !== nodeId)
    });
    setSelectedNodeId(null);
  }, [layout, updateLayout]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setLayout(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setLayout(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  const selectedNode = useMemo(() => 
    layout.nodes.find(node => node.id === selectedNodeId) || null,
    [layout.nodes, selectedNodeId]
  );

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="h-screen flex flex-col">
      <Toolbar
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={() => saveMutation.mutate()}
        onTogglePreview={() => setIsPreview(!isPreview)}
        isPreview={isPreview}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        isSaving={saveMutation.isPending}
      />
      
      <div className="flex-1 flex">
        {!isPreview && (
          <div className="w-64 p-4 border-r">
            <Palette onAddField={handleAddField} />
          </div>
        )}
        
        <div className="flex-1 p-4">
          <Card className="h-full">
            <CardContent className="p-6 h-full">
              {isPreview ? (
                <DynamicFormRenderer
                  layout={layout}
                  onSubmit={(data) => {
                    console.log(data);
                    toast.success("Formulario enviado");
                  }}
                />
              ) : (
                <div className="grid grid-cols-12 gap-4">
                  {layout.nodes.map((node) => (
                    <div
                      key={node.id}
                      className={`col-span-${node.colSpan} border-2 border-dashed rounded p-3 cursor-pointer transition-colors ${
                        selectedNodeId === node.id 
                          ? "border-blue-500 bg-blue-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedNodeId(node.id)}
                    >
                      <div className="text-sm font-medium">
                        {node.field?.label || node.containerType || "Campo"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {node.field?.type || node.containerType}
                      </div>
                    </div>
                  ))}
                  
                  {!layout.nodes.length && (
                    <div className="col-span-12 text-center py-12 text-gray-500">
                      Arrastra campos desde la paleta
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {!isPreview && (
          <div className="w-80 p-4 border-l">
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