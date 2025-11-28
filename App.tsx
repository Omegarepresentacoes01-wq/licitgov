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
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Error Boundary para evitar tela branca completa em produção
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 font-sans text-slate-800 dark:text-white">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl max-w-lg w-full border border-red-100 dark:border-red-900/30">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h1 className="text-2xl font-bold text-center mb-2">Ops! Algo deu errado.</h1>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-6">
                Ocorreu um erro inesperado na aplicação. Isso geralmente ocorre por configuração de ambiente incompleta.
            </p>
            <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-lg text-xs font-mono overflow-auto mb-6 border border-slate-200 dark:border-slate-800 max-h-40">
              {this.state.error?.toString()}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  // Authentication & Routing State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'login' | 'app' | 'admin'>('login');
  
  // App State
  const [selectedDoc, setSelectedDoc] = useState<DocumentType>(DocumentType.ETP);
  const [outputContent, setOutputContent] = useState<string>('');
  const [fullGeneratedText, setFullGeneratedText] = useState<string>(''); // To save later
  
  // Mobile Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    // Check window existence for SSR safety
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Check auth on mount
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setView('app');
    }
  }, []);

  const [formData, setFormData] = useState<FormData>({
    organName: '',
    city: '',
    modality: 'Pregão Eletrônico',
    judgmentCriteria: 'Menor Preço',
    objectDescription: '',
    estimatedValue: '',
    justification: '',
    additionalInfo: ''
  });

  const [genState, setGenState] = useState<GenerationState>({
    isGenerating: false,
    error: null
  });

  const handleDocumentSelect = (doc: DocumentType) => {
    setSelectedDoc(doc);
    setOutputContent(''); 
    setFullGeneratedText('');
    setGenState({ isGenerating: false, error: null });
    setIsSidebarOpen(false); // Close sidebar on mobile selection
  };

  const handleGenerate = useCallback(async () => {
    if (!formData.objectDescription) {
        alert("Por favor, preencha a descrição do objeto antes de gerar.");
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
      
      setFullGeneratedText(accumulatedText);

      // Auto-save the document to the user's SaaS account
      if (currentUser && accumulatedText.length > 50) {
        saveDocument({
            userId: currentUser.id,
            type: selectedDoc,
            title: `${selectedDoc.split(' (')[0]} - ${formData.objectDescription.substring(0, 30)}...`,
            content: accumulatedText,
            preview: accumulatedText.substring(0, 150)
        });
      }

    } catch (error: any) {
      console.error(error);
      let errorMessage = "Erro ao gerar o documento.";
      if (error.message && (error.message.includes('API_KEY') || error.message.includes('API Key'))) {
        errorMessage = "Chave de API não configurada. Verifique se a variável VITE_API_KEY está definida.";
      } else if (error.message) {
        errorMessage = `Erro: ${error.message}`;
      }
      setGenState(prev => ({ ...prev, error: errorMessage }));
    } finally {
      setGenState(prev => ({ ...prev, isGenerating: false }));
    }
  }, [selectedDoc, formData, currentUser]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    // If admin, redirect to admin dash first? No, let's go to app and offer dash link.
    setView('app');
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setView('login');
    // Reset forms
    setOutputContent('');
    setFormData({ ...formData, objectDescription: '', estimatedValue: '', justification: '' });
  };

  // --- RENDER VIEWS ---

  if (view === 'login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (view === 'admin' && currentUser?.role === 'admin') {
    return <AdminDashboard currentUser={currentUser} onExit={() => setView('app')} />;
  }

  // MAIN APP VIEW
  return (
    <div className="flex flex-col lg:flex-row h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Mobile Sidebar Overlay */}
      <Sidebar 
        selectedDoc={selectedDoc} 
        onSelect={handleDocumentSelect} 
        isGenerating={genState.isGenerating}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onAdminClick={() => setView('admin')}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-primary-100/20 to-transparent dark:from-primary-900/10 pointer-events-none z-0"></div>

        {/* Mobile Header */}
        <header className="px-4 py-3 lg:px-6 lg:py-4 shrink-0 flex justify-between items-center z-10 border-b lg:border-none border-slate-200 dark:border-slate-800 bg-white lg:bg-transparent dark:bg-slate-900 lg:dark:bg-transparent">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-white tracking-tight truncate max-w-[200px] sm:max-w-md">
                {selectedDoc}
              </h2>
              <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 hidden sm:block">Ambiente seguro | Seus dados estão isolados</p>
            </div>
          </div>
          
          {genState.error && (
            <div className="absolute top-16 right-4 left-4 lg:static lg:w-auto animate-fadeIn bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2 flex items-center gap-2 shadow-md lg:shadow-none z-20">
                <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-300 break-words">
                  {genState.error}
                </span>
            </div>
          )}
        </header>

        <div className="flex-1 flex flex-col lg:flex-row px-4 lg:px-6 pb-6 gap-4 lg:gap-6 overflow-hidden z-10">
          {/* Left Panel: Inputs */}
          <div className="w-full lg:w-1/3 lg:min-w-[400px] h-1/2 lg:h-full transition-all flex flex-col order-1">
            <InputForm 
              formData={formData} 
              onChange={setFormData} 
              onSubmit={handleGenerate}
              isGenerating={genState.isGenerating}
            />
          </div>

          {/* Right Panel: Output */}
          <div className="w-full lg:flex-1 h-1/2 lg:h-full flex flex-col order-2">
            <ResultViewer 
              content={outputContent} 
              isGenerating={genState.isGenerating}
              documentTitle={selectedDoc}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};

export default App;