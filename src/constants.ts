import { Language, Translation, Mood, Exercise, Resource, HealthCenter } from './types';

export const LANGUAGES: { code: Language; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'am', label: 'Amharic', native: 'አማርኛ' },
  { code: 'om', label: 'Afaan Oromo', native: 'Afaan Oromoo' },
  { code: 'ti', label: 'Tigrigna', native: 'ትግርኛ' },
  { code: 'so', label: 'Somali', native: 'Soomaali' },
  { code: 'aa', label: 'Afar', native: 'Qafár af' },
];

export const MOODS: Mood[] = [
  {
    id: 'happy',
    icon: 'Smile',
    label: { en: 'Happy', am: 'ጥሩ', om: 'Gaarii', ti: 'ጽቡቕ', so: 'Faraxsan', aa: 'Wali' },
    color: 'bg-[#06D6A0]',
  },
  {
    id: 'sad',
    icon: 'Frown',
    label: { en: 'Sad', am: 'አዝኛለሁ', om: 'Gadduu', ti: 'ሓዘን', so: 'Niyad-jab', aa: 'Kaxxa' },
    color: 'bg-[#118AB2]',
  },
  {
    id: 'anxious',
    icon: 'Wind',
    label: { en: 'Anxious', am: 'ተጨነቀ', om: 'Sodaa', ti: 'ተጨነቀ', so: 'Walaac', aa: 'Sodda' },
    color: 'bg-[#FFD166]',
  },
  {
    id: 'angry',
    icon: 'Flame',
    label: { en: 'Angry', am: 'ተቆጣ', om: 'Aarii', ti: 'ተቓጽል', so: 'Xanaaq', aa: 'Naar' },
    color: 'bg-[#EF476F]',
  },
  {
    id: 'lonely',
    icon: 'User',
    label: { en: 'Lonely', am: 'ብቸኝነት', om: 'Kophaa', ti: 'ብቸኝነት', so: 'Kalinimo', aa: 'Inni' },
    color: 'bg-[#4A90E2]',
  },
  {
    id: 'tired',
    icon: 'Moon',
    label: { en: 'Tired', am: 'ድካም', om: 'Dadhabuu', ti: 'ድኻም', so: 'Daal', aa: 'Dah' },
    color: 'bg-[#9B59B6]',
  },
  {
    id: 'stressed',
    icon: 'Activity',
    label: { en: 'Stressed', am: 'ውጥረት', om: 'Dhiphina', ti: 'ወጥሪ', so: 'Walwal', aa: 'Dhip' },
    color: 'bg-[#E67E22]',
  },
  {
    id: 'calm',
    icon: 'Cloud',
    label: { en: 'Calm', am: 'መረጋጋት', om: 'Tasgabbii', ti: 'መረጋጋት', so: 'Deggan', aa: 'Tas' },
    color: 'bg-[#2ECC71]',
  },
  {
    id: 'excited',
    icon: 'Zap',
    label: { en: 'Excited', am: 'መነቃቃት', om: 'Gammachuu', ti: 'ምንቃቓሕ', so: 'Xamaasad', aa: 'Gam' },
    color: 'bg-[#F1C40F]',
  },
];

