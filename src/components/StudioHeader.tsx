import React, { useRef } from 'react';
import {
  Clapperboard,
  Download,
  FilePlus2,
  FileText,
  Menu,
  Moon,
  Sun,
  Undo2,
  Upload,
} from 'lucide-react';

interface StudioHeaderProps {
  projectId: string;
  projectVersion: number;
  projectStatus: string;
  lastSavedText: string;
  theme: 'light' | 'dark';
  canUndo: boolean;
  onToggleTheme: () => void;
  onUndo: () => void;
  onNewProject: () => void;
  onImportJson: (file: File) => void;
  onSaveJson: () => void;
  onExportTxt: () => void;
  onToggleMobileNav: () => void;
}

export function StudioHeader({
  projectId,
  projectVersion,
  projectStatus,
  lastSavedText,
  theme,
  canUndo,
  onToggleTheme,
  onUndo,
  onNewProject,
  onImportJson,
  onSaveJson,
  onExportTxt,
  onToggleMobileNav,
}: StudioHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJson(file);
      e.target.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-zinc-200 bg-white/95 px-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileNav}
          aria-label="Buka navigasi workflow"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-600 text-white shadow-xs">
          <Clapperboard className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display truncate text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Edusmart Creator Lab
            </span>
            <span className="hidden text-zinc-300 dark:text-zinc-700 sm:inline" aria-hidden="true">
              ·
            </span>
            <span className="hidden truncate text-sm font-medium text-emerald-700 dark:text-emerald-400 sm:inline">
              AI Storyboard Studio
            </span>
          </div>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">
              {projectId} · v{projectVersion}
            </span>{' '}
            <span aria-hidden="true">·</span> Status: {projectStatus}{' '}
            <span aria-hidden="true">·</span> {lastSavedText}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          title="Batalkan perubahan terakhir"
          className="hidden items-center gap-1.5 whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:inline-flex"
        >
          <Undo2 className="h-3.5 w-3.5" />
          <span>Undo</span>
        </button>

        <button
          type="button"
          onClick={onToggleTheme}
          title={theme === 'light' ? 'Aktifkan Mode Gelap' : 'Aktifkan Mode Terang'}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {theme === 'light' ? (
            <Moon className="h-3.5 w-3.5" />
          ) : (
            <Sun className="h-3.5 w-3.5" />
          )}
          <span className="hidden md:inline">
            {theme === 'light' ? 'Dark' : 'Light'}
          </span>
        </button>

        <button
          type="button"
          onClick={onNewProject}
          title="Buat project baru yang bersih dan terisolasi"
          className="hidden items-center gap-1.5 whitespace-nowrap rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300 sm:inline-flex"
        >
          <FilePlus2 className="h-3.5 w-3.5" />
          <span className="hidden md:inline">New Project</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <Upload className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Import JSON</span>
        </button>

        <button
          type="button"
          onClick={onSaveJson}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/70"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Save JSON</span>
        </button>

        <button
          type="button"
          onClick={onExportTxt}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-orange-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-orange-700"
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Export TXT</span>
        </button>
      </div>
    </header>
  );
}
