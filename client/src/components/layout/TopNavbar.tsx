import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Download, User as UserIcon, LogIn, Sparkles, Globe } from 'lucide-react';

interface TopNavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  onOpenAuth: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  setCurrentTab,
  searchQuery,
  setSearchQuery,
  selectedLanguage,
  setSelectedLanguage,
  onOpenAuth
}) => {
  const { user } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<unknown>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt as { prompt?: () => void; userChoice?: Promise<{ outcome: string }> } | null;
    if (promptEvent && typeof promptEvent.prompt === 'function') {
      promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice?.outcome === 'accepted') {
        setCanInstall(false);
      }
    } else {
      alert('To install Aura Music on Android: Tap the 3 dots in Chrome and select "Add to Home screen" or "Install app".');
    }
  };

  const languages = [
    { id: 'all', label: 'All' },
    { id: 'telugu', label: 'Telugu' },
    { id: 'hindi', label: 'Hindi' },
    { id: 'tamil', label: 'Tamil' },
    { id: 'english', label: 'English' },
    { id: 'punjabi', label: 'Punjabi' }
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-3.5 bg-[#07050e]/80 backdrop-blur-xl border-b border-white/5">
      {/* Mobile Brand / Search Input */}
      <div className="flex items-center space-x-3 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search songs, artists, albums, or paste YouTube link..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentTab('search');
            }}
            onFocus={() => setCurrentTab('search')}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.08] transition-all"
          />
        </div>
      </div>

      {/* Language Quick Pills (Desktop / Tablet) */}
      <div className="hidden lg:flex items-center space-x-1.5 mx-4">
        {languages.map((l) => (
          <button
            key={l.id}
            onClick={() => setSelectedLanguage(l.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedLanguage === l.id
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Right Controls: Android PWA Install & Account */}
      <div className="flex items-center space-x-3 shrink-0">
        {/* Install PWA Button */}
        <button
          onClick={handleInstallClick}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 hover:from-purple-800/60 hover:to-cyan-800/60 border border-purple-500/30 text-purple-200 hover:text-white rounded-full text-xs font-medium transition-all shadow-sm"
          title="Install Aura Music on Android"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Install App</span>
        </button>

        {/* User Profile or Guest Login Button */}
        <button
          onClick={onOpenAuth}
          className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
        >
          <div className="w-6 h-6 rounded-full overflow-hidden bg-purple-600/30 flex items-center justify-center shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-3.5 h-3.5 text-purple-300" />
            )}
          </div>
          <span className="text-xs font-medium text-gray-200 hidden sm:inline truncate max-w-[100px]">
            {user?.isGuest ? 'Guest User' : user?.username || 'Sign In'}
          </span>
        </button>
      </div>
    </header>
  );
};