export const EXERCISES: Exercise[] = [
  {
    id: 'breathing',
    icon: 'Wind',
    label: { en: 'Breathing', am: 'መተንፈስ', om: 'Hafuura', ti: 'ምትንፋስ', so: 'Neefsashada', aa: 'Haf' },
    description: {
      en: 'Breathe slowly',
      am: 'በቀስታ ይተንፍሱ',
      om: 'Suuta hafuura baafadhu',
      ti: 'ብዝሕ ዝበለ ትንፋስ ውሰድ',
      so: 'Si tartiib ah u neefso',
      aa: 'Haf'
    },
    audioDescription: {
      en: "This video demonstrates a deep breathing exercise. Inhale for 4 seconds, hold for 7, and exhale for 8.",
      am: "ይህ ቪዲዮ ጥልቅ የአተነፋፈስ ልምምድን ያሳያል። ለ 4 ሰከንድ ይተንፍሱ ፣ ለ 7 ሰከንድ ይያዙ እና ለ 8 ሰከንድ ይውጡ።",
      om: "Viidiyooon kun gilgaala hafuura gadi fageenyaan baafachuu agarsiisa. Sekondii 4f hafuura fudhadhu, 7f tursiisi, 8f baasi.",
      ti: "እዚ ቪድዮ ዓሚቝ ናይ ምትንፋስ ልምምድ የርኢ። ን4 ሰከንድ ኣተንፍስ፣ ን7 ሰከንድ ሓዝ፣ ን8 ሰከንድ ድማ ኣውጽእ።",
      so: "Muuqaalkani wuxuu muujinayaa jimicsi neefsasho qoto dheer ah. Neefso 4 ilbiriqsi, hay 7, ka dibna bixi 8.",
      aa: "Haf"
    },
    moods: ['anxious', 'angry', 'sad', 'stressed', 'tired'],
    videoUrls: {
      en: 'https://www.youtube.com/embed/p85x86vS3_0?hl=en&cc_lang_pref=en&cc_load_policy=1', // Dr. Andrew Weil 4-7-8
      am: 'https://www.youtube.com/embed/p85x86vS3_0?hl=am&cc_lang_pref=am&cc_load_policy=1',
      om: 'https://www.youtube.com/embed/p85x86vS3_0?hl=om&cc_lang_pref=om&cc_load_policy=1',
      ti: 'https://www.youtube.com/embed/p85x86vS3_0?hl=ti&cc_lang_pref=ti&cc_load_policy=1',
      so: 'https://www.youtube.com/embed/p85x86vS3_0?hl=so&cc_lang_pref=so&cc_load_policy=1',
      aa: 'https://www.youtube.com/embed/p85x86vS3_0?hl=en&cc_lang_pref=en&cc_load_policy=1',
    },
  },
  {
    id: 'meditation',
    icon: 'UserRound',
    label: { en: 'Meditation', am: 'ማሰተኛ', om: 'Tasgabbii', ti: 'ምኽንና', so: 'Muraaqabada', aa: 'Tas' },
    description: {
      en: 'Calm your mind',
      am: 'አእምሮዎን ያረጋጉ',
      om: 'Sammuu kee tasgabbeessi',
      ti: 'ኣእምሮኻ ኣረጋግእ',
      so: 'Maskaxdaada deji',
      aa: 'Tas'
    },
    audioDescription: {
      en: "A guided meditation session. Focus on your breath and release tension from your body.",
      am: "የሚመራ ማሰላሰል ክፍለ ጊዜ። በትነፋስዎ ላይ ያተኩሩ እና ከሰውነትዎ ውስጥ ውጥረትን ይልቀቁ።",
      om: "Sagantaa tasgabbii qajeelfama qabu. Hafuura kee irratti xiyyeeffadhu fi dhiphina qaama kee keessaa gadhiisi.",
      ti: "ዝምራሕ ናይ ምስትንታን ክፍለ ግዜ። ኣብ ትንፋስካ ኣተኩር፣ ካብ ሰብነትካ ድማ ወጥሪ ኣውጽእ።",
      so: "Kalfadhi muraaqabo oo la hagayo. Xoogga saar neefsashadaada oo iska saar walwalka jirkaaga.",
      aa: "Tas"
    },
    moods: ['anxious', 'sad', 'happy', 'calm', 'lonely'],
    videoUrls: {
      en: 'https://www.youtube.com/embed/ZToicre_JKU?hl=en&cc_lang_pref=en&cc_load_policy=1', // Headspace Guided Meditation
      am: 'https://www.youtube.com/embed/ZToicre_JKU?hl=am&cc_lang_pref=am&cc_load_policy=1',
      om: 'https://www.youtube.com/embed/ZToicre_JKU?hl=om&cc_lang_pref=om&cc_load_policy=1',
      ti: 'https://www.youtube.com/embed/ZToicre_JKU?hl=ti&cc_lang_pref=ti&cc_load_policy=1',
      so: 'https://www.youtube.com/embed/ZToicre_JKU?hl=so&cc_lang_pref=so&cc_load_policy=1',
      aa: 'https://www.youtube.com/embed/ZToicre_JKU?hl=en&cc_lang_pref=en&cc_load_policy=1',
    },
  },
  {
    id: 'gratitude',
    icon: 'Heart',
    label: { en: 'Gratitude', am: 'ምስጋና', om: 'Galata', ti: 'ምስጋና', so: 'Mahadnaq', aa: 'Gal' },
    description: {
      en: 'Think of 3 good things',
      am: '3 ጥሩ ነገሮችን ያስቡ',
      om: 'Waan gaarii 3 yaadi',
      ti: '3 ጽቡቕ ነገራት ሕሰብ',
      so: 'Ka fikir 3 waxyaabood oo wanaagsan',
      aa: 'Waa'
    },
    audioDescription: {
      en: "An animated video explaining how focusing on positive experiences can improve your mood.",
      am: "በአዎንታዊ ልምዶች ላይ ማተኮር ስሜትዎን እንዴት እንደሚያሻሽል የሚያብራራ አኒሜሽን ቪዲዮ።",
      om: "Viidiyoo fakkii sochii qabu kan akkamitti muuxannoo gaarii irratti xiyyeeffachuun miira kee fooyyessuu danda'u ibsu.",
      ti: "ኣብ ኣወንታዊ ተመክሮታት ምትኳር ከመይ ጌሩ ስምዒትካ ከመሓይሽ ከም ዝኽእል ዘረድእ ናይ ምስሊ ቪድዮ።",
      so: "Muuqaal animation ah oo sharraxaya sida xoogga saarista waayo-aragnimada wanaagsan ay u wanaajin karto niyaddaada.",
      aa: "Waa"
    },
    moods: ['happy', 'excited', 'calm'],
    videoUrls: {
      en: 'https://www.youtube.com/embed/WPPPFqsECz0?hl=en&cc_lang_pref=en&cc_load_policy=1', // Kurzgesagt Gratitude
      am: 'https://www.youtube.com/embed/WPPPFqsECz0?hl=am&cc_lang_pref=am&cc_load_policy=1',
      om: 'https://www.youtube.com/embed/WPPPFqsECz0?hl=om&cc_lang_pref=om&cc_load_policy=1',
      ti: 'https://www.youtube.com/embed/WPPPFqsECz0?hl=ti&cc_lang_pref=ti&cc_load_policy=1',
      so: 'https://www.youtube.com/embed/WPPPFqsECz0?hl=so&cc_lang_pref=so&cc_load_policy=1',
      aa: 'https://www.youtube.com/embed/WPPPFqsECz0?hl=en&cc_lang_pref=en&cc_load_policy=1',
    },
  },
  {
    id: 'grounding',
    icon: 'Activity',
    label: { en: 'Grounding', am: 'መረጋጋት', om: 'Tasgabbii', ti: 'መረጋጋት', so: 'Sugnaan', aa: 'Tas' },
    description: {
      en: 'Focus on your senses',
      am: 'በስሜቶችዎ ላይ ያተኩሩ',
      om: 'Miira kee irratti xiyyeeffadhu',
      ti: 'ኣብ ስምዒታትካ ኣተኩር',
      so: 'Xoogga saar dareenkaaga',
      aa: 'Mii'
    },
    audioDescription: {
      en: "A visual guide to the 5-4-3-2-1 grounding technique using your five senses.",
      am: "አምስቱን የስሜት ህዋሳትዎን በመጠቀም የ 5-4-3-2-1 የመረጋጋት ዘዴ የእይታ መመሪያ።",
      om: "Qajeelfama mul'ataa mala tasgabbii 5-4-3-2-1 miira kee shanan fayyadamuun.",
      ti: "ሓሙሽተ ስምዒታትካ ብምጥቃም ናይ 5-4-3-2-1 መረጋጋት ሜላ ናይ ምርኣይ መምርሒ።",
      so: "Hagid muuqaal ah oo loogu talagalay farsamada sugnaanta ee 5-4-3-2-1 iyadoo la isticmaalayo shantaada dareen.",
      aa: "Qaj"
    },
    moods: ['anxious', 'angry', 'stressed'],
    videoUrls: {
      en: 'https://www.youtube.com/embed/30VMIEmA114?hl=en&cc_lang_pref=en&cc_load_policy=1', // 5-4-3-2-1 Grounding
      am: 'https://www.youtube.com/embed/30VMIEmA114?hl=am&cc_lang_pref=am&cc_load_policy=1',
      om: 'https://www.youtube.com/embed/30VMIEmA114?hl=om&cc_lang_pref=om&cc_load_policy=1',
      ti: 'https://www.youtube.com/embed/30VMIEmA114?hl=ti&cc_lang_pref=ti&cc_load_policy=1',
      so: 'https://www.youtube.com/embed/30VMIEmA114?hl=so&cc_lang_pref=so&cc_load_policy=1',
      aa: 'https://www.youtube.com/embed/30VMIEmA114?hl=en&cc_lang_pref=en&cc_load_policy=1',
    },
  },
  {
    id: 'movement',
    icon: 'Zap',
    label: { en: 'Movement', am: 'እንቅስቃሴ', om: "Socho'uu", ti: 'ምንቅስቓስ', so: 'Dhaqdhaqaaq', aa: 'Soc' },
    description: {
      en: 'Stretch or walk',
      am: 'ይለጠጡ ወይም ይራመዱ',
      om: 'Dheebbannaa ykn deemuu',
      ti: 'ተወሳወሱ ወይ ተዛወሩ',
      so: 'Jimicsi ama soco',
      aa: 'Dhe'
    },
    audioDescription: {
      en: "A gentle yoga routine demonstrating simple stretches to wake up the body.",
      am: "ሰውነትን ለማነቃቃት ቀላል የመለጠጥ ልምምዶችን የሚያሳይ ለስላሳ የዮጋ ልምምድ።",
      om: "Sagantaa yoogaa lallaafaa kan qaama dammaqsuuf dheebbannaa salphaa agarsiisu.",
      ti: "ሰብነት ንምንቃሕ ቀለልቲ ናይ ምስሓብ ልምምዳት ዘርኢ ልስሉስ ናይ ዮጋ ልምምድ።",
      so: "Hab-raac yoga oo fudud oo muujinaya jimicsiyo kala bixin ah oo jirka lagu kiciyo.",
      aa: "Sag"
    },
    moods: ['sad', 'angry', 'tired', 'stressed', 'excited'],
    videoUrls: {
      en: 'https://www.youtube.com/embed/v7AYKMP6rOE?hl=en&cc_lang_pref=en&cc_load_policy=1', // Yoga With Adriene - 10 Min Morning Yoga
      am: 'https://www.youtube.com/embed/v7AYKMP6rOE?hl=am&cc_lang_pref=am&cc_load_policy=1',
      om: 'https://www.youtube.com/embed/v7AYKMP6rOE?hl=om&cc_lang_pref=om&cc_load_policy=1',
      ti: 'https://www.youtube.com/embed/v7AYKMP6rOE?hl=ti&cc_lang_pref=ti&cc_load_policy=1',
      so: 'https://www.youtube.com/embed/v7AYKMP6rOE?hl=so&cc_lang_pref=so&cc_load_policy=1',
      aa: 'https://www.youtube.com/embed/v7AYKMP6rOE?hl=en&cc_lang_pref=en&cc_load_policy=1',
    },
  },
  {
    id: 'journaling',
    icon: 'BookOpen',
    label: { en: 'Journaling', am: 'ማስታወሻ', om: 'Yaada Barreessuu', ti: 'መዘክር', so: 'Qoraal', aa: 'Bar' },
    description: {
      en: 'Write your thoughts',
      am: 'ሀሳብዎን ይፃፉ',
      om: 'Yaada kee barreessi',
      ti: 'ሓሳብካ ጽሓፍ',
      so: 'Qor fikiradaada',
      aa: 'Bar'
    },
    audioDescription: {
      en: "A video showing journaling techniques to process emotions and gain self-awareness.",
      am: "ስሜቶችን ለመቆጣጠር እና ራስን ለማወቅ የሚረዱ የማስታወሻ አጻጻፍ ዘዴዎችን የሚያሳይ ቪዲዮ።",
      om: "Viidiyoo mala yaada barreessuu kan miira keessummeessuufi of baruuf gargaaru agarsiisu.",
      ti: "ስምዒታት ንምቁጽጻርን ርእስኻ ንምፍላጥን ዝሕግዙ ናይ መዘክር ኣጸሓሕፋ ሜላታት ዘርኢ ቪድዮ።",
      so: "Muuqaal muujinaya farsamooyinka qoraalka si loo farsameeyo dareenka loona helo is-baraarujin.",
      aa: "Bar"
    },
    moods: ['sad', 'happy', 'lonely', 'stressed', 'excited'],
    videoUrls: {
      en: 'https://www.youtube.com/embed/6S2vNfGv_u8?hl=en&cc_lang_pref=en&cc_load_policy=1', // The Science of Journaling
      am: 'https://www.youtube.com/embed/6S2vNfGv_u8?hl=am&cc_lang_pref=am&cc_load_policy=1',
      om: 'https://www.youtube.com/embed/6S2vNfGv_u8?hl=om&cc_lang_pref=om&cc_load_policy=1',
      ti: 'https://www.youtube.com/embed/6S2vNfGv_u8?hl=ti&cc_lang_pref=ti&cc_load_policy=1',
      so: 'https://www.youtube.com/embed/6S2vNfGv_u8?hl=so&cc_lang_pref=so&cc_load_policy=1',
      aa: 'https://www.youtube.com/embed/6S2vNfGv_u8?hl=en&cc_lang_pref=en&cc_load_policy=1',
    },
  },
  {
    id: 'body-scan',
    icon: 'User',
    label: { en: 'Body Scan', am: 'የሰውነት ቅኝት', om: 'Qaama Ilaaluu', ti: 'ናይ ሰብነት ቅኝት', so: 'Baaritaanka Jirka', aa: 'Qaa' },
    description: { en: 'Relax your body', am: 'ሰውነትዎን ያዝናኑ', om: 'Qaama kee boqochiisi', ti: 'ሰብነትካ ኣዘናግዕ', so: 'Jirkaaga deji', aa: 'Qaa' },
    audioDescription: { 
      en: 'A guided body scan to release tension.', 
      am: 'ውጥረትን ለመቀነስ የሚረዳ የሰውነት ቅኝት።', 
      om: "Dhiphina hir'isuuf qaama ilaaluu.", 
      ti: 'ወጥሪ ንምንካይ ዝሕግዝ ናይ ሰብነት ቅኝት።', 
      so: 'Baaritaan jirka ah oo la hagayo si loo yareeyo walwalka.',
      aa: 'Qaa'
    },
    moods: ['anxious', 'sad', 'tired', 'calm'],
    videoUrls: {
      en: 'https://www.youtube.com/embed/15q-N-_kkrU?hl=en&cc_lang_pref=en&cc_load_policy=1',
      am: 'https://www.youtube.com/embed/15q-N-_kkrU?hl=am&cc_lang_pref=am&cc_load_policy=1',
      om: 'https://www.youtube.com/embed/15q-N-_kkrU?hl=om&cc_lang_pref=om&cc_load_policy=1',
      ti: 'https://www.youtube.com/embed/15q-N-_kkrU?hl=ti&cc_lang_pref=ti&cc_load_policy=1',
      so: 'https://www.youtube.com/embed/15q-N-_kkrU?hl=so&cc_lang_pref=so&cc_load_policy=1',
      aa: 'https://www.youtube.com/embed/15q-N-_kkrU?hl=en&cc_lang_pref=en&cc_load_policy=1',
    },
  },
  {
    id: 'muscle-relaxation',
    icon: 'Activity',
    label: { en: 'Muscle Relaxation', am: 'የጡንቻ መዝናናት', om: 'Maashii Boqochiisuu', ti: 'ናይ ጭዋዳ መዘናግዒ', so: 'Nasteexada Muruqyada', aa: 'Maa' },
    description: { en: 'Release physical stress', am: 'አካላዊ ውጥረትን ይልቀቁ', om: 'Dhiphina qaamaa gadhiisi', ti: 'ኣካላዊ ወጥሪ ኣውጽእ', so: 'Iska saar walwalka jirka', aa: 'Dhi' },
    audioDescription: { 
      en: 'Progressive muscle relaxation technique.', 
      am: 'ተከታታይ የጡንቻ መዝናኛ ዘዴ።', 
      om: 'Mala maashii boqochiisuu.', 
      ti: 'ተኸታታሊ ናይ ጭዋዳ መዘናግዒ ሜላ።', 
      so: 'Farsamada nasteexada muruqyada ee tartiib-tartiibka ah.',
      aa: 'Mal'
    },
    moods: ['angry', 'anxious', 'stressed'],
    videoUrls: {
      en: 'https://www.youtube.com/embed/ClqPtWzozXs?hl=en&cc_lang_pref=en&cc_load_policy=1',
      am: 'https://www.youtube.com/embed/ClqPtWzozXs?hl=am&cc_lang_pref=am&cc_load_policy=1',
      om: 'https://www.youtube.com/embed/ClqPtWzozXs?hl=om&cc_lang_pref=om&cc_load_policy=1',
      ti: 'https://www.youtube.com/embed/ClqPtWzozXs?hl=ti&cc_lang_pref=ti&cc_load_policy=1',
      so: 'https://www.youtube.com/embed/ClqPtWzozXs?hl=so&cc_lang_pref=so&cc_load_policy=1',
      aa: 'https://www.youtube.com/embed/ClqPtWzozXs?hl=en&cc_lang_pref=en&cc_load_policy=1',
    },
  },
  {
    id: 'self-compassion',
    icon: 'Heart',
    label: { en: 'Self-Compassion', am: 'ለራስ ርህራሄ', om: 'Ofiif Naatoo', ti: 'ንርእስኻ ምድንጋጽ', so: 'Is-u-naxariisashada', aa: 'Ofi' },
    description: { en: 'Be kind to yourself', am: 'ለራስዎ ደግ ይሁኑ', om: "Ofiif gaarii ta'i", ti: 'ንርእስኻ ሕያዋይ ኩን', so: 'Naftaada u naxariiso', aa: 'Ofi' },
    audioDescription: { 
      en: 'A video about being kind to yourself during hard times.', 
      am: 'በአስቸጋሪ ጊዜያት ለራስዎ ደግ መሆንን የሚያሳይ ቪዲዮ።', 
      om: "Viidiyoo yeroo rakkisaa ofiif gaarii ta'uu barsiisu.", 
      ti: 'ኣብ ግዜ ጸገም ንርእስኻ ሕያዋይ ምዃን ዘርኢ ቪድዮ።', 
      so: 'Muuqaal ku saabsan inaad naftaada u naxariisato xilliyada adag.',
      aa: 'Vii'
    },
    moods: ['sad', 'angry', 'lonely', 'stressed', 'anxious'],
    videoUrls: {
      en: 'https://www.youtube.com/embed/IvtZBUSplr4?hl=en&cc_lang_pref=en&cc_load_policy=1',
      am: 'https://www.youtube.com/embed/IvtZBUSplr4?hl=am&cc_lang_pref=am&cc_load_policy=1',
      om: 'https://www.youtube.com/embed/IvtZBUSplr4?hl=om&cc_lang_pref=om&cc_load_policy=1',
      ti: 'https://www.youtube.com/embed/IvtZBUSplr4?hl=ti&cc_lang_pref=ti&cc_load_policy=1',
      so: 'https://www.youtube.com/embed/IvtZBUSplr4?hl=so&cc_lang_pref=so&cc_load_policy=1',
      aa: 'https://www.youtube.com/embed/IvtZBUSplr4?hl=en&cc_lang_pref=en&cc_load_policy=1',
    },
  },
  {
    id: 'affirmations',
    icon: 'Sparkles',
    label: { en: 'Affirmations', am: 'አዎንታዊ ንግግሮች', om: 'Yaada Gaarii', ti: 'ኣወንታዊ ዘረባታት', so: 'Xaqiijinta', aa: 'Yaa' },
    description: { en: 'Positive self-talk', am: 'አዎንታዊ የራስ ንግግር', om: 'Ofiin dubbachuu gaarii', ti: 'ኣወንታዊ ናይ ውሽጢ ዘረባ', so: 'Is-u-hadalka wanaagsan', aa: 'Ofi' },
    audioDescription: {
      en: 'Daily positive affirmations to boost your confidence and mood.',
      am: 'በራስ መተማመንዎን እና ስሜትዎን ለማሳደግ ዕለታዊ አዎንታዊ ንግግሮች።',
      om: 'Ofitti amanamummaa fi miira kee guddisuuf yaada gaarii guyyaa guyyaa.',
      ti: 'ምትእምማንካን ስምዒትካን ንምዕባይ ዝሕግዙ ዕለታዊ ኣወንታዊ ዘረባታት።',
      so: 'Xaqiijinta wanaagsan ee maalinlaha ah si kor loogu qaado kalsoonidaada iyo niyaddaada.',
      aa: 'Ofi'
    },
    moods: ['happy', 'excited', 'calm', 'lonely', 'sad'],
    videoUrls: {
      en: 'https://www.youtube.com/embed/ZogXn3-D_5A?hl=en&cc_lang_pref=en&cc_load_policy=1',
      am: 'https://www.youtube.com/embed/ZogXn3-D_5A?hl=am&cc_lang_pref=am&cc_load_policy=1',
      om: 'https://www.youtube.com/embed/ZogXn3-D_5A?hl=om&cc_lang_pref=om&cc_load_policy=1',
      ti: 'https://www.youtube.com/embed/ZogXn3-D_5A?hl=ti&cc_lang_pref=ti&cc_load_policy=1',
      so: 'https://www.youtube.com/embed/ZogXn3-D_5A?hl=so&cc_lang_pref=so&cc_load_policy=1',
      aa: 'https://www.youtube.com/embed/ZogXn3-D_5A?hl=en&cc_lang_pref=en&cc_load_policy=1',
    },
  },
  {
    id: 'nature-sounds',
    icon: 'CloudRain',
    label: { en: 'Nature Sounds', am: 'የተፈጥሮ ድምፆች', om: 'Sagalee Uumamaa', ti: 'ናይ ተፈጥሮ ድምጽታት', so: 'Dhawaaqa Dabeecadda', aa: 'Sag' },
    description: { en: 'Relaxing ambient audio', am: 'ዘና የሚያደርግ ድምፅ', om: 'Sagalee boqochiisu', ti: 'ዘና ዘብል ድምጽታት', so: 'Maqal dejiya', aa: 'Sag' },
    audioDescription: {
      en: 'Immerse yourself in calming nature sounds to reduce stress.',
      am: 'ውጥረትን ለመቀነስ እራስዎን በሚያረጋጋ የተፈጥሮ ድምፆች ውስጥ ያጥለቅልቁ።',
      om: 'Dhiphina hir\'isuuf sagalee uumamaa tasgabbii qabu keessa of lallaafisi.',
      ti: 'ወጥሪ ንምንካይ ኣብ ዘረጋግኡ ናይ ተፈጥሮ ድምጽታት ጥሓል ።',
      so: 'Naftaada geli dhawaaqyada dabeecadda ee dejinaya si aad u yareyso walwalka.',
      aa: 'Sag'
    },
    moods: ['stressed', 'anxious', 'tired', 'calm'],
    videoUrls: {
      en: 'https://www.youtube.com/embed/eKFTSSKCzWA?hl=en&cc_lang_pref=en&cc_load_policy=1',
      am: 'https://www.youtube.com/embed/eKFTSSKCzWA?hl=am&cc_lang_pref=am&cc_load_policy=1',
      om: 'https://www.youtube.com/embed/eKFTSSKCzWA?hl=om&cc_lang_pref=om&cc_load_policy=1',
      ti: 'https://www.youtube.com/embed/eKFTSSKCzWA?hl=ti&cc_lang_pref=ti&cc_load_policy=1',
      so: 'https://www.youtube.com/embed/eKFTSSKCzWA?hl=so&cc_lang_pref=so&cc_load_policy=1',
      aa: 'https://www.youtube.com/embed/eKFTSSKCzWA?hl=en&cc_lang_pref=en&cc_load_policy=1',
    },
  },
  {
    id: 'sleep-hygiene',
    icon: 'Moon',
    label: { en: 'Sleep Tips', am: 'የእንቅልፍ ምክሮች', om: 'Gorsa Hirribaa', ti: 'ናይ ድቃስ ምኽሪ', so: 'Talooyinka Hurdada', aa: 'Gor' },
    description: { en: 'Better rest habits', am: 'የተሻለ የእንቅልፍ ልምዶች', om: 'Hafata hirribaa gaarii', ti: 'ዝበለጸ ናይ ድቃስ ልምዲ', so: 'Caadooyinka nasashada ee wanaagsan', aa: 'Haf' },
    audioDescription: {
      en: 'Learn essential tips for better sleep quality and relaxation.',
      am: 'ለተሻለ የእንቅልፍ ጥራት and መዝናናት አስፈላጊ ምክሮችን ይማሩ።',
      om: 'Qulqullina hirribaa fi boqonnaa gaariif gorsa barbaachisoo baradhu.',
      ti: 'ንዝበለጸ ጽሬት ድቃስን መዘናግዕን ዝሕግዙ ኣገደስቲ ምኽርታት ተማሃር።',
      so: 'Baro talooyin muhiim ah oo loogu talagalay tayada hurdada iyo nasashada wanaagsan.',
      aa: 'Qul'
    },
    moods: ['tired', 'stressed'],
    videoUrls: {
      en: 'https://www.youtube.com/embed/nm1TxQj9IsQ?hl=en&cc_lang_pref=en&cc_load_policy=1',
      am: 'https://www.youtube.com/embed/nm1TxQj9IsQ?hl=am&cc_lang_pref=am&cc_load_policy=1',
      om: 'https://www.youtube.com/embed/nm1TxQj9IsQ?hl=om&cc_lang_pref=om&cc_load_policy=1',
      ti: 'https://www.youtube.com/embed/nm1TxQj9IsQ?hl=ti&cc_lang_pref=ti&cc_load_policy=1',
      so: 'https://www.youtube.com/embed/nm1TxQj9IsQ?hl=so&cc_lang_pref=so&cc_load_policy=1',
      aa: 'https://www.youtube.com/embed/nm1TxQj9IsQ?hl=en&cc_lang_pref=en&cc_load_policy=1',
    },
  },
  {
    id: 'digital-detox',
    icon: 'Smartphone',
    label: { en: 'Digital Detox', am: 'ዲጂታል እረፍት', om: 'Boqonnaa Diijitaalaa', ti: 'ዲጂታል ዕረፍቲ', so: 'Nasashada Dijital ah', aa: 'Boq' },
    description: { en: 'Reduce screen time', am: 'የስክሪን ጊዜን ይቀንሱ', om: 'Yeroo isክሪን hir\'isi', ti: 'ናይ ስክሪን ግዜ ቀንስ', so: 'Yaree wakhtiga shaashadda', aa: 'Yer' },
    audioDescription: {
      en: 'Tips for reducing digital stress and finding balance in a connected world.',
      am: 'ዲጂታል ውጥረትን ለመቀነስ እና በተገናኘ ዓለም ውስጥ ሚዛንን ለማግኘት የሚረዱ ምክሮች።',
      om: 'Dhiphina diijitaalaa hir\'isuu fi addunyaa walitti hidhame keessatti madaallii argachuuf gorsa.',
      ti: 'ዲጂታል ወጥሪ ንምንካይን ኣብ ዝተኣሳሰረ ዓለም ሚዛን ንምርካብን ዝሕግዙ ምኽርታት።',
      so: 'Talooyin ku saabsan yaraynta walwalka dhijital ah iyo helitaanka dheelitirka adduunka ku xiran.',
      aa: 'Dhi'
    },
    moods: ['stressed', 'tired', 'anxious'],
    videoUrls: {
      en: 'https://www.youtube.com/embed/HffWFd_6bJ0?hl=en&cc_lang_pref=en&cc_load_policy=1',
      am: 'https://www.youtube.com/embed/HffWFd_6bJ0?hl=am&cc_lang_pref=am&cc_load_policy=1',
      om: 'https://www.youtube.com/embed/HffWFd_6bJ0?hl=om&cc_lang_pref=om&cc_load_policy=1',
      ti: 'https://www.youtube.com/embed/HffWFd_6bJ0?hl=ti&cc_lang_pref=ti&cc_load_policy=1',
      so: 'https://www.youtube.com/embed/HffWFd_6bJ0?hl=so&cc_lang_pref=so&cc_load_policy=1',
      aa: 'https://www.youtube.com/embed/HffWFd_6bJ0?hl=en&cc_lang_pref=en&cc_load_policy=1',
    },
  },
  {
    id: 'hydration',
    icon: 'Droplets',
    label: { en: 'Hydration', am: 'ውሃ መጠጣት', om: 'Bishaan Dhuguu', ti: 'ማይ ምስታይ', so: 'Cabitaanka Biyaha', aa: 'Bis' },
    description: { en: 'Drink more water', am: 'ብዙ ውሃ ይጠጡ', om: 'Bishaan baay\'ee dhugi', ti: 'ብዙሕ ማይ ስተ', so: 'Cab biyo badan', aa: 'Bis' },
    audioDescription: {
      en: 'The importance of staying hydrated for physical and mental well-being.',
      am: 'ለአካላዊ እና አእምሮአዊ ደህንነት ውሃ መጠጣት ያለው ጠቀሜታ።',
      om: 'Fayyaa qaamaa fi sammuutiif bishaan dhuguun barbaachisummaa isaa.',
      ti: 'ንኣካላዊን ኣእምሮኣዊን ጥዕና ማይ ምስታይ ዘለዎ ኣገዳስነት።',
      so: 'Muhiimadda ay leedahay in la cabbo biyo ku filan caafimaadka jirka iyo maskaxda.',
      aa: 'Fay'
    },
    moods: ['tired', 'calm', 'happy'],
    videoUrls: {
      en: 'https://www.youtube.com/embed/9iMGFqMmUFs?hl=en&cc_lang_pref=en&cc_load_policy=1',
      am: 'https://www.youtube.com/embed/9iMGFqMmUFs?hl=am&cc_lang_pref=am&cc_load_policy=1',
      om: 'https://www.youtube.com/embed/9iMGFqMmUFs?hl=om&cc_lang_pref=om&cc_load_policy=1',
      ti: 'https://www.youtube.com/embed/9iMGFqMmUFs?hl=ti&cc_lang_pref=ti&cc_load_policy=1',
      so: 'https://www.youtube.com/embed/9iMGFqMmUFs?hl=so&cc_lang_pref=so&cc_load_policy=1',
      aa: 'https://www.youtube.com/embed/9iMGFqMmUFs?hl=en&cc_lang_pref=en&cc_load_policy=1',
    },
  },
];

