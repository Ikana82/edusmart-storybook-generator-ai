import {
  BackgroundProfile,
  CharacterProfile,
  ProductionSettings,
  PromptLanguage,
  SceneItem,
  StoryboardProject,
  VoiceProfile,
} from '../types/storyboard';

const LABELS: Record<
  PromptLanguage,
  {
    style: string;
    characterDna: string;
    charPosition: string;
    charAction: string;
    expression: string;
    backgroundDna: string;
    lighting: string;
    cameraShot: string;
    composition: string;
    aspectRatio: string;
    resolution: string;
    outlineActive: string;
    outlineInactive: string;
    textForbidden: string;
    textAllowed: string;
    negativePrompt: string;
    duration: string;
    initialFrame: string;
    charAnimation: string;
    charMovement: string;
    facialAnim: string;
    cameraMovement: string;
    envAnimation: string;
    lightingConsistency: string;
    audioInstructions: string;
    dialogueTiming: string;
    lipSync: string;
    voiceDna: string;
    bgConsistency: string;
    visualContinuity: string;
    endingFrame: string;
    keyframePrefix: string;
    noLipSyncVo: string;
    nonSpeakersClosedMouth: string;
  }
> = {
  English: {
    style: 'Visual Style',
    characterDna: 'Locked Character DNA',
    charPosition: 'Character Position',
    charAction: 'Character Action',
    expression: 'Facial Expression',
    backgroundDna: 'Locked Background DNA',
    lighting: 'Lighting',
    cameraShot: 'Camera Shot',
    composition: 'Composition',
    aspectRatio: 'Aspect Ratio',
    resolution: 'Resolution',
    outlineActive:
      'Outline Mode: Crisp, consistent white sticker outline around every character and key background foreground elements, clean die-cut sticker aesthetic while preserving full 3D shading.',
    outlineInactive:
      'Outline Mode: Disabled. Natural seamless edges with zero sticker border or artificial outline.',
    textForbidden:
      'Text & Subtitle Rules: Strictly NO on-screen text, NO captions, NO subtitles, NO watermarks, NO logos, NO floating letters or gibberish typography anywhere in the frame.',
    textAllowed:
      'Text & Subtitle Rules: Clean, readable educational labels or on-screen text permitted only where contextually appropriate; keep watermark-free.',
    negativePrompt: 'Negative Prompt',
    duration: 'Scene Duration',
    initialFrame: 'Initial Frame Description',
    charAnimation: 'Character Animation',
    charMovement: 'Character Body Movement',
    facialAnim: 'Facial Animation',
    cameraMovement: 'Camera Movement',
    envAnimation: 'Environment Animation',
    lightingConsistency: 'Lighting Consistency',
    audioInstructions: 'Audio Instructions',
    dialogueTiming: 'Dialogue & Narration Timing',
    lipSync: 'Lip-Sync Rules',
    voiceDna: 'Voice DNA Lock',
    bgConsistency: 'Background Consistency',
    visualContinuity: 'Visual Continuity',
    endingFrame: 'Ending Frame',
    keyframePrefix:
      'First-Frame Keyframe (Static Opening Moment Before Video Motion Begins)',
    noLipSyncVo:
      'During Voice Over segments, all characters keep mouths closed with natural attentive expressions—zero lip-sync.',
    nonSpeakersClosedMouth:
      'Any character not actively speaking must keep their mouth closed with a natural listening facial expression.',
  },
  'Bahasa Indonesia': {
    style: 'Gaya Visual',
    characterDna: 'DNA Karakter Terkunci',
    charPosition: 'Posisi Karakter',
    charAction: 'Aksi Karakter',
    expression: 'Ekspresi Wajah',
    backgroundDna: 'DNA Background Terkunci',
    lighting: 'Pencahayaan',
    cameraShot: 'Pengambilan Kamera',
    composition: 'Komposisi',
    aspectRatio: 'Aspect Ratio',
    resolution: 'Resolusi',
    outlineActive:
      'Mode OUTLINE: Garis tepi putih bersih bergaya stiker di sekeliling setiap karakter dan elemen latar utama secara konsisten tanpa mengubah detail wajah maupun pakaian.',
    outlineInactive:
      'Mode OUTLINE: Nonaktif. Tepi visual menyatu alami tanpa garis stiker putih.',
    textForbidden:
      'Aturan Teks/Subtitle: DILARANG keras menampilkan teks, caption, subtitle, watermark, logo, atau huruf acak di dalam gambar.',
    textAllowed:
      'Aturan Teks/Subtitle: Teks edukasi atau label singkat yang rapi diperbolehkan bila relevan, tetap bebas watermark.',
    negativePrompt: 'Negative Prompt',
    duration: 'Durasi Scene',
    initialFrame: 'Deskripsi Frame Awal',
    charAnimation: 'Animasi Karakter',
    charMovement: 'Gerakan Tubuh Karakter',
    facialAnim: 'Animasi Ekspresi Wajah',
    cameraMovement: 'Pergerakan Kamera',
    envAnimation: 'Animasi Lingkungan',
    lightingConsistency: 'Konsistensi Pencahayaan',
    audioInstructions: 'Instruksi Audio',
    dialogueTiming: 'Timeline Dialog & Narasi',
    lipSync: 'Aturan Lip-Sync',
    voiceDna: 'Voice DNA Terkunci',
    bgConsistency: 'Konsistensi Latar',
    visualContinuity: 'Kontinuitas Visual',
    endingFrame: 'Frame Penutup',
    keyframePrefix:
      'First-Frame Keyframe (Momen Frame Pertama Sebelum Gerakan Video Dimulai)',
    noLipSyncVo:
      'Selama segmen Voice Over (Narator), semua karakter menutup mulut dengan ekspresi menyimak alami—tanpa lip-sync.',
    nonSpeakersClosedMouth:
      'Karakter yang tidak sedang berbicara wajib menutup mulut dengan ekspresi menyimak natural.',
  },
  'Bahasa Melayu': {
    style: 'Gaya Visual',
    characterDna: 'DNA Watak Terkunci',
    charPosition: 'Kedudukan Watak',
    charAction: 'Aksi Watak',
    expression: 'Ekspresi Wajah',
    backgroundDna: 'DNA Latar Belakang Terkunci',
    lighting: 'Pencahayaan',
    cameraShot: 'Syot Kamera',
    composition: 'Komposisi',
    aspectRatio: 'Nisbah Aspek',
    resolution: 'Resolusi',
    outlineActive:
      'Mod OUTLINE: Garis luar putih gaya pelekat yang konsisten pada watak dan elemen latar.',
    outlineInactive: 'Mod OUTLINE: Tidak aktif. Visual normal tanpa garis pelekat.',
    textForbidden:
      'Peraturan Teks: DILARANG sama sekali teks, sari kata, tera air, atau tulisan rawak pada imej.',
    textAllowed:
      'Peraturan Teks: Teks pendidikan bersih dibenarkan jika perlu, bebas tera air.',
    negativePrompt: 'Negative Prompt',
    duration: 'Tempoh Babak',
    initialFrame: 'Gambaran Bingkai Awal',
    charAnimation: 'Animasi Watak',
    charMovement: 'Pergerakan Badan Watak',
    facialAnim: 'Animasi Wajah',
    cameraMovement: 'Pergerakan Kamera',
    envAnimation: 'Animasi Persekitaran',
    lightingConsistency: 'Konsistensi Pencahayaan',
    audioInstructions: 'Arahan Audio',
    dialogueTiming: 'Masa Dialog & Penceritaan',
    lipSync: 'Peraturan Lip-Sync',
    voiceDna: 'Voice DNA Terkunci',
    bgConsistency: 'Konsistensi Latar',
    visualContinuity: 'Kesinambungan Visual',
    endingFrame: 'Bingkai Penutup',
    keyframePrefix: 'First-Frame Keyframe (Bingkai Pembukaan Sebelum Pergerakan Video)',
    noLipSyncVo:
      'Semasa segmen Voice Over, mulut semua watak kekal tertutup tanpa lip-sync.',
    nonSpeakersClosedMouth:
      'Watak yang tidak bercakap mesti menutup mulut dengan ekspresi semula jadi.',
  },
  Arabic: {
    style: 'Visual Style (Arabic Output Target)',
    characterDna: 'Locked Character DNA',
    charPosition: 'Character Position',
    charAction: 'Character Action',
    expression: 'Facial Expression',
    backgroundDna: 'Locked Background DNA',
    lighting: 'Lighting',
    cameraShot: 'Camera Shot',
    composition: 'Composition',
    aspectRatio: 'Aspect Ratio',
    resolution: 'Resolution',
    outlineActive: 'Outline Mode: Consistent white sticker outline around characters and background.',
    outlineInactive: 'Outline Mode: Disabled.',
    textForbidden: 'Text Rules: Strictly NO text, NO subtitles, NO watermarks.',
    textAllowed: 'Text Rules: Clean educational labels allowed.',
    negativePrompt: 'Negative Prompt',
    duration: 'Scene Duration',
    initialFrame: 'Initial Frame Description',
    charAnimation: 'Character Animation',
    charMovement: 'Character Movement',
    facialAnim: 'Facial Animation',
    cameraMovement: 'Camera Movement',
    envAnimation: 'Environment Animation',
    lightingConsistency: 'Lighting Consistency',
    audioInstructions: 'Audio Instructions',
    dialogueTiming: 'Dialogue Timing',
    lipSync: 'Lip-Sync Instructions',
    voiceDna: 'Voice DNA',
    bgConsistency: 'Background Consistency',
    visualContinuity: 'Visual Continuity',
    endingFrame: 'Ending Frame',
    keyframePrefix: 'First-Frame Keyframe',
    noLipSyncVo: 'During Voice Over, characters keep mouths closed with zero lip-sync.',
    nonSpeakersClosedMouth: 'Non-speaking characters keep mouths closed naturally.',
  },
  Japanese: {
    style: 'Visual Style',
    characterDna: 'Locked Character DNA',
    charPosition: 'Character Position',
    charAction: 'Character Action',
    expression: 'Facial Expression',
    backgroundDna: 'Locked Background DNA',
    lighting: 'Lighting',
    cameraShot: 'Camera Shot',
    composition: 'Composition',
    aspectRatio: 'Aspect Ratio',
    resolution: 'Resolution',
    outlineActive: 'Outline Mode: Consistent white sticker outline around characters and background.',
    outlineInactive: 'Outline Mode: Disabled.',
    textForbidden: 'Text Rules: Strictly NO text, NO subtitles, NO watermarks.',
    textAllowed: 'Text Rules: Clean educational labels allowed.',
    negativePrompt: 'Negative Prompt',
    duration: 'Scene Duration',
    initialFrame: 'Initial Frame Description',
    charAnimation: 'Character Animation',
    charMovement: 'Character Movement',
    facialAnim: 'Facial Animation',
    cameraMovement: 'Camera Movement',
    envAnimation: 'Environment Animation',
    lightingConsistency: 'Lighting Consistency',
    audioInstructions: 'Audio Instructions',
    dialogueTiming: 'Dialogue Timing',
    lipSync: 'Lip-Sync Instructions',
    voiceDna: 'Voice DNA',
    bgConsistency: 'Background Consistency',
    visualContinuity: 'Visual Continuity',
    endingFrame: 'Ending Frame',
    keyframePrefix: 'First-Frame Keyframe',
    noLipSyncVo: 'During Voice Over, characters keep mouths closed with zero lip-sync.',
    nonSpeakersClosedMouth: 'Non-speaking characters keep mouths closed naturally.',
  },
  Korean: {
    style: 'Visual Style',
    characterDna: 'Locked Character DNA',
    charPosition: 'Character Position',
    charAction: 'Character Action',
    expression: 'Facial Expression',
    backgroundDna: 'Locked Background DNA',
    lighting: 'Lighting',
    cameraShot: 'Camera Shot',
    composition: 'Composition',
    aspectRatio: 'Aspect Ratio',
    resolution: 'Resolution',
    outlineActive: 'Outline Mode: Consistent white sticker outline around characters and background.',
    outlineInactive: 'Outline Mode: Disabled.',
    textForbidden: 'Text Rules: Strictly NO text, NO subtitles, NO watermarks.',
    textAllowed: 'Text Rules: Clean educational labels allowed.',
    negativePrompt: 'Negative Prompt',
    duration: 'Scene Duration',
    initialFrame: 'Initial Frame Description',
    charAnimation: 'Character Animation',
    charMovement: 'Character Movement',
    facialAnim: 'Facial Animation',
    cameraMovement: 'Camera Movement',
    envAnimation: 'Environment Animation',
    lightingConsistency: 'Lighting Consistency',
    audioInstructions: 'Audio Instructions',
    dialogueTiming: 'Dialogue Timing',
    lipSync: 'Lip-Sync Instructions',
    voiceDna: 'Voice DNA',
    bgConsistency: 'Background Consistency',
    visualContinuity: 'Visual Continuity',
    endingFrame: 'Ending Frame',
    keyframePrefix: 'First-Frame Keyframe',
    noLipSyncVo: 'During Voice Over, characters keep mouths closed with zero lip-sync.',
    nonSpeakersClosedMouth: 'Non-speaking characters keep mouths closed naturally.',
  },
  Mandarin: {
    style: 'Visual Style',
    characterDna: 'Locked Character DNA',
    charPosition: 'Character Position',
    charAction: 'Character Action',
    expression: 'Facial Expression',
    backgroundDna: 'Locked Background DNA',
    lighting: 'Lighting',
    cameraShot: 'Camera Shot',
    composition: 'Composition',
    aspectRatio: 'Aspect Ratio',
    resolution: 'Resolution',
    outlineActive: 'Outline Mode: Consistent white sticker outline around characters and background.',
    outlineInactive: 'Outline Mode: Disabled.',
    textForbidden: 'Text Rules: Strictly NO text, NO subtitles, NO watermarks.',
    textAllowed: 'Text Rules: Clean educational labels allowed.',
    negativePrompt: 'Negative Prompt',
    duration: 'Scene Duration',
    initialFrame: 'Initial Frame Description',
    charAnimation: 'Character Animation',
    charMovement: 'Character Movement',
    facialAnim: 'Facial Animation',
    cameraMovement: 'Camera Movement',
    envAnimation: 'Environment Animation',
    lightingConsistency: 'Lighting Consistency',
    audioInstructions: 'Audio Instructions',
    dialogueTiming: 'Dialogue Timing',
    lipSync: 'Lip-Sync Instructions',
    voiceDna: 'Voice DNA',
    bgConsistency: 'Background Consistency',
    visualContinuity: 'Visual Continuity',
    endingFrame: 'Ending Frame',
    keyframePrefix: 'First-Frame Keyframe',
    noLipSyncVo: 'During Voice Over, characters keep mouths closed with zero lip-sync.',
    nonSpeakersClosedMouth: 'Non-speaking characters keep mouths closed naturally.',
  },
};

