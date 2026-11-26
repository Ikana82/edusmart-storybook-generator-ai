import { useState } from 'react';
import {
  ArrowRight,
  Copy,
  Loader2,
  Lock,
  Plus,
  Sparkles,
  Trash2,
  Unlock,
  Upload,
} from 'lucide-react';
import { BackgroundProfile, ProductionSettings } from '../types/storyboard';
import {
  buildBackgroundDnaBlock,
  buildBackgroundPrompt,
} from '../utils/promptEngine';
import { readImageFileAsDataUrl } from '../utils/imageHelpers';

interface BackgroundSyncSectionProps {
  backgrounds: BackgroundProfile[];
  globalBackgroundLock: boolean;
  production: ProductionSettings;
  isDetectingCast: boolean;
  onAutoDetectBackgrounds: () => void;
  onToggleGlobalLock: (locked: boolean) => void;
  onAddBackground: () => void;
  onUpdateBackground: (id: string, patch: Partial<BackgroundProfile>) => void;
  onRequestDeleteBackground: (bg: BackgroundProfile) => void;
  onCopyText: (text: string, label: string) => void;
  onNotify: (type: 'success' | 'error' | 'info', message: string) => void;
  onNextSection: () => void;
}

export function BackgroundSyncSection({
  backgrounds,
  globalBackgroundLock,
  production,
  isDetectingCast,
  onAutoDetectBackgrounds,
  onToggleGlobalLock,
  onAddBackground,
  onUpdateBackground,
  onRequestDeleteBackground,
  onCopyText,
  onNotify,
  onNextSection,
}: BackgroundSyncSectionProps) {
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const handleUploadBgImage = async (bgId: string, file?: File) => {
    if (!file) return;
    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      onUpdateBackground(bgId, { uploadedReferenceImage: dataUrl });
      onNotify(
        'success',
        'Gambar latar berhasil diunggah dan disimpan sebagai referensi visual (tidak dianalisis otomatis sampai Anda menekan Analisis Foto).'
      );
    } catch (err) {
      onNotify(
        'error',
        err instanceof Error ? err.message : 'Gagal membaca file gambar.'
      );
    }
  };

  const handleAnalyzeBgImage = async (bg: BackgroundProfile) => {
    if (!bg.uploadedReferenceImage) return;
    setAnalyzingId(bg.id);
    try {
      const res = await fetch('/api/ai/describe-reference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageDataUrl: bg.uploadedReferenceImage,
          targetType: 'background',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        onNotify(
          'error',
          data.error || 'Analisis gambar AI belum tersedia saat ini.'
        );
        return;
      }
      onUpdateBackground(bg.id, {
        description: `${bg.description ? bg.description + ' ' : ''}[AI Vision Note]: ${data.description}`,
      });
      onNotify('success', `Deskripsi latar ${bg.name} diperbarui dari AI Vision.`);
    } catch {
      onNotify('error', 'Gagal menghubungi server untuk analisis gambar.');
    } finally {
      setAnalyzingId(null);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100';

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
            Section 11B
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Upload Background Video & Penguncian Konsistensi Latar-Karakter
          </h1>
          <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            Unggah gambar latar atau tambahkan lokasi secara manual agar pencahayaan, perspektif, dan gaya visual antara background dan karakter konsisten di semua scene.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onAutoDetectBackgrounds}
            disabled={isDetectingCast}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
          >
            {isDetectingCast ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            <span>Deteksi Lokasi dari Cerita</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleGlobalLock(!globalBackgroundLock)}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors ${
              globalBackgroundLock
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'
            }`}
          >
            {globalBackgroundLock ? (
              <Lock className="h-3.5 w-3.5" />
            ) : (
              <Unlock className="h-3.5 w-3.5" />
            )}
            <span>
              {globalBackgroundLock
                ? 'Lock Background DNA: AKTIF'
                : 'Lock Background DNA: NONAKTIF'}
            </span>
          </button>

          <button
            type="button"
            onClick={onAddBackground}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Latar Manual</span>
          </button>

          <button
            type="button"
            onClick={onNextSection}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-orange-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-orange-700"
          >
            <span>Lanjut ke Audio (12)</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {backgrounds.map((bg) => {
          const compiledPrompt =
            bg.generatedPrompt || buildBackgroundPrompt(bg, production);
          const dnaSummary = buildBackgroundDnaBlock(
            bg,
            production,
            globalBackgroundLock || bg.dnaLocked
          );

          return (
            <article
              key={bg.id}
              className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="font-mono font-semibold text-orange-600 dark:text-orange-400">
                      {bg.id}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{bg.timeOfDay}</span>
                    <span aria-hidden="true">·</span>
                    <span>{bg.weather}</span>
                  </div>
                  <h2 className="mt-0.5 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {bg.name || 'Lokasi Tanpa Nama'}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateBackground(bg.id, { dnaLocked: !bg.dnaLocked })
                    }
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      bg.dnaLocked
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400'
                    }`}
                  >
                    {bg.dnaLocked ? (
                      <Lock className="h-3.5 w-3.5" />
                    ) : (
                      <Unlock className="h-3.5 w-3.5" />
                    )}
                    <span>Lock Background DNA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const prompt = buildBackgroundPrompt(bg, production);
                      onUpdateBackground(bg.id, { generatedPrompt: prompt });
                      onCopyText(prompt, `Background Prompt ${bg.name}`);
                    }}
                    className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-700"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Generate & Copy Prompt</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onRequestDeleteBackground(bg)}
                    className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-600 hover:border-rose-200 hover:bg-rose-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-rose-400 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="space-y-3 lg:col-span-4">
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
                    <p className="mb-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Preview Gambar Background
                    </p>
                    {bg.uploadedReferenceImage ? (
                      <div className="space-y-2.5">
                        <img
                          src={bg.uploadedReferenceImage}
                          alt={`Background ${bg.name}`}
                          referrerPolicy="no-referrer"
                          className="h-44 w-full rounded-lg border border-zinc-200 object-cover dark:border-zinc-700"
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleAnalyzeBgImage(bg)}
                            disabled={analyzingId === bg.id}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-50 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>
                              {analyzingId === bg.id
                                ? 'Menganalisis...'
                                : 'Analisis Foto (AI)'}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateBackground(bg.id, {
                                uploadedReferenceImage: null,
                              })
                            }
                            className="whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                          >
                            Hapus Foto
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex h-44 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white p-4 text-center transition-colors hover:border-orange-400 hover:bg-amber-50/30 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-orange-700">
                        <Upload className="h-5 w-5 text-zinc-400" />
                        <span className="mt-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          Upload Background Image
                        </span>
                        <span className="mt-1 text-[11px] text-zinc-500">
                          Disimpan lokal sebagai referensi proyek
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleUploadBgImage(bg.id, e.target.files?.[0])
                          }
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                        Prompt Background
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onCopyText(compiledPrompt, `Prompt ${bg.name}`)
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-orange-600 hover:underline dark:text-orange-400"
                      >
                        <Copy className="h-3 w-3" />
                        <span>Salin</span>
                      </button>
                    </div>
                    <p className="line-clamp-5 font-mono text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {compiledPrompt}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Nama Lokasi
                    </label>
                    <input
                      type="text"
                      value={bg.name}
                      onChange={(e) =>
                        onUpdateBackground(bg.id, { name: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Deskripsi Tempat
                    </label>
                    <textarea
                      rows={2}
                      value={bg.description}
                      onChange={(e) =>
                        onUpdateBackground(bg.id, {
                          description: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Lighting Direction
                    </label>
                    <input
                      type="text"
                      value={bg.lightingDirection}
                      onChange={(e) =>
                        onUpdateBackground(bg.id, {
                          lightingDirection: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Color Palette
                    </label>
                    <input
                      type="text"
                      value={bg.colorPalette}
                      onChange={(e) =>
                        onUpdateBackground(bg.id, {
                          colorPalette: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Camera Perspective
                    </label>
                    <input
                      type="text"
                      value={bg.cameraPerspective}
                      onChange={(e) =>
                        onUpdateBackground(bg.id, {
                          cameraPerspective: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Visual Style
                    </label>
                    <input
                      type="text"
                      value={bg.visualStyle}
                      onChange={(e) =>
                        onUpdateBackground(bg.id, {
                          visualStyle: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Time of Day
                    </label>
                    <input
                      type="text"
                      value={bg.timeOfDay}
                      onChange={(e) =>
                        onUpdateBackground(bg.id, {
                          timeOfDay: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Weather
                    </label>
                    <input
                      type="text"
                      value={bg.weather}
                      onChange={(e) =>
                        onUpdateBackground(bg.id, { weather: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Architecture
                    </label>
                    <input
                      type="text"
                      value={bg.architecture ?? ''}
                      onChange={(e) =>
                        onUpdateBackground(bg.id, { architecture: e.target.value })
                      }
                      placeholder="Contoh: Candi batu andesit, gazebo kayu..."
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Vegetation
                    </label>
                    <input
                      type="text"
                      value={bg.vegetation ?? ''}
                      onChange={(e) =>
                        onUpdateBackground(bg.id, { vegetation: e.target.value })
                      }
                      placeholder="Contoh: Pohon beringin, bunga matahari, semak hijau..."
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Environment Details (Properti & Suasana)
                    </label>
                    <input
                      type="text"
                      value={bg.environmentDetails}
                      onChange={(e) =>
                        onUpdateBackground(bg.id, {
                          environmentDetails: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div className="rounded-lg border border-amber-200/80 bg-amber-50/40 p-3.5 sm:col-span-2 dark:border-amber-900/50 dark:bg-amber-950/20">
                    <span className="mb-1 block text-xs font-semibold text-amber-900 dark:text-amber-300">
                      Compiled Background DNA Lock
                    </span>
                    <p className="font-mono text-[11px] leading-relaxed text-zinc-700 dark:text-zinc-300">
                      {dnaSummary}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
