import { useState } from 'react';
import {
  AlertTriangle,
  Eye,
  Loader2,
  RefreshCw,
  X,
} from 'lucide-react';
import {
  StepSyncStatus,
  StoryboardProject,
  StudioSectionId,
} from '../types/storyboard';

interface StorySyncBannerProps {
  project: StoryboardProject;
  isSyncing: boolean;
  onSynchronizeProject: () => void;
  onCancelStoryChange: () => void;
  onUpdateDependentSteps: () => void;
}

const STEP_LABELS: Record<StudioSectionId, string> = {
  production: 'Production Config',
  characters: 'Character Detection & DNA',
  backgrounds: 'Background Detection & DNA',
  audio: 'Voice & Audio',
  story: 'Story Outline',
  storyboard: 'Scene Planning & Storyboard',
  keyframes: 'First-Frame Keyframe',
  export: 'Preview & Export',
};

export function StorySyncBanner({
  project,
  isSyncing,
  onSynchronizeProject,
  onCancelStoryChange,
  onUpdateDependentSteps,
}: StorySyncBannerProps) {
  const [showReview, setShowReview] = useState(false);

  const dep = project.dependencyState;
  if (!dep) return null;

  const pending = dep.pendingStoryChange;
  const affectedEntries = (
    Object.entries(dep.stepStatuses) as Array<[StudioSectionId, StepSyncStatus]>
  ).filter(([, status]) => status === 'Outdated' || status === 'Needs Review');

  if (pending) {
    return (
      <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50/90 p-4 shadow-xs dark:border-amber-800/80 dark:bg-amber-950/40">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600 dark:text-amber-400" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Story identity changed. Dependent characters, backgrounds, and scenes need synchronization.
              </p>
              <p className="text-xs text-zinc-700 dark:text-zinc-300">
                {pending.reason}. Sinkronisasi akan mengganti karakter, latar lokasi, dan rencana scene cerita sebelumnya agar tidak tercampur.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap shrink-0 items-center gap-2">
            <button
              type="button"
              disabled={isSyncing}
              onClick={onSynchronizeProject}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-orange-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-orange-700 disabled:opacity-60"
            >
              {isSyncing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              <span>{isSyncing ? 'Menyinkronkan...' : 'Synchronize Project'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowReview((v) => !v)}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-amber-100/50 dark:border-amber-800 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>{showReview ? 'Tutup Review' : 'Review Changes'}</span>
            </button>

            <button
              type="button"
              disabled={isSyncing}
              onClick={onCancelStoryChange}
              className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            >
              <X className="h-3.5 w-3.5" />
              <span>Cancel</span>
            </button>
          </div>
        </div>

        {showReview && (
          <div className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-amber-200 bg-white/90 p-3.5 text-xs dark:border-amber-900/60 dark:bg-zinc-950/70 md:grid-cols-2">
            <div>
              <p className="font-bold text-rose-700 dark:text-rose-400">
                Akan Diarsipkan / Dihapus dari Active Project:
              </p>
              <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-zinc-700 dark:text-zinc-300">
                <li>
                  Cerita lama: {pending.previous.episodeTitle || '-'} ({pending.previous.storyCategory})
                </li>
                <li>
                  Karakter lama ({project.characters.length}):{' '}
                  {project.characters.map((c) => c.name).join(', ') || 'Tidak ada'}
                </li>
                <li>
                  Lokasi lama ({project.backgrounds.length}):{' '}
                  {project.backgrounds.map((b) => b.name).join(', ') || 'Tidak ada'}
                </li>
                <li>{project.scenes.length} scene cerita sebelumnya</li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-emerald-700 dark:text-emerald-400">
                Akan Disinkronkan untuk Cerita Baru:
              </p>
              <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-zinc-700 dark:text-zinc-300">
                <li>
                  Judul & Kategori Baru: {pending.next.episodeTitle} ({pending.next.storyCategory})
                </li>
                <li>Deteksi karakter baru + Generate Character DNA & DNA Lock baru</li>
                <li>Deteksi background & lokasi baru sesuai cerita</li>
                <li>
                  Susun ulang {project.production.sceneCount} scene ({project.production.sceneDuration}s · {project.production.aspectRatio} · {project.production.visualStyle})
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (affectedEntries.length === 0) return null;

  return (
    <div className="mb-6 flex flex-col justify-between gap-3 rounded-xl border border-orange-200 bg-orange-50/70 p-4 dark:border-orange-900/60 dark:bg-orange-950/25 sm:flex-row sm:items-center">
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-orange-800 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>Perubahan Data Induk Terdeteksi ({affectedEntries.length} tahap perlu sinkronisasi)</span>
        </div>
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          {affectedEntries.map(([stepId, status]) => (
            <span
              key={stepId}
              className={`rounded-md px-2 py-0.5 font-medium ${
                status === 'Outdated'
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
              }`}
            >
              {STEP_LABELS[stepId]}: {status}
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={isSyncing}
        onClick={onUpdateDependentSteps}
        className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
      >
        {isSyncing ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <RefreshCw className="h-3.5 w-3.5" />
        )}
        <span>Update Dependent Steps</span>
      </button>
    </div>
  );
}
