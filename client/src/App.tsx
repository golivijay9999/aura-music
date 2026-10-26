import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { LibraryProvider } from './context/LibraryContext';
import { AudioPlayerProvider } from './context/AudioPlayerContext';
import { RoomProvider } from './context/RoomContext';
import { MainLayout } from './components/layout/MainLayout';

export function App() {
  return (
    <AuthProvider>
      <LibraryProvider>
        <AudioPlayerProvider>
          <RoomProvider>
            <MainLayout />
          </RoomProvider>
        </AudioPlayerProvider>
      </LibraryProvider>
    </AuthProvider>
  );
}

export default App;
