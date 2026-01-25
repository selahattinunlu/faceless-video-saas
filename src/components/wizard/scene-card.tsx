'use client';

import { EditableScene } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { GripVertical, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SceneCardProps {
  scene: EditableScene;
  index: number;
  onUpdate: (id: string, field: 'narration' | 'visual_prompt', value: string) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
}

export function SceneCard({ scene, index, onUpdate, onDelete, canDelete }: SceneCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="relative">
      <CardContent className="pt-6">
        <div className="flex gap-4">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="flex items-center cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="w-5 h-5" />
          </div>

          {/* Scene Number */}
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
            {index + 1}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`narration-${scene.id}`}>Narration</Label>
              <Textarea
                id={`narration-${scene.id}`}
                value={scene.narration}
                onChange={(e) => onUpdate(scene.id, 'narration', e.target.value)}
                placeholder="Enter the narration text for this scene..."
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`visual-${scene.id}`}>Visual Prompt</Label>
              <Textarea
                id={`visual-${scene.id}`}
                value={scene.visual_prompt}
                onChange={(e) => onUpdate(scene.id, 'visual_prompt', e.target.value)}
                placeholder="Describe what should be shown visually in this scene..."
                rows={2}
                className="resize-none"
              />
            </div>
          </div>

          {/* Delete Button */}
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(scene.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
