import React, { useState, Component } from 'react';
import Landing3D from './components/Landing3D';
import Translator from './pages/Translator';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Translation Terminal caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080C15] text-white flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="max-w-md w-full p-6 bg-slate-900/90 border border-sky-500/30 rounded-2xl shadow-2xl space-y-4 backdrop-blur-xl">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-xl shadow-glow-sky">
              ⚡
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Full Translation Terminal</h2>
            <p className="text-xs text-slate-400 font-mono bg-black/50 p-3 rounded-xl border border-white/5 text-left overflow-x-auto">
              {this.state.error?.message || "Restoring session..."}
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  if (this.props.onReset) this.props.onReset();
                  else window.location.reload();
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 font-bold text-xs rounded-xl shadow-glow-sky transition transform active:scale-95"
              >
                Return to 3D Landing Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [view, setView] = useState('landing'); // 'landing' (default 3D) or 'translator'

  return (
    <ErrorBoundary onReset={() => setView('landing')}>
      {view === 'translator' ? (
        <Translator onBackToLanding={() => setView('landing')} />
      ) : (
        <Landing3D onOpenTranslator={() => setView('translator')} />
      )}
    </ErrorBoundary>
  );
}
