import { useState } from 'react';
import {
  AspectRatio,
  ContentType,
  ProductionSettings,
  PromptLanguage,
  ResolutionOption,
  ScriptLanguage,
  StoryCategory,
  VideoFormat,
  VideoGenre,
  VisualStyle,
} from '../types/storyboard';
import { detectStoryCategory } from '../utils/storyKnowledgeBase';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Globe2,
  ShieldAlert,
} from 'lucide-react';

interface ProductionConfigSectionProps {
  production: ProductionSettings;
  onChange: (updated: Partial<ProductionSettings>) => void;
  onValidateAndContinue: (target: 'characters' | 'story') => void;
  onValidationError: (message: string) => void;
}

const SCRIPT_LANGUAGES: ScriptLanguage[] = [
  'Bahasa Indonesia',
  'English',
  'Bahasa Melayu',
  'Arabic',
  'Japanese',
  'Korean',
  'Mandarin',
  'Other',
];

const PROMPT_LANGUAGES: PromptLanguage[] = [
  'English',
  'Bahasa Indonesia',
  'Bahasa Melayu',
  'Arabic',
  'Japanese',
  'Korean',
  'Mandarin',
];

const CONTENT_TYPES: ContentType[] = [
  'Cerita Edukasi Anak',
  'Storybook Animation',
  'Educational Explainer',
  'Tutorial',
  'Adventure Story',
  'Folklore Animation',
  'Character Animation',
  'Other',
];

const GENRES: VideoGenre[] = [
  'Edukasi & Petualangan',
  'Fabel',
  'Dongeng',
  'Cerita Rakyat',
  'Komedi Anak',
  'Fantasi',
  'Sains',
  'Sejarah',
  'Other',
];

const VISUAL_STYLES: VisualStyle[] = [
  '3D Pixar / Disney Style Animation',
  'Whimsical 3D Storybook',
  'Soft 3D Animation',
  '2D Cartoon',
  'Anime',
  'Clay Animation',
  'Watercolor Storybook',
  'Realistic Cinematic',
  'Custom Style',
];

const ASPECT_RATIOS: AspectRatio[] = ['16:9', '9:16', '1:1', '4:5', '3:4'];
const RESOLUTIONS: ResolutionOption[] = ['720p HD', '1080p Full HD', '2K', '4K UHD'];
const VIDEO_FORMATS: VideoFormat[] = [
  'Animation Series',
  'Short Animation',
  'Educational Video',
  'Storytelling Video',
  'Cinematic Video',
  'Social Media Video',
];

const STORY_CATEGORIES: StoryCategory[] = [
  'Cerita Rakyat',
  'Fabel',
  'Dongeng Original',
  'Cerita Edukasi',
  'Cerita Custom',
];

