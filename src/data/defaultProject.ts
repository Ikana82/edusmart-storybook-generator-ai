import {
  BackgroundProfile,
  CharacterProfile,
  ProductionSettings,
  StoryboardProject,
} from '../types/storyboard';
import {
  buildBackgroundPrompt,
  buildCharacterSheetPrompt,
  generateFallbackScenes,
} from '../utils/promptEngine';
import { hydrateProjectState } from '../utils/projectSync';

const INITIAL_PRODUCTION: ProductionSettings = {
  episodeTitle: 'Ika dan Arka Berpetualang Fotosintesis',
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
  educationalMessage:
    'Memahami bagaimana tumbuhan hijau memasak makanannya sendiri dari cahaya matahari, air, dan karbon dioksida melalui proses fotosintesis serta menghasilkan oksigen.',
};

const DEFAULT_CHARACTERS: CharacterProfile[] = [
  {
    id: 'CHAR-01',
    name: 'Ika',
    roleType: 'Protagonis Anak Perempuan',
    age: '8 tahun',
    gender: 'Perempuan',
    physicalDescription:
      'Indonesian girl age 8, neat shoulder-length black hair with a bright sunflower-yellow hairclip, expressive dark brown eyes, warm curious smile, wearing a soft sage-green cardigan over a cream t-shirt, denim overalls, and white sneakers.',
    faceShape: 'Sweet rounded child face with bright attentive features',
    skinTone: 'Warm light-tan Indonesian skin',
    hair: 'Neat shoulder-length straight black hair with sunflower-yellow hairclip',
    eyes: 'Expressive dark brown eyes',
    expression: 'Warm curious cheerful smile',
    clothing:
      'Soft sage-green cardigan over a cream t-shirt, denim overalls, and white sneakers',
    accessories: 'Sunflower-yellow hairclip and small magnifying glass',
    personality: 'Cerdas, penuh rasa ingin tahu, teliti, pecinta alam dan tanaman',
    voiceDnaId: 'VOICE-02',
    uploadedReferenceImage: null,
    characterSheetImage: null,
    characterSheetPrompt: '',
    visualDnaLock: true,
    isActive: true,
  },
  {
    id: 'CHAR-02',
    name: 'Arka',
    roleType: 'Protagonis Anak Laki-Laki',
    age: '8 tahun',
    gender: 'Laki-laki',
    physicalDescription:
      'Indonesian boy age 8, neat short black hair, bright dark brown eyes, cheerful enthusiastic smile, wearing a warm tangerine-orange polo shirt with amber collar trim, olive-green cargo shorts, and white-orange sneakers.',
    faceShape: 'Soft rounded child face with cheerful cheeks',
    skinTone: 'Warm Indonesian tan skin',
    hair: 'Neat short black hair',
    eyes: 'Bright dark brown expressive eyes',
    expression: 'Cheerful enthusiastic smile',
    clothing:
      'Warm tangerine-orange polo shirt with amber collar trim, olive-green cargo shorts, and white-orange sneakers',
    accessories: 'Small green garden watering can',
    personality: 'Energik, ramah, berani berpetualang, suka bereksperimen',
    voiceDnaId: 'VOICE-01',
    uploadedReferenceImage: null,
    characterSheetImage: null,
    characterSheetPrompt: '',
    visualDnaLock: true,
    isActive: true,
  },
];

const DEFAULT_BACKGROUNDS: BackgroundProfile[] = [
  {
    id: 'BG-01',
    locationId: 'BG-01',
    name: 'Kebun Sekolah & Rumah Kaca Hijau',
    description:
      'Lush Indonesian school garden beside a sunny glass greenhouse with potted sunflowers, leafy green vegetable beds, and stone garden pathway.',
    lightingDirection: 'Warm golden morning sunlight streaming across lush leaves and glass panels',
    colorPalette: 'Vibrant emerald green foliage, warm sunflower yellow, soft amber sunlight',
    cameraPerspective: 'Child eye-level wide-angle perspective with clear foreground space',
    environmentDetails:
      'Potted sunflowers, wooden plant labels without text, watering cans, sparkling morning dewdrops on leaves',
    timeOfDay: 'Pagi Cerah',
    weather: 'Cerah Hangat',
    visualStyle: '3D Pixar / Disney Style Animation',
    uploadedReferenceImage: null,
    dnaLocked: true,
    generatedPrompt: '',
  },
  {
    id: 'BG-02',
    locationId: 'BG-02',
    name: 'Taman Daun Hijau & Embun Pagi',
    description:
      'Close-up sunlit botanical garden corner filled with broad glossy green leaves, gentle golden sunbeams, and crystal-clear water droplets along the stems.',
    lightingDirection: 'Backlit golden sunbeams illuminating translucent green leaf veins',
    colorPalette: 'Fresh chlorophyll green, golden amber sun rays, sparkling crystal water',
    cameraPerspective: 'Child eye-level close botanical explorer perspective',
    environmentDetails:
      'Broad tropical leaves, glistening water droplets, soft glowing pollen dust in sunbeams, natural soil bed',
    timeOfDay: 'Pagi Menjelang Siang',
    weather: 'Cerah Berkilau',
    visualStyle: '3D Pixar / Disney Style Animation',
    uploadedReferenceImage: null,
    dnaLocked: true,
    generatedPrompt: '',
  },
  {
    id: 'BG-03',
    locationId: 'BG-03',
    name: 'Bukit Taman Pohon Rindang Segar',
    description:
      'Breezy sunlit park lawn beneath a thriving green shade tree surrounded by blooming flowers and fresh crisp morning air.',
    lightingDirection: 'Warm balanced daylight filtering gently through green canopy leaves',
    colorPalette: 'Lush leaf green, cheerful marigold orange, clear azure morning sky',
    cameraPerspective: 'Balanced wide scenic park perspective with open foreground lawn',
    environmentDetails:
      'Grand shady green tree, blooming marigolds and daisies, gentle floating light sparkles representing fresh oxygen',
    timeOfDay: 'Siang Cerah',
    weather: 'Cerah Segar',
    visualStyle: '3D Pixar / Disney Style Animation',
    uploadedReferenceImage: null,
    dnaLocked: true,
    generatedPrompt: '',
  },
];