export function resolveVisualStyle(production: ProductionSettings): string {
  return production.visualStyle === 'Custom Style'
    ? production.customVisualStyle.trim() || '3D Pixar / Disney Style Animation'
    : production.visualStyle;
}

export function buildCharacterDnaBlock(
  char: CharacterProfile,
  production: ProductionSettings,
  locked: boolean
): string {
  const style = resolveVisualStyle(production);
  const hairDesc =
    char.hairStyle || char.hairColor
      ? `${char.hairStyle || char.hair} (${char.hairColor || 'natural dark'})`
      : char.hair;
  const parts = [
    `[${char.id}: ${char.name}]`,
    `Age/Role: ${char.age} (${char.gender}, ${char.roleType})`,
    `Identity & Proportions: ${char.physicalDescription}${
      char.bodyProportions ? ` | Body Proportions: ${char.bodyProportions}` : ''
    }`,
    `Face: ${char.faceShape}, Skin tone: ${char.skinTone}, Eyes: ${char.eyes}, Hair: ${hairDesc}`,
    `Default Expression: ${char.expression}`,
    `Clothing (STRICTLY IDENTICAL): ${char.clothing}`,
    `Accessories: ${char.accessories || 'None'}`,
    `Visual Style: ${style}`,
  ];
  if (char.storyIdentityLocked) {
    parts.push(
      `STORY IDENTITY LOCKED: Preserve the canonical character identity, name (${char.name}), and story role strictly.`
    );
  }
  if (locked) {
    parts.push(
      'DNA LOCK ACTIVE: Preserve exact face geometry, hair shape & color, eye color, skin tone, body proportions, clothing colors, and accessories identically without any alteration.'
    );
  }
  return parts.join(' | ');
}

