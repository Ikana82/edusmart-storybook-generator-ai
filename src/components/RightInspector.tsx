import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Lock,
  RefreshCw,
  ShieldCheck,
  Unlock,
} from 'lucide-react';
import { SceneItem, StoryboardProject } from '../types/storyboard';
import { resolveVisualStyle } from '../utils/promptEngine';
import { isScenePromptOutdated } from '../utils/projectSync';

interface RightInspectorProps {
  project: StoryboardProject;
  selectedScene: SceneItem | undefined;
  onCopyText: (text: string, label: string) => void;
  onSynchronizePrompt: (sceneId?: string) => void;
}

export function RightInspector({
  project,
  selectedScene,
  onCopyText,
  onSynchronizePrompt,
}: RightInspectorProps) {
  const [outputTab, setOutputTab] = useState<'image' | 'video' | 'keyframe'>(
    'image'
  );

  const activeChars = project.characters.filter((c) => c.isActive);
  const resolvedSceneChars = selectedScene
    ? selectedScene.characterIds.map((id) => {
        const found = project.characters.find((c) => c.id === id);
        return found ? `${found.id} (${found.name})` : `${id} (Hilang!)`;
      })
    : [];
  const resolvedSceneBg = selectedScene
    ? project.backgrounds.find((b) => b.id === selectedScene.backgroundId)
    : undefined;

  const syncCheck = selectedScene
    ? isScenePromptOutdated(selectedScene, project)
    : { outdated: false, reasons: [] };

  const activePrompt = selectedScene
    ? outputTab === 'image'
      ? selectedScene.imagePrompt
      : outputTab === 'video'
        ? selectedScene.videoPrompt
        : selectedScene.keyframePrompt
    : '';

  return (
    <aside className="hidden w-80 shrink-0 border-l border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/30 xl:block">
      <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col gap-5 overflow-y-auto p-5">
        {/* Consistency DNA & Single Source of Truth Summary */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Single Source of Truth</span>
            </div>
            <span className="font-mono text-[11px] font-semibold text-orange-600 dark:text-orange-400">
              v{project.metadata.projectVersion || 1}
            </span>
          </div>

          <dl className="mt-3 space-y-2 text-xs">
            <div className="flex items-start justify-between gap-2">
              <dt className="shrink-0 text-zinc-500 dark:text-zinc-400">
                Active Project
              </dt>
              <dd className="text-right font-semibold text-zinc-900 dark:text-zinc-100">
                {project.production.episodeTitle || 'Belum diberi judul'}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-2">
              <dt className="text-zinc-500 dark:text-zinc-400">Character DNA</dt>
              <dd className="inline-flex items-center gap-1 font-semibold text-zinc-800 dark:text-zinc-200">
                {project.globalCharacterDnaLock ? (
                  <Lock className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Unlock className="h-3 w-3 text-zinc-400" />
                )}
                <span>
                  {activeChars.length} aktif ·{' '}
                  {project.globalCharacterDnaLock ? 'Locked' : 'Bebas'}
                </span>
              </dd>
            </div>

            <div className="flex items-center justify-between gap-2">
              <dt className="text-zinc-500 dark:text-zinc-400">Background DNA</dt>
              <dd className="inline-flex items-center gap-1 font-semibold text-zinc-800 dark:text-zinc-200">
                {project.globalBackgroundDnaLock ? (
                  <Lock className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Unlock className="h-3 w-3 text-zinc-400" />
                )}
                <span>{project.backgrounds.length} lokasi</span>
              </dd>
            </div>

            <div className="flex items-center justify-between gap-2">
              <dt className="text-zinc-500 dark:text-zinc-400">Format Visual</dt>
              <dd className="text-right font-mono font-semibold text-amber-700 dark:text-amber-400">
                {project.production.aspectRatio} · {project.production.resolution}
              </dd>
            </div>

            <div className="flex items-start justify-between gap-2">
              <dt className="shrink-0 text-zinc-500 dark:text-zinc-400">
                Gaya Visual
              </dt>
              <dd className="text-right font-medium text-zinc-800 dark:text-zinc-200">
                {resolveVisualStyle(project.production)}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-2">
              <dt className="text-zinc-500 dark:text-zinc-400">Mode OUTLINE</dt>
              <dd className="font-semibold text-amber-700 dark:text-amber-400">
                {project.production.outlineMode ? 'Aktif (Sticker)' : 'Nonaktif'}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-2">
              <dt className="text-zinc-500 dark:text-zinc-400">Bahasa Output</dt>
              <dd className="text-right font-medium text-zinc-800 dark:text-zinc-200">
                Prompt: {project.production.promptLanguage}
                <br />
                Dialog: {project.production.dialogueLanguage}
              </dd>
            </div>
          </dl>
        </div>

        {/* Live Prompt Inspector */}
        <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Live Prompt Inspector
            </h2>
            {selectedScene && (
              <span className="font-mono text-[11px] font-semibold text-orange-600 tabular-nums dark:text-orange-400">
                Scene {String(selectedScene.sceneNumber).padStart(2, '0')}
              </span>
            )}
          </div>

          {selectedScene && (
            <div className="mt-2.5 space-y-1.5 rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-[11px] dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between gap-2">
                <span className="text-zinc-500">Active Scene ID</span>
                <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                  {selectedScene.id}
                </span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="shrink-0 text-zinc-500">Character IDs</span>
                <span className="text-right font-mono font-medium text-zinc-800 dark:text-zinc-200">
                  {resolvedSceneChars.length > 0
                    ? resolvedSceneChars.join(', ')
                    : 'Tidak ada'}
                </span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="shrink-0 text-zinc-500">Background ID</span>
                <span className="text-right font-mono font-medium text-zinc-800 dark:text-zinc-200">
                  {selectedScene.backgroundId || '-'}{' '}
                  {resolvedSceneBg ? `(${resolvedSceneBg.name})` : '(Tidak valid)'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-zinc-500">Prompt Status</span>
                {syncCheck.outdated ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Outdated</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Up to Date</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {selectedScene && syncCheck.outdated && (
            <div className="mt-2.5 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-[11px] text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
              <p className="font-semibold">
                Prompt is outdated. Regenerate to synchronize.
              </p>
              {syncCheck.reasons[0] && (
                <p className="mt-0.5 text-[10px] opacity-90">
                  {syncCheck.reasons[0]}
                </p>
              )}
              <button
                type="button"
                onClick={() => onSynchronizePrompt(selectedScene.id)}
                className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-md bg-rose-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-rose-700"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Synchronize Prompt</span>
              </button>
            </div>
          )}

          <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
            {(
              [
                { id: 'image', label: 'Image' },
                { id: 'video', label: 'Video' },
                { id: 'keyframe', label: 'Keyframe' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setOutputTab(t.id)}
                className={`whitespace-nowrap rounded-md py-1 text-[11px] font-semibold transition-colors ${
                  outputTab === t.id
                    ? 'bg-white text-orange-700 shadow-xs dark:bg-zinc-900 dark:text-amber-400'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {selectedScene ? (
            <>
              <pre className="mt-3 flex-1 overflow-y-auto whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-[11px] leading-relaxed text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                {activePrompt}
              </pre>
              <button
                type="button"
                onClick={() =>
                  onCopyText(
                    activePrompt,
                    `${outputTab.toUpperCase()} Prompt Scene ${selectedScene.sceneNumber}`
                  )
                }
                className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-700"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Salin Prompt Terpilih</span>
              </button>
            </>
          ) : (
            <div className="mt-4 rounded-lg border border-dashed border-zinc-300 p-4 text-center text-xs text-zinc-500 dark:border-zinc-700">
              Pilih atau buat scene untuk memeriksa output prompt secara langsung.
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
