import {
  BackgroundProfile,
  CharacterProfile,
  ProductionSettings,
  StoryCategory,
  StoryOutline,
  VoiceProfile,
} from '../types/storyboard';

export interface StoryDetectionResult {
  storyCategory: StoryCategory;
  source: 'knowledge-base' | 'heuristic' | 'manual';
  matchedTitle?: string;
  characters: CharacterProfile[];
  backgrounds: BackgroundProfile[];
  voiceProfiles?: VoiceProfile[];
  storyOutline?: StoryOutline;
}

interface FolkloreEntry {
  id: string;
  title: string;
  keywords: string[];
  category: StoryCategory;
  characters: Array<
    Omit<
      CharacterProfile,
      'uploadedReferenceImage' | 'characterSheetImage' | 'characterSheetPrompt'
    >
  >;
  backgrounds: Array<
    Omit<BackgroundProfile, 'uploadedReferenceImage' | 'generatedPrompt'>
  >;
  storyOutline: StoryOutline;
}

const STORY_KNOWLEDGE_BASE: FolkloreEntry[] = [
  {
    id: 'roro-jonggrang',
    title: 'Roro Jonggrang',
    keywords: ['roro jonggrang', 'bandung bondowoso', 'prabu baka', 'seribu candi', 'prambanan'],
    category: 'Cerita Rakyat',
    characters: [
      {
        id: 'CHAR-01',
        name: 'Roro Jonggrang',
        roleType: 'Putri Kerajaan Prambanan (Tokoh Utama)',
        age: '20 tahun',
        gender: 'Perempuan',
        physicalDescription:
          'Graceful Javanese princess age 20, warm golden-tan skin, long flowing dark hair styled in a traditional Javanese royal bun (sanggul) adorned with jasmine flowers and a delicate gold crown, expressive dark brown eyes, wearing an ornate emerald-green and gold Javanese kebaya with batik sarong.',
        faceShape: 'Refined oval Javanese royal face',
        skinTone: 'Warm golden-tan Indonesian skin',
        hair: 'Long black hair in royal Javanese sanggul with jasmine garlands',
        hairStyle: 'Traditional Javanese sanggul bun with jasmine',
        hairColor: 'Jet black',
        eyes: 'Expressive dark brown eyes',
        bodyProportions: 'Graceful slender young adult royal proportions',
        expression: 'Dignified, resolute yet gentle princess expression',
        clothing:
          'Emerald-green velvet Javanese kebaya with gold embroidery and traditional brown-gold batik kain',
        accessories: 'Golden Javanese crown (mahkota), jasmine garlands, gold bracelets',
        personality: 'Cerdas, berani, setia pada rakyat, bijaksana',
        voiceDnaId: 'VOICE-02',
        visualDnaLock: true,
        storyIdentityLocked: true,
        isActive: true,
      },
      {
        id: 'CHAR-02',
        name: 'Bandung Bondowoso',
        roleType: 'Pangeran Pengging (Antagonis / Ksatria Sakti)',
        age: '24 tahun',
        gender: 'Laki-laki',
        physicalDescription:
          'Strong Javanese warrior prince age 24, athletic broad-shouldered build, sharp determined eyebrows, thick dark hair tied under a golden royal headband, wearing crimson-maroon and gold Javanese warrior armor vest over dark silk trousers and batik sash.',
        faceShape: 'Strong chiseled jaw with determined brow',
        skinTone: 'Warm deep-tan Indonesian skin',
        hair: 'Thick shoulder-length dark hair tied neatly under a gold headband',
        hairStyle: 'Tied warrior hair with gold headband',
        hairColor: 'Dark black',
        eyes: 'Intense dark brown eyes',
        bodyProportions: 'Tall athletic muscular warrior proportions',
        expression: 'Determined commanding expression',
        clothing:
          'Crimson-maroon Javanese warrior vest with gold shoulder armor, dark trousers, and golden batik sash',
        accessories: 'Golden royal headband, ornate keris tucked at waist',
        personality: 'Kuat, ambisius, gigih, namun emosional',
        voiceDnaId: 'VOICE-01',
        visualDnaLock: true,
        storyIdentityLocked: true,
        isActive: true,
      },
      {
        id: 'CHAR-03',
        name: 'Prabu Baka',
        roleType: 'Raja Kerajaan Prambanan (Ayah Roro Jonggrang)',
        age: '50 tahun',
        gender: 'Laki-laki',
        physicalDescription:
          'Noble elder Javanese king age 50, dignified beard and mustache, silver-streaked dark hair under a grand golden Javanese crown, wearing deep royal purple and gold ceremonial Javanese robes.',
        faceShape: 'Broad dignified elder face with neat mustache and beard',
        skinTone: 'Warm weathered tan skin',
        hair: 'Silver-streaked dark hair beneath royal crown',
        hairStyle: 'Royal tied hair beneath crown',
        hairColor: 'Dark gray-streaked black',
        eyes: 'Wise deep brown eyes',
        bodyProportions: 'Stately tall elder king proportions',
        expression: 'Wise and protective royal father expression',
        clothing:
          'Royal purple and gold-brocade Javanese king attire with intricate batik dodot',
        accessories: 'Grand gold Javanese crown, royal golden necklace',
        personality: 'Berwibawa, pelindung rakyat, tegas',
        voiceDnaId: 'VOICE-03',
        visualDnaLock: true,
        storyIdentityLocked: true,
        isActive: true,
      },
      {
        id: 'CHAR-04',
        name: 'Para Jin',
        roleType: 'Pasukan Makhluk Halus Pembangun Candi',
        age: 'Abadi',
        gender: 'Laki-laki',
        physicalDescription:
          'Stylized friendly-mythical Javanese spirit builders with glowing amber eyes, smoky teal-violet translucent aura around sturdy stone-carver silhouettes, wearing ancient stone-carved wrist cuffs and mystic waistcloths.',
        faceShape: 'Angular mythical spirit masks/faces with glowing amber eyes',
        skinTone: 'Smoky slate-teal ethereal skin tone',
        hair: 'Wispy smoky dark flame-like hair',
        hairStyle: 'Ethereal smoky crest',
        hairColor: 'Deep indigo-black',
        eyes: 'Glowing warm amber eyes',
        bodyProportions: 'Sturdy magical builder proportions suitable for children animation',
        expression: 'Busy, focused, magical worker expression',
        clothing: 'Ancient stone-carved loincloths and glowing mystical wrist cuffs',
        accessories: 'Mystical stone chisels and faint floating spirit embers',
        personality: 'Cepat, patuh pada perintah malam hari, takut cahaya fajar',
        voiceDnaId: 'VOICE-03',
        visualDnaLock: true,
        storyIdentityLocked: true,
        isActive: true,
      },
    ],
    backgrounds: [
      {
        id: 'BG-01',
        name: 'Kerajaan Prambanan',
        description:
          'Grand ancient Javanese royal palace courtyard with carved andesite stone arches, pendopo wooden pillars, torchlight, and distant volcanic mountains.',
        architecture: 'Ancient Javanese carved andesite stone palace gates and ornate pendopo pavilion',
        vegetation: 'Banyan trees, tropical frangipani trees, manicured palace courtyard shrubs',
        lightingDirection: 'Warm golden afternoon sunlight shifting to glowing palace torchlight',
        colorPalette: 'Warm sandstone gray, royal gold, deep emerald tropical foliage',
        cameraPerspective: 'Wide royal courtyard establishing perspective',
        environmentDetails:
          'Carved stone reliefs, flickering brass oil lamps, stone staircase leading to royal hall',
        timeOfDay: 'Sore Menjelang Senja',
        weather: 'Cerah Hangat',
        visualStyle: '3D Pixar / Disney Style Animation',
        dnaLocked: true,
      },
      {
        id: 'BG-02',
        name: 'Area Pembangunan Seribu Candi',
        description:
          'Dramatic moonlit ancient temple construction grounds filled with towering stepped andesite temples, stacked volcanic stone blocks, and swirling mystical night mist.',
        architecture: 'Towering stepped Hindu-Javanese temple spires under active construction',
        vegetation: 'Sparse wild grass and perimeter tropical silhouettes in night mist',
        lightingDirection: 'Cool silver moonlight contrasted with warm amber mystical builder glow',
        colorPalette: 'Deep indigo night sky, cool silver moonlight, warm amber glow, dark volcanic stone',
        cameraPerspective: 'Epic low-angle perspective emphasizing monumental temple spires',
        environmentDetails:
          'Carved volcanic stone blocks, glowing dust motes, half-finished temple gateways',
        timeOfDay: 'Tengah Malam',
        weather: 'Malam Berkabut Tipis',
        visualStyle: '3D Pixar / Disney Style Animation',
        dnaLocked: true,
      },
      {
        id: 'BG-03',
        name: 'Hutan & Desa Sekitar Prambanan',
        description:
          'Peaceful Javanese village edge beside lush tropical forest at early dawn, with wooden rice mortars (lesung), warm straw fires, and golden sunrise horizon.',
        architecture: 'Traditional Javanese bamboo-and-wood village huts and rice pounding shed',
        vegetation: 'Lush bamboo groves, coconut palms, tropical forest edge',
        lightingDirection: 'Early golden-orange dawn glow breaking above eastern hills',
        colorPalette: 'Soft dawn rose-gold, warm firelight orange, deep forest green',
        cameraPerspective: 'Child-friendly wide village horizon perspective',
        environmentDetails:
          'Wooden lesung rice mortar, glowing morning mist, golden horizon light, crowing roosters',
        timeOfDay: 'Menjelang Fajar',
        weather: 'Pagi Berembun',
        visualStyle: '3D Pixar / Disney Style Animation',
        dnaLocked: true,
      },
    ],
    storyOutline: {
      rawStory:
        'Di Kerajaan Prambanan, Prabu Baka gugur dalam perang melawan Bandung Bondowoso yang sakti. Ketika Bandung Bondowoso meminang Putri Roro Jonggrang, sang putri mengajukan syarat membangun seribu candi dalam satu malam. Dengan bantuan Para Jin, hampir semua candi selesai sebelum fajar. Roro Jonggrang pun cerdik menyalakan api unggun dan menumbuk lesung agar fajar tampak datang lebih cepat sehingga Para Jin pergi sebelum candi keseribu selesai.',
      opening:
        'Di Kerajaan Prambanan yang megah, Putri Roro Jonggrang hidup damai bersama ayahnya, Prabu Baka, hingga pasukan Bandung Bondowoso datang menyerang.',
      curiosityProblem:
        'Setelah Prabu Baka gugur, Bandung Bondowoso ingin meminang Roro Jonggrang, sehingga sang putri mencari cara bijak untuk menolaknya melalui syarat seribu candi dalam semalam.',
      exploration:
        'Pada malam hari di area pembangunan candi, Bandung Bondowoso memanggil Para Jin yang bekerja super cepat menyusun batu-batu candi raksasa.',
      educationalExplanation:
        'Melihat hampir seribu candi hampir rampung, Roro Jonggrang meminta penduduk desa menumbuk lesung dan menyalakan api di timur agar suasana tampak seperti fajar.',
      closing:
        'Para Jin mengira matahari sudah terbit dan langsung menghilang sebelum candi keseribu selesai berdiri, meninggalkan kisah berdirinya Candi Prambanan.',
      moralMessage:
        'Kecerdasan, ketenangan, dan kepedulian terhadap keadilan lebih kuat daripada kesombongan atau paksaan.',
    },
  },
  {
    id: 'malin-kundang',
    title: 'Malin Kundang',
    keywords: ['malin kundang', 'mande rubayah', 'ibu malin'],
    category: 'Cerita Rakyat',
    characters: [
      {
        id: 'CHAR-01',
        name: 'Malin Kundang',
        roleType: 'Pemuda Perantau / Nakhoda Kapal (Tokoh Utama)',
        age: '22 tahun',
        gender: 'Laki-laki',
        physicalDescription:
          'Young Indonesian Minangkabau merchant sailor age 22, neat dark wavy hair, warm tan skin, sharp proud eyes, wearing a rich burgundy-and-gold embroidered sailor captain coat over crisp white tunic and dark trousers.',
        faceShape: 'Sharp confident young adult face',
        skinTone: 'Warm Indonesian tan skin',
        hair: 'Neat dark wavy hair',
        hairStyle: 'Swept-back neat waves',
        hairColor: 'Black',
        eyes: 'Dark brown eyes',
        bodyProportions: 'Tall upright merchant captain proportions',
        expression: 'Proud confident expression',
        clothing:
          'Rich burgundy and gold Minangkabau merchant captain coat, white tunic, dark sailor boots',
        accessories: 'Golden belt buckle and silk sash',
        personality: 'Pekerja keras namun lupa diri setelah kaya',
        voiceDnaId: 'VOICE-01',
        visualDnaLock: true,
        storyIdentityLocked: true,
        isActive: true,
      },
      {
        id: 'CHAR-02',
        name: 'Ibu Malin Kundang',
        roleType: 'Ibu Kandung Malin (Mande Rubayah)',
        age: '52 tahun',
        gender: 'Perempuan',
        physicalDescription:
          'Gentle loving elderly Indonesian Minangkabau mother age 52, kind weathered face with soft smile lines, silver-streaked hair wrapped in a modest traditional cotton head scarf (selendang), wearing a faded earth-brown Minang baju kurung and woven sarong.',
        faceShape: 'Warm gentle weathered elder face',
        skinTone: 'Warm weathered tan skin',
        hair: 'Silver-streaked dark hair beneath modest woven headscarf',
        hairStyle: 'Tied neatly under traditional selendang',
        hairColor: 'Gray-streaked black',
        eyes: 'Warm tearful caring dark eyes',
        bodyProportions: 'Slightly frail gentle elder mother proportions',
        expression: 'Loving, patient, longing maternal expression',
        clothing:
          'Faded earth-brown traditional Minangkabau baju kurung, modest woven cotton sarong, simple sandals',
        accessories: 'Simple woven shoulder shawl (selendang)',
        personality: 'Penuh kasih sayang, sabar, tulus mendoakan anaknya',
        voiceDnaId: 'VOICE-02',
        visualDnaLock: true,
        storyIdentityLocked: true,
        isActive: true,
      },
      {
        id: 'CHAR-03',
        name: 'Istri Malin Kundang',
        roleType: 'Putri Saudagar Kaya (Tokoh Pendukung)',
        age: '20 tahun',
        gender: 'Perempuan',
        physicalDescription:
          'Elegant young noblewoman age 20, fair warm skin, sleek dark hair with ornate golden Minang headpiece ornament, wearing shimmering amber-gold silk baju kurung and songket skirt.',
        faceShape: 'Soft oval noble face',
        skinTone: 'Warm light-tan skin',
        hair: 'Sleek dark hair pinned with gold hairpins',
        hairStyle: 'Neat royal updo',
        hairColor: 'Black',
        eyes: 'Dark almond eyes',
        bodyProportions: 'Graceful young adult proportions',
        expression: 'Surprised, aloof aristocratic expression',
        clothing: 'Amber-gold silk baju kurung and rich songket woven skirt',
        accessories: 'Gold hair ornament and pearl earrings',
        personality: 'Terbiasa hidup mewah dan menjaga gengsi',
        voiceDnaId: 'VOICE-02',
        visualDnaLock: true,
        storyIdentityLocked: true,
        isActive: true,
      },
    ],
    backgrounds: [
      {
        id: 'BG-01',
        name: 'Desa Nelayan Pesisir Minang',
        description:
          'Humble coastal Indonesian Minangkabau fishing village with traditional wooden stilted huts, drying fishing nets, coconut palms, and gentle blue bay waves.',
        architecture: 'Traditional wooden coastal Minangkabau stilted huts with curved roofs',
        vegetation: 'Coconut palm trees, coastal sea grass, tropical shrubs',
        lightingDirection: 'Warm coastal morning sunlight reflecting off shallow sea foam',
        colorPalette: 'Warm sandy beige, weathered wood brown, turquoise bay water',
        cameraPerspective: 'Warm village shoreline perspective',
        environmentDetails: 'Wooden fishing boats, woven baskets, hanging nets, sandy shore',
        timeOfDay: 'Pagi Cerah',
        weather: 'Cerah Berangin',
        visualStyle: '3D Pixar / Disney Style Animation',
        dnaLocked: true,
      },
      {
        id: 'BG-02',
        name: 'Pelabuhan Kapal Dagang Megah',
        description:
          'Bustling wooden harbor pier where a grand wooden three-masted merchant sailing ship anchors beneath golden sunlight.',
        architecture: 'Sturdy timber harbor dock and grand ornate wooden merchant ship deck',
        vegetation: 'Distant coastal palm hills along harbor bay',
        lightingDirection: 'Bright crisp midday sun glinting off sails and sea waves',
        colorPalette: 'Rich mahogany ship wood, crisp cream sails, deep ocean blue, gold trim',
        cameraPerspective: 'Wide pier-level view looking up at the grand merchant ship',
        environmentDetails: 'Cargo crates, coiled ship ropes, billowing canvas sails, wooden gangplank',
        timeOfDay: 'Siang Cerah',
        weather: 'Cerah',
        visualStyle: '3D Pixar / Disney Style Animation',
        dnaLocked: true,
      },
      {
        id: 'BG-03',
        name: 'Pantai Batu Karang Berombak',
        description:
          'Dramatic rocky seashore during sudden storm clouds, crashing ocean waves, and coastal wind sweeping over mossy shoreline rocks.',
        architecture: 'Natural jagged coastal rock formations and distant ship silhouette',
        vegetation: 'Wind-bent coastal palms on distant cliff',
        lightingDirection: 'Dramatic cool stormy twilight with warm lightning sky break',
        colorPalette: 'Stormy slate blue, foaming white waves, wet charcoal coastal rocks',
        cameraPerspective: 'Wide dramatic shoreline perspective',
        environmentDetails: 'Crashing ocean spray, dark storm clouds, swirling sea foam',
        timeOfDay: 'Sore Berawan Badai',
        weather: 'Badai Angin & Hujan',
        visualStyle: '3D Pixar / Disney Style Animation',
        dnaLocked: true,
      },
    ],
    storyOutline: {
      rawStory:
        'Malin Kundang pergi merantau meninggalkan ibunya di desa nelayan demi mengubah nasib. Bertahun-tahun kemudian, ia pulang sebagai saudagar kaya dengan kapal megah dan istri bangsawan. Namun saat ibunya yang tua renta datang memeluk penuh rindu di pelabuhan, Malin malu dan mengusir ibunya. Sang ibu pun berdoa dengan hati terluka hingga badai datang dan mengubah Malin beserta kapalnya menjadi batu di pantai.',
      opening:
        'Di sebuah desa nelayan pesisir Minang, Malin Kundang berpamitan kepada ibunya yang penuh kasih untuk merantau mencari penghidupan yang lebih baik.',
      curiosityProblem:
        'Setelah bertahun-tahun sukses menjadi nakhoda kaya, kapal megah Malin berlabuh kembali di kampung halaman, membuat ibunya berlari penuh harap ke pelabuhan.',
      exploration:
        'Malin yang malu melihat pakaian lusuh ibunya di depan istrinya berpura-pura tidak mengenal dan menolak pelukan sang ibu.',
      educationalExplanation:
        'Kesombongan dan durhaka terhadap orang tua yang membesarkan dengan kasih sayang melukai hati dan membawa penyesalan besar.',
      closing:
        'Setelah ibu berdoa dengan hati pedih, badai besar mengguncang laut hingga Malin membatu di pantai Air Manis sebagai pengingat abadi.',
      moralMessage:
        'Jangan pernah melupakan jasa dan kasih sayang orang tua, setinggi apa pun kesuksesan yang kita raih.',
    },
  },
  {
    id: 'timun-mas',
    title: 'Timun Mas',
    keywords: ['timun mas', 'mbok srini', 'buto ijo'],
    category: 'Cerita Rakyat',
    characters: [
      {
        id: 'CHAR-01',
        name: 'Timun Mas',
        roleType: 'Gadis Pemberani (Tokoh Utama)',
        age: '12 tahun',
        gender: 'Perempuan',
        physicalDescription:
          'Brave bright Indonesian girl age 12, braided black hair with golden ribbon, warm tan skin, bright determined dark eyes, wearing a cheerful saffron-yellow Javanese tunic, patterned brown batik skirt, and carrying a small woven pouch of magical seeds.',
        faceShape: 'Expressive cheerful oval child face',
        skinTone: 'Warm Indonesian tan skin',
        hair: 'Long black hair tied in neat twin braids with golden ribbon',
        hairStyle: 'Twin braids with golden ribbon',
        hairColor: 'Black',
        eyes: 'Bright determined dark brown eyes',
        bodyProportions: 'Agile 12-year-old child proportions',
        expression: 'Brave, resourceful, hopeful expression',
        clothing: 'Saffron-yellow Javanese tunic over brown batik skirt and simple sandals',
        accessories: 'Small woven cloth pouch holding cucumber seeds, needles, salt, and terasi',
        personality: 'Berani, cerdik, penyayang ibu, pantang menyerah',
        voiceDnaId: 'VOICE-02',
        visualDnaLock: true,
        storyIdentityLocked: true,
        isActive: true,
      },
      {
        id: 'CHAR-02',
        name: 'Mbok Srini',
        roleType: 'Ibu Angkat Timun Mas yang Penyayang',
        age: '50 tahun',
        gender: 'Perempuan',
        physicalDescription:
          'Kind Javanese village mother age 50, gentle wrinkled smile, gray-streaked hair tied in a simple low bun, wearing a neat earthy-green Javanese kebaya and classic brown batik jarik.',
        faceShape: 'Warm round loving elder face',
        skinTone: 'Warm tan skin',
        hair: 'Silver-streaked dark hair in simple low bun',
        hairStyle: 'Simple traditional low bun',
        hairColor: 'Dark gray-streaked black',
        eyes: 'Warm caring dark eyes',
        bodyProportions: 'Gentle elder village mother proportions',
        expression: 'Loving protective maternal expression',
        clothing: 'Earthy-green cotton Javanese kebaya and brown batik sarong',
        accessories: 'Woven bamboo basket',
        personality: 'Penuh cinta, sabar, rela berjuang melindungi putrinya',
        voiceDnaId: 'VOICE-03',
        visualDnaLock: true,
        storyIdentityLocked: true,
        isActive: true,
      },
      {
        id: 'CHAR-03',
        name: 'Buto Ijo',
        roleType: 'Raksasa Hijau (Antagonis)',
        age: 'Raksasa Dewasa',
        gender: 'Laki-laki',
        physicalDescription:
          'Large stylized friendly-folklore green giant with emerald-green skin, playful yet fierce bushy eyebrows, tiny upward lower tusks, wild dark curly hair, wearing torn tiger-stripe waistcloth and heavy stone wrist bangles.',
        faceShape: 'Broad oversized giant face with expressive brow and small tusks',
        skinTone: 'Deep emerald-green giant skin',
        hair: 'Wild tousled dark hair',
        hairStyle: 'Wild voluminous curls',
        hairColor: 'Dark charcoal black',
        eyes: 'Bright golden-amber giant eyes',
        bodyProportions: 'Towering bulky giant proportions (3x human height, stylized 3D family-friendly)',
        expression: 'Grumpy booming giant chasing expression',
        clothing: 'Earthy patterned waistcloth, rope belt, stone bangles',
        accessories: 'Heavy wooden giant club or leather belt',
        personality: 'Serakah, pemarah, namun mudah terkecoh oleh kecerdikan',
        voiceDnaId: 'VOICE-01',
        visualDnaLock: true,
        storyIdentityLocked: true,
        isActive: true,
      },
    ],
    backgrounds: [
      {
        id: 'BG-01',
        name: 'Pondok & Ladang Mentimun Mbok Srini',
        description:
          'Cozy Javanese bamboo cottage surrounded by a sunny green cucumber garden with glowing golden cucumber vines beside lush forest hills.',
        architecture: 'Traditional Javanese woven bamboo cottage with clay tile roof',
        vegetation: 'Climbing cucumber vines, golden cucumber fruit, banana trees, forest edge',
        lightingDirection: 'Warm golden morning sunbeams over garden vines',
        colorPalette: 'Vibrant cucumber leaf green, golden yellow fruit, warm bamboo brown',
        cameraPerspective: 'Warm child eye-level garden view',
        environmentDetails: 'Bamboo fence, woven garden baskets, sunny soil rows',
        timeOfDay: 'Pagi Cerah',
        weather: 'Cerah Hangat',
        visualStyle: '3D Pixar / Disney Style Animation',
        dnaLocked: true,
      },
      {
        id: 'BG-02',
        name: 'Hutan Rimba Jalan Pelarian',
        description:
          'Dense sunlit Javanese jungle trail with towering tropical trees, bamboo thickets, and winding forest path.',
        architecture: 'Natural jungle trail framed by giant tree roots and bamboo groves',
        vegetation: 'Dense tall bamboo stalks, jungle ferns, thorny vines',
        lightingDirection: 'Dappled golden light filtering through thick jungle canopy',
        colorPalette: 'Deep forest emerald, warm sunbeam gold, earthy trail brown',
        cameraPerspective: 'Dynamic running path perspective',
        environmentDetails: 'Thick bamboo clusters, scattered leaves, dramatic light rays',
        timeOfDay: 'Siang Hari',
        weather: 'Cerah Teduh',
        visualStyle: '3D Pixar / Disney Style Animation',
        dnaLocked: true,
      },
      {
        id: 'BG-03',
        name: 'Rawa Lumpur Garam & Terasi',
        description:
          'Wide open jungle clearing transformed into a bubbling mystical mud swamp surrounded by sparkling salt-water pools.',
        architecture: 'Open natural jungle clearing beside dramatic steaming mud basin',
        vegetation: 'Perimeter tropical trees and jungle reeds',
        lightingDirection: 'Bright dramatic afternoon light breaking through mist',
        colorPalette: 'Warm clay mud brown, sparkling sea-salt turquoise, lush jungle green',
        cameraPerspective: 'Wide action clearing perspective',
        environmentDetails: 'Bubbling mud ripples, shimmering salt crystals, mossy stones',
        timeOfDay: 'Sore Hari',
        weather: 'Cerah Berkabut Ringan',
        visualStyle: '3D Pixar / Disney Style Animation',
        dnaLocked: true,
      },
    ],
    storyOutline: {
      rawStory:
        'Mbok Srini membesarkan Timun Mas yang lahir dari mentimun emas ajaib dengan penuh kasih. Ketika Timun Mas beranjak besar, raksasa Buto Ijo datang menagih janji. Mbok Srini membekali Timun Mas empat benda sakti: biji mentimun, jarum, garam, dan terasi. Dalam pengejaran menegangkan melintasi hutan, Timun Mas melemparkan bekalnya satu per satu menjadi ladang mentimun lebat, hutan bambu, lautan luas, hingga lautan lumpur yang menghentikan Buto Ijo selamanya.',
      opening:
        'Di sebuah pondok desa di tepi ladang, Mbok Srini merawat Timun Mas yang tumbuh menjadi gadis ceria, rajin, dan pemberani.',
      curiosityProblem:
        'Suatu hari Buto Ijo datang menagih janji lama, sehingga Mbok Srini memberi Timun Mas kantong berisi empat bekal ajaib untuk menyelamatkan diri.',
      exploration:
        'Saat dikejar Buto Ijo menembus hutan, Timun Mas melemparkan biji mentimun menjadi sulur lebat, jarum menjadi hutan bambu, dan garam menjadi lautan luas.',
      educationalExplanation:
        'Dengan keberanian, ketenangan, dan kecerdikan memanfaatkan bekal dari ibunya, Timun Mas mampu menghadapi rintangan sebesar apa pun.',
      closing:
        'Akhirnya Timun Mas melempar terasi yang berubah menjadi rawa lumpur mendidih hingga Buto Ijo tenggelam, dan Timun Mas pulang memeluk Mbok Srini dengan selamat.',
      moralMessage:
        'Keberanian, kecerdikan, dan doa seorang ibu mampu mengalahkan ketakutan dan rintangan terbesar.',
    },
  },
  {
    id: 'danau-toba',
    title: 'Legenda Danau Toba',
    keywords: ['danau toba', 'samosir', 'putri ikan', 'toba'],
    category: 'Cerita Rakyat',
    characters: [
      {
        id: 'CHAR-01',
        name: 'Toba',
        roleType: 'Petani & Pemancing (Ayah Samosir)',
        age: '28 tahun',
        gender: 'Laki-laki',
        physicalDescription:
          'Young Batak farmer and fisherman age 28, sturdy lean build, neat dark hair, warm tan skin, wearing an earthy indigo-brown traditional woven Batak tunic, dark trousers, and woven ulos shoulder cloth.',
        faceShape: 'Honest strong oval face',
        skinTone: 'Warm tan Indonesian skin',
        hair: 'Neat medium-short dark hair',
        hairStyle: 'Simple practical village hair',
        hairColor: 'Black',
        eyes: 'Expressive dark brown eyes',
        bodyProportions: 'Sturdy hardworking farmer proportions',
        expression: 'Earnest hardworking expression',
        clothing: 'Indigo-brown woven Batak farmer tunic, dark rolled trousers, simple woven ulos cloth',
        accessories: 'Bamboo fishing pole and woven rattan basket',
        personality: 'Pekerja keras namun terkadang kurang sabar',
        voiceDnaId: 'VOICE-01',
        visualDnaLock: true,
        storyIdentityLocked: true,
        isActive: true,
      },
      {
        id: 'CHAR-02',
        name: 'Putri Ikan',
        roleType: 'Putri Jelmaan Ikan Mas Ajaib (Ibu Samosir)',
        age: '25 tahun',
        gender: 'Perempuan',
        physicalDescription:
          'Graceful gentle woman age 25 transformed from a golden fish, luminous warm skin, long sleek black hair accented with subtle golden-scale hairpins, wearing a flowing golden-amber and deep red Batak ulos-inspired dress.',
        faceShape: 'Serene luminous oval face',
        skinTone: 'Warm glowing light-tan skin',
        hair: 'Long flowing black hair with delicate gold scale-shaped hairpins',
        hairStyle: 'Long flowing hair with golden pins',
        hairColor: 'Jet black',
        eyes: 'Gentle luminous dark brown eyes',
        bodyProportions: 'Graceful gentle mother proportions',
        expression: 'Kind, calm, solemn promise-keeper expression',
        clothing: 'Golden-amber and crimson Batak ulos-patterned traditional dress',
        accessories: 'Golden fish-scale hairpins',
        personality: 'Lembut, penyayang, tegas menjaga janji suci',
        voiceDnaId: 'VOICE-02',
        visualDnaLock: true,
        storyIdentityLocked: true,
        isActive: true,
      },
      {
        id: 'CHAR-03',
        name: 'Samosir',
        roleType: 'Putra Toba & Putri Ikan',
        age: '8 tahun',
        gender: 'Laki-laki',
        physicalDescription:
          'Lively 8-year-old Indonesian boy, playful tousled dark hair, bright curious dark eyes, wearing a cheerful warm mustard-and-maroon Batak-patterned vest over a cream shirt and brown shorts.',
        faceShape: 'Soft rounded playful child face',
        skinTone: 'Warm Indonesian tan skin',
        hair: 'Playful tousled short black hair',
        hairStyle: 'Tousled child crop',
        hairColor: 'Black',
        eyes: 'Bright dark brown eyes',
        bodyProportions: 'Energetic 8-year-old child proportions',
        expression: 'Playful cheerful child expression',
        clothing: 'Mustard-and-maroon patterned vest over cream shirt and brown shorts',
        accessories: 'Small woven lunch bundle (rantang/kain bekal)',
        personality: 'Ceria, aktif bermain, polos, kadang ceroboh saat lapar',
        voiceDnaId: 'VOICE-01',
        visualDnaLock: true,
        storyIdentityLocked: true,
        isActive: true,
      },
    ],
    backgrounds: [
      {
        id: 'BG-01',
        name: 'Sungai Jernih & Lembah Hijau Sumatra',
        description:
          'Crystal-clear mountain river flowing beside lush green North Sumatran valley hills with smooth river stones and swaying wild reeds.',
        architecture: 'Natural rocky riverbank and small wooden footbridge',
        vegetation: 'Lush highland ferns, tall grass, tropical valley trees',
        lightingDirection: 'Crisp sunlit morning light sparkling across river water',
        colorPalette: 'Emerald valley green, crystal river blue, warm sunlit gold',
        cameraPerspective: 'Peaceful riverbank wide perspective',
        environmentDetails: 'Rippling clear river, shimmering golden fish ripples, mossy rocks',
        timeOfDay: 'Pagi Cerah',
        weather: 'Cerah Sejuk',
        visualStyle: '3D Pixar / Disney Style Animation',
        dnaLocked: true,
      },
      {
        id: 'BG-02',
        name: 'Pondok Kayu & Ladang Toba',
        description:
          'Traditional North Sumatran wooden house with distinctive curved saddle roof overlooking terraced green vegetable fields.',
        architecture: 'Traditional Batak wooden house (Rumah Bolon inspired) with carved wooden gables',
        vegetation: 'Green terraced farm crops, fruit trees, highland flowers',
        lightingDirection: 'Warm midday highland sunlight',
        colorPalette: 'Rich timber brown, terracotta earth, vibrant highland green',
        cameraPerspective: 'Warm village farm perspective',
        environmentDetails: 'Wooden veranda, farm hoes, woven food baskets',
        timeOfDay: 'Siang Hari',
        weather: 'Cerah Hangat',
        visualStyle: '3D Pixar / Disney Style Animation',
        dnaLocked: true,
      },
      {
        id: 'BG-03',
        name: 'Danau Toba & Pulau Samosir Luas',
        description:
          'Majestic vast highland lake surrounded by misty green mountains with a peaceful green island rising in the center beneath clearing rain clouds.',
        architecture: 'Open panoramic highland valley transformed into a grand blue lake',
        vegetation: 'Lush highland pine and tropical mountain slopes',
        lightingDirection: 'Dramatic sunbeams breaking through receding rain clouds over the lake',
        colorPalette: 'Deep sapphire lake blue, misty mountain jade, silver-gold clouds',
        cameraPerspective: 'Panoramic aerial-hilltop vista overlooking the vast lake',
        environmentDetails: 'Rippling vast lake water, central green island, soft rising mist',
        timeOfDay: 'Sore Setelah Hujan',
        weather: 'Berawan Sejuk',
        visualStyle: '3D Pixar / Disney Style Animation',
        dnaLocked: true,
      },
    ],
    storyOutline: {
      rawStory:
        'Toba seorang petani yang memancing ikan mas berkilau di sungai yang ternyata jelmaan seorang putri cantik. Putri Ikan bersedia menikah dengan Toba dengan satu syarat: Toba tidak boleh pernah mengungkit asal-usulnya sebagai ikan. Mereka dikaruniai anak bernama Samosir. Suatu hari Samosir memakan bekal ayahnya di jalan karena lapar, membuat Toba sangat marah hingga melanggar janji rahasia tersebut. Langit pun turun hujan deras menggenangi lembah menjadi Danau Toba.',
      opening:
        'Di lembah hijau Sumatra Utara, Toba menangkap ikan mas ajaib yang berubah menjadi Putri Ikan dan membuat perjanjian suci sebelum menikah.',
      curiosityProblem:
        'Bertahun-tahun hidup bahagia bersama putra mereka, Samosir, suatu siang Samosir diminta mengantar bekal makan siang ke ladang ayahnya.',
      exploration:
        'Di tengah jalan, Samosir merasa sangat lapar hingga memakan hampir seluruh bekal sebelum tiba di ladang Toba.',
      educationalExplanation:
        'Amarah yang tak terkendali membuat Toba lupa menjaga kesabaran dan melanggar janji penting yang telah ia ucapkan kepada Putri Ikan.',
      closing:
        'Putri Ikan dan Samosir menghilang di tengah hujan deras yang memenuhi seluruh lembah hingga terbentuklah Danau Toba dan Pulau Samosir.',
      moralMessage:
        'Kendalikan amarah dan selalu tepati janji serta amanah yang sudah dipercayakan kepada kita.',
    },
  },
  {
    id: 'semut-belalang',
    title: 'Petualangan Semut Kecil dan Belalang Pemalas',
    keywords: ['semut', 'belalang'],
    category: 'Fabel',
    characters: [
      {
        id: 'CHAR-01',
        name: 'Semut Kecil',
        roleType: 'Tokoh Hewan Pekerja Keras (Protagonis)',
        age: 'Anak / Kecil',
        gender: 'Laki-laki',
        physicalDescription:
          'Adorable stylized 3D animated little red-brown ant character with expressive large friendly eyes, cute curved antennae, six nimble limbs, wearing a tiny bright yellow-amber explorer vest and carrying a mini woven leaf backpack.',
        faceShape: 'Cute rounded expressive insect-hero face',
        skinTone: 'Warm glossy chestnut-amber ant carapace',
        hair: 'Two expressive curved antennae (no human hair)',
        hairStyle: 'Curved expressive antennae',
        hairColor: 'Glossy dark brown',
        eyes: 'Large bright expressive warm brown eyes',
        bodyProportions: 'Small nimble anthropomorphic cartoon ant proportions',
        expression: 'Cheerful diligent hardworking smile',
        clothing: 'Tiny bright yellow-amber explorer vest',
        accessories: 'Mini woven leaf backpack and grain pouch',
        personality: 'Rajin, disiplin, peduli masa depan, suka menolong',
        voiceDnaId: 'VOICE-01',
        visualDnaLock: false,
        storyIdentityLocked: false,
        isActive: true,
      },
      {
        id: 'CHAR-02',
        name: 'Belalang',
        roleType: 'Tokoh Hewan Pemusik Santai (Ko-Protagonis)',
        age: 'Anak / Muda',
        gender: 'Laki-laki',
        physicalDescription:
          'Expressive stylized 3D animated bright lime-green grasshopper character with long springy hind legs, translucent folded wings, friendly big eyes, wearing a jaunty tiny orange neckerchief and holding a miniature wooden leaf-violin.',
        faceShape: 'Expressive cheerful cartoon grasshopper face',
        skinTone: 'Vibrant lime-emerald green carapace',
        hair: 'Slender playful antennae',
        hairStyle: 'Slender antennae',
        hairColor: 'Leaf green',
        eyes: 'Large expressive amber-brown eyes',
        bodyProportions: 'Tall slender springy cartoon grasshopper proportions',
        expression: 'Carefree musical smile turning thoughtful later',
        clothing: 'Tiny tangerine-orange neckerchief',
        accessories: 'Miniature wooden leaf-violin and bow',
        personality: 'Ceria, suka bersantai dan bermusik, belajar arti tanggung jawab',
        voiceDnaId: 'VOICE-02',
        visualDnaLock: false,
        storyIdentityLocked: false,
        isActive: true,
      },
    ],
    backgrounds: [
      {
        id: 'BG-01',
        name: 'Padang Rumput Cerah Musim Panas',
        description:
          'Macro-scale sunlit green meadow filled with towering grass blades, golden wheat grains, daisies, and warm golden summer sunbeams.',
        architecture: 'Tiny natural twig bridges and smooth pebble pathways at insect scale',
        vegetation: 'Towering green grass blades, yellow dandelions, wild daisies, golden wheat stalks',
        lightingDirection: 'Warm bright golden summer sunlight from top-left',
        colorPalette: 'Lush meadow green, sunny dandelion yellow, warm golden amber',
        cameraPerspective: 'Insect eye-level macro perspective looking up at tall grass',
        environmentDetails: 'Fallen golden wheat grains, dewdrops, giant clover leaves',
        timeOfDay: 'Siang Musim Panas',
        weather: 'Cerah Hangat',
        visualStyle: '3D Pixar / Disney Style Animation',
        dnaLocked: true,
      },
      {
        id: 'BG-02',
        name: 'Sarang Hangat & Padang Rumput Musim Hujan',
        description:
          'Cozy warm underground ant pantry filled with neatly stored golden grains beside a cool rainy meadow doorway outside.',
        architecture: 'Cozy carved earthen ant burrow doorway sheltered beneath a broad leaf',
        vegetation: 'Wet drooping clover leaves, rain-soaked grass blades outside',
        lightingDirection: 'Cool misty rainy daylight outside contrasting with warm glowing amber burrow interior',
        colorPalette: 'Cool rainy slate blue outside, warm honey-amber burrow glow inside',
        cameraPerspective: 'Warm threshold view showing both the rainy grass and cozy burrow entrance',
        environmentDetails: 'Stacked golden wheat seeds, tiny mushroom lantern, falling raindrops',
        timeOfDay: 'Sore Musim Hujan',
        weather: 'Hujan Dingin',
        visualStyle: '3D Pixar / Disney Style Animation',
        dnaLocked: true,
      },
    ],
    storyOutline: {
      rawStory:
        'Di padang rumput musim panas yang cerah, Semut Kecil rajin mengumpulkan butiran gandum ke sarangnya sementara Belalang asyik bermain biola daun dan bersantai. Semut mengingatkan Belalang untuk bersiap menghadapi musim hujan, tetapi Belalang mengabaikannya. Ketika hujan dingin tiba dan makanan sulit dicari, Belalang kedinginan dan kelaparan hingga akhirnya Semut Kecil berbagi makanan dengan hangat sambil mengajaknya rajin bersiap bersama.',
      opening:
        'Di padang rumput yang hangat, Semut Kecil bekerja keras mengangkat butiran gandum sementara Belalang bernyanyi dan memainkan biola daunnya.',
      curiosityProblem:
        'Semut Kecil mengajak Belalang ikut mengumpulkan persediaan sebelum musim hujan datang, tetapi Belalang memilih terus bersenang-senang.',
      exploration:
        'Ketika awan gelap datang membawa hujan deras dan angin dingin, Belalang menggigil tanpa makanan sedangkan sarang Semut hangat dan penuh persediaan.',
      educationalExplanation:
        'Menabung tenaga, waktu, dan persediaan sejak dini membuat kita siap menghadapi masa sulit tanpa panik.',
      closing:
        'Semut Kecil dengan baik hati mengundang Belalang berteduh dan berbagi makanan, lalu Belalang berjanji ikut rajin bekerja di musim berikutnya.',
      moralMessage:
        'Rajin bekerja dan menyiapkan diri sejak awal lebih baik daripada menunda-nunda hingga kesulitan tiba.',
    },
  },
  {
    id: 'kancil-buaya',
    title: 'Si Kancil dan Buaya',
    keywords: ['kancil', 'buaya'],
    category: 'Fabel',
    characters: [
      {
        id: 'CHAR-01',
        name: 'Si Kancil',
        roleType: 'Tokoh Hewan Cerdik (Protagonis)',
        age: 'Anak / Muda',
        gender: 'Laki-laki',
        physicalDescription:
          'Clever stylized 3D Indonesian mouse-deer (kancil) with smooth warm amber-brown fur, cream belly, tiny delicate antlers/ears, bright sparkling dark eyes, wearing a tiny emerald-green explorer scarf.',
        faceShape: 'Cute alert deer-like face with smart sparkling eyes',
        skinTone: 'Warm chestnut-amber fur with soft cream chest',
        hair: 'Short glossy fur coat (animal character)',
        hairStyle: 'Smooth short fur with neat ear tufts',
        hairColor: 'Warm amber-brown',
        eyes: 'Bright clever dark brown eyes',
        bodyProportions: 'Small agile cartoon mouse-deer proportions',
        expression: 'Clever confident playful smile',
        clothing: 'Tiny emerald-green explorer neck scarf',
        accessories: 'None',
        personality: 'Cerdik, tenang saat terdesak, cepat berpikir',
        voiceDnaId: 'VOICE-01',
        visualDnaLock: false,
        storyIdentityLocked: false,
        isActive: true,
      },
      {
        id: 'CHAR-02',
        name: 'Buaya Sungai',
        roleType: 'Kawanan Buaya Penunggu Sungai',
        age: 'Dewasa',
        gender: 'Laki-laki',
        physicalDescription:
          'Stylized 3D cartoon green river crocodile with bumpy olive-emerald scales, broad snout with rounded friendly-cartoon teeth, expressive yellow-gold eyes, wearing no clothes—pure natural animal character.',
        faceShape: 'Broad comical crocodile snout with expressive brow',
        skinTone: 'Olive-emerald textured crocodile scales',
        hair: 'None (scaly crocodile ridge)',
        hairStyle: 'Scaly ridge',
        hairColor: 'Olive green',
        eyes: 'Expressive amber-yellow reptile eyes',
        bodyProportions: 'Long sturdy cartoon crocodile proportions',
        expression: 'Grumpy easily-flattered expression',
        clothing: 'None (natural animal scales)',
        accessories: 'None',
        personality: 'Galak namun mudah terbujuk dan kurang teliti',
        voiceDnaId: 'VOICE-03',
        visualDnaLock: false,
        storyIdentityLocked: false,
        isActive: true,
      },
    ],
    backgrounds: [
      {
        id: 'BG-01',
        name: 'Tepi Sungai Hutan Tropis',
        description:
          'Lush sunlit Indonesian tropical forest riverbank with flowing turquoise river water, smooth stepping rocks, and hanging jungle vines.',
        architecture: 'Natural mossy riverbank and clear forest river crossing',
        vegetation: 'Tropical river ferns, banana leaves, overarching jungle branches',
        lightingDirection: 'Warm dappled jungle sunlight sparkling on river ripples',
        colorPalette: 'Vibrant jungle green, river turquoise, warm sunlit amber',
        cameraPerspective: 'Wide river-edge establishing perspective',
        environmentDetails: 'Rippling river current, smooth river pebbles, lily pads',
        timeOfDay: 'Pagi Cerah',
        weather: 'Cerah Hangat',
        visualStyle: '3D Pixar / Disney Style Animation',
        dnaLocked: true,
      },
      {
        id: 'BG-02',
        name: 'Kebun Mentimun Seberang Sungai',
        description:
          'Sunny lush garden meadow across the river brimming with crisp green cucumber vines and bright yellow blossoms.',
        architecture: 'Simple wooden garden border fence beside river landing',
        vegetation: 'Flourishing cucumber vines, yellow flowers, soft green grass',
        lightingDirection: 'Bright cheerful midday sunlight',
        colorPalette: 'Fresh garden green, bright blossom yellow, warm soil brown',
        cameraPerspective: 'Cheerful opposite-shore view',
        environmentDetails: 'Fresh ripe cucumbers on vines, fluttering butterflies',
        timeOfDay: 'Siang Cerah',
        weather: 'Cerah',
        visualStyle: '3D Pixar / Disney Style Animation',
        dnaLocked: true,
      },
    ],
    storyOutline: {
      rawStory:
        'Si Kancil ingin menyeberangi sungai deras untuk makan buah segar di seberang, namun kawanan Buaya Sungai menghadang. Dengan kecerdikannya, Si Kancil berkata bahwa raja hutan ingin menghitung jumlah seluruh buaya untuk pesta besar. Para Buaya pun berbaris rapi dari tepi ke tepi sehingga Si Kancil bisa melompat sambil berhitung hingga tiba di seberang dengan selamat.',
      opening:
        'Si Kancil berjalan riang di tepi sungai hutan tropis dan melihat kebun buah segar di seberang sungai yang deras.',
      curiosityProblem:
        'Sungai itu dijaga oleh Buaya Sungai yang besar, sehingga Si Kancil harus memikirkan cara cerdik untuk menyeberang tanpa bahaya.',
      exploration:
        'Si Kancil mengajak Buaya Sungai dan kawan-kawannya berbaris memanjang di permukaan air dengan alasan menghitung peserta pesta raja hutan.',
      educationalExplanation:
        'Kecerdikan dan ketenangan berpikir membantu kita menemukan jalan keluar yang cerdas di saat sulit.',
      closing:
        'Si Kancil melompati punggung buaya satu per satu sambil berhitung hingga melompat aman ke seberang sungai.',
      moralMessage:
        'Gunakan akal sehat dan ketenangan untuk menyelesaikan masalah secara bijak.',
    },
  },
];

