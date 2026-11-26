import {
  AlertTriangle,
  Plus,
  RotateCcw,
  Trash2,
  XCircle,
} from 'lucide-react';
import {
  AudioSegment,
  AudioSegmentType,
  CharacterProfile,
  VoiceProfile,
} from '../types/storyboard';
import {
  countWords,
  validateAudioTimeline,
} from '../utils/timelineValidation';

interface AudioTimelineEditorProps {
  segments: AudioSegment[];
  sceneDuration: number;
  allowOverlap: boolean;
  voiceProfiles: VoiceProfile[];
  characters: CharacterProfile[];
  onChangeSegments: (segments: AudioSegment[]) => void;
  onToggleOverlap: (allow: boolean) => void;
  onResetTimeline: () => void;
}

const AUDIO_TYPES: AudioSegmentType[] = [
  'Dialog / Lip-sync',
  'Voice Over',
  'SFX / Ambience',
];

export function AudioTimelineEditor({
  segments,
  sceneDuration,
  allowOverlap,
  voiceProfiles,
  characters,
  onChangeSegments,
  onToggleOverlap,
  onResetTimeline,
}: AudioTimelineEditorProps) {
  const issues = validateAudioTimeline(segments, sceneDuration, allowOverlap);

  const speakerOptions = [
    ...voiceProfiles.map((v) => {
      const matchedChar = characters.find((c) => c.voiceDnaId === v.id);
      return {
        id: v.id,
        name:
          matchedChar?.name ||
          (v.roleKey === 'boy'
            ? 'Anak Laki-Laki'
            : v.roleKey === 'girl'
              ? 'Anak Perempuan'
              : 'Narator'),
        label: `${v.id} · ${v.label}`,
      };
    }),
  ];

  const handleAddSegment = () => {
    const lastEnd =
      segments.length > 0 ? Math.max(...segments.map((s) => s.endTime)) : 0;
    const start = Number(Math.min(sceneDuration - 1, lastEnd).toFixed(1));
    const end = Number(Math.min(sceneDuration, Math.max(start + 1, start + 2)).toFixed(1));
    const defaultSpeaker = speakerOptions[0] || {
      id: 'VOICE-02',
      name: 'Ika',
    };
    const next: AudioSegment = {
      id: `seg-${Date.now()}`,
      startTime: Math.max(0, start),
      endTime: Math.min(sceneDuration, end),
      speakerId: defaultSpeaker.id,
      speakerName: defaultSpeaker.name,
      audioType: 'Dialog / Lip-sync',
      text: 'Dialog singkat...',
    };
    onChangeSegments([...segments, next]);
  };

  const handleUpdate = (id: string, patch: Partial<AudioSegment>) => {
    onChangeSegments(
      segments.map((seg) => (seg.id === id ? { ...seg, ...patch } : seg))
    );
  };

  const handleRemove = (id: string) => {
    onChangeSegments(segments.filter((seg) => seg.id !== id));
  };

  const inputClass =
    'w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-orange-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold text-zinc-700 tabular-nums dark:text-zinc-300">
            Durasi Scene: 0–{sceneDuration} detik
          </span>
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <input
              type="checkbox"
              checked={allowOverlap}
              onChange={(e) => onToggleOverlap(e.target.checked)}
              className="rounded border-zinc-300 text-orange-600 focus:ring-orange-500"
            />
            <span>Izinkan Overlap Segmen</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetTimeline}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Timeline</span>
          </button>
          <button
            type="button"
            onClick={handleAddSegment}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Segmen</span>
          </button>
        </div>
      </div>

      {/* Visual Timeline Bar */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="relative h-8 w-full overflow-hidden rounded-md bg-zinc-200/70 dark:bg-zinc-800">
          {segments.map((seg, idx) => {
            const leftPct = Math.max(
              0,
              Math.min(100, (seg.startTime / Math.max(1, sceneDuration)) * 100)
            );
            const widthPct = Math.max(
              2,
              Math.min(
                100 - leftPct,
                ((seg.endTime - seg.startTime) / Math.max(1, sceneDuration)) *
                  100
              )
            );
            const toneClass =
              seg.audioType === 'Voice Over'
                ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                : idx % 2 === 0
                  ? 'bg-orange-500 text-white'
                  : 'bg-amber-400 text-zinc-950';

            return (
              <div
                key={seg.id}
                style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                title={`${seg.speakerName} (${seg.startTime}–${seg.endTime}s)`}
                className={`absolute top-1 bottom-1 flex items-center overflow-hidden rounded px-2 text-[11px] font-semibold ${toneClass}`}
              >
                <span className="truncate tabular-nums">
                  {seg.speakerName} ({seg.startTime}–{seg.endTime}s)
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-1.5 flex justify-between font-mono text-[10px] text-zinc-500 tabular-nums">
          <span>0s</span>
          <span>{Math.round(sceneDuration / 2)}s</span>
          <span>{sceneDuration}s</span>
        </div>
      </div>

      {/* Validation Messages */}
      {issues.length > 0 && (
        <div className="space-y-1.5">
          {issues.map((issue, i) => (
            <div
              key={`${issue.segmentId || 'scene'}-${i}`}
              className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${
                issue.severity === 'error'
                  ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300'
                  : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300'
              }`}
            >
              {issue.severity === 'error' ? (
                <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              ) : (
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              )}
              <span>{issue.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Segment Rows */}
      <div className="space-y-3">
        {segments.map((seg) => {
          const words = countWords(seg.text);
          return (
            <div
              key={seg.id}
              className="rounded-lg border border-zinc-200 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                    Mulai (s)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min={0}
                    max={sceneDuration}
                    value={seg.startTime}
                    onChange={(e) =>
                      handleUpdate(seg.id, {
                        startTime: Number(e.target.value),
                      })
                    }
                    className={`${inputClass} font-mono tabular-nums`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                    Selesai (s)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min={0}
                    max={sceneDuration}
                    value={seg.endTime}
                    onChange={(e) =>
                      handleUpdate(seg.id, {
                        endTime: Number(e.target.value),
                      })
                    }
                    className={`${inputClass} font-mono tabular-nums`}
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="mb-1 block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                    Speaker / Voice DNA
                  </label>
                  <select
                    value={seg.speakerId}
                    onChange={(e) => {
                      const opt = speakerOptions.find(
                        (o) => o.id === e.target.value
                      );
                      handleUpdate(seg.id, {
                        speakerId: e.target.value,
                        speakerName: opt?.name || seg.speakerName,
                      });
                    }}
                    className={inputClass}
                  >
                    {speakerOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name} ({opt.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="mb-1 block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                    Audio Type
                  </label>
                  <select
                    value={seg.audioType}
                    onChange={(e) =>
                      handleUpdate(seg.id, {
                        audioType: e.target.value as AudioSegmentType,
                      })
                    }
                    className={inputClass}
                  >
                    {AUDIO_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end justify-end sm:col-span-1">
                  <button
                    type="button"
                    onClick={() => handleRemove(seg.id)}
                    aria-label="Hapus segmen"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-rose-600 hover:bg-rose-50 dark:border-zinc-700 dark:text-rose-400 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="sm:col-span-12">
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-zinc-600 dark:text-zinc-400">
                      Naskah Dialog / Narasi ({seg.audioType === 'Voice Over' ? 'Tanpa lip-sync karakter' : 'Lip-sync aktif'})
                    </span>
                    <span className="font-mono text-zinc-500 tabular-nums">
                      {words} kata
                    </span>
                  </div>
                  <input
                    type="text"
                    value={seg.text}
                    onChange={(e) =>
                      handleUpdate(seg.id, { text: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
