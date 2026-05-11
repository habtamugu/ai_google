import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Globe, 
  ChevronLeft, 
  Home, 
  Activity, 
  Map as MapIcon, 
  Settings as SettingsIcon,
  Phone,
  AlertTriangle,
  Heart,
  Info,
  LogOut,
  RotateCcw,
  Volume2,
  Clock,
  Search,
  X,
  Mic,
  Smile,
  PhoneCall,
  ChevronRight,
  ChevronDown,
  Upload,
  Video,
  FileVideo,
  Play,
  Pause,
  Sparkles,
  Brain,
  UserPlus,
  Navigation,
  Send,
  Sliders,
  ShieldAlert,
  CloudLightning,
  Flame,
  Check
} from 'lucide-react';
import { Language, Translation, Exercise } from './types';
import { LANGUAGES, MOODS, EXERCISES, RESOURCES, UI_LABELS, DAILY_AFFIRMATIONS, COUNSELORS, HEALTH_CENTERS, PSYCHOSOCIAL_SUPPORT } from './constants';
import { AnimatedIcon } from './components/AnimatedIcon';
import { LogoSelamMind } from './components/LogoSelamMind';
import { ErrorBoundary } from './components/ErrorBoundary';
import { cn } from '@/src/lib/utils';
import { translateVideoContent, processVideoFile, VideoProcessResult, recommendExerciseByMood, processIVRRequest, generateAssistantVoice, ai, Modality, getPsychosocialVideoRecommendation, PsychosocialVideoRecommendation, getPsychosocialCBTSupport } from './services/geminiService';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, addDoc, onSnapshot, query, orderBy, limit, Timestamp, serverTimestamp } from 'firebase/firestore';

type Screen = 'welcome' | 'onboarding' | 'languageSelect' | 'mood' | 'exercises' | 'exerciseDetail' | 'breathing' | 'crisis' | 'referral' | 'map' | 'dashboard' | 'settings' | 'videoTranslator' | 'voiceAssistant' | 'counselorList' | 'healthCenters' | 'psychosocialSupport' | 'psychosocialAssistant' | 'cbtSupport';

