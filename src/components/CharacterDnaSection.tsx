import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  Copy,
  Download,
  Edit3,
  Eye,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Unlock,
  Upload,
} from 'lucide-react';
import {
  CharacterProfile,
  ProductionSettings,
  VoiceProfile,
} from '../types/storyboard';
import {
  buildCharacterDnaBlock,
  buildCharacterSheetPrompt,
  resolveVisualStyle,
} from '../utils/promptEngine';
import { detectStoryCategory } from '../utils/storyKnowledgeBase';
import { downloadDataUrl, readImageFileAsDataUrl } from '../utils/imageHelpers';

interface CharacterDnaSectionProps {
  characters: CharacterProfile[];
  globalDnaLock: boolean;
  production: ProductionSettings;
  voiceProfiles: VoiceProfile[];
  isDetectingCast: boolean;
  onAutoDetectCharacters: () => void;
  onToggleGlobalLock: (locked: boolean) => void;
  onAddCharacter: () => void;
  onUpdateCharacter: (id: string, patch: Partial<CharacterProfile>) => void;
  onRequestDeleteCharacter: (char: CharacterProfile) => void;
  onCopyText: (text: string, label: string) => void;
  onNotify: (type: 'success' | 'error' | 'info', message: string) => void;
  onNextSection: () => void;
}

const SHEET_ANGLES = [
  'Front View',
  '3/4 View',
  'Side Profile View',
  'Back View',
  'Happy Expression',
  'Sad Expression',
  'Curious Expression',
  'Surprised Expression',
];

