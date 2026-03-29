import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Loader2,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { auth } from '../firebase/firebase';
import MindMap from '../components/MindMap';

// ── Types ─────────────────────────────────────────────────────────────────────

interface NewsBriefing {
  headline: string;
  category: string;
  summary: string[];
  keyPlayers: string[];
  arc: string[];
  sourceUrl: string;
  img?: string;
}

// ── Mock Data for Visuals ─────────────────────────────────────────────────────

const videoBgs = [
  'from-slate-900 to-red-800',
  'from-slate-900 to-blue-900',
  'from-slate-700 to-slate-800',
];

const mockVideos = [
  { title: "Market Volatility: Expert Analysis", tag: 'LIVE' },
  { title: 'Breaking Down the Story Arc', tag: 'VIDEO' },
  { title: 'Key Players Interview', tag: 'VIDEO' },
];

const mockPhotos = [
  { label: 'Primary Investigation Scene', category: 'GEOPOLITICS', bg: 'from-red-900 to-red-950' },
  { label: 'Market Response Chart', category: 'MARKETS', bg: 'from-blue-800 to-blue-950' },
  { label: 'Stakeholder Meeting', category: 'ECONOMY', bg: 'from-green-700 to-green-900' },
];

// ── Components ────────────────────────────────────────────────────────────────

interface PlaceholderImgProps {
  heightClass?: string;
  bg?: string;
  text?: string;
  src?: string;
}

function PlaceholderImg({ heightClass = 'h-20', bg, text, src }: PlaceholderImgProps) {
  if (src) {
    return (
      <div className={`relative w-full ${heightClass} rounded-sm overflow-hidden flex-shrink-0`}>
        <img src={src} alt={text} className="w-full h-full object-cover" onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
        }} />
        <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
    );
  }
  return (
    <div
      className={`relative w-full ${heightClass} bg-gradient-to-br ${bg || 'from-gray-700 to-gray-900'} rounded-sm overflow-hidden flex items-center justify-center flex-shrink-0`}
    >
      {text && (
        <span className="text-white/30 text-[10px] text-center px-2 z-10">{text}</span>
      )}
      <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  );
}

// ── NewsCard ──────────────────────────────────────────────────────────────────

interface NewsCardProps {
  article: NewsBriefing;
}

