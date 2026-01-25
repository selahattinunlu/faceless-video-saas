'use client';

import React from 'react';
import { GeneratedScene, ImageEffectId, IMAGE_EFFECTS } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Volume2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StoryboardProps {
  scenes: GeneratedScene[];
  onEffectChange?: (sceneId: string, effect: ImageEffectId) => void;
}

export function Storyboard({ scenes, onEffectChange }: StoryboardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {scenes.map((scene) => (
        <Card 
          key={scene.id} 
          className={cn(
            "relative overflow-hidden transition-all duration-300",
            scene.status === 'complete' && "border-green-500/50 bg-green-900/10",
            scene.status === 'error' && "border-red-500/50 bg-red-900/10",
            scene.status === 'loading' && "border-blue-500/50",
            scene.status === 'pending' && "border-border"
          )}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Sahne {scene.scene_number}
              </CardTitle>
              {scene.status === 'loading' && (
                <span className="flex items-center text-xs text-blue-400">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Oluşturuluyor...
                </span>
              )}
              {scene.status === 'complete' && (
                <span className="text-xs text-green-400">Hazır</span>
              )}
              {scene.status === 'pending' && (
                <span className="text-xs text-muted-foreground">Sırada</span>
              )}
              {scene.status === 'error' && (
                <span className="text-xs text-red-400">Hata</span>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="aspect-[9/16] bg-muted rounded-lg flex items-center justify-center overflow-hidden relative group">
              {scene.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={scene.imageUrl} 
                  alt={`Sahne ${scene.scene_number}`} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="text-muted-foreground text-sm p-4 text-center">
                  {scene.status === 'loading' ? 'Görsel Çiziliyor...' : 'Görsel Bekleniyor'}
                </div>
              )}
              
              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs flex items-center gap-1">
                <Volume2 className={cn(
                  "h-3 w-3",
                  scene.audioBuffer ? "text-green-400" : "text-muted-foreground"
                )} />
                {scene.audioBuffer ? 'Ses Hazır' : 'Ses Bekleniyor'}
              </div>
            </div>

            <p className="text-xs text-foreground/80 line-clamp-3 bg-muted/50 p-2 rounded border border-border/50">
              {scene.narration}
            </p>

            {/* Effect Selector */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground whitespace-nowrap">
                Effect:
              </label>
              <select
                value={scene.effect || 'kenburns'}
                onChange={(e) => {
                  if (onEffectChange) {
                    onEffectChange(scene.id, e.target.value as ImageEffectId);
                  }
                }}
                className={cn(
                  "flex-1 text-xs px-2 py-1 rounded border bg-background",
                  "border-border hover:border-cyan-500/50 focus:border-cyan-500",
                  "focus:outline-none focus:ring-1 focus:ring-cyan-500/50",
                  "transition-colors cursor-pointer"
                )}
              >
                {IMAGE_EFFECTS.map((effect) => (
                  <option key={effect.id} value={effect.id}>
                    {effect.name}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
