'use client';

import { useEffect, useState } from 'react';
import { Project } from '@/types';
import { getProjects, deleteProject } from '@/actions/projects';
import { Video, Plus, Trash2, Clock, CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { UserMenu } from '@/components/auth/user-menu';
import { Button } from '@/components/ui/button';

const statusConfig = {
  draft: { icon: Clock, label: 'Draft', color: 'text-muted-foreground', animate: false },
  generating: { icon: Loader2, label: 'Generating', color: 'text-amber-500', animate: true },
  completed: { icon: CheckCircle, label: 'Completed', color: 'text-green-500', animate: false },
  failed: { icon: XCircle, label: 'Failed', color: 'text-red-500', animate: false }
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    setDeleting(id);
    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Header */}
      <header className="py-6 border-b border-border bg-background/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/generate"
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
                My Videos
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/generate">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Video
              </Button>
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <Video className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No videos yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first AI-generated video
            </p>
            <Link href="/generate">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Video
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => {
              const status = statusConfig[project.status];
              const StatusIcon = status.icon;

              return (
                <div
                  key={project.id}
                  className="group bg-card border border-border rounded-xl p-5 hover:border-cyan-500/50 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`flex items-center gap-2 text-sm ${status.color}`}>
                      <StatusIcon className={`w-4 h-4 ${status.animate ? 'animate-spin' : ''}`} />
                      <span>{status.label}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(project.id)}
                      disabled={deleting === project.id}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                    >
                      {deleting === project.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <Link href={`/projects/${project.id}`}>
                    <h3 className="font-semibold mb-2 line-clamp-2 hover:text-cyan-400 transition-colors">
                      {project.title}
                    </h3>
                  </Link>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {project.prompt}
                  </p>

                  <div className="text-xs text-muted-foreground">
                    {formatDate(project.created_at)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
