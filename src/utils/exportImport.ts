import { StoryboardProject } from '../types/storyboard';
import {
  buildBackgroundDnaBlock,
  buildCharacterDnaBlock,
} from '../utils/promptEngine';
import { hydrateProjectState } from '../utils/projectSync';

export function buildProjectJsonExport(project: StoryboardProject): string {
  const payload = {
    projectMetadata: project.metadata,
    productionSettings: project.production,
    dnaLocks: {
      globalCharacterDnaLock: project.globalCharacterDnaLock,
      globalBackgroundDnaLock: project.globalBackgroundDnaLock,
    },
    characters: project.characters,
    backgrounds: project.backgrounds,
    audioSettings: project.audioSettings,
    voiceProfiles: project.voiceProfiles,
    defaultTimelineTemplate: project.defaultTimelineTemplate,
    storyOutline: project.story,
    scenes: project.scenes,
    exportSettings: project.exportSettings,
    dependencyState: project.dependencyState,
  };
  return JSON.stringify(payload, null, 2);
}

export function validateAndParseProjectJson(rawText: string): {
  ok: true;
  project: StoryboardProject;
} | {
  ok: false;
  error: string;
} {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return {
      ok: false,
      error: 'File bukan JSON yang valid. Periksa format sintaks JSON Anda.',
    };
  }

  if (!parsed || typeof parsed !== 'object') {
    return {
      ok: false,
      error: 'Struktur JSON tidak dikenali (harus berupa objek konfigurasi project).',
    };
  }

  const obj = parsed as Record<string, unknown>;

  // Support both structured export wrapper and direct StoryboardProject shape
  const metadata = (obj.projectMetadata ?? obj.metadata) as Record<string, unknown> | undefined;
  const production = (obj.productionSettings ?? obj.production) as Record<string, unknown> | undefined;
  const characters = obj.characters;
  const backgrounds = obj.backgrounds;
  const voiceProfiles = obj.voiceProfiles;
  const story = (obj.storyOutline ?? obj.story) as Record<string, unknown> | undefined;
  const scenes = obj.scenes;

  if (!metadata || typeof metadata !== 'object' || typeof metadata.title !== 'string') {
    return {
      ok: false,
      error: 'Field wajib "projectMetadata.title" tidak ditemukan atau tidak valid.',
    };
  }
  if (
    !production ||
    typeof production !== 'object' ||
    typeof production.episodeTitle !== 'string' ||
    typeof production.sceneCount !== 'number' ||
    typeof production.sceneDuration !== 'number'
  ) {
    return {
      ok: false,
      error:
        'Field wajib "productionSettings" tidak lengkap (episodeTitle, sceneCount, sceneDuration wajib ada).',
    };
  }
  if (!Array.isArray(characters)) {
    return {
      ok: false,
      error: 'Field "characters" harus berupa array karakter.',
    };
  }
  if (!Array.isArray(backgrounds)) {
    return {
      ok: false,
      error: 'Field "backgrounds" harus berupa array background.',
    };
  }
  if (!Array.isArray(voiceProfiles)) {
    return {
      ok: false,
      error: 'Field "voiceProfiles" harus berupa array profil suara.',
    };
  }
  if (!story || typeof story !== 'object' || typeof story.rawStory !== 'string') {
    return {
      ok: false,
      error: 'Field "storyOutline.rawStory" tidak ditemukan atau tidak valid.',
    };
  }
  if (!Array.isArray(scenes)) {
    return {
      ok: false,
      error: 'Field "scenes" harus berupa array scene storyboard.',
    };
  }

  const dnaLocks = (obj.dnaLocks as Record<string, unknown> | undefined) ?? {};

  const reconstructed: StoryboardProject = {
    metadata: metadata as unknown as StoryboardProject['metadata'],
    production: production as unknown as StoryboardProject['production'],
    globalCharacterDnaLock:
      typeof dnaLocks.globalCharacterDnaLock === 'boolean'
        ? dnaLocks.globalCharacterDnaLock
        : typeof obj.globalCharacterDnaLock === 'boolean'
          ? obj.globalCharacterDnaLock
          : true,
    characters: characters as StoryboardProject['characters'],
    globalBackgroundDnaLock:
      typeof dnaLocks.globalBackgroundDnaLock === 'boolean'
        ? dnaLocks.globalBackgroundDnaLock
        : typeof obj.globalBackgroundDnaLock === 'boolean'
          ? obj.globalBackgroundDnaLock
          : true,
    backgrounds: backgrounds as StoryboardProject['backgrounds'],
    audioSettings: (obj.audioSettings ?? {
      audioMode: 'Combine (Dialog + VO)',
      languageSync: true,
      voiceLanguageLock: true,
      narratorGender: 'Perempuan',
      allowOverlapDefault: false,
    }) as StoryboardProject['audioSettings'],
    voiceProfiles: voiceProfiles as StoryboardProject['voiceProfiles'],
    defaultTimelineTemplate: Array.isArray(obj.defaultTimelineTemplate)
      ? (obj.defaultTimelineTemplate as StoryboardProject['defaultTimelineTemplate'])
      : [],
    story: story as unknown as StoryboardProject['story'],
    scenes: scenes as StoryboardProject['scenes'],
    exportSettings: (obj.exportSettings ?? {
      includeNegativePrompts: true,
      includeAudioTimeline: true,
      includeCharacterDnaBlock: true,
      includeBackgroundDnaBlock: true,
    }) as StoryboardProject['exportSettings'],
    dependencyState: obj.dependencyState as StoryboardProject['dependencyState'],
  };

  return { ok: true, project: hydrateProjectState(reconstructed, true) };
}