export function buildCharacterSheetPrompt(
  char: CharacterProfile,
  production: ProductionSettings
): string {
  const style = resolveVisualStyle(production);
  const outlineLine = production.outlineMode
    ? 'Outline Mode ACTIVE: Add a crisp, consistent white sticker outline cleanly around each character pose.'
    : 'Outline Mode OFF: Clean natural silhouette without sticker outline.';
  const textRule = production.allowOnScreenText
    ? 'Optional clean tiny panel labels.'
    : 'Strictly NO text, NO labels, NO watermarks, NO letters anywhere.';

  return [
    `Character Reference Turnaround & Expression Sheet for "${char.name}" (${char.id}).`,
    `Visual Style: ${style}, high-craft studio model sheet, crisp balanced lighting, pure neutral white studio background (#FFFFFF).`,
    `Character DNA: ${buildCharacterDnaBlock(char, production, true)}`,
    `Required 8-Panel Layout (arranged cleanly in 2 rows of 4):`,
    `- ROW 1 — TURNAROUND (full body): (1) Front View, (2) 3/4 View, (3) Side Profile View, (4) Back View.`,
    `- ROW 2 — EXPRESSIONS (bust/chest-up): (5) Happy Expression, (6) Sad Expression, (7) Curious Expression, (8) Surprised Expression.`,
    `Consistency Mandate: Strictly preserve identical face identity, hair shape & color (${char.hairStyle || char.hair}${char.hairColor ? `, ${char.hairColor}` : ''}), eye color (${char.eyes}), skin tone (${char.skinTone}), body proportions (${char.bodyProportions || 'consistent'}), outfit (${char.clothing}), and accessories (${char.accessories || 'none'}) across all 8 panels.`,
    outlineLine,
    textRule,
    `Negative Prompt: blurry, mismatched outfit, changing hair length or color, extra limbs, distorted fingers, watermark, text clutter, dark background.`,
  ].join('\n');
}