export function CharacterDnaSection({
  characters,
  globalDnaLock,
  production,
  voiceProfiles,
  isDetectingCast,
  onAutoDetectCharacters,
  onToggleGlobalLock,
  onAddCharacter,
  onUpdateCharacter,
  onRequestDeleteCharacter,
  onCopyText,
  onNotify,
  onNextSection,
}: CharacterDnaSectionProps) {
  const [previewCharId, setPreviewCharId] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [editingVisualIds, setEditingVisualIds] = useState<Record<string, boolean>>({});
  const storyCategory = detectStoryCategory(production);
  const visualStyleName = resolveVisualStyle(production);

  const handlePhotoUpload = async (
    charId: string,
    field: 'uploadedReferenceImage' | 'characterSheetImage',
    file?: File
  ) => {
    if (!file) return;
    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      onUpdateCharacter(charId, { [field]: dataUrl });
      onNotify(
        'success',
        field === 'uploadedReferenceImage'
          ? 'Foto referensi karakter berhasil diunggah.'
          : 'Gambar Character Sheet berhasil diunggah.'
      );
    } catch (err) {
      onNotify(
        'error',
        err instanceof Error ? err.message : 'Gagal membaca file gambar.'
      );
    }
  };

  const handleGenerateSheetPrompt = (char: CharacterProfile) => {
    const prompt = buildCharacterSheetPrompt(char, production);
    onUpdateCharacter(char.id, { characterSheetPrompt: prompt });
    onNotify(
      'info',
      `Prompt Character Sheet 8-angle untuk ${char.name} siap disalin. Generate gambar AI eksternal belum terhubung, jadi tidak ada gambar palsu yang dibuat.`
    );
  };

  const handleAnalyzeReferenceImage = async (char: CharacterProfile) => {
    if (!char.uploadedReferenceImage) return;
    setAnalyzingId(char.id);
    try {
      const res = await fetch('/api/ai/describe-reference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageDataUrl: char.uploadedReferenceImage,
          targetType: 'character',
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
      onUpdateCharacter(char.id, {
        physicalDescription: `${char.physicalDescription ? char.physicalDescription + ' ' : ''}[AI Vision Note]: ${data.description}`,
      });
      onNotify(
        'success',
        `Deskripsi visual ${char.name} diperbarui dari analisis gambar AI.`
      );
    } catch {
      onNotify('error', 'Gagal menghubungi server untuk analisis gambar.');
    } finally {
      setAnalyzingId(null);
    }
  };

  const previewChar = characters.find((c) => c.id === previewCharId) || null;

  const inputClass =
    'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100';

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800 sm:flex-row sm:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
              Section 11A · {storyCategory}
            </p>
            {storyCategory === 'Cerita Rakyat' && (
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                <ShieldCheck className="h-3 w-3" />
                Story Identity Locked
              </span>
            )}
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Pemeran, DNA Lock & Pembuatan Character Sheet
          </h1>
          <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            Deteksi otomatis karakter dari judul dan cerita, atau kelola profil visual DNA & Character Sheet 8-panel agar konsisten di semua scene.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onAutoDetectCharacters}
            disabled={isDetectingCast}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
          >
            {isDetectingCast ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            <span>
              {isDetectingCast ? 'Mendeteksi...' : 'Deteksi Karakter Otomatis'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onToggleGlobalLock(!globalDnaLock)}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors ${
              globalDnaLock
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'
            }`}
          >
            {globalDnaLock ? (
              <Lock className="h-3.5 w-3.5" />
            ) : (
              <Unlock className="h-3.5 w-3.5" />
            )}
            <span>
              {globalDnaLock ? 'Lock Character DNA: AKTIF' : 'Lock Character DNA: NONAKTIF'}
            </span>
          </button>

          <button
            type="button"
            onClick={onAddCharacter}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Karakter</span>
          </button>

          <button
            type="button"
            onClick={onNextSection}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-orange-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-orange-700"
          >
            <span>Lanjut ke 11B</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {characters.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 p-10 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Belum ada karakter dalam project ini.
          </p>
          <button
            type="button"
            onClick={onAddCharacter}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Karakter Pertama</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {characters.map((char) => {
            const dnaSummary = buildCharacterDnaBlock(
              char,
              production,
              globalDnaLock || char.visualDnaLock
            );
            const sheetPrompt =
              char.characterSheetPrompt ||
              buildCharacterSheetPrompt(char, production);

            return (
              <article
                key={char.id}
                className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60"
              >
                {/* Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="font-mono font-semibold text-orange-600 dark:text-orange-400">
                        {char.id}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{char.roleType}</span>
                      <span aria-hidden="true">·</span>
                      <span>{char.age}</span>
                      {char.storyIdentityLocked && (
                        <span className="inline-flex items-center gap-1 rounded border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <ShieldCheck className="h-3 w-3" />
                          Story Identity Locked
                        </span>
                      )}
                    </div>
                    <h2 className="mt-0.5 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      {char.name || 'Karakter Tanpa Nama'}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateCharacter(char.id, { isActive: !char.isActive })
                      }
                      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        char.isActive
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>
                        {char.isActive ? 'Aktif di Storyboard' : 'Nonaktif'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onUpdateCharacter(char.id, {
                          visualDnaLock: !char.visualDnaLock,
                        })
                      }
                      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        char.visualDnaLock
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400'
                      }`}
                    >
                      {char.visualDnaLock ? (
                        <Lock className="h-3.5 w-3.5" />
                      ) : (
                        <Unlock className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {char.visualDnaLock ? 'Lock DNA' : 'Unlock DNA'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setEditingVisualIds((prev) => ({
                          ...prev,
                          [char.id]: !prev[char.id],
                        }))
                      }
                      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        editingVisualIds[char.id]
                          ? 'border-amber-400 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200'
                      }`}
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>
                        {editingVisualIds[char.id]
                          ? 'Tutup Editor Visual'
                          : 'Edit Visual Profile'}
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={Boolean(char.storyIdentityLocked)}
                      title={
                        char.storyIdentityLocked
                          ? 'Identitas tokoh cerita rakyat dikunci untuk menjaga keaslian cerita.'
                          : `Hapus ${char.name}`
                      }
                      onClick={() => onRequestDeleteCharacter(char)}
                      aria-label={`Hapus ${char.name}`}
                      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:border-rose-200 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-rose-400 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>

                {/* Form Grid + Reference Photo */}
                <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
                  {/* Left: Photo Upload & Sheet */}
                  <div className="space-y-4 lg:col-span-4">
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
                      <p className="mb-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Foto Referensi Karakter
                      </p>
                      {char.uploadedReferenceImage ? (
                        <div className="space-y-2.5">
                          <img
                            src={char.uploadedReferenceImage}
                            alt={`Referensi ${char.name}`}
                            referrerPolicy="no-referrer"
                            className="h-44 w-full rounded-lg border border-zinc-200 object-cover dark:border-zinc-700"
                          />
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleAnalyzeReferenceImage(char)}
                              disabled={analyzingId === char.id}
                              className="inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-50 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>
                                {analyzingId === char.id
                                  ? 'Menganalisis...'
                                  : 'Analisis Foto (AI)'}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateCharacter(char.id, {
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
                        <label className="flex h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white p-4 text-center transition-colors hover:border-orange-400 hover:bg-amber-50/30 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-orange-700">
                          <Upload className="h-5 w-5 text-zinc-400" />
                          <span className="mt-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            Upload Foto Karakter
                          </span>
                          <span className="mt-0.5 text-[11px] text-zinc-500">
                            PNG, JPG, WEBP
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handlePhotoUpload(
                                char.id,
                                'uploadedReferenceImage',
                                e.target.files?.[0]
                              )
                            }
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Character Sheet Actions */}
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
                      <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Character Reference Sheet (8 Panel)
                      </p>
                      <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                        {SHEET_ANGLES.join(' · ')}
                      </p>

                      {char.characterSheetImage ? (
                        <img
                          src={char.characterSheetImage}
                          alt={`Character Sheet ${char.name}`}
                          referrerPolicy="no-referrer"
                          className="mt-3 h-36 w-full rounded-lg border border-zinc-200 object-cover dark:border-zinc-700"
                        />
                      ) : (
                        <div className="mt-3 rounded-lg border border-dashed border-zinc-300 bg-white p-3 text-[11px] text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
                          Belum ada gambar Character Sheet yang diunggah. Anda dapat membuat prompt-nya lalu menyalinnya ke AI Image Generator, atau mengunggah hasil sheet di sini.
                        </div>
                      )}

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleGenerateSheetPrompt(char)}
                          className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-orange-600 px-2.5 py-2 text-xs font-semibold text-white hover:bg-orange-700"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Generate Sheet</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleGenerateSheetPrompt(char)}
                          className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>Regenerate Sheet</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewCharId(char.id)}
                          className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Preview Sheet</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onCopyText(sheetPrompt, `Prompt Character Sheet ${char.name}`)
                          }
                          className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Prompt</span>
                        </button>
                        {char.characterSheetImage ? (
                          <button
                            type="button"
                            onClick={() =>
                              downloadDataUrl(
                                char.characterSheetImage!,
                                `${char.name.toLowerCase()}-character-sheet.jpg`
                              )
                            }
                            className="col-span-2 inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Download Sheet Image</span>
                          </button>
                        ) : (
                          <label className="col-span-2 inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                            <Upload className="h-3.5 w-3.5" />
                            <span>Upload Hasil Character Sheet</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handlePhotoUpload(
                                  char.id,
                                  'characterSheetImage',
                                  e.target.files?.[0]
                                )
                              }
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Character DNA Fields */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Nama Karakter {char.storyIdentityLocked ? '(Terkunci)' : ''}
                      </label>
                      <input
                        type="text"
                        value={char.name}
                        disabled={Boolean(char.storyIdentityLocked)}
                        onChange={(e) =>
                          onUpdateCharacter(char.id, { name: e.target.value })
                        }
                        className={`${inputClass} disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500 dark:disabled:bg-zinc-800`}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Jenis Karakter / Peran {char.storyIdentityLocked ? '(Terkunci)' : ''}
                      </label>
                      <input
                        type="text"
                        value={char.roleType}
                        disabled={Boolean(char.storyIdentityLocked)}
                        onChange={(e) =>
                          onUpdateCharacter(char.id, { roleType: e.target.value })
                        }
                        className={`${inputClass} disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500 dark:disabled:bg-zinc-800`}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Usia {char.storyIdentityLocked ? '(Terkunci)' : ''}
                      </label>
                      <input
                        type="text"
                        value={char.age}
                        disabled={Boolean(char.storyIdentityLocked)}
                        onChange={(e) =>
                          onUpdateCharacter(char.id, { age: e.target.value })
                        }
                        className={`${inputClass} disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500 dark:disabled:bg-zinc-800`}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Gender {char.storyIdentityLocked ? '(Terkunci)' : ''}
                      </label>
                      <input
                        type="text"
                        value={char.gender}
                        disabled={Boolean(char.storyIdentityLocked)}
                        onChange={(e) =>
                          onUpdateCharacter(char.id, { gender: e.target.value })
                        }
                        className={`${inputClass} disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500 dark:disabled:bg-zinc-800`}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Deskripsi Fisik Lengkap
                      </label>
                      <textarea
                        rows={2}
                        value={char.physicalDescription}
                        onChange={(e) =>
                          onUpdateCharacter(char.id, {
                            physicalDescription: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </div>

                    {(editingVisualIds[char.id] || !char.storyIdentityLocked) && (
                      <>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            Bentuk Wajah (Face Description)
                          </label>
                          <input
                            type="text"
                            value={char.faceShape}
                            onChange={(e) =>
                              onUpdateCharacter(char.id, { faceShape: e.target.value })
                            }
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            Warna Kulit (Skin Tone)
                          </label>
                          <input
                            type="text"
                            value={char.skinTone}
                            onChange={(e) =>
                              onUpdateCharacter(char.id, { skinTone: e.target.value })
                            }
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            Gaya Rambut (Hair Style)
                          </label>
                          <input
                            type="text"
                            value={char.hairStyle ?? char.hair}
                            onChange={(e) =>
                              onUpdateCharacter(char.id, {
                                hairStyle: e.target.value,
                                hair: e.target.value,
                              })
                            }
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            Warna Rambut (Hair Color)
                          </label>
                          <input
                            type="text"
                            value={char.hairColor ?? 'Black'}
                            onChange={(e) =>
                              onUpdateCharacter(char.id, { hairColor: e.target.value })
                            }
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            Warna Mata (Eye Color)
                          </label>
                          <input
                            type="text"
                            value={char.eyes}
                            onChange={(e) =>
                              onUpdateCharacter(char.id, { eyes: e.target.value })
                            }
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            Proporsi Tubuh (Body Proportions)
                          </label>
                          <input
                            type="text"
                            value={char.bodyProportions ?? 'Balanced stylized 3D proportions'}
                            onChange={(e) =>
                              onUpdateCharacter(char.id, { bodyProportions: e.target.value })
                            }
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            Ekspresi Default
                          </label>
                          <input
                            type="text"
                            value={char.expression}
                            onChange={(e) =>
                              onUpdateCharacter(char.id, {
                                expression: e.target.value,
                              })
                            }
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            Aksesori
                          </label>
                          <input
                            type="text"
                            value={char.accessories}
                            onChange={(e) =>
                              onUpdateCharacter(char.id, {
                                accessories: e.target.value,
                              })
                            }
                            className={inputClass}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            Pakaian (Terkunci Antar-Scene)
                          </label>
                          <input
                            type="text"
                            value={char.clothing}
                            onChange={(e) =>
                              onUpdateCharacter(char.id, { clothing: e.target.value })
                            }
                            className={inputClass}
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Kepribadian
                      </label>
                      <input
                        type="text"
                        value={char.personality}
                        onChange={(e) =>
                          onUpdateCharacter(char.id, {
                            personality: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Voice DNA & Visual Style ({visualStyleName})
                      </label>
                      <select
                        value={char.voiceDnaId}
                        onChange={(e) =>
                          onUpdateCharacter(char.id, {
                            voiceDnaId: e.target.value,
                          })
                        }
                        className={inputClass}
                      >
                        {voiceProfiles.map((vp) => (
                          <option key={vp.id} value={vp.id}>
                            {vp.id} — {vp.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Locked DNA Preview */}
                    <div className="rounded-lg border border-amber-200/80 bg-amber-50/40 p-3.5 sm:col-span-2 dark:border-amber-900/50 dark:bg-amber-950/20">
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                          Compiled Visual DNA Lock (Otomatis masuk ke setiap scene)
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onCopyText(dnaSummary, `Visual DNA ${char.name}`)
                          }
                          className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 hover:underline dark:text-orange-400"
                        >
                          <Copy className="h-3 w-3" />
                          <span>Salin DNA</span>
                        </button>
                      </div>
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
      )}

      {/* Character Sheet Prompt & Preview Modal */}
      {previewChar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Character Sheet Studio — {previewChar.name}
                </h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  8 Panel Turnaround & Expression Sheet (White/Neutral Studio Background)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewCharId(null)}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
              >
                Tutup
              </button>
            </div>

            {previewChar.characterSheetImage ? (
              <div className="mt-4">
                <img
                  src={previewChar.characterSheetImage}
                  alt={`Character Sheet ${previewChar.name}`}
                  referrerPolicy="no-referrer"
                  className="max-h-96 w-full rounded-lg border border-zinc-200 object-contain dark:border-zinc-700"
                />
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Status Image Generator: Belum ada gambar sheet yang dirender. Gunakan prompt terstruktur di bawah ini di AI Image Generator Anda (Midjourney, Imagen, Flux, atau Gemini Image) lalu unggah hasilnya bila diperlukan.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {SHEET_ANGLES.map((angle, idx) => (
                    <div
                      key={angle}
                      className="rounded-lg border border-dashed border-zinc-300 bg-white p-3 text-center dark:border-zinc-700 dark:bg-zinc-900"
                    >
                      <div className="font-mono text-[11px] font-semibold text-orange-600 dark:text-orange-400">
                        Panel 0{idx + 1}
                      </div>
                      <div className="mt-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {angle}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Prompt Character Sheet Lengkap
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onCopyText(
                      previewChar.characterSheetPrompt ||
                        buildCharacterSheetPrompt(previewChar, production),
                      `Prompt Character Sheet ${previewChar.name}`
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-700"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Prompt</span>
                </button>
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-4 font-mono text-xs leading-relaxed text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                {previewChar.characterSheetPrompt ||
                  buildCharacterSheetPrompt(previewChar, production)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
