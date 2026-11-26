import { Copy, Download, RefreshCw, Sparkles, Upload } from 'lucide-react';
import { ProductionSettings, SceneItem } from '../types/storyboard';
import { downloadDataUrl, readImageFileAsDataUrl } from '../utils/imageHelpers';

interface KeyframesSectionProps {
  scenes: SceneItem[];
  production: ProductionSettings;
  onRegenerateAllKeyframes: () => void;
  onRegenerateSingleKeyframe: (sceneId: string) => void;
  onUpdateSceneKeyframeImage: (sceneId: string, dataUrl: string | null) => void;
  onCopyText: (text: string, label: string) => void;
  onNotify: (type: 'success' | 'error' | 'info', message: string) => void;
}

export function KeyframesSection({
  scenes,
  production,
  onRegenerateAllKeyframes,
  onRegenerateSingleKeyframe,
  onUpdateSceneKeyframeImage,
  onCopyText,
  onNotify,
}: KeyframesSectionProps) {
  const handleUploadKeyframe = async (sceneId: string, file?: File) => {
    if (!file) return;
    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      onUpdateSceneKeyframeImage(sceneId, dataUrl);
      onNotify('success', 'Gambar keyframe frame pertama berhasil diunggah.');
    } catch (err) {
      onNotify(
        'error',
        err instanceof Error ? err.message : 'Gagal membaca file gambar.'
      );
    }
  };

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
            First-Frame Keyframe Generator
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Otomatis Buat Gambar Keyframe (First-Frame)
          </h1>
          <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            Prompt frame pertama untuk setiap scene sebelum gerakan video dimulai, konsisten dengan Character DNA, Background DNA, Gaya Visual, {production.aspectRatio}, dan {production.resolution}.
          </p>
        </div>

        <button
          type="button"
          onClick={onRegenerateAllKeyframes}
          className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
        >
          <Sparkles className="h-4 w-4" />
          <span>Generate All Keyframes</span>
        </button>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 text-xs leading-relaxed text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300">
        Status Image Renderer: Generate gambar AI eksternal belum terhubung. Aplikasi menghasilkan prompt first-frame keyframe lengkap yang siap disalin ke AI Image Generator Anda (tanpa preview palsu), dan Anda dapat mengunggah hasil gambar keyframe per scene untuk preview dan penyimpanan di JSON.
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {scenes.map((scene) => (
          <article
            key={scene.id}
            className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60"
          >
            <div>
              <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-3 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="font-mono font-bold text-orange-600 tabular-nums dark:text-orange-400">
                      KEYFRAME {String(scene.sceneNumber).padStart(2, '0')}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{scene.sceneLocation}</span>
                  </div>
                  <h2 className="mt-0.5 text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {scene.sceneTitle}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => onRegenerateSingleKeyframe(scene.id)}
                  className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Generate Single Keyframe</span>
                </button>
              </div>

              {/* Preview Image (only if genuinely uploaded/generated) */}
              {scene.keyframeImage ? (
                <div className="mt-4 space-y-2">
                  <img
                    src={scene.keyframeImage}
                    alt={`First-Frame Keyframe Scene ${scene.sceneNumber}`}
                    referrerPolicy="no-referrer"
                    className="h-48 w-full rounded-lg border border-zinc-200 object-cover dark:border-zinc-700"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        downloadDataUrl(
                          scene.keyframeImage!,
                          `keyframe-scene-${String(scene.sceneNumber).padStart(2, '0')}.jpg`
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateSceneKeyframeImage(scene.id, null)}
                      className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:border-zinc-700 dark:text-rose-400"
                    >
                      Hapus Preview
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-dashed border-zinc-300 bg-zinc-50/70 p-3 dark:border-zinc-700 dark:bg-zinc-950/40">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Prompt siap digunakan. Unggah hasil keyframe jika sudah dirender:
                  </span>
                  <label className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Preview</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleUploadKeyframe(scene.id, e.target.files?.[0])
                      }
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              <pre className="mt-4 max-h-60 overflow-y-auto whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-3.5 font-mono text-[11px] leading-relaxed text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                {scene.keyframePrompt}
              </pre>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() =>
                  onCopyText(
                    scene.keyframePrompt,
                    `Keyframe Prompt Scene ${scene.sceneNumber}`
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-orange-700"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Keyframe Prompt</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
