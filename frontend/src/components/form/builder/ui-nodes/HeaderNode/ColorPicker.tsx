import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const COLOR_PRESETS = [
  '#F00B80', '#7928CA', '#3B82F6', '#10B981', '#F59E0B',
  '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316',
  '#EC4899', '#6366F1', '#14B8A6', '#A3A3A3', '#1F2937'
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value);

  const handlePresetClick = (color: string) => {
    onChange(color);
    setCustomColor(color);
    setIsOpen(false);
  };

  const handleCustomSubmit = () => {
    if (/^#[0-9A-Fa-f]{6}$/.test(customColor)) {
      onChange(customColor);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-start"
      >
        <div 
          className="w-4 h-4 rounded border mr-2"
          style={{ backgroundColor: value }}
        />
        {label || value}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 p-3">
          <div className="mb-3">
            <div className="text-xs font-medium mb-2">Colores predefinidos</div>
            <div className="grid grid-cols-5 gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handlePresetClick(color)}
                  className={`w-8 h-8 rounded border-2 ${
                    value === color ? 'border-gray-400' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium mb-2">Color personalizado</div>
            <div className="flex gap-2">
              <Input
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                placeholder="#FF0000"
                className="font-mono text-sm"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleCustomSubmit}
                disabled={!/^#[0-9A-Fa-f]{6}$/.test(customColor)}
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}