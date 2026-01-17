'use client';

import { LanguageCode, SUPPORTED_LANGUAGES } from '@/types';
import { cn } from '@/lib/utils';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  value: LanguageCode;
  onChange: (language: LanguageCode) => void;
  disabled?: boolean;
}

export function LanguageSelector({
  value,
  onChange,
  disabled = false,
}: LanguageSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Globe className="w-4 h-4" />
        Video Language
      </label>
      <div className="flex flex-wrap gap-2 justify-center">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            disabled={disabled}
            onClick={() => onChange(lang.code)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              'border-2 hover:border-cyan-500/50 hover:bg-cyan-500/5',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:bg-transparent',
              value === lang.code
                ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                : 'border-border bg-card text-muted-foreground'
            )}
          >
            {lang.nativeName}
          </button>
        ))}
      </div>
    </div>
  );
}
