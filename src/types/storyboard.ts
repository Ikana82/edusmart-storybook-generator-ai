export type ScriptLanguage =
  | 'Bahasa Indonesia'
  | 'English'
  | 'Bahasa Melayu'
  | 'Arabic'
  | 'Japanese'
  | 'Korean'
  | 'Mandarin'
  | 'Other';

export type PromptLanguage =
  | 'English'
  | 'Bahasa Indonesia'
  | 'Bahasa Melayu'
  | 'Arabic'
  | 'Japanese'
  | 'Korean'
  | 'Mandarin';

export type ContentType =
  | 'Cerita Edukasi Anak'
  | 'Storybook Animation'
  | 'Educational Explainer'
  | 'Tutorial'
  | 'Adventure Story'
  | 'Folklore Animation'
  | 'Character Animation'
  | 'Other';

export type VideoGenre =
  | 'Edukasi & Petualangan'
  | 'Fabel'
  | 'Dongeng'
  | 'Cerita Rakyat'
  | 'Komedi Anak'
  | 'Fantasi'
  | 'Sains'
  | 'Sejarah'
  | 'Other';

export type VisualStyle =
  | '3D Pixar / Disney Style Animation'
  | 'Whimsical 3D Storybook'
  | 'Soft 3D Animation'
  | '2D Cartoon'
  | 'Anime'
  | 'Clay Animation'
  | 'Watercolor Storybook'
  | 'Realistic Cinematic'
  | 'Custom Style';

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5' | '3:4';

export type ResolutionOption = '720p HD' | '1080p Full HD' | '2K' | '4K UHD';

export type VideoFormat =
  | 'Animation Series'
  | 'Short Animation'
  | 'Educational Video'
  | 'Storytelling Video'
  | 'Cinematic Video'
  | 'Social Media Video';

export type AudioMode =
  | 'Dialog Karakter'
  | 'Voice Over (Narator)'
  | 'Combine (Dialog + VO)'
  | 'Tanpa Dialog / Musik & SFX Saja'
  | 'Custom';

export type AudioSegmentType = 'Dialog / Lip-sync' | 'Voice Over' | 'SFX / Ambience';

export type StoryCategory =
  | 'Cerita Rakyat'
  | 'Fabel'
  | 'Dongeng Original'
  | 'Cerita Edukasi'
  | 'Cerita Custom';

export type StepSyncStatus =
  | 'Up to Date'
  | 'Needs Review'
  | 'Outdated'
  | 'Ready';

export interface StoryIdentitySnapshot {
  episodeTitle: string;
  genre: VideoGenre;
  storyCategory: StoryCategory;
  contentType: ContentType;
}

export interface PendingStoryChange {
  previous: StoryIdentitySnapshot;
  next: StoryIdentitySnapshot;
  reason: string;
  detectedAt: string;
}

export interface WorkflowDependencyState {
  storyIdentitySignature: string;
  storyOutlineSignature: string;
  castSignature: string;
  backgroundSignature: string;
  voiceSignature: string;
  productionParamSignature: string;
  syncedStorySnapshot: StoryIdentitySnapshot;
  pendingStoryChange: PendingStoryChange | null;
  stepStatuses: Record<StudioSectionId, StepSyncStatus>;
  outdatedReasons: Partial<Record<StudioSectionId, string>>;
}

export interface ProjectMetadata {
  projectId: string;
  title: string;
  status: 'Draft' | 'Siap Produksi' | 'Tersimpan';
  createdAt: string;
  updatedAt: string;
  schemaVersion: string;
  projectVersion: number;
}

export interface ProductionSettings {
  episodeTitle: string;
  scriptLanguage: ScriptLanguage;
  customScriptLanguage: string;
  promptLanguage: PromptLanguage;
  dialogueLanguage: ScriptLanguage;
  narrationLanguage: ScriptLanguage;
  contentType: ContentType;
  genre: VideoGenre;
  storyCategory?: StoryCategory;
  visualStyle: VisualStyle;
  customVisualStyle: string;
  sceneCount: number;
  sceneDuration: number;
  aspectRatio: AspectRatio;
  resolution: ResolutionOption;
  videoFormat: VideoFormat;
  allowOnScreenText: boolean;
  outlineMode: boolean;
  targetAudience: string;
  educationalMessage: string;
}

