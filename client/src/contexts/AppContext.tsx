import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { doSignOut } from '../firebase/auth';

export type Persona = 'startup_founder' | 'retail_investor' | 'student' | 'corporate_executive' | 'trader';
export type Language = 'en' | 'hi' | 'bn' | 'ta' | 'te';

interface User {
  email: string;
  name: string;
}

interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  persona: Persona;
  language: Language;
  showOnboarding: boolean;
  selectedCategory: string | null;
}

interface AppContextType extends AppState {
  login: (email: string) => void;
  logout: () => void;
  setPersona: (persona: Persona) => void;
  setLanguage: (language: Language) => void;
  setSelectedCategory: (category: string | null) => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'hero.title': 'Business News, Rewired for You',
    'hero.subtitle': "Stop reading static articles. Experience dynamic story arcs, interactive AI briefings, and instant video summaries.",
    'cta.enter': 'Enter the Newsroom',
    'cta.how': 'See How It Works',
    'feature.personalized': 'The Personalized Newsroom',
    'feature.personalized.desc': 'Targeted feeds based on your interests and role',
    'feature.briefings': 'Interactive Intelligence Briefings',
    'feature.briefings.desc': 'Chat with your news and get AI-powered insights',
    'feature.video': 'AI News Video Studio',
    'feature.video.desc': '60-second broadcast summaries of breaking stories',
    'feature.vernacular': 'Vernacular Engine',
    'feature.vernacular.desc': 'Culturally adapted translations in your language',
    'dashboard.title': 'My Newsroom',
    'dashboard.story_arc': 'Story Arc',
    'dashboard.updates': 'updates',
    'dashboard.pulse.developing': 'Developing Story',
    'dashboard.pulse.volatility': 'High Volatility',
    'dashboard.pulse.bullish': 'Sentiment: Bullish',
    'dashboard.pulse.bearish': 'Sentiment: Bearish',
    'dashboard.open': 'Open Intelligence Briefing',
    'nav.profile': 'Profile',
    'onboarding.title': 'Welcome to Your Personal Newsroom',
    'onboarding.subtitle': "Let's customize your experience",
    'onboarding.persona': 'Select Your Persona',
    'onboarding.language': 'Choose Your Language',
    'onboarding.generate': 'Generate My Feed',
    'persona.startup_founder': 'Startup Founder',
    'persona.retail_investor': 'Retail Investor',
    'persona.student': 'Student',
    'persona.corporate_executive': 'Corporate Executive',
    'persona.trader': 'Trader',
    'deepdive.watch': 'Watch 60s AI Briefing',
    'deepdive.timeline': 'Story Timeline',
    'deepdive.key_players': 'Key Players',
    'deepdive.briefing': 'Synthesized Briefing',
    'deepdive.ask': 'Ask a follow-up question about this briefing...',
    'deepdive.chat_history': 'Chat History',
  },
  hi: {
    'hero.title': 'व्यापार समाचार, आपके लिए पुनर्निर्मित',
    'hero.subtitle': "स्थिर लेख पढ़ना बंद करें। गतिशील कहानी arcs, इंटरैक्टिव AI ब्रीफिंग और तुरंत वीडियो सारांश का अनुभव करें।",
    'cta.enter': 'समाचार कक्ष में प्रवेश करें',
    'cta.how': 'यह कैसे काम करता है देखें',
    'feature.personalized': 'व्यक्तिगत समाचार कक्ष',
    'feature.personalized.desc': 'आपकी रुचि और भूमिका के आधार पर लक्षित फीड',
    'feature.briefings': 'इंटरैक्टिव इंटेलिजेंस ब्रीफिंग',
    'feature.briefings.desc': 'अपने समाचार से चैट करें और AI-संचालित अंतर्दृष्टि प्राप्त करें',
    'feature.video': 'AI समाचार वीडियो स्टूडियो',
    'feature.video.desc': 'ब्रेकिंग स्टोरीज का 60-सेकंड ब्रॉडकास्ट सारांश',
    'feature.vernacular': 'वर्नाक्युलर इंजन',
    'feature.vernacular.desc': 'आपकी भाषा में सांस्कृतिक रूप से अनुकूलित अनुवाद',
    'dashboard.title': 'मेरा समाचार कक्ष',
    'dashboard.story_arc': 'कहानी आर्क',
    'dashboard.updates': 'अपडेट',
    'dashboard.pulse.developing': 'विकासशील कहानी',
    'dashboard.pulse.volatility': 'उच्च अस्थिरता',
    'dashboard.pulse.bullish': 'भावना: तेजी',
    'dashboard.pulse.bearish': 'भावना: मंदी',
    'dashboard.open': 'इंटेलिजेंस ब्रीफिंग खोलें',
    'nav.profile': 'प्रोफ़ाइल',
    'onboarding.title': 'आपके व्यक्तिगत समाचार कक्ष में आपका स्वागत है',
    'onboarding.subtitle': 'चलिए आपका अनुभव अनुकूलित करें',
    'onboarding.persona': 'अपना व्यक्तित्व चुनें',
    'onboarding.language': 'अपनी भाषा चुनें',
    'onboarding.generate': 'मेरी फीड बनाएं',
    'persona.startup_founder': 'स्टार्टअप फाउंडर',
    'persona.retail_investor': 'खुदरा निवेशक',
    'persona.student': 'छात्र',
    'persona.corporate_executive': 'कॉर्पोरेट अधिकारी',
    'persona.trader': 'व्यापारी',
    'deepdive.watch': '60s AI ब्रीफिंग देखें',
    'deepdive.timeline': 'कहानी समयरेखा',
    'deepdive.key_players': 'प्रमुख खिलाड़ी',
    'deepdive.briefing': 'संश्लेषित ब्रीफिंग',
    'deepdive.ask': 'इस ब्रीफिंग के बारे में एक अनुवर्ती प्रश्न पूछें...',
    'deepdive.chat_history': 'चैट इतिहास',
  },
  bn: {
    'hero.title': 'ব্যবসা সংবাদ, আপনার জন্য পুনর্নির্মিত',
    'hero.subtitle': "স্থির নিবন্ধ পড়া বন্ধ করুন। গতিশীল গল্পের আর্ক, ইন্টারেক্টিভ AI ব্রিফিং এবং তাৎক্ষণিক ভিডিও সারাংশের অভিজ্ঞতা নিন।",
    'cta.enter': 'নিউজরুমে প্রবেশ করুন',
    'cta.how': 'এটি কীভাবে কাজ করে দেখুন',
    'feature.personalized': 'ব্যক্তিগত নিউজরুম',
    'feature.personalized.desc': 'আপনার আগ্রহ এবং ভূমিকার উপর ভিত্তি করে টার্গেটেড ফিড',
    'feature.briefings': 'ইন্টারেক্টিভ ইন্টেলিজেন্স ব্রিফিং',
    'feature.briefings.desc': 'আপনার সংবাদের সাথে চ্যাট করুন এবং AI-চালিত অন্তর্দৃষ্টি পান',
    'feature.video': 'AI নিউজ ভিডিও স্টুডিও',
    'feature.video.desc': 'ব্রেকিং স্টোরির 60-সেকেন্ড ব্রডকাস্ট সারাংশ',
    'feature.vernacular': 'ভার্নাকুলার ইঞ্জিন',
    'feature.vernacular.desc': 'আপনার ভাষায় সাংস্কৃতিকভাবে অভিযোজিত অনুবাদ',
    'dashboard.title': 'আমার নিউজরুম',
    'dashboard.story_arc': 'গল্প আর্ক',
    'dashboard.updates': 'আপডেট',
    'dashboard.pulse.developing': 'বিকাশমান গল্প',
    'dashboard.pulse.volatility': 'উচ্চ অস্থিরতা',
    'dashboard.pulse.bullish': 'মনোভাব: প্রবণ',
    'dashboard.pulse.bearish': 'মনোভাব: মন্দীভূত',
    'dashboard.open': 'ইন্টেলিজেন্স ব্রিফিং খুলুন',
    'nav.profile': 'প্রোফাইল',
    'onboarding.title': 'আপনার ব্যক্তিগত নিউজরুমে স্বাগতম',
    'onboarding.subtitle': 'চলুন আপনার অভিজ্ঞতা কাস্টমাইজ করি',
    'onboarding.persona': 'আপনার পার্সোনা নির্বাচন করুন',
    'onboarding.language': 'আপনার ভাষা নির্বাচন করুন',
    'onboarding.generate': 'আমার ফিড তৈরি করুন',
    'persona.startup_founder': 'স্টার্টআপ ফাউন্ডার',
    'persona.retail_investor': 'রিটেইল বিনিয়োগকারী',
    'persona.student': 'ছাত্র',
    'persona.corporate_executive': 'কর্পোরেট এক্সিকিউটিভ',
    'persona.trader': 'ট্রেডার',
    'deepdive.watch': '60s AI ব্রিফিং দেখুন',
    'deepdive.timeline': 'গল্প টাইমলাইন',
    'deepdive.key_players': 'মূল খেলোয়াড়',
    'deepdive.briefing': 'সংশ্লেষিত ব্রিফিং',
    'deepdive.ask': 'এই ব্রিফিং সম্পর্কে একটি অনুসরণ প্রশ্ন জিজ্ঞাসা করুন...',
    'deepdive.chat_history': 'চ্যাট ইতিহাস',
  },
  ta: {
    'hero.title': 'வணிகச் செய்திகள், உங்களுக்காக மீண்டும் வடிவமைக்கப்பட்டவை',
    'hero.subtitle': "நிலையான கட்டுரைகளைப் படிப்பதை நிறுத்துங்கள். டைனமிக் கதை வளைவுகள், ஊடாடும் AI பிரிஃபிங்குகள் மற்றும் உடனடி வீடியோ சுருக்கங்களை அனுபவியுங்கள்.",
    'cta.enter': 'செய்தி அறைக்குள் நுழைய',
    'cta.how': 'இது எவ்வாறு செயல்படுகிறது பார்க்கவும்',
    'feature.personalized': 'தனிப்படுத்தப்பட்ட செய்தி அறை',
    'feature.personalized.desc': 'உங்கள் ஆர்வம் மற்றும் பாத்திரத்தின் அடிப்படையில் குறிப்பிட்ட ஃபீடுகள்',
    'feature.briefings': 'ஊடாடும் Intelligence Briefings',
    'feature.briefings.desc': 'உங்கள் செய்திகளுடன் அரட்டையடித்து AI-ஆல் இயக்கப்படும் நுண்ணறிவுகளைப் பெறுங்கள்',
    'feature.video': 'AI செய்தி வீடியோ ஸ்டுடியோ',
    'feature.video.desc': 'முக்கிய செய்திகளின் 60-விநாடி ஒளிபரப்பு சுருக்கங்கள்',
    'feature.vernacular': 'வெர்னாகுலர் எஞ்சின்',
    'feature.vernacular.desc': 'உங்கள் மொழியில் பண்பாட்டு ரீதியாக பொருத்தப்பட்ட மொழிபெயர்ப்புகள்',
    'dashboard.title': 'என் செய்தி அறை',
    'dashboard.story_arc': 'கதை வளைவு',
    'dashboard.updates': 'புதுப்பிப்புகள்',
    'dashboard.pulse.developing': 'வளர்வதற்கான கதை',
    'dashboard.pulse.volatility': 'உயர் ஏற்ற இறக்கம்',
    'dashboard.pulse.bullish': 'உணர்வு: bullish',
    'dashboard.pulse.bearish': 'உணர்வு: bearish',
    'dashboard.open': 'Intelligence Briefing ஐத் திறக்கவும்',
    'nav.profile': 'சுயவிவரம்',
    'onboarding.title': 'உங்கள் தனிப்படுத்தப்பட்ட செய்தி அறைக்கு வரவேற்கிறோம்',
    'onboarding.subtitle': 'உங்கள் அனுபவத்தைத் தனிப்படுத்துவோம்',
    'onboarding.persona': 'உங்கள் பாத்திரத்தைத் தேர்ந்தெடுக்கவும்',
    'onboarding.language': 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்',
    'onboarding.generate': 'என் ஃபீடை உருவாக்குங்கள்',
    'persona.startup_founder': 'தொடக்க நிறுவனர்',
    'persona.retail_investor': 'ரீடைல் முதலீட்டாளர்',
    'persona.student': 'மாணவர்',
    'persona.corporate_executive': 'கார்ப்பரேட் நிர்வாகி',
    'persona.trader': 'வியாபாரி',
    'deepdive.watch': '60s AI Briefing பார்க்கவும்',
    'deepdive.timeline': 'கதை காலவரிசை',
    'deepdive.key_players': 'முக்கிய நடிகர்கள்',
    'deepdive.briefing': 'தொகுக்கப்பட்ட Briefing',
    'deepdive.ask': 'இந்த Briefing பற்றி ஒரு தொடர்பு கேள்வியைக் கேளுங்கள்...',
    'deepdive.chat_history': 'அரட்டை வரலாறு',
  },
  te: {
    'hero.title': 'व्यापार समाचार, आपके लिए फिर से बनाया गया',
    'hero.subtitle': "स्थिर लेख पढ़ना बंद करें। गतिशील कहानी आर्क्स, इंटरैक्टिव AI ब्रीफिंग और तत्काल वीडियो सारांश का अनुभव करें।",
    'cta.enter': 'न्यूज़रूम में प्रवेश करें',
    'cta.how': 'यह कैसे काम करता है देखें',
    'feature.personalized': 'व्यक्तिगत न्यूज़रूम',
    'feature.personalized.desc': 'आपकी रुचि और भूमिका के आधार पर लक्षित फीड्स',
    'feature.briefings': 'इंटरैक्टिव इंटेलिजेंस ब्रीफिंग्स',
    'feature.briefings.desc': 'अपने समाचार के साथ चैट करें और AI-संचालित अंतर्दृष्टि प्राप्त करें',
    'feature.video': 'AI न्यूज़ वीडियो स्टूडियो',
    'feature.video.desc': 'ब्रेकिंग स्टोरीज़ के 60-सेकंड प्रसारण सारांश',
    'feature.vernacular': 'वर्नाक्युलर इंजन',
    'feature.vernacular.desc': 'आपकी भाषा में सांस्कृतिक रूप से अनुकूलित अनुवाद',
    'dashboard.title': 'मेरा न्यूज़रूम',
    'dashboard.story_arc': 'कहानी आर्क',
    'dashboard.updates': 'अपडेट्स',
    'dashboard.pulse.developing': 'विकसित हो रही कहानी',
    'dashboard.pulse.volatility': 'उच्च अस्थिरता',
    'dashboard.pulse.bullish': 'भावना: तेज़ी',
    'dashboard.pulse.bearish': 'भावना: मंदी',
    'dashboard.open': 'इंटेलिजेंस ब्रीफिंग खोलें',
    'nav.profile': 'प्रोफ़ाइल',
    'onboarding.title': 'आपके व्यक्तिगत न्यूज़रूम में आपका स्वागत है',
    'onboarding.subtitle': 'चलिए आपका अनुभव अनुकूलित करें',
    'onboarding.persona': 'अपना पर्सोना चुनें',
    'onboarding.language': 'अपनी भाषा चुनें',
    'onboarding.generate': 'मेरी फीड बनाएं',
    'persona.startup_founder': 'स्टार्टअप फाउंडर',
    'persona.retail_investor': 'रेटेल निवेशक',
    'persona.student': 'विद्यार्थी',
    'persona.corporate_executive': 'कार्पोरेट अधिकारी',
    'persona.trader': 'ट्रेडर',
    'deepdive.watch': '60s AI ब्रीफिंग देखें',
    'deepdive.timeline': 'कहानी टाइमलाइन',
    'deepdive.key_players': 'प्रमुख खिलाड़ी',
    'deepdive.briefing': 'संश्लेषित ब्रीफिंग',
    'deepdive.ask': 'इस ब्रीफिंग के बारे में एक अनुवर्ती प्रश्न पूछें...',
    'deepdive.chat_history': 'चैट इतिहास',
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    isAuthenticated: false,
    user: null,
    persona: 'retail_investor',
    language: 'en',
    showOnboarding: false,
    selectedCategory: null,
  });

  // Sync auth state with Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in with Firebase
        setState((prev) => ({
          ...prev,
          isAuthenticated: true,
          user: {
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
          },
        }));
      } else {
        // User is signed out
        setState((prev) => ({
          ...prev,
          isAuthenticated: false,
          user: null,
          selectedCategory: null,
        }));
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = (email: string) => {
    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
      user: { email, name: email.split('@')[0] },
      showOnboarding: true,
    }));
  };

  const logout = async () => {
    try {
      await doSignOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
    setState({
      isAuthenticated: false,
      user: null,
      persona: 'retail_investor',
      language: 'en',
      showOnboarding: false,
      selectedCategory: null,
    });
  };

  const setPersona = (persona: Persona) => {
    setState((prev) => ({ ...prev, persona }));
  };

  const setLanguage = (language: Language) => {
    setState((prev) => ({ ...prev, language }));
  };

  const setSelectedCategory = (category: string | null) => {
    setState((prev) => ({ ...prev, selectedCategory: category }));
  };

  // Translation function
  const t = (key: string): string => {
    const lang = state.language;
    const translationsLang = translations[lang as Language];
    return translationsLang?.[key] || translations.en?.[key] || key;
  };

  const completeOnboarding = () => {
    setState((prev) => ({ ...prev, showOnboarding: false }));
  };

  const skipOnboarding = () => {
    setState((prev) => ({ ...prev, showOnboarding: false }));
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
        logout,
        setPersona,
        setLanguage,
        setSelectedCategory,
        completeOnboarding,
        skipOnboarding,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export function useTranslation() {
  const { language } = useApp();
  return (key: string): string => {
    return translations[language][key] || key;
  };
}