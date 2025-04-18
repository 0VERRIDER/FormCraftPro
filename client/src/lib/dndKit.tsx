import { DndContext, DragEndEvent, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Field } from '@shared/schema';
import { ReactNode } from 'react';

export type DndKitContextProps = {
  items: Field[];
  children: ReactNode;
  onDragEnd: (event: DragEndEvent) => void;
};

export const DndKitContext = ({ items, children, onDragEnd }: DndKitContextProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={items.map(i => i.id)}>
        {children}
      </SortableContext>
    </DndContext>
  );
};

export const handleDragEnd = (event: DragEndEvent, items: Field[], setItems: (newItems: Field[]) => void) => {
  const { active, over } = event;
  
  if (over && active.id !== over.id) {
    const oldIndex = items.findIndex(item => item.id === active.id);
    const newIndex = items.findIndex(item => item.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      setItems(arrayMove(items, oldIndex, newIndex));
    }
  }
};

export const useSortableField = (id: string) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0.4 : 1
  };

  return {
    attributes,
    listeners,
    setNodeRef,
    style,
    isDragging
  };
};