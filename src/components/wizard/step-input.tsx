'use client';

import { useState } from 'react';
import { InputMode, LanguageCode, EditableScene, SUPPORTED_LANGUAGES } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles, FileText, PenLine } from 'lucide-react';
import { generateScriptPreview, generateScenesFromTranscript } from '@/actions/generate-script';
import { cn } from '@/lib/utils';

interface StepInputProps {
  inputMode: InputMode;
  prompt: string;
  transcript: string;
  language: LanguageCode;
  onInputModeChange: (mode: InputMode) => void;
  onPromptChange: (value: string) => void;
  onTranscriptChange: (value: string) => void;
  onLanguageChange: (language: LanguageCode) => void;
  onScenesGenerated: (scenes: EditableScene[], projectId: string | null) => void;
}

export function StepInput({
  inputMode,
  prompt,
  transcript,
  language,
  onInputModeChange,
  onPromptChange,
  onTranscriptChange,
  onLanguageChange,
  onScenesGenerated,
}: StepInputProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      let scenes: EditableScene[];

      if (inputMode === 'prompt') {
        if (!prompt.trim()) {
          setError('Please enter a prompt');
          setIsGenerating(false);
          return;
        }
        // Generate scenes from prompt
        const scriptItems = await generateScriptPreview(prompt, language);
        scenes = scriptItems.map((item, index) => ({
          id: `temp-${Date.now()}-${index}`,
          scene_number: item.scene_number,
          narration: item.narration,
          visual_prompt: item.visual_prompt,
        }));
      } else {
        if (!transcript.trim()) {
          setError('Please enter a transcript');
          setIsGenerating(false);
          return;
        }
        // Generate scenes from transcript
        scenes = await generateScenesFromTranscript(transcript, language);
      }

      onScenesGenerated(scenes, null);
    } catch (err) {
      console.error('Failed to generate scenes:', err);
      setError('Failed to generate scenes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = inputMode === 'prompt' ? prompt.trim().length > 0 : transcript.trim().length > 0;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Create Your Video</h2>
        <p className="text-muted-foreground">
          Enter a prompt to generate a script, or paste your own transcript.
        </p>
      </div>

      <Tabs
        value={inputMode}
        onValueChange={(v) => onInputModeChange(v as InputMode)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="prompt" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Generate from Prompt
          </TabsTrigger>
          <TabsTrigger value="transcript" className="flex items-center gap-2">
            <PenLine className="w-4 h-4" />
            Use My Transcript
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prompt" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">What's your video about?</Label>
            <Input
              id="prompt"
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder="e.g., 5 amazing facts about the ocean"
              disabled={isGenerating}
            />
          </div>
        </TabsContent>

        <TabsContent value="transcript" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="transcript">Your Transcript</Label>
            <Textarea
              id="transcript"
              value={transcript}
              onChange={(e) => onTranscriptChange(e.target.value)}
              placeholder="Paste your script here. We'll automatically split it into scenes and generate visuals for each part..."
              rows={8}
              disabled={isGenerating}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              We'll use AI to split your transcript into scenes and generate visual descriptions.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="space-y-2">
        <Label>Video Language</Label>
        <div className="flex flex-wrap gap-2">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <Button
              key={lang.code}
              type="button"
              variant={language === lang.code ? 'default' : 'outline'}
              size="sm"
              onClick={() => onLanguageChange(lang.code)}
              disabled={isGenerating}
              className={cn(
                'transition-all',
                language === lang.code && 'ring-2 ring-primary ring-offset-2'
              )}
            >
              {lang.nativeName}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <Button
        type="button"
        onClick={handleGenerate}
        disabled={!canGenerate || isGenerating}
        className="w-full"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating Scenes...
          </>
        ) : (
          <>
            <FileText className="w-4 h-4 mr-2" />
            Generate Scenes
          </>
        )}
      </Button>
    </div>
  );
}
