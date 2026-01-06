import { ColorPicker } from './ColorPicker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GradientConfig {
  from: string;
  to: string;
  angle: number;
}

interface GradientEditorProps {
  gradient: GradientConfig;
  onChange: (gradient: GradientConfig) => void;
}

const GRADIENT_PRESETS = [
  { from: '#F00B80', to: '#7928CA', angle: 45, name: 'Rosa-Púrpura' },
  { from: '#3B82F6', to: '#1D4ED8', angle: 45, name: 'Azul' },
  { from: '#10B981', to: '#059669', angle: 45, name: 'Verde' },
  { from: '#F59E0B', to: '#D97706', angle: 45, name: 'Naranja' },
  { from: '#EF4444', to: '#DC2626', angle: 45, name: 'Rojo' },
  { from: '#8B5CF6', to: '#7C3AED', angle: 45, name: 'Violeta' },
];

export function GradientEditor({ gradient, onChange }: GradientEditorProps) {
  const handleFromChange = (from: string) => {
    onChange({ ...gradient, from });
  };

  const handleToChange = (to: string) => {
    onChange({ ...gradient, to });
  };

  const handleAngleChange = (angle: number) => {
    onChange({ ...gradient, angle });
  };

  const handlePresetClick = (preset: GradientConfig) => {
    onChange(preset);
  };

  const gradientStyle = {
    background: `linear-gradient(${gradient.angle}deg, ${gradient.from}, ${gradient.to})`
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Preview</Label>
        <div 
          className="w-full h-16 rounded-lg border mt-1"
          style={gradientStyle}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-gray-600">Color inicial</Label>
          <ColorPicker
            value={gradient.from}
            onChange={handleFromChange}
          />
        </div>
        <div>
          <Label className="text-xs text-gray-600">Color final</Label>
          <ColorPicker
            value={gradient.to}
            onChange={handleToChange}
          />
        </div>
      </div>

      <div>
        <Label className="text-xs text-gray-600">
          Ángulo: {gradient.angle}°
        </Label>
        <Input
          type="range"
          min="0"
          max="360"
          step="15"
          value={gradient.angle}
          onChange={(e) => handleAngleChange(Number(e.target.value))}
          className="mt-1"
        />
      </div>

      <div>
        <Label className="text-xs text-gray-600 mb-2 block">Presets</Label>
        <div className="grid grid-cols-3 gap-2">
          {GRADIENT_PRESETS.map((preset, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handlePresetClick(preset)}
              className="h-8 rounded border hover:border-gray-400 transition-colors"
              style={{
                background: `linear-gradient(${preset.angle}deg, ${preset.from}, ${preset.to})`
              }}
              title={preset.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}