export const RESOURCES: Resource[] = [
  {
    id: 'counselor',
    icon: 'UserPlus',
    label: { en: 'Counselor', am: 'ምክር', om: 'Gorsa', ti: 'ምክር', so: 'Lataliye', aa: 'Gor' },
    type: 'call',
    value: '8282',
  },
  {
    id: 'ngo',
    icon: 'Building2',
    label: { en: 'Office', am: 'ቢሮ', om: 'Waajjira', ti: 'ቢሮ', so: 'Xafiiska', aa: 'Waa' },
    type: 'office',
    value: 'Addis Ababa, Bole',
  },
  {
    id: 'emergency',
    icon: 'PhoneCall',
    label: { en: 'Call', am: 'ስልክ', om: 'Bilbilaa', ti: 'ስልኪ', so: 'Wac', aa: 'Bil' },
    type: 'call',
    value: '911',
  },
];

export const HEALTH_CENTERS: HealthCenter[] = [
  {
    id: 'black-lion',
    name: { en: 'Black Lion Hospital', am: 'ጥቁር አንበሳ ሆስፒታል', om: 'Hospitaala Tikur Anbassaa', ti: 'ጥቁር ኣንበሳ ሆስፒታል', so: 'Cisbitaalka Libaaxa Madow', aa: 'Bla' },
    dist: '1.2 km',
    phone: '912',
    lat: 9.0205,
    lng: 38.7485,
    hours: { en: '24/7 Emergency', am: '24/7 ድንገተኛ አደጋ', om: '24/7 Balaa ariifachiisaa', ti: '24/7 ሓደጋ', so: '24/7 Gurmadka', aa: '24/7' },
    services: { 
      en: 'Comprehensive psychiatric care, emergency mental health services, and inpatient treatment.',
      am: 'ሁለንተናዊ የስነ-አእምሮ ህክምና፣ የአደጋ ጊዜ የአእምሮ ጤና አገልግሎቶች እና የተኝቶ ህክምና።',
      om: 'Tajaajila yaala sammuu guutuu, tajaajila fayyaa sammuu ariifachiisaa fi yaala ciisichaa.',
      ti: 'ምሉእ ናይ ስነ-ኣእምሮ ክንክን፣ ናይ ሓደጋ ግዜ ኣእምሮኣዊ ጥዕና ኣገልግሎታትን ናይ ደቂሰ መርመራን።',
      so: 'Daryeelka dhimirka oo dhammaystiran, adeegyada caafimaadka dhimirka ee degdegga ah, iyo daaweynta isbitaalka dhexdiisa ah.',
      aa: 'Taa'
    }
  },
  {
    id: 'st-paul',
    name: { en: 'St. Paul Hospital', am: 'ቅዱስ ጳውሎስ ሆስፒታል', om: 'Hospitaala Qulqulluu Phaawuloos', ti: 'ቅዱስ ጳውሎስ ሆስፒታል', so: 'Cisbitaalka St. Paul', aa: 'St.' },
    dist: '3.5 km',
    phone: '912',
    lat: 9.0494,
    lng: 38.7297,
    hours: { en: 'Mon-Fri: 8AM-5PM, 24/7 Emergency', am: 'ሰኞ-አርብ፡ 2AM-11PM፣ 24/7 ድንገተኛ አደጋ', om: 'Wiixata-Jimaata: 8AM-5PM, 24/7 Balaa ariifachiisaa', ti: 'ሰኑይ-ዓርቢ: 8AM-5PM, 24/7 ሓደጋ', so: 'Isniin-Jimce: 8AM-5PM, 24/7 Gurmadka', aa: 'Mon' },
    services: {
      en: 'Outpatient counseling, addiction recovery support, and community mental health programs.',
      am: 'የውጭ ታካሚ ምክር፣ ከሱስ ማገገሚያ ድጋፍ እና የማህበረሰብ የአእምሮ ጤና ፕሮግራሞች።',
      om: 'Gorsa dhuunfaa, gargaarsa araada irraa deebi\'uu fi sagantaalee fayyaa sammuu hawaasaa.',
      ti: 'ናይ ወጻኢ ሕሙማት ምኽሪ፣ ካብ ወልፊ ናይ ምሕዋይ ሓገዝን ናይ ማሕበረሰብ ኣእምሮኣዊ ጥዕና መደባትን።',
      so: 'La-talinta bukaan-socodka, taageerada ka soo kabashada qabatinka, iyo barnaamijyada caafimaadka dhimirka ee bulshada.',
      aa: 'Out'
    }
  },
  {
    id: 'zewditu',
    name: { en: 'Zewditu Memorial', am: 'ዘውዲቱ መታሰቢያ ሆስፒታል', om: 'Hospitaala Yaadannoo Zawdiituu', ti: 'ዘውዲቱ መዘከር ሆስፒታል', so: 'Cisbitaalka Zewditu', aa: 'Zew' },
    dist: '2.1 km',
    phone: '912',
    lat: 9.0182,
    lng: 38.7619,
    hours: { en: '24/7 Emergency', am: '24/7 ድንገተኛ አደጋ', om: '24/7 Balaa ariifachiisaa', ti: '24/7 ሓደጋ', so: '24/7 Gurmadka', aa: '24/7' },
    services: {
      en: 'Maternal mental health, stress management workshops, and general psychiatric consultation.',
      am: 'የእናቶች የአእምሮ ጤና፣ የውጥረት አስተዳደር ወርክሾፖች እና አጠቃላይ የስነ-አእምሮ ምክክር።',
      om: 'Fayyaa sammuu haadholii, leenjii dhiphina to\'achuu fi gorsa yaala sammuu waliigalaa.',
      ti: 'ናይ ኣዴታት ኣእምሮኣዊ ጥዕና፣ ናይ ወጥሪ ኣተሓሕዛ ስልጠናታትን ሓፈሻዊ ናይ ስነ-ኣእምሮ ምኽክርን።',
      so: 'Caafimaadka dhimirka ee hooyada, aqoon-is-weydaarsiyada maaraynta walwalka, iyo la-talinta dhimirka ee guud.',
      aa: 'Mat'
    }
  }
];

