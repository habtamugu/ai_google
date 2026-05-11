import { GoogleGenAI, Modality } from "@google/genai";
import { Language } from "../types";

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
export { Modality };

export interface VideoProcessResult {
  status: "success" | "error";
  transcript_source: string;
  translated_text: string;
  subtitles?: { start: number; end: number; text: string; speaker?: string }[];
  audioData?: string; // base64
  notes?: string;
}

export async function processVideoFile(
  file: File,
  targetLanguage: string,
  options: { sourceLanguage?: string; voiceStyle?: string; accent?: string; speed?: number } = {}
): Promise<VideoProcessResult> {
  try {
    const base64Data = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.readAsDataURL(file);
    });

    // 1. Advanced Pipeline using Gemini 3 Flash
    const textResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            mimeType: file.type,
            data: base64Data,
          },
        },
        {
          text: `You are an advanced multimodal AI assistant. 
          Your task is to process this video file and convert its spoken audio into ${targetLanguage}.
          ${options.sourceLanguage && options.sourceLanguage !== 'auto' ? `The source language is ${options.sourceLanguage}.` : 'Please auto-detect the source language.'}
          
          PIPELINE:
          1. Transcribe the video audio accurately in the source language.
          2. Translate the transcript into ${targetLanguage}, ensuring it sounds natural for a native speaker.
          3. Format the translated transcript into clean, timestamped subtitles in ${targetLanguage}.
          4. Ensure each subtitle segment is short and readable (under 10 words per entry).
          
          STYLE & ACCENT:
          - Use a ${options.voiceStyle || 'natural'} tone for the translation.
          - The cultural context should be appropriate for ${targetLanguage} speakers.
          
          Return your response in this STRICT JSON format:
          {
            "status": "success",
            "transcript_source": "Source transcript text...",
            "translated_text": "Translated transcript text in ${targetLanguage}",
            "subtitles": [
              {"start": 0.0, "end": 2.5, "speaker": "Speaker Name", "text": "Translated subtitle text..."},
              ...
            ],
            "notes": "Brief notes about the translation."
          }
          
          If audio quality is too low or processing fails, return:
          { "status": "error", "notes": "Reason for failure" }`,
        },
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(textResponse.text || "{}");
    
    if (result.status === "error") {
      return { ...result, transcript_source: "", translated_text: "" };
    }

    // 2. Voice Generation using Gemini TTS
    let audioData: string | undefined;
    try {
      const ttsResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say this at ${options.speed || 1}x speed in a ${options.voiceStyle || 'natural'} style with a ${options.accent || 'neutral'} accent: ${result.translated_text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });
      audioData = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (ttsError) {
      console.error("TTS Generation Error:", ttsError);
    }

    return {
      status: result.status,
      transcript_source: result.transcript_source,
      translated_text: result.translated_text,
      subtitles: result.subtitles,
      notes: result.notes,
      audioData,
    };
  } catch (error) {
    console.error("Video Processing Error:", error);
    return { status: "error", notes: String(error), transcript_source: "", translated_text: "" };
  }
}

export async function translateVideoContent(
  exerciseName: string,
  exerciseDescription: string,
  targetLanguage: string
): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a culturally sensitive AI mental health assistant designed for Ethiopia.
      The user is watching a video about "${exerciseName}". 
      The exercise description is: "${exerciseDescription}".
      
      RULES:
      - Respond ONLY in ${targetLanguage}.
      - Be calm, supportive, and respectful.
      - Use simple, clear language; avoid clinical jargon.
      - Never diagnose medical conditions.
      - Provide a concise (max 3 sentences) "Audio Guide" or "Live Translation" of what this video likely contains.
      - Focus on core instructions and emotional support.`,
    });

    return response.text || "Translation unavailable.";
  } catch (error) {
    console.error("Gemini Translation Error:", error);
    return "Translation unavailable at the moment.";
  }
}

export async function recommendExerciseByMood(
  mood: string,
  availableExercises: { id: string; label: string; description: string }[],
  targetLanguage: string
): Promise<{ exerciseId: string; reasoning: string }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a culturally sensitive AI mental health assistant designed for Ethiopia.
      The user is feeling "${mood}". 
      
      RULES:
      - Respond ONLY in ${targetLanguage}.
      - Be calm, supportive, and non-judgmental.
      - Use culturally relevant examples (community, family, faith) if appropriate.
      - Avoid clinical jargon.
      - Provide a short, supportive explanation (max 2 sentences) why this exercise is good for their current mood.
      
      Based on this mood, select the most suitable exercise from this list:
      ${JSON.stringify(availableExercises)}
      
      Return your response in this STRICT JSON format:
      {
        "exerciseId": "the id of the selected exercise",
        "reasoning": "..."
      }`,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Recommendation Error:", error);
    return { exerciseId: availableExercises[0].id, reasoning: "This exercise might help you feel better." };
  }
}

/**
 * Generates natural AI voice audio using Gemini TTS with customizable style, accent, and speed.
 */
