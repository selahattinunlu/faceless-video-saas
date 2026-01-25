'use client';

import { WizardContainer } from '@/components/wizard/wizard-container';
import { Video, Sparkles, ArrowLeft, FolderOpen } from 'lucide-react';
import Link from 'next/link';
import { UserMenu } from '@/components/auth/user-menu';

export default function GeneratePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-cyan-500 selection:text-black">

      {/* Header */}
      <header className="py-6 border-b border-border bg-background/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </Link>
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-cyan-400 to-teal-500 w-10 h-10 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Video className="h-6 w-6 text-black" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                ShortsAI
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/projects"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">My Videos</span>
            </Link>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Powered by Gemini</span>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full">
        <WizardContainer />
      </main>
    </div>
  );
}
