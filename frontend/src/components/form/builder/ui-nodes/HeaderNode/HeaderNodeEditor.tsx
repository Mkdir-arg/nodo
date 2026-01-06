import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ActionEditor } from './ActionEditor';
import { IconPicker } from './IconPicker';
import { GradientEditor } from './GradientEditor';
import { HeaderConfigSchema, type HeaderConfigType } from './schema';
import type { HeaderNode } from './types';

interface HeaderNodeEditorProps {
  node: HeaderNode;
  onUpdate: (updates: Partial<HeaderNode>) => void;
}

export function HeaderNodeEditor({ node, onUpdate }: HeaderNodeEditorProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<HeaderConfigType>({
    resolver: zodResolver(HeaderConfigSchema),
    defaultValues: node.config
  });

  const onSubmit = (data: HeaderConfigType) => {
    onUpdate({ config: data });
  };

  const watchedValues = watch();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Configurar Encabezado</h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Background */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Imagen de Fondo</Label>
          <Input
            {...register('background.imageUrl')}
            placeholder="https://ejemplo.com/imagen.jpg"
            className="text-sm"
          />
          {errors.background?.imageUrl && (
            <p className="text-xs text-red-500">{errors.background.imageUrl.message}</p>
          )}
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={watchedValues.background?.overlay?.enabled}
              onCheckedChange={(checked) => setValue('background.overlay.enabled', checked)}
            />
            <Label className="text-sm">Overlay oscuro</Label>
          </div>
          
          {watchedValues.background?.overlay?.enabled && (
            <div>
              <Label className="text-xs text-gray-600">Opacidad: {watchedValues.background?.overlay?.opacity}</Label>
              <Input
                type="range"
                min="0"
                max="1"
                step="0.05"
                {...register('background.overlay.opacity', { valueAsNumber: true })}
                className="mt-1"
              />
            </div>
          )}
        </div>

        {/* Card */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Tarjeta</Label>
          
          <div>
            <Label className="text-xs text-gray-600">Título</Label>
            <Input
              {...register('card.title')}
              placeholder="{{ data.nombre }} {{ data.apellido }}"
              className="text-sm mt-1"
            />
            {errors.card?.title && (
              <p className="text-xs text-red-500">{errors.card.title.message}</p>
            )}
          </div>

          <div>
            <Label className="text-xs text-gray-600">Subtítulo</Label>
            <Input
              {...register('card.subtitle')}
              placeholder="Legajo de Ciudadano"
              className="text-sm mt-1"
            />
            {errors.card?.subtitle && (
              <p className="text-xs text-red-500">{errors.card.subtitle.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={watchedValues.card?.leftIcon?.enabled}
              onCheckedChange={(checked) => setValue('card.leftIcon.enabled', checked)}
            />
            <Label className="text-sm">Mostrar icono</Label>
          </div>

          {watchedValues.card?.leftIcon?.enabled && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-gray-600">Icono</Label>
                <IconPicker
                  value={watchedValues.card?.leftIcon?.icon || 'user'}
                  onChange={(icon) => setValue('card.leftIcon.icon', icon)}
                />
              </div>
              
              <div>
                <Label className="text-xs text-gray-600">Gradiente del icono</Label>
                <GradientEditor
                  gradient={watchedValues.card?.leftIcon?.gradient || { from: '#F00B80', to: '#7928CA', angle: 45 }}
                  onChange={(gradient) => setValue('card.leftIcon.gradient', gradient)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div>
          <ActionEditor
            actions={watchedValues.card?.actions || []}
            onChange={(actions) => setValue('card.actions', actions)}
          />
        </div>

        {/* Topbar */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Switch
              checked={watchedValues.topbar?.enabled}
              onCheckedChange={(checked) => setValue('topbar.enabled', checked)}
            />
            <Label className="text-sm">Mostrar barra superior</Label>
          </div>

          {watchedValues.topbar?.enabled && (
            <div>
              <Label className="text-xs text-gray-600">Texto de cerrar sesión</Label>
              <Input
                {...register('topbar.logoutLabel')}
                placeholder="Cerrar Sesión"
                className="text-sm mt-1"
              />
            </div>
          )}
        </div>

        <Button type="submit" className="w-full">
          Aplicar Cambios
        </Button>
      </form>

      <div className="text-xs text-gray-500 space-y-1">
        <p><strong>Templates disponibles:</strong></p>
        <p>• <code>{'{{ data.campo }}'}</code> - Datos del legajo</p>
        <p>• <code>{'{{ meta.legajoId }}'}</code> - ID del legajo</p>
        <p>• <code>{'{{ context.comedor }}'}</code> - Contexto</p>
      </div>
    </div>
  );
}