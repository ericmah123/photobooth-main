import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { BoothScreen } from './screens/BoothScreen';
import { GalleryScreen } from './screens/GalleryScreen';
import { StripDetailScreen } from './screens/StripDetailScreen';
import { SettingsProvider } from './context/SettingsContext';

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <Router>
        {/* Use 100dvh to handle mobile browser bars correctly */}
        <div className="h-[100dvh] w-full bg-stone-100 flex items-center justify-center overflow-hidden bg-noise">
          <div className="w-full h-full relative flex flex-col">
            <Routes>
              <Route path="/" element={<BoothScreen />} />
              <Route path="/gallery" element={<GalleryScreen />} />
              <Route path="/strip/detail" element={<StripDetailScreen />} />
              <Route path="/strip/:id" element={<StripDetailScreen />} />
            </Routes>
          </div>
        </div>
      </Router>
    </SettingsProvider>
  );
};

export default App;