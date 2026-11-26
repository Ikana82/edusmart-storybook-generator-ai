import {
  AudioSettings,
  BackgroundProfile,
  CharacterProfile,
  PendingStoryChange,
  ProductionSettings,
  SceneItem,
  StepSyncStatus,
  StoryboardProject,
  StoryIdentitySnapshot,
  StoryOutline,
  StudioSectionId,
  VoiceProfile,
  WorkflowDependencyState,
} from '../types/storyboard';
import {
  buildBackgroundPrompt,
  buildCharacterSheetPrompt,
  compileScenePrompts,
  resolveVisualStyle,
} from './promptEngine';
import { detectStoryCategory } from './storyKnowledgeBase';
import { validateAudioTimeline } from './timelineValidation';

export function generateUniqueProjectId(): string {
  const timePart = Date.now().toString(36).toUpperCase().slice(-5);
  const randPart = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `ECL-PRJ-${timePart}${randPart}`;
}

export function extractStorySnapshot(
  production: ProductionSettings
): StoryIdentitySnapshot {
  return {
    episodeTitle: production.episodeTitle.trim(),
    genre: production.genre,
    storyCategory: detectStoryCategory(production),
    contentType: production.contentType,
  };
}

export function computeStoryIdentitySignature(
  production: ProductionSettings
): string {
  const snap = extractStorySnapshot(production);
  return [
    snap.episodeTitle.toLowerCase(),
    snap.genre,
    snap.storyCategory,
    snap.contentType,
  ].join('|');
}

export function computeProductionParamSignature(
  production: ProductionSettings
): string {
  return [
    resolveVisualStyle(production),
    production.aspectRatio,
    production.resolution,
    production.videoFormat,
    String(production.outlineMode),
    String(production.allowOnScreenText),
    production.promptLanguage,
    production.dialogueLanguage,
    production.narrationLanguage,
    String(production.sceneCount),
    String(production.sceneDuration),
  ].join('|');
}

export function computeStoryOutlineSignature(story: StoryOutline): string {
  return [
    story.rawStory.trim(),
    story.opening.trim(),
    story.curiosityProblem.trim(),
    story.exploration.trim(),
    story.educationalExplanation.trim(),
    story.closing.trim(),
    story.moralMessage.trim(),
  ].join('||');
}

export function computeCastSignature(
  characters: CharacterProfile[],
  globalCharacterDnaLock: boolean
): string {
  return [
    String(globalCharacterDnaLock),
    ...characters.map((c) =>
      [
        c.id,
        c.name,
        c.roleType,
        c.age,
        c.gender,
        c.physicalDescription,
        c.faceShape,
        c.skinTone,
        c.hair,
        c.hairStyle || '',
        c.hairColor || '',
        c.eyes,
        c.bodyProportions || '',
        c.expression,
        c.clothing,
        c.accessories,
        c.voiceDnaId,
        String(c.visualDnaLock),
        String(Boolean(c.storyIdentityLocked)),
        String(c.isActive),
      ].join(':')
    ),
  ].join('||');
}

export function computeBackgroundSignature(
  backgrounds: BackgroundProfile[],
  globalBackgroundDnaLock: boolean
): string {
  return [
    String(globalBackgroundDnaLock),
    ...backgrounds.map((b) =>
      [
        b.id,
        b.locationId || b.id,
        b.name,
        b.description,
        b.architecture || '',
        b.vegetation || '',
        b.lightingDirection,
        b.colorPalette,
        b.cameraPerspective,
        b.environmentDetails,
        b.timeOfDay,
        b.weather,
        b.visualStyle,
        String(b.dnaLocked),
      ].join(':')
    ),
  ].join('||');
}

export function computeVoiceSignature(
  audioSettings: AudioSettings,
  voiceProfiles: VoiceProfile[]
): string {
  return [
    audioSettings.audioMode,
    String(audioSettings.voiceLanguageLock),
    audioSettings.narratorGender,
    String(audioSettings.allowOverlapDefault),
    ...voiceProfiles.map((v) => `${v.id}:${v.label}:${v.gender}:${v.prompt}`),
  ].join('||');
}