export interface CharacterProfile {
  id: string;
  name: string;
  roleType: string;
  age: string;
  gender: string;
  physicalDescription: string;
  faceShape: string;
  skinTone: string;
  hair: string;
  hairStyle?: string;
  hairColor?: string;
  eyes: string;
  bodyProportions?: string;
  expression: string;
  clothing: string;
  accessories: string;
  personality: string;
  voiceDnaId: string;
  uploadedReferenceImage: string | null;
  characterSheetImage: string | null;
  characterSheetPrompt: string;
  visualDnaLock: boolean;
  storyIdentityLocked?: boolean;
  isActive: boolean;
}

export interface BackgroundProfile {
  id: string;
  locationId?: string;
  name: string;
  description: string;
  architecture?: string;
  vegetation?: string;
  lightingDirection: string;
  colorPalette: string;
  cameraPerspective: string;
  environmentDetails: string;
  timeOfDay: string;
  weather: string;
  visualStyle: string;
  uploadedReferenceImage: string | null;
  dnaLocked: boolean;
  generatedPrompt: string;
}

export interface VoiceProfile {
  id: string;
  label: string;
  roleKey: 'boy' | 'girl' | 'narrator' | 'custom';
  gender: 'Laki-laki' | 'Perempuan';
  ageLabel: string;
  prompt: string;
}

export interface AudioSettings {
  audioMode: AudioMode;
  languageSync: boolean;
  voiceLanguageLock: boolean;
  narratorGender: 'Laki-laki' | 'Perempuan';
  allowOverlapDefault: boolean;
}

export interface AudioSegment {
  id: string;
  startTime: number;
  endTime: number;
  speakerId: string;
  speakerName: string;
  audioType: AudioSegmentType;
  text: string;
}

export interface StoryOutline {
  rawStory: string;
  opening: string;
  curiosityProblem: string;
  exploration: string;
  educationalExplanation: string;
  closing: string;
  moralMessage: string;
}

export interface SceneItem {
  id: string;
  sceneNumber: number;
  sceneTitle: string;
  sceneDuration: number;
  backgroundId: string;
  locationId?: string;
  backgroundDnaSnapshot?: string;
  sceneLocation: string;
  characterIds: string[];
  characterPositions: string;
  sceneDescription: string;
  educationalObjective: string;
  cameraShot: string;
  cameraMovement: string;
  composition: string;
  characterAction: string;
  facialExpression: string;
  bodyMovement: string;
  environmentAnimation: string;
  lighting: string;
  dialogue: string;
  voiceOver: string;
  audioTimeline: AudioSegment[];
  allowTimelineOverlap: boolean;
  soundEffects: string;
  backgroundMusic: string;
  imagePrompt: string;
  videoPrompt: string;
  keyframePrompt: string;
  keyframeImage: string | null;
  negativePrompt: string;
  compiledVersion?: number;
  promptSignature?: string;
}

export interface ExportSettings {
  includeNegativePrompts: boolean;
  includeAudioTimeline: boolean;
  includeCharacterDnaBlock: boolean;
  includeBackgroundDnaBlock: boolean;
}

export interface StoryboardProject {
  metadata: ProjectMetadata;
  production: ProductionSettings;
  globalCharacterDnaLock: boolean;
  characters: CharacterProfile[];
  globalBackgroundDnaLock: boolean;
  backgrounds: BackgroundProfile[];
  audioSettings: AudioSettings;
  voiceProfiles: VoiceProfile[];
  defaultTimelineTemplate: AudioSegment[];
  story: StoryOutline;
  scenes: SceneItem[];
  exportSettings: ExportSettings;
  dependencyState?: WorkflowDependencyState;
}

export type StudioSectionId =
  | 'production'
  | 'characters'
  | 'backgrounds'
  | 'audio'
  | 'story'
  | 'storyboard'
  | 'keyframes'
  | 'export';

export interface TimelineValidationIssue {
  segmentId?: string;
  severity: 'error' | 'warning';
  message: string;
}
