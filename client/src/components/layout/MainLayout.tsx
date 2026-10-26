import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { MobileNav } from './MobileNav';
import { PlayerBar } from '../player/PlayerBar';
import { FullScreenPlayer } from '../player/FullScreenPlayer';
import { EqualizerModal } from '../player/EqualizerModal';
import { QueueDrawer } from '../player/QueueDrawer';
import { AuthModal } from '../auth/AuthModal';

import { HomePage } from '../../pages/HomePage';
import { SearchPage } from '../../pages/SearchPage';
import { ExplorePage } from '../../pages/ExplorePage';
import { GenresPage } from '../../pages/GenresPage';
import { LanguagesPage } from '../../pages/LanguagesPage';
import { LibraryPage } from '../../pages/LibraryPage';
import { DownloadsPage } from '../../pages/DownloadsPage';
import { SettingsPage } from '../../pages/SettingsPage';
import { RingtoneStudio } from '../ringtone/RingtoneStudio';
import { ListeningRoomsView } from '../rooms/ListeningRoomsView';
import { Track } from '../../types/music';

export const MainLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [ringtoneTrack, setRingtoneTrack] = useState<Track | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  const handleOpenRingtone = (track: Track) => {
    setRingtoneTrack(track);
    setCurrentTab('ringtone');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#07050e] text-gray-100">
      {/* Desktop & Tablet Sidebar */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Sticky Top Navbar */}
        <TopNavbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          onOpenAuth={() => setIsAuthOpen(true)}
        />

        {/* Scrollable Viewport (with padding for bottom PlayerBar and MobileNav) */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-36 md:pb-28">
          {currentTab === 'home' && (
            <HomePage
              selectedLanguage={selectedLanguage}
              onNavigateTab={setCurrentTab}
              onOpenRingtone={handleOpenRingtone}
            />
          )}

          {currentTab === 'search' && (
            <SearchPage
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onOpenRingtone={handleOpenRingtone}
            />
          )}

          {currentTab === 'explore' && (
            <ExplorePage onOpenRingtone={handleOpenRingtone} />
          )}

          {currentTab === 'genres' && (
            <GenresPage onOpenRingtone={handleOpenRingtone} />
          )}

          {currentTab === 'languages' && (
            <LanguagesPage onOpenRingtone={handleOpenRingtone} />
          )}

          {currentTab === 'rooms' && (
            <ListeningRoomsView />
          )}

          {currentTab === 'ringtone' && (
            <RingtoneStudio initialTrack={ringtoneTrack} />
          )}

          {currentTab === 'library' && (
            <LibraryPage onOpenRingtone={handleOpenRingtone} />
          )}

          {currentTab === 'downloads' && (
            <DownloadsPage onOpenRingtone={handleOpenRingtone} />
          )}

          {currentTab === 'settings' && (
            <SettingsPage />
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav currentTab={currentTab} setCurrentTab={setCurrentTab} />

        {/* Persistent Bottom Player Bar */}
        <PlayerBar />
      </div>

      {/* Modals & Overlays */}
      <FullScreenPlayer />
      <EqualizerModal />
      <QueueDrawer />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};