export function computeScenePromptSignature(
  scene: SceneItem,
  project: StoryboardProject
): string {
  const charPart = scene.characterIds
    .map((id) => {
      const c = project.characters.find((ch) => ch.id === id);
      if (!c) return `MISSING:${id}`;
      return `${c.id}:${c.name}:${c.physicalDescription}:${c.clothing}:${c.hairStyle || c.hair}:${c.hairColor || ''}:${c.eyes}:${c.skinTone}:${c.visualDnaLock}:${c.isActive}`;
    })
    .join(';');

  const bg = project.backgrounds.find((b) => b.id === scene.backgroundId);
  const bgPart = bg
    ? `${bg.id}:${bg.locationId || bg.id}:${bg.name}:${bg.description}:${bg.architecture || ''}:${bg.vegetation || ''}:${bg.lightingDirection}:${bg.colorPalette}:${bg.timeOfDay}:${bg.weather}:${bg.dnaLocked}`
    : `MISSING:${scene.backgroundId}`;

  return [
    computeProductionParamSignature(project.production),
    String(project.globalCharacterDnaLock),
    String(project.globalBackgroundDnaLock),
    computeVoiceSignature(project.audioSettings, project.voiceProfiles),
    charPart,
    bgPart,
    scene.sceneTitle,
    String(scene.sceneDuration),
    scene.characterPositions,
    scene.sceneDescription,
    scene.cameraShot,
    scene.cameraMovement,
    scene.composition,
    scene.characterAction,
    scene.facialExpression,
    scene.bodyMovement,
    scene.environmentAnimation,
    scene.lighting,
    scene.dialogue,
    scene.voiceOver,
    scene.soundEffects,
    scene.backgroundMusic,
    scene.negativePrompt,
    JSON.stringify(scene.audioTimeline),
  ].join('##');
}

export function recompileSceneWithMeta(
  scene: SceneItem,
  project: StoryboardProject
): SceneItem {
  const compiled = compileScenePrompts(scene, project);
  const merged: SceneItem = {
    ...scene,
    ...compiled,
    compiledVersion: project.metadata.projectVersion,
  };
  merged.promptSignature = computeScenePromptSignature(merged, project);
  return merged;
}

export function recompileScenesWithMeta(
  project: StoryboardProject,
  onlySceneIds?: Set<string>
): SceneItem[] {
  return project.scenes.map((sc) => {
    if (onlySceneIds && !onlySceneIds.has(sc.id)) {
      return sc;
    }
    return recompileSceneWithMeta(sc, project);
  });
}

export function createInitialStepStatuses(
  project: StoryboardProject
): Record<StudioSectionId, StepSyncStatus> {
  const hasTitle = Boolean(project.production.episodeTitle.trim());
  const hasChars = project.characters.some((c) => c.isActive);
  const hasBgs = project.backgrounds.length > 0;
  const hasStory = Boolean(project.story.rawStory.trim());
  const hasScenes = project.scenes.length > 0;

  return {
    production: hasTitle ? 'Up to Date' : 'Ready',
    characters: hasChars ? 'Up to Date' : 'Ready',
    backgrounds: hasBgs ? 'Up to Date' : 'Ready',
    audio: project.voiceProfiles.length > 0 ? 'Up to Date' : 'Ready',
    story: hasStory ? 'Up to Date' : 'Ready',
    storyboard: hasScenes ? 'Up to Date' : 'Ready',
    keyframes: hasScenes ? 'Up to Date' : 'Ready',
    export: hasScenes ? 'Up to Date' : 'Ready',
  };
}

export function createInitialDependencyState(
  project: StoryboardProject
): WorkflowDependencyState {
  return {
    storyIdentitySignature: computeStoryIdentitySignature(project.production),
    storyOutlineSignature: computeStoryOutlineSignature(project.story),
    castSignature: computeCastSignature(
      project.characters,
      project.globalCharacterDnaLock
    ),
    backgroundSignature: computeBackgroundSignature(
      project.backgrounds,
      project.globalBackgroundDnaLock
    ),
    voiceSignature: computeVoiceSignature(
      project.audioSettings,
      project.voiceProfiles
    ),
    productionParamSignature: computeProductionParamSignature(
      project.production
    ),
    syncedStorySnapshot: extractStorySnapshot(project.production),
    pendingStoryChange: null,
    stepStatuses: createInitialStepStatuses(project),
    outdatedReasons: {},
  };
}

