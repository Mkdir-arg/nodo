'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Type, Hash, Calendar, CheckSquare, List, FileText, Mail, Phone, Globe, CreditCard, Percent, Clock, Image, Star, Palette, MapPin, BarChart3, Eye, Table, Folder, AlignLeft, Minus, AlertCircle, Layout, ChevronDown, User, Map, Search, Link, Calculator } from 'lucide-react';

interface FieldType {
  id: string;
  label: string;
  icon: any;
  category: 'input' | 'visual' | 'section';
  defaultColSpan: number;
  config: Record<string, any>;
}

const FIELD_TYPES: FieldType[] = [
  // Campos de entrada
  { id: 'text', label: 'Texto', icon: Type, category: 'input', defaultColSpan: 6, config: { name: '', label: '', placeholder: '' } },
  { id: 'textarea', label: 'Área de texto', icon: FileText, category: 'input', defaultColSpan: 12, config: { name: '', label: '', multilineRows: 3 } },
  { id: 'number', label: 'Número', icon: Hash, category: 'input', defaultColSpan: 4, config: { name: '', label: '', min: 0, max: 100 } },
  { id: 'email', label: 'Email', icon: Mail, category: 'input', defaultColSpan: 6, config: { name: '', label: '' } },
  { id: 'phone', label: 'Teléfono', icon: Phone, category: 'input', defaultColSpan: 6, config: { name: '', label: '', mask: '' } },
  { id: 'date', label: 'Fecha', icon: Calendar, category: 'input', defaultColSpan: 4, config: { name: '', label: '' } },
  { id: 'select', label: 'Select', icon: List, category: 'input', defaultColSpan: 6, config: { name: '', label: '', options: { mode: 'static', staticOptions: [] } } },
  { id: 'checkbox', label: 'Checkbox', icon: CheckSquare, category: 'input', defaultColSpan: 6, config: { name: '', label: '' } },
  { id: 'file', label: 'Archivo', icon: FileText, category: 'input', defaultColSpan: 12, config: { name: '', label: '', multiple: false, maxSizeMB: 10 } },
  { id: 'image', label: 'Imagen', icon: Image, category: 'input', defaultColSpan: 12, config: { name: '', label: '', multiple: false, accept: ['.png', '.jpg', '.jpeg'] } },
  
  // Visuales
  { id: 'title', label: 'Título', icon: Type, category: 'visual', defaultColSpan: 12, config: { title: 'Título' } },
  { id: 'paragraph', label: 'Párrafo', icon: AlignLeft, category: 'visual', defaultColSpan: 12, config: { binding: { template: 'Texto del párrafo' } } },
  { id: 'divider', label: 'Divider', icon: Minus, category: 'visual', defaultColSpan: 12, config: {} },
  { id: 'alert', label: 'Alerta', icon: AlertCircle, category: 'visual', defaultColSpan: 12, config: { variant: 'info', binding: { template: 'Mensaje de alerta' } } },
  { id: 'card', label: 'Card', icon: Layout, category: 'visual', defaultColSpan: 12, config: { title: 'Título de la card' } },
  { id: 'image_view', label: 'Visor de imagen', icon: Image, category: 'visual', defaultColSpan: 6, config: { binding: { fieldId: '' } } },
  { id: 'map', label: 'Mapa', icon: Map, category: 'visual', defaultColSpan: 12, config: { binding: { fieldId: '' } } },
  
  // Secciones
  { id: 'section', label: 'Sección', icon: Folder, category: 'section', defaultColSpan: 12, config: { title: 'Nueva Sección', columns: 12, collapsible: false } },
];

interface FieldTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (fieldType: FieldType) => void;
}

export default function FieldTypeModal({ isOpen, onClose, onSelect }: FieldTypeModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<'input' | 'visual' | 'section'>('input');
  
  if (!isOpen) return null;

  const filteredTypes = FIELD_TYPES.filter(type => type.category === selectedCategory);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Seleccionar tipo de campo</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex">
          <div className="w-48 border-r">
            <div className="p-4 space-y-2">
              <Button
                variant={selectedCategory === 'input' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedCategory('input')}
              >
                Campos de entrada
              </Button>
              <Button
                variant={selectedCategory === 'visual' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedCategory('visual')}
              >
                Elementos visuales
              </Button>
              <Button
                variant={selectedCategory === 'section' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedCategory('section')}
              >
                Secciones
              </Button>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto max-h-[60vh]">
            <div className="grid grid-cols-3 gap-3">
              {filteredTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Card
                    key={type.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      onSelect(type);
                      onClose();
                    }}
                  >
                    <CardContent className="p-4 text-center">
                      <Icon className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                      <div className="font-medium text-sm">{type.label}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}