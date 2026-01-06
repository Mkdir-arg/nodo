import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IconPicker } from './IconPicker';
import { HeaderActionSchema } from './schema';
import type { HeaderActionConfig } from './types';

interface ActionEditModalProps {
  action: HeaderActionConfig;
  onSave: (action: HeaderActionConfig) => void;
  onCancel: () => void;
}

export function ActionEditModal({ action, onSave, onCancel }: ActionEditModalProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<HeaderActionConfig>({
    resolver: zodResolver(HeaderActionSchema),
    defaultValues: action
  });

  const watchedType = watch('type');
  const watchedIcon = watch('icon');

  const onSubmit = (data: HeaderActionConfig) => {
    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">
          {action.id.startsWith('action_') ? 'Nueva Acción' : 'Editar Acción'}
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label className="text-sm">Etiqueta</Label>
            <Input
              {...register('label')}
              placeholder="Nombre de la acción"
              className="mt-1"
            />
            {errors.label && (
              <p className="text-xs text-red-500 mt-1">{errors.label.message}</p>
            )}
          </div>

          <div>
            <Label className="text-sm">Icono</Label>
            <IconPicker
              value={watchedIcon}
              onChange={(icon) => setValue('icon', icon)}
            />
            {errors.icon && (
              <p className="text-xs text-red-500 mt-1">{errors.icon.message}</p>
            )}
          </div>

          <div>
            <Label className="text-sm">Tipo</Label>
            <Select
              value={watchedType}
              onValueChange={(value: 'navigate' | 'command') => setValue('type', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="command">Comando</SelectItem>
                <SelectItem value="navigate">Navegación</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {watchedType === 'navigate' && (
            <div>
              <Label className="text-sm">URL de destino</Label>
              <Input
                {...register('to')}
                placeholder="/ruta/{{ data.campo }}"
                className="mt-1"
              />
              {errors.to && (
                <p className="text-xs text-red-500 mt-1">{errors.to.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Usa templates como {'{{ data.dni }}'} o {'{{ meta.legajoId }}'}
              </p>
            </div>
          )}

          {watchedType === 'command' && (
            <div>
              <Label className="text-sm">Comando</Label>
              <Select
                value={watch('name') || ''}
                onValueChange={(value: 'print') => setValue('name', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar comando" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="print">Imprimir</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Guardar
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}