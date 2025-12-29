'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { GenerationStatus } from '@/types';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  status: GenerationStatus;
}

export function PromptInput({ value, onChange, onGenerate, status }: PromptInputProps) {
  const isDisabled = status !== GenerationStatus.IDLE && 
                     status !== GenerationStatus.READY && 
                     status !== GenerationStatus.ERROR;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isDisabled && value.trim()) {
      onGenerate();
    }
  };

  const getButtonText = () => {
    switch (status) {
      case GenerationStatus.SCRIPTING:
        return 'Senaryo Yazılıyor...';
      case GenerationStatus.GENERATING_ASSETS:
        return 'Üretiliyor...';
      default:
        return 'Oluştur';
    }
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
      <div className="relative bg-card rounded-xl p-2 flex flex-col sm:flex-row gap-2 border border-border shadow-2xl">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Örn: Mars'ta geçen fütüristik bir kahve dükkanı..."
          className="flex-1 bg-transparent border-0 text-foreground px-4 py-6 text-lg placeholder:text-muted-foreground/50 focus-visible:ring-0"
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
        />
        <Button
          onClick={onGenerate}
          disabled={isDisabled || !value.trim()}
          size="lg"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-6 font-semibold whitespace-nowrap"
        >
          {isDisabled ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {getButtonText()}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              {getButtonText()}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