export function hydrateProjectState(
  rawProject: StoryboardProject,
  forceRecompileScenes = false
): StoryboardProject {
  const version =
    typeof rawProject.metadata.projectVersion === 'number' &&
    rawProject.metadata.projectVersion >= 1
      ? rawProject.metadata.projectVersion
      : 1;

  const normalizedBgs = rawProject.backgrounds.map((bg) => ({
    ...bg,
    locationId: bg.locationId || bg.id,
    visualStyle: bg.visualStyle || resolveVisualStyle(rawProject.production),
    generatedPrompt:
      bg.generatedPrompt || buildBackgroundPrompt(bg, rawProject.production),
  }));

  const normalizedChars = rawProject.characters.map((ch) => ({
    ...ch,
    characterSheetPrompt:
      ch.characterSheetPrompt ||
      buildCharacterSheetPrompt(ch, rawProject.production),
  }));

  const draft: StoryboardProject = {
    ...rawProject,
    metadata: {
      ...rawProject.metadata,
      title:
        rawProject.production.episodeTitle.trim() || rawProject.metadata.title,
      projectVersion: version,
    },
    production: {
      ...rawProject.production,
      storyCategory: detectStoryCategory(rawProject.production),
    },
    characters: normalizedChars,
    backgrounds: normalizedBgs,
  };

  draft.scenes = draft.scenes.map((sc) => {
    const shouldCompile =
      forceRecompileScenes || !sc.promptSignature || !sc.imagePrompt;
    if (shouldCompile) {
      return recompileSceneWithMeta(sc, draft);
    }
    return {
      ...sc,
      compiledVersion: sc.compiledVersion ?? version,
    };
  });

  if (!draft.dependencyState) {
    draft.dependencyState = createInitialDependencyState(draft);
  } else {
    draft.dependencyState = {
      ...createInitialDependencyState(draft),
      ...draft.dependencyState,
    };
  }

  return draft;
}

export function detectPendingStoryChange(
  syncedSnapshot: StoryIdentitySnapshot,
  nextProduction: ProductionSettings,
  projectHasExistingContent: boolean
): PendingStoryChange | null {
  if (!projectHasExistingContent) return null;

  const nextSnap = extractStorySnapshot(nextProduction);
  if (!nextSnap.episodeTitle) return null;

  const titleChanged =
    syncedSnapshot.episodeTitle.toLowerCase() !==
    nextSnap.episodeTitle.toLowerCase();
  const genreChanged = syncedSnapshot.genre !== nextSnap.genre;
  const categoryChanged =
    syncedSnapshot.storyCategory !== nextSnap.storyCategory;

  if (!titleChanged && !genreChanged && !categoryChanged) {
    return null;
  }

  const reasons: string[] = [];
  if (titleChanged) {
    reasons.push(
      `Judul berubah dari "${syncedSnapshot.episodeTitle || 'Kosong'}" menjadi "${nextSnap.episodeTitle}"`
    );
  }
  if (genreChanged) {
    reasons.push(`Genre berubah dari ${syncedSnapshot.genre} ke ${nextSnap.genre}`);
  }
  if (categoryChanged) {
    reasons.push(
      `Kategori cerita berubah dari ${syncedSnapshot.storyCategory} ke ${nextSnap.storyCategory}`
    );
  }

  return {
    previous: syncedSnapshot,
    next: nextSnap,
    reason: reasons.join(' · '),
    detectedAt: new Date().toISOString(),
  };
}

