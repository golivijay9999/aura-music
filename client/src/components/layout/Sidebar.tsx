import React from 'react';
import {
  Home,
  Search,
  Compass,
  Radio,
  Library,
  Scissors,
  Users,
  Download,
  Flame,
  Globe2,
  Sparkles,
  Settings,
  Heart
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const mainNav = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'explore', label: 'Explore & Charts', icon: Compass },
    { id: 'genres', label: 'Genres & Moods', icon: Radio },
    { id: 'languages', label: 'Regional Hub', icon: Globe2 },
  ];

  const studioNav = [
    { id: 'rooms', label: 'Listening Rooms', icon: Users, badge: 'Live Sync' },
    { id: 'ringtone', label: 'Ringtone Studio', icon: Scissors, badge: 'Cutter' },
    { id: 'library', label: 'My Library', icon: Library },
    { id: 'downloads', label: 'Downloads', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside aria-label="Sidebar navigation" className="hidden md:flex flex-col w-60 lg:w-64 bg-[#0a0614]/90 backdrop-blur-2xl border-r border-white/5 p-4 shrink-0 h-full select-none justify-between">
      <div>
        {/* Brand Logo */}
        <div
          onClick={() => setCurrentTab('home')}
          className="flex items-center space-x-3 px-3 py-4 mb-6 cursor-pointer group"
        >
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0a0614] rounded-2xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-purple-200 to-cyan-300 bg-clip-text text-transparent">
              AURA MUSIC
            </h1>
            <p className="text-[10px] text-purple-400/80 font-medium tracking-widest uppercase">
              Premium Ad-Free
            </p>
          </div>
        </div>

        {/* Discovery Section */}
        <div className="mb-6">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
            Discover
          </p>
          <nav className="space-y-1">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/20 text-white border border-purple-500/30 shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Studio & Features Section */}
        <div>
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
            Studio & Sync
          </p>
          <nav className="space-y-1">
            {studioNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/20 text-white border border-purple-500/30 shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      item.badge === 'Live Sync'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Ad-Free Premium Tag */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-900/30 via-indigo-900/20 to-zinc-900/60 border border-purple-500/20">
        <div className="flex items-center space-x-2 text-xs font-semibold text-white">
          <Flame className="w-4 h-4 text-amber-400 fill-current" />
          <span>Pure Ad-Free Experience</span>
        </div>
        <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
          Zero banner ads, zero audio interruptions, studio high-res fidelity.
        </p>
      </div>
    </aside>
  );
};
