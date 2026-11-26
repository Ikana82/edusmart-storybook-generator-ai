import { ArrowRight, Copy, Lock, Unlock } from 'lucide-react';
import {
  AudioMode,
  AudioSegment,
  AudioSettings,
  CharacterProfile,
  ProductionSettings,
  VoiceProfile,
} from '../types/storyboard';
import { AudioTimelineEditor } from './AudioTimelineEditor';

interface VoiceAudioSectionProps {
  audioSettings: AudioSettings;
  voiceProfiles: VoiceProfile[];
  defaultTimeline: AudioSegment[];
  production: ProductionSettings;
  characters: CharacterProfile[];
  onUpdateAudioSettings: (patch: Partial<AudioSettings>) => void;
  onUpdateVoiceProfile: (id: string, patch: Partial<VoiceProfile>) => void;
  onUpdateDefaultTimeline: (segments: AudioSegment[]) => void;
  onResetDefaultTimeline: () => void;
  onCopyText: (text: string, label: string) => void;
  onNextSection: () => void;
}

const AUDIO_MODES: AudioMode[] = [
  'Dialog Karakter',
  'Voice Over (Narator)',
  'Combine (Dialog + VO)',
  'Tanpa Dialog / Musik & SFX Saja',
  'Custom',
];

export function VoiceAudioSection({
  audioSettings,
  voiceProfiles,
  defaultTimeline,
  production,
  characters,
  onUpdateAudioSettings,
  onUpdateVoiceProfile,
  onUpdateDefaultTimeline,
  onResetDefaultTimeline,
  onCopyText,
  onNextSection,
}: VoiceAudioSectionProps) {
  const handleNarratorGenderChange = (gender: 'Laki-laki' | 'Perempuan') => {
    onUpdateAudioSettings({ narratorGender: gender });
    const narrator = voiceProfiles.find((v) => v.roleKey === 'narrator');
    if (narrator) {
      const updatedPrompt =
        gender === 'Laki-laki'
          ? `25-year-old Indonesian adult male narrator voice, speaking natively in ${production.narrationLanguage}, warm baritone-tenor timbre, gentle engaging educational storytelling tone, crisp studio clarity, steady natural pace, strictly consistent across all scenes.`
          : `25-year-old Indonesian adult female narrator voice, speaking natively in ${production.narrationLanguage}, warm melodic mezzo-soprano timbre, gentle engaging educational storytelling tone, crisp studio clarity, steady natural pace, strictly consistent across all scenes.`;
      onUpdateVoiceProfile(narrator.id, { gender, prompt: updatedPrompt });
    }
  };

  const inputClass =
    'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100';

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
            Section 12
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Pembagian Peran Suara & Pengaturan Audio
          </h1>
          <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            Atur suara karakter, narator, dialog, dan timeline audio agar konsisten di seluruh scene.
          </p>
        </div>

        <button
          type="button"
          onClick={onNextSection}
          className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
        >
          <span>Lanjut ke Cerita (13)</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Audio Mode & Language Lock */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Audio Mode
            </label>
            <select
              value={audioSettings.audioMode}
              onChange={(e) =>
                onUpdateAudioSettings({ audioMode: e.target.value as AudioMode })
              }
              className={inputClass}
            >
              {AUDIO_MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Gender Narator (VOICE 03)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Perempuan', 'Laki-laki'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleNarratorGenderChange(g)}
                  className={`whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                    audioSettings.narratorGender === g
                      ? 'border-orange-500 bg-amber-50 text-orange-800 dark:border-orange-500 dark:bg-orange-950/60 dark:text-amber-300'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-lg border border-zinc-200 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/50">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Voice Language Lock
              </span>
              <button
                type="button"
                onClick={() =>
                  onUpdateAudioSettings({
                    voiceLanguageLock: !audioSettings.voiceLanguageLock,
                  })
                }
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold ${
                  audioSettings.voiceLanguageLock
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                }`}
              >
                {audioSettings.voiceLanguageLock ? (
                  <Lock className="h-3 w-3" />
                ) : (
                  <Unlock className="h-3 w-3" />
                )}
                <span>{audioSettings.voiceLanguageLock ? 'Aktif' : 'Bebas'}</span>
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              Dialog: {production.dialogueLanguage} · Narasi: {production.narrationLanguage}
            </p>
          </div>
        </div>
      </div>

      {/* 3 Voice DNA Profiles */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
          Profil Voice DNA (Terkunci Antar-Scene)
        </h2>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {voiceProfiles.map((vp) => (
            <div
              key={vp.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-orange-600 dark:text-orange-400">
                    {vp.id}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {vp.gender} · {vp.ageLabel}
                  </span>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Label Peran Suara
                  </label>
                  <input
                    type="text"
                    value={vp.label}
                    onChange={(e) =>
                      onUpdateVoiceProfile(vp.id, { label: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Prompt Karakteristik Suara (Voice DNA)
                  </label>
                  <textarea
                    rows={5}
                    value={vp.prompt}
                    onChange={(e) =>
                      onUpdateVoiceProfile(vp.id, { prompt: e.target.value })
                    }
                    className={`${inputClass} font-mono text-xs leading-relaxed`}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => onCopyText(vp.prompt, vp.label)}
                className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Salin Voice DNA</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Default Audio Timeline Template */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="mb-4">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Template Audio Timeline Default (Per Scene)
          </h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Atur pembagian waktu default (misal 0–3s{' '}
            {characters.filter((c) => c.isActive)[0]?.name || 'Tokoh 1'}, 3–5s{' '}
            {characters.filter((c) => c.isActive)[1]?.name || 'Tokoh 2'}, 5–8s
            Narator). Untuk durasi {production.sceneDuration} detik, sesuaikan
            jumlah kata agar pengucapan tidak terpotong.
          </p>
        </div>

        <AudioTimelineEditor
          segments={defaultTimeline}
          sceneDuration={production.sceneDuration}
          allowOverlap={audioSettings.allowOverlapDefault}
          voiceProfiles={voiceProfiles}
          characters={characters}
          onChangeSegments={onUpdateDefaultTimeline}
          onToggleOverlap={(allow) =>
            onUpdateAudioSettings({ allowOverlapDefault: allow })
          }
          onResetTimeline={onResetDefaultTimeline}
        />
      </div>
    </section>
  );
}