export function isScenePromptOutdated(
  scene: SceneItem,
  project: StoryboardProject
): { outdated: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (project.dependencyState?.pendingStoryChange) {
    reasons.push('Identitas cerita berubah dan menunggu sinkronisasi.');
  }

  const statusStoryboard = project.dependencyState?.stepStatuses.storyboard;
  if (statusStoryboard === 'Outdated') {
    reasons.push(
      project.dependencyState?.outdatedReasons.storyboard ||
        'Data induk berubah setelah storyboard dibuat.'
    );
  }

  if (!scene.backgroundId || !project.backgrounds.some((b) => b.id === scene.backgroundId)) {
    reasons.push(`Background ID "${scene.backgroundId || '-'}" tidak ditemukan di project.`);
  }

  const missingChars = scene.characterIds.filter(
    (id) => !project.characters.some((c) => c.id === id && c.isActive)
  );
  if (missingChars.length > 0) {
    reasons.push(
      `Character ID (${missingChars.join(', ')}) tidak ditemukan / tidak aktif.`
    );
  }

  if (scene.sceneDuration !== project.production.sceneDuration) {
    reasons.push(
      `Durasi scene (${scene.sceneDuration}s) berbeda dari konfigurasi (${project.production.sceneDuration}s).`
    );
  }

  if (
    scene.imagePrompt &&
    !scene.imagePrompt.includes(project.production.aspectRatio)
  ) {
    reasons.push(
      `Prompt belum memakai Aspect Ratio ${project.production.aspectRatio}.`
    );
  }

  const expectedSig = computeScenePromptSignature(scene, project);
  if (scene.promptSignature && scene.promptSignature !== expectedSig) {
    reasons.push('Parameter scene atau DNA telah berubah sejak kompilasi terakhir.');
  }

  return {
    outdated: reasons.length > 0,
    reasons,
  };
}

export interface ProjectValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

