'use client';

import { CaptionStyleId, CaptionPosition } from '@/types';
import { getAllCaptionStyles } from '@/lib/caption-styles';
import { Check, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CaptionStyleSelectorProps {
  value: CaptionStyleId;
  onChange: (style: CaptionStyleId) => void;
  position: CaptionPosition;
  onPositionChange: (position: CaptionPosition) => void;
}

export function CaptionStyleSelector({
  value,
  onChange,
  position,
  onPositionChange,
}: CaptionStyleSelectorProps) {
  const styles = getAllCaptionStyles();

  return (
    <div className="space-y-4">
      {/* Style Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-muted-foreground">
          Caption Style
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {styles.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => onChange(style.id)}
              className={cn(
                'relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                'hover:border-cyan-500/50 hover:bg-cyan-500/5',
                value === style.id
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-border bg-card'
              )}
            >
              {/* Mini Preview */}
              <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative">
                <StylePreview styleId={style.id} position={position} />
              </div>

              {/* Style Name */}
              <span className={cn(
                'text-sm font-medium',
                value === style.id ? 'text-cyan-400' : 'text-foreground'
              )}>
                {style.name}
              </span>

              {/* Selected Checkmark */}
              {value === style.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-black" />
                </div>
              )}

              {/* Animation Badge */}
              {style.supportsAnimation && (
                <span className="absolute top-2 left-2 px-1.5 py-0.5 text-[10px] font-medium bg-purple-500/20 text-purple-400 rounded">
                  Animated
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Position Toggle */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Caption Position
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onPositionChange('center')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all flex-1',
              'hover:border-cyan-500/50 hover:bg-cyan-500/5',
              position === 'center'
                ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                : 'border-border bg-card text-muted-foreground'
            )}
          >
            <AlignVerticalJustifyCenter className="w-4 h-4" />
            <span className="text-sm font-medium">Center</span>
          </button>
          <button
            type="button"
            onClick={() => onPositionChange('bottom')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all flex-1',
              'hover:border-cyan-500/50 hover:bg-cyan-500/5',
              position === 'bottom'
                ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                : 'border-border bg-card text-muted-foreground'
            )}
          >
            <AlignVerticalJustifyEnd className="w-4 h-4" />
            <span className="text-sm font-medium">Bottom</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function StylePreview({ styleId, position }: { styleId: CaptionStyleId; position: CaptionPosition }) {
  const previewText = "Hello";
  const isCenter = position === 'center';

  switch (styleId) {
    case 'classic':
      return (
        <div className={cn(
          "absolute inset-0 flex justify-center",
          isCenter ? "items-center" : "items-end pb-2"
        )}>
          <div className="bg-black/60 px-3 py-1.5 w-full text-center">
            <span className="text-white text-[10px] font-medium">{previewText}</span>
          </div>
        </div>
      );

    case 'bold':
      return (
        <div className={cn(
          "absolute inset-0 flex justify-center",
          isCenter ? "items-center" : "items-end pb-2"
        )}>
          <span
            className="text-[10px] font-bold"
            style={{
              color: '#facc15',
              textShadow: '0 0 10px #eab308, 0 0 20px #eab308, 0 0 30px #eab308',
            }}
          >
            {previewText}
          </span>
        </div>
      );

    case 'minimal':
      return (
        <div className={cn(
          "absolute inset-0 flex justify-center",
          isCenter ? "items-center" : "items-end pb-2"
        )}>
          <span
            className="text-white text-[10px] font-normal"
            style={{
              textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            }}
          >
            {previewText}
          </span>
        </div>
      );

    case 'neon':
      return (
        <div className={cn(
          "absolute inset-0 flex justify-center",
          isCenter ? "items-center" : "items-end pb-2"
        )}>
          <span
            className="text-[10px] font-bold"
            style={{
              color: '#22d3ee',
              textShadow: '0 0 10px #06b6d4, 0 0 20px #06b6d4, 0 0 30px #06b6d4',
            }}
          >
            {previewText}
          </span>
        </div>
      );

    default:
      return null;
  }
}