export function buildBackgroundDnaBlock(
  bg: BackgroundProfile,
  production: ProductionSettings,
  locked: boolean
): string {
  const style = bg.visualStyle || resolveVisualStyle(production);
  const parts = [
    `[${bg.id}: ${bg.name}]`,
    `Setting: ${bg.description}`,
    bg.architecture ? `Architecture: ${bg.architecture}` : '',
    bg.vegetation ? `Vegetation: ${bg.vegetation}` : '',
    `Environment Details: ${bg.environmentDetails}`,
    `Lighting Direction: ${bg.lightingDirection}`,
    `Color Palette: ${bg.colorPalette}`,
    `Camera Perspective: ${bg.cameraPerspective}`,
    `Time & Weather: ${bg.timeOfDay}, ${bg.weather}`,
    `Visual Style: ${style}`,
  ].filter(Boolean);
  if (locked) {
    parts.push(
      'BACKGROUND DNA LOCK: Keep architecture, vegetation, props, color palette, lighting direction, and perspective 100% consistent across all scenes in this location.'
    );
  }
  return parts.join(' | ');
}

export function buildBackgroundPrompt(
  bg: BackgroundProfile,
  production: ProductionSettings
): string {
  const outlineLine = production.outlineMode
    ? 'Mode OUTLINE: Subtle crisp white sticker outline treatment on key midground/foreground environmental props.'
    : 'Normal seamless environment rendering without white outline.';
  const textRule = production.allowOnScreenText
    ? 'Clean educational signage allowed if relevant.'
    : 'Strictly NO text, NO signboards with gibberish, NO subtitles, NO watermarks.';
  return [
    `Environment Background Reference Prompt (${bg.id}: ${bg.name})`,
    buildBackgroundDnaBlock(bg, production, bg.dnaLocked),
    `Aspect Ratio: ${production.aspectRatio} | Resolution: ${production.resolution}`,
    outlineLine,
    textRule,
    `Negative Prompt: characters in frame, distorted perspective, mismatched lighting, blurry background, text, watermark.`,
  ].join('\n');
}

export function buildNegativePrompt(production: ProductionSettings): string {
  const base = [
    'inconsistent character face',
    'changing outfit colors',
    'extra limbs',
    'deformed hands',
    'blurry textures',
    'bad anatomy',
    'flickering lighting',
    'cropped head',
  ];
  if (!production.allowOnScreenText) {
    base.push(
      'on-screen text',
      'subtitles',
      'captions',
      'watermark',
      'logo',
      'floating letters',
      'random typography'
    );
  }
  if (!production.outlineMode) {
    base.push('white sticker outline', 'thick cutout border');
  }
  return base.join(', ');
}

export function normalizeCompositionRatio(
  composition: string,
  aspectRatio: ProductionSettings['aspectRatio']
): string {
  const cleaned = (composition || '').trim();
  if (!cleaned) {
    return `Balanced rule-of-thirds framing in ${aspectRatio}, clear eye-level sightlines`;
  }
  if (/\b(16:9|9:16|1:1|4:5|3:4)\b/.test(cleaned)) {
    return cleaned.replace(/\b(16:9|9:16|1:1|4:5|3:4)\b/g, aspectRatio);
  }
  return `${cleaned} (${aspectRatio})`;
}