export function detectStoryCategory(production: ProductionSettings): StoryCategory {
  if (production.storyCategory) {
    return production.storyCategory;
  }
  const titleLower = production.episodeTitle.toLowerCase();
  if (
    production.genre === 'Cerita Rakyat' ||
    production.contentType === 'Folklore Animation' ||
    STORY_KNOWLEDGE_BASE.some(
      (e) =>
        e.category === 'Cerita Rakyat' &&
        e.keywords.some((kw) => titleLower.includes(kw))
    )
  ) {
    return 'Cerita Rakyat';
  }
  if (
    production.genre === 'Fabel' ||
    STORY_KNOWLEDGE_BASE.some(
      (e) =>
        e.category === 'Fabel' && e.keywords.some((kw) => titleLower.includes(kw))
    )
  ) {
    return 'Fabel';
  }
  if (
    production.genre === 'Dongeng' ||
    production.genre === 'Fantasi' ||
    production.contentType === 'Storybook Animation'
  ) {
    return 'Dongeng Original';
  }
  if (
    production.genre === 'Other' ||
    production.contentType === 'Other'
  ) {
    return 'Cerita Custom';
  }
  return 'Cerita Edukasi';
}

function extractNamesFromText(text: string): string[] {
  const stopWords = new Set([
    'Petualangan',
    'Kisah',
    'Legenda',
    'Cerita',
    'Dongeng',
    'Fabel',
    'Rahasia',
    'Mengenal',
    'Menjelajahi',
    'Belajar',
    'Berpetualang',
    'Episode',
    'Dan',
    'Di',
    'Ke',
    'Dari',
    'Yang',
    'Dengan',
    'Untuk',
    'Fotosintesis',
    'Siklus',
    'Air',
    'Sains',
    'Dunia',
    'Alam',
    'Sekolah',
    'Taman',
    'Hutan',
    'Kerajaan',
    'Pulau',
    'Gunung',
    'Desa',
    'Laut',
    'Langit',
    'Pemalas',
    'Kecil',
    'Besar',
    'Ajaib',
    'Sang',
    'Para',
  ]);
  const matches = text.match(/\b[A-Z][a-z]{2,15}\b/g) || [];
  const unique: string[] = [];
  for (const m of matches) {
    if (!stopWords.has(m) && !unique.includes(m)) {
      unique.push(m);
    }
    if (unique.length >= 3) break;
  }
  return unique;
}

