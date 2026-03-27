
import React, { Component, useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { InputForm } from './components/InputForm';
import { ResultViewer } from './components/ResultViewer';
import { LoginPage } from './components/LoginPage';
import { DocumentType, FormData, GenerationState, User } from './types';
import { AI_MODELS } from './constants';
import { generateDocumentStream } from './services/geminiService';
import { getCurrentUser, logout, saveDocument } from './services/mockBackend';
import { HistoryPanel } from './components/HistoryPanel';
import { CloneDocument } from './components/CloneDocument';

interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render(): React.ReactNode {
    if ((this.state as ErrorBoundaryState).hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-navy-900 p-4 text-white">
          <div className="bg-navy-surface p-8 rounded-2xl border border-red-900/30 max-w-lg w-full text-center">
            <h1 className="text-2xl font-bold mb-4">Erro Crítico</h1>
            <p className="text-slate-400 mb-6">{(this.state as ErrorBoundaryState).error?.message}</p>
            <button onClick={() => window.location.reload()} className="bg-primary-600 px-6 py-3 rounded-xl font-bold">Recarregar App</button>
          </div>
        </div>
      );
    }
    return (this.props as ErrorBoundaryProps).children ?? null;
  }
}

// Renamed AppContent to App to resolve "Cannot find name 'App'" during export and match expectation in index.tsx
const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'login' | 'app' | 'history'>('login');
  const [selectedDoc, setSelectedDoc] = useState<DocumentType>(DocumentType.ETP);
  const [outputContent, setOutputContent] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
  const [isCloneMode, setIsCloneMode] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    organName: '',
    city: '',
    modality: 'Pregão Eletrônico',
    judgmentCriteria: 'Menor Preço',
    objectDescription: '',
    estimatedValue: '',
    justification: '',
    additionalInfo: '',
    objectType: '',
    consumptionHistory: '',
    requiresPoC: '',
    pocDescription: '',
    customRequirements: '',
  });

  const [genState, setGenState] = useState<GenerationState>({
    isGenerating: false,
    error: null
  });

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
      await generateDocumentStream(selectedDoc, formData, selectedModel, (chunk) => {
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
  }, [selectedDoc, formData, selectedModel, currentUser]);

  if (view === 'login') return <LoginPage onLoginSuccess={(u) => { setCurrentUser(u); setView('app'); }} />;
  if (view === 'history' && currentUser) return <HistoryPanel currentUser={currentUser} onBack={() => setView('app')} onLoadDocument={(doc) => { setSelectedDoc(doc.type); setOutputContent(doc.content); setView('app'); }} />;

  return (
    <ErrorBoundary>
      <div className="flex h-screen w-full overflow-hidden" style={{ background: '#0f172a' }}>
        <Sidebar
          selectedDoc={selectedDoc}
          onSelect={(doc) => { setSelectedDoc(doc); setOutputContent(''); setGenState({isGenerating: false, error: null}); }}
          isGenerating={genState.isGenerating}
          currentUser={currentUser}
          onLogout={() => { logout(); setCurrentUser(null); setView('login'); }}
          onHistoryClick={() => setView('history')}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 flex flex-col h-full overflow-hidden">

          {/* Top bar */}
          <header className="h-14 px-6 flex items-center justify-between shrink-0 border-b-2 border-white/10" style={{ background: '#1e293b' }}>
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-1.5 rounded-md hover:bg-white/10 text-slate-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 6h16M4 12h16M4 18h16" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400 font-bold">LicitGov</span>
                <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                <span className="font-black text-white">{selectedDoc.split(' (')[0]}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/5 border-2 border-white/10 rounded-xl p-1">
              <button
                onClick={() => setIsCloneMode(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${!isCloneMode ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                Gerar Documento
              </button>
              <button
                onClick={() => setIsCloneMode(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${isCloneMode ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                Clonar Documento
              </button>
            </div>

            <div className="flex items-center gap-3">
              {genState.isGenerating && (
                <div className="flex items-center gap-2 text-xs font-bold text-primary-400 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-ping"/>
                  Gerando documento...
                </div>
              )}
              {genState.error && (
                <div className="flex items-center gap-2 bg-red-900/30 border-2 border-red-500/40 rounded-lg px-3 py-1.5 animate-fadeIn">
                  <span className="text-xs font-bold text-red-300 truncate max-w-xs">{genState.error}</span>
                  <button onClick={handleGenerate} className="text-[10px] bg-red-500 hover:bg-red-600 text-white px-2 py-0.5 rounded font-bold shrink-0">Tentar novamente</button>
                </div>
              )}
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 flex flex-col lg:flex-row p-3 gap-3 overflow-hidden">
            {isCloneMode ? (
              <>
                <div className="w-full lg:w-[440px] h-1/2 lg:h-full flex flex-col shrink-0">
                  <CloneDocument
                    onResult={(content) => setOutputContent(content)}
                    onGenerating={(generating) => setGenState(prev => ({ ...prev, isGenerating: generating }))}
                    isGenerating={genState.isGenerating}
                  />
                </div>
                <div className="flex-1 h-1/2 lg:h-full min-w-0">
                  <ResultViewer
                    content={outputContent}
                    isGenerating={genState.isGenerating}
                    documentTitle="Documento Clonado"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="w-full lg:w-[440px] h-1/2 lg:h-full flex flex-col shrink-0">
                  <InputForm
                    formData={formData}
                    onChange={setFormData}
                    onSubmit={handleGenerate}
                    isGenerating={genState.isGenerating}
                    selectedDoc={selectedDoc}
                  />
                </div>
                <div className="flex-1 h-1/2 lg:h-full min-w-0">
                  <ResultViewer
                    content={outputContent}
                    isGenerating={genState.isGenerating}
                    documentTitle={selectedDoc}
                    modelLabel={AI_MODELS.find(m => m.id === selectedModel)?.label}
                  />
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;