export interface PsychosocialSupport {
  id: string;
  icon: string;
  title: Translation;
  description: Translation;
  guidance: Translation[];
  color: string;
}

export const PSYCHOSOCIAL_SUPPORT: PsychosocialSupport[] = [
  {
    id: 'gbv-support',
    icon: 'ShieldAlert',
    title: { 
      en: 'GBV Support', 
      am: 'የጾታ ጥቃት ድጋፍ', 
      om: 'Deggersa GBV', 
      ti: 'ደገፍ ጾታዊ መጥቃዕቲ', 
      so: 'Taageerada GBV', 
      aa: 'GBV Support' 
    },
    description: { 
      en: 'Specialized support for Gender-Based Violence survivors.', 
      am: 'ለጾታ ጥቃት ተጎጂዎች ልዩ ድጋፍ።', 
      om: 'Miidhamtoota GBV-f deggersa addaa.', 
      ti: 'ንተጎዳእቲ ጾታዊ መጥቃዕቲ ፍሉይ ደገፍ።', 
      so: 'Taageero gaar ah oo loogu talagalay badbaadayaasha GBV.', 
      aa: 'GBV survivors support' 
    },
    guidance: [
      { en: 'Ensure your immediate physical safety.', am: 'አፋጣኝ የግል ደህንነትዎን ያረጋግጡ።', om: 'Nageenya kee mirkaneessi.', ti: 'ቅልጡፍ ውሕስነትካ ኣረጋግፅ።', so: 'Hubi badbaadadaada jireed.', aa: 'Safety first' },
      { en: 'Seek medical attention if needed.', am: 'አስፈላጊ ከሆነ የሕክምና እርዳታ ያግኙ።', om: 'Yaala fayyaa barbaadi.', ti: 'ሕክምናዊ ደገፍ ረኸብ።', so: 'Raadi daryeel caafimaad.', aa: 'Medical help' },
      { en: 'Connect with a specialized counselor.', am: 'ከባለሙያ አማካሪ ጋር ይገናኙ።', om: 'Gorsaa addaa quunnami.', ti: 'ምስ ፍሉይ ኣማኻሪ ተራኸብ።', so: 'La xiriir lataliye khabiir ah.', aa: 'Counseling' }
    ],
    color: 'bg-rose-500'
  },
  {
    id: 'trauma-natural',
    icon: 'CloudLightning',
    title: { 
      en: 'Natural Crisis Trauma', 
      am: 'የተፈጥሮ አደጋ ጉዳት', 
      om: 'Miidhaa Balaa Uumamaa', 
      ti: 'ጉድኣት ሓደጋ ተፈጥሮ', 
      so: 'Dhibaatada Musiibada', 
      aa: 'Natural Crisis Trauma' 
    },
    description: { 
      en: 'Support for trauma following natural disasters (floods, drought).', 
      am: 'ከተፈጥሮ አደጋዎች (ጎርፍ፣ ድርቅ) በኋላ የሚሰጥ የጉዳት ድጋፍ።', 
      om: 'Balaa uumamaa booda gargaarsa sammuu.', 
      ti: 'ድሕሪ ሓደጋ ተፈጥሮ (ውሕጅ፣ ድርቂ) ዝወሃብ ናይ ሕልና ደገፍ።', 
      so: 'Taageerada dhibaatada ka dib musiibooyinka dabiiciga ah.', 
      aa: 'Natural crisis support' 
    },
    guidance: [
      { en: 'Find a stable and safe shelter.', am: 'የተረጋጋ እና አስተማማኝ መጠለያ ይፈልጉ።', om: 'Bakka jireenyaa nagaa barbaadi.', ti: 'ውሑስ መዕቆቢ ረኸብ።', so: 'Hel hoy nabdoon.', aa: 'Shelter' },
      { en: 'Practice grounding breathing exercises.', am: 'የመረጋጋት የትንፋሽ ልምምዶችን ያድርጉ።', om: 'Gilgaala afuura baafachuu hojjadhu.', ti: 'ናይ ምስትንፋስ ልምምድ ግበር።', so: 'Samee jimicsiga neefsashada.', aa: 'Grounding' },
      { en: 'Stay connected with family or community.', am: 'ከቤተሰብ ወይም ከማህበረሰቡ ጋር ግንኙነት ይኑርዎት።', om: 'Maatii fi hawaasa wajjin wal quunnami.', ti: 'ምስ ስድራቤት ዝምድና ሃልኻ።', so: 'La joog qoyska ama bulshada.', aa: 'Community' }
    ],
    color: 'bg-amber-500'
  },
  {
    id: 'trauma-manmade',
    icon: 'Flame',
    title: { 
      en: 'Man-made Crisis Support', 
      am: 'ሰው ሰራሽ አደጋ ድጋፍ', 
      om: 'Gargaarsa Balaa Namaan Dhufu', 
      ti: 'ደገፍ ሰው ዝሰርሖ ሓደጋ', 
      so: 'Taageerada Gurmadka Dadku Sababo', 
      aa: 'Man-made Crisis Support' 
    },
    description: { 
      en: 'Support for conflict, displacement, and man-made emergencies.', 
      am: 'ለግጭት፣ ለመፈናቀል እና ለሰው ሰራሽ ድንገተኛ አደጋዎች ድጋፍ።', 
      om: 'Waraana, buqqa\'iinsaa fi balaa namaan dhufuuf gargaarsa.', 
      ti: 'ንግብጭት፣ ምፍንቓልን ብሰብ ዝመጽእ ሓደጋታትን ዝወሃብ ደገፍ።', 
      so: 'Taageerada colaadaha, barakaca, iyo xaaladaha degdegga ah ee dadku sameeyaan.', 
      aa: 'Man-made crisis support' 
    },
    guidance: [
      { en: 'Identify your immediate safe humanitarian zones.', am: 'አቅራቢያ ያሉ አስተማማኝ የሰብአዊ ድጋፍ ቀጠናዎችን ይለዩ።', om: 'Bakka gargaarsa namoomaa dhihoo addaan baafadhu.', ti: 'ናይ ሰብኣዊ ሓገዝ ቦታታት ኣለሊ።', so: 'Aqoonso aagagga gargaarka bini\'aadantinimo.', aa: 'Safe Zones' },
      { en: 'Acknowledge your emotions as normal reactions.', am: 'ስሜቶችዎ ተፈጥሯዊ ምላሾች መሆናቸውን ይገንዘቡ።', om: 'Miirri kee waan uumamaa ta\'uun bari.', ti: 'ስምዒታትካ ንቡር ምዃኑ ተረዳእ።', so: 'Aqoonso in dhibaatadu tahay falcelin caadi ah.', aa: 'Validation' },
      { en: 'Seek legal or displacement assistance.', am: 'የሕግ ወይም የመፈናቀል ድጋፍ ያግኙ።', om: 'Gargaarsa seeraa ykn buqqa\'iinsaa barbaadi.', ti: 'ሕጋዊ ደገፍ ሓትት።', so: 'Raadi gargaar sharci ama barakac.', aa: 'Assistance' }
    ],
    color: 'bg-orange-600'
  }
];