export function createDefaultProject(): StoryboardProject {
  const now = new Date().toISOString();

  const characters = DEFAULT_CHARACTERS.map((char) => ({
    ...char,
    characterSheetPrompt: buildCharacterSheetPrompt(char, INITIAL_PRODUCTION),
  }));

  const backgrounds = DEFAULT_BACKGROUNDS.map((bg) => ({
    ...bg,
    generatedPrompt: buildBackgroundPrompt(bg, INITIAL_PRODUCTION),
  }));

  const baseProject: StoryboardProject = {
    metadata: {
      projectId: 'ECL-PRJ-001',
      title: INITIAL_PRODUCTION.episodeTitle,
      status: 'Draft',
      createdAt: now,
      updatedAt: now,
      schemaVersion: '1.0.0',
      projectVersion: 1,
    },
    production: INITIAL_PRODUCTION,
    globalCharacterDnaLock: true,
    characters,
    globalBackgroundDnaLock: true,
    backgrounds,
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
        label: 'DNA Suara Anak Laki-Laki',
        roleKey: 'boy',
        gender: 'Laki-laki',
        ageLabel: '8 Tahun',
        prompt:
          '8-year-old Indonesian boy voice, speaking natively in Bahasa Indonesia, bright youthful mid-high pitch, energetic clear articulation, cheerful curious tone, strictly identical voice timbre across all scenes.',
      },
      {
        id: 'VOICE-02',
        label: 'DNA Suara Anak Perempuan',
        roleKey: 'girl',
        gender: 'Perempuan',
        ageLabel: '8 Tahun',
        prompt:
          '8-year-old Indonesian girl voice, speaking natively in Bahasa Indonesia, sweet expressive clear pitch, lively friendly articulation, natural childlike warmth, strictly identical voice timbre across all scenes.',
      },
      {
        id: 'VOICE-03',
        label: 'DNA Narator 25 Tahun',
        roleKey: 'narrator',
        gender: 'Perempuan',
        ageLabel: '25 Tahun',
        prompt:
          '25-year-old Indonesian adult female narrator voice, speaking natively in Bahasa Indonesia, warm melodic mezzo-soprano timbre, gentle engaging educational storytelling tone, crisp studio clarity, steady natural pace, strictly consistent across all scenes.',
      },
    ],
    defaultTimelineTemplate: [
      {
        id: 'tpl-1',
        startTime: 0,
        endTime: 3,
        speakerId: 'VOICE-02',
        speakerName: 'Ika',
        audioType: 'Dialog / Lip-sync',
        text: 'Wah Arka, lihat bunga matahari ini menghadap ke cahaya!',
      },
      {
        id: 'tpl-2',
        startTime: 3,
        endTime: 5,
        speakerId: 'VOICE-01',
        speakerName: 'Arka',
        audioType: 'Dialog / Lip-sync',
        text: 'Ika, bagaimana cara tumbuhan membuat makanannya?',
      },
      {
        id: 'tpl-3',
        startTime: 5,
        endTime: 8,
        speakerId: 'VOICE-03',
        speakerName: 'Narator',
        audioType: 'Voice Over',
        text: 'Ika dan Arka pun memulai petualangan seru mengenal fotosintesis.',
      },
    ],
    story: {
      rawStory:
        'Ika dan Arka sedang menyiram tanaman di kebun sekolah pada pagi yang cerah. Mereka penasaran mengapa tanaman membutuhkan sinar matahari dan air untuk tumbuh subur, lalu berpetualang menelusuri proses fotosintesis di dalam daun hijau yang menghasilkan energi serta oksigen segar bagi bumi.',
      opening:
        'Ika dan Arka sedang merawat tanaman bunga matahari di kebun sekolah ketika melihat daun-daun hijau berkilau terkena sinar matahari pagi.',
      curiosityProblem:
        'Mereka penasaran bagaimana cara tumbuhan hijau makan padahal tidak punya mulut seperti manusia dan hewan.',
      exploration:
        'Ika dan Arka berpetualang mengamati akar yang menyerap air, daun hijau berklorofil yang menangkap cahaya matahari, serta udara di sekitar daun.',
      educationalExplanation:
        'Di dalam daun berklorofil, tumbuhan menggabungkan air, karbon dioksida, dan energi cahaya matahari untuk membuat glukosa (makanan) serta melepaskan oksigen.',
      closing:
        'Taman menjadi makin segar dan rimbun sementara Ika dan Arka tersenyum gembira merasakan udara pagi yang sejuk.',
      moralMessage:
        'Tumbuhan memberi makanan dan oksigen bagi kehidupan—mari kita rajin menyiram, merawat, dan menanam pohon di sekitar kita.',
    },
    scenes: [],
    exportSettings: {
      includeNegativePrompts: true,
      includeAudioTimeline: true,
      includeCharacterDnaBlock: true,
      includeBackgroundDnaBlock: true,
    },
  };

  baseProject.scenes = generateFallbackScenes(baseProject);
  return hydrateProjectState(baseProject, true);
}
