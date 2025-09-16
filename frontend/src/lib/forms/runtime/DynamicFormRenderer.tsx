"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodSchemaFromLayout } from "../zodSchemaFromLayout";
import { TextField } from "./fields/TextField";
import { NumberField } from "./fields/NumberField";
import { SelectField } from "./fields/SelectField";
import { CheckboxField } from "./fields/CheckboxField";
import { DateField } from "./fields/DateField";
import type { FormLayout, LayoutNode, FieldProps } from "../types";

interface DynamicFormRendererProps {
  layout: FormLayout;
  onSubmit: (data: any) => void;
  defaultValues?: Record<string, any>;
}

function renderField(field: FieldProps) {
  switch (field.type) {
    case "text":
    case "textarea":
      return <TextField key={field.name} field={field} />;
    case "number":
      return <NumberField key={field.name} field={field} />;
    case "select":
      return <SelectField key={field.name} field={field} />;
    case "checkbox":
      return <CheckboxField key={field.name} field={field} />;
    case "date":
      return <DateField key={field.name} field={field} />;
    default:
      return <div key={field.name}>Campo no soportado: {field.type}</div>;
  }
}

function renderNodes(nodes: LayoutNode[]): JSX.Element[] {
  return nodes.map((node) => {
    const colSpanClass = `col-span-${Math.min(12, Math.max(1, node.colSpan))}`;
    
    if (node.kind === "field" && node.field) {
      return (
        <div key={node.id} className={colSpanClass}>
          {renderField(node.field)}
        </div>
      );
    }
    
    if (node.kind === "container") {
      if (node.containerType === "section") {
        return (
          <div key={node.id} className={colSpanClass}>
            <Card>
              <CardHeader>
                <CardTitle>{(node.field as any)?.title || "Sección"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-12 gap-4">
                  {node.children && renderNodes(node.children)}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }
      
      if (node.containerType === "tabs" && node.tabsChildren) {
        const tabs = (node.field as any)?.tabs || [];
        return (
          <div key={node.id} className={colSpanClass}>
            <Tabs defaultValue={tabs[0]?.id}>
              <TabsList>
                {tabs.map((tab: any) => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.title}
                  </TabsTrigger>
                ))}
              </TabsList>
              {tabs.map((tab: any) => (
                <TabsContent key={tab.id} value={tab.id}>
                  <div className="grid grid-cols-12 gap-4">
                    {node.tabsChildren![tab.id] && renderNodes(node.tabsChildren![tab.id])}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        );
      }
    }
    
    return <div key={node.id} className={colSpanClass}>Nodo no soportado</div>;
  });
}

export function DynamicFormRenderer({ layout, onSubmit, defaultValues = {} }: DynamicFormRendererProps) {
  const schema = zodSchemaFromLayout(layout);
  
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });
  
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-12 gap-4">
          {renderNodes(layout.nodes)}
        </div>
        <Button type="submit" className="w-full">
          Enviar
        </Button>
      </form>
    </FormProvider>
  );
}