export const COUNSELORS = [
  { id: '1', name: 'Dr. Abebe Bekele', phone: '+251911223344', specialty: 'Anxiety & Stress', language: ['en', 'am'] },
  { id: '2', name: 'Dr. Martha Tadesse', phone: '+251922334455', specialty: 'Depression', language: ['en', 'am', 'om'] },
  { id: '3', name: 'Counselor Yusuf', phone: '+251933445566', specialty: 'Family Support', language: ['en', 'so'] },
  { id: '4', name: 'Dr. Selamawit', phone: '+251944556677', specialty: 'Trauma', language: ['en', 'ti'] },
];

export const DAILY_AFFIRMATIONS: Translation[] = [
  {
    en: "You are stronger than you think.",
    am: "ከምታስበው በላይ ጠንካራ ነህ።",
    om: "Waan yaaddu caalaa jabaadha.",
    ti: "ካብቲ እትሓስቦ ንላዕሊ ሓያል ኢኻ።",
    so: "Waad ka xoog badan tahay sida aad u malaynayso.",
    aa: "Wali"
  },
  {
    en: "Take it one breath at a time.",
    am: "በአንድ ጊዜ አንድ ትንፋሽ ይውሰዱ።",
    om: "Yeroo tokkotti hafuura tokko fudhadhu.",
    ti: "ኣብ ሓደ ግዜ ሓደ ትንፋስ ውሰድ።",
    so: "Hal mar neef qaado.",
    aa: "Haf"
  },
  {
    en: "It's okay to not be okay.",
    am: "ደህና አለመሆን ችግር የለውም።",
    om: "Gaarii ta'uu dhiisuun rakkoo hin qabu.",
    ti: "ጽቡቕ ዘይምዃን ጸገም የብሉን።",
    so: "Waa caadi inaan la fiicnayn.",
    aa: "Kax"
  }
];

