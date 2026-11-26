import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { BackgroundSyncSection } from './components/BackgroundSyncSection';
import { CharacterDnaSection } from './components/CharacterDnaSection';
import { ConfirmDialog } from './components/ConfirmDialog';
import { ExportPreviewSection } from './components/ExportPreviewSection';
import { KeyframesSection } from './components/KeyframesSection';
import { ProductionConfigSection } from './components/ProductionConfigSection';
import { RightInspector } from './components/RightInspector';
import { StoryboardSection } from './components/StoryboardSection';
import { StoryOutlineSection } from './components/StoryOutlineSection';
import { StorySyncBanner } from './components/StorySyncBanner';
import { StudioHeader } from './components/StudioHeader';
import { StudioSidebar } from './components/StudioSidebar';
import { VoiceAudioSection } from './components/VoiceAudioSection';
import { createDefaultProject } from './data/defaultProject';
import {
  AudioSegment,
  AudioSettings,
  BackgroundProfile,
  CharacterProfile,
  ProductionSettings,
  SceneItem,
  StepSyncStatus,
  StoryboardProject,
  StoryCategory,
  StoryOutline,
  StudioSectionId,
  VoiceProfile,
} from './types/storyboard';
import {
  buildProjectJsonExport,
  buildProjectTxtExport,
  downloadTextFile,
  validateAndParseProjectJson,
} from './utils/exportImport';
import {
  computeBackgroundSignature,
  computeCastSignature,
  computeProductionParamSignature,
  computeStoryOutlineSignature,
  computeVoiceSignature,
  createInitialDependencyState,
  createInitialStepStatuses,
  createNewBlankProject,
  detectPendingStoryChange,
  hydrateProjectState,
  recompileScenesWithMeta,
  recompileSceneWithMeta,
  validateProjectForStoryboard,
} from './utils/projectSync';
import {
  buildBackgroundPrompt,
  buildCharacterSheetPrompt,
  generateFallbackScenes,
  generateFallbackStory,
  resolveVisualStyle,
} from './utils/promptEngine';
import {
  detectStoryCastAndSettings,
  detectStoryCategory,
  StoryDetectionResult,
} from './utils/storyKnowledgeBase';
import { scaleTimelineToDuration } from './utils/timelineValidation';

const STORAGE_KEY = 'edusmart_creator_lab_storyboard_v1';
const THEME_STORAGE_KEY = 'edusmart_creator_lab_theme';

