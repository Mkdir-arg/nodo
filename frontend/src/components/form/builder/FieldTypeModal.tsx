'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Type, Hash, Calendar, CheckSquare, List, FileText, Mail, Phone, Globe, CreditCard, Percent, Clock, Image, Star, Palette, MapPin, BarChart3, QrCode, Eye, Table, Folder, Heading1, Heading2, AlignLeft, Minus, Space, Badge, AlertCircle, Layout, ChevronDown, Tabs, User, Gallery, Map, TrendingUp, Grid3X3, Signature, Slider, Building, Navigation, Search, Link, RotateCcw, Calculator, Divide } from 'lucide-react';

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
  { id: 'integer', label: 'Entero', icon: Hash, category: 'input', defaultColSpan: 4, config: { name: '', label: '', step: 1 } },
  { id: 'currency', label: 'Moneda', icon: CreditCard, category: 'input', defaultColSpan: 6, config: { name: '', label: '', decimals: 2 } },
  { id: 'percent', label: 'Porcentaje', icon: Percent, category: 'input', defaultColSpan: 4, config: { name: '', label: '', min: 0, max: 100 } },
  { id: 'email', label: 'Email', icon: Mail, category: 'input', defaultColSpan: 6, config: { name: '', label: '' } },
  { id: 'phone', label: 'Teléfono', icon: Phone, category: 'input', defaultColSpan: 6, config: { name: '', label: '', mask: '' } },
  { id: 'url', label: 'URL', icon: Globe, category: 'input', defaultColSpan: 6, config: { name: '', label: '' } },
  { id: 'dni', label: 'DNI', icon: CreditCard, category: 'input', defaultColSpan: 4, config: { name: '', label: '' } },
  { id: 'cuit', label: 'CUIT', icon: CreditCard, category: 'input', defaultColSpan: 6, config: { name: '', label: '' } },
  { id: 'cbu', label: 'CBU', icon: CreditCard, category: 'input', defaultColSpan: 12, config: { name: '', label: '' } },
  { id: 'alias_bancario', label: 'Alias bancario', icon: CreditCard, category: 'input', defaultColSpan: 6, config: { name: '', label: '' } },
  { id: 'date', label: 'Fecha', icon: Calendar, category: 'input', defaultColSpan: 4, config: { name: '', label: '' } },
  { id: 'time', label: 'Hora', icon: Clock, category: 'input', defaultColSpan: 4, config: { name: '', label: '' } },
  { id: 'datetime', label: 'Fecha y Hora', icon: Calendar, category: 'input', defaultColSpan: 6, config: { name: '', label: '' } },
  { id: 'select', label: 'Select', icon: List, category: 'input', defaultColSpan: 6, config: { name: '', label: '', options: { mode: 'static', staticOptions: [] } } },
  { id: 'multiselect', label: 'Multi-select', icon: List, category: 'input', defaultColSpan: 6, config: { name: '', label: '', options: { mode: 'static', staticOptions: [] } } },
  { id: 'radio', label: 'Radio', icon: CheckSquare, category: 'input', defaultColSpan: 6, config: { name: '', label: '', options: { mode: 'static', staticOptions: [] } } },
  { id: 'checkbox', label: 'Checkbox', icon: CheckSquare, category: 'input', defaultColSpan: 6, config: { name: '', label: '' } },
  { id: 'switch', label: 'Switch', icon: CheckSquare, category: 'input', defaultColSpan: 6, config: { name: '', label: '' } },
  { id: 'file', label: 'Archivo', icon: FileText, category: 'input', defaultColSpan: 12, config: { name: '', label: '', multiple: false, maxSizeMB: 10 } },
  { id: 'image', label: 'Imagen', icon: Image, category: 'input', defaultColSpan: 12, config: { name: '', label: '', multiple: false, accept: ['.png', '.jpg', '.jpeg'] } },
  { id: 'signature', label: 'Firma', icon: Signature, category: 'input', defaultColSpan: 12, config: { name: '', label: '' } },
  { id: 'color', label: 'Color', icon: Palette, category: 'input', defaultColSpan: 4, config: { name: '', label: '' } },
  { id: 'rating', label: 'Rating', icon: Star, category: 'input', defaultColSpan: 6, config: { name: '', label: '', max: 5 } },
  { id: 'slider', label: 'Slider', icon: Slider, category: 'input', defaultColSpan: 6, config: { name: '', label: '', min: 0, max: 100 } },
  { id: 'address', label: 'Dirección', icon: Building, category: 'input', defaultColSpan: 12, config: { name: '', label: '' } },
  { id: 'geo_point', label: 'Geo punto', icon: MapPin, category: 'input', defaultColSpan: 6, config: { name: '', label: '' } },
  { id: 'lookup', label: 'Lookup', icon: Search, category: 'input', defaultColSpan: 6, config: { name: '', label: '', options: { mode: 'api', api: { url: '', queryParam: 'q' } } } },
  { id: 'relation', label: 'Relación', icon: Link, category: 'input', defaultColSpan: 6, config: { name: '', label: '', relation: { model: '', valueKey: 'id', labelKey: 'name' } } },
  { id: 'repeater', label: 'Repeater', icon: RotateCcw, category: 'input', defaultColSpan: 12, config: { name: '', label: '', columns: [] } },
  { id: 'table', label: 'Tabla', icon: Table, category: 'input', defaultColSpan: 12, config: { name: '', label: '', columns: [] } },
  { id: 'formula', label: 'Fórmula', icon: Calculator, category: 'input', defaultColSpan: 6, config: { name: '', label: '', formula: '' } },
  { id: 'hidden', label: 'Oculto', icon: Eye, category: 'input', defaultColSpan: 0, config: { name: '', defaultValue: '' } },
  
  // Visuales
  { id: 'title', label: 'Título', icon: Heading1, category: 'visual', defaultColSpan: 12, config: { title: 'Título' } },
  { id: 'subtitle', label: 'Subtítulo', icon: Heading2, category: 'visual', defaultColSpan: 12, config: { title: 'Subtítulo' } },
  { id: 'paragraph', label: 'Párrafo', icon: AlignLeft, category: 'visual', defaultColSpan: 12, config: { binding: { template: 'Texto del párrafo' } } },
  { id: 'small', label: 'Texto pequeño', icon: AlignLeft, category: 'visual', defaultColSpan: 12, config: { binding: { template: 'Texto pequeño' } } },
  { id: 'divider', label: 'Divider', icon: Minus, category: 'visual', defaultColSpan: 12, config: {} },
  { id: 'spacer', label: 'Espaciador', icon: Space, category: 'visual', defaultColSpan: 12, config: { height: 20 } },
  { id: 'badge', label: 'Badge', icon: Badge, category: 'visual', defaultColSpan: 4, config: { variant: 'default', binding: { template: 'Badge' } } },
  { id: 'pill', label: 'Píldora', icon: Badge, category: 'visual', defaultColSpan: 4, config: { variant: 'default', binding: { template: 'Píldora' } } },
  { id: 'alert', label: 'Alerta', icon: AlertCircle, category: 'visual', defaultColSpan: 12, config: { variant: 'info', binding: { template: 'Mensaje de alerta' } } },
  { id: 'card', label: 'Card', icon: Layout, category: 'visual', defaultColSpan: 12, config: { title: 'Título de la card' } },
  { id: 'accordion', label: 'Acordeón', icon: ChevronDown, category: 'visual', defaultColSpan: 12, config: { items: [] } },
  { id: 'tabs', label: 'Tabs', icon: Tabs, category: 'visual', defaultColSpan: 12, config: { items: [] } },
  { id: 'metric', label: 'Métrica', icon: BarChart3, category: 'visual', defaultColSpan: 4, config: { title: 'Métrica', binding: { fieldId: '', format: { kind: 'number' } } } },
  { id: 'keyvalue', label: 'Key-Value', icon: Grid3X3, category: 'visual', defaultColSpan: 6, config: { title: 'Datos', binding: { fields: [] } } },
  { id: 'avatar', label: 'Avatar', icon: User, category: 'visual', defaultColSpan: 4, config: { binding: { fieldId: '' }, fallbackInitials: 'AB' } },
  { id: 'image_view', label: 'Visor de imagen', icon: Image, category: 'visual', defaultColSpan: 6, config: { binding: { fieldId: '' } } },
  { id: 'gallery', label: 'Galería', icon: Gallery, category: 'visual', defaultColSpan: 12, config: { binding: { fieldId: '' } } },
  { id: 'map', label: 'Mapa', icon: Map, category: 'visual', defaultColSpan: 12, config: { binding: { fieldId: '' } } },
  { id: 'progress', label: 'Progreso', icon: TrendingUp, category: 'visual', defaultColSpan: 6, config: { binding: { fieldId: '' }, min: 0, max: 100 } },
  { id: 'qr', label: 'QR', icon: QrCode, category: 'visual', defaultColSpan: 4, config: { binding: { template: 'Texto QR' } } },
  { id: 'barcode', label: 'Barcode', icon: BarChart3, category: 'visual', defaultColSpan: 6, config: { binding: { template: '123456789' }, standard: 'code128' } },
  { id: 'list', label: 'Lista', icon: List, category: 'visual', defaultColSpan: 12, config: { title: 'Lista', binding: { fieldId: '', template: '' } } },
  { id: 'table_view', label: 'Tabla (lectura)', icon: Table, category: 'visual', defaultColSpan: 12, config: { title: 'Tabla', binding: { fieldId: '', fields: [] } } },
  
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