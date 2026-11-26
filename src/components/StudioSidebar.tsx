import {
  BookOpen,
  FileOutput,
  FilePlus2,
  Film,
  Image as ImageIcon,
  Layers,
  Mic,
  RotateCcw,
  SlidersHorizontal,
  Users,
  X,
} from 'lucide-react';
import {
  StepSyncStatus,
  StoryboardProject,
  StudioSectionId,
} from '../types/storyboard';

interface StudioSidebarProps {
  activeSection: StudioSectionId;
  project: StoryboardProject;
  mobileOpen: boolean;
  onSelectSection: (section: StudioSectionId) => void;
  onCloseMobile: () => void;
  onRequestNewProject: () => void;
  onRequestClearProject: () => void;
}

const NAV_ITEMS: Array<{
  id: StudioSectionId;
  step: string;
  label: string;
  icon: typeof SlidersHorizontal;
}> = [
  {
    id: 'production',
    step: '01–10',
    label: 'Konfigurasi Produksi',
    icon: SlidersHorizontal,
  },
  {
    id: 'characters',
    step: '11A',
    label: 'Character Sheet & DNA',
    icon: Users,
  },
  {
    id: 'backgrounds',
    step: '11B',
    label: 'Background Sync',
    icon: Layers,
  },
  {
    id: 'audio',
    step: '12',
    label: 'Voice DNA & Timeline',
    icon: Mic,
  },
  {
    id: 'story',
    step: '13',
    label: 'Cerita & Alur Edukasi',
    icon: BookOpen,
  },
  {
    id: 'storyboard',
    step: '14',
    label: 'Storyboard & Prompt',
    icon: Film,
  },
  {
    id: 'keyframes',
    step: '15',
    label: 'First-Frame Keyframe',
    icon: ImageIcon,
  },
  {
    id: 'export',
    step: '16',
    label: 'Pratinjau & Ekspor',
    icon: FileOutput,
  },
];

export function StudioSidebar({
  activeSection,
  project,
  mobileOpen,
  onSelectSection,
  onCloseMobile,
  onRequestNewProject,
  onRequestClearProject,
}: StudioSidebarProps) {
  const activeCharacters = project.characters.filter((c) => c.isActive).length;
  const stepStatuses = project.dependencyState?.stepStatuses;

  const getStatusBadgeStyle = (status?: StepSyncStatus): string => {
    switch (status) {
      case 'Outdated':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300';
      case 'Needs Review':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
      case 'Up to Date':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
      default:
        return 'bg-zinc-200/70 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
    }
  };

  const getItemMeta = (id: StudioSectionId): string => {
    switch (id) {
      case 'production':
        return `${project.production.sceneCount} scene · ${project.production.aspectRatio}`;
      case 'characters':
        return `${activeCharacters} aktif · ${project.globalCharacterDnaLock ? 'DNA Terkunci' : 'Bebas'}`;
      case 'backgrounds':
        return `${project.backgrounds.length} lokasi`;
      case 'audio':
        return `${project.voiceProfiles.length} suara · ${project.production.sceneDuration}s`;
      case 'story':
        return `${project.story.rawStory.trim().split(/\s+/).filter(Boolean).length} kata`;
      case 'storyboard':
        return `${project.scenes.length} scene`;
      case 'keyframes':
        return `${project.scenes.length} frame awal`;
      case 'export':
        return 'JSON & TXT';
    }
  };

  const content = (
    <div className="flex h-full flex-col justify-between bg-zinc-50/70 p-4 dark:bg-zinc-900/50">
      <div>
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <span className="font-display text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Alur Produksi
          </span>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Tutup menu"
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-2 px-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          Alur Kerja Studio
        </p>

        <nav className="space-y-1" aria-label="Navigasi workflow storyboard">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectSection(item.id);
                  onCloseMobile();
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900/60'
                    : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/70'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-zinc-400 dark:text-zinc-500'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] font-semibold text-zinc-400 tabular-nums dark:text-zinc-500">
                      {item.step}
                    </span>
                    <span className="truncate text-sm font-medium">{item.label}</span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-1.5">
                    <span className="truncate text-[11px] text-zinc-500 tabular-nums dark:text-zinc-400">
                      {getItemMeta(item.id)}
                    </span>
                    {stepStatuses?.[item.id] && (
                      <span
                        className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold ${getStatusBadgeStyle(stepStatuses[item.id])}`}
                      >
                        {stepStatuses[item.id]}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-6 space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <div className="mb-2 px-2 text-xs text-zinc-500 dark:text-zinc-400">
          <p className="font-mono text-[10px] font-semibold text-orange-600 dark:text-orange-400">
            {project.metadata.projectId} · v{project.metadata.projectVersion || 1}
          </p>
          <p className="mt-0.5 font-medium text-zinc-700 dark:text-zinc-300">
            Character Sheet · Background Sync · Multi-Language Video Prompt
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            onRequestNewProject();
            onCloseMobile();
          }}
          className="flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          <FilePlus2 className="h-3.5 w-3.5" />
          <span>New Project (Kosong)</span>
        </button>
        <button
          type="button"
          onClick={onRequestClearProject}
          className="flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-rose-900/60 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset / Clear Project</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-zinc-200 dark:border-zinc-800 lg:block">
        <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          {content}
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="fixed inset-0 bg-zinc-950/50 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <aside className="relative z-50 h-full w-72 border-r border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="h-full overflow-y-auto">{content}</div>
          </aside>
        </div>
      )}
    </>
  );
}