export function compileScenePrompts(
  scene: SceneItem,
  project: StoryboardProject
): {
  imagePrompt: string;
  videoPrompt: string;
  keyframePrompt: string;
  negativePrompt: string;
  backgroundDnaSnapshot: string;
  locationId: string;
  sceneLocation: string;
  composition: string;
  sceneDuration: number;
} {
  const { production } = project;
  const L = LABELS[production.promptLanguage] || LABELS.English;
  const style = resolveVisualStyle(production);
  const syncedDuration = production.sceneDuration || scene.sceneDuration;
  const syncedComposition = normalizeCompositionRatio(
    scene.composition,
    production.aspectRatio
  );

  // Strict ID resolution from project.characters (never fall back to hardcoded characters)
  const missingCharIds = scene.characterIds.filter(
    (id) => !project.characters.some((c) => c.id === id)
  );
  const sceneChars = scene.characterIds
    .map((id) => project.characters.find((c) => c.id === id))
    .filter((c): c is CharacterProfile => Boolean(c && c.isActive));

  const charDnaStrings =
    missingCharIds.length > 0
      ? [
          `[VALIDATION ERROR: Character ID(s) ${missingCharIds.join(', ')} not found in active project.characters]`,
          ...sceneChars.map((c) =>
            buildCharacterDnaBlock(
              c,
              production,
              project.globalCharacterDnaLock || c.visualDnaLock
            )
          ),
        ]
      : sceneChars.length > 0
        ? sceneChars.map((c) =>
            buildCharacterDnaBlock(
              c,
              production,
              project.globalCharacterDnaLock || c.visualDnaLock
            )
          )
        : ['No active characters assigned to this scene.'];

  // Strict ID resolution from project.backgrounds (never fall back to stale or hardcoded locations)
  const bg = project.backgrounds.find((b) => b.id === scene.backgroundId);
  const bgDnaString = bg
    ? buildBackgroundDnaBlock(
        bg,
        production,
        project.globalBackgroundDnaLock || bg.dnaLocked
      )
    : `[VALIDATION ERROR: Background ID "${scene.backgroundId}" not found in active project.backgrounds]`;
  const resolvedLocationName = bg ? bg.name : scene.sceneLocation || 'Lokasi Tidak Terdaftar';
  const resolvedLocationId = bg ? bg.locationId || bg.id : scene.locationId || scene.backgroundId;
  const resolvedLighting = scene.lighting?.trim() || bg?.lightingDirection || 'Balanced story lighting';

  const negPrompt = scene.negativePrompt.trim() || buildNegativePrompt(production);

  // 14-point Image Prompt Formula
  const imagePrompt = [
    `1. ${L.style}: ${style} (${production.videoFormat}, ${production.genre})`,
    `2. ${L.characterDna}: ${charDnaStrings.join(' || ')}`,
    `3. ${L.charPosition}: ${scene.characterPositions}`,
    `4. ${L.charAction}: ${scene.characterAction}`,
    `5. ${L.expression}: ${scene.facialExpression}`,
    `6. ${L.backgroundDna}: ${bgDnaString}`,
    `7. ${L.lighting}: ${resolvedLighting}`,
    `8. ${L.cameraShot}: ${scene.cameraShot}`,
    `9. ${L.composition}: ${syncedComposition}`,
    `10. ${L.aspectRatio}: ${production.aspectRatio}`,
    `11. ${L.resolution}: ${production.resolution}`,
    `12. ${production.outlineMode ? L.outlineActive : L.outlineInactive}`,
    `13. ${production.allowOnScreenText ? L.textAllowed : L.textForbidden}`,
    `14. ${L.negativePrompt}: ${negPrompt}`,
  ].join('\n');

  // First-Frame Keyframe Prompt
  const keyframePrompt = [
    `[${L.keyframePrefix} — Scene ${String(scene.sceneNumber).padStart(2, '0')}: ${scene.sceneTitle}]`,
    `1. ${L.style}: ${style}`,
    `2. ${L.characterDna}: ${charDnaStrings.join(' || ')}`,
    `3. Initial Pose & Position (Before Motion): ${scene.characterPositions}; ${scene.characterAction} (starting poised moment).`,
    `4. Initial Facial Expression: ${scene.facialExpression}`,
    `5. ${L.backgroundDna}: ${bgDnaString}`,
    `6. ${L.lighting}: ${resolvedLighting}`,
    `7. ${L.cameraShot} & ${L.composition}: ${scene.cameraShot}, ${syncedComposition}`,
    `8. ${L.aspectRatio}: ${production.aspectRatio} | ${L.resolution}: ${production.resolution}`,
    `9. ${production.outlineMode ? L.outlineActive : L.outlineInactive}`,
    `10. ${production.allowOnScreenText ? L.textAllowed : L.textForbidden}`,
    `11. ${L.negativePrompt}: ${negPrompt}`,
  ].join('\n');

  // Audio Timeline & Voice DNA for Video Prompt
  const timelineLines = scene.audioTimeline.map((seg) => {
    const langNote =
      seg.audioType === 'Voice Over'
        ? production.narrationLanguage
        : production.dialogueLanguage;
    return `[${seg.startTime}s–${seg.endTime}s] ${seg.speakerName} (${seg.audioType}, ${langNote}): "${seg.text}"`;
  });

  const isVoiceOverOnly =
    project.audioSettings.audioMode === 'Voice Over (Narator)';
  const isNoDialogueMode =
    project.audioSettings.audioMode === 'Tanpa Dialog / Musik & SFX Saja';

  const lipSyncSegments =
    isVoiceOverOnly || isNoDialogueMode
      ? []
      : scene.audioTimeline.filter((s) => s.audioType === 'Dialog / Lip-sync');
  const voSegments = scene.audioTimeline.filter(
    (s) => s.audioType === 'Voice Over'
  );

  const lipSyncSummary = isNoDialogueMode
    ? 'No spoken dialogue or lip-sync in this scene; characters express emotions visually while background music and SFX play.'
    : isVoiceOverOnly
      ? `${L.noLipSyncVo} Narrator delivers Voice Over smoothly.`
      : [
          lipSyncSegments.length > 0
            ? lipSyncSegments
                .map(
                  (s) =>
                    `${s.speakerName} lip-syncs accurately at ${s.startTime}s–${s.endTime}s in ${production.dialogueLanguage}`
                )
                .join('; ') + '.'
            : 'No character lip-sync in this scene.',
          voSegments.length > 0 ? L.noLipSyncVo : '',
          L.nonSpeakersClosedMouth,
        ]
          .filter(Boolean)
          .join(' ');

  const usedVoiceIds = new Set(scene.audioTimeline.map((s) => s.speakerId));
  const activeVoices: VoiceProfile[] = project.voiceProfiles.filter(
    (v) => usedVoiceIds.has(v.id) || usedVoiceIds.has(v.label)
  );
  const voiceDnaText =
    (activeVoices.length > 0 ? activeVoices : project.voiceProfiles)
      .map((v) => `${v.label}: ${v.prompt}`)
      .join(' || ');

  // 16-point Video Prompt Formula
  const videoPrompt = [
    `1. ${L.duration}: ${syncedDuration} seconds (${production.aspectRatio}, ${production.resolution}, ${style})`,
    `2. ${L.initialFrame}: ${scene.sceneDescription} Starting with ${scene.characterPositions} in ${scene.cameraShot}.`,
    `3. ${L.charAnimation}: ${charDnaStrings.join(' || ')} — smooth child-friendly animated motion.`,
    `4. ${L.charMovement}: ${scene.bodyMovement}`,
    `5. ${L.facialAnim}: ${scene.facialExpression}. ${L.nonSpeakersClosedMouth}`,
    `6. ${L.cameraMovement}: ${scene.cameraMovement}`,
    `7. ${L.envAnimation}: ${scene.environmentAnimation}`,
    `8. ${L.lightingConsistency}: ${resolvedLighting}`,
    `9. ${L.audioInstructions}: Mode=${project.audioSettings.audioMode} | SFX: ${scene.soundEffects} | Music: ${scene.backgroundMusic}`,
    `10. ${L.dialogueTiming}: ${timelineLines.length > 0 ? timelineLines.join(' | ') : 'Ambient SFX & music only.'}`,
    `11. ${L.lipSync}: ${lipSyncSummary}`,
    `12. ${L.voiceDna}: ${voiceDnaText}`,
    `13. ${L.bgConsistency}: ${bgDnaString}`,
    `14. ${L.visualContinuity}: Maintain exact character outfit, proportions, ${production.aspectRatio} framing, and ${production.outlineMode ? 'consistent white sticker outline on characters and foreground elements' : 'clean natural edge continuity'}. ${production.allowOnScreenText ? L.textAllowed : L.textForbidden}`,
    `15. ${L.endingFrame}: Clean expressive hold on ${sceneChars.map((c) => c.name).join(' & ') || 'the scene'} transitioning naturally into the next story beat.`,
    `16. ${L.negativePrompt}: ${negPrompt}`,
  ].join('\n');

  return {
    imagePrompt,
    videoPrompt,
    keyframePrompt,
    negativePrompt: negPrompt,
    backgroundDnaSnapshot: bgDnaString,
    locationId: resolvedLocationId,
    sceneLocation: resolvedLocationName,
    composition: syncedComposition,
    sceneDuration: syncedDuration,
  };
}