function inferLocationsFromStory(
  title: string,
  rawStory: string,
  visualStyle: string
): BackgroundProfile[] {
  const combined = `${title} ${rawStory}`.toLowerCase();
  const list: BackgroundProfile[] = [];

  const pushBg = (
    name: string,
    description: string,
    architecture: string,
    vegetation: string,
    lighting: string,
    palette: string,
    timeOfDay: string,
    weather: string
  ) => {
    const id = `BG-${String(list.length + 1).padStart(2, '0')}`;
    list.push({
      id,
      locationId: id,
      name,
      description,
      architecture,
      vegetation,
      lightingDirection: lighting,
      colorPalette: palette,
      cameraPerspective: 'Child eye-level wide establishing perspective with clear foreground space',
      environmentDetails: `${architecture}, ${vegetation}`,
      timeOfDay,
      weather,
      visualStyle,
      uploadedReferenceImage: null,
      dnaLocked: true,
      generatedPrompt: '',
    });
  };

  if (combined.includes('fotosintesis') || combined.includes('daun') || combined.includes('tumbuhan')) {
    pushBg(
      'Kebun Sekolah & Rumah Kaca Hijau',
      'Sunny Indonesian school garden beside a bright glass greenhouse with sunflowers and leafy vegetable beds.',
      'Glass greenhouse frame, wooden plant beds, stone path',
      'Sunflowers, lush vegetable leaves, green bushes',
      'Warm golden morning sunlight streaming across leaves',
      'Vibrant emerald green, sunflower yellow, warm amber sunlight',
      'Pagi Cerah',
      'Cerah Hangat'
    );
    pushBg(
      'Taman Daun Hijau & Embun Pagi',
      'Close sunlit botanical corner filled with broad glossy green leaves and sparkling water dewdrops.',
      'Low stone garden edging and botanical watering spout',
      'Broad glossy green leaves, moss, tender sprouts',
      'Backlit golden sunbeams highlighting leaf veins',
      'Fresh chlorophyll green, golden sun rays, crystal water',
      'Pagi Menjelang Siang',
      'Cerah Berkilau'
    );
    pushBg(
      'Bukit Taman Pohon Rindang Segar',
      'Breezy sunlit park lawn beneath a thriving green shade tree surrounded by blooming flowers.',
      'Open park stone path and wooden bench',
      'Grand shade tree, blooming marigolds, fresh lawn grass',
      'Balanced daylight filtering through green canopy leaves',
      'Lush leaf green, marigold orange, clear azure sky',
      'Siang Cerah',
      'Cerah Segar'
    );
  } else if (combined.includes('siklus air') || combined.includes('hujan')) {
    pushBg(
      'Taman Bermain & Gazebo Kayu',
      'Lush neighborhood park with a cozy wooden gazebo during gentle refreshing rainfall.',
      'Cozy wooden garden gazebo and stone footpath',
      'Wet glistening foliage, flowering shrubs, grassy lawn',
      'Soft diffused daylight with warm gazebo interior bounce',
      'Emerald green, honey wood, soft sky-blue rain mist',
      'Pagi Menjelang Siang',
      'Hujan Rintik Segar'
    );
    pushBg(
      'Dermaga Pesisir Lautan Cerah',
      'Scenic wooden coastal pier overlooking sparkling blue sea with rising water vapor under warm sunbeams.',
      'Timber coastal pier with safety railing',
      'Distant tropical island coastal palms',
      'Bright golden sunlight reflecting off ocean ripples',
      'Turquoise blue, warm golden sunbeams, natural oak pier',
      'Siang Cerah',
      'Cerah Hangat'
    );
    pushBg(
      'Bukit Pandang Awan Tinggi',
      'Breezy green hilltop overlook facing vast fluffy clouds condensing in the sky.',
      'Open grassy hillside vista',
      'Swaying meadow grass and wildflowers',
      'Crisp high-altitude daylight shifting softly to silver cloud light',
      'Cerulean sky, alabaster clouds, meadow green',
      'Sore Hari',
      'Berawan Sejuk'
    );
  } else if (combined.includes('kerajaan') || combined.includes('istana') || combined.includes('candi') || combined.includes('putri') || combined.includes('raja')) {
    pushBg(
      'Halaman Istana Kerajaan Nusantara',
      'Grand traditional royal palace courtyard with carved stone gates and lush tropical palace gardens.',
      'Carved stone palace arches, wooden pendopo pillars',
      'Banyan trees, tropical frangipani, courtyard flowers',
      'Warm golden royal afternoon sunlight',
      'Sandstone gray, royal gold, emerald foliage',
      'Sore Cerah',
      'Cerah Hangat'
    );
    pushBg(
      'Hutan & Taman Kerajaan Berkabut',
      'Enchanted forest path near royal hills glowing softly with warm sunlight beams.',
      'Stone trail markers and rustic wooden bridge',
      'Tall tropical canopy trees, ferns, glowing wildflowers',
      'Dappled sunbeams filtering through tall canopy',
      'Deep forest emerald, sunlit gold, warm timber',
      'Pagi Hari',
      'Cerah Berembun'
    );
  } else if (combined.includes('hutan') || combined.includes('padang rumput') || combined.includes('sungai')) {
    pushBg(
      'Padang Rumput & Tepi Hutan Cerah',
      'Bright sunlit meadow bordered by lush forest trees and clear stepping path.',
      'Natural stone footpath and wooden trail post',
      'Soft meadow grass, wildflowers, leafy forest trees',
      'Warm cheerful morning daylight',
      'Fresh grass green, sunlit amber, sky blue',
      'Pagi Cerah',
      'Cerah Hangat'
    );
    pushBg(
      'Tepi Sungai Hutan Jernih',
      'Peaceful crystal-clear forest river surrounded by smooth boulders and overhanging green branches.',
      'Natural stone riverbank and small timber bridge',
      'River ferns, reeds, lush canopy trees',
      'Sparkling dappled sunlight on clear river ripples',
      'Turquoise water, deep emerald foliage, warm stone',
      'Siang Cerah',
      'Cerah'
    );
  } else {
    pushBg(
      `Latar Utama — ${title || 'Lingkungan Cerita'}`,
      `Vibrant child-friendly animation environment tailored to "${title || 'Cerita Edukasi'}" with clear open foreground staging.`,
      'Clean storybook architecture and natural pathway props',
      'Balanced cheerful greenery and ambient flora',
      'Warm soft balanced daylight with subtle golden rim light',
      'Harmonious warm amber, fresh green, and soft sky tones',
      'Pagi Cerah',
      'Cerah Hangat'
    );
    pushBg(
      `Area Eksplorasi — ${title || 'Lokasi Petualangan'}`,
      `Engaging secondary exploration area supporting the middle story beats of "${title || 'Cerita Edukasi'}".`,
      'Contextual educational props and open exploration stage',
      'Contextual plants and natural ground textures',
      'Crisp bright daylight highlighting main story objects',
      'Bright inviting storybook palette',
      'Siang Cerah',
      'Cerah'
    );
  }

  return list;
}

