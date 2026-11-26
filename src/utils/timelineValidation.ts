import {
  AudioSegment,
  StoryboardProject,
  TimelineValidationIssue,
} from '../types/storyboard';

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function getRecommendedMaxWords(durationSeconds: number): number {
  // For an 8s scene, ~10-15 words total across dialogue; per segment scales proportionally
  return Math.max(3, Math.round((durationSeconds / 8) * 14));
}

export function validateAudioTimeline(
  segments: AudioSegment[],
  sceneDuration: number,
  allowOverlap: boolean
): TimelineValidationIssue[] {
  const issues: TimelineValidationIssue[] = [];

  if (segments.length === 0) {
    return issues;
  }

  const sorted = [...segments].sort((a, b) => a.startTime - b.startTime);
  let totalSpeechWords = 0;

  for (let i = 0; i < sorted.length; i++) {
    const seg = sorted[i];
    if (seg.startTime < 0) {
      issues.push({
        segmentId: seg.id,
        severity: 'error',
        message: `Segmen "${seg.speakerName}" memiliki waktu mulai negatif (${seg.startTime}s).`,
      });
    }
    if (seg.endTime <= seg.startTime) {
      issues.push({
        segmentId: seg.id,
        severity: 'error',
        message: `Segmen "${seg.speakerName}" memiliki waktu selesai (${seg.endTime}s) <= waktu mulai (${seg.startTime}s).`,
      });
    }
    if (seg.endTime > sceneDuration) {
      issues.push({
        segmentId: seg.id,
        severity: 'error',
        message: `Segmen "${seg.speakerName}" (${seg.startTime}–${seg.endTime}s) melebihi durasi scene (${sceneDuration}s).`,
      });
    }

    if (!allowOverlap && i > 0) {
      const prev = sorted[i - 1];
      if (seg.startTime < prev.endTime) {
        issues.push({
          segmentId: seg.id,
          severity: 'error',
          message: `Segmen "${prev.speakerName}" (${prev.startTime}–${prev.endTime}s) bertabrakan dengan "${seg.speakerName}" (${seg.startTime}–${seg.endTime}s).`,
        });
      }
    }

    if (seg.audioType !== 'SFX / Ambience') {
      const words = countWords(seg.text);
      totalSpeechWords += words;
      const segDuration = Math.max(0.5, seg.endTime - seg.startTime);
      // Natural child/narrator speech ~ 2.2 words/sec max without rushing
      const segWordBudget = Math.max(3, Math.ceil(segDuration * 2.4));
      if (words > segWordBudget) {
        issues.push({
          segmentId: seg.id,
          severity: 'warning',
          message: `Dialog "${seg.speakerName}" (${words} kata dalam ${segDuration.toFixed(1)}s) berisiko terpotong. Disarankan maks. ${segWordBudget} kata agar pengucapan natural.`,
        });
      }
    }
  }

  const sceneWordLimit = Math.max(8, Math.round((sceneDuration / 8) * 15));
  if (totalSpeechWords > sceneWordLimit) {
    issues.push({
      severity: 'warning',
      message: `Total dialog/narasi scene ini ${totalSpeechWords} kata untuk durasi ${sceneDuration} detik (batas nyaman ~${sceneWordLimit} kata). Pertimbangkan untuk mempersingkat kalimat.`,
    });
  }

  return issues;
}

export function scaleTimelineToDuration(
  template: AudioSegment[],
  targetDuration: number
): AudioSegment[] {
  if (template.length === 0) return [];
  const maxEnd = Math.max(...template.map((s) => s.endTime), 8);
  const ratio = targetDuration / maxEnd;
  return template.map((seg) => ({
    ...seg,
    startTime: Number((seg.startTime * ratio).toFixed(1)),
    endTime: Number(Math.min(targetDuration, seg.endTime * ratio).toFixed(1)),
  }));
}
