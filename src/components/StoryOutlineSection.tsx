import {
  BookOpen,
  Eraser,
  Film,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { StoryOutline } from '../types/storyboard';

interface StoryOutlineSectionProps {
  story: StoryOutline;
  episodeTitle: string;
  educationalMessage: string;
  sceneCount: number;
  isGeneratingStory: boolean;
  isGeneratingStoryboard: boolean;
  onUpdateStory: (patch: Partial<StoryOutline>) => void;
  onAutoGenerateStory: () => void;
  onBuildOutlineFromRaw: () => void;
  onRequestClearStory: () => void;
  onGenerateStoryboard: () => void;
}

export function StoryOutlineSection({
  story,
  episodeTitle,
  educationalMessage,
  sceneCount,
  isGeneratingStory,
  isGeneratingStoryboard,
  onUpdateStory,
  onAutoGenerateStory,
  onBuildOutlineFromRaw,
  onRequestClearStory,
  onGenerateStoryboard,
}: StoryOutlineSectionProps) {
  const inputClass =
    'w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100';

  const outlineFields: Array<{
    key: keyof Omit<StoryOutline, 'rawStory'>;
    label: string;
  }> = [
    { key: 'opening', label: '1. Opening' },
    { key: 'curiosityProblem', label: '2. Problem / Rasa Penasaran' },
    { key: 'exploration', label: '3. Perjalanan / Eksplorasi' },
    { key: 'educationalExplanation', label: '4. Penjelasan Edukasi' },
    { key: 'closing', label: '5. Closing' },
    { key: 'moralMessage', label: '6. Pesan Moral / Edukasi' },
  ];

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
            Section 13
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Cerita / Alur Konsep & Pesan Edukasi
          </h1>
          <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            Tulis atau hasilkan cerita utuh beserta 6 struktur naskah edukasi anak sebelum dipecah menjadi {sceneCount} scene storyboard.
          </p>
        </div>

        <button
          type="button"
          onClick={onGenerateStoryboard}
          disabled={isGeneratingStoryboard}
          className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-orange-700 disabled:opacity-60"
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

      <div className="rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3 text-xs text-zinc-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-zinc-300">
        <span className="font-semibold text-orange-700 dark:text-orange-400">
          Referensi Konfigurasi Produksi:
        </span>{' '}
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
          {episodeTitle || 'Judul belum diisi'}
        </span>
        {educationalMessage ? ` — ${educationalMessage}` : ''}
      </div>

      {/* Main Story Textarea */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <label
            htmlFor="raw-story-input"
            className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
          >
            Naskah Cerita Utama
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onAutoGenerateStory}
              disabled={isGeneratingStory}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
            >
              {isGeneratingStory ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              <span>
                {isGeneratingStory ? 'Menghasilkan...' : 'Auto Generate Cerita'}
              </span>
            </button>

            <button
              type="button"
              onClick={onBuildOutlineFromRaw}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Generate Story Outline</span>
            </button>

            <button
              type="button"
              onClick={onRequestClearStory}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-rose-600 hover:border-rose-200 hover:bg-rose-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-rose-400"
            >
              <Eraser className="h-3.5 w-3.5" />
              <span>Clear Story</span>
            </button>
          </div>
        </div>

        <textarea
          id="raw-story-input"
          rows={6}
          value={story.rawStory}
          onChange={(e) => onUpdateStory({ rawStory: e.target.value })}
          placeholder="Tulis konsep cerita edukasi anak Anda di sini..."
          className={`${inputClass} leading-relaxed`}
        />
      </div>

      {/* 6-Part Story Outline */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
        <h2 className="mb-4 text-base font-bold text-zinc-900 dark:text-zinc-100">
          Struktur Story Outline (6 Bagian)
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {outlineFields.map((field) => (
            <div key={field.key}>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {field.label}
              </label>
              <textarea
                rows={3}
                value={story[field.key]}
                onChange={(e) => onUpdateStory({ [field.key]: e.target.value })}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60 sm:flex-row sm:items-center">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Setelah naskah dan 6 bagian Story Outline sesuai, lanjutkan untuk memecah cerita menjadi {sceneCount} scene storyboard & prompt lengkap.
        </p>
        <button
          type="button"
          onClick={onGenerateStoryboard}
          disabled={isGeneratingStoryboard}
          className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-orange-700 disabled:opacity-60"
        >
          {isGeneratingStoryboard ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Film className="h-4 w-4" />
          )}
          <span>
            {isGeneratingStoryboard
              ? 'Menyusun Storyboard...'
              : 'Lanjut & Generate Storyboard'}
          </span>
        </button>
      </div>
    </section>
  );
}
