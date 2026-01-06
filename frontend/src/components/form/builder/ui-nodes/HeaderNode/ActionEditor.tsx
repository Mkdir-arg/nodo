import { useState } from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Settings, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActionEditModal } from './ActionEditModal';
import type { HeaderActionConfig } from './types';

interface ActionEditorProps {
  actions: HeaderActionConfig[];
  onChange: (actions: HeaderActionConfig[]) => void;
}

interface SortableActionProps {
  action: HeaderActionConfig;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableAction({ action, onEdit, onDelete }: SortableActionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: action.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg border ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <GripVertical size={16} />
      </button>
      
      <div className="flex-1">
        <div className="font-medium text-sm">{action.label || action.id}</div>
        <div className="text-xs text-gray-500">
          {action.type} • {action.icon}
          {action.type === 'navigate' && action.to && ` → ${action.to}`}
          {action.type === 'command' && action.name && ` → ${action.name}`}
        </div>
      </div>

      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-8 w-8 p-0"
        >
          <Settings size={14} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
}

export function ActionEditor({ actions, onChange }: ActionEditorProps) {
  const [editingAction, setEditingAction] = useState<HeaderActionConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = actions.findIndex(a => a.id === active.id);
    const newIndex = actions.findIndex(a => a.id === over.id);

    const newActions = [...actions];
    const [moved] = newActions.splice(oldIndex, 1);
    newActions.splice(newIndex, 0, moved);
    
    onChange(newActions);
  };

  const handleAdd = () => {
    const newAction: HeaderActionConfig = {
      id: `action_${Date.now()}`,
      icon: 'printer',
      type: 'command',
      name: 'print',
      label: 'Nueva acción'
    };
    setEditingAction(newAction);
    setIsModalOpen(true);
  };

  const handleEdit = (action: HeaderActionConfig) => {
    setEditingAction(action);
    setIsModalOpen(true);
  };

  const handleDelete = (actionId: string) => {
    if (confirm('¿Eliminar esta acción?')) {
      onChange(actions.filter(a => a.id !== actionId));
    }
  };

  const handleSaveAction = (action: HeaderActionConfig) => {
    const existingIndex = actions.findIndex(a => a.id === action.id);
    if (existingIndex >= 0) {
      const newActions = [...actions];
      newActions[existingIndex] = action;
      onChange(newActions);
    } else {
      onChange([...actions, action]);
    }
    setIsModalOpen(false);
    setEditingAction(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Acciones</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAdd}
          className="h-8"
        >
          <Plus size={14} className="mr-1" />
          Agregar
        </Button>
      </div>

      {actions.length > 0 ? (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={actions.map(a => a.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {actions.map((action) => (
                <SortableAction
                  key={action.id}
                  action={action}
                  onEdit={() => handleEdit(action)}
                  onDelete={() => handleDelete(action.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="text-center py-6 text-gray-500 text-sm">
          No hay acciones configuradas
        </div>
      )}

      {isModalOpen && editingAction && (
        <ActionEditModal
          action={editingAction}
          onSave={handleSaveAction}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingAction(null);
          }}
        />
      )}
    </div>
  );
}