interface ToastNotice {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

type ConfirmAction =
  | { kind: 'delete-character'; target: CharacterProfile }
  | { kind: 'delete-background'; target: BackgroundProfile }
  | { kind: 'delete-scene'; target: SceneItem }
  | { kind: 'clear-story' }
  | { kind: 'new-project' }
  | { kind: 'clear-project' };

export default function App() {
  const [project, setProject] = useState<StoryboardProject>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = validateAndParseProjectJson(saved);
        if (parsed.ok) {
          const isUnmodifiedLegacySample =
            parsed.project.production.episodeTitle ===
              'Petualangan Raka & Siska Menjelajahi Siklus Air' &&
            parsed.project.story.rawStory.startsWith(
              'Raka dan Siska sedang bermain di taman saat hujan turun.'
            );
          if (!isUnmodifiedLegacySample) {
            return hydrateProjectState(parsed.project);
          }
        }
      }
    } catch {
      // Fall back to default project if storage is unavailable
    }
    return createDefaultProject();
  });

  const [history, setHistory] = useState<StoryboardProject[]>([]);
  const [activeSection, setActiveSection] =
    useState<StudioSectionId>('production');
  const [selectedSceneId, setSelectedSceneId] = useState<string>(
    () => project.scenes[0]?.id || ''
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') return stored;
    } catch {
      // ignore
    }
    return 'light';
  });

  const [lastSavedAt, setLastSavedAt] = useState<string>('Tersimpan lokal');
  const [toasts, setToasts] = useState<ToastNotice[]>([]);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [isGeneratingStoryboard, setIsGeneratingStoryboard] = useState(false);
  const [isDetectingCast, setIsDetectingCast] = useState(false);
  const [regeneratingSceneNumber, setRegeneratingSceneNumber] = useState<
    number | null
  >(null);

  const toastCounter = useRef(1);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const json = buildProjectJsonExport(project);
        localStorage.setItem(STORAGE_KEY, json);
        const now = new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        });
        setLastSavedAt(`Auto-save ${now}`);
      } catch {
        setLastSavedAt('Draft lokal penuh');
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [project]);

  const notify = (type: 'success' | 'error' | 'info', message: string) => {
    const id = toastCounter.current++;
    setToasts((prev) => [...prev.slice(-3), { id, type, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const commitProjectUpdate = (
    updater: (prev: StoryboardProject) => StoryboardProject
  ) => {
    setProject((prev) => {
      setHistory((h) => [...h.slice(-14), prev]);
      const next = updater(prev);
      const nextVersion = (prev.metadata.projectVersion || 1) + 1;
      return {
        ...next,
        metadata: {
          ...next.metadata,
          title:
            next.production.episodeTitle.trim() ||
            next.metadata.title ||
            'Project Baru',
          projectVersion: nextVersion,
          updatedAt: new Date().toISOString(),
        },
        dependencyState:
          next.dependencyState || createInitialDependencyState(next),
      };
    });
  };

  const handleUndo = () => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setProject(last);
      setSelectedSceneId(last.scenes[0]?.id || '');
      notify('info', 'Perubahan terakhir dibatalkan (Undo).');
      return prev.slice(0, -1);
    });
  };

  const handleCopyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notify('success', `${label} berhasil disalin ke clipboard.`);
    } catch {
      notify('error', 'Gagal menyalin ke clipboard browser.');
    }
  };

  const buildDurationTimelineTemplate = (
    characters: CharacterProfile[],
    voiceProfiles: VoiceProfile[],
    audioSettings: AudioSettings,
    episodeTitle: string,
    duration: number
  ): AudioSegment[] => {
    if (audioSettings.audioMode === 'Tanpa Dialog / Musik & SFX Saja') {
      return [];
    }
    const narratorId =
      voiceProfiles.find((v) => v.roleKey === 'narrator')?.id || 'VOICE-03';
    if (audioSettings.audioMode === 'Voice Over (Narator)') {
      return [
        {
          id: 'tpl-1',
          startTime: 0,
          endTime: duration,
          speakerId: narratorId,
          speakerName: 'Narator',
          audioType: 'Voice Over',
          text: `Narasi singkat mengenai "${episodeTitle || 'cerita'}".`,
        },
      ];
    }
    const activeChars = characters.filter((c) => c.isActive);
    const char1 = activeChars[0];
    const char2 = activeChars[1] || activeChars[0];
    const t1 = Number(((3 / 8) * duration).toFixed(1));
    const t2 = Number(((5 / 8) * duration).toFixed(1));

    if (audioSettings.audioMode === 'Dialog Karakter') {
      const half = Number((duration / 2).toFixed(1));
      return [
        {
          id: 'tpl-1',
          startTime: 0,
          endTime: half,
          speakerId: char1?.voiceDnaId || voiceProfiles[0]?.id || 'VOICE-01',
          speakerName: char1?.name || 'Karakter 1',
          audioType: 'Dialog / Lip-sync',
          text: 'Dialog singkat karakter pertama.',
        },
        {
          id: 'tpl-2',
          startTime: half,
          endTime: duration,
          speakerId: char2?.voiceDnaId || voiceProfiles[1]?.id || 'VOICE-02',
          speakerName: char2?.name || 'Karakter 2',
          audioType: 'Dialog / Lip-sync',
          text: 'Tanggapan singkat karakter kedua.',
        },
      ];
    }

    return [
      {
        id: 'tpl-1',
        startTime: 0,
        endTime: t1,
        speakerId: char1?.voiceDnaId || voiceProfiles[0]?.id || 'VOICE-01',
        speakerName: char1?.name || 'Karakter 1',
        audioType: 'Dialog / Lip-sync',
        text: 'Dialog singkat karakter utama pertama.',
      },
      {
        id: 'tpl-2',
        startTime: t1,
        endTime: t2,
        speakerId: char2?.voiceDnaId || voiceProfiles[1]?.id || 'VOICE-02',
        speakerName: char2?.name || 'Karakter 2',
        audioType: 'Dialog / Lip-sync',
        text: 'Tanggapan singkat karakter kedua.',
      },
      {
        id: 'tpl-3',
        startTime: t2,
        endTime: duration,
        speakerId: narratorId,
        speakerName: 'Narator',
        audioType: 'Voice Over',
        text: 'Narasi penjelas singkat oleh narator.',
      },
    ];
  };

  // Production Config handlers (Single Source of Truth + Dependency Graph)
  const handleUpdateProduction = (patch: Partial<ProductionSettings>) => {
    commitProjectUpdate((prev) => {
      const mergedProd: ProductionSettings = {
        ...prev.production,
        ...patch,
      };
      if (
        patch.storyCategory === undefined &&
        (patch.genre !== undefined ||
          patch.contentType !== undefined ||
          patch.episodeTitle !== undefined)
      ) {
        mergedProd.storyCategory = detectStoryCategory({
          ...mergedProd,
          storyCategory: undefined,
        });
      } else {
        mergedProd.storyCategory = detectStoryCategory(mergedProd);
      }

      const nextVoices = prev.voiceProfiles.map((vp) => {
        if (!prev.audioSettings.voiceLanguageLock) return vp;
        const targetLang =
          vp.roleKey === 'narrator'
            ? mergedProd.narrationLanguage
            : mergedProd.dialogueLanguage;
        const cleaned = vp.prompt.replace(
          /speaking natively in [^,]+,/i,
          `speaking natively in ${targetLang},`
        );
        return { ...vp, prompt: cleaned };
      });

      const resolvedStyle = resolveVisualStyle(mergedProd);
      const nextChars = prev.characters.map((c) => ({
        ...c,
        characterSheetPrompt: buildCharacterSheetPrompt(c, mergedProd),
      }));
      const nextBgs = prev.backgrounds.map((b) => {
        const syncedBg: BackgroundProfile = {
          ...b,
          locationId: b.locationId || b.id,
          visualStyle: resolvedStyle,
        };
        syncedBg.generatedPrompt = buildBackgroundPrompt(syncedBg, mergedProd);
        return syncedBg;
      });

      const durationChanged =
        patch.sceneDuration !== undefined &&
        patch.sceneDuration !== prev.production.sceneDuration;
      const nextDefaultTemplate = durationChanged
        ? scaleTimelineToDuration(
            prev.defaultTimelineTemplate,
            mergedProd.sceneDuration
          )
        : prev.defaultTimelineTemplate;

      const nextScenesInput = durationChanged
        ? prev.scenes.map((sc) => ({
            ...sc,
            sceneDuration: mergedProd.sceneDuration,
            audioTimeline: scaleTimelineToDuration(
              sc.audioTimeline,
              mergedProd.sceneDuration
            ),
          }))
        : prev.scenes;

      const prevDep = prev.dependencyState || createInitialDependencyState(prev);
      const hasExistingStoryArtifacts =
        prev.characters.length > 0 ||
        prev.backgrounds.length > 0 ||
        prev.scenes.length > 0 ||
        Boolean(prev.story.rawStory.trim());

      const pendingChange = detectPendingStoryChange(
        prevDep.syncedStorySnapshot,
        mergedProd,
        hasExistingStoryArtifacts
      );

      const baseStatuses = createInitialStepStatuses({
        ...prev,
        production: mergedProd,
        characters: nextChars,
        backgrounds: nextBgs,
        scenes: nextScenesInput,
      });
      const nextStepStatuses: Record<StudioSectionId, StepSyncStatus> = {
        ...prevDep.stepStatuses,
        production: mergedProd.episodeTitle.trim() ? 'Up to Date' : 'Ready',
      };
      const nextReasons: Partial<Record<StudioSectionId, string>> = {
        ...prevDep.outdatedReasons,
      };

      if (pendingChange) {
        nextStepStatuses.story = 'Outdated';
        nextStepStatuses.characters =
          nextChars.length > 0 ? 'Outdated' : 'Ready';
        nextStepStatuses.backgrounds =
          nextBgs.length > 0 ? 'Outdated' : 'Ready';
        nextStepStatuses.storyboard =
          nextScenesInput.length > 0 ? 'Outdated' : 'Ready';
        nextStepStatuses.keyframes =
          nextScenesInput.length > 0 ? 'Outdated' : 'Ready';
        nextStepStatuses.export =
          nextScenesInput.length > 0 ? 'Outdated' : 'Ready';
        nextReasons.storyboard = pendingChange.reason;
      } else {
        // Returning title/genre back to synced state clears pending story conflict
        if (prevDep.pendingStoryChange) {
          nextStepStatuses.story = baseStatuses.story;
          nextStepStatuses.characters = baseStatuses.characters;
          nextStepStatuses.backgrounds = baseStatuses.backgrounds;
          nextStepStatuses.storyboard = baseStatuses.storyboard;
          nextStepStatuses.keyframes = baseStatuses.keyframes;
          nextStepStatuses.export = baseStatuses.export;
          delete nextReasons.storyboard;
        }
        if (
          nextScenesInput.length > 0 &&
          mergedProd.sceneCount !== nextScenesInput.length
        ) {
          nextStepStatuses.storyboard = 'Outdated';
          nextStepStatuses.keyframes = 'Outdated';
          nextStepStatuses.export = 'Outdated';
          nextReasons.storyboard = `Jumlah scene konfigurasi (${mergedProd.sceneCount}) berbeda dengan jumlah scene saat ini (${nextScenesInput.length}).`;
        } else if (
          nextScenesInput.length > 0 &&
          nextStepStatuses.storyboard === 'Outdated' &&
          nextReasons.storyboard?.startsWith('Jumlah scene konfigurasi')
        ) {
          nextStepStatuses.storyboard = 'Up to Date';
          nextStepStatuses.keyframes = 'Up to Date';
          nextStepStatuses.export = 'Up to Date';
          delete nextReasons.storyboard;
        }
      }

      const nextVersion = (prev.metadata.projectVersion || 1) + 1;
      const updated: StoryboardProject = {
        ...prev,
        metadata: {
          ...prev.metadata,
          projectVersion: nextVersion,
        },
        production: mergedProd,
        voiceProfiles: nextVoices,
        defaultTimelineTemplate: nextDefaultTemplate,
        characters: nextChars,
        backgrounds: nextBgs,
        scenes: nextScenesInput,
        dependencyState: {
          ...prevDep,
          productionParamSignature: computeProductionParamSignature(mergedProd),
          voiceSignature: computeVoiceSignature(prev.audioSettings, nextVoices),
          castSignature: computeCastSignature(
            nextChars,
            prev.globalCharacterDnaLock
          ),
          backgroundSignature: computeBackgroundSignature(
            nextBgs,
            prev.globalBackgroundDnaLock
          ),
          pendingStoryChange: pendingChange,
          stepStatuses: nextStepStatuses,
          outdatedReasons: nextReasons,
        },
      };

      // Always keep existing scene prompts in sync with global visualStyle / aspectRatio / resolution / duration / languages
      updated.scenes = recompileScenesWithMeta(updated);
      return updated;
    });
  };

  const navigateToSection = (section: StudioSectionId) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const assignVoiceDnaForCharacter = (
    char: Pick<CharacterProfile, 'gender' | 'age' | 'roleType'>,
    idx: number
  ): string => {
    const ageLower = (char.age || '').toLowerCase();
    const roleLower = (char.roleType || '').toLowerCase();
    if (
      ageLower.includes('abadi') ||
      roleLower.includes('raja') ||
      roleLower.includes('jin') ||
      roleLower.includes('raksasa')
    ) {
      return 'VOICE-03';
    }
    if (char.gender === 'Perempuan') {
      return 'VOICE-02';
    }
    return idx % 2 === 0 ? 'VOICE-01' : 'VOICE-02';
  };

  const normalizeDetectedStoryCategory = (
    value: unknown,
    production: ProductionSettings
  ): StoryCategory => {
    const valid: StoryCategory[] = [
      'Cerita Rakyat',
      'Fabel',
      'Dongeng Original',
      'Cerita Edukasi',
      'Cerita Custom',
    ];
    if (typeof value === 'string' && valid.includes(value as StoryCategory)) {
      return value as StoryCategory;
    }
    return detectStoryCategory({
      ...production,
      storyCategory: undefined,
    });
  };

  const buildUpdatedProjectFromDetection = (
    baseProject: StoryboardProject,
    detection: StoryDetectionResult,
    mode: 'all' | 'characters' | 'backgrounds',
    updateStoryIfHelpful: boolean,
    options?: {
      regenerateScenes?: boolean;
      forceCleanStoryReplace?: boolean;
    }
  ): StoryboardProject => {
    const resolvedStyle = resolveVisualStyle(baseProject.production);
    const nextProd: ProductionSettings = {
      ...baseProject.production,
      storyCategory:
        options?.forceCleanStoryReplace || !baseProject.production.storyCategory
          ? detection.storyCategory
          : baseProject.production.storyCategory,
    };

    const nextChars: CharacterProfile[] =
      mode === 'backgrounds' ||
      (detection.characters.length === 0 && !options?.forceCleanStoryReplace)
        ? baseProject.characters
        : detection.characters.map((c, idx) => {
            const voiceDnaId =
              c.voiceDnaId || assignVoiceDnaForCharacter(c, idx);
            const built: CharacterProfile = {
              ...c,
              id: c.id || `CHAR-${String(idx + 1).padStart(2, '0')}`,
              hair: c.hair || c.hairStyle || 'Neat natural hair',
              voiceDnaId,
              uploadedReferenceImage: null,
              characterSheetImage: null,
              characterSheetPrompt: '',
              // Re-apply DNA Lock cleanly to newly synchronized story cast
              visualDnaLock: options?.forceCleanStoryReplace
                ? true
                : (c.visualDnaLock ?? true),
              storyIdentityLocked:
                Boolean(c.storyIdentityLocked) ||
                detection.storyCategory === 'Cerita Rakyat',
              isActive: true,
            };
            built.characterSheetPrompt = buildCharacterSheetPrompt(
              built,
              nextProd
            );
            return built;
          });

    const nextBgs: BackgroundProfile[] =
      mode === 'characters' ||
      (detection.backgrounds.length === 0 && !options?.forceCleanStoryReplace)
        ? baseProject.backgrounds
        : detection.backgrounds.map((b, idx) => {
            const id = b.id || `BG-${String(idx + 1).padStart(2, '0')}`;
            const built: BackgroundProfile = {
              ...b,
              id,
              locationId: b.locationId || id,
              visualStyle: resolvedStyle,
              uploadedReferenceImage: null,
              dnaLocked: options?.forceCleanStoryReplace
                ? true
                : (b.dnaLocked ?? true),
              generatedPrompt: '',
            };
            built.generatedPrompt = buildBackgroundPrompt(built, nextProd);
            return built;
          });

    const shouldReplaceStory =
      options?.forceCleanStoryReplace ||
      (updateStoryIfHelpful &&
        Boolean(detection.storyOutline?.rawStory) &&
        (mode === 'all' ||
          !baseProject.story.rawStory.trim() ||
          (nextChars[0]?.name &&
            !baseProject.story.rawStory
              .toLowerCase()
              .includes(nextChars[0].name.toLowerCase()))));

    const tempForStory: StoryboardProject = {
      ...baseProject,
      production: nextProd,
      characters: nextChars,
      backgrounds: nextBgs,
    };

    const nextStory: StoryOutline = shouldReplaceStory
      ? detection.storyOutline?.rawStory
        ? {
            ...detection.storyOutline,
            moralMessage:
              nextProd.educationalMessage.trim() ||
              detection.storyOutline.moralMessage,
          }
        : generateFallbackStory(tempForStory)
      : baseProject.story;

    const updatedDefaultTemplate = buildDurationTimelineTemplate(
      nextChars,
      baseProject.voiceProfiles,
      baseProject.audioSettings,
      nextProd.episodeTitle,
      nextProd.sceneDuration
    );

    const draft: StoryboardProject = {
      ...baseProject,
      metadata: {
        ...baseProject.metadata,
        projectVersion: (baseProject.metadata.projectVersion || 1) + 1,
        title: nextProd.episodeTitle.trim() || baseProject.metadata.title,
      },
      production: nextProd,
      globalCharacterDnaLock: options?.forceCleanStoryReplace
        ? true
        : baseProject.globalCharacterDnaLock,
      globalBackgroundDnaLock: options?.forceCleanStoryReplace
        ? true
        : baseProject.globalBackgroundDnaLock,
      characters: nextChars,
      backgrounds: nextBgs,
      story: nextStory,
      defaultTimelineTemplate: updatedDefaultTemplate,
      scenes: [],
    };

    if (options?.regenerateScenes || options?.forceCleanStoryReplace) {
      draft.scenes = generateFallbackScenes(draft);
    } else {
      draft.scenes = baseProject.scenes.map((sc, idx) => {
        const matchedBg =
          nextBgs.find((b) => b.id === sc.backgroundId) ||
          nextBgs[idx % Math.max(1, nextBgs.length)];
        const validCharIds =
          mode === 'backgrounds'
            ? sc.characterIds.filter((cid) =>
                nextChars.some((c) => c.id === cid && c.isActive)
              )
            : nextChars.filter((c) => c.isActive).map((c) => c.id);

        return {
          ...sc,
          backgroundId: matchedBg?.id || '',
          locationId: matchedBg?.locationId || matchedBg?.id || '',
          sceneLocation: matchedBg?.name || 'Belum ada lokasi terdaftar',
          lighting: matchedBg?.lightingDirection || sc.lighting,
          characterIds:
            validCharIds.length > 0
              ? validCharIds
              : nextChars.filter((c) => c.isActive).map((c) => c.id),
        };
      });
    }

    draft.scenes = recompileScenesWithMeta(draft);
    draft.dependencyState = createInitialDependencyState(draft);
    return draft;
  };

  const handleAutoDetectCastAndLocations = async (
    mode: 'all' | 'characters' | 'backgrounds',
    overrideProject?: StoryboardProject,
    options?: {
      regenerateScenes?: boolean;
      forceCleanStoryReplace?: boolean;
    }
  ): Promise<StoryboardProject> => {
    const baseProject = overrideProject || project;
    const category = detectStoryCategory(baseProject.production);
    setIsDetectingCast(true);

    try {
      const detectionStory: StoryOutline = options?.forceCleanStoryReplace
        ? {
            rawStory: '',
            opening: '',
            curiosityProblem: '',
            exploration: '',
            educationalExplanation: '',
            closing: '',
            moralMessage: baseProject.production.educationalMessage || '',
          }
        : baseProject.story;

      const localResult = detectStoryCastAndSettings(
        baseProject.production,
        detectionStory
      );

      // 1. Exact Folklore / Fable Knowledge Base Match
      if (localResult.source === 'knowledge-base') {
        const nextProject = buildUpdatedProjectFromDetection(
          baseProject,
          localResult,
          mode,
          true,
          options
        );
        commitProjectUpdate(() => nextProject);
        if (options?.forceCleanStoryReplace || options?.regenerateScenes) {
          setSelectedSceneId(nextProject.scenes[0]?.id || '');
        }
        notify(
          'success',
          mode === 'backgrounds'
            ? `Lokasi cerita "${localResult.matchedTitle}" (${localResult.backgrounds.length} latar) berhasil dideteksi otomatis!`
            : `Project disinkronkan dengan "${localResult.matchedTitle}" (${localResult.storyCategory}): ${localResult.characters.length} karakter & ${localResult.backgrounds.length} lokasi.`
        );
        return nextProject;
      }

      // 2. Cerita Custom preserves manual character creation unless detecting backgrounds or synchronizing full story switch
      if (
        category === 'Cerita Custom' &&
        mode === 'characters' &&
        !options?.forceCleanStoryReplace
      ) {
        notify(
          'info',
          'Mode "Cerita Custom" aktif — silakan tambah atau atur karakter secara manual sesuai kebutuhan.'
        );
        return baseProject;
      }

      // 3. Try Gemini AI Cast & Location Detection for unseen stories / outlines
      try {
        const res = await fetch('/api/ai/detect-story-cast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            production: baseProject.production,
            story: detectionStory,
          }),
        });
        const data = await res.json();
        if (res.ok && data.ok && data.detection) {
          const det = data.detection as {
            storyCategory?: string;
            characters?: Array<Partial<CharacterProfile>>;
            backgrounds?: Array<Partial<BackgroundProfile>>;
            storyOutline?: StoryOutline;
          };
          const resolvedCategory = normalizeDetectedStoryCategory(
            det.storyCategory,
            baseProject.production
          );
          const aiChars: CharacterProfile[] = Array.isArray(det.characters)
            ? det.characters.map((c, idx) => ({
                id: `CHAR-${String(idx + 1).padStart(2, '0')}`,
                name: c.name || `Tokoh ${idx + 1}`,
                roleType: c.roleType || 'Pemeran Utama',
                age: c.age || '10 tahun',
                gender: c.gender || 'Perempuan',
                physicalDescription:
                  c.physicalDescription ||
                  `Stylized animation character ${c.name || idx + 1}`,
                faceShape: c.faceShape || 'Expressive animated face',
                skinTone: c.skinTone || 'Warm natural skin tone',
                hair: c.hairStyle || 'Neat hair',
                hairStyle: c.hairStyle || 'Neat styled hair',
                hairColor: c.hairColor || 'Black',
                eyes: c.eyes || 'Expressive dark eyes',
                bodyProportions:
                  c.bodyProportions || 'Balanced stylized animation proportions',
                expression: c.expression || 'Warm expressive face',
                clothing:
                  c.clothing || 'Story-authentic traditional or casual outfit',
                accessories: c.accessories || 'None',
                personality: c.personality || 'Ramah dan berkarakter kuat',
                voiceDnaId: assignVoiceDnaForCharacter(
                  {
                    gender: c.gender || 'Perempuan',
                    age: c.age || '10 tahun',
                    roleType: c.roleType || 'Pemeran Utama',
                  },
                  idx
                ),
                uploadedReferenceImage: null,
                characterSheetImage: null,
                characterSheetPrompt: '',
                visualDnaLock: true,
                storyIdentityLocked:
                  Boolean(c.storyIdentityLocked) ||
                  resolvedCategory === 'Cerita Rakyat',
                isActive: true,
              }))
            : [];

          const aiBgs: BackgroundProfile[] = Array.isArray(det.backgrounds)
            ? det.backgrounds.map((b, idx) => {
                const bgId = `BG-${String(idx + 1).padStart(2, '0')}`;
                return {
                  id: bgId,
                  locationId: bgId,
                  name: b.name || `Lokasi ${idx + 1}`,
                  description:
                    b.description ||
                    `Animation setting for ${baseProject.production.episodeTitle}`,
                  architecture:
                    b.architecture || 'Story-authentic environment structures',
                  vegetation:
                    b.vegetation || 'Contextual tropical or natural flora',
                  lightingDirection:
                    b.lightingDirection || 'Balanced warm storytelling daylight',
                  colorPalette:
                    b.colorPalette || 'Harmonious story-authentic palette',
                  cameraPerspective:
                    b.cameraPerspective || 'Eye-level wide establishing view',
                  environmentDetails:
                    `${b.architecture || ''}, ${b.vegetation || ''}`.replace(
                      /^,\s*|,\s*$/g,
                      ''
                    ),
                  timeOfDay: b.timeOfDay || 'Pagi Cerah',
                  weather: b.weather || 'Cerah',
                  visualStyle: resolveVisualStyle(baseProject.production),
                  uploadedReferenceImage: null,
                  dnaLocked: true,
                  generatedPrompt: '',
                };
              })
            : [];

          const aiDetection: StoryDetectionResult = {
            storyCategory: resolvedCategory,
            source: 'heuristic',
            characters: aiChars,
            backgrounds: aiBgs,
            storyOutline: det.storyOutline,
          };
          const nextProject = buildUpdatedProjectFromDetection(
            baseProject,
            aiDetection,
            mode,
            true,
            options
          );
          commitProjectUpdate(() => nextProject);
          if (options?.forceCleanStoryReplace || options?.regenerateScenes) {
            setSelectedSceneId(nextProject.scenes[0]?.id || '');
          }
          notify(
            'success',
            mode === 'backgrounds'
              ? `${aiBgs.length} lokasi latar berhasil dideteksi otomatis oleh Gemini AI!`
              : `Karakter & lokasi untuk "${baseProject.production.episodeTitle}" berhasil disinkronkan oleh Gemini AI.`
          );
          return nextProject;
        }
      } catch {
        // Fall through cleanly to local heuristic detection
      }

      // 4. Local Heuristic Fallback
      const nextProject = buildUpdatedProjectFromDetection(
        baseProject,
        localResult,
        mode,
        Boolean(options?.forceCleanStoryReplace),
        options
      );
      commitProjectUpdate(() => nextProject);
      if (options?.forceCleanStoryReplace || options?.regenerateScenes) {
        setSelectedSceneId(nextProject.scenes[0]?.id || '');
      }
      notify(
        'info',
        mode === 'backgrounds'
          ? `${localResult.backgrounds.length} lokasi latar disinkronkan dari analisis judul & cerita.`
          : `Karakter, lokasi, dan scene disinkronkan untuk "${baseProject.production.episodeTitle}" (${localResult.storyCategory}).`
      );
      return nextProject;
    } finally {
      setIsDetectingCast(false);
    }
  };

  // Explicit Story Synchronization Action (Archive old story cast/locations/scenes & rebuild cleanly)
  const handleSynchronizeProject = async (): Promise<StoryboardProject> => {
    const cleanBase: StoryboardProject = {
      ...project,
      metadata: {
        ...project.metadata,
        title: project.production.episodeTitle.trim() || 'Project Baru',
        status: 'Draft',
      },
      production: {
        ...project.production,
        storyCategory: detectStoryCategory({
          ...project.production,
          storyCategory: undefined,
        }),
      },
      globalCharacterDnaLock: true,
      globalBackgroundDnaLock: true,
      characters: [],
      backgrounds: [],
      scenes: [],
      story: {
        rawStory: '',
        opening: '',
        curiosityProblem: '',
        exploration: '',
        educationalExplanation: '',
        closing: '',
        moralMessage: project.production.educationalMessage || '',
      },
    };

    return handleAutoDetectCastAndLocations('all', cleanBase, {
      regenerateScenes: true,
      forceCleanStoryReplace: true,
    });
  };

  const handleCancelStoryChange = () => {
    commitProjectUpdate((prev) => {
      const pending = prev.dependencyState?.pendingStoryChange;
      if (!pending) return prev;
      const restoredProd: ProductionSettings = {
        ...prev.production,
        episodeTitle: pending.previous.episodeTitle,
        genre: pending.previous.genre,
        storyCategory: pending.previous.storyCategory,
        contentType: pending.previous.contentType,
      };
      const restoredChars = prev.characters.map((c) => ({
        ...c,
        characterSheetPrompt: buildCharacterSheetPrompt(c, restoredProd),
      }));
      const restoredBgs = prev.backgrounds.map((b) => {
        const synced = {
          ...b,
          visualStyle: resolveVisualStyle(restoredProd),
        };
        synced.generatedPrompt = buildBackgroundPrompt(synced, restoredProd);
        return synced;
      });
      const restored: StoryboardProject = {
        ...prev,
        production: restoredProd,
        characters: restoredChars,
        backgrounds: restoredBgs,
      };
      restored.scenes = recompileScenesWithMeta(restored);
      restored.dependencyState = createInitialDependencyState(restored);
      return restored;
    });
    notify('info', 'Perubahan identitas cerita dibatalkan.');
  };

  const handleUpdateDependentSteps = async () => {
    if (project.dependencyState?.pendingStoryChange) {
      await handleSynchronizeProject();
      return;
    }

    const dep = project.dependencyState;
    if (!dep) return;

    const category = detectStoryCategory(project.production);
    if (
      (dep.stepStatuses.characters === 'Needs Review' ||
        dep.stepStatuses.backgrounds === 'Needs Review') &&
      category !== 'Cerita Custom'
    ) {
      const result = await handleAutoDetectCastAndLocations(
        dep.stepStatuses.characters === 'Needs Review' ? 'all' : 'backgrounds',
        project,
        { regenerateScenes: true, forceCleanStoryReplace: false }
      );
      commitProjectUpdate(() => ({
        ...result,
        dependencyState: createInitialDependencyState(result),
      }));
      return;
    }

    // Regenerate scenes & keyframe prompts cleanly from current Single Source of Truth
    commitProjectUpdate((prev) => {
      const freshScenes = generateFallbackScenes(prev);
      const updated: StoryboardProject = {
        ...prev,
        scenes: freshScenes,
      };
      updated.scenes = recompileScenesWithMeta(updated);
      updated.dependencyState = createInitialDependencyState(updated);
      if (updated.scenes[0]) {
        setSelectedSceneId(updated.scenes[0].id);
      }
      return updated;
    });
    notify(
      'success',
      'Seluruh tahap dependen (Storyboard, Keyframe, Export) telah diperbarui.'
    );
  };

  const handleValidateAndContinueProduction = async (
    target: 'characters' | 'story'
  ) => {
    if (project.dependencyState?.pendingStoryChange) {
      await handleSynchronizeProject();
      navigateToSection(target);
      return;
    }

    const validatedProd: ProductionSettings = {
      ...project.production,
      storyCategory: detectStoryCategory(project.production),
    };
    const validatedProject: StoryboardProject = {
      ...project,
      production: validatedProd,
      metadata: {
        ...project.metadata,
        title: project.production.episodeTitle.trim(),
      },
      story: {
        ...project.story,
        moralMessage:
          project.production.educationalMessage.trim() ||
          project.story.moralMessage,
      },
    };
    validatedProject.scenes = recompileScenesWithMeta(validatedProject);

    const needsInitialDetection =
      validatedProject.characters.length === 0 ||
      validatedProject.backgrounds.length === 0;

    if (needsInitialDetection) {
      await handleAutoDetectCastAndLocations('all', validatedProject, {
        regenerateScenes: true,
        forceCleanStoryReplace: true,
      });
    } else {
      commitProjectUpdate(() => ({
        ...validatedProject,
        dependencyState: createInitialDependencyState(validatedProject),
      }));
      notify(
        'success',
        `Konfigurasi "${project.production.episodeTitle.trim()}" tervalidasi! Melanjutkan ke ${
          target === 'story'
            ? 'Cerita & Story Outline (13)'
            : 'Pemeran & DNA Karakter (11A)'
        }.`
      );
    }

    navigateToSection(target);
  };

  // Character CRUD (Targeted Update Propagation)
  const handleAddCharacter = () => {
    commitProjectUpdate((prev) => {
      const nextNum =
        prev.characters.reduce((max, c) => {
          const parsed = Number(c.id.replace(/\D/g, ''));
          return Number.isFinite(parsed) && parsed > max ? parsed : max;
        }, prev.characters.length) + 1;
      const newChar: CharacterProfile = {
        id: `CHAR-${String(nextNum).padStart(2, '0')}`,
        name: `Karakter ${nextNum}`,
        roleType: 'Pemeran Pendukung',
        age: '8 tahun',
        gender: 'Laki-laki',
        physicalDescription:
          'Indonesian child age 8, neat hair, friendly eyes, bright cheerful smile, clean colorful casual outfit.',
        faceShape: 'Soft friendly child face',
        skinTone: 'Warm Indonesian tan skin',
        hair: 'Neat dark hair',
        eyes: 'Dark brown bright eyes',
        expression: 'Cheerful curious smile',
        clothing: 'Clean casual t-shirt, shorts, and comfortable sneakers',
        accessories: 'None',
        personality: 'Ramah dan penuh semangat',
        voiceDnaId: prev.voiceProfiles[0]?.id || 'VOICE-01',
        uploadedReferenceImage: null,
        characterSheetImage: null,
        characterSheetPrompt: '',
        visualDnaLock: true,
        isActive: true,
      };
      newChar.characterSheetPrompt = buildCharacterSheetPrompt(
        newChar,
        prev.production
      );
      const nextChars = [...prev.characters, newChar];
      const prevDep = prev.dependencyState || createInitialDependencyState(prev);
      const updated: StoryboardProject = {
        ...prev,
        characters: nextChars,
        dependencyState: {
          ...prevDep,
          castSignature: computeCastSignature(
            nextChars,
            prev.globalCharacterDnaLock
          ),
          stepStatuses: {
            ...prevDep.stepStatuses,
            characters: 'Up to Date',
          },
        },
      };
      return updated;
    });
    notify('success', 'Kolom karakter baru ditambahkan.');
  };

  const handleUpdateCharacter = (
    id: string,
    patch: Partial<CharacterProfile>
  ) => {
    commitProjectUpdate((prev) => {
      const nextChars = prev.characters.map((c) => {
        if (c.id !== id) return c;
        const merged = { ...c, ...patch };
        if (patch.characterSheetPrompt === undefined) {
          merged.characterSheetPrompt = buildCharacterSheetPrompt(
            merged,
            prev.production
          );
        }
        return merged;
      });
      const affectedSceneIds = new Set(
        prev.scenes
          .filter((sc) => sc.characterIds.includes(id))
          .map((sc) => sc.id)
      );
      const prevDep = prev.dependencyState || createInitialDependencyState(prev);
      const nextVersion = (prev.metadata.projectVersion || 1) + 1;
      const updated: StoryboardProject = {
        ...prev,
        metadata: {
          ...prev.metadata,
          projectVersion: nextVersion,
        },
        characters: nextChars,
        dependencyState: {
          ...prevDep,
          castSignature: computeCastSignature(
            nextChars,
            prev.globalCharacterDnaLock
          ),
          stepStatuses: {
            ...prevDep.stepStatuses,
            characters: 'Up to Date',
          },
        },
      };
      // Targeted recompilation: ONLY scenes that actually feature this character
      updated.scenes = recompileScenesWithMeta(updated, affectedSceneIds);
      return updated;
    });
  };

  // Background CRUD (Targeted Update Propagation)
  const handleAddBackground = () => {
    commitProjectUpdate((prev) => {
      const nextNum =
        prev.backgrounds.reduce((max, b) => {
          const parsed = Number(b.id.replace(/\D/g, ''));
          return Number.isFinite(parsed) && parsed > max ? parsed : max;
        }, prev.backgrounds.length) + 1;
      const bgId = `BG-${String(nextNum).padStart(2, '0')}`;
      const newBg: BackgroundProfile = {
        id: bgId,
        locationId: bgId,
        name: `Lokasi Baru ${nextNum}`,
        description:
          'Clean colorful educational animation setting with clear foreground staging area for characters.',
        lightingDirection: 'Soft balanced daylight',
        colorPalette: 'Warm natural harmonious tones',
        cameraPerspective: 'Eye-level child perspective',
        environmentDetails: 'Clean props, gentle foliage, clear ground plane',
        timeOfDay: 'Pagi Cerah',
        weather: 'Cerah',
        visualStyle: resolveVisualStyle(prev.production),
        uploadedReferenceImage: null,
        dnaLocked: true,
        generatedPrompt: '',
      };
      newBg.generatedPrompt = buildBackgroundPrompt(newBg, prev.production);
      const nextBgs = [...prev.backgrounds, newBg];
      const prevDep = prev.dependencyState || createInitialDependencyState(prev);
      return {
        ...prev,
        backgrounds: nextBgs,
        dependencyState: {
          ...prevDep,
          backgroundSignature: computeBackgroundSignature(
            nextBgs,
            prev.globalBackgroundDnaLock
          ),
          stepStatuses: {
            ...prevDep.stepStatuses,
            backgrounds: 'Up to Date',
          },
        },
      };
    });
    notify('success', 'Latar lokasi baru berhasil ditambahkan.');
  };

  const handleUpdateBackground = (
    id: string,
    patch: Partial<BackgroundProfile>
  ) => {
    commitProjectUpdate((prev) => {
      const nextBgs = prev.backgrounds.map((b) => {
        if (b.id !== id) return b;
        const merged: BackgroundProfile = {
          ...b,
          ...patch,
          locationId: patch.locationId || b.locationId || b.id,
        };
        if (patch.generatedPrompt === undefined) {
          merged.generatedPrompt = buildBackgroundPrompt(merged, prev.production);
        }
        return merged;
      });
      const updatedBg = nextBgs.find((b) => b.id === id);
      const affectedSceneIds = new Set<string>();
      const nextScenes = prev.scenes.map((sc) => {
        if (sc.backgroundId !== id || !updatedBg) return sc;
        affectedSceneIds.add(sc.id);
        return {
          ...sc,
          sceneLocation: updatedBg.name,
          locationId: updatedBg.locationId || updatedBg.id,
          lighting:
            patch.lightingDirection !== undefined
              ? updatedBg.lightingDirection
              : sc.lighting,
        };
      });
      const prevDep = prev.dependencyState || createInitialDependencyState(prev);
      const nextVersion = (prev.metadata.projectVersion || 1) + 1;
      const updated: StoryboardProject = {
        ...prev,
        metadata: {
          ...prev.metadata,
          projectVersion: nextVersion,
        },
        backgrounds: nextBgs,
        scenes: nextScenes,
        dependencyState: {
          ...prevDep,
          backgroundSignature: computeBackgroundSignature(
            nextBgs,
            prev.globalBackgroundDnaLock
          ),
          stepStatuses: {
            ...prevDep.stepStatuses,
            backgrounds: 'Up to Date',
          },
        },
      };
      // Targeted recompilation: ONLY scenes bound to this backgroundId
      updated.scenes = recompileScenesWithMeta(updated, affectedSceneIds);
      return updated;
    });
  };

  // Voice & Audio
  const handleUpdateAudioSettings = (patch: Partial<AudioSettings>) => {
    commitProjectUpdate((prev) => {
      const nextAudio = { ...prev.audioSettings, ...patch };
      const prevDep = prev.dependencyState || createInitialDependencyState(prev);
      const nextVersion = (prev.metadata.projectVersion || 1) + 1;
      const updated: StoryboardProject = {
        ...prev,
        metadata: {
          ...prev.metadata,
          projectVersion: nextVersion,
        },
        audioSettings: nextAudio,
        dependencyState: {
          ...prevDep,
          voiceSignature: computeVoiceSignature(nextAudio, prev.voiceProfiles),
          stepStatuses: {
            ...prevDep.stepStatuses,
            audio: 'Up to Date',
          },
        },
      };
      updated.scenes = recompileScenesWithMeta(updated);
      return updated;
    });
  };

  const handleUpdateVoiceProfile = (
    id: string,
    patch: Partial<VoiceProfile>
  ) => {
    commitProjectUpdate((prev) => {
      const nextVoices = prev.voiceProfiles.map((vp) =>
        vp.id === id ? { ...vp, ...patch } : vp
      );
      const affectedSceneIds = new Set(
        prev.scenes
          .filter((sc) =>
            sc.audioTimeline.some((seg) => seg.speakerId === id)
          )
          .map((sc) => sc.id)
      );
      const prevDep = prev.dependencyState || createInitialDependencyState(prev);
      const nextVersion = (prev.metadata.projectVersion || 1) + 1;
      const updated: StoryboardProject = {
        ...prev,
        metadata: {
          ...prev.metadata,
          projectVersion: nextVersion,
        },
        voiceProfiles: nextVoices,
        dependencyState: {
          ...prevDep,
          voiceSignature: computeVoiceSignature(prev.audioSettings, nextVoices),
          stepStatuses: {
            ...prevDep.stepStatuses,
            audio: 'Up to Date',
          },
        },
      };
      updated.scenes = recompileScenesWithMeta(
        updated,
        affectedSceneIds.size > 0 ? affectedSceneIds : undefined
      );
      return updated;
    });
  };

  const handleResetDefaultTimeline = () => {
    commitProjectUpdate((prev) => {
      const freshTemplate = buildDurationTimelineTemplate(
        prev.characters,
        prev.voiceProfiles,
        prev.audioSettings,
        prev.production.episodeTitle,
        prev.production.sceneDuration
      );
      return {
        ...prev,
        defaultTimelineTemplate: freshTemplate,
      };
    });
    notify(
      'info',
      'Template timeline direset berdasarkan karakter & durasi scene aktif.'
    );
  };

  // Story Update & Dirty State Tracking
  const handleUpdateStory = (patch: Partial<StoryOutline>) => {
    commitProjectUpdate((prev) => {
      const nextStory = { ...prev.story, ...patch };
      const prevDep = prev.dependencyState || createInitialDependencyState(prev);
      const nextSig = computeStoryOutlineSignature(nextStory);
      const outlineChanged = nextSig !== prevDep.storyOutlineSignature;
      const hasDownstream =
        prev.scenes.length > 0 ||
        prev.characters.length > 0 ||
        prev.backgrounds.length > 0;

      const nextStatuses: Record<StudioSectionId, StepSyncStatus> = {
        ...prevDep.stepStatuses,
        story: nextStory.rawStory.trim() ? 'Up to Date' : 'Ready',
      };
      const nextReasons = { ...prevDep.outdatedReasons };

      if (outlineChanged && hasDownstream) {
        if (prev.characters.length > 0) {
          nextStatuses.characters = 'Needs Review';
        }
        if (prev.backgrounds.length > 0) {
          nextStatuses.backgrounds = 'Needs Review';
        }
        if (prev.scenes.length > 0) {
          nextStatuses.storyboard = 'Outdated';
          nextStatuses.keyframes = 'Outdated';
          nextStatuses.export = 'Outdated';
          nextReasons.storyboard =
            'Naskah atau Story Outline telah diubah setelah storyboard dibuat.';
        }
      }

      return {
        ...prev,
        story: nextStory,
        dependencyState: {
          ...prevDep,
          storyOutlineSignature: nextSig,
          stepStatuses: nextStatuses,
          outdatedReasons: nextReasons,
        },
      };
    });
  };

  // Story Generation (Gemini AI + Template Fallback)
  const handleAutoGenerateStory = async () => {
    setIsGeneratingStory(true);
    try {
      const res = await fetch('/api/ai/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          production: project.production,
          characters: project.characters,
          backgrounds: project.backgrounds,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok && data.story) {
        handleUpdateStory(data.story);
        notify('success', 'Cerita & Story Outline berhasil dibuat oleh Gemini AI.');
        return;
      }
      const fallback = generateFallbackStory(project);
      handleUpdateStory(fallback);
      notify(
        'info',
        data.error ||
          'Gemini AI tidak tersedia, cerita disusun menggunakan generator template studio.'
      );
    } catch {
      const fallback = generateFallbackStory(project);
      handleUpdateStory(fallback);
      notify(
        'info',
        'Koneksi AI tidak tersedia, cerita disusun menggunakan generator template studio.'
      );
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const handleBuildOutlineFromRaw = () => {
    const raw = project.story.rawStory.trim();
    if (!raw) {
      notify('error', 'Tulis naskah cerita terlebih dahulu.');
      return;
    }
    const sentences = raw
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    handleUpdateStory({
      opening: sentences[0] || raw,
      curiosityProblem:
        sentences[1] ||
        `Karakter mulai penasaran terhadap inti cerita "${project.production.episodeTitle}".`,
      exploration:
        sentences[2] ||
        'Mereka mengamati dan menelusuri peristiwa cerita langkah demi langkah.',
      educationalExplanation:
        sentences[3] ||
        project.production.educationalMessage ||
        'Penjelasan konsep dan nilai utama disampaikan dengan jelas dan ramah anak.',
      closing:
        sentences[4] ||
        'Kisah ditutup dengan pemahaman baru dan pesan moral yang berkesan.',
      moralMessage:
        project.production.educationalMessage || project.story.moralMessage,
    });
    notify('success', 'Story Outline 6 bagian diperbarui dari naskah utama.');
  };

  // Storyboard Generator (Validation Gate + Exact sceneCount)
  const applyGeneratedScenesFromApi = (
    apiScenes: Array<{
      sceneNumber: number;
      sceneTitle: string;
      backgroundId: string;
      characterIds?: string[];
      characterPositions: string;
      sceneDescription: string;
      educationalObjective: string;
      cameraShot: string;
      cameraMovement: string;
      composition?: string;
      characterAction: string;
      facialExpression: string;
      bodyMovement: string;
      environmentAnimation: string;
      lighting: string;
      soundEffects: string;
      backgroundMusic: string;
      dialogueLine1: string;
      dialogueLine2: string;
      voiceOverLine: string;
    }>,
    onlySceneNumber?: number,
    sourceProject?: StoryboardProject
  ) => {
    const activeProject = sourceProject || project;
    const duration = activeProject.production.sceneDuration;
    const activeChars = activeProject.characters.filter((c) => c.isActive);
    const char1 = activeChars[0];
    const char2 = activeChars[1] || activeChars[0];
    const audioMode = activeProject.audioSettings.audioMode;

    const mapped: SceneItem[] = apiScenes.map((item, idx) => {
      const sNum = onlySceneNumber ?? idx + 1;
      const bg =
        activeProject.backgrounds.find((b) => b.id === item.backgroundId) ||
        activeProject.backgrounds[
          (sNum - 1) % Math.max(1, activeProject.backgrounds.length)
        ] ||
        activeProject.backgrounds[0];
      const existing = activeProject.scenes.find(
        (s) => s.sceneNumber === sNum
      );

      const t1 = Number(((3 / 8) * duration).toFixed(1));
      const t2 = Number(((5 / 8) * duration).toFixed(1));
      const tMid = Number((duration / 2).toFixed(1));

      const timeline: AudioSegment[] =
        audioMode === 'Tanpa Dialog / Musik & SFX Saja'
          ? []
          : audioMode === 'Voice Over (Narator)'
            ? [
                {
                  id: `seg-${sNum}-vo`,
                  startTime: 0,
                  endTime: duration,
                  speakerId: 'VOICE-03',
                  speakerName: 'Narator',
                  audioType: 'Voice Over',
                  text:
                    item.voiceOverLine ||
                    item.sceneDescription ||
                    'Mari kita ikuti kisahnya.',
                },
              ]
            : audioMode === 'Dialog Karakter'
              ? [
                  {
                    id: `seg-${sNum}-1`,
                    startTime: 0,
                    endTime: tMid,
                    speakerId: char1?.voiceDnaId || 'VOICE-01',
                    speakerName: char1?.name || 'Karakter 1',
                    audioType: 'Dialog / Lip-sync',
                    text: item.dialogueLine1 || 'Wah, lihat ini!',
                  },
                  {
                    id: `seg-${sNum}-2`,
                    startTime: tMid,
                    endTime: duration,
                    speakerId: char2?.voiceDnaId || 'VOICE-02',
                    speakerName: char2?.name || 'Karakter 2',
                    audioType: 'Dialog / Lip-sync',
                    text: item.dialogueLine2 || 'Menarik sekali!',
                  },
                ]
              : [
                  {
                    id: `seg-${sNum}-1`,
                    startTime: 0,
                    endTime: t1,
                    speakerId: char1?.voiceDnaId || 'VOICE-01',
                    speakerName: char1?.name || 'Karakter 1',
                    audioType: 'Dialog / Lip-sync',
                    text: item.dialogueLine1 || 'Wah, lihat ini!',
                  },
                  {
                    id: `seg-${sNum}-2`,
                    startTime: t1,
                    endTime: t2,
                    speakerId: char2?.voiceDnaId || 'VOICE-02',
                    speakerName: char2?.name || 'Karakter 2',
                    audioType: 'Dialog / Lip-sync',
                    text: item.dialogueLine2 || 'Menarik sekali!',
                  },
                  {
                    id: `seg-${sNum}-3`,
                    startTime: t2,
                    endTime: duration,
                    speakerId: 'VOICE-03',
                    speakerName: 'Narator',
                    audioType: 'Voice Over',
                    text: item.voiceOverLine || 'Mari kita amati bersama.',
                  },
                ];

      const validCharIds =
        item.characterIds && item.characterIds.length > 0
          ? item.characterIds.filter((cid) =>
              activeChars.some((ac) => ac.id === cid)
            )
          : [];

      const draft: SceneItem = {
        id: existing?.id || `scene-${sNum}-${Date.now()}`,
        sceneNumber: sNum,
        sceneTitle: item.sceneTitle || `Scene ${sNum}`,
        sceneDuration: duration,
        backgroundId: bg?.id || '',
        locationId: bg?.locationId || bg?.id || '',
        sceneLocation: bg?.name || 'Belum ada lokasi terdaftar',
        characterIds:
          validCharIds.length > 0
            ? validCharIds
            : activeChars.map((c) => c.id),
        characterPositions: item.characterPositions,
        sceneDescription: item.sceneDescription,
        educationalObjective: item.educationalObjective,
        cameraShot: item.cameraShot,
        cameraMovement: item.cameraMovement,
        composition:
          item.composition ||
          `Balanced framing in ${activeProject.production.aspectRatio}`,
        characterAction: item.characterAction,
        facialExpression: item.facialExpression,
        bodyMovement: item.bodyMovement,
        environmentAnimation: item.environmentAnimation,
        lighting: item.lighting || bg?.lightingDirection || 'Balanced daylight',
        dialogue:
          audioMode === 'Voice Over (Narator)' ||
          audioMode === 'Tanpa Dialog / Musik & SFX Saja'
            ? ''
            : `${char1?.name || 'Karakter 1'}: "${item.dialogueLine1}" | ${char2?.name || 'Karakter 2'}: "${item.dialogueLine2}"`,
        voiceOver:
          audioMode === 'Dialog Karakter' ||
          audioMode === 'Tanpa Dialog / Musik & SFX Saja'
            ? ''
            : item.voiceOverLine,
        audioTimeline: timeline,
        allowTimelineOverlap: activeProject.audioSettings.allowOverlapDefault,
        soundEffects: item.soundEffects,
        backgroundMusic: item.backgroundMusic,
        imagePrompt: '',
        videoPrompt: '',
        keyframePrompt: '',
        keyframeImage: existing?.keyframeImage || null,
        negativePrompt: '',
      };

      return recompileSceneWithMeta(draft, activeProject);
    });

    if (onlySceneNumber) {
      commitProjectUpdate((prev) => {
        const updated: StoryboardProject = {
          ...prev,
          scenes: prev.scenes.map((sc) =>
            sc.sceneNumber === onlySceneNumber ? mapped[0] || sc : sc
          ),
        };
        updated.scenes = recompileScenesWithMeta(
          updated,
          mapped[0] ? new Set([mapped[0].id]) : undefined
        );
        return updated;
      });
    } else {
      const targetCount = activeProject.production.sceneCount;
      const exactScenes =
        mapped.length === targetCount
          ? mapped
          : mapped.length > targetCount
            ? mapped.slice(0, targetCount)
            : [
                ...mapped,
                ...generateFallbackScenes(activeProject).slice(
                  mapped.length,
                  targetCount
                ),
              ].map((s, idx) => ({ ...s, sceneNumber: idx + 1 }));

      commitProjectUpdate((prev) => {
        const nextProject: StoryboardProject = {
          ...prev,
          metadata: { ...prev.metadata, status: 'Siap Produksi' },
          scenes: exactScenes,
        };
        nextProject.scenes = recompileScenesWithMeta(nextProject);
        nextProject.dependencyState = createInitialDependencyState(nextProject);
        return nextProject;
      });
      if (exactScenes[0]) {
        setSelectedSceneId(exactScenes[0].id);
      }
    }
  };

  const handleGenerateStoryboard = async () => {
    const validation = validateProjectForStoryboard(project);
    if (!validation.ok) {
      notify('error', validation.errors[0]);
      return;
    }

    setIsGeneratingStoryboard(true);
    try {
      const workingProject = project;
      const res = await fetch('/api/ai/storyboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workingProject),
      });
      const data = await res.json();
      if (
        res.ok &&
        data.ok &&
        Array.isArray(data.scenes) &&
        data.scenes.length > 0
      ) {
        applyGeneratedScenesFromApi(data.scenes, undefined, workingProject);
        navigateToSection('storyboard');
        notify(
          'success',
          `Storyboard ${workingProject.production.sceneCount} scene berhasil dibuat dengan Gemini AI.`
        );
        return;
      }

      const fallback = generateFallbackScenes(workingProject);
      commitProjectUpdate((prev) => {
        const nextProject: StoryboardProject = {
          ...prev,
          metadata: { ...prev.metadata, status: 'Siap Produksi' },
          scenes: fallback,
        };
        nextProject.scenes = recompileScenesWithMeta(nextProject);
        nextProject.dependencyState = createInitialDependencyState(nextProject);
        return nextProject;
      });
      if (fallback[0]) setSelectedSceneId(fallback[0].id);
      navigateToSection('storyboard');
      notify(
        'info',
        data.error ||
          `Storyboard ${fallback.length} scene disusun menggunakan generator template studio.`
      );
    } catch {
      const fallback = generateFallbackScenes(project);
      commitProjectUpdate((prev) => {
        const nextProject: StoryboardProject = {
          ...prev,
          metadata: { ...prev.metadata, status: 'Siap Produksi' },
          scenes: fallback,
        };
        nextProject.scenes = recompileScenesWithMeta(nextProject);
        nextProject.dependencyState = createInitialDependencyState(nextProject);
        return nextProject;
      });
      if (fallback[0]) setSelectedSceneId(fallback[0].id);
      navigateToSection('storyboard');
      notify(
        'info',
        `Koneksi AI tidak tersedia. Storyboard ${fallback.length} scene disusun dengan template studio.`
      );
    } finally {
      setIsGeneratingStoryboard(false);
    }
  };

  const handleRegenerateSingleScene = async (sceneNumber: number) => {
    const validation = validateProjectForStoryboard(project);
    if (!validation.ok) {
      notify('error', validation.errors[0]);
      return;
    }

    setRegeneratingSceneNumber(sceneNumber);
    try {
      const res = await fetch('/api/ai/storyboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...project, onlySceneNumber: sceneNumber }),
      });
      const data = await res.json();
      if (
        res.ok &&
        data.ok &&
        Array.isArray(data.scenes) &&
        data.scenes.length > 0
      ) {
        applyGeneratedScenesFromApi(data.scenes, sceneNumber);
        notify(
          'success',
          `Scene ${sceneNumber} diperbarui tanpa mengubah DNA karakter & background.`
        );
        return;
      }

      const regenerated = generateFallbackScenes(project, sceneNumber);
      commitProjectUpdate((prev) => {
        const nextProject: StoryboardProject = {
          ...prev,
          scenes: regenerated,
        };
        const target = regenerated.find((s) => s.sceneNumber === sceneNumber);
        nextProject.scenes = recompileScenesWithMeta(
          nextProject,
          target ? new Set([target.id]) : undefined
        );
        return nextProject;
      });
      notify(
        'info',
        `Scene ${sceneNumber} diperbarui menggunakan template studio (DNA karakter & background tetap terkunci).`
      );
    } catch {
      const regenerated = generateFallbackScenes(project, sceneNumber);
      commitProjectUpdate((prev) => {
        const nextProject: StoryboardProject = {
          ...prev,
          scenes: regenerated,
        };
        const target = regenerated.find((s) => s.sceneNumber === sceneNumber);
        nextProject.scenes = recompileScenesWithMeta(
          nextProject,
          target ? new Set([target.id]) : undefined
        );
        return nextProject;
      });
      notify(
        'info',
        `Scene ${sceneNumber} diperbarui menggunakan template studio.`
      );
    } finally {
      setRegeneratingSceneNumber(null);
    }
  };

  const handleAddScene = () => {
    if (project.characters.filter((c) => c.isActive).length === 0) {
      notify(
        'error',
        'Tambahkan minimal 1 karakter aktif sebelum menambah scene.'
      );
      return;
    }
    if (project.backgrounds.length === 0) {
      notify(
        'error',
        'Tambahkan minimal 1 latar background sebelum menambah scene.'
      );
      return;
    }

    commitProjectUpdate((prev) => {
      const nextNum = prev.scenes.length + 1;
      const bg = prev.backgrounds[0];
      const activeChars = prev.characters.filter((c) => c.isActive);
      const duration = prev.production.sceneDuration;
      const timeline = scaleTimelineToDuration(
        prev.defaultTimelineTemplate,
        duration
      );
      const draft: SceneItem = {
        id: `scene-${Date.now()}`,
        sceneNumber: nextNum,
        sceneTitle: `Scene Baru ${nextNum}`,
        sceneDuration: duration,
        backgroundId: bg?.id || '',
        locationId: bg?.locationId || bg?.id || '',
        sceneLocation: bg?.name || 'Lokasi Utama',
        characterIds: activeChars.map((c) => c.id),
        characterPositions:
          activeChars.length >= 2
            ? `${activeChars[0].name} on the left foreground, ${activeChars[1].name} on the right foreground`
            : `${activeChars[0]?.name || 'Character'} centered clearly in foreground`,
        sceneDescription: `Lanjutan adegan "${prev.production.episodeTitle || 'Cerita'}" dengan interaksi ramah anak.`,
        educationalObjective: prev.production.educationalMessage,
        cameraShot: 'Medium Two-Shot',
        cameraMovement: 'Gentle smooth pan',
        composition: `Balanced framing in ${prev.production.aspectRatio}`,
        characterAction: 'Characters observe and discuss the story beat',
        facialExpression: 'Cheerful and attentive',
        bodyMovement: 'Natural gentle gestures',
        environmentAnimation: 'Subtle ambient motion in background',
        lighting: bg?.lightingDirection || 'Soft daylight',
        dialogue: timeline
          .filter((s) => s.audioType === 'Dialog / Lip-sync')
          .map((s) => `${s.speakerName}: "${s.text}"`)
          .join(' | '),
        voiceOver: timeline
          .filter((s) => s.audioType === 'Voice Over')
          .map((s) => s.text)
          .join(' '),
        audioTimeline: timeline,
        allowTimelineOverlap: prev.audioSettings.allowOverlapDefault,
        soundEffects: 'Soft ambient nature',
        backgroundMusic: 'Warm educational background music',
        imagePrompt: '',
        videoPrompt: '',
        keyframePrompt: '',
        keyframeImage: null,
        negativePrompt: '',
      };
      const nextProd = {
        ...prev.production,
        sceneCount: Math.min(30, nextNum),
      };
      const updatedForCompile: StoryboardProject = {
        ...prev,
        production: nextProd,
      };
      const nextScene = recompileSceneWithMeta(draft, updatedForCompile);
      setSelectedSceneId(nextScene.id);
      const nextProject: StoryboardProject = {
        ...updatedForCompile,
        scenes: [...prev.scenes, nextScene],
      };
      nextProject.dependencyState = createInitialDependencyState(nextProject);
      return nextProject;
    });
    notify('success', 'Scene baru ditambahkan ke storyboard.');
  };

  // Targeted single-scene update: NEVER alters unrelated scenes
  const handleUpdateScene = (sceneId: string, patch: Partial<SceneItem>) => {
    commitProjectUpdate((prev) => {
      const nextVersion = (prev.metadata.projectVersion || 1) + 1;
      const versionedProject: StoryboardProject = {
        ...prev,
        metadata: { ...prev.metadata, projectVersion: nextVersion },
      };
      const nextScenes = prev.scenes.map((sc) => {
        if (sc.id !== sceneId) return sc;
        const merged = { ...sc, ...patch };
        return recompileSceneWithMeta(merged, versionedProject);
      });
      return {
        ...versionedProject,
        scenes: nextScenes,
      };
    });
  };

  const handleResetSceneTimeline = (sceneId: string) => {
    commitProjectUpdate((prev) => {
      const nextVersion = (prev.metadata.projectVersion || 1) + 1;
      const versionedProject: StoryboardProject = {
        ...prev,
        metadata: { ...prev.metadata, projectVersion: nextVersion },
      };
      const nextScenes = prev.scenes.map((sc) => {
        if (sc.id !== sceneId) return sc;
        const scaled = scaleTimelineToDuration(
          prev.defaultTimelineTemplate,
          sc.sceneDuration
        );
        const merged = { ...sc, audioTimeline: scaled };
        return recompileSceneWithMeta(merged, versionedProject);
      });
      return { ...versionedProject, scenes: nextScenes };
    });
    notify('info', 'Audio timeline scene direset ke template default.');
  };

  const handleSynchronizePromptFromInspector = (sceneId?: string) => {
    if (project.dependencyState?.pendingStoryChange) {
      void handleSynchronizeProject();
      return;
    }
    commitProjectUpdate((prev) => {
      const nextVersion = (prev.metadata.projectVersion || 1) + 1;
      const updated: StoryboardProject = {
        ...prev,
        metadata: { ...prev.metadata, projectVersion: nextVersion },
      };
      updated.scenes = recompileScenesWithMeta(
        updated,
        sceneId ? new Set([sceneId]) : undefined
      );
      updated.dependencyState = createInitialDependencyState(updated);
      return updated;
    });
    notify('success', 'Prompt scene berhasil disinkronkan dengan Single Source of Truth.');
  };

  // JSON Import / Save & TXT Export
  const handleImportJson = async (file: File) => {
    try {
      const text = await file.text();
      const result = validateAndParseProjectJson(text);
      if (!result.ok) {
        notify('error', `Import JSON gagal: ${result.error}`);
        return;
      }
      setHistory((h) => [...h.slice(-14), project]);
      setProject(result.project);
      setSelectedSceneId(result.project.scenes[0]?.id || '');
      setActiveSection('production');
      notify(
        'success',
        `Project "${result.project.production.episodeTitle || result.project.metadata.title}" (${result.project.metadata.projectId}) berhasil diimpor secara utuh.`
      );
    } catch {
      notify('error', 'Gagal membaca file JSON yang dipilih.');
    }
  };

  const handleSaveJson = () => {
    const slug = (project.production.episodeTitle || 'storyboard-project')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const content = buildProjectJsonExport(project);
    downloadTextFile(`${slug}.json`, content, 'application/json');
    notify('success', 'File JSON project berhasil diunduh.');
  };

  const handleExportTxt = () => {
    const slug = (project.production.episodeTitle || 'storyboard-project')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const content = buildProjectTxtExport(project);
    downloadTextFile(
      `${slug}-storyboard.txt`,
      content,
      'text/plain;charset=utf-8'
    );
    notify('success', 'Dokumen storyboard TXT berhasil diekspor.');
  };

  // Confirmation dialog execution
  const handleExecuteConfirm = () => {
    if (!confirmAction) return;
    switch (confirmAction.kind) {
      case 'delete-character': {
        const target = confirmAction.target;
        commitProjectUpdate((prev) => {
          const nextChars = prev.characters.filter((c) => c.id !== target.id);
          const affectedIds = new Set<string>();
          const nextScenes = prev.scenes.map((sc) => {
            if (!sc.characterIds.includes(target.id)) return sc;
            affectedIds.add(sc.id);
            return {
              ...sc,
              characterIds: sc.characterIds.filter((cid) => cid !== target.id),
            };
          });
          const updated: StoryboardProject = {
            ...prev,
            characters: nextChars,
            scenes: nextScenes,
          };
          updated.scenes = recompileScenesWithMeta(updated, affectedIds);
          updated.dependencyState = createInitialDependencyState(updated);
          return updated;
        });
        notify('info', `Karakter "${target.name}" dihapus.`);
        break;
      }
      case 'delete-background': {
        const target = confirmAction.target;
        commitProjectUpdate((prev) => {
          const nextBgs = prev.backgrounds.filter((b) => b.id !== target.id);
          const fallbackBg = nextBgs[0];
          const affectedIds = new Set<string>();
          const nextScenes = prev.scenes.map((sc) => {
            if (sc.backgroundId !== target.id) return sc;
            affectedIds.add(sc.id);
            return {
              ...sc,
              backgroundId: fallbackBg?.id || '',
              locationId: fallbackBg?.locationId || fallbackBg?.id || '',
              sceneLocation: fallbackBg?.name || 'Belum dipilih',
            };
          });
          const updated: StoryboardProject = {
            ...prev,
            backgrounds: nextBgs,
            scenes: nextScenes,
          };
          updated.scenes = recompileScenesWithMeta(updated, affectedIds);
          updated.dependencyState = createInitialDependencyState(updated);
          return updated;
        });
        notify('info', `Background "${target.name}" dihapus.`);
        break;
      }
      case 'delete-scene': {
        const target = confirmAction.target;
        commitProjectUpdate((prev) => {
          const remaining = prev.scenes
            .filter((s) => s.id !== target.id)
            .map((s, idx) => ({ ...s, sceneNumber: idx + 1 }));
          const updated: StoryboardProject = {
            ...prev,
            production: {
              ...prev.production,
              sceneCount: Math.max(1, remaining.length),
            },
            scenes: remaining,
          };
          updated.scenes = recompileScenesWithMeta(updated);
          updated.dependencyState = createInitialDependencyState(updated);
          if (selectedSceneId === target.id) {
            setSelectedSceneId(updated.scenes[0]?.id || '');
          }
          return updated;
        });
        notify('info', `Scene ${target.sceneNumber} dihapus.`);
        break;
      }
      case 'clear-story': {
        handleUpdateStory({
          rawStory: '',
          opening: '',
          curiosityProblem: '',
          exploration: '',
          educationalExplanation: '',
          closing: '',
          moralMessage: '',
        });
        notify('info', 'Naskah cerita dikosongkan.');
        break;
      }
      case 'new-project':
      case 'clear-project': {
        const blank = createNewBlankProject();
        setHistory((h) => [...h.slice(-14), project]);
        setProject(blank);
        setSelectedSceneId('');
        setActiveSection('production');
        notify(
          'success',
          `Project baru (${blank.metadata.projectId}) dibuat bersih tanpa sisa data cerita sebelumnya.`
        );
        break;
      }
    }
    setConfirmAction(null);
  };

  const confirmDialogConfig = (() => {
    if (!confirmAction) return null;
    switch (confirmAction.kind) {
      case 'delete-character':
        return {
          title: `Hapus Karakter "${confirmAction.target.name}"?`,
          description:
            'Karakter ini akan dihapus dari daftar pemeran dan dilepas dari prompt scene aktif. Anda dapat membatalkannya dengan Undo.',
          confirmLabel: 'Hapus Karakter',
        };
      case 'delete-background':
        return {
          title: `Hapus Lokasi "${confirmAction.target.name}"?`,
          description:
            'Scene yang memakai lokasi ini akan dialihkan ke lokasi tersisa. Anda masih bisa membatalkannya dengan Undo.',
          confirmLabel: 'Hapus Background',
        };
      case 'delete-scene':
        return {
          title: `Hapus Scene ${confirmAction.target.sceneNumber}?`,
          description:
            'Scene ini akan dihapus dan urutan nomor scene berikutnya akan disesuaikan otomatis.',
          confirmLabel: 'Hapus Scene',
        };
      case 'clear-story':
        return {
          title: 'Kosongkan Naskah Cerita?',
          description:
            'Seluruh teks cerita dan 6 bagian Story Outline akan dikosongkan.',
          confirmLabel: 'Kosongkan Cerita',
        };
      case 'new-project':
        return {
          title: 'Buat Project Baru yang Bersih?',
          description:
            'Sistem akan membuat Project ID baru yang terisolasi dan mengosongkan judul, karakter, background, cerita, timeline, serta storyboard saat ini.',
          confirmLabel: 'Buat Project Baru',
        };
      case 'clear-project':
        return {
          title: 'Reset / Clear Project?',
          description:
            'Seluruh karakter, background, cerita, audio timeline, dan scene saat ini akan dibersihkan ke project baru ber-ID unik (Anda masih bisa Undo).',
          confirmLabel: 'Clear Project',
        };
    }
  })();

  const selectedScene =
    project.scenes.find((s) => s.id === selectedSceneId) || project.scenes[0];

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <StudioHeader
        projectId={project.metadata.projectId}
        projectVersion={project.metadata.projectVersion || 1}
        projectStatus={project.metadata.status}
        lastSavedText={lastSavedAt}
        theme={theme}
        canUndo={history.length > 0}
        onToggleTheme={() =>
          setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
        }
        onUndo={handleUndo}
        onNewProject={() => setConfirmAction({ kind: 'new-project' })}
        onImportJson={handleImportJson}
        onSaveJson={handleSaveJson}
        onExportTxt={handleExportTxt}
        onToggleMobileNav={() => setMobileNavOpen(true)}
      />

      <div className="mx-auto flex max-w-[1600px]">
        <StudioSidebar
          activeSection={activeSection}
          project={project}
          mobileOpen={mobileNavOpen}
          onSelectSection={navigateToSection}
          onCloseMobile={() => setMobileNavOpen(false)}
          onRequestNewProject={() => setConfirmAction({ kind: 'new-project' })}
          onRequestClearProject={() =>
            setConfirmAction({ kind: 'clear-project' })
          }
        />

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-4xl">
            <StorySyncBanner
              project={project}
              isSyncing={isDetectingCast || isGeneratingStoryboard}
              onSynchronizeProject={() => void handleSynchronizeProject()}
              onCancelStoryChange={handleCancelStoryChange}
              onUpdateDependentSteps={() => void handleUpdateDependentSteps()}
            />

            {activeSection === 'production' && (
              <ProductionConfigSection
                production={project.production}
                onChange={handleUpdateProduction}
                onValidateAndContinue={handleValidateAndContinueProduction}
                onValidationError={(msg) => notify('error', msg)}
              />
            )}

            {activeSection === 'characters' && (
              <CharacterDnaSection
                characters={project.characters}
                globalDnaLock={project.globalCharacterDnaLock}
                production={project.production}
                voiceProfiles={project.voiceProfiles}
                isDetectingCast={isDetectingCast}
                onAutoDetectCharacters={() =>
                  void handleAutoDetectCastAndLocations('characters')
                }
                onToggleGlobalLock={(locked) =>
                  commitProjectUpdate((prev) => {
                    const prevDep =
                      prev.dependencyState || createInitialDependencyState(prev);
                    const updated: StoryboardProject = {
                      ...prev,
                      globalCharacterDnaLock: locked,
                      dependencyState: {
                        ...prevDep,
                        castSignature: computeCastSignature(
                          prev.characters,
                          locked
                        ),
                      },
                    };
                    updated.scenes = recompileScenesWithMeta(updated);
                    return updated;
                  })
                }
                onAddCharacter={handleAddCharacter}
                onUpdateCharacter={handleUpdateCharacter}
                onRequestDeleteCharacter={(char) =>
                  setConfirmAction({ kind: 'delete-character', target: char })
                }
                onCopyText={handleCopyText}
                onNotify={notify}
                onNextSection={() => navigateToSection('backgrounds')}
              />
            )}

            {activeSection === 'backgrounds' && (
              <BackgroundSyncSection
                backgrounds={project.backgrounds}
                globalBackgroundLock={project.globalBackgroundDnaLock}
                production={project.production}
                isDetectingCast={isDetectingCast}
                onAutoDetectBackgrounds={() =>
                  void handleAutoDetectCastAndLocations('backgrounds')
                }
                onToggleGlobalLock={(locked) =>
                  commitProjectUpdate((prev) => {
                    const prevDep =
                      prev.dependencyState || createInitialDependencyState(prev);
                    const updated: StoryboardProject = {
                      ...prev,
                      globalBackgroundDnaLock: locked,
                      dependencyState: {
                        ...prevDep,
                        backgroundSignature: computeBackgroundSignature(
                          prev.backgrounds,
                          locked
                        ),
                      },
                    };
                    updated.scenes = recompileScenesWithMeta(updated);
                    return updated;
                  })
                }
                onAddBackground={handleAddBackground}
                onUpdateBackground={handleUpdateBackground}
                onRequestDeleteBackground={(bg) =>
                  setConfirmAction({ kind: 'delete-background', target: bg })
                }
                onCopyText={handleCopyText}
                onNotify={notify}
                onNextSection={() => navigateToSection('audio')}
              />
            )}

            {activeSection === 'audio' && (
              <VoiceAudioSection
                audioSettings={project.audioSettings}
                voiceProfiles={project.voiceProfiles}
                defaultTimeline={project.defaultTimelineTemplate}
                production={project.production}
                characters={project.characters}
                onUpdateAudioSettings={handleUpdateAudioSettings}
                onUpdateVoiceProfile={handleUpdateVoiceProfile}
                onUpdateDefaultTimeline={(segments) =>
                  commitProjectUpdate((prev) => ({
                    ...prev,
                    defaultTimelineTemplate: segments,
                  }))
                }
                onResetDefaultTimeline={handleResetDefaultTimeline}
                onCopyText={handleCopyText}
                onNextSection={() => navigateToSection('story')}
              />
            )}

            {activeSection === 'story' && (
              <StoryOutlineSection
                story={project.story}
                episodeTitle={project.production.episodeTitle}
                educationalMessage={project.production.educationalMessage}
                sceneCount={project.production.sceneCount}
                isGeneratingStory={isGeneratingStory}
                isGeneratingStoryboard={isGeneratingStoryboard}
                onUpdateStory={handleUpdateStory}
                onAutoGenerateStory={handleAutoGenerateStory}
                onBuildOutlineFromRaw={handleBuildOutlineFromRaw}
                onRequestClearStory={() =>
                  setConfirmAction({ kind: 'clear-story' })
                }
                onGenerateStoryboard={handleGenerateStoryboard}
              />
            )}

            {activeSection === 'storyboard' && (
              <StoryboardSection
                project={project}
                selectedSceneId={selectedScene?.id || ''}
                isGeneratingStoryboard={isGeneratingStoryboard}
                regeneratingSceneNumber={regeneratingSceneNumber}
                onSelectScene={setSelectedSceneId}
                onGenerateStoryboard={handleGenerateStoryboard}
                onRegenerateSingleScene={handleRegenerateSingleScene}
                onAddScene={handleAddScene}
                onUpdateScene={handleUpdateScene}
                onResetSceneTimeline={handleResetSceneTimeline}
                onRequestDeleteScene={(scene) =>
                  setConfirmAction({ kind: 'delete-scene', target: scene })
                }
                onCopyText={handleCopyText}
              />
            )}

            {activeSection === 'keyframes' && (
              <KeyframesSection
                scenes={project.scenes}
                production={project.production}
                onRegenerateAllKeyframes={() => {
                  commitProjectUpdate((prev) => {
                    const nextProject: StoryboardProject = {
                      ...prev,
                      scenes: recompileScenesWithMeta(prev),
                    };
                    nextProject.dependencyState =
                      createInitialDependencyState(nextProject);
                    return nextProject;
                  });
                  notify(
                    'success',
                    `Seluruh ${project.scenes.length} prompt First-Frame Keyframe disinkronkan dengan DNA terbaru.`
                  );
                }}
                onRegenerateSingleKeyframe={(sceneId) => {
                  commitProjectUpdate((prev) => ({
                    ...prev,
                    scenes: recompileScenesWithMeta(prev, new Set([sceneId])),
                  }));
                  notify('success', 'Prompt keyframe scene diperbarui.');
                }}
                onUpdateSceneKeyframeImage={(sceneId, dataUrl) =>
                  handleUpdateScene(sceneId, { keyframeImage: dataUrl })
                }
                onCopyText={handleCopyText}
                onNotify={notify}
              />
            )}

            {activeSection === 'export' && (
              <ExportPreviewSection
                project={project}
                onSaveJson={handleSaveJson}
                onExportTxt={handleExportTxt}
                onCopyText={handleCopyText}
              />
            )}
          </div>
        </main>

        <RightInspector
          project={project}
          selectedScene={selectedScene}
          onCopyText={handleCopyText}
          onSynchronizePrompt={handleSynchronizePromptFromInspector}
        />
      </div>

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div
          className="fixed right-4 bottom-4 z-50 flex max-w-sm flex-col gap-2"
          aria-live="polite"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`flex items-start gap-2.5 rounded-xl border bg-white px-4 py-3 text-xs shadow-lg dark:bg-zinc-900 ${
                toast.type === 'error'
                  ? 'border-rose-300 text-rose-800 dark:border-rose-800 dark:text-rose-300'
                  : toast.type === 'success'
                    ? 'border-emerald-300 text-zinc-800 dark:border-emerald-800 dark:text-zinc-100'
                    : 'border-zinc-200 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200'
              }`}
            >
              {toast.type === 'error' ? (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              ) : toast.type === 'success' ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
              )}
              <span className="flex-1 leading-relaxed">{toast.message}</span>
              <button
                type="button"
                onClick={() =>
                  setToasts((prev) => prev.filter((t) => t.id !== toast.id))
                }
                aria-label="Tutup notifikasi"
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {confirmDialogConfig && (
        <ConfirmDialog
          open={Boolean(confirmAction)}
          title={confirmDialogConfig.title}
          description={confirmDialogConfig.description}
          confirmLabel={confirmDialogConfig.confirmLabel}
          onConfirm={handleExecuteConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}