export function detectStoryCastAndSettings(
  production: ProductionSettings,
  story: StoryOutline
): StoryDetectionResult {
  const category = detectStoryCategory(production);
  const titleLower = production.episodeTitle.toLowerCase();
  const rawLower = story.rawStory.toLowerCase();
  const style =
    production.visualStyle === 'Custom Style'
      ? production.customVisualStyle.trim() || '3D Pixar / Disney Style Animation'
      : production.visualStyle;

  // 1. Check Knowledge Base strictly by episodeTitle FIRST so stale story text from another story never hijacks detection
  const kbMatchByTitle = STORY_KNOWLEDGE_BASE.find((entry) =>
    entry.keywords.some((kw) => titleLower.includes(kw))
  );
  const kbMatchByStory = !kbMatchByTitle
    ? STORY_KNOWLEDGE_BASE.find((entry) =>
        entry.keywords.some((kw) => rawLower.includes(kw))
      )
    : undefined;
  const kbMatch = kbMatchByTitle || kbMatchByStory;

  if (
    kbMatch &&
    (category === 'Cerita Rakyat' ||
      category === 'Fabel' ||
      kbMatch.category === category)
  ) {
    return {
      storyCategory: kbMatch.category,
      source: 'knowledge-base',
      matchedTitle: kbMatch.title,
      characters: kbMatch.characters.map((c) => ({
        ...c,
        uploadedReferenceImage: null,
        characterSheetImage: null,
        characterSheetPrompt: '',
      })),
      backgrounds: kbMatch.backgrounds.map((b) => ({
        ...b,
        locationId: b.id,
        visualStyle: style,
        uploadedReferenceImage: null,
        generatedPrompt: '',
      })),
      storyOutline: kbMatch.storyOutline,
    };
  }

  // 2. Cerita Custom preserves manual workflow unless user wants auto-extract
  if (category === 'Cerita Custom') {
    return {
      storyCategory: 'Cerita Custom',
      source: 'manual',
      characters: [],
      backgrounds: inferLocationsFromStory(production.episodeTitle, story.rawStory, style),
    };
  }

  // 3. Heuristic detection tailored by Story Category
  const detectedNames = extractNamesFromText(
    `${production.episodeTitle} ${story.rawStory}`
  );
  const isIdentityLocked = category === 'Cerita Rakyat';

  if (category === 'Fabel') {
    const animal1 = detectedNames[0] || 'Kancil Kecil';
    const animal2 = detectedNames[1] || 'Kura-Kura Bijak';
    const characters: CharacterProfile[] = [
      {
        id: 'CHAR-01',
        name: animal1,
        roleType: 'Tokoh Hewan Utama',
        age: 'Muda',
        gender: 'Laki-laki',
        physicalDescription: `Adorable stylized 3D animated ${animal1} animal character with expressive eyes, natural colorful fur/feathers, wearing a tiny amber explorer scarf.`,
        faceShape: 'Expressive friendly cartoon animal face',
        skinTone: 'Natural warm animal coat',
        hair: 'Natural soft fur/feathers (animal character)',
        hairStyle: 'Natural fur tufts',
        hairColor: 'Warm amber-brown',
        eyes: 'Bright expressive dark eyes',
        bodyProportions: 'Charming anthropomorphic cartoon animal proportions',
        expression: 'Curious cheerful smile',
        clothing: 'Tiny amber explorer scarf',
        accessories: 'Small leaf satchel',
        personality: 'Lincah, penuh rasa ingin tahu, ramah',
        voiceDnaId: 'VOICE-01',
        uploadedReferenceImage: null,
        characterSheetImage: null,
        characterSheetPrompt: '',
        visualDnaLock: true,
        storyIdentityLocked: false,
        isActive: true,
      },
      {
        id: 'CHAR-02',
        name: animal2,
        roleType: 'Tokoh Hewan Pendamping',
        age: 'Muda',
        gender: 'Perempuan',
        physicalDescription: `Expressive stylized 3D animated ${animal2} animal character with warm kind eyes, distinct natural animal markings, wearing a small emerald ribbon.`,
        faceShape: 'Sweet expressive cartoon animal face',
        skinTone: 'Natural forest-toned animal coat',
        hair: 'Natural soft fur/shell (animal character)',
        hairStyle: 'Natural animal coat',
        hairColor: 'Soft olive-brown',
        eyes: 'Warm attentive eyes',
        bodyProportions: 'Charming anthropomorphic cartoon animal proportions',
        expression: 'Friendly thoughtful smile',
        clothing: 'Tiny emerald green ribbon accessory',
        accessories: 'None',
        personality: 'Bijaksana, sabar, suka bekerja sama',
        voiceDnaId: 'VOICE-02',
        uploadedReferenceImage: null,
        characterSheetImage: null,
        characterSheetPrompt: '',
        visualDnaLock: true,
        storyIdentityLocked: false,
        isActive: true,
      },
    ];
    return {
      storyCategory: 'Fabel',
      source: 'heuristic',
      characters,
      backgrounds: inferLocationsFromStory(production.episodeTitle, story.rawStory, style),
    };
  }

  if (category === 'Cerita Rakyat') {
    const hero1 = detectedNames[0] || 'Tokoh Utama';
    const hero2 = detectedNames[1] || 'Tokoh Pendamping';
    const characters: CharacterProfile[] = [
      {
        id: 'CHAR-01',
        name: hero1,
        roleType: `Tokoh Utama Cerita Rakyat "${production.episodeTitle}"`,
        age: '20 tahun',
        gender: 'Perempuan',
        physicalDescription: `Traditional Indonesian folklore character ${hero1}, expressive eyes, dignified traditional Nusantara royal or village attire with authentic woven motifs.`,
        faceShape: 'Refined expressive Nusantara face',
        skinTone: 'Warm Indonesian tan skin',
        hair: 'Long neat black hair in traditional Nusantara styling',
        hairStyle: 'Traditional Nusantara updo',
        hairColor: 'Jet black',
        eyes: 'Expressive dark brown eyes',
        bodyProportions: 'Balanced stylized 3D storybook proportions',
        expression: 'Dignified warm expression',
        clothing: 'Traditional embroidered Nusantara kebaya/tunic with batik cloth',
        accessories: 'Traditional cultural ornament',
        personality: 'Bijaksana, berani, setia pada kebenaran',
        voiceDnaId: 'VOICE-02',
        uploadedReferenceImage: null,
        characterSheetImage: null,
        characterSheetPrompt: '',
        visualDnaLock: true,
        storyIdentityLocked: isIdentityLocked,
        isActive: true,
      },
      {
        id: 'CHAR-02',
        name: hero2,
        roleType: `Tokoh Pendamping Cerita Rakyat "${production.episodeTitle}"`,
        age: '24 tahun',
        gender: 'Laki-laki',
        physicalDescription: `Traditional Indonesian folklore character ${hero2}, sturdy proportions, dark hair with traditional headband, wearing classic Nusantara warrior or village tunic.`,
        faceShape: 'Strong expressive Nusantara face',
        skinTone: 'Warm deep-tan Indonesian skin',
        hair: 'Thick dark hair with traditional headband',
        hairStyle: 'Tied with traditional headband',
        hairColor: 'Black',
        eyes: 'Sharp dark brown eyes',
        bodyProportions: 'Upright stylized 3D folklore proportions',
        expression: 'Determined alert expression',
        clothing: 'Traditional Nusantara woven vest, dark trousers, and batik sash',
        accessories: 'Traditional headband',
        personality: 'Tegas, berkarakter kuat, berperan penting dalam alur cerita',
        voiceDnaId: 'VOICE-01',
        uploadedReferenceImage: null,
        characterSheetImage: null,
        characterSheetPrompt: '',
        visualDnaLock: true,
        storyIdentityLocked: isIdentityLocked,
        isActive: true,
      },
    ];
    return {
      storyCategory: 'Cerita Rakyat',
      source: 'heuristic',
      characters,
      backgrounds: inferLocationsFromStory(production.episodeTitle, story.rawStory, style),
    };
  }

  // Dongeng Original or Cerita Edukasi
  const defaultName1 =
    detectedNames[0] || (category === 'Dongeng Original' ? 'Lala' : 'Tokoh Utama 1');
  const defaultName2 =
    detectedNames[1] || (category === 'Dongeng Original' ? 'Bimo' : 'Tokoh Pendamping 2');

  const characters: CharacterProfile[] = [
    {
      id: 'CHAR-01',
      name: defaultName1,
      roleType:
        category === 'Dongeng Original'
          ? 'Protagonis Dongeng Anak'
          : 'Protagonis Anak Perempuan',
      age: '8 tahun',
      gender: 'Perempuan',
      physicalDescription: `Indonesian girl age 8 named ${defaultName1}, neat shoulder-length black hair with sunflower-yellow hairclip, expressive dark brown eyes, warm curious smile, wearing a soft sage-green cardigan over cream t-shirt and denim overalls.`,
      faceShape: 'Sweet rounded child face with attentive features',
      skinTone: 'Warm light-tan Indonesian skin',
      hair: 'Shoulder-length straight black hair with sunflower-yellow hairclip',
      hairStyle: 'Shoulder-length straight with hairclip',
      hairColor: 'Black',
      eyes: 'Expressive dark brown eyes',
      bodyProportions: 'Child age-8 stylized 3D proportions',
      expression: 'Warm curious cheerful smile',
      clothing:
        'Soft sage-green cardigan over cream t-shirt, denim overalls, and white sneakers',
      accessories:
        category === 'Dongeng Original'
          ? 'Sunflower-yellow hairclip and tiny glowing storybook lantern'
          : 'Sunflower-yellow hairclip and small magnifying glass',
      personality: 'Cerdas, penuh rasa ingin tahu, ramah, teliti',
      voiceDnaId: 'VOICE-02',
      uploadedReferenceImage: null,
      characterSheetImage: null,
      characterSheetPrompt: '',
      visualDnaLock: true,
      storyIdentityLocked: false,
      isActive: true,
    },
    {
      id: 'CHAR-02',
      name: defaultName2,
      roleType:
        category === 'Dongeng Original'
          ? 'Sahabat Petualang Dongeng'
          : 'Protagonis Anak Laki-Laki',
      age: '8 tahun',
      gender: 'Laki-laki',
      physicalDescription: `Indonesian boy age 8 named ${defaultName2}, neat short black hair, bright dark brown eyes, cheerful enthusiastic smile, wearing a warm tangerine-orange polo shirt with amber collar trim, olive-green cargo shorts, and white-orange sneakers.`,
      faceShape: 'Soft rounded child face with cheerful cheeks',
      skinTone: 'Warm Indonesian tan skin',
      hair: 'Neat short black hair',
      hairStyle: 'Neat short side-parted crop',
      hairColor: 'Black',
      eyes: 'Bright dark brown expressive eyes',
      bodyProportions: 'Child age-8 stylized 3D proportions',
      expression: 'Cheerful enthusiastic smile',
      clothing:
        'Warm tangerine-orange polo shirt with amber collar trim, olive-green cargo shorts, and white-orange sneakers',
      accessories: 'Small green explorer satchel',
      personality: 'Energik, ramah, berani bereksplorasi',
      voiceDnaId: 'VOICE-01',
      uploadedReferenceImage: null,
      characterSheetImage: null,
      characterSheetPrompt: '',
      visualDnaLock: true,
      storyIdentityLocked: false,
      isActive: true,
    },
  ];

  return {
    storyCategory: category,
    source: 'heuristic',
    characters,
    backgrounds: inferLocationsFromStory(production.episodeTitle, story.rawStory, style),
  };
}