export function generateFallbackStory(project: StoryboardProject): {
  rawStory: string;
  opening: string;
  curiosityProblem: string;
  exploration: string;
  educationalExplanation: string;
  closing: string;
  moralMessage: string;
} {
  const activeNames = project.characters
    .filter((c) => c.isActive)
    .map((c) => c.name);
  const names =
    activeNames.length > 0 ? activeNames.join(' dan ') : 'Tokoh utama cerita';
  const locations =
    project.backgrounds.map((b) => b.name).join(', ') || 'latar cerita';
  const title = project.production.episodeTitle || 'Cerita Baru';
  const msg =
    project.production.educationalMessage ||
    'Menumbuhkan nilai kebaikan dan rasa ingin tahu.';

  const opening = `${names} memulai kisah "${title}" di ${project.backgrounds[0]?.name || 'latar pembuka'}.`;
  const curiosityProblem = `Sebuah tantangan dan rasa penasaran muncul yang mendorong ${names} untuk bertindak bijak dan mencari solusi.`;
  const exploration = `Melalui ${project.production.sceneCount} babak perjalanan di ${locations}, ${names} menghadapi peristiwa utama langkah demi langkah.`;
  const educationalExplanation = `Kisah ini menekankan pesan utama: ${msg}`;
  const closing = `${names} menutup perjalanan "${title}" dengan pengalaman bermakna yang membawa pelajaran berharga.`;
  const moralMessage = msg;
  const rawStory = `${opening} ${curiosityProblem} ${exploration} ${educationalExplanation} ${closing}`;

  return {
    rawStory,
    opening,
    curiosityProblem,
    exploration,
    educationalExplanation,
    closing,
    moralMessage,
  };
}

