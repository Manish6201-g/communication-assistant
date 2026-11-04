import React, { useState } from 'react';
import Landing3D from './components/Landing3D';
import Translator from './pages/Translator';

export default function App() {
  const [view, setView] = useState('landing'); // 'landing' (default 3D) or 'translator'

  if (view === 'translator') {
    return <Translator onBackToLanding={() => setView('landing')} />;
  }

  return <Landing3D onOpenTranslator={() => setView('translator')} />;
}
