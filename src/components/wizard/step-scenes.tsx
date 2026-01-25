'use client';

import { useCallback } from 'react';
import { EditableScene } from '@/types';
import { SceneCard } from './scene-card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface StepScenesProps {
  scenes: EditableScene[];
  onScenesChange: (scenes: EditableScene[]) => void;
  onBack: () => void;
  onNext: () => void;
}

export function StepScenes({ scenes, onScenesChange, onBack, onNext }: StepScenesProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = scenes.findIndex((s) => s.id === active.id);
        const newIndex = scenes.findIndex((s) => s.id === over.id);

        const newScenes = arrayMove(scenes, oldIndex, newIndex).map((scene, index) => ({
          ...scene,
          scene_number: index + 1,
        }));

        onScenesChange(newScenes);
      }
    },
    [scenes, onScenesChange]
  );

  const handleSceneUpdate = useCallback(
    (id: string, field: 'narration' | 'visual_prompt', value: string) => {
      const newScenes = scenes.map((scene) =>
        scene.id === id ? { ...scene, [field]: value } : scene
      );
      onScenesChange(newScenes);
    },
    [scenes, onScenesChange]
  );

  const handleSceneDelete = useCallback(
    (id: string) => {
      const newScenes = scenes
        .filter((scene) => scene.id !== id)
        .map((scene, index) => ({
          ...scene,
          scene_number: index + 1,
        }));
      onScenesChange(newScenes);
    },
    [scenes, onScenesChange]
  );

  const handleAddScene = useCallback(() => {
    const newScene: EditableScene = {
      id: `temp-${Date.now()}`,
      scene_number: scenes.length + 1,
      narration: '',
      visual_prompt: '',
    };
    onScenesChange([...scenes, newScene]);
  }, [scenes, onScenesChange]);

  const canProceed = scenes.length > 0 && scenes.every((s) => s.narration.trim() && s.visual_prompt.trim());

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Edit Your Scenes</h2>
        <p className="text-muted-foreground">
          Drag to reorder, edit the text, or add/remove scenes as needed.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={scenes.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {scenes.map((scene, index) => (
              <SceneCard
                key={scene.id}
                scene={scene}
                index={index}
                onUpdate={handleSceneUpdate}
                onDelete={handleSceneDelete}
                canDelete={scenes.length > 1}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button
        type="button"
        variant="outline"
        onClick={handleAddScene}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Scene
      </Button>

      <div className="flex justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button type="button" onClick={onNext} disabled={!canProceed}>
          Next: Choose Style
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