export async function generateAssistantVoice(
  text: string,
  options: { voiceStyle?: string; accent?: string; speed?: number } = {}
): Promise<string | undefined> {
  try {
    const ttsResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say this at ${options.speed || 1}x speed in a ${options.voiceStyle || 'natural'} style with a ${options.accent || 'neutral'} accent: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    return ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    return undefined;
  }
}

export async function processIVRRequest(
  userInput: string,
  targetLanguage: string,
  availableExercises: { id: string; label: string; description: string }[]
): Promise<{ detected_mood: string; response_text: string; recommended_exercise_id?: string; audioData?: string }> {
  try {
    // 1. Detect Mood and Generate Response using Gemini 3 Flash
    const textResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a culturally sensitive AI mental health assistant designed for Ethiopia.
      Your role is to:
      1. Understand user mood from this input: "${userInput}"
      2. Classify emotional state into: Stress/Anxiety, Sadness, Low Energy, or Positive Mood.
      3. Provide a short, supportive, culturally appropriate guidance in ${targetLanguage}.
      4. Recommend a short exercise from the provided list.
      
      CORE RULES:
      - Respond ONLY in ${targetLanguage}.
      - Be calm, supportive, and non-judgmental.
      - Use simple, clear, and respectful language.
      - Avoid clinical or complex psychological jargon.
      - Never diagnose medical conditions.
      - If the user expresses self-harm or crisis: Respond with empathy, encourage contacting trusted people (family, friends, community leaders), and suggest local support resources.
      - Provide culturally relevant examples (community, family, faith).
      - Short, clear responses (max 6 sentences).
      
      Available Exercises:
      ${JSON.stringify(availableExercises)}
      
      Return your response in this STRICT JSON format:
      {
        "detected_mood": "...",
        "response_text": "...",
        "recommended_exercise_id": "the id from the available exercises list"
      }`,
      config: {
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(textResponse.text || "{}");

    // 2. Generate natural voice audio using Gemini TTS
    let audioData: string | undefined;
    try {
      const ttsResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: result.response_text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });
      audioData = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (ttsError) {
      console.error("TTS Generation Error:", ttsError);
    }

    return {
      detected_mood: result.detected_mood || "Unknown",
      response_text: result.response_text || "I am here to support you.",
      recommended_exercise_id: result.recommended_exercise_id,
      audioData,
    };
  } catch (error) {
    console.error("IVR Processing Error:", error);
    return {
      detected_mood: "Error",
      response_text: "I am sorry, I am having trouble connecting right now. Please try again later.",
    };
  }
}

export interface PsychosocialVideoRecommendation {
  title: string;
  explanation: string;
  duration: string;
  searchKeyword: string;
}

export async function getPsychosocialVideoRecommendation(
  userInput: string,
  targetLanguage: string
): Promise<{ 
  response_text: string; 
  recommendations: PsychosocialVideoRecommendation[];
  isCrisis: boolean;
}> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User Input: "${userInput}"`,
      config: {
        systemInstruction: `Psychosocial Support Assistant (Video Recommendation Mode)
🎯 ROLE
You are an AI Psychosocial Support Assistant integrated into a mental health support application.
Your purpose is to support users experiencing: Stress, Anxiety, Depression, Trauma, Sleep difficulties, or Overwhelm.

You provide: Safe emotional support responses, Psychosocial coping guidance, and Recommended support videos.
You are NOT a medical professional.

⚠️ SAFETY & LIMITATIONS (MANDATORY)
- Always be empathetic, calm, and supportive.
- Avoid diagnosis or medical advice.
- Encourage professional support when appropriate.
- STOP video recommendations immediately if the user expresses self-harm or suicide ideation. Respond with empathy and direct them to local emergency services/911.

📺 OUTPUT FORMAT (STRICT JSON)
Return your response in this JSON format:
{
  "isCrisis": boolean,
  "response_text": "Your empathetic response in ${targetLanguage}...",
  "recommendations": [
    {
      "title": "Video Title",
      "explanation": "1-2 lines simple explanation",
      "duration": "3-15 minutes",
      "searchKeyword": "YouTube keyword phrase"
    },
    ... (max 3)
  ]
}

🎥 VIDEO SELECTION RULES
- Focused on coping skills and grounding.
- Safe for vulnerable users.
- Sources: WHO, NHS, TED-Ed, Headspace, Calm, Trusted educational psychology channels.

Always respond in ${targetLanguage}.`,
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Video Recommendation Error:", error);
    return { 
      response_text: "I'm sorry, I'm having trouble providing recommendations right now.", 
      recommendations: [],
      isCrisis: false 
    };
  }
}

export async function getPsychosocialCBTSupport(
  userInput: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  targetLanguage: string
): Promise<{ 
  response_text: string; 
  isCrisis: boolean;
  currentStep: number;
}> {
  try {
    // Determine the current step based on how many times the assistant has replied.
    const previousAssistantMessages = history.filter(h => h.role === 'assistant').length;
    // The flow has 5 steps
    const currentStep = Math.min(5, previousAssistantMessages + 1);

    // Simple crisis keyword detection (simulated safety rule)
    const crisisKeywords = ['suicide', 'kill', 'die', 'end it', 'hurt myself', 'ራስን', 'መሞት', 'suicidal'];
    const isCrisis = crisisKeywords.some(keyword => userInput.toLowerCase().includes(keyword));

    if (isCrisis) {
      return {
        response_text: targetLanguage === 'am' ? "ስለ ደህንነትዎ እጨነቃለሁ። እባክዎ አስቸኳይ እርዳታ ወይም የምታምኑትን ሰው ያነጋግሩ።" : "I am very concerned about your safety. Please reach out to emergency services or someone you trust right now.",
        isCrisis: true,
        currentStep: currentStep
      };
    }

    // Pre-defined localized CBT responses mimicking the step-by-step guidance
    const responses: Record<string, string[]> = {
      en: [
        "I'm here for you. To start, can you tell me a little more about the specific problem or situation that is bothering you right now?",
        "Thank you for sharing. When you think about this situation, what specific thoughts go through your mind?",
        "I see. Thoughts like those often follow patterns. Do you feel like you might be expecting the worst, or perhaps being overly critical of yourself?",
        "It's natural to fall into those patterns sometimes. If a good friend had this exact same thought, what comforting and realistic advice would you give them to reframe it?",
        "That is a wonderful perspective! For our final step, let's pick a small, manageable action to take right now—perhaps taking 3 deep breaths, or writing down that positive thought. What will you try?"
      ],
      am: [
        "እኔ ላንተ እዚህ ነኝ። ለመጀመር፣ አሁን እንዲህ እንዲሰማህ ስላደረገው ሁኔታ ትንሽ ልታብራራልኝ ትችላለህ?",
        "ይህ በጣም የሚከብድ ይመስላል። እንዲህ ሲሰማህ፣ በአእምሮህ ውስጥ የሚያልፉት የተለዩ አሉታዊ ሀሳቦች ምንድን ናቸው?",
        "ስላካፈልከኝ አመሰግናለሁ። እንደነዚህ ያሉ ሀሳቦች ብዙ ጊዜ የተለመደ መንገድ ይከተላሉ። መጥፎውን ብቻ እንደምትጠብቅ ወይም በራስህ ላይ በጣም እንደጨከንክ ይሰማሃል?",
        "እንዲህ አይነት ሀሳቦች መምጣታቸው ተፈጥሯዊ ነው። የቅርብ ጓደኛህ ተመሳሳይ ሀሳብ ቢኖረው፣ ምን አይነት ደግ እና እውነተኛ ምክር ትሰጠው ነበር?",
        "ይህ በጣም ጥሩ አመለካከት ነው! ለመጨረሻው ደረጃ፣ አሁን ልናደርገው የምንችለውን ትንሽ ተግባር እንምረጥ—ለምሳሌ 3 ጥልቅ ትንፋሽ መውሰድ፣ ወይም ይህን አዎንታዊ ሀሳብ መጻፍ። የትኛውን ትሞክራለህ?"
      ],
      om: [
        "Ani asuman jira. Jalqabuuf, haala yeroo ammaa kana akka sitti dhaga'amu taasise waa'ee sanaa xiqqoo natti himuu dandeessaa?",
        "Kun baay'ee ulfaataa fakkaata. Yeroo akkas sitti dhaga'amu, yaadni adda ta'e maaltu sammuu kee keessa darba?",
        "Waan naaf hirteef galatoomi. Yaadota akkanaa yeroo baay'ee mudawwan (patterns) hordofu. Wanta hunda caalaa hamaa ta'e eegaa akka jirtu, ykn ofitti gar-malee ceepha'aa akka jirtu sitti dhaga'amaa?",
        "Haalota kana keessa seenuun uumama. Hiriyyaan gaariin tokko yaada sirrii kana yoo qabaate, gorsa akkamii fakkaatu fi jajjabeessaa kennitaaf?",
        "Kun ilaalcha baay'ee gaariidha! Tarkaanfii keenya dhumaatiif, tarkaanfii xiqqaa fi salphaa ta'e amma haa fudhannu—tarii hargansuu gadi fagoo 3 fudhachuu, ykn yaada gaarii sana barreessuu. Maal yaalta?"
      ]
    };

    const safeLang = ['en', 'am', 'om'].includes(targetLanguage) ? targetLanguage : 'en';
    const languageArray = responses[safeLang];
    let response_text = languageArray[currentStep - 1] || languageArray[4];

    // If step > 5, keep encouraging
    if (previousAssistantMessages >= 5) {
       response_text = safeLang === 'am' ? "በጣም ጥሩ እያደረግክ ነው። ይህን ስሜትህን መቆጣጠር ትችላለህ! ሌላ የምናወራው ነገር አለ?" : "You are doing great. Keep up this positive momentum, you have the tools to handle this! Is there anything else on your mind?";
    }

    // Simulate network delay to make it feel natural
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      response_text,
      isCrisis: false,
      currentStep
    };
  } catch (error) {
    console.error("Local CBT Support Error:", error);
    return { 
      response_text: "I'm sorry, I'm having trouble responding right now. Please try again.", 
      isCrisis: false,
      currentStep: 1
    };
  }
}