function NewsCard({ article }: NewsCardProps) {
  const [activeTab, setActiveTab] = useState('summary');

  // Helper to parse key players from "Name: Role" format
  const parseKeyPlayer = (player: string) => {
    const [name, ...roleParts] = player.split(':');
    const role = roleParts.join(':').trim();
    const colors = ['bg-red-700', 'bg-blue-900', 'bg-orange-500', 'bg-green-600', 'bg-purple-700'];
    const initial = name.trim().charAt(0);
    const colorIndex = name.length % colors.length;

    return {
      name: name.trim(),
      role: role || 'Key Player',
      initial,
      color: colors[colorIndex]
    };
  };

  // Helper to parse story arc from "Time - Event" format
  const parseStoryArc = (arc: string) => {
    const [datePart, ...headlineParts] = arc.split(' - ');
    const headline = headlineParts.join(' - ').trim();
    let formattedDate = datePart.trim();

    // Check if the datePart is an ISO string or a valid date string
    const dateObj = new Date(formattedDate);
    if (!isNaN(dateObj.getTime()) && (formattedDate.includes('T') || formattedDate.includes('-'))) {
      formattedDate = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }

    return {
      date: formattedDate,
      headline: headline || arc
    };
  };

  const [selectedButton, setSelectedButton] = useState(0);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const TABS = [
    { id: 0, label: 'Briefing' },
    { id: 1, label: 'ET AI' },
    { id: 2, label: 'Mindmap' }
  ];

  // Clear history when switching away from ET AI tab
  useEffect(() => {
    if (selectedButton !== 1) {
      setMessages([]);
      setInput('');
    }
  }, [selectedButton]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isChatLoading) return;

    const userMessage = { role: 'user' as const, content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsChatLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      const token = await user.getIdToken();

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            content: m.content
          })),
          articleContext: {
            headline: article.headline,
            category: article.category,
            summary: article.summary,
            keyPlayers: article.keyPlayers,
            arc: article.arc
          }
        })
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      const data = await response.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([...newMessages, { role: 'assistant', content: 'The intelligence engine encountered an error. Please try again.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className='mb-10'>
      <div className="flex flex-row items-center">
        {TABS.map((tab) => {
          const isActive = selectedButton === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedButton(tab.id)}
              className={`h-10 px-4 py-2 border border-b-0 border-gray-300 transition-colors duration-200 ${isActive
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-900 hover:text-white'
                }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-l-none grid grid-cols-[240px_1fr_300px] bg-white border border-gray-200 shadow-lg rounded-sm overflow-hidden mb-12 last:mb-0">
        {/* First tab (Briefing) */}
        {selectedButton === 0 && (
          <>
            {/* ── LEFT: Headline + Summary + Key Players ── */}
            <aside className="bg-white px-4 py-5 border-r border-gray-100">
              <div className="mb-4">
                <PlaceholderImg
                  heightClass="h-32"
                  src={article.img}
                  bg="from-[#1a1a2e] to-red-900"
                  text={article.headline}
                />
                <div className="bg-[#1a1a2e] px-3 py-2.5 border-l-4 border-[#d4380d]">
                  <span className="block text-[8px] text-yellow-400 tracking-[0.2em] font-sans font-bold mb-1 uppercase">
                    {article.category}
                  </span>
                  <h2 className="m-0 text-[14px] leading-snug text-white font-serif font-bold">
                    {article.headline}
                  </h2>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b-2 border-gray-100 mb-3">
                {['summary', 'players'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-1.5 border-none bg-transparent text-[10px] font-sans font-bold tracking-wider uppercase cursor-pointer transition-colors duration-200 border-b-2 -mb-0.5 ${activeTab === tab
                      ? 'text-[#d4380d] border-b-[#d4380d]'
                      : 'text-gray-400 border-b-transparent'
                      }`}
                  >
                    {tab === 'summary' ? 'Briefing' : 'Players'}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'summary' ? (
                <div className="flex flex-col gap-2.5">
                  {article.summary.map((point, i) => (
                    <div
                      key={i}
                      className={`flex gap-2.5 px-2 py-2 rounded border ${i === 0
                        ? 'bg-[#fff8f6] border-[#f0d0c8] border-l-[3px] border-l-[#d4380d]'
                        : 'bg-[#fafaf9] border-gray-200 border-l-[3px] border-l-gray-300'
                        }`}
                    >
                      <span className={`text-sm font-bold leading-none flex-shrink-0 mt-0.5 ${i === 0 ? 'text-[#d4380d]' : 'text-gray-300'}`}>•</span>
                      <p className="m-0 text-[11px] leading-relaxed text-gray-700 font-sans">{point}</p>
                    </div>
                  ))}
                  <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-1 text-[9px] text-blue-600 hover:underline font-sans font-bold">READ SOURCE →</a>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {article.keyPlayers.map((playerStr, i) => {
                    const p = parseKeyPlayer(playerStr);
                    return (
                      <div key={i} className="flex items-center gap-2 px-2 py-1.5 bg-[#fafaf9] border border-gray-200 rounded">
                        <div className={`w-7 h-7 rounded-full ${p.color} flex items-center justify-center text-white text-[10px] font-bold font-sans flex-shrink-0`}>{p.initial}</div>
                        <div className="overflow-hidden">
                          <span className="block text-[11px] font-bold text-[#1a1a2e] font-sans truncate">{p.name}</span>
                          <span className="text-[9px] text-gray-400 font-sans tracking-tight block truncate">{p.role}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </aside>

            {/* ── MIDDLE: Story Arc Timeline ── */}
            <main className="px-6 py-5 border-r border-gray-100 bg-[#faf9f6]">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-[20px] bg-[#d4380d] rounded-sm" />
                  <span className="text-xs font-bold tracking-[0.2em] uppercase font-sans text-[#1a1a2e]">Story Arc</span>
                </div>
                <p className="ml-3 text-[10px] text-gray-400 font-sans">Timeline Intelligence</p>
              </div>

              <div className="relative pl-7">
                <div className="absolute left-[10px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#d4380d] to-yellow-400/50 rounded" />
                {article.arc.map((arcStr, i) => {
                  const item = parseStoryArc(arcStr);
                  const isLatest = i === 0;
                  return (
                    <div key={i} className={`relative ${i < article.arc.length - 1 ? 'mb-6' : ''}`}>
                      <div className={`absolute top-1 rounded-full border-2 -left-6 w-3.5 h-3.5 bg-[#d4380d] border-white shadow-[0_0_0_3px_rgba(212,56,13,0.1)]`} />
                      <div className='bg-white border border-[#f0e0d6] border-l-4 border-l-[#d4380d] rounded px-3 py-2 shadow-sm'>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] font-sans font-bold text-[#d4380d]`}>{item.date}</span>
                          {isLatest && <span className="bg-[#d4380d] text-white text-[7px] px-1 py-0.5 rounded-sm font-sans font-bold">LATEST</span>}
                        </div>
                        <p className={`m-0 leading-snug text-[13px] text-[#1a1a2e] font-semibold font-serif`}>{item.headline}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </main>

            {/* ── RIGHT: Video & Photo Mock Sections ── */}
            <aside className="bg-white px-4 py-5 flex flex-col gap-6">
              {/* Videos */}
              <div>
                <div className="flex items-center gap-1.5 mb-3 border-b-2 border-[#1a1a2e] pb-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#d4380d"><polygon points="5,3 19,12 5,21" /></svg>
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase font-sans text-[#1a1a2e]">Media Hub</span>
                </div>
                <div className="flex flex-col gap-3">
                  {mockVideos.map((v, i) => (
                    <div key={i} className="flex flex-col gap-1 cursor-pointer group">
                      <div className="relative">
                        <PlaceholderImg heightClass="h-20" bg={videoBgs[i]} text={v.title} />
                        <span className={`absolute top-1 left-1 text-white text-[7px] px-1 py-0.5 font-sans font-bold ${v.tag === 'LIVE' ? 'bg-[#d4380d]' : 'bg-[#1a1a2e]'}`}>{v.tag}</span>
                      </div>
                      <p className="m-0 text-[10px] leading-tight text-gray-800 font-sans group-hover:text-[#d4380d] transition-colors">{v.title}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photos */}
              <div>
                <div className="flex items-center gap-1.5 mb-3 border-b-2 border-[#1a1a2e] pb-1.5">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21,15 16,10 5,21" /></svg>
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase font-sans text-[#1a1a2e]">Gallery</span>
                </div>
                <div className="flex flex-col gap-2.5">
                  {mockPhotos.map((p, i) => (
                    <div key={i} className="flex gap-2 items-start cursor-pointer group">
                      <div className={`w-12 h-9 rounded-sm bg-gradient-to-br ${p.bg} flex-shrink-0 group-hover:opacity-80 transition-opacity`} />
                      <div className="overflow-hidden">
                        <span className="block text-[7px] text-[#d4380d] font-sans font-bold tracking-wider mb-0.5 uppercase">{p.category}</span>
                        <p className="m-0 text-[9px] leading-snug text-gray-700 font-sans line-clamp-2">{p.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </>
        )}

        {/* Second Tab (EI AI) */}
        {selectedButton === 1 && (
          <div className="col-span-3 flex flex-col h-[500px] bg-[#faf9f6]">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center px-10">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <Loader2 className="w-6 h-6 text-[#d4380d]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">ET Intelligence AI</h3>
                  <p className="text-sm text-gray-500 max-w-sm">
                    Ask anything about this intelligence briefing. I can provide deeper context, analyze key players, or explain the potential impact of these events.
                  </p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-sm px-4 py-3 text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-[#1a1a2e] text-white rounded-br-none' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                  }`}>
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="prose prose-sm max-w-none prose-slate">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-sm px-4 py-3 rounded-bl-none shadow-sm">
                    <Loader2 className="w-4 h-4 text-[#d4380d] animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask ET AI about this briefing..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#d4380d] focus:border-[#d4380d] text-sm font-sans"
              />
              <button
                type="submit"
                disabled={!input.trim() || isChatLoading}
                className="bg-[#1a1a2e] text-white px-6 py-2 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        )}

        {/* Third Tab (Mindmap) */}
        {selectedButton === 2 && (
          <div className="col-span-3 p-4">
            <div className="mb-4 flex items-center gap-2">
              <div className="w-1 h-[20px] bg-[#d4380d] rounded-sm" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase font-sans text-[#1a1a2e]">Intelligence Mind Map</span>
            </div>
            <MindMap 
              articleData={{
                headline: article.headline,
                category: article.category,
                summary: article.summary,
                keyPlayers: article.keyPlayers,
                arc: article.arc
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { persona, language, isAuthenticated, selectedCategory } = useApp();
  const [articles, setArticles] = useState<NewsBriefing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      if (!isAuthenticated) {
        // Don't set error yet, just wait. AppContext handles redirect or we can show a loader.
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const user = auth.currentUser;
        if (!user) {
          // If isAuthenticated is true but currentUser is still null (rare race condition), wait.
          return;
        }

        const token = await user.getIdToken();
        const categoryParam = selectedCategory && selectedCategory !== 'Home' ? `&category=${selectedCategory.toLowerCase()}` : '';
        const personaParam = persona ? `&searchTerm=${encodeURIComponent(persona.replace('_', ' '))}` : '';

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/news/fetch?language=${language}${categoryParam}${personaParam}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          // If it's a 404 with empty articles, handle gracefully
          const data = await response.json().catch(() => ({}));
          if (response.status === 404 && data.articles) {
            setArticles([]);
            return;
          }
          throw new Error(data.error || 'Failed to fetch news');
        }

        const data = await response.json();
        setArticles(data.articles || []);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('The intelligence engine encountered an error. Please check your API keys or try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [selectedCategory, language, persona, isAuthenticated]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gray-50">
        <Loader2 className="w-10 h-10 text-orange-600 animate-spin mb-4" />
        <p className="text-gray-600 font-serif italic">Synthesizing personalized intelligence briefings...</p>
      </div>
    );
  }

  if (error || articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="text-center max-w-md bg-white p-8 border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">No Briefings Available</h2>
          <p className="text-gray-600 mb-6 font-sans text-sm">{error || "We couldn't find any news matches for your current filters."}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-2 bg-[#d4380d] text-white rounded-sm font-sans font-bold hover:bg-[#b32e0b] transition-colors uppercase text-xs tracking-widest"
          >
            Retry Fetch
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-serif min-h-screen pb-20">

      {/* ── Vertical Card Stack ── */}
      <div className="max-w-[1200px] mx-auto px-4">
        {articles.map((article, index) => (
          <NewsCard key={index} article={article} />
        ))}
      </div>

    </div>
  );
}