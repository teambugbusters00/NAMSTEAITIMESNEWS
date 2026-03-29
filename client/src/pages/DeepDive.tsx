import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Share2, 
  Bookmark,
  PlayCircle,
  Send,
  ChevronRight,
  BarChart2,
  X,
  Bot
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useApp } from '../contexts/AppContext';

interface TimelineEvent {
  id: string;
  time: string;
  title: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const mockTimeline: TimelineEvent[] = [
  { id: '1', time: '2 hrs ago', title: 'RBI keeps repo rate unchanged at 6.5%' },
  { id: '2', time: '5 hrs ago', title: 'Industry bodies react to policy decision' },
  { id: '3', time: '1 day ago', title: 'MPC meeting schedule announced' },
  { id: '4', time: '3 days ago', title: 'CPI inflation data shows improvement' },
  { id: '5', time: '1 week ago', title: 'Fed signals potential rate cuts' },
];

const mockChatHistory: ChatMessage[] = [
  { id: '1', role: 'user', content: 'How does this affect Series A funding?' },
  { id: '2', role: 'assistant', content: 'Higher borrowing costs may lead to 15-20% lower valuations in upcoming rounds.' },
];

const keyPlayers = [
  { name: 'Reserve Bank of India', role: 'Central Bank' },
  { name: 'Shaktikanta Das', role: 'Governor' },
  { name: 'SEBI', role: 'Market Regulator' },
  { name: 'IVCA', role: 'Venture Capital Association' },
];

const relatedStories = [
  { id: 'r1', headline: 'Startups face higher borrowing costs', category: 'STARTUPS' },
  { id: 'r2', headline: 'IT sector sees Q4 funding surge', category: 'TECHNOLOGY' },
  { id: 'r3', headline: 'Real estate inventory hits 5-year low', category: 'REAL ESTATE' },
];

export default function DeepDive() {
  const navigate = useNavigate();
  const { id: _id } = useParams();
  const { language } = useApp();
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(mockChatHistory);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const t = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        'deepdive.timeline': 'Timeline',
        'deepdive.key_players': 'Key Players',
        'deepdive.briefing': 'Summary',
        'deepdive.related': 'Related Stories',
        'deepdive.ask': 'Ask AI assistant...',
        'deepdive.watch': 'Watch Briefing',
      },
      hi: {
        'deepdive.timeline': 'समयरेखा',
        'deepdive.key_players': 'प्रमुख खिलाड़ी',
        'deepdive.briefing': 'सारांश',
        'deepdive.related': 'संबंधित',
        'deepdive.ask': 'AI से पूछें...',
        'deepdive.watch': 'ब्रीफिंग देखें',
      },
      bn: {
        'deepdive.timeline': 'টাইমলাইন',
        'deepdive.key_players': 'খেলোয়াড়',
        'deepdive.briefing': 'সারসংক্ষেপ',
        'deepdive.related': 'সম্পর্কিত',
        'deepdive.ask': 'জিজ্ঞাসা...',
        'deepdive.watch': 'দেখুন',
      },
    };
    return translations[language]?.[key] || key;
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    const newUserMessage: ChatMessage = {
      id: String(chatMessages.length + 1),
      role: 'user',
      content: chatInput,
    };
    
    setChatMessages([...chatMessages, newUserMessage]);
    setChatInput('');
    
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: String(chatMessages.length + 2),
        role: 'assistant',
        content: "Based on analysis, this could significantly impact your portfolio. Would you like sector-specific details?",
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#f6f6f6] relative">
      {/* Floating AI Assistant Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-orange-600 to-orange-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 group"
        aria-label="Open AI Assistant"
      >
        <Bot className="w-6 h-6 group-hover:animate-pulse" />
      </button>

      {/* AI Assistant Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold">AI Assistant</span>
            </div>
            <button 
              onClick={() => setIsChatOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-3 text-sm rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-orange-100 text-gray-900' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <Input
                placeholder={t('deepdive.ask')}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 border-gray-300"
              />
              <Button 
                onClick={handleSendMessage}
                className="bg-orange-700 hover:bg-orange-800 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isChatOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsChatOpen(false)}
        />
      )}
      {/* Article Header */}
      <header className="bg-white border-b border-gray-300">
        <div className="max-w-[1200px] mx-auto px-2 md:px-4 py-3 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden md:inline">Back</span>
          </Button>
          <div className="flex items-center space-x-1 md:space-x-2">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center space-x-1 mr-2 md:mr-4 cursor-pointer hover:opacity-80"
            >
              <div className="w-6 h-6 rounded bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">ET</span>
              </div>
              <span className="text-sm font-medium text-gray-700 hidden md:inline">ET AI</span>
            </button>
            <Button variant="ghost" size="sm" className="text-gray-600">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600">
              <Bookmark className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-2 md:px-4 py-4 md:py-6">
        {/* Article Title Section */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <span className="label-small text-orange-700">FINANCE</span>
            <span className="text-gray-400">|</span>
            <span className="timestamp">Published 2 hours ago</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
            RBI signals rate cut possibility as inflation eases to 5.1%
          </h1>
          
          <p className="text-lg text-gray-600 leading-relaxed mb-4">
            The Reserve Bank of India indicates a potential shift in monetary policy as consumer price index shows improvement, raising hopes for the startup ecosystem.
          </p>
        </div>

        {/* 2-Column Layout: Video Left, Content Right */}
        <div className="grid grid-cols-12 gap-4 md:gap-8">
          
          {/* LEFT - Video Section (Small) */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Video Section - Smaller */}
            <div className="bg-gray-900 aspect-[4/3] flex items-center justify-center cursor-pointer relative group">
              <PlayCircle className="w-12 h-12 text-white/80 group-hover:text-white group-hover:scale-110 transition-all" />
              <div className="absolute bottom-3 left-3">
                <span className="bg-orange-700 text-white text-xs px-2 py-1">
                  {t('deepdive.watch')}
                </span>
              </div>
            </div>

            {/* Market Data */}
            <div className="bg-white border border-gray-300 p-4">
              <h2 className="label-small text-gray-500 mb-4 border-b border-gray-200 pb-2 flex items-center">
                <BarChart2 className="w-4 h-4 mr-2" />
                Market Pulse
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Sensex</span>
                  <span className="text-sm font-medium text-green-600">+0.8%</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Nifty</span>
                  <span className="text-sm font-medium text-green-600">+0.6%</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Bank Nifty</span>
                  <span className="text-sm font-medium text-red-600">-0.2%</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-600">FII Activity</span>
                  <span className="text-sm font-medium text-green-600">+₹2,400 Cr</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT - Article Content */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* Executive Summary */}
            <div className="bg-white border border-gray-300 p-6">
              <h2 className="label-small text-gray-500 mb-4 border-b border-gray-200 pb-2">{t('deepdive.briefing')}</h2>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <span className="w-2 h-2 rounded-full bg-orange-700 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">RBI Maintains Status Quo</p>
                    <p className="text-sm text-gray-600 mt-0.5">Repo rate unchanged at 6.5% for eighth consecutive time, focusing on inflation control</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Startup Ecosystem Impact</p>
                    <p className="text-sm text-gray-600 mt-0.5">High borrowing costs continue to squeeze valuations, seed rounds see 15-20% reduction</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="w-2 h-2 rounded-full bg-green-600 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Positive Outlook</p>
                    <p className="text-sm text-gray-600 mt-0.5">With CPI inflation at 5.1%, rate cuts may begin in Q3 FY24, potentially boosting funding</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="w-2 h-2 rounded-full bg-purple-600 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Sector Effects</p>
                    <p className="text-sm text-gray-600 mt-0.5">E-commerce and fintech most affected; deep tech and AI startups showing resilience</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Timeline */}
            <div className="bg-white border border-gray-300 p-6">
              <h2 className="label-small text-gray-500 mb-4 border-b border-gray-200 pb-2">{t('deepdive.timeline')}</h2>
              <div className="space-y-0">
                {mockTimeline.map((event) => (
                  <div key={event.id} className="relative pl-6 py-3 border-l border-gray-200 last:border-l-0">
                    <div className="absolute left-0 top-3.5 w-2 h-2 -translate-x-1/2 rounded-full bg-orange-700" />
                    <span className="text-xs text-gray-500 block mb-0.5">{event.time}</span>
                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Players + Related - Side by Side */}
            <div className="grid grid-cols-2 gap-6">
              {/* Key Players */}
              <div className="bg-white border border-gray-300 p-4">
                <h2 className="label-small text-gray-500 mb-4 border-b border-gray-200 pb-2">{t('deepdive.key_players')}</h2>
                <div className="space-y-3">
                  {keyPlayers.map((player) => (
                    <div key={player.name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{player.name}</p>
                        <p className="text-xs text-gray-500">{player.role}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Stories */}
              <div className="bg-white border border-gray-300 p-4">
                <h2 className="label-small text-gray-500 mb-4 border-b border-gray-200 pb-2">{t('deepdive.related')}</h2>
                <div className="space-y-4">
                  {relatedStories.map((story) => (
                    <div 
                      key={story.id} 
                      className="cursor-pointer group"
                      onClick={() => navigate(`/story/${story.id}`)}
                    >
                      <span className="label-small text-orange-700">{story.category}</span>
                      <h4 className="text-sm font-medium text-gray-900 mt-1 group-hover:text-orange-700 transition-colors">
                        {story.headline}
                      </h4>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}