export const UI_LABELS: Record<string, Translation> = {
  welcome: { en: 'Welcome', am: 'እንኳን ደህና መጡ', om: 'Baga nagaan dhuftan', ti: 'እንኳዕ ብደሓን መጻእኩም', so: 'Ku soo dhawaada', aa: 'Baga' },
  getStarted: { en: 'Get Started', am: 'ይጀምሩ', om: 'Eegali', ti: 'ጀምር', so: 'Bilow', aa: 'Eeg' },
  howFeel: { en: 'How do you feel?', am: 'ምን ይሰማዎታል?', om: 'Maaltu sitti dhaga\'ama?', ti: 'እንታይ ይስመዓካ ኣሎ?', so: 'Sidee ayaad dareemaysaa?', aa: 'Sidee' },
  emergency: { en: 'Emergency', am: 'አደጋ', om: 'Bala', ti: 'ሓደጋ', so: 'Gurmad', aa: 'Bala' },
  callCounselor: { en: 'Call Counselor', am: 'አማካሪ ይደውሉ', om: 'Gorsaa bilbili', ti: 'ኣማኻሪ ደውል', so: 'Wac Lataliyaha', aa: 'Wac' },
  callEmergency: { en: 'Call Emergency', am: 'አምቡላንስ ይደውሉ', om: 'Ambuulaansii bilbili', ti: 'ኣምቡላንስ ደውል', so: 'Wac Gurmadka', aa: 'Wac' },
  healthCenter: { en: 'Health Center', am: 'ጤና ጣቢያ', om: 'Buufata Fayyaa', ti: 'መደበር ጥዕና', so: 'Xarunta Caafimaadka', aa: 'Xar' },
  shelter: { en: 'Shelter', am: 'መሸጋገሪያ', om: 'Bakka Boqonnaa', ti: 'መዕቆቢ', so: 'Hoyga', aa: 'Hoy' },
  safeSpace: { en: 'Safe Space', am: 'ደህንነት', om: 'Nageenya', ti: 'ውሕስነት', so: 'Goob Nabdoon', aa: 'Nab' },
  back: { en: 'Back', am: 'ተመለስ', om: 'Deebi\'i', ti: 'ተመለስ', so: 'Dib u noqo', aa: 'Dib' },
  dashboard: { en: 'Dashboard', am: 'ዳሽቦርድ', om: 'Dhashboordii', ti: 'ዳሽቦርድ', so: 'Dashboard-ka', aa: 'Dash' },
  settings: { en: 'Settings', am: 'ቅንብሮች', om: 'Sajataa', ti: 'ቅጥታት', so: 'Settings-ka', aa: 'Set' },
  voiceGuidance: { en: 'Voice Guidance', am: 'የድምፅ መመሪያ', om: 'Qajeelfama Sagalee', ti: 'መምርሒ ድምጺ', so: 'Hagidda Codka', aa: 'Hag' },
  fontSize: { en: 'Font Size', am: 'የፊደል መጠን', om: 'Hamma qubee', ti: 'ዓቐን ፊደል', so: 'Cabbirka Farta', aa: 'Cab' },
  small: { en: 'Small', am: 'ትንሽ', om: 'Xiqqaa', ti: 'ንእሽቶ', so: 'Yariis', aa: 'Yar' },
  normal: { en: 'Normal', am: 'መደበኛ', om: 'Idilee', ti: 'ንቡር', so: 'Caadi', aa: 'Caa' },
  large: { en: 'Large', am: 'ትልቅ', om: 'Guddaa', ti: 'ዓብዪ', so: 'Wayn', aa: 'Way' },
  extraLarge: { en: 'Extra Large', am: 'በጣም ትልቅ', om: 'Baay\'ee guddaa', ti: 'ጣዕሚ ዓብዪ', so: 'Aad u wayn', aa: 'Aad' },
  accessibility: { en: 'Accessibility', am: 'ተደራሽነት', om: 'Aksasibiilitii', ti: 'ተበጻሕነት', so: 'Helitaanka', aa: 'Hel' },
  visualOnly: { en: 'Visual Only Mode', am: 'የእይታ ብቻ ሁኔታ', om: 'Haala mul\'ata qofa', ti: 'ናይ ምርኣይ ጥራይ ኩነታት', so: 'Habka Muuqaalka Kaliya', aa: 'Hab' },
  highContrast: { en: 'High Contrast', am: 'ከፍተኛ ንፅፅር', om: 'Wal-bira qaba guddaa', ti: 'ላዕለዋይ ንጽጽር', so: 'Isbarbardhig Sare', aa: 'Isb' },
  audioDescription: { en: 'Audio Description', am: 'የድምፅ መግለጫ', om: 'Ibsa Sagalee', ti: 'ናይ ድምጺ መግለጺ', so: 'Sharaxaadda Codka', aa: 'Sha' },
  skipExercise: { en: 'Skip Exercise', am: 'መልመጃውን ይለፉ', om: 'Gilgaala darbi', ti: 'ነቲ ልምምድ ሕለፎ', so: 'Ka gudub jimicsiga', aa: 'Ka' },
  done: { en: 'Done', am: 'ተጠናቋል', om: 'Xumurameera', ti: 'ተወዲኡ', so: 'Dhammeeyay', aa: 'Dha' },
  resetConfirm: { en: 'Are you sure you want to restart?', am: 'በእርግጠኝነት እንደገና መጀመር ይፈልጋሉ?', om: 'Dhuguma irra deebitee eegaluu barbaadda?', ti: 'ርግጸኛ ዲኻ ዳግማይ ክትጅምር ትደሊ?', so: 'Ma hubaal inaad rabto inaad dib u bilowdo?', aa: 'Ma' },
  yes: { en: 'Yes', am: 'አዎ', om: 'Eeyyee', ti: 'እወ', so: 'Haa', aa: 'Haa' },
  no: { en: 'No', am: 'አይ', om: 'Lakki', ti: 'ኣይፋልን', so: 'Maya', aa: 'May' },
  exercises: { en: 'Exercises', am: 'መልመጃዎች', om: 'Gilgaalota', ti: 'ልምምዳት', so: 'Jimicsiyo', aa: 'Jim' },
  resources: { en: 'Resources', am: 'ሀብቶች', om: 'Qabeenya', ti: 'ጸጋታት', so: 'Agabka', aa: 'Aga' },
  liveTranslation: { en: 'Live Translation', am: 'ቀጥታ ትርጉም', om: 'Hiikkaa Kallattii', ti: 'ቀጥታ ትርጉም', so: 'Turjumaadda Tooska ah', aa: 'Tur' },
  translating: { en: 'Translating...', am: 'በመተርጎም ላይ...', om: 'Hiikkaa irratti...', ti: 'ኣብ ምትርጓም...', so: 'Turjumaya...', aa: 'Tur' },
  wellnessScore: { en: 'Wellness Score', am: 'የጤና ውጤት', om: 'Qabxii Fayyaa', ti: 'ውጽኢት ጥዕና', so: 'Dhibcaha Ladnaanta', aa: 'Dhi' },
  activityLevel: { en: 'Activity Level', am: 'የእንቅስቃሴ ደረጃ', om: 'Sadarkaa Sochii', ti: 'ደረጃ ምንቅስቓስ', so: 'Heerka Dhaqdhaqaaqa', aa: 'Hee' },
  completeExercise: { en: 'Complete Exercise', am: 'መልመጃውን ጨርስ', om: 'Gilgaala xumuri', ti: 'ነቲ ልምምድ ወድኣዮ', so: 'Dhammee Jimicsiga', aa: 'Dha' },
  exerciseCompleted: { en: 'Exercise completed! Well done.', am: 'መልመጃው ተጠናቋል! ጎበዝ።', om: 'Gilgaalli xumurameera! Baay\'ee gaariidha.', ti: 'ልምምድ ተወዲኡ! ጽቡቕ ጌርካ።', so: 'Jimicsigii waa dhammaaday! Aad baad u ku mahadsantahay.', aa: 'Jim' },
  low: { en: 'Low', am: 'ዝቅተኛ', om: 'Xiqqaa', ti: 'ትሑት', so: 'Hoose', aa: 'Hoo' },
  moderate: { en: 'Moderate', am: 'መካከለኛ', om: 'Giddu-galeessa', ti: 'ማእከላይ', so: 'Dhexdhexaad', aa: 'Dhe' },
  high: { en: 'High', am: 'ከፍተኛ', om: 'Olaanaa', ti: 'ልዑል', so: 'Sare', aa: 'Sar' },
  onboardingWelcome: { en: 'Welcome to SelamMind', am: 'ወደ ሰላምMind እንኳን ደህና መጡ', om: 'Baga nagaan gara SelamMind dhuftan', ti: 'ናብ ሰላምMind እንቋዕ ብደሓን መጻእኩም', so: 'Ku soo dhawaada SelamMind', aa: 'Bag' },
  onboardingMood: { en: 'Mood Tracking', am: 'የስሜት ክትትል', om: 'Miira Hordofuu', ti: 'ናይ ስምዒት ምክትታል', so: 'Raadraaca Niyadda', aa: 'Raa' },
  onboardingMoodDesc: { en: 'Check in daily to track your emotional well-being and see your progress.', am: 'የስሜትዎን ደህንነት ለመከታተል እና እድገትዎን ለማየት በየቀኑ ይግቡ።', om: 'Guyyaa guyyaan miira kee hordofuun jijjiirama kee ilaali.', ti: 'ስምዒታዊ ጥዕናኻ ንምክትታልን ዕቤትካ ንምርኣይን መዓልታዊ ተመዝገብ።', so: 'Iska hubi maalin kasta si aad u raadiso ladnaantaada shucuureed una aragto horumarkaaga.', aa: 'Isk' },
  onboardingExercise: { en: 'Personalized Exercises', am: 'ለእርስዎ የተዘጋጁ መልመጃዎች', om: 'Gilgaalota dhuunfaa', ti: 'ዝተመጣጠኑ ልምምዳት', so: 'Jimicsiyo Khaas ah', aa: 'Jim' },
  onboardingExerciseDesc: { en: 'Get AI-recommended exercises like breathing and meditation tailored to your mood.', am: 'እንደ መተንፈስ እና ማሰላሰል ያሉ ለእርስዎ ስሜት የተዘጋጁ በ AI የሚመከሩ መልመጃዎችን ያግኙ።', om: 'Gilgaalota AI-n gorfaman kan akka hafuura baafachuu fi tasgabbii miira kee irratti hundaa\'an argadhu.', ti: 'ከም ምትንፋስን ምስትንታንን ዝኣመሰሉ ብ AI ዝምከሩ ልምምዳት ከከም ስምዒትካ ረኸብ።', so: 'Hel jimicsiyo AI ku taliyay sida neefsashada iyo muraaqabada oo loo waafajiyay niyaddaada.', aa: 'Hel' },
  onboardingAI: { en: 'AI Assistant', am: 'የ AI ረዳት', om: 'Gargaaraa AI', ti: 'ናይ AI ረዳት', so: 'Kaaliyaha AI', aa: 'Kaa' },
  onboardingAIDesc: { en: 'Use voice or text to find support, translate content, and get guidance.', am: 'ድጋፍ ለማግኘት፣ ይዘትን ለመተርጎም እና መመሪያ ለማግኘት ድምጽን ወይም ጽሑፍን ይጠቀሙ።', om: 'Gargaarsa argachuuf, qabiyyee hiikuuf fi qajeelfama argachuuf sagalee ykn barreeffama fayyadami.', ti: 'ሓገዝ ንምርካብ፣ ትሕዝቶ ንምትርጓምን መምርሒ ንምርካብን ድምጺ ወይ ጽሑፍ ተጠቐም።', so: 'Isticmaal cod ama qoraal si aad u hesho taageero, u turjunto nuxurka, una hesho hagid.', aa: 'Ist' },
  onboardingEmergency: { en: 'Emergency Support', am: 'የአደጋ ጊዜ ድጋፍ', om: 'Gargaarsa Balaa', ti: 'ናይ ሓደጋ ሓገዝ', so: 'Taageerada Gurmadka', aa: 'Taa' },
  onboardingEmergencyDesc: { en: 'Quick access to crisis resources, counselors, and emergency services.', am: 'የአደጋ ጊዜ ሀብቶችን፣ አማካሪዎችን እና የአደጋ ጊዜ አገልግሎቶችን በፍጥነት ያግኙ።', om: 'Qabeenya balaa, gorsitoota fi tajaajila balaa ariifachiisaa dafii argadhu.', ti: 'ናይ ሓደጋ ጸጋታት፣ ኣማኸርትን ናይ ሓደጋ ኣገልግሎታትን ብቕልጡፍ ረኸብ።', so: 'Si dhakhso ah u hel agabka dhibaatada, lataliyayaasha, iyo adeegyada gurmadka.', aa: 'Si' },
  next: { en: 'Next', am: 'ቀጣይ', om: 'Itti aana', ti: 'ቀጻሊ', so: 'Xiga', aa: 'Xig' },
  finish: { en: 'Finish', am: 'ጨርስ', om: 'Xumuri', ti: 'ወድእ', so: 'Dhammee', aa: 'Dha' },
  healthTitle: { en: 'Health Centers', am: 'የጤና ማዕከላት', om: 'Wiirtuu Fayyaa', ti: 'ማእከላት ጤና', so: 'Xarumaha Caafimaadka', aa: 'Xar' },
  healthSearch: { en: 'Search nearby health centers', am: 'አቅራቢያ ያሉ የጤና ማዕከላትን ፈልግ', om: 'Wiirtuu fayyaa si dhihoo barbaadi', ti: 'ኣቅራቢ ዝኾኑ ማእከላት ጤና ይፈልጉ', so: 'Raadi xarumaha caafimaadka ee kuu dhow', aa: 'Raa' },
  healthCall: { en: 'Call', am: 'ይደውሉ', om: 'Bilbilaa', ti: 'ደውል', so: 'Wac', aa: 'Bil' },
  healthDirections: { en: 'Get Directions', am: 'መንገድ ያግኙ', om: 'Karaa argadhu', ti: 'መንገዲ ያግኙ', so: 'Hadh tilmaamaha', aa: 'Kar' },
  psychosocialTitle: { 
    en: 'Psychosocial Support', 
    am: 'የስነ-ልቦና ማህበራዊ ድጋፍ', 
    om: 'Deggersa Fayyaa Sammuu', 
    ti: 'ስነ-ልቦናዊ ማሕበራዊ ደገፍ', 
    so: 'Taageerada Cilmi-nafsiga', 
    aa: 'Psychosocial Support' 
  },
  psychosocialDesc: {
    en: 'Specialized care categories for crisis recovery and survivor support.',
    am: 'ለአደጋ ማገገሚያ እና ለተጎጂዎች ድጋፍ ልዩ የሕክምና ዓይነቶች።',
    om: 'Balaa irraa deebi’uu fi gargaarsa miidhamtootaaf tajaajila addaa.',
    ti: 'ንሕውየትን ደገፍ ተጎዳእትን ዝሕግዙ ፍሉያት ዓውድታት ክንክን።',
    so: 'Noocyada daryeelka gaarka ah ee soo kabashada dhibaatada iyo taageerada badbaadayaasha.',
    aa: 'Psychosocial care categories'
  },
  guidance: {
    en: 'Immediate Guidance',
    am: 'ፈጣን መመሪያ',
    om: 'Qajeelfama Ariifachiisaa',
    ti: 'ቅልጡፍ መምርሒ',
    so: 'Hagidda Degdegga ah',
    aa: 'Immediate Guidance'
  },
  completeExerciseConfirm: { 
    en: 'Are you sure you have completed this exercise?', 
    am: 'ይህንን መልመጃ ማጠናቀቅዎን እርግጠኛ ነዎት?', 
    om: 'Gilgaala kana xumuruu kee mirkaneeffatteettaa?', 
    ti: 'ነዚ ልምምድ ምውድኣኻ ርግጸኛ ዲኻ?', 
    so: 'Ma hubaal inaad dhamaysay jimicsigan?', 
    aa: 'Complete?' 
  },
  languageSwitched: { en: 'Language switched successfully', am: 'ቋንቋው በተሳካ ሁኔታ ተቀይሯል', om: 'Afaan milkaa\'inaan jijjiirameera', ti: 'ቋንቋ ብዓወት ተቐይሩ ኣሎ', so: 'Luqadda si guul leh ayaa loo beddelay', aa: 'Afa' },
  listeningIn: { en: 'Listening in', am: 'በማዳመጥ ላይ', om: 'Dhaggeeffachaa jira', ti: 'ሰሚዕና ኣለና', so: 'Dhageysiga', aa: 'Dha' },
  offlineMode: { en: 'Offline Mode', am: 'ከመስመር ውጭ', om: 'Haala interneetii malee', ti: 'ካብ መስመር ወጻኢ', so: 'Habka khadka tooska ah', aa: 'Afa' },
};
