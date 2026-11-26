import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const MODEL_TEXT = 'gemini-4-hydrogen';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.get('/api/ai/status', (_req: Request, res: Response) => {
    const client = getGeminiClient();
    res.json({
      textAiAvailable: Boolean(client),
      imageAiAvailable: false,
      textModel: MODEL_TEXT,
    });
  });

  app.post('/api/ai/story', async (req: Request, res: Response) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        ok: false,
        code: 'NO_API_KEY',
        error:
          'Gemini API key belum tersedia di server. Menggunakan generator cerita berbasis template.',
      });
      return;
    }

    try {
      const { production, characters, backgrounds } = req.body ?? {};
      const activeChars = Array.isArray(characters) && characters.length > 0
        ? characters
            .filter((c: { isActive?: boolean }) => c.isActive)
            .map((c: { name?: string; age?: string; personality?: string }) =>
              `${c.name} (${c.age}, ${c.personality})`
            )
            .join('; ')
        : 'Deteksi tokoh utama yang paling relevan dengan judul dan genre cerita';

      const bgList = Array.isArray(backgrounds) && backgrounds.length > 0
        ? backgrounds.map((b: { name?: string }) => b.name).join(', ')
        : 'Latar lokasi sesuai cerita';

      const prompt = [
        `Buat cerita anak dan outline 6 bagian yang koheren.`,
        `Judul Video: ${production?.episodeTitle || 'Cerita Baru'}`,
        `Target Audiens: ${production?.targetAudience || 'Anak usia 5-10 tahun'}`,
        `Jenis Konten: ${production?.contentType || 'Cerita Edukasi Anak'}`,
        `Genre: ${production?.genre || 'Edukasi & Petualangan'}`,
        `Kategori Cerita: ${production?.storyCategory || 'Cerita Edukasi'}`,
        `Bahasa Naskah: ${production?.scriptLanguage || 'Bahasa Indonesia'}`,
        `Jumlah Scene: ${production?.sceneCount || 4}, Durasi per Scene: ${production?.sceneDuration || 8} detik`,
        `Karakter Aktif (jangan ubah atau ganti tokoh): ${activeChars}`,
        `Lokasi Tersedia: ${bgList}`,
        `Pesan Edukasi: ${production?.educationalMessage || 'Pesan moral ramah anak'}`,
        `Pastikan cerita memiliki alur jelas: Opening, Problem/Rasa Penasaran, Eksplorasi, Penjelasan Edukasi, Closing, dan Pesan Moral.`,
      ].join('\n');

      const response = await ai.models.generateContent({
        model: MODEL_TEXT,
        contents: prompt,
        config: {
          systemInstruction:
            'Anda adalah penulis naskah animasi edukasi anak profesional. Tulis cerita hangat, imajinatif, akurat secara edukasi, dan mudah divisualisasikan per scene.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              rawStory: { type: Type.STRING },
              opening: { type: Type.STRING },
              curiosityProblem: { type: Type.STRING },
              exploration: { type: Type.STRING },
              educationalExplanation: { type: Type.STRING },
              closing: { type: Type.STRING },
              moralMessage: { type: Type.STRING },
            },
            required: [
              'rawStory',
              'opening',
              'curiosityProblem',
              'exploration',
              'educationalExplanation',
              'closing',
              'moralMessage',
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json({ ok: true, story: parsed });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menghubungi Gemini API.';
      res.status(500).json({ ok: false, error: message });
    }
  });

  app.post('/api/ai/storyboard', async (req: Request, res: Response) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        ok: false,
        code: 'NO_API_KEY',
        error:
          'Gemini API key belum tersedia di server. Menggunakan generator storyboard berbasis template.',
      });
      return;
    }

    try {
      const { production, characters, backgrounds, story, audioSettings, voiceProfiles, onlySceneNumber } =
        req.body ?? {};
      const sceneCount = Math.max(1, Math.min(30, Number(production?.sceneCount) || 4));
      const sceneDuration = Math.max(1, Math.min(60, Number(production?.sceneDuration) || 8));
      const targetScenes = onlySceneNumber ? 1 : sceneCount;

      const charSummary = Array.isArray(characters)
        ? characters
            .filter((c: { isActive?: boolean }) => c.isActive)
            .map((c: { id?: string; name?: string; physicalDescription?: string }) =>
              `${c.id} (${c.name}): ${c.physicalDescription}`
            )
            .join('\n')
        : '';

      const bgSummary = Array.isArray(backgrounds)
        ? backgrounds
            .map((b: { id?: string; name?: string; description?: string }) =>
              `${b.id} (${b.name}): ${b.description}`
            )
            .join('\n')
        : '';

      const promptLanguage = production?.promptLanguage || 'English';
      const dialogueLanguage = production?.dialogueLanguage || 'Bahasa Indonesia';
      const narrationLanguage = production?.narrationLanguage || 'Bahasa Indonesia';
      const maxWords = Math.max(8, Math.round((sceneDuration / 8) * 14));

      const aspectRatio = production?.aspectRatio || '16:9';
      const resolution = production?.resolution || '1080p Full HD';
      const visualStyle =
        production?.visualStyle === 'Custom Style'
          ? production?.customVisualStyle || '3D Pixar / Disney Style Animation'
          : production?.visualStyle || '3D Pixar / Disney Style Animation';

      const prompt = [
        onlySceneNumber
          ? `Regenerate tepat 1 scene yaitu Scene ${onlySceneNumber} dari total ${sceneCount} scene.`
          : `Hasilkan tepat ${sceneCount} scene storyboard berurutan (sceneNumber 1 sampai ${sceneCount}).`,
        `Judul Episode: ${production?.episodeTitle || ''}`,
        `Genre & Kategori: ${production?.genre || ''} (${production?.storyCategory || ''})`,
        `Gaya Visual: ${visualStyle} | Aspect Ratio: ${aspectRatio} | Resolusi: ${resolution}`,
        `Durasi per Scene: ${sceneDuration} detik`,
        `Audio Mode: ${audioSettings?.audioMode || 'Combine (Dialog + VO)'}`,
        `Bahasa Deskripsi Visual/Aksi (untuk prompt): ${promptLanguage}`,
        `Bahasa Dialog Karakter: ${dialogueLanguage} (MAKSIMAL ~${maxWords} kata total dialog+narasi per scene agar pas dengan ${sceneDuration} detik!)`,
        `Bahasa Narasi (Voice Over): ${narrationLanguage}`,
        `ATURAN KETAT: Gunakan HANYA karakter dan backgroundId dari daftar project aktif di bawah. Jangan gunakan karakter dari cerita lain. Pastikan field composition menyebut Aspect Ratio ${aspectRatio}.`,
        `Cerita:\n${story?.rawStory || ''}`,
        `Karakter Aktif:\n${charSummary}`,
        `Daftar Background:\n${bgSummary}`,
        `Voice Profiles:\n${JSON.stringify(voiceProfiles ?? [])}`,
        onlySceneNumber
          ? `Kembalikan array berisi tepat 1 objek scene dengan sceneNumber=${onlySceneNumber}.`
          : `Kembalikan array berisi TEPAT ${targetScenes} objek scene.`,
      ].join('\n\n');

      const response = await ai.models.generateContent({
        model: MODEL_TEXT,
        contents: prompt,
        config: {
          systemInstruction:
            'Anda adalah sutradara storyboard animasi edukasi anak. Patuhi jumlah scene secara tepat, buat dialog singkat natural agar tidak terpotong dalam durasi scene, dan pisahkan bahasa prompt visual dengan bahasa dialog/narasi sesuai instruksi.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sceneNumber: { type: Type.INTEGER },
                sceneTitle: { type: Type.STRING },
                backgroundId: { type: Type.STRING },
                characterIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                characterPositions: { type: Type.STRING },
                sceneDescription: { type: Type.STRING },
                educationalObjective: { type: Type.STRING },
                cameraShot: { type: Type.STRING },
                cameraMovement: { type: Type.STRING },
                composition: { type: Type.STRING },
                characterAction: { type: Type.STRING },
                facialExpression: { type: Type.STRING },
                bodyMovement: { type: Type.STRING },
                environmentAnimation: { type: Type.STRING },
                lighting: { type: Type.STRING },
                soundEffects: { type: Type.STRING },
                backgroundMusic: { type: Type.STRING },
                dialogueLine1: { type: Type.STRING },
                dialogueLine2: { type: Type.STRING },
                voiceOverLine: { type: Type.STRING },
              },
              required: [
                'sceneNumber',
                'sceneTitle',
                'backgroundId',
                'characterPositions',
                'sceneDescription',
                'educationalObjective',
                'cameraShot',
                'cameraMovement',
                'characterAction',
                'facialExpression',
                'bodyMovement',
                'environmentAnimation',
                'lighting',
                'soundEffects',
                'backgroundMusic',
                'dialogueLine1',
                'dialogueLine2',
                'voiceOverLine',
              ],
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '[]').trim());
      res.json({ ok: true, scenes: parsed });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal membuat storyboard dengan Gemini API.';
      res.status(500).json({ ok: false, error: message });
    }
  });

  app.post('/api/ai/detect-story-cast', async (req: Request, res: Response) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        ok: false,
        code: 'NO_API_KEY',
        error:
          'Gemini API key belum tersedia di server. Menggunakan database pengetahuan cerita & deteksi lokal.',
      });
      return;
    }

    try {
      const { production, story } = req.body ?? {};
      const episodeTitle = String(production?.episodeTitle || '').trim();
      const genre = String(production?.genre || 'Edukasi & Petualangan');
      const contentType = String(production?.contentType || 'Cerita Edukasi Anak');
      const visualStyle =
        production?.visualStyle === 'Custom Style'
          ? production?.customVisualStyle || '3D Pixar / Disney Style Animation'
          : production?.visualStyle || '3D Pixar / Disney Style Animation';
      const rawStory = String(story?.rawStory || '').trim();

      const prompt = [
        `Analisis judul, genre, jenis konten, dan naskah cerita berikut untuk mendeteksi karakter yang AKURAT dan lokasi latar yang RELEVAN.`,
        `Judul Episode: ${episodeTitle}`,
        `Genre: ${genre}`,
        `Jenis Konten: ${contentType}`,
        `Gaya Visual: ${visualStyle}`,
        `Pesan Edukasi: ${production?.educationalMessage || ''}`,
        rawStory ? `Naskah / Ide Cerita:\n${rawStory}` : 'Belum ada naskah detail.',
        '',
        `ATURAN KETAT:`,
        `1. Klasifikasikan storyCategory ke salah satu dari: "Cerita Rakyat", "Fabel", "Dongeng Original", "Cerita Edukasi", "Cerita Custom".`,
        `2. Jika Cerita Rakyat (mis. Roro Jonggrang, Malin Kundang, Timun Mas, Danau Toba, dll.), WAJIB gunakan tokoh asli cerita rakyat tersebut (mis. Roro Jonggrang, Bandung Bondowoso, Prabu Baka, Para Jin) dan set storyIdentityLocked=true. DILARANG mengganti tokoh dengan karakter default lain.`,
        `3. Jika Fabel, karakter WAJIB berupa tokoh hewan yang sesuai cerita.`,
        `4. Buat Visual DNA lengkap dalam bahasa Inggris untuk setiap karakter (physicalDescription, faceShape, skinTone, hairStyle, hairColor, eyes, bodyProportions, clothing, accessories, expression, personality) dan cocokkan gender/age.`,
        `5. Deteksi 2–4 lokasi latar berbeda yang sesuai alur cerita (mis. Kerajaan Prambanan, Area Pembangunan Candi, Hutan Sekitar) dengan deskripsi lingkungan, architecture, vegetation, lightingDirection, colorPalette, cameraPerspective, timeOfDay, weather.`,
        `6. Jika storyOutline belum lengkap, lengkapi juga rawStory dan 6 bagian storyOutline dalam Bahasa Indonesia (${production?.scriptLanguage || 'Bahasa Indonesia'}).`,
      ].join('\n');

      const response = await ai.models.generateContent({
        model: MODEL_TEXT,
        contents: prompt,
        config: {
          systemInstruction:
            'Anda adalah arsitek cerita animasi anak & pakar cerita rakyat Nusantara. Deteksi karakter dan latar secara akurat sesuai cerita tanpa pernah mengganti tokoh cerita rakyat dengan karakter generik.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              storyCategory: { type: Type.STRING },
              characters: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    roleType: { type: Type.STRING },
                    age: { type: Type.STRING },
                    gender: { type: Type.STRING },
                    physicalDescription: { type: Type.STRING },
                    faceShape: { type: Type.STRING },
                    skinTone: { type: Type.STRING },
                    hairStyle: { type: Type.STRING },
                    hairColor: { type: Type.STRING },
                    eyes: { type: Type.STRING },
                    bodyProportions: { type: Type.STRING },
                    expression: { type: Type.STRING },
                    clothing: { type: Type.STRING },
                    accessories: { type: Type.STRING },
                    personality: { type: Type.STRING },
                    storyIdentityLocked: { type: Type.BOOLEAN },
                  },
                  required: [
                    'name',
                    'roleType',
                    'age',
                    'gender',
                    'physicalDescription',
                    'faceShape',
                    'skinTone',
                    'hairStyle',
                    'hairColor',
                    'eyes',
                    'bodyProportions',
                    'expression',
                    'clothing',
                    'accessories',
                    'personality',
                    'storyIdentityLocked',
                  ],
                },
              },
              backgrounds: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    architecture: { type: Type.STRING },
                    vegetation: { type: Type.STRING },
                    lightingDirection: { type: Type.STRING },
                    colorPalette: { type: Type.STRING },
                    cameraPerspective: { type: Type.STRING },
                    timeOfDay: { type: Type.STRING },
                    weather: { type: Type.STRING },
                  },
                  required: [
                    'name',
                    'description',
                    'architecture',
                    'vegetation',
                    'lightingDirection',
                    'colorPalette',
                    'cameraPerspective',
                    'timeOfDay',
                    'weather',
                  ],
                },
              },
              storyOutline: {
                type: Type.OBJECT,
                properties: {
                  rawStory: { type: Type.STRING },
                  opening: { type: Type.STRING },
                  curiosityProblem: { type: Type.STRING },
                  exploration: { type: Type.STRING },
                  educationalExplanation: { type: Type.STRING },
                  closing: { type: Type.STRING },
                  moralMessage: { type: Type.STRING },
                },
                required: [
                  'rawStory',
                  'opening',
                  'curiosityProblem',
                  'exploration',
                  'educationalExplanation',
                  'closing',
                  'moralMessage',
                ],
              },
            },
            required: ['storyCategory', 'characters', 'backgrounds', 'storyOutline'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json({ ok: true, detection: parsed });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Gagal mendeteksi karakter dan lokasi via Gemini AI.';
      res.status(500).json({ ok: false, error: message });
    }
  });

  app.post('/api/ai/describe-reference', async (req: Request, res: Response) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        ok: false,
        error: 'Gemini API key belum tersedia di server untuk analisis gambar.',
      });
      return;
    }

    try {
      const { imageDataUrl, targetType } = req.body ?? {};
      if (typeof imageDataUrl !== 'string' || !imageDataUrl.startsWith('data:image/')) {
        res.status(400).json({ ok: false, error: 'Format data gambar tidak valid.' });
        return;
      }

      const match = imageDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      if (!match) {
        res.status(400).json({ ok: false, error: 'Base64 gambar tidak dapat dibaca.' });
        return;
      }

      const [, mimeType, base64Data] = match;
      const prompt =
        targetType === 'background'
          ? 'Analyze this background reference image and summarize concisely in English for an animation prompt: setting description, lighting direction, color palette, camera perspective, time of day, weather, and environment details.'
          : 'Analyze this character reference image and summarize concisely in English for an animation character sheet: physical description, face shape, skin tone, hair, eyes, expression, clothing, and accessories.';

      const response = await ai.models.generateContent({
        model: MODEL_TEXT,
        contents: {
          parts: [
            { inlineData: { mimeType, data: base64Data } },
            { text: prompt },
          ],
        },
      });

      res.json({ ok: true, description: response.text ?? '' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menganalisis gambar.';
      res.status(500).json({ ok: false, error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Edusmart Creator Lab server listening on http://localhost:${PORT}`);
  });
}

startServer();
