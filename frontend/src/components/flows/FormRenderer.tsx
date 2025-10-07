import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FormField {
  name: string
  type: string
  label: string
  required?: boolean
  placeholder?: string
  options?: Array<{ value: string; label: string }>
}

interface FormRendererProps {
  title: string
  description?: string
  fields: FormField[]
  onSubmit: (data: Record<string, any>) => void
  processing?: boolean
  submitLabel?: string
}

export function FormRenderer({
  title,
  description,
  fields,
  onSubmit,
  processing = false,
  submitLabel = "Continuar",
}: FormRendererProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const data: Record<string, any> = {}

    for (const [key, value] of formData.entries()) {
      if (data[key]) {
        data[key] = Array.isArray(data[key])
          ? [...data[key], value]
          : [data[key], value]
      } else {
        data[key] = value
      }
    }

    onSubmit(data)
  }

  const resolvedFields = Array.isArray(fields) ? fields : []

  const baseInputClasses =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"

  const fieldShouldSpanFullWidth = (field: FormField) =>
    ["textarea", "checkbox-group"].includes(field.type) ||
    (field.options && field.options.length > 4)

  const renderField = (field: FormField) => {
    const commonProps = {
      name: field.name,
      id: field.name,
      required: field.required,
      placeholder: field.placeholder,
      className: baseInputClasses,
    }

    switch (field.type) {
      case "email":
        return <input type="email" {...commonProps} />
      case "tel":
        return <input type="tel" {...commonProps} />
      case "number":
        return <input type="number" min="0" {...commonProps} />
      case "select":
        return (
          <select
            {...commonProps}
            defaultValue=""
            className={cn(
              baseInputClasses,
              "pr-10 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%226%22 viewBox=%220 0 10 6%22><path fill=%22%23637bff%22 d=%22M5 6 0 0h10z%22/></svg>')] bg-no-repeat bg-[length:12px] bg-[right_0.75rem_center] appearance-none"
            )}
          >
            <option value="" disabled>
              Seleccione una opción
            </option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      case "textarea":
        return (
          <textarea
            {...commonProps}
            rows={4}
            className={cn(baseInputClasses, "min-h-[120px] resize-y")}
          />
        )
      case "checkbox-group":
        return (
          <div className="grid gap-3 sm:grid-cols-2">
            {field.options?.map((option) => {
              const checkboxId = `${field.name}-${option.value}`
              return (
                <label
                  key={option.value}
                  htmlFor={checkboxId}
                  className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white/60 px-3 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-400 hover:shadow dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200"
                >
                  <input
                    id={checkboxId}
                    type="checkbox"
                    name={field.name}
                    value={option.value}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 transition focus:ring-blue-500"
                  />
                  <span>{option.label}</span>
                </label>
              )
            })}
          </div>
        )
      default:
        return <input type="text" {...commonProps} />
    }
  }

  return (
    <Card className="overflow-hidden border border-slate-200/80 shadow-sm dark:border-slate-700">
      <CardHeader className="bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-transparent pb-6 dark:from-slate-900/60 dark:via-slate-900/50">
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-blue-100 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-900/40 dark:text-blue-100"
          >
            Formulario
          </Badge>
          <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">
            {title}
          </CardTitle>
        </div>
        {description && (
          <CardDescription className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-6 sm:grid-cols-2">
            {resolvedFields.map((field) => (
              <div
                key={field.name}
                className={cn(
                  "space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 shadow-sm transition hover:border-blue-200 hover:bg-white/90 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-slate-700",
                  fieldShouldSpanFullWidth(field) && "sm:col-span-2"
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Label
                    htmlFor={field.name}
                    className="text-sm font-semibold text-slate-700 dark:text-slate-100"
                  >
                    {field.label}
                  </Label>
                  <Badge
                    variant={field.required ? "destructive" : "outline"}
                    className={cn(
                      "text-[10px] font-semibold uppercase tracking-wide",
                      field.required
                        ? "bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-200"
                        : "border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                    )}
                  >
                    {field.required ? "Requerido" : "Opcional"}
                  </Badge>
                </div>
                {field.placeholder && field.type !== "select" && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {field.placeholder}
                  </p>
                )}
                {renderField(field)}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Los campos marcados como requeridos son indispensables para
              continuar el flujo.
            </p>
            <Button
              type="submit"
              size="lg"
              disabled={processing}
              className="w-full sm:w-auto"
            >
              {processing ? (
                <span className="flex items-center gap-2">
                  <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Guardando...
                </span>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