export function buildProjectTxtExport(project: StoryboardProject): string {
  const lines: string[] = [];
  const p = project.production;

  lines.push('EDUSMART CREATOR LAB');
  lines.push('AI STORYBOARD STUDIO');
  lines.push('============================================================');
  lines.push('');
  lines.push('PROJECT TITLE');
  lines.push(p.episodeTitle || project.metadata.title);
  lines.push(`Project ID: ${project.metadata.projectId} | Status: ${project.metadata.status}`);
  lines.push('');

  lines.push('PRODUCTION CONFIGURATION');
  lines.push('------------------------------------------------------------');
  lines.push(`Judul Episode       : ${p.episodeTitle}`);
  lines.push(
    `Bahasa Naskah/Audio : ${p.scriptLanguage === 'Other' ? p.customScriptLanguage || 'Other' : p.scriptLanguage}`
  );
  lines.push(`Bahasa Prompt       : ${p.promptLanguage}`);
  lines.push(`Bahasa Dialog       : ${p.dialogueLanguage}`);
  lines.push(`Bahasa Narasi       : ${p.narrationLanguage}`);
  lines.push(`Jenis Konten        : ${p.contentType}`);
  lines.push(`Genre Video         : ${p.genre}`);
  if (p.storyCategory) {
    lines.push(`Kategori Cerita     : ${p.storyCategory}`);
  }
  lines.push(
    `Gaya Visual         : ${p.visualStyle === 'Custom Style' ? p.customVisualStyle : p.visualStyle}`
  );
  lines.push(`Jumlah Scene        : ${p.sceneCount}`);
  lines.push(`Durasi per Scene    : ${p.sceneDuration} detik`);
  lines.push(`Aspect Ratio        : ${p.aspectRatio}`);
  lines.push(`Resolusi            : ${p.resolution}`);
  lines.push(`Format Video        : ${p.videoFormat}`);
  lines.push(`Izinkan Teks Layar  : ${p.allowOnScreenText ? 'Ya' : 'Tidak (Dilarang keras)'}`);
  lines.push(`Mode OUTLINE        : ${p.outlineMode ? 'Aktif (White Sticker Outline)' : 'Nonaktif'}`);
  lines.push('');

  lines.push('CHARACTER DNA LOCK & CHARACTER SHEETS');
  lines.push('------------------------------------------------------------');
  lines.push(`Global Character DNA Lock: ${project.globalCharacterDnaLock ? 'AKTIF' : 'NONAKTIF'}`);
  project.characters.forEach((char) => {
    lines.push(
      `• ${char.id} — ${char.name} [${char.isActive ? 'Aktif' : 'Nonaktif'} | DNA Lock: ${char.visualDnaLock ? 'ON' : 'OFF'}${char.storyIdentityLocked ? ' | Story Identity Locked' : ''}]`
    );
    lines.push(
      `  ${buildCharacterDnaBlock(char, p, project.globalCharacterDnaLock || char.visualDnaLock)}`
    );
    if (char.characterSheetPrompt) {
      lines.push(`  [Character Sheet 8-Panel Prompt]:`);
      lines.push(`  ${char.characterSheetPrompt.replace(/\n/g, '\n  ')}`);
    }
  });
  lines.push('');

  lines.push('BACKGROUND DNA LOCK');
  lines.push('------------------------------------------------------------');
  lines.push(`Global Background DNA Lock: ${project.globalBackgroundDnaLock ? 'AKTIF' : 'NONAKTIF'}`);
  project.backgrounds.forEach((bg) => {
    lines.push(`• ${bg.id} — ${bg.name} [DNA Lock: ${bg.dnaLocked ? 'ON' : 'OFF'}]`);
    lines.push(
      `  ${buildBackgroundDnaBlock(bg, p, project.globalBackgroundDnaLock || bg.dnaLocked)}`
    );
  });
  lines.push('');

  lines.push('VOICE DNA');
  lines.push('------------------------------------------------------------');
  lines.push(`Audio Mode          : ${project.audioSettings.audioMode}`);
  lines.push(`Voice Language Lock : ${project.audioSettings.voiceLanguageLock ? 'Aktif' : 'Nonaktif'}`);
  lines.push(`Gender Narator      : ${project.audioSettings.narratorGender}`);
  project.voiceProfiles.forEach((v) => {
    lines.push(`• ${v.id} — ${v.label} (${v.gender}, ${v.ageLabel})`);
    lines.push(`  ${v.prompt}`);
  });
  lines.push('');

  lines.push('STORY OUTLINE');
  lines.push('------------------------------------------------------------');
  lines.push(project.story.rawStory);
  lines.push('');
  lines.push(`- Opening                 : ${project.story.opening}`);
  lines.push(`- Problem / Rasa Penasaran: ${project.story.curiosityProblem}`);
  lines.push(`- Eksplorasi              : ${project.story.exploration}`);
  lines.push(`- Penjelasan Edukasi      : ${project.story.educationalExplanation}`);
  lines.push(`- Closing                 : ${project.story.closing}`);
  lines.push(`- Pesan Moral / Edukasi   : ${project.story.moralMessage}`);
  lines.push('');

  project.scenes.forEach((scene) => {
    const num = String(scene.sceneNumber).padStart(2, '0');
    lines.push(`SCENE ${num} — ${scene.sceneTitle}`);
    lines.push('============================================================');
    lines.push(`Lokasi: ${scene.sceneLocation} | Durasi: ${scene.sceneDuration} detik`);
    lines.push(`Tujuan Edukasi: ${scene.educationalObjective}`);
    lines.push('');
    lines.push('Scene Description');
    lines.push(scene.sceneDescription);
    lines.push('');
    lines.push('First-Frame Keyframe Prompt');
    lines.push(scene.keyframePrompt);
    lines.push('');
    lines.push('Image Prompt');
    lines.push(scene.imagePrompt);
    lines.push('');
    lines.push('Video Prompt');
    lines.push(scene.videoPrompt);
    lines.push('');
    lines.push('Dialogue');
    lines.push(scene.dialogue || '-');
    lines.push('');
    lines.push('Voice Over');
    lines.push(scene.voiceOver || '-');
    lines.push('');
    lines.push('Audio Timeline');
    if (scene.audioTimeline.length === 0) {
      lines.push('-');
    } else {
      scene.audioTimeline.forEach((seg) => {
        lines.push(
          `[${seg.startTime}s–${seg.endTime}s] ${seg.speakerName} (${seg.audioType}): ${seg.text}`
        );
      });
    }
    lines.push(`SFX: ${scene.soundEffects} | Music: ${scene.backgroundMusic}`);
    lines.push('');
    lines.push('Negative Prompt');
    lines.push(scene.negativePrompt);
    lines.push('');
  });

  return lines.join('\n');
}

export function downloadTextFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