export function generateFallbackScenes(
  project: StoryboardProject,
  onlySceneNumber?: number
): SceneItem[] {
  const count = Math.max(1, Math.min(30, project.production.sceneCount));
  const duration = Math.max(1, Math.min(60, project.production.sceneDuration));
  const activeChars = project.characters.filter((c) => c.isActive);
  const char1 = activeChars[0];
  const char2 = activeChars[1] || activeChars[0];
  const backgrounds = project.backgrounds;
  const lowerTitle = project.production.episodeTitle.toLowerCase();
  const isPhotosynthesis =
    lowerTitle.includes('fotosintesis') &&
    activeChars.length >= 1;

  const c1Name = char1?.name || 'Tokoh Utama';
  const c2Name = char2?.name || 'Tokoh Pendamping';

  const photosynthesisBeats = [
    {
      title: 'Pagi Cerah di Kebun Sekolah',
      desc: `${c1Name} dan ${c2Name} menyiram tanaman bunga matahari di kebun sekolah sambil mengamati daun hijau yang menghadap sinar matahari pagi.`,
      obj: 'Memperkenalkan rasa penasaran anak tentang cara tumbuhan hijau mendapatkan makanan.',
      shot: 'Medium Wide Shot',
      camMove: 'Gentle slow push-in toward the children admiring the sunlit sunflower plants',
      action: `${c1Name} holds a small magnifying glass near a bright green leaf while ${c2Name} tilts a green watering can gently toward the soil`,
      expr: `${c1Name} looks curious and attentive; ${c2Name} smiles enthusiastically`,
      body: `${c1Name} leans gently toward the sunflower leaf; ${c2Name} holds the watering can with both hands`,
      env: 'Golden morning sunbeams warming green leaves, sparkling water drops on petals, gentle garden breeze',
      lighting: backgrounds[0]?.lightingDirection || 'Warm golden morning sunlight filtering softly across lush garden leaves',
      d1: `Wah ${c2Name}, lihat bunga matahari ini menghadap ke cahaya!`,
      d2: `${c1Name}, bagaimana cara tumbuhan membuat makanannya?`,
      vo: `${c1Name} dan ${c2Name} pun memulai petualangan seru mengenal fotosintesis.`,
      sfx: 'Gentle water pouring, cheerful morning garden birds, soft leaf rustle',
      music: 'Playful warm acoustic marimba & strings',
    },
    {
      title: 'Air & Cahaya Masuk ke Daun',
      desc: 'Tetesan air yang disiram meresap lewat akar menuju batang dan daun, sementara sinar matahari hangat menyinari permukaan daun hijau berklorofil.',
      obj: 'Menjelaskan bahan utama fotosintesis: air dari akar, karbon dioksida dari udara, dan energi cahaya matahari.',
      shot: 'Wide Establishing Botanical Shot',
      camMove: 'Smooth upward tilt following glowing sunbeams meeting glistening green leaves',
      action: `${c1Name} and ${c2Name} crouch closely beside broad glossy leaves, observing golden light rays and morning dew`,
      expr: 'Both children show amazed wide-eyed wonder',
      body: `${c1Name} points gently at a glowing dewdrop on a leaf vein; ${c2Name} leans in curiously`,
      env: 'Translucent green leaves glowing in backlit sunbeams, glistening water droplets, floating golden light motes',
      lighting: backgrounds[1]?.lightingDirection || 'Bright warm golden sunbeams highlighting vibrant green chlorophyll leaf textures',
      d1: 'Lihat! Cahaya matahari dan air bertemu di daun hijau!',
      d2: 'Udara di sekitar daun juga ikut membantu, ya!',
      vo: 'Daun berklorofil menangkap cahaya matahari untuk mengolah air dan karbon dioksida.',
      sfx: 'Soft shimmering sunlight chime, gentle morning breeze',
      music: 'Uplifting curious orchestral woodwinds',
    },
    {
      title: 'Dapur Hijau di Dalam Daun',
      desc: 'Di dalam daun hijau yang diterangi sinar matahari, proses fotosintesis menghasilkan energi makanan bagi tumbuhan dan melepaskan gelembung udara segar.',
      obj: 'Menjelaskan proses fotosintesis menghasilkan glukosa (energi tumbuh) dan oksigen.',
      shot: 'Medium Two-Shot',
      camMove: 'Smooth lateral pan following gentle glowing sparkles rising off sunlit leaves',
      action: `${c1Name} inspects the sunlit leaf closely with her magnifying glass while ${c2Name} watches tiny bright sparkles floating upward into the air`,
      expr: 'Thoughtful wonder turning into cheerful realization',
      body: `${c2Name} traces a gentle upward spiral with his finger; ${c1Name} nods excitedly`,
      env: 'Healthy blooming buds opening slightly, subtle shimmering golden-green sparkles rising gently from leaves',
      lighting: backgrounds[1]?.lightingDirection || 'Crisp radiant daylight with luminous warm rim light around the leaves',
      d1: 'Daun ternyata seperti dapur kecil pembuat energi!',
      d2: 'Dan tumbuhan melepaskan oksigen segar untuk kita!',
      vo: 'Lewat fotosintesis, tumbuhan menghasilkan makanan sekaligus oksigen bagi makhluk hidup.',
      sfx: 'Soft airy sparkle chime, gentle rustling leaves',
      music: 'Dreamy celesta and soft flute melody',
    },
    {
      title: 'Bumi Segar Penuh Oksigen',
      desc: 'Tumbuhan tumbuh subur berbunga cerah di bawah pohon rindang, sementara anak-anak menghirup udara segar penuh semangat menjaga tanaman.',
      obj: 'Menyimpulkan manfaat fotosintesis dan mengajak anak merawat tumbuhan di sekitar.',
      shot: 'Wide Crane Shot',
      camMove: 'Gentle pull-back revealing the thriving green school garden and shade tree',
      action: `${c1Name} and ${c2Name} stand happily beneath the grand green tree, breathing fresh air with bright joyful smiles`,
      expr: 'Joyful, refreshed, warm smiles on both characters',
      body: `${c1Name} and ${c2Name} clap softly and wave happily toward the blooming garden`,
      env: 'Thriving green leaves swaying gently, colorful marigold blossoms, crisp glowing morning air',
      lighting: backgrounds[2]?.lightingDirection || 'Warm balanced sunlit daylight through lush green canopy leaves',
      d1: 'Sekarang aku paham! Tumbuhan butuh cahaya, air, dan udara!',
      d2: 'Ayo kita rajin merawat dan menyiram tanaman setiap hari!',
      vo: 'Begitulah keajaiban fotosintesis yang membuat bumi tetap hijau dan segar.',
      sfx: 'Cheerful songbirds, soft breeze, gentle acoustic chime',
      music: 'Warm triumphant educational finale theme',
    },
  ];

  const storyOutlineBeats = [
    project.story.opening,
    project.story.curiosityProblem,
    project.story.exploration,
    project.story.educationalExplanation,
    project.story.closing,
  ].filter((s) => Boolean(s && s.trim()));

  const rawSentences = project.story.rawStory
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const scenes: SceneItem[] = [];
  for (let i = 1; i <= count; i++) {
    if (onlySceneNumber && i !== onlySceneNumber) {
      const existing = project.scenes.find((s) => s.sceneNumber === i);
      if (existing) {
        scenes.push(existing);
        continue;
      }
    }

    const bg =
      backgrounds.length > 0
        ? backgrounds[(i - 1) % backgrounds.length]
        : undefined;
    const outlineSnippet =
      storyOutlineBeats.length > 0
        ? storyOutlineBeats[(i - 1) % storyOutlineBeats.length]
        : rawSentences.length > 0
          ? rawSentences[(i - 1) % rawSentences.length]
          : '';

    const beat = isPhotosynthesis
      ? photosynthesisBeats[(i - 1) % photosynthesisBeats.length]
      : {
          title:
            i === 1
              ? `Pembukaan: ${project.production.episodeTitle}`
              : i === count
                ? `Penutup: ${bg?.name || project.production.episodeTitle}`
                : `Babak ${i}: ${bg?.name || project.production.episodeTitle}`,
          desc:
            outlineSnippet ||
            `${activeChars.map((c) => c.name).join(' dan ') || 'Tokoh cerita'} berada di ${bg?.name || 'latar cerita'} untuk melanjutkan kisah "${project.production.episodeTitle}".`,
          obj: `Menyampaikan bagian ke-${i} dari "${project.production.episodeTitle}": ${project.production.educationalMessage || project.story.moralMessage || 'nilai utama cerita'}`,
          shot:
            i === 1
              ? 'Wide Establishing Shot'
              : i === count
                ? 'Medium Wide Closing Shot'
                : 'Medium Two-Shot',
          camMove: i % 2 === 0 ? 'Smooth gentle push-in' : 'Subtle horizontal pan',
          action:
            activeChars.length >= 2
              ? `${char1.name} dan ${char2.name} berinteraksi di ${bg?.name || 'latar adegan'}: ${outlineSnippet || project.production.episodeTitle}`
              : `${c1Name} beraksi di ${bg?.name || 'latar adegan'}: ${outlineSnippet || project.production.episodeTitle}`,
          expr: 'Ekspresif, alami, dan sesuai emosi adegan cerita',
          body: 'Gestur tubuh ekspresif mengarah ke fokus kejadian dengan postur seimbang',
          env: `Gerak alami lingkungan di ${bg?.name || 'latar cerita'} (${bg?.weather || 'cerah'})`,
          lighting: bg?.lightingDirection || 'Balanced story-authentic lighting',
          d1:
            i === 1
              ? `Lihat ${activeChars.length >= 2 ? c2Name : 'ke sana'}, kisah kita dimulai!`
              : i === count
                ? `Akhirnya semuanya terjawab dengan baik!`
                : `Ayo kita hadapi tantangan di hadapan kita!`,
          d2:
            i === 1
              ? `Mari kita jalani bersama dengan tenang!`
              : i === count
                ? `Sungguh pelajaran berharga untuk kita semua!`
                : `Tetap waspada dan perhatikan sekitar!`,
          vo:
            outlineSnippet ||
            `Pada babak ke-${i}, ${activeChars.map((c) => c.name).join(' dan ') || 'para tokoh'} melanjutkan kisah di ${bg?.name || 'lokasi cerita'}.`,
          sfx: 'Soft ambient environment & gentle Foley',
          music: 'Expressive cinematic storybook score',
        };

    const segDuration1 = Number(((3 / 8) * duration).toFixed(1));
    const segDuration2 = Number(((5 / 8) * duration).toFixed(1));
    const audioMode = project.audioSettings.audioMode;

    const timeline =
      audioMode === 'Voice Over (Narator)'
        ? [
            {
              id: `seg-${i}-vo`,
              startTime: 0,
              endTime: duration,
              speakerId: project.voiceProfiles[2]?.id || 'VOICE-03',
              speakerName: 'Narator',
              audioType: 'Voice Over' as const,
              text: beat.vo,
            },
          ]
        : audioMode === 'Tanpa Dialog / Musik & SFX Saja'
          ? [
              {
                id: `seg-${i}-sfx`,
                startTime: 0,
                endTime: duration,
                speakerId: 'SFX',
                speakerName: 'Ambient & SFX',
                audioType: 'SFX / Ambience' as const,
                text: `${beat.sfx} · ${beat.music}`,
              },
            ]
          : audioMode === 'Dialog Karakter'
            ? [
                {
                  id: `seg-${i}-1`,
                  startTime: 0,
                  endTime: Number((duration / 2).toFixed(1)),
                  speakerId: char1?.voiceDnaId || project.voiceProfiles[0]?.id || 'VOICE-01',
                  speakerName: c1Name,
                  audioType: 'Dialog / Lip-sync' as const,
                  text: beat.d1,
                },
                {
                  id: `seg-${i}-2`,
                  startTime: Number((duration / 2).toFixed(1)),
                  endTime: duration,
                  speakerId: char2?.voiceDnaId || project.voiceProfiles[1]?.id || 'VOICE-02',
                  speakerName: c2Name,
                  audioType: 'Dialog / Lip-sync' as const,
                  text: beat.d2,
                },
              ]
            : [
                {
                  id: `seg-${i}-1`,
                  startTime: 0,
                  endTime: segDuration1,
                  speakerId: char1?.voiceDnaId || project.voiceProfiles[0]?.id || 'VOICE-01',
                  speakerName: c1Name,
                  audioType: 'Dialog / Lip-sync' as const,
                  text: beat.d1,
                },
                {
                  id: `seg-${i}-2`,
                  startTime: segDuration1,
                  endTime: segDuration2,
                  speakerId: char2?.voiceDnaId || project.voiceProfiles[1]?.id || 'VOICE-02',
                  speakerName: c2Name,
                  audioType: 'Dialog / Lip-sync' as const,
                  text: beat.d2,
                },
                {
                  id: `seg-${i}-3`,
                  startTime: segDuration2,
                  endTime: duration,
                  speakerId: project.voiceProfiles[2]?.id || 'VOICE-03',
                  speakerName: 'Narator',
                  audioType: 'Voice Over' as const,
                  text: beat.vo,
                },
              ];

    const draftScene: SceneItem = {
      id: `scene-${i}`,
      sceneNumber: i,
      sceneTitle:
        count > 4 && isPhotosynthesis && i > 4
          ? `${beat.title} (Bagian ${i})`
          : beat.title,
      sceneDuration: duration,
      backgroundId: bg?.id || '',
      locationId: bg?.locationId || bg?.id || '',
      sceneLocation: bg?.name || 'Belum ada lokasi terdaftar',
      characterIds: activeChars.map((c) => c.id),
      characterPositions:
        activeChars.length >= 2
          ? `${activeChars[0].name} on the left foreground, ${activeChars[1].name} positioned naturally on the right foreground`
          : activeChars.length === 1
            ? `${activeChars[0].name} centered comfortably in mid-foreground`
            : 'No active characters assigned',
      sceneDescription: beat.desc,
      educationalObjective: beat.obj,
      cameraShot: beat.shot,
      cameraMovement: beat.camMove,
      composition: `Balanced rule-of-thirds framing in ${project.production.aspectRatio}, clear eye-level sightlines`,
      characterAction: beat.action,
      facialExpression: beat.expr,
      bodyMovement: beat.body,
      environmentAnimation: beat.env,
      lighting: beat.lighting,
      dialogue:
        audioMode === 'Voice Over (Narator)' ||
        audioMode === 'Tanpa Dialog / Musik & SFX Saja'
          ? ''
          : `${c1Name}: "${beat.d1}" | ${c2Name}: "${beat.d2}"`,
      voiceOver:
        audioMode === 'Dialog Karakter' ||
        audioMode === 'Tanpa Dialog / Musik & SFX Saja'
          ? ''
          : beat.vo,
      audioTimeline: timeline,
      allowTimelineOverlap: project.audioSettings.allowOverlapDefault,
      soundEffects: beat.sfx,
      backgroundMusic: beat.music,
      imagePrompt: '',
      videoPrompt: '',
      keyframePrompt: '',
      keyframeImage:
        project.scenes.find((s) => s.sceneNumber === i)?.keyframeImage || null,
      negativePrompt: '',
      compiledVersion: project.metadata.projectVersion || 1,
    };

    const compiled = compileScenePrompts(draftScene, project);
    scenes.push({
      ...draftScene,
      ...compiled,
    });
  }

  return scenes;
}
