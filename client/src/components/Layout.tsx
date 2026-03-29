import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { useApp } from '../contexts/AppContext';
import logo from '../assets/logo.png';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, isAuthenticated, logout, selectedCategory, setSelectedCategory } = useApp();

  const navCategories = ['Home', 'Markets', 'Technology', 'AI', 'Startups', 'Economy', 'Global', 'Real Estate'];

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category);
    navigate('/dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER - ET Style */}
      <header className="border-b border-gray-300">
        {/* Top Strip */}
        <div className="max-w-[1200px] mx-auto px-2 md:px-4 py-1 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-2 md:space-x-4 text-xs text-gray-500 overflow-x-auto">
            <span className="whitespace-nowrap">
              {new Intl.DateTimeFormat(language, { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date())}
            </span>
            <span className="whitespace-nowrap">
              {new Intl.DateTimeFormat(language, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
            </span>
          </div>
        </div>

        {/* Logo Row */}
        <div className="max-w-[1200px] mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <img 
              src={logo} 
              alt="Namaste News Times" 
              className="h-16 w-auto object-contain mr-4"
            />
            <div>
              <span className="text-gray-900 font-bold text-xl tracking-tight">Namaste News Times</span>
              <span className="text-orange-700 ml-1 font-bold">AI</span>
              <p className="text-xs text-gray-500 tracking-wider">THE FINANCIAL DAILY</p>
            </div>
          </div>

          {location.pathname === '/dashboard' && (
            <div className="hidden md:flex items-center gap-1">
              {navCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-3 py-1 text-[11px] font-sans font-bold uppercase tracking-wider transition-colors ${
                    selectedCategory === cat ? 'text-[#d4380d] bg-orange-50' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Button 
                onClick={logout}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Sign Out
              </Button>
            ) : (
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-gray-900 text-white hover:bg-gray-800"
              >
                Subscribe
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 py-6"><Outlet /></main>

       <footer className="border-t border-gray-300 py-8 mt-12 bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <span className="text-2xl font-bold text-gray-900">Namaste News Times</span>
              <span className="text-orange-700 ml-1">AI</span>
              <p className="text-xs text-gray-500 mt-2">© 2026 Namaste News Times. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}