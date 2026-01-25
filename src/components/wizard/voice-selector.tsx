'use client';

import { useState } from 'react';
import { VoiceId, VOICES, LanguageCode } from '@/types';
import { cn } from '@/lib/utils';
import { Check, Play, Loader2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { generateVoicePreview } from '@/actions/generate-audio';

interface VoiceSelectorProps {
  selectedVoice: VoiceId;
  language: LanguageCode;
  onVoiceChange: (voiceId: VoiceId) => void;
}

export function VoiceSelector({ selectedVoice, language, onVoiceChange }: VoiceSelectorProps) {
  const [previewCache, setPreviewCache] = useState<Record<string, string>>({});
  const [loadingVoice, setLoadingVoice] = useState<string | null>(null);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);

  const handlePreview = async (voiceId: VoiceId) => {
    // Check cache first
    const cacheKey = `${voiceId}-${language}`;
    let audioData = previewCache[cacheKey];

    if (!audioData) {
      setLoadingVoice(voiceId);
      try {
        audioData = await generateVoicePreview(voiceId, language);
        setPreviewCache((prev) => ({ ...prev, [cacheKey]: audioData }));
      } catch (error) {
        console.error('Failed to generate voice preview:', error);
        setLoadingVoice(null);
        return;
      }
      setLoadingVoice(null);
    }

    // Play the audio
    setPlayingVoice(voiceId);
    const audio = new Audio(`data:audio/wav;base64,${audioData}`);
    audio.onended = () => setPlayingVoice(null);
    audio.onerror = () => setPlayingVoice(null);
    audio.play().catch(() => setPlayingVoice(null));
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Voice</Label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {VOICES.map((voice) => (
          <div
            key={voice.id}
            className={cn(
              'relative flex items-center gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer',
              'hover:border-primary/50 hover:bg-accent/50',
              selectedVoice === voice.id
                ? 'border-primary bg-primary/5'
                : 'border-border'
            )}
            onClick={() => onVoiceChange(voice.id)}
          >
            {selectedVoice === voice.id && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}

            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="flex-1">
              <div className="font-medium">{voice.name}</div>
              <div className="text-sm text-muted-foreground">
                {voice.description} • {voice.gender}
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handlePreview(voice.id);
              }}
              disabled={loadingVoice === voice.id || playingVoice === voice.id}
            >
              {loadingVoice === voice.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : playingVoice === voice.id ? (
                <Volume2 className="w-4 h-4 animate-pulse" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
