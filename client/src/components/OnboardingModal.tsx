import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, 
  TrendingUp, 
  GraduationCap, 
  Briefcase, 
  BarChart3,
  Globe,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useApp, type Persona, type Language } from '../contexts/AppContext';

const personas: { id: Persona; icon: React.ElementType; labelKey: string }[] = [
  { id: 'startup_founder', icon: Rocket, labelKey: 'persona.startup_founder' },
  { id: 'retail_investor', icon: TrendingUp, labelKey: 'persona.retail_investor' },
  { id: 'student', icon: GraduationCap, labelKey: 'persona.student' },
  { id: 'corporate_executive', icon: Briefcase, labelKey: 'persona.corporate_executive' },
  { id: 'trader', icon: BarChart3, labelKey: 'persona.trader' },
];

const languages: { id: Language; name: string }[] = [
  { id: 'en', name: 'English' },
  { id: 'hi', name: 'हिंदी (Hindi)' },
  { id: 'bn', name: 'বাংলা (Bengali)' },
  { id: 'ta', name: 'தமிழ் (Tamil)' },
  { id: 'te', name: 'తెలుగు (Telugu)' },
];

export default function OnboardingModal() {
  const { 
    showOnboarding, 
    persona, 
    language, 
    setPersona, 
    setLanguage, 
    completeOnboarding,
    skipOnboarding 
  } = useApp();

  const t = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        'onboarding.title': 'Welcome to Your Personal Newsroom',
        'onboarding.subtitle': "Let's customize your experience",
        'onboarding.persona': 'Select Your Persona',
        'onboarding.language': 'Choose Your Language',
        'onboarding.generate': 'Generate My Feed',
        'skip': 'Skip for now',
      },
      hi: {
        'onboarding.title': 'आपके व्यक्तिगत समाचार कक्ष में आपका स्वागत है',
        'onboarding.subtitle': 'चलिए आपका अनुभव अनुकूलित करें',
        'onboarding.persona': 'अपना व्यक्तित्व चुनें',
        'onboarding.language': 'अपनी भाषा चुनें',
        'onboarding.generate': 'मेरी फीड बनाएं',
        'skip': 'अभी छोड़ें',
      },
      bn: {
        'onboarding.title': 'আপনার ব্যক্তিগত নিউজরুমে স্বাগতম',
        'onboarding.subtitle': 'চলুন আপনার অভিজ্ঞতা কাস্টমাইজ করি',
        'onboarding.persona': 'আপনার পার্সোনা নির্বাচন করুন',
        'onboarding.language': 'আপনার ভাষা নির্বাচন করুন',
        'onboarding.generate': 'আমার ফিড তৈরি করুন',
        'skip': 'এখন এড়িয়ে যান',
      },
      ta: {
        'onboarding.title': 'உங்கள் தனிப்படுத்தப்பட்ட செய்தி அறைக்கு வரவேற்கிறோம்',
        'onboarding.subtitle': 'உங்கள் அனுபவத்தைத் தனிப்படுத்துவோம்',
        'onboarding.persona': 'உங்கள் பாத்திரத்தைத் தேர்ந்தெடுக்கவும்',
        'onboarding.language': 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்',
        'onboarding.generate': 'என் ஃபீடை உருவாக்குங்கள்',
        'skip': 'தற்போதைக்கு தவிர்க்கவும்',
      },
      te: {
        'onboarding.title': 'Welcome',
        'onboarding.subtitle': 'Customize',
        'onboarding.persona': 'Select Persona',
        'onboarding.language': 'Select Language',
        'onboarding.generate': 'Generate Feed',
        'skip': 'Skip',
      },
    };
    return translations[language]?.[key] || key;
  };

  const getPersonaLabel = (pId: Persona): string => {
    const labels: Record<Language, Record<Persona, string>> = {
      en: {
        startup_founder: 'Startup Founder',
        retail_investor: 'Retail Investor',
        student: 'Student',
        corporate_executive: 'Corporate Executive',
        trader: 'Trader',
      },
      hi: {
        startup_founder: 'स्टार्टअप फाउंडर',
        retail_investor: 'खुदरा निवेशक',
        student: 'छात्र',
        corporate_executive: 'कॉर्पोरेट अधिकारी',
        trader: 'व्यापारी',
      },
      bn: {
        startup_founder: 'স্টার্টআপ ফাউন্ডার',
        retail_investor: 'রিটেইল বিনিয়োগকারী',
        student: 'ছাত্র',
        corporate_executive: 'কর্পোরেট এক্সিকিউটিভ',
        trader: 'ট্রেডার',
      },
      ta: {
        startup_founder: 'தொடக்க நிறுவனர்',
        retail_investor: 'ரீடைல் முதலீட்டாளர்',
        student: 'மாணவர்',
        corporate_executive: 'கார்ப்பரேட் நிர்வாகி',
        trader: 'வியாபாரி',
      },
      te: {
        startup_founder: 'Founder',
        retail_investor: 'Investor',
        student: 'Student',
        corporate_executive: 'Executive',
        trader: 'Trader',
      },
    };
    return labels[language]?.[pId] || labels.en[pId];
  };

  if (!showOnboarding) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-xl"
        >
          <Card className="bg-white border-gray-200 shadow-xl">
            <CardContent className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('onboarding.title')}</h2>
                <p className="text-gray-500">{t('onboarding.subtitle')}</p>
              </div>

              {/* Persona Selection */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">{t('onboarding.persona')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {personas.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPersona(p.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        persona === p.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <p.icon 
                        className={`w-5 h-5 mx-auto mb-2 ${
                          persona === p.id ? 'text-orange-600' : 'text-gray-500'
                        }`} 
                      />
                      <span className={`text-sm font-medium block ${
                        persona === p.id ? 'text-orange-700' : 'text-gray-700'
                      }`}>
                        {getPersonaLabel(p.id)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Selection */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">{t('onboarding.language')}</h3>
                <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
                  <SelectTrigger className="w-full border-gray-200">
                    <Globe className="w-4 h-4 mr-2 text-gray-500" />
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.id} value={lang.id}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={skipOnboarding}
                  variant="outline"
                  className="flex-1 border-gray-200 hover:bg-gray-50"
                >
                  {t('skip')}
                </Button>
                <Button
                  onClick={completeOnboarding}
                  className="flex-1 glow-button text-white"
                >
                  {t('onboarding.generate')}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}