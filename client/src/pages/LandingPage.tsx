import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight,
  Sparkles,
  BarChart3,
  Globe,
  PlayCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useApp } from '../contexts/AppContext';
import logo from '../assets/logo.png';

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useApp();

  return (
    <div className="min-h-screen bg-white">
      {/* Logo at top */}
      <div className="flex justify-center pt-6 pb-2 cursor-pointer items-center" onClick={() => navigate('/')}>
        <img 
          src={logo} 
          alt="Namaste News Times AI" 
          className="h-20 w-auto object-contain mr-4"
        />
        <div>
          <span className="text-gray-900 font-bold text-2xl tracking-tight">Namaste News Times</span>
          <span className="text-orange-700 ml-1 font-bold">AI</span>
        </div>
      </div>
      {/* MAIN CONTENT */}
      <main className="max-w-[1200px] mx-auto px-4 py-8">
        
        {/* Hero Section - Newspaper Style */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 mb-8 md:mb-12">
          {/* Left - Main Feature */}
          <div className="col-span-12 lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Date badge */}
              <div className="inline-block bg-orange-700 text-white text-xs px-2 py-1 mb-4">
                AI-POWERED
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                {t('hero.title')}
              </h2>
              
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {t('hero.subtitle')}
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:space-x-8 py-4 border-y border-gray-200 mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <BarChart3 className="w-5 h-5 text-orange-700" />
                    <span className="text-2xl font-bold text-gray-900">50K+</span>
                  </div>
                  <span className="text-xs text-gray-500">Daily Signals</span>
                </div>
                <div className="w-px h-8 bg-gray-300 hidden md:block" />
                <div className="text-center">
                  <span className="text-2xl font-bold text-gray-900">98%</span>
                  <span className="text-xs text-gray-500 block">Accuracy</span>
                </div>
                <div className="w-px h-8 bg-gray-300 hidden md:block" />
                <div className="text-center">
                  <span className="text-2xl font-bold text-gray-900">5</span>
                  <span className="text-xs text-gray-500 block">Languages</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => navigate('/auth')}
                  className="bg-orange-700 text-white hover:bg-orange-800 px-8 py-3"
                >
                  {t('cta.enter')}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3"
                >
                  <PlayCircle className="mr-2 w-4 h-4" />
                  {t('cta.how')}
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Right - Feature Cards */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gray-50 p-6 border border-gray-200"
            >
              <div className="flex items-center space-x-2 mb-3">
                <Sparkles className="w-5 h-5 text-orange-700" />
                <span className="label-small text-orange-700">FEATURE</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t('feature.personalized')}</h3>
              <p className="text-sm text-gray-600">
                {t('feature.personalized.desc')}
                Targeted feeds based on your interests and role - from startup founders to retail investors.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-50 p-6 border border-gray-200"
            >
              <div className="flex items-center space-x-2 mb-3">
                <PlayCircle className="w-5 h-5 text-orange-700" />
                <span className="label-small text-orange-700">FEATURE</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t('feature.video')}</h3>
              <p className="text-sm text-gray-600">
                {t('feature.video.desc')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gray-50 p-6 border border-gray-200"
            >
              <div className="flex items-center space-x-2 mb-3">
                <Globe className="w-5 h-5 text-orange-700" />
                <span className="label-small text-orange-700">FEATURE</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t('feature.vernacular')}</h3>
              <p className="text-sm text-gray-600">
                {t('feature.vernacular.desc')}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Sample Stories Preview */}
        <div className="border-t border-gray-300 pt-8">
          <h3 className="label-small text-gray-500 mb-6">TODAY'S TOP STORIES</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { category: 'FINANCE', headline: 'RBI signals rate cut possibility as inflation eases', time: '2 hours ago' },
              { category: 'TECHNOLOGY', headline: 'Tech layoffs: Indian SaaS startups face fresh wave', time: '4 hours ago' },
              { category: 'STARTUPS', headline: 'VC funding winter continues, Q4 sees 40% dip', time: '5 hours ago' },
            ].map((story, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="cursor-pointer group"
                onClick={() => navigate('/dashboard')}
              >
                <span className="label-small text-orange-700">{story.category}</span>
                <h4 className="text-lg font-bold text-gray-900 mt-1 group-hover:text-orange-700 transition-colors">
                  {story.headline}
                </h4>
                <span className="timestamp">{story.time}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}