// Fix Leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  const centerKey = center.join(',');
  
  useEffect(() => {
    map.setView(center, 14);
  }, [centerKey, map]);
  
  return null;
}

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    const saved = localStorage.getItem('selam_screen');
    return (saved as Screen) || 'welcome';
  });
  const [selectedMood, setSelectedMood] = useState<string | null>(() => {
    return localStorage.getItem('selam_selectedMood');
  });
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(() => {
    const saved = localStorage.getItem('selam_selectedExercise');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      return EXERCISES.find(e => e.id === parsed.id) || null;
    } catch { return null; }
  });
  const [moodHistory, setMoodHistory] = useState<{ mood: string; date: Date }[]>(() => {
    const saved = localStorage.getItem('selam_moodHistory');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.map((entry: any) => ({ ...entry, date: new Date(entry.date) }));
    } catch { return []; }
  });
  const [exerciseHistory, setExerciseHistory] = useState<{ exerciseId: string; date: Date }[]>(() => {
    const saved = localStorage.getItem('selam_exerciseHistory');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.map((entry: any) => ({ ...entry, date: new Date(entry.date) }));
    } catch { return []; }
  });
  const [isVisualOnly, setIsVisualOnly] = useState(() => {
    return localStorage.getItem('selam_isVisualOnly') === 'true';
  });
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('selam_highContrast') === 'true';
  });
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(() => {
    return localStorage.getItem('selam_isVoiceEnabled') === 'true';
  });
  const [fontSize, setFontSize] = useState<'small' | 'normal' | 'large' | 'extraLarge'>(() => {
    const saved = localStorage.getItem('selam_fontSize');
    return (saved as any) || 'normal';
  });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [dailyAffirmation, setDailyAffirmation] = useState<Translation>(() => {
    const saved = localStorage.getItem('selam_dailyAffirmation');
    if (saved) {
      try { return JSON.parse(saved); } catch { return DAILY_AFFIRMATIONS[0]; }
    }
    return DAILY_AFFIRMATIONS[0];
  });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [exerciseToComplete, setExerciseToComplete] = useState<string | null>(null);
  const [healthSearchQuery, setHealthSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [nearestCenter, setNearestCenter] = useState<any | null>(null);

  // Haversine distance formula
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const findNearestCenter = (lat: number, lng: number) => {
    let minDistance = Infinity;
    let nearest = null;

    HEALTH_CENTERS.forEach(center => {
      const dist = getDistance(lat, lng, center.lat, center.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = center;
      }
    });

    return nearest;
  };

  const requestLocation = (autoSelectNearest: boolean = false) => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(newLoc);
          setIsLocating(false);
          
          if (autoSelectNearest) {
            const nearest = findNearestCenter(newLoc.lat, newLoc.lng);
            if (nearest) {
              setNearestCenter(nearest);
              setSelectedHealthCenter(nearest);
              setToast(`Nearest center found: ${nearest.name[language]}`);
            }
          } else {
            setToast("Location updated successfully");
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsLocating(false);
          setToast("Could not get location. Please enable GPS.");
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setIsLocating(false);
      setToast("Geolocation not supported by your browser");
    }
  };
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [videoKey, setVideoKey] = useState(0);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    return localStorage.getItem('selam_onboarding_complete') === 'true';
  });
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [isTranslating, setIsTranslating] = useState(false);
  const [liveTranslation, setLiveTranslation] = useState<string | null>(null);

  const [isListening, setIsListening] = useState(false);
  const [translatorFile, setTranslatorFile] = useState<File | null>(null);
  const [translatorResult, setTranslatorResult] = useState<VideoProcessResult | null>(null);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [translatedAudioUrl, setTranslatedAudioUrl] = useState<string | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState<string>('auto');
  const [voiceStyle, setVoiceStyle] = useState<string>('natural');
  const [voiceAccent, setVoiceAccent] = useState<string>('neutral');
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1);
  const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [customSourceLanguage, setCustomSourceLanguage] = useState<string>('');
  const [aiRecommendation, setAiRecommendation] = useState<{ exerciseId: string; reasoning: string } | null>(null);
  const [isRecommending, setIsRecommending] = useState(false);
  const [ivrResponse, setIvrResponse] = useState<{ detected_mood: string; response_text: string; recommended_exercise_id?: string; audioData?: string } | null>(null);
  const [isProcessingIVR, setIsProcessingIVR] = useState(false);
  const [psychosocialInput, setPsychosocialInput] = useState('');
  const [psychosocialResponse, setPsychosocialResponse] = useState<string | null>(null);
  const [psychosocialRecommendations, setPsychosocialRecommendations] = useState<PsychosocialVideoRecommendation[]>([]);
  const [isPsychosocialLoading, setIsPsychosocialLoading] = useState(false);
  const [isPsychosocialCrisis, setIsPsychosocialCrisis] = useState(false);

  const [cbtHistory, setCbtHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [cbtInput, setCbtInput] = useState('');
  const [cbtStep, setCbtStep] = useState(1);
  const [isCbtLoading, setIsCbtLoading] = useState(false);
  const [isCbtCrisis, setIsCbtCrisis] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedHealthCenter, setSelectedHealthCenter] = useState<any | null>(() => {
    const saved = localStorage.getItem('selam_selectedHealthCenter');
    return saved ? JSON.parse(saved) : null;
  });
  const [travelMode, setTravelMode] = useState<string>(() => {
    return localStorage.getItem('selam_travelMode') || 'DRIVING';
  });
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string; timestamp: Date }[]>(() => {
    const saved = localStorage.getItem('selam_chatHistory');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.map((entry: any) => ({ ...entry, timestamp: new Date(entry.timestamp) }));
    } catch { return []; }
  });
  const [chatSummary, setChatSummary] = useState<string>('');

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthReady(true);
      if (firebaseUser) {
        // Load user profile
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        getDoc(userDocRef).then((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.language) setLanguage(data.language);
            if (data.isVisualOnly !== undefined) setIsVisualOnly(data.isVisualOnly);
            if (data.highContrast !== undefined) setHighContrast(data.highContrast);
            if (data.isVoiceEnabled !== undefined) setIsVoiceEnabled(data.isVoiceEnabled);
            if (data.fontSize) setFontSize(data.fontSize);
            if (data.hasCompletedOnboarding !== undefined) setHasCompletedOnboarding(data.hasCompletedOnboarding);
          } else {
            // Create initial profile
            setDoc(userDocRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              language: 'en',
              lastActive: serverTimestamp()
            }).catch(e => handleFirestoreError(e, OperationType.CREATE, `users/${firebaseUser.uid}`));
          }
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync Data with Firestore
  useEffect(() => {
    if (!user || !isAuthReady) return;

    // Sync Mood History
    const moodsQuery = query(collection(db, 'users', user.uid, 'moods'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribeMoods = onSnapshot(moodsQuery, (snapshot) => {
      const history = snapshot.docs.map(doc => ({
        mood: doc.data().moodId,
        date: (doc.data().timestamp as Timestamp).toDate()
      }));
      setMoodHistory(history);
    }, (e) => handleFirestoreError(e, OperationType.LIST, `users/${user.uid}/moods`));

    // Sync Exercise History
    const exercisesQuery = query(collection(db, 'users', user.uid, 'exercises'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribeExercises = onSnapshot(exercisesQuery, (snapshot) => {
      const history = snapshot.docs.map(doc => ({
        exerciseId: doc.data().exerciseId,
        date: (doc.data().timestamp as Timestamp).toDate()
      }));
      setExerciseHistory(history);
    }, (e) => handleFirestoreError(e, OperationType.LIST, `users/${user.uid}/exercises`));

    // Sync Chat History
    const chatQuery = query(collection(db, 'users', user.uid, 'chat'), orderBy('timestamp', 'asc'), limit(100));
    const unsubscribeChat = onSnapshot(chatQuery, (snapshot) => {
      const history = snapshot.docs.map(doc => ({
        role: doc.data().role as 'user' | 'assistant',
        content: doc.data().content,
        timestamp: (doc.data().timestamp as Timestamp).toDate()
      }));
      setChatHistory(history);
    }, (e) => handleFirestoreError(e, OperationType.LIST, `users/${user.uid}/chat`));

    return () => {
      unsubscribeMoods();
      unsubscribeExercises();
      unsubscribeChat();
    };
  }, [user, isAuthReady]);

  const t = (key: string) => UI_LABELS[key]?.[language] || key;

  const handleExerciseComplete = async (exerciseId: string) => {
    if (user) {
      try {
        await addDoc(collection(db, 'users', user.uid, 'exercises'), {
          uid: user.uid,
          exerciseId,
          timestamp: serverTimestamp()
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/exercises`);
      }
    } else {
      const newHistory = [...exerciseHistory, { exerciseId, date: new Date() }];
      setExerciseHistory(newHistory);
    }
    speak(t('exerciseCompleted') || 'Exercise completed! Well done.', true);
    setCurrentScreen('dashboard');
  };

  const calculateWellnessScore = () => {
    // Simple calculation: 
    // - 10 points per mood check-in (max 30/day)
    // - 20 points per exercise (max 60/day)
    // - 10 points for daily affirmation check
    
    const today = new Date().toDateString();
    const moodsToday = moodHistory.filter(m => new Date(m.date).toDateString() === today).length;
    const exercisesToday = exerciseHistory.filter(e => new Date(e.date).toDateString() === today).length;
    
    const score = Math.min(30, moodsToday * 10) + Math.min(60, exercisesToday * 20) + 10;
    return Math.min(100, score);
  };

  const calculateActivityLevel = () => {
    const exercisesToday = exerciseHistory.filter(e => new Date(e.date).toDateString() === new Date().toDateString()).length;
    if (exercisesToday === 0) return 'Low';
    if (exercisesToday < 3) return 'Moderate';
    return 'High';
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('selam_language', language);
    localStorage.setItem('selam_screen', currentScreen);
    if (selectedMood) localStorage.setItem('selam_selectedMood', selectedMood);
    else localStorage.removeItem('selam_selectedMood');
    
    if (selectedExercise) localStorage.setItem('selam_selectedExercise', JSON.stringify({ id: selectedExercise.id }));
    else localStorage.removeItem('selam_selectedExercise');
    
    localStorage.setItem('selam_moodHistory', JSON.stringify(moodHistory));
    localStorage.setItem('selam_exerciseHistory', JSON.stringify(exerciseHistory));
    localStorage.setItem('selam_isVisualOnly', String(isVisualOnly));
    localStorage.setItem('selam_highContrast', String(highContrast));
    localStorage.setItem('selam_isVoiceEnabled', String(isVoiceEnabled));
    localStorage.setItem('selam_fontSize', fontSize);
    localStorage.setItem('selam_dailyAffirmation', JSON.stringify(dailyAffirmation));
    localStorage.setItem('selam_onboarding_complete', String(hasCompletedOnboarding));
    localStorage.setItem('selam_healthSearchQuery', healthSearchQuery);
    localStorage.setItem('selam_travelMode', travelMode);
    localStorage.setItem('selam_chatHistory', JSON.stringify(chatHistory));
    localStorage.setItem('selam_chatSummary', chatSummary);
    if (selectedHealthCenter) localStorage.setItem('selam_selectedHealthCenter', JSON.stringify(selectedHealthCenter));
    else localStorage.removeItem('selam_selectedHealthCenter');
  }, [language, currentScreen, selectedMood, selectedExercise, moodHistory, exerciseHistory, isVisualOnly, highContrast, isVoiceEnabled, fontSize, dailyAffirmation, hasCompletedOnboarding, healthSearchQuery, travelMode, selectedHealthCenter, chatHistory, chatSummary]);

  useEffect(() => {
    // Only set a random affirmation if one isn't already saved in localStorage
    const saved = localStorage.getItem('selam_dailyAffirmation');
    if (!saved) {
      const randomIdx = Math.floor(Math.random() * DAILY_AFFIRMATIONS.length);
      setDailyAffirmation(DAILY_AFFIRMATIONS[randomIdx]);
    }
  }, []);

  useEffect(() => {
    if (currentScreen === 'map' && !userLocation) {
      requestLocation(true);
    }
  }, [currentScreen]);

  useEffect(() => {
    if (currentScreen === 'exerciseDetail') {
      setVideoLoading(true);
      setVideoError(false);
      setLiveTranslation(null);
    }
  }, [currentScreen, selectedExercise, language]);

  useEffect(() => {
    let timeout: any;
    if (currentScreen === 'exerciseDetail' && videoLoading && !videoError) {
      timeout = setTimeout(() => {
        setVideoError(true);
      }, 10000);
    }
    return () => clearTimeout(timeout);
  }, [currentScreen, videoLoading, videoError]);

  useEffect(() => {
    if (currentScreen === 'onboarding') {
      const onboardingSteps = [
        t('onboardingWelcome') + ". " + t('onboardingMoodDesc'),
        t('onboardingMood') + ". " + t('onboardingMoodDesc'),
        t('onboardingExercise') + ". " + t('onboardingExerciseDesc'),
        t('onboardingAI') + ". " + t('onboardingAIDesc'),
        t('onboardingEmergency') + ". " + t('onboardingEmergencyDesc')
      ];
      speak(onboardingSteps[onboardingStep], true);
    }
  }, [currentScreen, onboardingStep, language]);

  const reloadVideo = () => {
    setVideoKey(prev => prev + 1);
    setVideoLoading(true);
    setVideoError(false);
  };

  const openGoogleMaps = (query: string = "mental health center") => {
    const baseUrl = "https://www.google.com/maps/search/";
    const locationPart = userLocation ? `${userLocation.lat},${userLocation.lng}` : "";
    const url = `${baseUrl}${encodeURIComponent(query)}/@${locationPart}`;
    window.open(url, '_blank');
  };

  const speak = (text: string, force: boolean = false) => {
    if (!isVoiceEnabled && !force) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // Note: Amharic/Oromo/Tigrigna/Somali support depends on the browser/OS voices
    const langMap: Record<Language, string> = {
      en: 'en-US',
      am: 'am-ET',
      om: 'om-ET',
      ti: 'ti-ET',
      so: 'so-SO',
      aa: 'aa-ET'
    };
    utterance.lang = langMap[language];
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    // Speak screen title on change
    const screenTitles: Record<Screen, string> = {
      welcome: t('welcome'),
      onboarding: 'Onboarding',
      languageSelect: 'Select Language',
      mood: t('howFeel'),
      exercises: 'Exercises',
      breathing: EXERCISES.find(e => e.id === 'breathing')?.label[language] || '',
      crisis: t('emergency'),
      referral: 'Referral',
      exerciseDetail: selectedExercise?.label[language] || 'Exercise',
      map: t('healthCenter'),
      dashboard: t('dashboard'),
      settings: t('settings'),
      videoTranslator: 'Video Translator',
      voiceAssistant: 'Voice Assistant',
      counselorList: 'Counselor Database',
      healthCenters: t('healthTitle'),
      psychosocialSupport: t('psychosocialTitle'),
      psychosocialAssistant: 'Psychosocial Video Assistant',
      cbtSupport: 'CBT Support Assistant',
    };
    speak(screenTitles[currentScreen]);
  }, [currentScreen, language, isVoiceEnabled]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setToast("Signed in successfully");
    } catch (error) {
      console.error("Login Error:", error);
      setToast("Failed to sign in");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setToast("Signed out successfully");
      setCurrentScreen('welcome');
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const handleMoodSelect = async (moodId: string) => {
    const mood = MOODS.find(m => m.id === moodId);
    if (mood) speak(mood.label[language]);
    
    setSelectedMood(moodId);
    
    if (user) {
      try {
        await addDoc(collection(db, 'users', user.uid, 'moods'), {
          uid: user.uid,
          moodId,
          timestamp: serverTimestamp()
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/moods`);
      }
    } else {
      setMoodHistory([...moodHistory, { mood: moodId, date: new Date() }]);
    }
    
    setCurrentScreen('exercises');

    // Call AI for recommendation
    setIsRecommending(true);
    setAiRecommendation(null);
    try {
      const langNames: Record<Language, string> = {
        en: 'English',
        am: 'Amharic',
        om: 'Afaan Oromo',
        ti: 'Tigrigna',
        so: 'Somali',
        aa: 'Afar'
      };
      const exercisesForMood = EXERCISES.filter(ex => ex.moods.includes(moodId)).map(ex => ({
        id: ex.id,
        label: ex.label.en,
        description: ex.description.en
      }));
      
      const recommendation = await recommendExerciseByMood(
        mood?.label.en || moodId,
        exercisesForMood,
        langNames[language]
      );
      setAiRecommendation(recommendation);
      if (isVoiceEnabled) speak(recommendation.reasoning);
    } catch (error) {
      console.error("AI Recommendation Error:", error);
    } finally {
      setIsRecommending(false);
    }
  };

  const filteredExercises = selectedMood 
    ? EXERCISES.filter(ex => ex.moods.includes(selectedMood))
    : EXERCISES;

  const handleLiveTranslate = async () => {
    if (!selectedExercise) return;
    setIsTranslating(true);
    
    const langNames: Record<Language, string> = {
      en: 'English',
      am: 'Amharic',
      om: 'Afaan Oromo',
      ti: 'Tigrigna',
      so: 'Somali',
      aa: 'Afar'
    };

    const translation = await translateVideoContent(
      selectedExercise.label.en,
      selectedExercise.description.en,
      langNames[language]
    );
    
    setLiveTranslation(translation);
    setIsTranslating(false);
    speak(translation, true);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTranslatorFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
      setTranslatorResult(null);
      setTranslatedAudioUrl(null);
    }
  };

  const processVideo = async () => {
    if (!translatorFile) return;
    setIsProcessingVideo(true);
    try {
      const langNames: Record<Language, string> = {
        en: 'English',
        am: 'Amharic',
        om: 'Afaan Oromo',
        ti: 'Tigrigna',
        so: 'Somali',
        aa: 'Afar'
      };

      let finalSourceLang = 'auto';
      if (sourceLanguage === 'other' && customSourceLanguage.trim()) {
        finalSourceLang = customSourceLanguage.trim();
      } else if (sourceLanguage !== 'auto') {
        finalSourceLang = langNames[sourceLanguage as Language];
      }

      const result = await processVideoFile(translatorFile, langNames[language], {
        sourceLanguage: finalSourceLang,
        voiceStyle,
        accent: voiceAccent,
        speed: voiceSpeed
      });
      setTranslatorResult(result);
      
      if (result.audioData) {
        const binary = atob(result.audioData);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'audio/wav' });
        setTranslatedAudioUrl(URL.createObjectURL(blob));
      }
    } catch (error) {
      console.error("Video Processing Error:", error);
      setToast("Failed to process video. Please try again.");
    } finally {
      setIsProcessingVideo(false);
    }
  };

  const downloadSRT = () => {
    if (!translatorResult?.subtitles) return;
    
    const formatTime = (seconds: number) => {
      const date = new Date(0);
      date.setSeconds(seconds);
      const ms = Math.floor((seconds % 1) * 1000);
      return date.toISOString().substr(11, 8) + ',' + ms.toString().padStart(3, '0');
    };

    const srtContent = translatorResult.subtitles.map((sub, i) => {
      return `${i + 1}\n${formatTime(sub.start)} --> ${formatTime(sub.end)}\n${sub.speaker ? `[${sub.speaker}] ` : ''}${sub.text}\n`;
    }).join('\n');

    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subtitles.srt';
    a.click();
  };

  const summarizeChat = async (history: { role: 'user' | 'assistant'; content: string }[]) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ text: `Summarize the following conversation between a user and a mental health assistant in Ethiopia. Focus on the user's emotional state and key topics discussed. Keep it concise (max 3 sentences).\n\nConversation:\n${history.map(m => `${m.role}: ${m.content}`).join('\n')}` }]
      });
      setChatSummary(response.text || '');
    } catch (error) {
      console.error("Summarization Error:", error);
    }
  };

  const handleIVRRequest = async (input: string | Blob) => {
    console.log("IVR Request Input:", typeof input === 'string' ? input : "Audio Blob");
    if (typeof input === 'string' && (!input || input.trim() === "")) {
      console.warn("Empty IVR input received");
      return;
    }
    setIsProcessingIVR(true);
    setIvrResponse(null);

    // Update history with user input if it's a string
    if (typeof input === 'string') {
      setChatHistory(prev => [...prev, { role: 'user', content: input, timestamp: new Date() }]);
    }

    try {
      const langNames: Record<Language, string> = {
        en: 'English',
        am: 'Amharic',
        om: 'Afaan Oromo',
        ti: 'Tigrigna',
        so: 'Somali',
        aa: 'Afar'
      };
      const availableExercises = EXERCISES.map(ex => ({
        id: ex.id,
        label: ex.label.en,
        description: ex.description.en
      }));

      const historyContext = chatHistory.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n');
      const summaryContext = chatSummary ? `Previous Summary: ${chatSummary}\n` : '';

      let result;
      if (typeof input === 'string') {
        const prompt = `You are a culturally sensitive AI mental health assistant designed for Ethiopia.
        
        CONTEXT:
        ${summaryContext}
        Recent Conversation:
        ${historyContext}
        
        USER INPUT: ${input}
        
        CORE RULES:
        1. Respond ONLY in ${langNames[language]}.
        2. Be calm, supportive, and non-judgmental.
        3. Use simple, clear, and respectful language.
        4. Avoid clinical or complex psychological jargon.
        5. Never diagnose medical conditions.
        6. If the user expresses self-harm or crisis: Respond with empathy, encourage contacting trusted people (family, friends, community leaders), and suggest local support resources.
        7. Provide culturally relevant examples (community, family, faith).
        8. Short, clear responses (max 6 sentences).
        9. Recommend a relevant exercise from this list: ${JSON.stringify(availableExercises)}
        
        Return your response in this STRICT JSON format:
        {
          "detected_mood": "...",
          "response_text": "...",
          "recommended_exercise_id": "..."
        }`;

        const aiResponse = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [{ text: prompt }],
          config: { responseMimeType: "application/json" }
        });
        const parsed = JSON.parse(aiResponse.text || "{}");
        result = {
          detected_mood: parsed.detected_mood || "Unknown",
          response_text: parsed.response_text || "I am here to support you.",
          recommended_exercise_id: parsed.recommended_exercise_id,
          audioData: undefined as string | undefined
        };

        // If voice is enabled, generate TTS for text input too
        if (isVoiceEnabled) {
          result.audioData = await generateAssistantVoice(result.response_text, {
            voiceStyle,
            accent: voiceAccent,
            speed: voiceSpeed
          });
        }
      } else {
        // Handle Audio Blob
        const base64Audio = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.readAsDataURL(input);
        });

        // Use Gemini to transcribe and process audio
        const aiResponse = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            {
              inlineData: {
                mimeType: input.type,
                data: base64Audio,
              },
            },
            {
              text: `You are a culturally sensitive AI mental health assistant designed for Ethiopia.
              
              CONTEXT:
              ${summaryContext}
              Recent Conversation:
              ${historyContext}
              
              CORE RULES:
              1. Transcribe the spoken audio.
              2. Respond ONLY in ${langNames[language]}.
              3. Be calm, supportive, and non-judgmental.
              4. Use simple, clear, and respectful language.
              5. Avoid clinical or complex psychological jargon.
              6. Never diagnose medical conditions.
              7. If the user expresses self-harm or crisis: Respond with empathy, encourage contacting trusted people (family, friends, community leaders), and suggest local support resources.
              8. Provide culturally relevant examples (community, family, faith).
              9. Short, clear responses (max 6 sentences).
              10. Recommend a relevant exercise from this list: ${JSON.stringify(availableExercises)}
              
              Return your response in this STRICT JSON format:
              {
                "transcription": "...",
                "detected_mood": "...",
                "response_text": "...",
                "recommended_exercise_id": "..."
              }`,
            },
          ],
          config: {
            responseMimeType: "application/json",
          }
        });

        const parsed = JSON.parse(aiResponse.text || "{}");
        
        // Update history with transcription if audio
        if (parsed.transcription) {
          setChatHistory(prev => [...prev, { role: 'user', content: parsed.transcription, timestamp: new Date() }]);
        }

        // Generate TTS for the response using our customizable utility
        const audioData = await generateAssistantVoice(parsed.response_text, {
          voiceStyle,
          accent: voiceAccent,
          speed: voiceSpeed
        });

        result = {
          detected_mood: parsed.detected_mood || "Unknown",
          response_text: parsed.response_text || "I am here to support you.",
          recommended_exercise_id: parsed.recommended_exercise_id,
          audioData
        };
      }

      // Update history with assistant response
      setChatHistory(prev => {
        const newHistory = [...prev, { role: 'assistant', content: result.response_text, timestamp: new Date() }];
        // Summarize if history exceeds 10 messages
        if (newHistory.length % 10 === 0) {
          summarizeChat(newHistory);
        }
        return newHistory;
      });

      console.log("IVR Response Result:", result);
      setIvrResponse(result);
      
      if (result.audioData) {
        try {
          const binary = atob(result.audioData);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'audio/wav' });
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audio.play().catch(e => {
            console.error("Audio Play Error:", e);
            speak(result.response_text);
          });
        } catch (atobError) {
          console.error("Base64 Decode Error:", atobError);
          speak(result.response_text);
        }
      } else {
        speak(result.response_text);
      }
    } catch (error) {
      console.error("IVR Processing Error:", error);
      setToast("Sorry, I couldn't process your request. Please try again.");
    } finally {
      setIsProcessingIVR(false);
    }
  };

  const startIVRVoiceInput = async () => {
    console.log("Starting IVR Voice Recording...");
    
    if (isRecording) {
      mediaRecorder?.stop();
      setIsRecording(false);
      setIsListening(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        handleIVRRequest(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setIsListening(true);
      
      // Auto stop after 10 seconds
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          setIsRecording(false);
          setIsListening(false);
        }
      }, 10000);

    } catch (err) {
      console.error("Microphone Access Error:", err);
      setToast("Microphone access is required for voice recording. Please enable it in your browser settings.");
    }
  };

  const handlePsychosocialRequest = async (input: string) => {
    if (!input.trim()) return;
    setIsPsychosocialLoading(true);
    setPsychosocialResponse(null);
    setPsychosocialRecommendations([]);
    setIsPsychosocialCrisis(false);
    
    try {
      const result = await getPsychosocialVideoRecommendation(input, language);
      setPsychosocialResponse(result.response_text);
      setPsychosocialRecommendations(result.recommendations);
      setIsPsychosocialCrisis(result.isCrisis);
      
      if (result.isCrisis) {
        setToast("Emergency guidance detected. Please stay safe.");
      }
    } catch (error) {
      setToast("Failed to get recommendations. Please try again.");
    } finally {
      setIsPsychosocialLoading(false);
    }
  };

  const handleCBTRequest = async (input: string) => {
    if (!input.trim()) return;
    
    // Optimistically update UI
    const newUserMsg = { role: 'user' as const, content: input };
    setCbtHistory(prev => [...prev, newUserMsg]);
    setCbtInput('');
    setIsCbtLoading(true);
    setIsCbtCrisis(false);
    
    try {
      const result = await getPsychosocialCBTSupport(input, cbtHistory, language);
      
      setCbtHistory(prev => [...prev, { role: 'assistant', content: result.response_text }]);
      setIsCbtCrisis(result.isCrisis);
      if (result.currentStep) {
        setCbtStep(result.currentStep);
      }
      
      if (result.isCrisis) {
        setToast("Emergency guidance detected. Help is available.");
      }
    } catch (error) {
      setToast("Failed to connect. Please try again.");
    } finally {
      setIsCbtLoading(false);
    }
  };

  useEffect(() => {
    if (currentScreen === 'healthCenters' && !userLocation && !isLocating) {
      requestLocation();
    }
  }, [currentScreen]);

  useEffect(() => {
    if (currentScreen === 'welcome' && hasCompletedOnboarding) {
      setCurrentScreen('dashboard');
    }
  }, [currentScreen, hasCompletedOnboarding]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-background relative overflow-hidden">
            {/* Language Selection Tab */}
            <div className="absolute top-6 right-6 z-50">
              <div className="relative">
                <button 
                  onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                  className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-2 border-primary/10 px-4 py-2 rounded-2xl shadow-sm hover:border-primary/30 transition-all active:scale-95"
                >
                  <Globe size={18} className="text-primary" />
                  <span className="text-sm font-bold text-slate-700">
                    {LANGUAGES.find(l => l.code === language)?.native || 'Language'}
                  </span>
                  <ChevronDown size={14} className={cn("text-slate-400 transition-transform", isLanguageMenuOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {isLanguageMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border-2 border-primary/5 overflow-hidden ring-4 ring-black/5"
                    >
                      <div className="py-1">
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setLanguage(lang.code);
                              setIsLanguageMenuOpen(false);
                            }}
                            className={cn(
                              "w-full text-left px-4 py-3 text-sm font-bold transition-all flex items-center justify-between",
                              language === lang.code 
                                ? "text-primary bg-primary/10" 
                                : "text-slate-600 hover:bg-slate-50"
                            )}
                          >
                            <span>{lang.native}</span>
                            {language === lang.code && <Check size={16} className="text-primary stroke-[3px]" />}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="mb-8 relative">
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl -z-10 scale-150" />
              <img 
                src="/logo-selammind.svg" 
                alt="SelamMind" 
                width="180" 
                className="mx-auto"
                referrerPolicy="no-referrer"
              />
            </div>

            <h1 className="text-3xl font-display font-black text-primary mb-2">Welcome to SelamMind</h1>
            <p className="text-lg text-foreground/80 mb-6 font-sans">Your safe, confidential space for mental wellbeing.</p>

            <div className="space-y-1 mb-10">
              <p className="text-xl font-display text-primary font-bold">እንኳን ወደ SelamMind በደህና መጡ</p>
              <p className="text-lg text-foreground/70">ለአእምሮ ጤናዎ የተዘጋጀ የግል ቦታ</p>
            </div>

            <div className="flex flex-col space-y-4 w-full max-w-xs">
              <button 
                onClick={() => {
                  if (hasCompletedOnboarding) {
                    setCurrentScreen('mood');
                  } else {
                    setCurrentScreen('onboarding');
                    setOnboardingStep(0);
                  }
                }}
                className="button-primary w-full text-xl py-4 shadow-xl"
              >
                Start Chat
              </button>

              <button 
                onClick={() => setCurrentScreen('crisis')}
                className="button-secondary w-full text-xl py-4"
              >
                Emergency Help
              </button>
            </div>

            <div className="mt-auto pt-12 text-sm text-gray-400">
              <p>Your journey to wellness begins here.</p>
            </div>
          </div>
        );

      case 'languageSelect':
        return (
          <div className="flex flex-col h-full p-6 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setCurrentScreen('welcome')} 
                  className="p-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={t('back')}
                >
                  <ChevronLeft size={32} />
                </button>
                <h2 className="text-2xl font-bold">Choose Language</h2>
              </div>
              <button 
                onClick={() => setShowResetConfirm(true)}
                className="p-2 rounded-full bg-gray-100 text-gray-500 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                title="Reset"
                aria-label="Reset application"
              >
                <RotateCcw size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    if (!hasCompletedOnboarding) {
                      setCurrentScreen('onboarding');
                    } else {
                      setCurrentScreen('mood');
                    }
                  }}
                  className={cn(
                    "flex items-center justify-between p-6 rounded-3xl border-2 transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-primary/20",
                    language === lang.code 
                      ? (highContrast ? "border-black bg-black text-white" : "border-primary bg-primary/5 ring-2 ring-primary/10") 
                      : (highContrast ? "border-gray-400 bg-white text-black" : "border-gray-100 bg-white hover:border-primary/30")
                  )}
                  aria-label={`Select ${lang.label}`}
                  aria-pressed={language === lang.code}
                >
                  <div className="text-left">
                    <p className={cn(
                      "text-2xl font-display font-black",
                      language === lang.code ? "text-primary" : "text-slate-900"
                    )}>{lang.native}</p>
                    <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mt-1">{lang.label}</p>
                  </div>
                  {language === lang.code ? (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20"
                    >
                      <Check size={24} className="stroke-[3px]" />
                    </motion.div>
                  ) : (
                    <Globe size={32} className="text-slate-200" />
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 'onboarding':
        const steps = [
          {
            title: t('onboardingWelcome'),
            desc: t('onboardingMoodDesc'),
            icon: <Smile size={80} className="text-[#06D6A0]" />,
            color: 'bg-[#06D6A0]/10',
            accent: 'text-[#06D6A0]'
          },
          {
            title: t('onboardingMood'),
            desc: t('onboardingMoodDesc'),
            icon: <Activity size={80} className="text-[#118AB2]" />,
            color: 'bg-[#118AB2]/10',
            accent: 'text-[#118AB2]'
          },
          {
            title: t('onboardingExercise'),
            desc: t('onboardingExerciseDesc'),
            icon: <Heart size={80} className="text-[#EF476F]" />,
            color: 'bg-[#EF476F]/10',
            accent: 'text-[#EF476F]'
          },
          {
            title: t('onboardingAI'),
            desc: t('onboardingAIDesc'),
            icon: <Mic size={80} className="text-[#FFD166]" />,
            color: 'bg-[#FFD166]/10',
            accent: 'text-[#FFD166]'
          },
          {
            title: t('onboardingEmergency'),
            desc: t('onboardingEmergencyDesc'),
            icon: <PhoneCall size={80} className="text-[#073B4C]" />,
            color: 'bg-[#073B4C]/10',
            accent: 'text-[#073B4C]'
          }
        ];

        return (
          <div className="flex flex-col h-full p-8 space-y-8 overflow-y-auto bg-white">
            <div className="flex justify-between items-center">
              <button 
                onClick={() => {
                  setHasCompletedOnboarding(true);
                  setCurrentScreen('mood');
                }}
                className="text-sm font-bold text-gray-400 hover:text-[#118AB2] transition-colors"
              >
                {t('skip') || 'Skip'}
              </button>
              <div className="flex space-x-1.5">
                {steps.map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-500",
                      i === onboardingStep ? "w-6 bg-[#118AB2]" : "w-1.5 bg-gray-100"
                    )}
                  />
                ))}
              </div>
              <button 
                onClick={() => speak(steps[onboardingStep].title + ". " + steps[onboardingStep].desc, true)}
                className="p-2 rounded-full bg-gray-50 text-[#118AB2]"
                aria-label="Play audio"
              >
                <Volume2 size={20} />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10 py-8">
              <motion.div
                key={onboardingStep}
                initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className={cn("w-48 h-48 rounded-[3rem] flex items-center justify-center shadow-2xl shadow-inner relative", steps[onboardingStep].color)}
              >
                <div className="absolute inset-0 rounded-[3rem] border-4 border-white/50" />
                {steps[onboardingStep].icon}
              </motion.div>
              
              <div className="space-y-6 max-w-sm">
                <motion.h2 
                  key={`title-${onboardingStep}`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className={cn("text-4xl font-black leading-tight tracking-tight", steps[onboardingStep].accent)}
                >
                  {steps[onboardingStep].title}
                </motion.h2>
                <motion.p 
                  key={`desc-${onboardingStep}`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-gray-500 text-xl font-medium leading-relaxed"
                >
                  {steps[onboardingStep].desc}
                </motion.p>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => {
                  if (onboardingStep < steps.length - 1) {
                    setOnboardingStep(prev => prev + 1);
                  } else {
                    setHasCompletedOnboarding(true);
                    setCurrentScreen('mood');
                  }
                }}
                className="w-full p-6 bg-[#118AB2] text-white rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-[#118AB2]/30 active:scale-95 transition-transform flex items-center justify-center space-x-3"
              >
                <span>{onboardingStep < steps.length - 1 ? t('next') : t('finish')}</span>
                <ChevronRight size={32} strokeWidth={3} />
              </button>
              
              {onboardingStep > 0 && (
                <button
                  onClick={() => setOnboardingStep(prev => prev - 1)}
                  className="w-full p-4 text-gray-400 font-bold hover:text-gray-600 transition-colors text-lg"
                >
                  {t('back')}
                </button>
              )}
            </div>
          </div>
        );

      case 'mood':
        return (
          <div className="flex flex-col h-full p-6 space-y-8 overflow-y-auto pb-24">
            <div className="flex items-center justify-between">
              <div className="w-10" /> {/* Spacer */}
              <h2 className="text-3xl font-bold text-center">{t('howFeel')}</h2>
              <button 
                onClick={() => setShowResetConfirm(true)}
                className="p-2 rounded-full bg-gray-100 text-gray-500 hover:text-[#118AB2] transition-colors"
                title="Reset"
              >
                <RotateCcw size={24} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {MOODS.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => handleMoodSelect(mood.id)}
                  className={cn(
                    "flex flex-col items-center p-6 rounded-3xl shadow-lg transition-transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-black/20",
                    mood.color
                  )}
                  aria-label={mood.label[language]}
                  aria-pressed={selectedMood === mood.id}
                >
                  <AnimatedIcon name={mood.icon as any} size={64} color="white" />
                  <span className="mt-4 text-white text-xl font-bold">
                    {mood.label[language]}
                  </span>
                </button>
              ))}
            </div>
            <button 
              onClick={() => setCurrentScreen('crisis')}
              className="mt-auto bg-[#EF476F] p-6 rounded-3xl flex items-center justify-center space-x-4 shadow-xl active:scale-95 transition-transform"
              aria-label={t('emergency')}
            >
              <AnimatedIcon name="AlertTriangle" size={32} animation="alert" color="white" />
              <span className="text-white text-2xl font-black uppercase tracking-widest">
                {t('emergency')}
              </span>
            </button>
          </div>
        );

      case 'exercises':
        const currentMoodObj = MOODS.find(m => m.id === selectedMood);
        return (
          <div className="flex flex-col h-full p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setCurrentScreen('dashboard')} 
                  className="p-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#118AB2]"
                  aria-label={t('back')}
                >
                  <ChevronLeft size={32} />
                </button>
                <h2 className="text-2xl font-bold">Exercises</h2>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setCurrentScreen('search')}
                  className="p-2 rounded-full bg-gray-100 text-gray-500 hover:text-[#118AB2] transition-colors focus:outline-none focus:ring-2 focus:ring-[#118AB2]"
                  aria-label={t('search')}
                >
                  <Search size={24} />
                </button>
                {selectedMood && (
                  <button 
                    onClick={() => setSelectedMood(null)}
                    className="text-sm font-bold text-[#118AB2] mr-2 focus:outline-none focus:underline"
                  >
                    Show All
                  </button>
                )}
                <button 
                  onClick={() => setShowResetConfirm(true)}
                  className="p-2 rounded-full bg-gray-100 text-gray-500 hover:text-[#118AB2] transition-colors focus:outline-none focus:ring-2 focus:ring-[#118AB2]"
                  title="Reset"
                  aria-label="Reset application"
                >
                  <RotateCcw size={24} />
                </button>
              </div>
            </div>

            {selectedMood && (
              <div className={cn("p-4 rounded-2xl flex items-center space-x-3", currentMoodObj?.color + "/10")}>
                <div className={cn("p-2 rounded-lg", currentMoodObj?.color)}>
                  <AnimatedIcon name={currentMoodObj?.icon as any} size={24} color="white" />
                </div>
                <p className="font-medium text-sm">
                  Recommended for feeling <span className="font-bold">{currentMoodObj?.label[language]}</span>
                </p>
              </div>
            )}

            {isRecommending && (
              <div className="p-6 bg-white rounded-3xl shadow-md border-2 border-[#118AB2]/10 animate-pulse flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <RotateCcw className="animate-spin text-[#118AB2]" size={24} />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
            )}

            {aiRecommendation && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-[#06D6A0]/10 rounded-3xl border-2 border-[#06D6A0]/20 space-y-3 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-2 bg-[#06D6A0] text-white text-[10px] font-bold rounded-bl-xl uppercase tracking-widest">
                  AI Suggestion
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#06D6A0] rounded-2xl flex items-center justify-center shadow-lg">
                    <Heart size={24} color="white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#06D6A0] mb-1">Personalized Recommendation</p>
                    <p className="text-gray-800 font-medium leading-tight">
                      {aiRecommendation.reasoning}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const ex = EXERCISES.find(e => e.id === aiRecommendation.exerciseId);
                    if (ex) {
                      if (ex.id === 'breathing') {
                        setCurrentScreen('breathing');
                      } else {
                        setSelectedExercise(ex);
                        setCurrentScreen('exerciseDetail');
                      }
                    }
                  }}
                  className="w-full mt-2 bg-[#06D6A0] text-white py-3 rounded-xl font-bold shadow-md active:scale-95 transition-transform flex items-center justify-center space-x-2"
                >
                  <span>Start Recommended Exercise</span>
                  <ChevronLeft className="rotate-180" size={20} />
                </button>
              </motion.div>
            )}
            
            <div className="space-y-8 overflow-y-auto pb-20">
              {selectedMood ? (
                <div className="space-y-4">
                  {filteredExercises.map((ex) => (
                    <button
                      key={ex.id}
                      onClick={() => {
                        if (ex.id === 'breathing') {
                          setCurrentScreen('breathing');
                        } else {
                          setSelectedExercise(ex);
                          setCurrentScreen('exerciseDetail');
                        }
                      }}
                      className="w-full flex items-center p-6 bg-white rounded-3xl shadow-md border-2 border-gray-50 hover:border-[#06D6A0] transition-all"
                    >
                      <div className="p-4 bg-[#118AB2]/10 rounded-2xl mr-6">
                        <AnimatedIcon name={ex.icon as any} size={48} color="#118AB2" animation="pulse" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-2xl font-bold">{ex.label[language]}</h3>
                        <p className="text-gray-500">{ex.description[language]}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                MOODS.map((mood) => {
                  const moodExercises = EXERCISES.filter(ex => ex.moods.includes(mood.id));
                  if (moodExercises.length === 0) return null;
                  return (
                    <div key={mood.id} className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className={cn("w-1.5 h-6 rounded-full", mood.color)} />
                        <h3 className="text-xl font-black text-gray-800">{mood.label[language]}</h3>
                      </div>
                      <div className="flex space-x-4 overflow-x-auto pb-4 -mx-2 px-2 snap-x">
                        {moodExercises.map((ex) => (
                          <button
                            key={`${mood.id}-${ex.id}`}
                            onClick={() => {
                              if (ex.id === 'breathing') {
                                setCurrentScreen('breathing');
                              } else {
                                setSelectedExercise(ex);
                                setCurrentScreen('exerciseDetail');
                              }
                            }}
                            className="flex-shrink-0 w-64 p-5 bg-white rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-4 snap-start active:scale-95 transition-transform"
                          >
                            <div className="p-4 bg-gray-50 rounded-2xl">
                              <AnimatedIcon name={ex.icon as any} size={40} color="#118AB2" />
                            </div>
                            <div>
                              <p className="font-bold text-lg leading-tight">{ex.label[language]}</p>
                              <p className="text-sm text-gray-400 mt-1 line-clamp-2">{ex.description[language]}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );

      case 'exerciseDetail':
        if (!selectedExercise) return null;
        return (
          <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto pb-24">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button onClick={() => setCurrentScreen('exercises')} className="p-2 rounded-full bg-gray-100">
                  <ChevronLeft size={32} />
                </button>
                <h2 className="text-2xl font-bold">{selectedExercise.label[language]}</h2>
              </div>
              <button 
                onClick={() => setShowResetConfirm(true)}
                className="p-2 rounded-full bg-gray-100 text-gray-500 hover:text-[#118AB2] transition-colors"
                title="Reset"
              >
                <RotateCcw size={24} />
              </button>
            </div>

            {selectedExercise.videoUrls?.[language] ? (
              <div className="space-y-2">
                <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-xl bg-black relative">
                  <iframe
                    key={`${selectedExercise.id}-${language}-${videoKey}`}
                    width="100%"
                    height="100%"
                    src={selectedExercise.videoUrls[language]}
                    title={selectedExercise.label[language]}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full z-10"
                    onLoad={() => {
                      setVideoLoading(false);
                      setVideoError(false);
                    }}
                  ></iframe>
                  {videoLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-20">
                      <div className="flex flex-col items-center space-y-4 p-6 text-center">
                        {!videoError ? (
                          <>
                            <div className="w-12 h-12 border-4 border-[#06D6A0] border-t-transparent rounded-full animate-spin" />
                            <p className="text-white text-sm font-medium">Loading Video...</p>
                          </>
                        ) : (
                          <>
                            <AlertTriangle size={48} className="text-[#FFD166]" />
                            <p className="text-white text-sm font-medium">Video taking longer than expected.</p>
                            <button 
                              onClick={reloadVideo}
                              className="mt-2 px-6 py-2 bg-[#118AB2] text-white rounded-full font-bold text-sm relative z-30"
                            >
                              Retry Loading
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    {language === 'en' ? 'Video with English audio' : `Video will attempt to show ${LANGUAGES.find(l => l.code === language)?.label} captions if available.`}
                  </p>
                  {selectedExercise.audioDescription && (
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => speak(selectedExercise.audioDescription![language], true)}
                        className="flex items-center space-x-1 text-[#118AB2] text-xs font-bold hover:underline"
                      >
                        <Volume2 size={14} />
                        <span>{t('audioDescription')}</span>
                      </button>
                      <button 
                        onClick={handleLiveTranslate}
                        disabled={isTranslating}
                        className={cn(
                          "flex items-center space-x-1 text-[#06D6A0] text-xs font-bold hover:underline",
                          isTranslating && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <Globe size={14} className={isTranslating ? "animate-spin" : ""} />
                        <span>{isTranslating ? t('translating') : t('liveTranslation')}</span>
                      </button>
                    </div>
                  )}
                </div>
                {liveTranslation && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 p-3 bg-[#06D6A0]/10 rounded-xl border border-[#06D6A0]/20"
                  >
                    <p className="text-xs font-medium text-[#06D6A0] italic">
                      "{liveTranslation}"
                    </p>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="w-full aspect-video rounded-3xl bg-gray-100 flex items-center justify-center">
                <p className="text-gray-400 italic">No video available for this exercise.</p>
              </div>
            )}

            <div className="bg-white p-8 rounded-[2.5rem] shadow-lg space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold">About this exercise</h3>
                <p className="text-gray-600 leading-relaxed">
                  {selectedExercise.description[language]}
                </p>
              </div>

              <button 
                onClick={() => {
                  setExerciseToComplete(selectedExercise.id);
                  setShowCompleteConfirm(true);
                }}
                className="w-full bg-[#06D6A0] text-white py-5 rounded-3xl font-black text-xl shadow-xl active:scale-95 transition-transform flex items-center justify-center space-x-3"
              >
                <Sparkles size={28} />
                <span>{t('completeExercise')}</span>
              </button>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Benefits</p>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-[#06D6A0] rounded-full" />
                    <span>Reduces stress and anxiety</span>
                  </li>
                  <li className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-[#06D6A0] rounded-full" />
                    <span>Improves mental clarity</span>
                  </li>
                  <li className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-[#06D6A0] rounded-full" />
                    <span>Promotes emotional balance</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Related Exercises */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold px-2">Related Exercises</h3>
              <div className="flex space-x-4 overflow-x-auto pb-4 px-2 scrollbar-hide">
                {EXERCISES.filter(ex => ex.id !== selectedExercise.id).slice(0, 4).map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => {
                      setSelectedExercise(ex);
                      setVideoLoading(true);
                      setVideoKey(prev => prev + 1);
                    }}
                    className="flex-shrink-0 w-48 bg-white p-4 rounded-3xl shadow-md border-2 border-gray-50 hover:border-primary transition-all text-left"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                      <AnimatedIcon name={ex.icon as any} size={24} color="var(--color-primary)" />
                    </div>
                    <h4 className="font-bold text-sm mb-1 line-clamp-1">{ex.label[language]}</h4>
                    <p className="text-[10px] text-gray-500 line-clamp-2">{ex.description[language]}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="h-12" /> {/* Bottom spacer */}
          </div>
        );

      case 'breathing':
        return (
          <div className="flex flex-col items-center justify-center h-full p-6 bg-[#118AB2]/5">
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
              <button 
                onClick={() => setCurrentScreen('exercises')} 
                className="p-4 rounded-full bg-white shadow-md"
              >
                <ChevronLeft size={32} />
              </button>
              <button 
                onClick={() => setShowResetConfirm(true)}
                className="p-4 rounded-full bg-white shadow-md text-gray-500 hover:text-[#118AB2] transition-colors"
                title="Reset"
              >
                <RotateCcw size={32} />
              </button>
            </div>
            
            <div className="relative flex items-center justify-center w-64 h-64">
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-[#06D6A0] rounded-full"
              />
              <AnimatedIcon name="Wind" size={100} color="white" className="z-10" />
            </div>
            
            <h2 className="mt-12 text-4xl font-bold text-[#118AB2]">
              {EXERCISES.find(e => e.id === 'breathing')?.label[language]}
            </h2>
            <p className="mt-4 text-xl text-gray-600 text-center">
              {EXERCISES.find(e => e.id === 'breathing')?.description[language]}
            </p>

            <button 
              onClick={() => {
                setExerciseToComplete('breathing');
                setShowCompleteConfirm(true);
              }}
              className="mt-12 bg-[#06D6A0] text-white px-12 py-5 rounded-3xl font-black text-xl shadow-xl active:scale-95 transition-transform flex items-center justify-center space-x-3"
            >
              <Sparkles size={28} />
              <span>{t('completeExercise')}</span>
            </button>

            <button 
              onClick={() => {
                const ex = EXERCISES.find(e => e.id === 'breathing');
                if (ex) {
                  setSelectedExercise(ex);
                  setCurrentScreen('exerciseDetail');
                }
              }}
              className="mt-8 flex items-center space-x-2 text-[#118AB2] font-bold"
            >
              <AnimatedIcon name="Zap" size={20} color="#118AB2" />
              <span>Watch Video Guide</span>
            </button>

            <button 
              onClick={() => setCurrentScreen('exercises')}
              className="mt-8 text-gray-500 font-bold hover:text-[#118AB2] transition-colors"
            >
              {t('skipExercise')}
            </button>
          </div>
        );

      case 'crisis':
        return (
          <div className="flex flex-col h-full p-6 bg-danger/5 space-y-8 overflow-y-auto pb-24">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setCurrentScreen('welcome')} 
                className="p-2 rounded-full bg-white shadow-md text-foreground"
                aria-label={t('back')}
              >
                <ChevronLeft size={32} />
              </button>
              <AnimatedIcon name="AlertTriangle" size={48} animation="alert" color="var(--color-danger)" />
              <div className="w-12" /> {/* Spacer */}
            </div>
            
            <div className="space-y-6">
              <h2 className="text-4xl font-display font-black text-danger">Emergency Support</h2>
              
              <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 space-y-4">
                <p className="text-xl font-sans font-bold text-foreground">If you are in danger, please contact:</p>
                <ul className="list-disc list-inside space-y-2 text-lg text-foreground/80 font-sans pl-2">
                  <li>Local Hospital</li>
                  <li>Emergency Services: 911 / local equivalents</li>
                </ul>

                <p className="text-xl font-display font-medium text-danger leading-relaxed pt-4 border-t border-gray-50">
                  አደጋ ላይ ከሆኑ እባክዎ ወደ ሆስፒታል ይሂዱ
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <a 
                href="tel:911"
                className="w-full bg-danger text-white p-8 rounded-3xl flex items-center justify-between shadow-xl active:scale-95 transition-transform no-underline"
              >
                <div className="flex items-center space-x-4">
                  <Phone size={32} />
                  <span className="text-2xl font-display font-black">{t('callEmergency') || 'Call 911'}</span>
                </div>
                <span className="text-3xl font-display font-black">911</span>
              </a>
              
              <button 
                onClick={() => setCurrentScreen('healthCenters')}
                className="w-full bg-white border-2 border-primary text-primary p-6 rounded-3xl flex items-center justify-center space-x-4 font-sans font-bold text-xl active:scale-95 transition-transform"
              >
                <MapIcon size={32} />
                <span>Nearby Hospital Mapping</span>
              </button>

              <button 
                onClick={() => setCurrentScreen('psychosocialSupport')}
                className="w-full bg-white border-2 border-danger text-danger p-6 rounded-3xl flex items-center justify-center space-x-4 font-sans font-bold text-xl active:scale-95 transition-transform"
              >
                <Heart size={32} />
                <span>{t('psychosocialTitle')}</span>
              </button>
            </div>
          </div>
        );

      case 'psychosocialSupport':
        return (
          <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto pb-24">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button onClick={() => setCurrentScreen('crisis')} className="p-2 rounded-full bg-gray-100">
                  <ChevronLeft size={32} />
                </button>
                <h2 className="text-2xl font-bold">{t('psychosocialTitle')}</h2>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setCurrentScreen('psychosocialAssistant')}
                  className="bg-indigo-600 text-white p-2 rounded-xl flex items-center space-x-2 shadow-md active:scale-95 transition-transform"
                  title="Video Recommendations"
                >
                  <Video size={18} className="text-indigo-200" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Videos</span>
                </button>
                <button 
                  onClick={() => setCurrentScreen('cbtSupport')}
                  className="bg-emerald-600 text-white p-2 rounded-xl flex items-center space-x-2 shadow-md active:scale-95 transition-transform"
                  title="Interactive CBT Support"
                >
                  <Brain size={18} className="text-emerald-200" />
                  <span className="text-[10px] font-black uppercase tracking-wider">CBT Chat</span>
                </button>
                <button 
                  onClick={() => setShowResetConfirm(true)}
                  className="p-2 rounded-xl bg-gray-100 text-gray-400 hover:text-danger transition-colors"
                  title="Reset"
                >
                  <RotateCcw size={20} />
                </button>
              </div>
            </div>

            <div className="bg-[#EF476F]/10 p-6 rounded-3xl border-2 border-[#EF476F]/20">
              <p className="text-sm font-medium text-[#EF476F]">
                {t('psychosocialDesc')}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {PSYCHOSOCIAL_SUPPORT.map((support) => (
                <div 
                  key={support.id}
                  className="bg-white p-6 rounded-3xl shadow-md border-2 border-gray-50 flex flex-col space-y-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className={cn("p-4 rounded-2xl text-white shadow-lg", support.color)}>
                      <AnimatedIcon name={support.icon as any} size={32} color="white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{support.title[language]}</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Support Category</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl italic">
                    "{support.description[language]}"
                  </p>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('guidance' as any) || 'Immediate Guidance'}</p>
                    <ul className="space-y-2">
                      {support.guidance.map((step, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700">
                          <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0", support.color)} />
                          <span>{step[language]}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button 
                      onClick={() => {
                        // For now, these direct to counselors list for human support
                        setCurrentScreen('counselorList');
                        setToast(`Showing counselors specialized in ${support.title[language]}`);
                      }}
                      className={cn("flex-1 py-4 rounded-2xl font-black text-sm text-white shadow-lg shadow-black/5 active:scale-95 transition-transform", support.color)}
                    >
                      Find Specialists
                    </button>
                    <button 
                      onClick={() => {
                        setChatHistory(prev => [...prev, { role: 'user', content: `Tell me more about ${support.title[language]} and how I can find help for this.`, timestamp: new Date() }]);
                        setCurrentScreen('voiceAssistant');
                        handleIVRRequest(`Tell me more about ${support.title[language]} and how I can find help for this.`);
                      }}
                      className="px-6 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold text-sm active:scale-95 transition-transform"
                    >
                      Ask AI
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-[#118AB2]/5 rounded-3xl border-2 border-[#118AB2]/10">
              <p className="text-sm text-gray-500 text-center">
                Your safety and mental well-being are confidential. If you are in immediate danger, please use the emergency call button.
              </p>
            </div>
          </div>
        );

      case 'cbtSupport':
        const cbtSteps = [
          { num: 1, label: { en: 'Problem', am: 'ችግር', om: 'Rakkata', ti: 'ጸገም', so: 'Dhibaatada', aa: 'Dhib' } },
          { num: 2, label: { en: 'Thoughts', am: 'ሀሳብ', om: 'Yaada', ti: 'ሓሳብ', so: 'Fikirka', aa: 'Siit' } },
          { num: 3, label: { en: 'Patterns', am: 'ሁኔታዎች', om: 'Amala', ti: 'ኩነታት', so: 'Habka', aa: 'Ayyo' } },
          { num: 4, label: { en: 'Reframe', am: 'ለውጥ', om: 'Jijjiirraa', ti: 'ለውጢ', so: 'Beddela', aa: 'Kor' } },
          { num: 5, label: { en: 'Action', am: 'ተግባር', om: 'Gocha', ti: 'ተግባር', so: 'Tallaabo', aa: 'Abe' } }
        ];

        return (
          <div className="flex flex-col h-full bg-emerald-50/30">
            <div className="p-6 bg-white border-b-2 border-emerald-100 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button onClick={() => setCurrentScreen('psychosocialSupport')} className="p-2 rounded-full bg-slate-50">
                  <ChevronLeft size={24} />
                </button>
                <div className="flex flex-col">
                  <h2 className="text-lg font-black text-emerald-900 leading-none">CBT Support Assistant</h2>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Cognitive Behavioral Support</span>
                </div>
              </div>
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full">
                <Brain size={20} />
              </div>
            </div>

            {/* Step Indicator */}
            <div className="bg-white px-6 py-4 border-b border-emerald-100">
              <div className="flex justify-between items-center relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-50 -translate-y-1/2 z-0" />
                <div 
                  className="absolute top-1/2 left-0 h-0.5 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500" 
                  style={{ width: `${(cbtStep - 1) / (cbtSteps.length - 1) * 100}%` }}
                />
                
                {cbtSteps.map((step) => (
                  <div key={step.num} className="relative z-10 flex flex-col items-center">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all border-2",
                      cbtStep >= step.num 
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200" 
                        : "bg-white border-emerald-100 text-emerald-300"
                    )}>
                      {cbtStep > step.num ? <Check size={14} className="stroke-[3px]" /> : step.num}
                    </div>
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-tighter mt-1",
                      cbtStep === step.num ? "text-emerald-600" : "text-emerald-200"
                    )}>
                      {step.label[language] || step.label.en}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
              <div className="bg-white p-5 rounded-3xl border-2 border-emerald-50 shadow-sm space-y-3">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                    <Sparkles size={16} />
                  </div>
                  <span className="text-xs font-black text-emerald-900 uppercase">Interactive Session</span>
                </div>
                <p className="text-sm font-medium text-emerald-800 leading-relaxed">
                  I'm here to guide you through structured, supportive steps using CBT principles. We'll work together to identify thoughts and find small, practical actions to help you feel better.
                </p>
              </div>

              {cbtHistory.length === 0 && (
                <div className="grid grid-cols-1 gap-2 pt-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 pb-1 text-center">Suggested Topics</p>
                  <button 
                    onClick={() => handleCBTRequest("I'm feeling very overwhelmed with my thoughts.")}
                    className="p-4 bg-white border border-emerald-100 rounded-2xl text-left text-xs font-bold text-slate-700 hover:bg-emerald-50 transition-colors shadow-sm"
                  >
                    I'm feeling overwhelmed with thoughts
                  </button>
                  <button 
                    onClick={() => handleCBTRequest("I'm struggling to find motivation today.")}
                    className="p-4 bg-white border border-emerald-100 rounded-2xl text-left text-xs font-bold text-slate-700 hover:bg-emerald-50 transition-colors shadow-sm"
                  >
                    I'm struggling to find motivation
                  </button>
                  <button 
                    onClick={() => handleCBTRequest("Help me reframe a negative thought I'm having.")}
                    className="p-4 bg-white border border-emerald-100 rounded-2xl text-left text-xs font-bold text-slate-700 hover:bg-emerald-50 transition-colors shadow-sm"
                  >
                    Help me reframe a negative thought
                  </button>
                </div>
              )}

              <AnimatePresence>
                {cbtHistory.map((chat, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={cn(
                      "flex",
                      chat.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed shadow-sm",
                      chat.role === 'user' 
                        ? "bg-emerald-600 text-white rounded-tr-none shadow-emerald-200" 
                        : "bg-white text-slate-800 rounded-tl-none border border-emerald-50"
                    )}>
                      {chat.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isCbtLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-3xl rounded-tl-none border border-emerald-50 flex space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              {isCbtCrisis && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-danger/10 p-6 rounded-3xl border-2 border-danger/20 flex flex-col items-center space-y-4"
                >
                  <ShieldAlert size={40} className="text-danger" />
                  <p className="text-sm font-bold text-danger text-center">
                    I'm concerned about your safety. Please reach out to emergency services or someone you trust right now.
                  </p>
                  <button 
                    onClick={() => setCurrentScreen('crisis')}
                    className="bg-danger text-white px-8 py-3 rounded-xl font-black text-xs active:scale-95 transition-transform shadow-lg shadow-danger/30"
                  >
                    GO TO CRISIS SUPPORT
                  </button>
                </motion.div>
              )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t-2 border-emerald-100 flex justify-center">
              <div className="w-full max-w-2xl flex items-center space-x-2">
                <input 
                  value={cbtInput}
                  onChange={(e) => setCbtInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCBTRequest(cbtInput)}
                  placeholder="Share what's on your mind..."
                  className="flex-1 bg-slate-50 border-2 border-emerald-50 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:border-emerald-400 transition-colors"
                />
                <button 
                  onClick={() => handleCBTRequest(cbtInput)}
                  disabled={isCbtLoading || !cbtInput.trim()}
                  className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-all active:scale-95 shadow-md",
                    isCbtLoading || !cbtInput.trim() ? "bg-slate-300 shadow-none cursor-not-allowed" : "bg-emerald-600 shadow-emerald-200"
                  )}
                >
                  <Send size={24} />
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'psychosocialAssistant':
        return (
          <div className="flex flex-col h-full bg-slate-50">
            <div className="p-6 bg-white border-b-2 border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button onClick={() => setCurrentScreen('psychosocialSupport')} className="p-2 rounded-full bg-slate-50">
                  <ChevronLeft size={24} />
                </button>
                <div className="flex flex-col">
                  <h2 className="text-lg font-black text-slate-900 leading-none">AI Video Assistant</h2>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Psychosocial Support</span>
                </div>
              </div>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full">
                <Sparkles size={20} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-32">
              <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shrink-0">
                    <Brain size={20} />
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">
                      Hello! I'm your AI Psychosocial Support Assistant. How are you feeling right now?
                    </p>
                    <p className="text-xs text-slate-500 italic">
                      Examples: "I'm feeling very stressed", "I can't sleep", "I feel overwhelmed with work"
                    </p>
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {isPsychosocialLoading ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex justify-center py-10"
                  >
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </motion.div>
                ) : psychosocialResponse ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="bg-indigo-50 p-6 rounded-3xl border-2 border-indigo-100">
                      <p className="text-sm text-indigo-900 font-medium leading-relaxed">
                        {psychosocialResponse}
                      </p>
                    </div>

                    {!isPsychosocialCrisis && psychosocialRecommendations.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1 flex items-center space-x-2">
                          <Video size={14} />
                          <span>Recommended Support Videos</span>
                        </h3>
                        {psychosocialRecommendations.map((video, idx) => (
                          <div 
                            key={idx}
                            className="bg-white overflow-hidden rounded-3xl border-2 border-slate-50 shadow-sm hover:border-indigo-200 transition-colors"
                          >
                            <div className="p-5 space-y-3">
                              <div className="flex items-start justify-between">
                                <h4 className="text-sm font-black text-slate-900 leading-tight flex-1 pr-4">
                                  {video.title}
                                </h4>
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg shrink-0">
                                  {video.duration}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 leading-relaxed">
                                {video.explanation}
                              </p>
                              <a 
                                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(video.searchKeyword)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 text-indigo-600 text-xs font-bold pt-1"
                              >
                                <span>Watch on YouTube</span>
                                <ChevronRight size={14} />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {isPsychosocialCrisis && (
                      <button 
                        onClick={() => setCurrentScreen('crisis')}
                        className="w-full bg-danger text-white p-5 rounded-2xl flex items-center justify-center space-x-3 font-bold shadow-lg shadow-danger/20"
                      >
                        <ShieldAlert size={20} />
                        <span>Go to Emergency Support</span>
                      </button>
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t-2 border-slate-100">
              <div className="max-w-2xl mx-auto flex items-center space-x-3">
                <input 
                  value={psychosocialInput}
                  onChange={(e) => setPsychosocialInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handlePsychosocialRequest(psychosocialInput)}
                  placeholder="How can I help you today?"
                  className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:border-indigo-400 transition-colors"
                />
                <button 
                  onClick={() => handlePsychosocialRequest(psychosocialInput)}
                  disabled={isPsychosocialLoading || !psychosocialInput.trim()}
                  className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-all active:scale-95 shadow-md",
                    isPsychosocialLoading || !psychosocialInput.trim() ? "bg-slate-300 shadow-none cursor-not-allowed" : "bg-indigo-600 shadow-indigo-200"
                  )}
                >
                  <Send size={24} />
                </button>
              </div>
            </div>
          </div>
        );

      case 'counselorList':
        return (
          <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto pb-24">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button onClick={() => setCurrentScreen('crisis')} className="p-2 rounded-full bg-gray-100">
                  <ChevronLeft size={32} />
                </button>
                <h2 className="text-2xl font-bold">Counselor Database</h2>
              </div>
              <button 
                onClick={() => setShowResetConfirm(true)}
                className="p-2 rounded-full bg-gray-100 text-gray-500 hover:text-[#118AB2] transition-colors"
                title="Reset"
              >
                <RotateCcw size={24} />
              </button>
            </div>

            <div className="bg-[#118AB2]/10 p-6 rounded-3xl border-2 border-[#118AB2]/20">
              <p className="text-sm font-medium text-[#118AB2]">
                Select a counselor from our verified database to start a call.
              </p>
            </div>

            <div className="space-y-4">
              {COUNSELORS.map((c) => (
                <a
                  key={c.id}
                  href={`tel:${c.phone}`}
                  className="w-full flex items-center p-6 bg-white rounded-3xl shadow-md border-2 border-gray-50 hover:border-[#118AB2] transition-all text-left no-underline text-inherit"
                >
                  <div className="w-16 h-16 bg-[#118AB2]/10 rounded-2xl flex items-center justify-center mr-4">
                    <UserPlus className="text-[#118AB2]" size={32} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{c.name}</h3>
                    <p className="text-sm text-gray-500">{c.specialty}</p>
                    <div className="flex space-x-2 mt-2">
                      {c.language.map(l => (
                        <span key={l} className="text-[10px] font-bold uppercase px-2 py-1 bg-gray-100 rounded-md text-gray-400">
                          {LANGUAGES.find(lang => lang.code === l)?.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Phone className="text-[#118AB2]" size={24} />
                </a>
              ))}
            </div>
          </div>
        );

      case 'healthCenters':
        return (
          <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto pb-24">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button onClick={() => setCurrentScreen('dashboard')} className="p-2 rounded-full bg-gray-100">
                  <ChevronLeft size={32} />
                </button>
                <h2 className="text-2xl font-bold">{t('healthTitle')}</h2>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search size={20} className="text-gray-400" />
                </div>
                <input 
                  type="text"
                  value={healthSearchQuery}
                  onChange={(e) => setHealthSearchQuery(e.target.value)}
                  placeholder={t('healthSearch')}
                  className="w-full pl-12 pr-4 py-4 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#118AB2] font-medium"
                />
                {healthSearchQuery && (
                  <button 
                    onClick={() => setHealthSearchQuery('')}
                    className="absolute inset-y-0 right-4 flex items-center"
                  >
                    <X size={18} className="text-gray-400" />
                  </button>
                )}
              </div>
              <button 
                onClick={requestLocation}
                disabled={isLocating}
                className={cn(
                  "p-4 rounded-2xl shadow-sm transition-all active:scale-90",
                  userLocation ? "bg-[#06D6A0] text-white" : "bg-white text-[#118AB2] border-2 border-[#118AB2]/10"
                )}
                title="Use my location"
              >
                {isLocating ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Navigation size={24} />
                )}
              </button>
            </div>

            <div className="space-y-4">
              {(() => {
                const centersWithDistance = HEALTH_CENTERS.map(center => {
                  let distance = null;
                  if (userLocation) {
                    distance = getDistance(userLocation.lat, userLocation.lng, center.lat, center.lng);
                  }
                  return { ...center, realDistance: distance };
                });

                const filtered = centersWithDistance
                  .filter(center => 
                    center.name[language].toLowerCase().includes(healthSearchQuery.toLowerCase())
                  )
                  .sort((a, b) => {
                    if (a.realDistance === null) return 0;
                    if (b.realDistance === null) return 0;
                    return a.realDistance - b.realDistance;
                  });
                
                if (filtered.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                        <Search size={40} />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-gray-900">No results found</p>
                        <p className="text-sm text-gray-500">Try searching for a different hospital name.</p>
                      </div>
                      <button 
                        onClick={() => setHealthSearchQuery('')}
                        className="text-[#118AB2] font-bold text-sm hover:underline"
                      >
                        Clear Search
                      </button>
                    </div>
                  );
                }

                return filtered.map((center) => (
                  <div key={center.id} className="bg-white p-6 rounded-3xl shadow-md border border-gray-50 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold">{center.name[language]}</h3>
                        <p className="text-sm text-gray-500">
                          {center.realDistance !== null 
                            ? `${center.realDistance.toFixed(1)} km away` 
                            : center.dist}
                        </p>
                      </div>
                      <div className={cn(
                        "p-2 rounded-xl",
                        center.realDistance !== null && center.realDistance < 5 ? "bg-[#06D6A0]/10 text-[#06D6A0]" : "bg-[#118AB2]/10 text-[#118AB2]"
                      )}>
                        <MapIcon size={24} />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start space-x-3 text-sm">
                        <Clock size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-600 font-medium">{center.hours[language]}</p>
                      </div>
                      <div className="flex items-start space-x-3 text-sm">
                        <Info size={18} className="text-[#118AB2] mt-0.5 flex-shrink-0" />
                        <p className="text-gray-600 leading-relaxed">{center.services[language]}</p>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <a 
                        href={`tel:${center.phone}`}
                        className="flex-1 bg-[#06D6A0] text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-[#06D6A0]/20 active:scale-95 transition-transform"
                      >
                        <Phone size={18} />
                        <span>{t('healthCall')}</span>
                      </a>
                      <button 
                        onClick={() => {
                          setSelectedHealthCenter(center);
                          setCurrentScreen('map');
                        }}
                        className="flex-1 bg-[#118AB2] text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-[#118AB2]/20 active:scale-95 transition-transform"
                      >
                        <MapIcon size={18} />
                        <span>{t('healthDirections')}</span>
                      </button>
                    </div>
                  </div>
                ));
              })()}
            </div>

            <div className="mt-auto p-6 bg-[#118AB2]/5 rounded-3xl border-2 border-[#118AB2]/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={cn("w-3 h-3 rounded-full", isListening ? "bg-red-500 animate-pulse" : "bg-[#118AB2]")} />
                <p className="text-sm font-bold">
                  {isListening ? `${t('listeningIn')} ${LANGUAGES.find(l => l.code === language)?.label}` : "Voice Assistant Ready"}
                </p>
              </div>
              <button 
                onClick={startIVRVoiceInput}
                className={cn(
                  "p-4 rounded-2xl shadow-lg active:scale-90 transition-all",
                  isListening ? "bg-red-500 text-white animate-pulse" : "bg-[#118AB2] text-white"
                )}
              >
                <Mic size={24} />
              </button>
            </div>
          </div>
        );

      case 'referral':
        return (
          <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto pb-24">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button onClick={() => setCurrentScreen('dashboard')} className="p-2 rounded-full bg-gray-100">
                  <ChevronLeft size={32} />
                </button>
                <h2 className="text-2xl font-bold">{t('resources')}</h2>
              </div>
              <button 
                onClick={() => setShowResetConfirm(true)}
                className="p-2 rounded-full bg-gray-100 text-gray-500 hover:text-[#118AB2] transition-colors"
                title="Reset"
              >
                <RotateCcw size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {RESOURCES.map((res) => {
                if (res.type === 'call') {
                  return (
                    <a
                      key={res.id}
                      href={`tel:${res.value}`}
                      className="w-full flex items-center p-6 bg-white rounded-3xl shadow-md border-2 border-gray-50 hover:border-[#06D6A0] transition-all text-left no-underline text-inherit"
                    >
                      <div className="p-4 bg-[#06D6A0]/10 rounded-2xl mr-6">
                        <AnimatedIcon name={res.icon as any} size={48} color="#06D6A0" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{res.label[language]}</h3>
                        <p className="text-gray-500 font-medium">{res.value}</p>
                        <p className="text-xs text-[#06D6A0] font-bold mt-1 uppercase tracking-widest">
                          Call Now
                        </p>
                      </div>
                    </a>
                  );
                }
                return (
                  <button
                    key={res.id}
                    onClick={() => setCurrentScreen('healthCenters')}
                    className="w-full flex items-center p-6 bg-white rounded-3xl shadow-md border-2 border-gray-50 hover:border-[#06D6A0] transition-all text-left"
                  >
                    <div className="p-4 bg-[#06D6A0]/10 rounded-2xl mr-6">
                      <AnimatedIcon name={res.icon as any} size={48} color="#06D6A0" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{res.label[language]}</h3>
                      <p className="text-gray-500 font-medium">{res.value}</p>
                      <p className="text-xs text-[#06D6A0] font-bold mt-1 uppercase tracking-widest">
                        Visit Office
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-auto p-6 bg-[#118AB2]/5 rounded-3xl border-2 border-[#118AB2]/10">
              <p className="text-sm text-gray-600 text-center italic">
                "We are here to help you connect with the right support systems. Your well-being is our priority."
              </p>
            </div>
          </div>
        );

      case 'map':
        return (
          <div className="flex flex-col h-full">
            <div className="p-4 flex items-center justify-between bg-white shadow-sm z-10">
              <div className="flex items-center space-x-4">
                <button onClick={() => setCurrentScreen('healthCenters')} className="p-2">
                  <ChevronLeft size={24} />
                </button>
                <h2 className="text-xl font-bold">{selectedHealthCenter ? selectedHealthCenter.name[language] : t('healthCenter')}</h2>
              </div>
              <div className="flex items-center space-x-2">
                <select 
                  value={travelMode}
                  onChange={(e) => setTravelMode(e.target.value)}
                  className="bg-gray-100 p-2 rounded-xl text-xs font-bold focus:outline-none"
                >
                  <option value="DRIVING">Driving</option>
                  <option value="WALKING">Walking</option>
                  <option value="BICYCLING">Bicycling</option>
                </select>
              </div>
            </div>
            
            <div className="flex-1 relative z-0">
              <MapContainer 
                center={userLocation ? [userLocation.lat, userLocation.lng] : [9.0192, 38.7525]} 
                zoom={14} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapUpdater center={selectedHealthCenter ? [selectedHealthCenter.lat, selectedHealthCenter.lng] : (userLocation ? [userLocation.lat, userLocation.lng] : [9.0192, 38.7525])} />
                
                {userLocation && (
                  <Marker 
                    position={[userLocation.lat, userLocation.lng]}
                    icon={L.divIcon({
                      className: 'custom-div-icon',
                      html: `<div style="background-color: #118AB2; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
                      iconSize: [20, 20],
                      iconAnchor: [10, 10]
                    })}
                  >
                    <Popup>You are here</Popup>
                  </Marker>
                )}
                
                {HEALTH_CENTERS.map(center => (
                  <Marker 
                    key={center.id}
                    position={[center.lat, center.lng]}
                    icon={L.divIcon({
                      className: 'custom-div-icon',
                      html: `<div style="background-color: ${selectedHealthCenter?.id === center.id ? '#EF476F' : '#118AB2'}; width: ${selectedHealthCenter?.id === center.id ? '30px' : '24px'}; height: ${selectedHealthCenter?.id === center.id ? '30px' : '24px'}; border-radius: 50%; border: ${selectedHealthCenter?.id === center.id ? '4px' : '3px'} solid white; box-shadow: 0 0 15px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center;">
                        <svg width="${selectedHealthCenter?.id === center.id ? '16' : '12'}" height="${selectedHealthCenter?.id === center.id ? '16' : '12'}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      </div>`,
                      iconSize: selectedHealthCenter?.id === center.id ? [30, 30] : [24, 24],
                      iconAnchor: selectedHealthCenter?.id === center.id ? [15, 30] : [12, 24]
                    })}
                    eventHandlers={{
                      click: () => setSelectedHealthCenter(center)
                    }}
                  >
                    <Popup>
                      <div className="p-1 min-w-[150px]">
                        <h3 className="font-bold text-sm mb-1 text-[#118AB2]">{center.name[language]}</h3>
                        <p className="text-[10px] text-gray-500 mb-2 leading-tight">{center.hours[language]}</p>
                        <div className="flex flex-col space-y-1">
                          <button 
                            onClick={() => {
                              setSelectedHealthCenter(center);
                              const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation?.lat},${userLocation?.lng}&destination=${center.lat},${center.lng}&travelmode=${travelMode.toLowerCase()}`;
                              window.open(url, '_blank');
                            }}
                            className="bg-[#06D6A0] text-white px-3 py-1.5 rounded-xl text-[10px] font-bold w-full flex items-center justify-center space-x-1"
                          >
                            <Navigation size={12} />
                            <span>Directions</span>
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            <div className="p-6 bg-white rounded-t-3xl shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <p className="text-sm text-gray-500 uppercase font-bold tracking-widest">
                    {selectedHealthCenter === nearestCenter ? "Nearest Support Center" : "Support Center"}
                  </p>
                  <h3 className="text-2xl font-black text-[#118AB2]">
                    {selectedHealthCenter ? selectedHealthCenter.name[language] : "Select a center"}
                  </h3>
                  {selectedHealthCenter && (
                    <div className="flex flex-col mt-1">
                      <p className="text-sm font-bold text-[#06D6A0]">
                        {userLocation ? `${getDistance(userLocation.lat, userLocation.lng, selectedHealthCenter.lat, selectedHealthCenter.lng).toFixed(1)} km away` : selectedHealthCenter.dist}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        <Clock size={12} className="inline mr-1" />
                        {selectedHealthCenter.hours[language]}
                      </p>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation?.lat},${userLocation?.lng}&destination=${selectedHealthCenter?.lat},${selectedHealthCenter?.lng}&travelmode=${travelMode.toLowerCase()}`;
                    window.open(url, '_blank');
                  }}
                  disabled={!selectedHealthCenter}
                  className={cn(
                    "p-5 rounded-2xl shadow-xl active:scale-95 transition-all flex flex-col items-center justify-center space-y-1",
                    selectedHealthCenter ? "bg-[#06D6A0] text-white" : "bg-gray-200 text-gray-400"
                  )}
                >
                  <Navigation size={28} />
                  <span className="text-[10px] font-black uppercase">Route</span>
                </button>
              </div>
              
              {selectedHealthCenter && (
                <div className="bg-[#118AB2]/5 p-4 rounded-2xl border border-[#118AB2]/10 space-y-2">
                  <div className="flex items-start space-x-2">
                    <Info size={16} className="text-[#118AB2] mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {selectedHealthCenter.services[language]}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#118AB2]/10">
                    <a href={`tel:${selectedHealthCenter.phone}`} className="text-[#118AB2] font-bold text-sm flex items-center space-x-1">
                      <Phone size={14} />
                      <span>{selectedHealthCenter.phone}</span>
                    </a>
                    <p className="text-[10px] text-gray-400 italic">
                      Tap the green button for GPS navigation
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto pb-24">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Good Day</p>
                <h2 className="text-3xl font-display font-black text-primary">{t('dashboard')}</h2>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setShowResetConfirm(true)}
                  className="p-3 rounded-2xl bg-white shadow-md text-gray-500 hover:text-primary transition-colors"
                  title="Reset"
                >
                  <RotateCcw size={24} />
                </button>
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Activity size={32} />
                </div>
              </div>
            </div>

            {/* Wellness & Activity Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-[2rem] shadow-md border-b-4 border-primary space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Heart size={20} />
                  </div>
                  <span className="text-2xl font-display font-black text-primary">{calculateWellnessScore()}%</span>
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('wellnessScore')}</p>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${calculateWellnessScore()}%` }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
              <div className="bg-white p-5 rounded-[2rem] shadow-md border-b-4 border-[#06D6A0] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-[#06D6A0]/10 rounded-lg text-[#06D6A0]">
                    <Activity size={20} />
                  </div>
                  <span className="text-lg font-black text-[#06D6A0]">{t(calculateActivityLevel().toLowerCase())}</span>
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('activityLevel')}</p>
                <div className="flex space-x-1">
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "h-1.5 flex-1 rounded-full",
                        i <= (calculateActivityLevel() === 'Low' ? 1 : calculateActivityLevel() === 'Moderate' ? 2 : 3) 
                          ? "bg-[#06D6A0]" 
                          : "bg-gray-100"
                      )} 
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => setCurrentScreen('breathing')}
                className="bg-[#06D6A0] p-4 rounded-[1.5rem] text-white shadow-lg flex flex-col items-center space-y-2 active:scale-95 transition-transform"
              >
                <AnimatedIcon name="Wind" size={24} color="white" />
                <span className="font-bold text-xs">Breathe</span>
              </button>
              <button 
                onClick={() => setCurrentScreen('videoTranslator')}
                className="bg-[#118AB2] p-4 rounded-[1.5rem] text-white shadow-lg flex flex-col items-center space-y-2 active:scale-95 transition-transform"
              >
                <Video size={24} />
                <span className="font-bold text-xs">Video</span>
              </button>
              <button 
                onClick={() => setCurrentScreen('voiceAssistant')}
                className="bg-[#EF476F] p-4 rounded-[1.5rem] text-white shadow-lg flex flex-col items-center space-y-2 active:scale-95 transition-transform"
              >
                <Mic size={24} />
                <span className="font-bold text-xs">AI Voice</span>
              </button>
            </div>

            <div className="bg-white p-6 rounded-[2rem] shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Recent Moods</h3>
                <button onClick={() => setCurrentScreen('mood')} className="text-sm font-bold text-[#118AB2]">Update</button>
              </div>
              <div className="flex space-x-4 overflow-x-auto pb-2">
                {moodHistory.slice(-5).reverse().map((entry, i) => {
                  const mood = MOODS.find(m => m.id === entry.mood);
                  return (
                    <div key={i} className="flex flex-col items-center flex-shrink-0">
                      <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-2 shadow-sm", mood?.color)}>
                        <AnimatedIcon name={mood?.icon as any} size={32} color="white" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400">
                        {entry.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                {moodHistory.length === 0 && (
                  <p className="text-gray-400 italic text-sm">No moods recorded yet today.</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#06D6A0]/10 p-6 rounded-[2rem] border-2 border-[#06D6A0]/20">
                <p className="text-xs font-bold text-[#06D6A0] uppercase tracking-widest mb-1">Wellness</p>
                <p className="text-4xl font-black text-[#06D6A0]">85%</p>
              </div>
              <div className="bg-[#FFD166]/10 p-6 rounded-[2rem] border-2 border-[#FFD166]/20">
                <p className="text-xs font-bold text-[#FFD166] uppercase tracking-widest mb-1">Activity</p>
                <p className="text-4xl font-black text-[#FFD166]">3/5</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setCurrentScreen('healthCenters')}
                className="bg-[#118AB2] text-white p-6 rounded-[2rem] font-bold text-xl shadow-xl flex items-center justify-center space-x-3 active:scale-95 transition-transform"
              >
                <MapIcon size={24} />
                <span>Find Centers</span>
              </button>
              <button 
                onClick={() => setCurrentScreen('exercises')}
                className="bg-[#06D6A0] text-white p-6 rounded-[2rem] font-bold text-xl shadow-xl flex items-center justify-center space-x-3 active:scale-95 transition-transform"
              >
                <Activity size={24} />
                <span>Exercises</span>
              </button>
            </div>
          </div>
        );

      case 'videoTranslator':
        return (
          <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto pb-24">
            <div className="flex items-center space-x-4">
              <button onClick={() => setCurrentScreen('dashboard')} className="p-2 rounded-full bg-gray-100">
                <ChevronLeft size={32} />
              </button>
              <h2 className="text-2xl font-bold">Video Translator</h2>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-[#118AB2]/5 space-y-6">
              {!translatorFile ? (
                <div className="flex flex-col items-center justify-center py-12 border-4 border-dashed border-gray-100 rounded-[2rem] space-y-4">
                  <div className="w-20 h-20 bg-[#118AB2]/10 rounded-full flex items-center justify-center text-[#118AB2]">
                    <Upload size={40} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg">Upload a Video</p>
                    <p className="text-sm text-gray-400">MP4, WebM or MOV</p>
                  </div>
                  <input 
                    type="file" 
                    accept="video/*" 
                    onChange={handleVideoUpload}
                    className="hidden" 
                    id="video-upload"
                  />
                  <label 
                    htmlFor="video-upload"
                    className="bg-[#118AB2] text-white px-8 py-3 rounded-2xl font-bold shadow-lg cursor-pointer active:scale-95 transition-transform"
                  >
                    Select File
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-video bg-black group">
                    <video 
                      ref={videoRef}
                      src={videoPreviewUrl || ''} 
                      controls 
                      className="w-full h-full"
                      onTimeUpdate={(e) => setVideoCurrentTime(e.currentTarget.currentTime)}
                    />
                    {showSubtitles && translatorResult?.subtitles && (
                      <div className="absolute bottom-16 left-0 right-0 p-4 pointer-events-none flex justify-center z-10">
                        <motion.div 
                          key={translatorResult.subtitles.find(s => videoCurrentTime >= s.start && videoCurrentTime <= s.end)?.text}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-black/80 px-4 py-2 rounded-xl text-white text-center text-sm font-bold max-w-[90%] shadow-lg border border-white/10"
                        >
                          {translatorResult.subtitles.find(s => videoCurrentTime >= s.start && videoCurrentTime <= s.end)?.text || ''}
                        </motion.div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-500 truncate max-w-[200px]">{translatorFile.name}</p>
                    <button 
                      onClick={() => {
                        setTranslatorFile(null);
                        setVideoPreviewUrl(null);
                        setTranslatorResult(null);
                        setTranslatedAudioUrl(null);
                      }}
                      className="text-xs font-bold text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  
                  {!translatorResult && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Source Language</label>
                          <select 
                            value={sourceLanguage}
                            onChange={(e) => setSourceLanguage(e.target.value)}
                            className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold outline-none border-2 border-transparent focus:border-[#118AB2]/20"
                          >
                            <option value="auto">Auto Detect</option>
                            {LANGUAGES.map(l => (
                              <option key={l.code} value={l.code}>{l.label}</option>
                            ))}
                            <option value="other">Other (Manual)</option>
                          </select>
                        </div>
                        {sourceLanguage === 'other' && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Enter Language</label>
                            <input 
                              type="text"
                              value={customSourceLanguage}
                              onChange={(e) => setCustomSourceLanguage(e.target.value)}
                              placeholder="e.g. French, Arabic..."
                              className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold outline-none border-2 border-transparent focus:border-[#118AB2]/20"
                            />
                          </div>
                        )}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Voice Style</label>
                          <select 
                            value={voiceStyle}
                            onChange={(e) => setVoiceStyle(e.target.value)}
                            className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold outline-none border-2 border-transparent focus:border-[#118AB2]/20"
                          >
                            <option value="natural">Natural</option>
                            <option value="cheerful">Cheerful</option>
                            <option value="serious">Serious</option>
                            <option value="calm">Calm</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Accent</label>
                          <select 
                            value={voiceAccent}
                            onChange={(e) => setVoiceAccent(e.target.value)}
                            className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold outline-none border-2 border-transparent focus:border-[#118AB2]/20"
                          >
                            <option value="neutral">Neutral</option>
                            <option value="soft">Soft</option>
                            <option value="bold">Bold</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Speed ({voiceSpeed}x)</label>
                          <input 
                            type="range" 
                            min="0.5" 
                            max="2" 
                            step="0.1"
                            value={voiceSpeed}
                            onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                            className="w-full h-10 accent-[#118AB2]"
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center space-x-2">
                            <Sparkles size={16} className="text-[#118AB2]" />
                            <span className="text-sm font-bold">Subtitles</span>
                          </div>
                          <button 
                            onClick={() => setShowSubtitles(!showSubtitles)}
                            className={cn(
                              "w-12 h-6 rounded-full transition-colors relative",
                              showSubtitles ? "bg-[#118AB2]" : "bg-gray-300"
                            )}
                          >
                            <div className={cn(
                              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                              showSubtitles ? "right-1" : "left-1"
                            )} />
                          </button>
                        </div>
                      </div>

                      <button 
                        onClick={processVideo}
                        disabled={isProcessingVideo}
                        className={cn(
                          "w-full p-6 rounded-2xl font-bold text-xl shadow-xl flex items-center justify-center space-x-3 transition-all",
                          isProcessingVideo ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-[#06D6A0] text-white active:scale-95"
                        )}
                      >
                        {isProcessingVideo ? (
                          <>
                            <RotateCcw className="animate-spin" size={24} />
                            <span>Processing Pipeline...</span>
                          </>
                        ) : (
                          <>
                            <Globe size={24} />
                            <span>Translate to {LANGUAGES.find(l => l.code === language)?.label}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {translatorResult && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {translatorResult.status === 'error' ? (
                  <div className="bg-red-50 p-6 rounded-[2rem] border-2 border-red-100 text-red-600 space-y-2">
                    <div className="flex items-center space-x-2 font-bold">
                      <AlertTriangle size={20} />
                      <span>Processing Failed</span>
                    </div>
                    <p className="text-sm">{translatorResult.notes}</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-white p-6 rounded-[2rem] shadow-lg space-y-4 border-2 border-[#06D6A0]/10">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-[#06D6A0] uppercase tracking-widest text-xs">Translated Audio</h3>
                        {translatedAudioUrl && (
                          <button 
                            onClick={() => {
                              if (videoRef.current) videoRef.current.muted = true;
                              const audio = new Audio(translatedAudioUrl);
                              audio.play();
                            }}
                            className="p-2 bg-[#06D6A0] text-white rounded-full shadow-md active:scale-95 transition-transform"
                          >
                            <Volume2 size={20} />
                          </button>
                        )}
                      </div>
                      <p className="text-lg font-bold text-gray-800 leading-tight">
                        {translatorResult.translated_text}
                      </p>
                      {translatorResult.notes && (
                        <p className="text-[10px] text-gray-400 italic border-t pt-2">
                          Note: {translatorResult.notes}
                        </p>
                      )}
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] shadow-lg space-y-4">
                      <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs">Original Transcription</h3>
                      <p className="text-sm text-gray-600 italic">
                        {translatorResult.transcript_source}
                      </p>
                    </div>

                    {translatorResult.subtitles && translatorResult.subtitles.length > 0 && (
                      <div className="bg-white p-6 rounded-[2rem] shadow-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs">Subtitles</h3>
                          <button 
                            onClick={downloadSRT}
                            className="text-[10px] font-bold text-[#118AB2] hover:underline"
                          >
                            Download SRT
                          </button>
                        </div>
                        <div className="space-y-3">
                          {translatorResult.subtitles.map((sub, i) => (
                            <div key={i} className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-mono text-[#118AB2]">
                                <span>{sub.start}s - {sub.end}s</span>
                                {sub.speaker && <span className="text-gray-400 uppercase">{sub.speaker}</span>}
                              </div>
                              <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded-lg">{sub.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </div>
        );

      case 'voiceAssistant':
        return (
          <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center space-x-4">
                <button onClick={() => setCurrentScreen('dashboard')} className="p-2 rounded-full bg-slate-50 text-slate-600">
                  <ChevronLeft size={24} />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">SelamMind</h2>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Always Active</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    showVoiceSettings ? "bg-[#06D6A0] text-white" : "bg-slate-50 text-slate-600"
                  )}
                >
                  <Sliders size={20} />
                </button>
                <button 
                  onClick={() => {
                    if (confirm("Clear chat history?")) {
                      setChatHistory([]);
                      setChatSummary('');
                      setIvrResponse(null);
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <RotateCcw size={20} />
                </button>
              </div>
            </div>

            {/* Voice Settings Panel */}
            <AnimatePresence>
              {showVoiceSettings && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-white border-b border-slate-100 overflow-hidden"
                >
                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Voice Style</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['natural', 'cheerful', 'serious', 'calm'].map((style) => (
                          <button
                            key={style}
                            onClick={() => setVoiceStyle(style)}
                            className={cn(
                              "px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all border-2",
                              voiceStyle === style 
                                ? "bg-[#06D6A0]/10 border-[#06D6A0] text-[#06D6A0]" 
                                : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100"
                            )}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accent</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['neutral', 'soft', 'bold'].map((accent) => (
                          <button
                            key={accent}
                            onClick={() => setVoiceAccent(accent)}
                            className={cn(
                              "px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all border-2",
                              voiceAccent === accent 
                                ? "bg-[#118AB2]/10 border-[#118AB2] text-[#118AB2]" 
                                : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100"
                            )}
                          >
                            {accent}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Speed</label>
                        <span className="text-[10px] font-bold text-[#118AB2] bg-[#118AB2]/10 px-2 py-0.5 rounded-full">{voiceSpeed}x</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="2" 
                        step="0.1"
                        value={voiceSpeed}
                        onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                        className="w-full h-8 accent-[#118AB2]"
                      />
                      <div className="flex justify-between text-[8px] font-bold text-slate-300 uppercase">
                        <span>Slow</span>
                        <span>Normal</span>
                        <span>Fast</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {chatHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                  <div className="w-20 h-20 bg-[#06D6A0]/10 rounded-full flex items-center justify-center text-[#06D6A0]">
                    <Sparkles size={40} />
                  </div>
                  <div className="max-w-xs">
                    <p className="font-bold text-slate-900">How are you today?</p>
                    <p className="text-sm text-slate-500">I'm here to listen and support you. Tap the mic or type to start.</p>
                  </div>
                </div>
              ) : (
                chatHistory.map((msg, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex w-full",
                      msg.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-[85%] p-4 rounded-3xl shadow-sm",
                      msg.role === 'user' 
                        ? "bg-[#118AB2] text-white rounded-tr-none" 
                        : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                    )}>
                      <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                      <span className={cn(
                        "text-[9px] mt-2 block opacity-50 font-bold uppercase tracking-widest",
                        msg.role === 'user' ? "text-right" : "text-left"
                      )}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
              
              {isProcessingIVR && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-3xl rounded-tl-none border border-slate-100 shadow-sm flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-[#06D6A0] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-[#06D6A0] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-[#06D6A0] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-slate-100 space-y-4 pb-24">
              {ivrResponse?.recommended_exercise_id && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#06D6A0]/10 p-4 rounded-2xl border border-[#06D6A0]/20 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#06D6A0] text-white rounded-lg">
                      <Activity size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#06D6A0] uppercase tracking-widest">Recommended Exercise</p>
                      <p className="text-xs font-bold text-slate-900">
                        {EXERCISES.find(e => e.id === ivrResponse.recommended_exercise_id)?.label[language]}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const ex = EXERCISES.find(e => e.id === ivrResponse.recommended_exercise_id);
                      if (ex) {
                        setSelectedExercise(ex);
                        setCurrentScreen('exerciseDetail');
                      }
                    }}
                    className="text-xs font-bold text-[#06D6A0] hover:underline"
                  >
                    Start
                  </button>
                </motion.div>
              )}

              <div className="flex items-center space-x-3">
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    placeholder="Type your message..."
                    disabled={isProcessingIVR}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                        handleIVRRequest((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-[#06D6A0]/20 focus:bg-white outline-none text-sm font-medium transition-all pr-12"
                  />
                  <button 
                    onClick={(e) => {
                      const input = e.currentTarget.previousSibling as HTMLInputElement;
                      if (input.value.trim()) {
                        handleIVRRequest(input.value);
                        input.value = '';
                      }
                    }}
                    disabled={isProcessingIVR}
                    className="absolute right-2 top-2 p-2 text-[#06D6A0] hover:bg-[#06D6A0]/10 rounded-xl transition-colors"
                  >
                    <Send size={20} />
                  </button>
                </div>
                
                <button 
                  onClick={startIVRVoiceInput}
                  disabled={isProcessingIVR}
                  className={cn(
                    "p-4 rounded-2xl shadow-lg transition-all active:scale-90",
                    isRecording ? "bg-red-500 text-white animate-pulse" : "bg-[#06D6A0] text-white",
                    isProcessingIVR && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Mic size={24} />
                </button>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="flex flex-col h-full p-6 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => setCurrentScreen('dashboard')} 
                    className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#118AB2]"
                    aria-label={t('back')}
                  >
                    <ChevronLeft size={32} />
                  </button>
                  <h2 className="text-3xl font-bold">{t('settings')}</h2>
                </div>
                <button 
                  onClick={() => setShowResetConfirm(true)}
                  className="p-2 rounded-full bg-gray-100 text-gray-500 hover:text-[#118AB2] transition-colors focus:outline-none focus:ring-2 focus:ring-[#118AB2]"
                  title="Reset"
                  aria-label="Reset application"
                >
                  <RotateCcw size={24} />
                </button>
              </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('accessibility')}</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm">
                    <div className="flex items-center space-x-3">
                      <AnimatedIcon name="Eye" size={24} color="#118AB2" />
                      <span className="font-medium">{t('visualOnly')}</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={isVisualOnly} 
                      onChange={() => setIsVisualOnly(!isVisualOnly)}
                      className="w-6 h-6 accent-[#06D6A0]"
                      aria-label={t('visualOnly')}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm">
                    <div className="flex items-center space-x-3">
                      <AnimatedIcon name="Zap" size={24} color="#FFD166" />
                      <span className="font-medium">{t('highContrast')}</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={highContrast} 
                      onChange={() => setHighContrast(!highContrast)}
                      className="w-6 h-6 accent-[#06D6A0]"
                      aria-label={t('highContrast')}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm">
                    <div className="flex items-center space-x-3">
                      <AnimatedIcon name="Mic" size={24} color="#118AB2" />
                      <span className="font-medium">{t('voiceGuidance')}</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={isVoiceEnabled} 
                      onChange={() => {
                        const next = !isVoiceEnabled;
                        setIsVoiceEnabled(next);
                        if (next) {
                          setTimeout(() => {
                            const utterance = new SpeechSynthesisUtterance(t('voiceGuidance'));
                            const langMap: Record<Language, string> = {
                              en: 'en-US',
                              am: 'am-ET',
                              om: 'om-ET',
                              ti: 'ti-ET',
                              so: 'so-SO',
                              aa: 'aa-ET'
                            };
                            utterance.lang = langMap[language];
                            window.speechSynthesis.speak(utterance);
                          }, 100);
                        }
                      }}
                      className="w-6 h-6 accent-[#06D6A0]"
                      aria-label={t('voiceGuidance')}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('fontSize')}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(['small', 'normal', 'large', 'extraLarge'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={cn(
                        "p-4 rounded-2xl font-medium transition-all border-2 focus:outline-none focus:ring-2 focus:ring-[#118AB2]",
                        fontSize === size 
                          ? "bg-[#118AB2] text-white border-[#118AB2]" 
                          : "bg-white text-gray-700 border-gray-100 hover:border-[#118AB2]"
                      )}
                      aria-label={`${t('fontSize')}: ${t(size)}`}
                      aria-pressed={fontSize === size}
                    >
                      {t(size)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Language</h3>
                <div className="grid grid-cols-1 gap-2">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={cn(
                        "p-4 rounded-2xl text-left font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#118AB2]",
                        language === lang.code ? "bg-[#118AB2] text-white" : "bg-white text-gray-700"
                      )}
                      aria-label={`Change language to ${lang.label}`}
                      aria-pressed={language === lang.code}
                    >
                      {lang.native} ({lang.label})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-auto flex flex-col items-center space-y-6">
              <div className="flex flex-col items-center space-y-2 opacity-60">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Developed by</p>
                <LogoSelamMind size="sm" />
              </div>

              <button 
                onClick={handleLogout}
                className="flex items-center justify-center space-x-2 p-4 text-red-500 font-bold w-full"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const fontSizeMap = {
    small: 'text-sm',
    normal: 'text-base',
    large: 'text-lg',
    extraLarge: 'text-xl',
  };

  return (
    <ErrorBoundary>
      <div 
        dir={language === 'ar' || language === 'he' ? 'rtl' : 'ltr'}
        className={cn(
          "min-h-screen font-sans transition-colors duration-300",
          highContrast ? "bg-black text-white" : "bg-background text-foreground",
          fontSizeMap[fontSize]
        )}
      >
        <div className="max-w-md mx-auto h-screen flex flex-col relative overflow-hidden bg-white shadow-2xl">
          <main className="flex-1 overflow-hidden relative">
            {isOffline && (
              <div className="absolute top-0 left-0 right-0 bg-amber-500 text-white text-[10px] font-bold py-1 px-4 text-center z-[60] flex items-center justify-center space-x-2">
                <AlertTriangle size={12} />
                <span>Offline Mode - Using cached data</span>
              </div>
            )}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScreen}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {renderScreen()}
              </motion.div>
            </AnimatePresence>

            <AnimatePresence>
              {toast && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  className="absolute bottom-24 left-6 right-6 z-[110]"
                >
                  <div className="bg-[#073B4C] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[#06D6A0] rounded-full" />
                    <p className="font-bold text-sm">{toast}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
          
          <AnimatePresence>
            {showCompleteConfirm && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white w-full max-w-xs rounded-[2.5rem] p-8 shadow-2xl text-center space-y-6"
                >
                  <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles size={40} className="text-accent" />
                  </div>
                  <p className="text-xl font-display font-black text-gray-800 leading-tight">
                    {t('completeExerciseConfirm')}
                  </p>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => {
                        if (exerciseToComplete) {
                          handleExerciseComplete(exerciseToComplete);
                        }
                        setShowCompleteConfirm(false);
                      }}
                      className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold active:scale-95 transition-transform"
                    >
                      {t('yes')}
                    </button>
                    <button 
                      onClick={() => setShowCompleteConfirm(false)}
                      className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold active:scale-95 transition-transform"
                    >
                      {t('no')}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {showResetConfirm && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white w-full max-w-xs rounded-[2.5rem] p-8 shadow-2xl text-center space-y-6"
              >
                <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                  <RotateCcw size={40} className="text-accent" />
                </div>
                <p className="text-xl font-display font-black text-gray-800 leading-tight">
                  {t('resetConfirm')}
                </p>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 p-4 rounded-2xl bg-gray-100 text-gray-600 font-bold active:scale-95 transition-transform"
                  >
                    {t('no')}
                  </button>
                  <button 
                    onClick={() => {
                      setShowResetConfirm(false);
                      setCurrentScreen('welcome');
                      setSelectedMood(null);
                      setSelectedExercise(null);
                      setHasCompletedOnboarding(false);
                      setOnboardingStep(0);
                      localStorage.clear();
                    }}
                    className="flex-1 p-4 rounded-2xl bg-danger text-white font-bold shadow-lg shadow-danger/30 active:scale-95 transition-transform"
                  >
                    {t('yes')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {currentScreen !== 'welcome' && currentScreen !== 'breathing' && (
          <nav className="flex items-center justify-around p-4 bg-white border-t border-gray-100 shadow-2xl">
            <button 
              onClick={() => setCurrentScreen('dashboard')}
              className={cn("p-2 rounded-xl transition-colors", currentScreen === 'dashboard' ? "text-primary bg-primary/10" : "text-gray-400")}
            >
              <Home size={28} />
            </button>
            <button 
              onClick={() => setCurrentScreen('mood')}
              className={cn("p-2 rounded-xl transition-colors", currentScreen === 'mood' ? "text-primary bg-primary/10" : "text-gray-400")}
            >
              <Activity size={28} />
            </button>
            <button 
              onClick={() => setCurrentScreen('voiceAssistant')}
              className={cn("p-2 rounded-xl transition-colors", currentScreen === 'voiceAssistant' ? "text-accent bg-accent/10" : "text-gray-400")}
            >
              <Mic size={28} />
            </button>
            <button 
              onClick={() => setCurrentScreen('healthCenters')}
              className={cn("p-2 rounded-xl transition-colors", currentScreen === 'healthCenters' ? "text-primary bg-primary/10" : "text-gray-400")}
            >
              <MapIcon size={28} />
            </button>
            <button 
              onClick={() => setCurrentScreen('settings')}
              className={cn("p-2 rounded-xl transition-colors", currentScreen === 'settings' ? "text-primary bg-primary/10" : "text-gray-400")}
            >
              <SettingsIcon size={28} />
            </button>
          </nav>
        )}
      </div>
    </div>
  </ErrorBoundary>
  );
}
