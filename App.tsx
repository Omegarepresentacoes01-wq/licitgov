
import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { InputForm } from './components/InputForm';
import { ResultViewer } from './components/ResultViewer';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { DocumentType, FormData, GenerationState, User } from './types';
import { generateDocumentStream } from './services/geminiService';
import { getCurrentUser, logout, saveDocument } from './services/mockBackend';

interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Fix Error 1: Using React.Component and providing a constructor to ensure props are correctly initialized and typed for 'this.props' access
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-navy-900 p-4 text-white">
          <div className="bg-navy-surface p-8 rounded-2xl border border-red-900/30 max-w-lg w-full text-center">
            <h1 className="text-2xl font-bold mb-4">Erro Crítico</h1>
            <p className="text-slate-400 mb-6">{this.state.error?.message}</p>
            <button onClick={() => window.location.reload()} className="bg-primary-600 px-6 py-3 rounded-xl font-bold">Recarregar App</button>
          </div>
        </div>
      );
    }
    // Accessing this.props.children is now correctly recognized by the compiler
    return this.props.children;
  }
}

// Fix Error 2: Renamed AppContent to App to resolve "Cannot find name 'App'" during export and match expectation in index.tsx
const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'login' | 'app' | 'admin'>('login');
  const [selectedDoc, setSelectedDoc] = useState<DocumentType>(DocumentType.ETP);
  const [outputContent, setOutputContent] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    organName: '',
    city: '',
    modality: 'Pregão Eletrônico',
    judgmentCriteria: 'Menor Preço',
    objectDescription: '',
    estimatedValue: '',
    justification: '',
    additionalInfo: '',
    impugnmentText: ''
  });

  const [genState, setGenState] = useState<GenerationState>({
    isGenerating: false,
    error: null
  });

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setView('app');
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!formData.objectDescription) {
        alert("Preencha a descrição do objeto.");
        return;
    }

    setGenState({ isGenerating: true, error: null });
    setOutputContent(''); 
    let accumulatedText = '';

    try {
      await generateDocumentStream(selectedDoc, formData, (chunk) => {
        accumulatedText += chunk;
        setOutputContent(prev => prev + chunk);
      });
      
      if (currentUser && accumulatedText.length > 50) {
        saveDocument({
            userId: currentUser.id,
            type: selectedDoc,
            title: `${selectedDoc.split(' (')[0]} - ${new Date().toLocaleTimeString()}`,
            content: accumulatedText,
            preview: accumulatedText.substring(0, 150)
        });
      }
    } catch (error: any) {
      console.error(error);
      let errorMessage = "Erro na geração.";
      
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        errorMessage = "LIMITE DE QUOTA ATINGIDO (429). O plano gratuito do Google Gemini permite poucas requisições por minuto. Aguarde 60 segundos e tente novamente.";
      } else {
        errorMessage = `Falha na API: ${error.message || 'Erro desconhecido'}`;
      }
      
      setGenState({ isGenerating: false, error: errorMessage });
    } finally {
      setGenState(prev => ({ ...prev, isGenerating: false }));
    }
  }, [selectedDoc, formData, currentUser]);

  if (view === 'login') return <LoginPage onLoginSuccess={(u) => { setCurrentUser(u); setView('app'); }} />;
  if (view === 'admin' && currentUser?.role === 'admin') return <AdminDashboard currentUser={currentUser} onExit={() => setView('app')} />;

  return (
    <ErrorBoundary>
      <div className="flex flex-col lg:flex-row h-screen w-full overflow-hidden bg-slate-50 dark:bg-navy-900 transition-colors">
        <Sidebar 
          selectedDoc={selectedDoc} 
          onSelect={(doc) => { setSelectedDoc(doc); setOutputContent(''); setGenState({isGenerating: false, error: null}); }} 
          isGenerating={genState.isGenerating}
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode(!darkMode)}
          currentUser={currentUser}
          onLogout={() => { logout(); setCurrentUser(null); setView('login'); }}
          onAdminClick={() => setView('admin')}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          <header className="px-6 py-4 flex justify-between items-center z-10 border-b border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 dark:text-slate-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 6h16M4 12h16M4 18h16" strokeWidth={2}/></svg>
              </button>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">{selectedDoc.split('(')[0]}</h2>
            </div>
            
            {genState.error && (
              <div className="flex-1 mx-4 animate-fadeIn bg-red-500/10 border border-red-500/50 rounded-lg px-4 py-2 flex items-center justify-between gap-4">
                  <span className="text-xs font-bold text-red-500">{genState.error}</span>
                  <button onClick={handleGenerate} className="text-[10px] bg-red-500 text-white px-3 py-1 rounded uppercase font-black">Tentar Novamente</button>
              </div>
            )}
          </header>

          <div className="flex-1 flex flex-col lg:flex-row px-6 pb-6 gap-6 overflow-hidden">
            <div className="w-full lg:w-[450px] h-1/2 lg:h-full flex flex-col">
              <InputForm 
                formData={formData} 
                onChange={setFormData} 
                onSubmit={handleGenerate}
                isGenerating={genState.isGenerating}
                selectedDoc={selectedDoc}
              />
            </div>
            <div className="flex-1 h-1/2 lg:h-full">
              <ResultViewer 
                content={outputContent} 
                isGenerating={genState.isGenerating}
                documentTitle={selectedDoc}
              />
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;
