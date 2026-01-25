'use client';

import { ImageStyleId, IMAGE_STYLES } from '@/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ImageStyleSelectorProps {
  selectedStyle: ImageStyleId;
  customStyle: string;
  onStyleChange: (styleId: ImageStyleId) => void;
  onCustomStyleChange: (value: string) => void;
}

export function ImageStyleSelector({
  selectedStyle,
  customStyle,
  onStyleChange,
  onCustomStyleChange,
}: ImageStyleSelectorProps) {
  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Image Style</Label>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {IMAGE_STYLES.map((style) => (
          <button
            key={style.id}
            type="button"
            onClick={() => onStyleChange(style.id)}
            className={cn(
              'relative p-4 rounded-lg border-2 text-left transition-all',
              'hover:border-primary/50 hover:bg-accent/50',
              selectedStyle === style.id
                ? 'border-primary bg-primary/5'
                : 'border-border'
            )}
          >
            {selectedStyle === style.id && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
            <div className="font-medium text-sm">{style.name}</div>
            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {style.description}
            </div>
          </button>
        ))}
      </div>

      {selectedStyle === 'custom' && (
        <div className="space-y-2 mt-4">
          <Label htmlFor="custom-style">Custom Style Prompt</Label>
          <Input
            id="custom-style"
            value={customStyle}
            onChange={(e) => onCustomStyleChange(e.target.value)}
            placeholder="e.g., Studio Ghibli style, soft colors, hand-drawn..."
            className="max-w-md"
          />
          <p className="text-xs text-muted-foreground">
            This will be prepended to each scene's visual prompt.
          </p>
        </div>
      )}
    </div>
  );
}