export function ProductionConfigSection({
  production,
  onChange,
  onValidateAndContinue,
  onValidationError,
}: ProductionConfigSectionProps) {
  const [showValidation, setShowValidation] = useState(false);

  const clampSceneCount = (val: number) => Math.max(1, Math.min(30, Math.round(val || 1)));
  const clampDuration = (val: number) => Math.max(1, Math.min(60, Math.round(val || 1)));

  const validationErrors: Array<{ fieldId: string; message: string }> = [];
  if (!production.episodeTitle.trim()) {
    validationErrors.push({
      fieldId: 'episode-title',
      message: '1. Judul Video / Episode wajib diisi.',
    });
  }
  if (
    production.scriptLanguage === 'Other' &&
    !production.customScriptLanguage.trim()
  ) {
    validationErrors.push({
      fieldId: 'custom-script-language',
      message: '2. Nama bahasa kustom wajib diisi saat memilih Other.',
    });
  }
  if (
    production.visualStyle === 'Custom Style' &&
    !production.customVisualStyle.trim()
  ) {
    validationErrors.push({
      fieldId: 'custom-visual-style',
      message: '5. Deskripsi gaya visual kustom wajib diisi saat memilih Custom Style.',
    });
  }
  if (production.sceneCount < 1 || production.sceneCount > 30) {
    validationErrors.push({
      fieldId: 'scene-count',
      message: '6. Jumlah Scene harus bernilai 1 hingga 30.',
    });
  }
  if (production.sceneDuration < 1 || production.sceneDuration > 60) {
    validationErrors.push({
      fieldId: 'scene-duration',
      message: '7. Durasi per Scene harus bernilai 1 hingga 60 detik.',
    });
  }
  if (!production.educationalMessage.trim()) {
    validationErrors.push({
      fieldId: 'educational-message',
      message: 'Pesan Edukasi Utama wajib diisi agar arah cerita konsisten.',
    });
  }

  const handleValidateAndGo = (target: 'characters' | 'story') => {
    setShowValidation(true);
    if (validationErrors.length > 0) {
      const first = validationErrors[0];
      const el = document.getElementById(first.fieldId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
      onValidationError(first.message);
      return;
    }
    onValidateAndContinue(target);
  };

  const inputClass =
    'w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100';

  const labelClass =
    'mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300';

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
            Langkah 1–10
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Konfigurasi Produksi & Parameter Video
          </h1>
          <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            Isi spesifikasi utama agar prompt gambar dan video konsisten di setiap scene.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleValidateAndGo('characters')}
          className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
        >
          <span>Validasi & Lanjut (11A)</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Main 1–10 Parameters */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="episode-title" className={labelClass}>
              1. Judul Video / Episode
            </label>
            <input
              id="episode-title"
              type="text"
              value={production.episodeTitle}
              onChange={(e) => onChange({ episodeTitle: e.target.value })}
              placeholder="Contoh: Ika dan Arka Berpetualang Fotosintesis"
              className={inputClass}
            />
            {!production.episodeTitle.trim() && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                Judul video wajib diisi agar konteks cerita dan export tetap jelas.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="script-language" className={labelClass}>
              2. Bahasa Naskah & Audio Utama
            </label>
            <select
              id="script-language"
              value={production.scriptLanguage}
              onChange={(e) => {
                const lang = e.target.value as ScriptLanguage;
                onChange({
                  scriptLanguage: lang,
                  dialogueLanguage: lang,
                  narrationLanguage: lang,
                });
              }}
              className={inputClass}
            >
              {SCRIPT_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
            {production.scriptLanguage === 'Other' && (
              <input
                id="custom-script-language"
                type="text"
                value={production.customScriptLanguage}
                onChange={(e) => onChange({ customScriptLanguage: e.target.value })}
                placeholder="Masukkan nama bahasa kustom..."
                className={`${inputClass} mt-2`}
              />
            )}
          </div>

          <div>
            <label htmlFor="content-type" className={labelClass}>
              3. Jenis Konten
            </label>
            <select
              id="content-type"
              value={production.contentType}
              onChange={(e) =>
                onChange({ contentType: e.target.value as ContentType })
              }
              className={inputClass}
            >
              {CONTENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="genre-select" className={labelClass}>
              4. Genre Video
            </label>
            <select
              id="genre-select"
              value={production.genre}
              onChange={(e) => {
                const nextGenre = e.target.value as VideoGenre;
                onChange({ genre: nextGenre, storyCategory: undefined });
              }}
              className={inputClass}
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="story-category-select" className={labelClass}>
              Kategori Cerita & Sistem Karakter
            </label>
            <select
              id="story-category-select"
              value={detectStoryCategory(production)}
              onChange={(e) =>
                onChange({ storyCategory: e.target.value as StoryCategory })
              }
              className={inputClass}
            >
              {STORY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              {detectStoryCategory(production) === 'Cerita Rakyat'
                ? 'Identitas tokoh cerita rakyat dikunci otomatis (Story Identity Locked).'
                : detectStoryCategory(production) === 'Fabel'
                  ? 'Karakter hewan terdeteksi otomatis sesuai judul & alur fabel.'
                  : detectStoryCategory(production) === 'Cerita Custom'
                    ? 'Mode manual: kelola karakter dan latar secara bebas.'
                    : 'Karakter & lokasi dideteksi otomatis dari topik dan cerita.'}
            </p>
          </div>

          <div>
            <label htmlFor="visual-style" className={labelClass}>
              5. Gaya Visual
            </label>
            <select
              id="visual-style"
              value={production.visualStyle}
              onChange={(e) =>
                onChange({ visualStyle: e.target.value as VisualStyle })
              }
              className={inputClass}
            >
              {VISUAL_STYLES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {production.visualStyle === 'Custom Style' && (
              <input
                id="custom-visual-style"
                type="text"
                value={production.customVisualStyle}
                onChange={(e) => onChange({ customVisualStyle: e.target.value })}
                placeholder="Deskripsikan gaya visual kustom Anda..."
                className={`${inputClass} mt-2`}
              />
            )}
          </div>

          <div>
            <label htmlFor="scene-count" className={labelClass}>
              6. Jumlah Scene (1–30)
            </label>
            <input
              id="scene-count"
              type="number"
              min={1}
              max={30}
              value={production.sceneCount}
              onChange={(e) =>
                onChange({ sceneCount: clampSceneCount(Number(e.target.value)) })
              }
              className={`${inputClass} font-mono tabular-nums`}
            />
          </div>

          <div>
            <label htmlFor="scene-duration" className={labelClass}>
              7. Durasi per Scene (1–60 detik)
            </label>
            <div className="relative">
              <input
                id="scene-duration"
                type="number"
                min={1}
                max={60}
                value={production.sceneDuration}
                onChange={(e) =>
                  onChange({
                    sceneDuration: clampDuration(Number(e.target.value)),
                  })
                }
                className={`${inputClass} pr-14 font-mono tabular-nums`}
              />
              <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-xs font-medium text-zinc-500">
                detik
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="aspect-ratio" className={labelClass}>
              8. Aspect Ratio
            </label>
            <div className="grid grid-cols-5 gap-2">
              {ASPECT_RATIOS.map((ratio) => {
                const active = production.aspectRatio === ratio;
                return (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => onChange({ aspectRatio: ratio })}
                    className={`whitespace-nowrap rounded-lg border px-2 py-2.5 font-mono text-xs font-semibold tabular-nums transition-colors ${
                      active
                        ? 'border-orange-500 bg-amber-50 text-orange-700 dark:border-orange-500 dark:bg-orange-950/60 dark:text-amber-300'
                        : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {ratio}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="resolution-select" className={labelClass}>
              9. Resolusi
            </label>
            <select
              id="resolution-select"
              value={production.resolution}
              onChange={(e) =>
                onChange({ resolution: e.target.value as ResolutionOption })
              }
              className={inputClass}
            >
              {RESOLUTIONS.map((res) => (
                <option key={res} value={res}>
                  {res}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="video-format" className={labelClass}>
              10. Format / Jenis Video
            </label>
            <select
              id="video-format"
              value={production.videoFormat}
              onChange={(e) =>
                onChange({ videoFormat: e.target.value as VideoFormat })
              }
              className={inputClass}
            >
              {VIDEO_FORMATS.map((fmt) => (
                <option key={fmt} value={fmt}>
                  {fmt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="target-audience" className={labelClass}>
              Target Audiens
            </label>
            <input
              id="target-audience"
              type="text"
              value={production.targetAudience}
              onChange={(e) => onChange({ targetAudience: e.target.value })}
              placeholder="Contoh: Anak usia 5–10 tahun"
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="educational-message" className={labelClass}>
              Pesan Edukasi Utama
            </label>
            <input
              id="educational-message"
              type="text"
              value={production.educationalMessage}
              onChange={(e) => onChange({ educationalMessage: e.target.value })}
              placeholder="Nilai atau konsep ilmu yang ingin dipahami anak..."
              className={inputClass}
            />
            {showValidation && !production.educationalMessage.trim() && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                Pesan Edukasi Utama wajib diisi agar arah cerita dan storyboard tetap konsisten.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Text Rules & Mode OUTLINE */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Izinkan Teks / Subtitle di Layar
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                {production.allowOnScreenText
                  ? 'Aktif: Prompt memperbolehkan teks atau label edukasi sesuai kebutuhan.'
                  : 'Nonaktif: Prompt wajib melarang teks, caption, subtitle, watermark, dan tulisan acak di gambar.'}
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={production.allowOnScreenText}
                onChange={(e) => onChange({ allowOnScreenText: e.target.checked })}
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-zinc-200 transition-colors peer-checked:bg-emerald-600 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500 dark:bg-zinc-700" />
              <div className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-xs transition-transform peer-checked:translate-x-5" />
            </label>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs font-medium">
            {production.allowOnScreenText ? (
              <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Teks layar diizinkan secara terkontrol
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <ShieldAlert className="h-3.5 w-3.5" />
                Proteksi aktif: bebas watermark & huruf acak
              </span>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Mode OUTLINE
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                Garis tepi putih bergaya stiker untuk karakter dan background secara konsisten di setiap scene.
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={production.outlineMode}
                onChange={(e) => onChange({ outlineMode: e.target.checked })}
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-zinc-200 transition-colors peer-checked:bg-emerald-600 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500 dark:bg-zinc-700" />
              <div className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-xs transition-transform peer-checked:translate-x-5" />
            </label>
          </div>

          <div className="mt-3 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Status:{' '}
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              {production.outlineMode
                ? 'Aktif (White Sticker Outline)'
                : 'Nonaktif (Visual Normal)'}
            </span>
          </div>
        </div>
      </div>

      {/* Multi-Language Video Prompt Panel */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="mb-4 flex items-center gap-2.5">
          <Globe2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Multi-Language Video Prompt
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Pisahkan bahasa prompt AI (mis. English) dari bahasa dialog & narasi (mis. Bahasa Indonesia) tanpa menerjemahkan nama karakter.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="prompt-language" className={labelClass}>
              Prompt Language (Image & Video)
            </label>
            <select
              id="prompt-language"
              value={production.promptLanguage}
              onChange={(e) =>
                onChange({ promptLanguage: e.target.value as PromptLanguage })
              }
              className={inputClass}
            >
              {PROMPT_LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dialogue-language" className={labelClass}>
              Dialogue Language
            </label>
            <select
              id="dialogue-language"
              value={production.dialogueLanguage}
              onChange={(e) =>
                onChange({ dialogueLanguage: e.target.value as ScriptLanguage })
              }
              className={inputClass}
            >
              {SCRIPT_LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="narration-language" className={labelClass}>
              Narration Language
            </label>
            <select
              id="narration-language"
              value={production.narrationLanguage}
              onChange={(e) =>
                onChange({ narrationLanguage: e.target.value as ScriptLanguage })
              }
              className={inputClass}
            >
              {SCRIPT_LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {/* Bottom Validation & Continue Action Bar */}
      <div className="rounded-xl border border-zinc-200 bg-amber-50/40 p-5 dark:border-zinc-800 dark:bg-zinc-900/70">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="space-y-1">
            {validationErrors.length === 0 ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>
                  Konfigurasi produksi lengkap ({production.sceneCount} scene ×{' '}
                  {production.sceneDuration}s · {production.aspectRatio} ·{' '}
                  {production.resolution}) dan siap divalidasi untuk dilanjutkan.
                </span>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <span>
                    Lengkapi {validationErrors.length} bagian berikut sebelum melanjutkan:
                  </span>
                  {showValidation && (
                    <ul className="mt-1 list-inside list-disc font-normal">
                      {validationErrors.map((err) => (
                        <li key={err.fieldId}>{err.message}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Pilih lanjut ke Pemeran (11A) untuk mengunci DNA karakter, atau langsung ke Cerita (13) untuk menyusun naskah episode Anda.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleValidateAndGo('story')}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-emerald-600 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
            >
              <BookOpen className="h-4 w-4" />
              <span>Validasi & Lanjut ke Cerita (13)</span>
            </button>

            <button
              type="button"
              onClick={() => handleValidateAndGo('characters')}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
            >
              <span>Validasi & Lanjut ke Pemeran (11A)</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
