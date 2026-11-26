import { useState } from 'react';
import {
  Check,
  Copy,
  Edit3,
  Film,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import {
  BackgroundProfile,
  CharacterProfile,
  SceneItem,
  StoryboardProject,
} from '../types/storyboard';
import { AudioTimelineEditor } from './AudioTimelineEditor';
import { validateAudioTimeline } from '../utils/timelineValidation';

interface StoryboardSectionProps {
  project: StoryboardProject;
  selectedSceneId: string;
  isGeneratingStoryboard: boolean;
  regeneratingSceneNumber: number | null;
  onSelectScene: (sceneId: string) => void;
  onGenerateStoryboard: () => void;
  onRegenerateSingleScene: (sceneNumber: number) => void;
  onAddScene: () => void;
  onUpdateScene: (sceneId: string, patch: Partial<SceneItem>) => void;
  onResetSceneTimeline: (sceneId: string) => void;
  onRequestDeleteScene: (scene: SceneItem) => void;
  onCopyText: (text: string, label: string) => void;
}

type SceneTab = 'image' | 'video' | 'audio' | 'preview';

export function StoryboardSection({
  project,
  selectedSceneId,
  isGeneratingStoryboard,
  regeneratingSceneNumber,
  onSelectScene,
  onGenerateStoryboard,
  onRegenerateSingleScene,
  onAddScene,
  onUpdateScene,
  onResetSceneTimeline,
  onRequestDeleteScene,
  onCopyText,
}: StoryboardSectionProps) {
  const [activeTabs, setActiveTabs] = useState<Record<string, SceneTab>>({});
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);

  const getTab = (sceneId: string): SceneTab => activeTabs[sceneId] || 'image';

  const setTab = (sceneId: string, tab: SceneTab) => {
    setActiveTabs((prev) => ({ ...prev, [sceneId]: tab }));
    onSelectScene(sceneId);
  };

  const handleCopyAllScenePrompts = (scene: SceneItem) => {
    const bundle = [
      `=== SCENE ${String(scene.sceneNumber).padStart(2, '0')}: ${scene.sceneTitle} ===`,
      `Lokasi: ${scene.sceneLocation} | Durasi: ${scene.sceneDuration}s`,
      '',
      '--- FIRST-FRAME KEYFRAME PROMPT ---',
      scene.keyframePrompt,
      '',
      '--- IMAGE PROMPT ---',
      scene.imagePrompt,
      '',
      '--- VIDEO PROMPT ---',
      scene.videoPrompt,
      '',
      '--- DIALOGUE & VOICE OVER ---',
      `Dialogue: ${scene.dialogue}`,
      `Voice Over: ${scene.voiceOver}`,
      '',
      '--- NEGATIVE PROMPT ---',
      scene.negativePrompt,
    ].join('\n');
    onCopyText(bundle, `Semua Prompt Scene ${scene.sceneNumber}`);
  };

  const inputClass =
    'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-orange-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100';

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
            Storyboard Generator
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Storyboard & Generator Prompt Per Scene
          </h1>
          <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            Menampilkan {project.scenes.length} scene (Target konfigurasi:{' '}
            <span className="font-mono font-semibold tabular-nums">
              {project.production.sceneCount}
            </span>{' '}
            scene ×{' '}
            <span className="font-mono font-semibold tabular-nums">
              {project.production.sceneDuration}s
            </span>
            ). Regenerate satu scene tidak mengubah DNA karakter maupun background.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onAddScene}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <Plus className="h-4 w-4" />
            <span>Add Scene</span>
          </button>

          <button
            type="button"
            onClick={onGenerateStoryboard}
            disabled={isGeneratingStoryboard}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700 disabled:opacity-60"
          >
            {isGeneratingStoryboard ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Film className="h-4 w-4" />
            )}
            <span>
              {isGeneratingStoryboard
                ? 'Menyusun Storyboard...'
                : 'Generate Storyboard & Prompt'}
            </span>
          </button>
        </div>
      </div>

      {project.scenes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 p-10 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Belum ada scene di storyboard.
          </p>
          <button
            type="button"
            onClick={onGenerateStoryboard}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
          >
            <Film className="h-4 w-4" />
            <span>Generate {project.production.sceneCount} Scene Sekarang</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {project.scenes.map((scene) => {
            const tab = getTab(scene.id);
            const isEditing = editingSceneId === scene.id;
            const isSelected = selectedSceneId === scene.id;
            const isRegenerating = regeneratingSceneNumber === scene.sceneNumber;
            const sceneChars = project.characters.filter((c) =>
              scene.characterIds.includes(c.id)
            );
            const timelineIssues = validateAudioTimeline(
              scene.audioTimeline,
              scene.sceneDuration,
              scene.allowTimelineOverlap
            );
            const hasTimelineErrors = timelineIssues.some(
              (i) => i.severity === 'error'
            );

            return (
              <article
                key={scene.id}
                onClick={() => onSelectScene(scene.id)}
                className={`rounded-xl border bg-white p-6 transition-colors dark:bg-zinc-900/60 ${
                  isSelected
                    ? 'border-orange-400 dark:border-orange-700'
                    : 'border-zinc-200 dark:border-zinc-800'
                }`}
              >
                {/* Scene Card Header */}
                <div className="flex flex-col justify-between gap-4 border-b border-zinc-100 pb-4 dark:border-zinc-800 md:flex-row md:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="font-mono font-bold text-orange-600 tabular-nums dark:text-orange-400">
                        SCENE {String(scene.sceneNumber).padStart(2, '0')}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {scene.sceneDuration} detik
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{scene.sceneLocation}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Pemeran:{' '}
                        {sceneChars.map((c) => c.name).join(', ') || 'Tidak ada'}
                      </span>
                    </div>
                    <h2 className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      {scene.sceneTitle}
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {scene.sceneDescription}
                    </p>
                  </div>

                  {/* Card Actions */}
                  <div className="flex flex-wrap shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSceneId(isEditing ? null : scene.id);
                      }}
                      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        isEditing
                          ? 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200'
                      }`}
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>{isEditing ? 'Selesai Edit' : 'Edit Scene'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isRegenerating}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRegenerateSingleScene(scene.sceneNumber);
                      }}
                      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                    >
                      <RefreshCw
                        className={`h-3.5 w-3.5 ${isRegenerating ? 'animate-spin' : ''}`}
                      />
                      <span>Regenerate Scene</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyAllScenePrompts(scene);
                      }}
                      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-700"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy All</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRequestDeleteScene(scene);
                      }}
                      aria-label={`Hapus Scene ${scene.sceneNumber}`}
                      className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:border-rose-200 hover:bg-rose-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inline Full Scene Editor */}
                {isEditing && (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/40 p-4 dark:border-amber-900/50 dark:bg-amber-950/15">
                    <h3 className="mb-3 text-xs font-bold text-amber-900 dark:text-amber-300">
                      Editor Detail Scene {String(scene.sceneNumber).padStart(2, '0')}
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                          Judul Scene
                        </label>
                        <input
                          type="text"
                          value={scene.sceneTitle}
                          onChange={(e) =>
                            onUpdateScene(scene.id, { sceneTitle: e.target.value })
                          }
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                          Durasi (detik)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={60}
                          value={scene.sceneDuration}
                          onChange={(e) =>
                            onUpdateScene(scene.id, {
                              sceneDuration: Math.max(
                                1,
                                Math.min(60, Number(e.target.value) || 1)
                              ),
                            })
                          }
                          className={`${inputClass} font-mono tabular-nums`}
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                          Lokasi / Background Sync
                        </label>
                        <select
                          value={scene.backgroundId}
                          onChange={(e) => {
                            const bg: BackgroundProfile | undefined =
                              project.backgrounds.find(
                                (b) => b.id === e.target.value
                              );
                            onUpdateScene(scene.id, {
                              backgroundId: e.target.value,
                              sceneLocation: bg?.name || scene.sceneLocation,
                              lighting: bg?.lightingDirection || scene.lighting,
                            });
                          }}
                          className={inputClass}
                        >
                          {project.backgrounds.map((bg) => (
                            <option key={bg.id} value={bg.id}>
                              {bg.id} — {bg.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2 lg:col-span-3">
                        <label className="mb-1 block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                          Karakter dalam Scene
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {project.characters
                            .filter((c) => c.isActive)
                            .map((char: CharacterProfile) => {
                              const included = scene.characterIds.includes(
                                char.id
                              );
                              return (
                                <button
                                  key={char.id}
                                  type="button"
                                  onClick={() => {
                                    const nextIds = included
                                      ? scene.characterIds.filter(
                                          (id) => id !== char.id
                                        )
                                      : [...scene.characterIds, char.id];
                                    onUpdateScene(scene.id, {
                                      characterIds: nextIds,
                                    });
                                  }}
                                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${
                                    included
                                      ? 'border-emerald-500 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                      : 'border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400'
                                  }`}
                                >
                                  {included && <Check className="h-3 w-3" />}
                                  <span>{char.name}</span>
                                </button>
                              );
                            })}
                        </div>
                      </div>

                      <div className="sm:col-span-2 lg:col-span-3">
                        <label className="mb-1 block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                          Deskripsi Scene
                        </label>
                        <textarea
                          rows={2}
                          value={scene.sceneDescription}
                          onChange={(e) =>
                            onUpdateScene(scene.id, {
                              sceneDescription: e.target.value,
                            })
                          }
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                          Tujuan Edukasi
                        </label>
                        <input
                          type="text"
                          value={scene.educationalObjective}
                          onChange={(e) =>
                            onUpdateScene(scene.id, {
                              educationalObjective: e.target.value,
                            })
                          }
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                          Camera Shot
                        </label>
                        <input
                          type="text"
                          value={scene.cameraShot}
                          onChange={(e) =>
                            onUpdateScene(scene.id, { cameraShot: e.target.value })
                          }
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                          Camera Movement
                        </label>
                        <input
                          type="text"
                          value={scene.cameraMovement}
                          onChange={(e) =>
                            onUpdateScene(scene.id, {
                              cameraMovement: e.target.value,
                            })
                          }
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                          Composition
                        </label>
                        <input
                          type="text"
                          value={scene.composition}
                          onChange={(e) =>
                            onUpdateScene(scene.id, {
                              composition: e.target.value,
                            })
                          }
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                          Posisi Karakter
                        </label>
                        <input
                          type="text"
                          value={scene.characterPositions}
                          onChange={(e) =>
                            onUpdateScene(scene.id, {
                              characterPositions: e.target.value,
                            })
                          }
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                          Aksi Karakter
                        </label>
                        <input
                          type="text"
                          value={scene.characterAction}
                          onChange={(e) =>
                            onUpdateScene(scene.id, {
                              characterAction: e.target.value,
                            })
                          }
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                          Ekspresi Wajah
                        </label>
                        <input
                          type="text"
                          value={scene.facialExpression}
                          onChange={(e) =>
                            onUpdateScene(scene.id, {
                              facialExpression: e.target.value,
                            })
                          }
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                          Gerakan Tubuh
                        </label>
                        <input
                          type="text"
                          value={scene.bodyMovement}
                          onChange={(e) =>
                            onUpdateScene(scene.id, {
                              bodyMovement: e.target.value,
                            })
                          }
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                          Animasi Lingkungan
                        </label>
                        <input
                          type="text"
                          value={scene.environmentAnimation}
                          onChange={(e) =>
                            onUpdateScene(scene.id, {
                              environmentAnimation: e.target.value,
                            })
                          }
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                          Lighting
                        </label>
                        <input
                          type="text"
                          value={scene.lighting}
                          onChange={(e) =>
                            onUpdateScene(scene.id, { lighting: e.target.value })
                          }
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                          Sound Effects
                        </label>
                        <input
                          type="text"
                          value={scene.soundEffects}
                          onChange={(e) =>
                            onUpdateScene(scene.id, {
                              soundEffects: e.target.value,
                            })
                          }
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                          Background Music
                        </label>
                        <input
                          type="text"
                          value={scene.backgroundMusic}
                          onChange={(e) =>
                            onUpdateScene(scene.id, {
                              backgroundMusic: e.target.value,
                            })
                          }
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                          Negative Prompt Override
                        </label>
                        <input
                          type="text"
                          value={scene.negativePrompt}
                          onChange={(e) =>
                            onUpdateScene(scene.id, {
                              negativePrompt: e.target.value,
                            })
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Segmented Tabs */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
                    {(
                      [
                        { id: 'image', label: 'Image Prompt' },
                        { id: 'video', label: 'Video Prompt' },
                        {
                          id: 'audio',
                          label: hasTimelineErrors ? 'Audio (!)' : 'Audio',
                        },
                        { id: 'preview', label: 'Preview' },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTab(scene.id, t.id);
                        }}
                        className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                          tab === t.id
                            ? 'bg-white text-orange-700 shadow-xs dark:bg-zinc-900 dark:text-amber-400'
                            : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopyText(
                          scene.imagePrompt,
                          `Image Prompt Scene ${scene.sceneNumber}`
                        );
                      }}
                      className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
                    >
                      <Copy className="h-3 w-3" />
                      <span>Copy Image Prompt</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopyText(
                          scene.videoPrompt,
                          `Video Prompt Scene ${scene.sceneNumber}`
                        );
                      }}
                      className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
                    >
                      <Copy className="h-3 w-3" />
                      <span>Copy Video Prompt</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopyText(
                          `${scene.dialogue}\nVoice Over: ${scene.voiceOver}`,
                          `Dialog Scene ${scene.sceneNumber}`
                        );
                      }}
                      className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
                    >
                      <Copy className="h-3 w-3" />
                      <span>Copy Dialogue</span>
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="mt-4">
                  {tab === 'image' && (
                    <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-4 font-mono text-xs leading-relaxed text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                      {scene.imagePrompt}
                    </pre>
                  )}

                  {tab === 'video' && (
                    <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-4 font-mono text-xs leading-relaxed text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                      {scene.videoPrompt}
                    </pre>
                  )}

                  {tab === 'audio' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            Ringkasan Dialog
                          </label>
                          <input
                            type="text"
                            value={scene.dialogue}
                            onChange={(e) =>
                              onUpdateScene(scene.id, {
                                dialogue: e.target.value,
                              })
                            }
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            Ringkasan Voice Over
                          </label>
                          <input
                            type="text"
                            value={scene.voiceOver}
                            onChange={(e) =>
                              onUpdateScene(scene.id, {
                                voiceOver: e.target.value,
                              })
                            }
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <AudioTimelineEditor
                        segments={scene.audioTimeline}
                        sceneDuration={scene.sceneDuration}
                        allowOverlap={scene.allowTimelineOverlap}
                        voiceProfiles={project.voiceProfiles}
                        characters={project.characters}
                        onChangeSegments={(segs) => {
                          const diag = segs
                            .filter((s) => s.audioType === 'Dialog / Lip-sync')
                            .map((s) => `${s.speakerName}: "${s.text}"`)
                            .join(' | ');
                          const vo = segs
                            .filter((s) => s.audioType === 'Voice Over')
                            .map((s) => s.text)
                            .join(' ');
                          onUpdateScene(scene.id, {
                            audioTimeline: segs,
                            dialogue: diag,
                            voiceOver: vo,
                          });
                        }}
                        onToggleOverlap={(allow) =>
                          onUpdateScene(scene.id, {
                            allowTimelineOverlap: allow,
                          })
                        }
                        onResetTimeline={() => onResetSceneTimeline(scene.id)}
                      />
                    </div>
                  )}

                  {tab === 'preview' && (
                    <div className="grid grid-cols-1 gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          Metadata Produksi Scene
                        </p>
                        <dl className="mt-2 space-y-1.5 text-xs">
                          <div className="flex justify-between gap-4">
                            <dt className="text-zinc-500">Tujuan Edukasi</dt>
                            <dd className="text-right font-medium text-zinc-800 dark:text-zinc-200">
                              {scene.educationalObjective}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt className="text-zinc-500">Camera Shot</dt>
                            <dd className="text-right font-medium text-zinc-800 dark:text-zinc-200">
                              {scene.cameraShot}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt className="text-zinc-500">Camera Movement</dt>
                            <dd className="text-right font-medium text-zinc-800 dark:text-zinc-200">
                              {scene.cameraMovement}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt className="text-zinc-500">Lighting</dt>
                            <dd className="text-right font-medium text-zinc-800 dark:text-zinc-200">
                              {scene.lighting}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt className="text-zinc-500">SFX / Music</dt>
                            <dd className="text-right font-medium text-zinc-800 dark:text-zinc-200">
                              {scene.soundEffects} · {scene.backgroundMusic}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          Referensi Visual / Keyframe Scene
                        </p>
                        {scene.keyframeImage ? (
                          <img
                            src={scene.keyframeImage}
                            alt={`Keyframe Scene ${scene.sceneNumber}`}
                            referrerPolicy="no-referrer"
                            className="mt-2 h-40 w-full rounded-lg border border-zinc-200 object-cover dark:border-zinc-700"
                          />
                        ) : (
                          <div className="mt-2 flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white p-4 text-center dark:border-zinc-700 dark:bg-zinc-900">
                            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                              Belum ada gambar keyframe yang diunggah untuk scene ini.
                            </p>
                            <p className="mt-1 text-[11px] text-zinc-500">
                              Gunakan tab First-Frame Keyframe untuk menyalin prompt atau mengunggah gambar frame awal.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
