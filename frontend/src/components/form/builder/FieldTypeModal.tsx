'use client';

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface FieldType {
  id: string;
  label: string;
}

const FIELD_GROUPS = {
  'Datos referencia': [
    { id: 'ref:nombre', label: 'Nombre' },
    { id: 'ref:apellido', label: 'Apellido' },
    { id: 'email', label: 'Email' },
    { id: 'ref:documento_tipo', label: 'Tipo Documento' },
    { id: 'ref:documento', label: 'Numero Documento' },
    { id: 'ref:direccion_provincia', label: 'Provincia' },
    { id: 'ref:direccion_municipio', label: 'Municipio' },
    { id: 'ref:direccion', label: 'Calle' },
    { id: 'ref:direccion_numero', label: 'Numero' },
    { id: 'phone', label: 'Telefono' },
  ],
  Basicos: [
    { id: 'text', label: 'Texto corto' },
    { id: 'textarea', label: 'Texto largo' },
    { id: 'number', label: 'Numero' },
    { id: 'checkbox', label: 'Checkbox' },
    { id: 'info', label: 'Texto informativo' },
    { id: 'sum', label: 'Suma (readonly)' },
  ],
  Seleccion: [
    { id: 'select', label: 'Selector excluyente' },
    { id: 'dropdown', label: 'Lista desplegable' },
    { id: 'radio', label: 'Radio buttons' },
    { id: 'multiselect', label: 'Selector multiple' },
    { id: 'select_with_filter', label: 'Lista con filtro' },
  ],
  Avanzados: [
    { id: 'date', label: 'Fecha' },
    { id: 'time', label: 'Hora' },
    { id: 'slider', label: 'Deslizador' },
    { id: 'rating', label: 'Calificacion' },
    { id: 'color', label: 'Color' },
    { id: 'currency', label: 'Moneda' },
    { id: 'url', label: 'URL' },
    { id: 'password', label: 'Contrasena' },
    { id: 'code', label: 'Codigo' },
    { id: 'tags', label: 'Etiquetas' },
    { id: 'switch', label: 'Interruptor' },
    { id: 'document', label: 'Archivo' },
    { id: 'image', label: 'Imagen' },
    { id: 'cuit_razon_social', label: 'CUIT y Razon social' },
    { id: 'group', label: 'Grupo iterativo' },
  ],
  Visuales: [
    { id: 'ui:header', label: 'Encabezado Hero\nImagen + card' },
    { id: 'ui:divider', label: 'Separador' },
    { id: 'ui:banner', label: 'Banner' },
    { id: 'ui:paginator', label: 'Paginador\nWizard/Tabs' },
    { id: 'ui:relation', label: 'Relacion' },
  ],
};

interface FieldTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (fieldType: any) => void;
}

export default function FieldTypeModal({ isOpen, onClose, onSelect }: FieldTypeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Seleccionar tipo de campo</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="space-y-6">
            {Object.entries(FIELD_GROUPS).map(([groupName, fields]) => (
              <div key={groupName}>
                <h3 className="text-sm font-semibold mb-3 text-gray-700">{groupName}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {fields.map((field, idx) => (
                    <button
                      key={`${field.id}-${idx}`}
                      onClick={() => {
                        onSelect({ id: field.id, label: field.label });
                        onClose();
                      }}
                      className="border rounded-xl p-3 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors whitespace-pre-line text-sm"
                    >
                      {field.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
