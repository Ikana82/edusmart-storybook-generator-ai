import { Copy, Download, FileText } from 'lucide-react';
import { StoryboardProject } from '../types/storyboard';
import { buildProjectTxtExport } from '../utils/exportImport';

interface ExportPreviewSectionProps {
  project: StoryboardProject;
  onSaveJson: () => void;
  onExportTxt: () => void;
  onCopyText: (text: string, label: string) => void;
}

export function ExportPreviewSection({
  project,
  onSaveJson,
  onExportTxt,
  onCopyText,
}: ExportPreviewSectionProps) {
  const txtOutput = buildProjectTxtExport(project);

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
            Ekspor & Backup Proyek
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Pratinjau Dokumen TXT & JSON Storyboard
          </h1>
          <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            Unduh konfigurasi lengkap dalam format JSON (untuk diimpor ulang tanpa kehilangan data) atau TXT terstruktur untuk disalin ke generator gambar dan video AI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onCopyText(txtOutput, 'Seluruh Dokumen Storyboard')}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <Copy className="h-4 w-4" />
            <span>Copy Semua TXT</span>
          </button>

          <button
            type="button"
            onClick={onSaveJson}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
          >
            <Download className="h-4 w-4" />
            <span>Save JSON</span>
          </button>

          <button
            type="button"
            onClick={onExportTxt}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-orange-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-orange-700"
          >
            <FileText className="h-4 w-4" />
            <span>Download TXT</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">Karakter Aktif</div>
          <div className="mt-1 font-mono text-2xl font-bold text-zinc-900 tabular-nums dark:text-zinc-100">
            {project.characters.filter((c) => c.isActive).length}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">Lokasi Latar</div>
          <div className="mt-1 font-mono text-2xl font-bold text-zinc-900 tabular-nums dark:text-zinc-100">
            {project.backgrounds.length}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">Total Scene</div>
          <div className="mt-1 font-mono text-2xl font-bold text-zinc-900 tabular-nums dark:text-zinc-100">
            {project.scenes.length}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">Total Durasi</div>
          <div className="mt-1 font-mono text-2xl font-bold text-emerald-600 tabular-nums dark:text-emerald-400">
            {project.scenes.reduce((acc, s) => acc + s.sceneDuration, 0)}s
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
        <h2 className="mb-3 text-sm font-bold text-zinc-900 dark:text-zinc-100">
          Pratinjau Dokumen Export TXT
        </h2>
        <pre className="max-h-[36rem] overflow-auto whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-4 font-mono text-xs leading-relaxed text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
          {txtOutput}
        </pre>
      </div>
    </section>
  );
}