export function validateProjectForStoryboard(
  project: StoryboardProject
): ProjectValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const p = project.production;

  if (!p.episodeTitle.trim()) {
    errors.push('Project Title (Judul Video / Episode) wajib diisi.');
  }
  if (!p.genre) {
    errors.push('Genre Video wajib dipilih.');
  }
  if (project.dependencyState?.pendingStoryChange) {
    errors.push(
      `Identitas cerita telah berubah (${project.dependencyState.pendingStoryChange.reason}). Klik "Synchronize Project" terlebih dahulu agar karakter, background, dan scene tidak tercampur.`
    );
  }

  const activeChars = project.characters.filter((c) => c.isActive);
  if (activeChars.length === 0) {
    errors.push(
      'Belum ada karakter aktif pada Project State. Jalankan Deteksi Karakter Otomatis atau tambahkan karakter terlebih dahulu.'
    );
  }
  const seenCharIds = new Set<string>();
  for (const ch of project.characters) {
    if (seenCharIds.has(ch.id)) {
      errors.push(`Terdapat duplikasi Character ID "${ch.id}".`);
    }
    seenCharIds.add(ch.id);
    if (ch.isActive && !ch.name.trim()) {
      errors.push(`Karakter ${ch.id} belum memiliki nama.`);
    }
  }

  if (project.backgrounds.length === 0) {
    errors.push(
      'Belum ada lokasi Background pada Project State. Tambahkan atau deteksi lokasi latar terlebih dahulu.'
    );
  }

  if (p.sceneCount < 1 || p.sceneCount > 30 || Number.isNaN(p.sceneCount)) {
    errors.push('Scene Count harus bernilai antara 1 hingga 30.');
  }
  if (p.sceneDuration < 1 || p.sceneDuration > 60 || Number.isNaN(p.sceneDuration)) {
    errors.push('Scene Duration harus bernilai antara 1 hingga 60 detik.');
  }
  if (!['16:9', '9:16', '1:1', '4:5', '3:4'].includes(p.aspectRatio)) {
    errors.push(`Aspect Ratio "${p.aspectRatio}" tidak valid.`);
  }
  if (p.visualStyle === 'Custom Style' && !p.customVisualStyle.trim()) {
    errors.push('Deskripsi Custom Visual Style wajib diisi.');
  }

  if (project.voiceProfiles.length === 0) {
    errors.push('Voice Profiles tidak boleh kosong.');
  }

  if (project.defaultTimelineTemplate.length > 0) {
    const tplIssues = validateAudioTimeline(
      project.defaultTimelineTemplate,
      p.sceneDuration,
      project.audioSettings.allowOverlapDefault
    );
    const tplErrors = tplIssues.filter((i) => i.severity === 'error');
    if (tplErrors.length > 0) {
      errors.push(
        `Default Audio Timeline melebihi durasi atau konflik: ${tplErrors[0].message}`
      );
    }
  }

  if (!project.story.rawStory.trim()) {
    warnings.push(
      'Naskah cerita masih kosong; Storyboard Generator akan menyusun alur berdasarkan judul dan Story Outline.'
    );
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

export function createNewBlankProject(): StoryboardProject {
  const now = new Date().toISOString();
  const projectId = generateUniqueProjectId();

  const production: ProductionSettings = {
    episodeTitle: '',
    scriptLanguage: 'Bahasa Indonesia',
    customScriptLanguage: '',
    promptLanguage: 'English',
    dialogueLanguage: 'Bahasa Indonesia',
    narrationLanguage: 'Bahasa Indonesia',
    contentType: 'Cerita Edukasi Anak',
    genre: 'Edukasi & Petualangan',
    storyCategory: 'Cerita Edukasi',
    visualStyle: '3D Pixar / Disney Style Animation',
    customVisualStyle: '',
    sceneCount: 4,
    sceneDuration: 8,
    aspectRatio: '16:9',
    resolution: '1080p Full HD',
    videoFormat: 'Animation Series',
    allowOnScreenText: false,
    outlineMode: true,
    targetAudience: 'Anak usia 5–10 tahun',
    educationalMessage: '',
  };

  const blank: StoryboardProject = {
    metadata: {
      projectId,
      title: 'Project Baru',
      status: 'Draft',
      createdAt: now,
      updatedAt: now,
      schemaVersion: '1.0.0',
      projectVersion: 1,
    },
    production,
    globalCharacterDnaLock: true,
    characters: [],
    globalBackgroundDnaLock: true,
    backgrounds: [],
    audioSettings: {
      audioMode: 'Combine (Dialog + VO)',
      languageSync: true,
      voiceLanguageLock: true,
      narratorGender: 'Perempuan',
      allowOverlapDefault: false,
    },
    voiceProfiles: [
      {
        id: 'VOICE-01',
        label: 'DNA Suara Tokoh 1',
        roleKey: 'boy',
        gender: 'Laki-laki',
        ageLabel: 'Muda / Anak',
        prompt:
          'Expressive youthful voice, speaking natively in Bahasa Indonesia, clear articulation, warm lively tone, strictly consistent across all scenes.',
      },
      {
        id: 'VOICE-02',
        label: 'DNA Suara Tokoh 2',
        roleKey: 'girl',
        gender: 'Perempuan',
        ageLabel: 'Muda / Anak',
        prompt:
          'Expressive clear female voice, speaking natively in Bahasa Indonesia, warm friendly articulation, natural pitch, strictly consistent across all scenes.',
      },
      {
        id: 'VOICE-03',
        label: 'DNA Narator',
        roleKey: 'narrator',
        gender: 'Perempuan',
        ageLabel: '25 Tahun',
        prompt:
          '25-year-old Indonesian adult female narrator voice, speaking natively in Bahasa Indonesia, warm melodic mezzo-soprano timbre, gentle engaging storytelling tone, crisp studio clarity.',
      },
    ],
    defaultTimelineTemplate: [],
    story: {
      rawStory: '',
      opening: '',
      curiosityProblem: '',
      exploration: '',
      educationalExplanation: '',
      closing: '',
      moralMessage: '',
    },
    scenes: [],
    exportSettings: {
      includeNegativePrompts: true,
      includeAudioTimeline: true,
      includeCharacterDnaBlock: true,
      includeBackgroundDnaBlock: true,
    },
  };

  blank.dependencyState = createInitialDependencyState(blank);
  return blank;
}
