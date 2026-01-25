'use client';

import React from 'react';
import { ImageEffectId, IMAGE_EFFECTS } from '@/types';
import { cn } from '@/lib/utils';

interface EffectSelectorProps {
  value: ImageEffectId;
  onChange: (effect: ImageEffectId) => void;
  disabled?: boolean;
}

export function EffectSelector({ value, onChange, disabled }: EffectSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">
        Image Effect
      </label>
      <div className="grid grid-cols-2 gap-2">
        {IMAGE_EFFECTS.map((effect) => (
          <button
            key={effect.id}
            onClick={() => onChange(effect.id)}
            disabled={disabled}
            className={cn(
              "flex flex-col items-start p-3 rounded-lg border transition-all text-left",
              "hover:border-cyan-500/50 hover:bg-cyan-500/5",
              value === effect.id
                ? "border-cyan-500 bg-cyan-500/10"
                : "border-border bg-card",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <span className="font-medium text-sm">{effect.name}</span>
            <span className="text-xs text-muted-foreground">{effect.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
