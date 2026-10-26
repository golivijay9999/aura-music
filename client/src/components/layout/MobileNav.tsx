import React from 'react';
import { Home, Search, Compass, Users, Library } from 'lucide-react';
import { useRoom } from '../../context/RoomContext';

interface MobileNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, setCurrentTab }) => {
  const { isInRoom } = useRoom();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'rooms', label: 'Rooms', icon: Users, badge: isInRoom ? 'Live' : undefined },
    { id: 'library', label: 'Library', icon: Library }
  ];

  return (
    <nav aria-label="Mobile navigation" className="md:hidden fixed bottom-16 left-0 right-0 z-30 bg-[#090614]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around select-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-cyan-400 font-semibold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge && (
                <span className="absolute -top-1 -right-2 px-1 py-0.2 text-[8px] bg-cyan-500 text-black font-bold rounded-full animate-pulse">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
