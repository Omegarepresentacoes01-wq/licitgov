import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { InputForm } from './components/InputForm';
import { ResultViewer } from './components/ResultViewer';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { DocumentType, FormData, GenerationState, User } from './types';
import { generateDocumentStream } from './services/geminiService';
import { getCurrentUser, logout, saveDocument } from './services/mockBackend';

const App: React.FC = () => {
  // Authentication & Routing State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'login' | 'app' | 'admin'>('login');
  
  // App State
  const [selectedDoc, setSelectedDoc] = useState<DocumentType>(DocumentType.ETP);
  const [outputContent, setOutputContent] = useState<string>('');
  const [fullGeneratedText, setFullGeneratedText] = useState<string>(''); // To save later
  
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
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
      if (error.message && error.message.includes('API_KEY')) {
        errorMessage = "Chave de API inválida ou não configurada.";
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
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar 
        selectedDoc={selectedDoc} 
        onSelect={handleDocumentSelect} 
        isGenerating={genState.isGenerating}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onAdminClick={() => setView('admin')}
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-primary-100/20 to-transparent dark:from-primary-900/10 pointer-events-none z-0"></div>

        <header className="px-6 py-4 shrink-0 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
              {selectedDoc}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Ambiente seguro | Seus dados estão isolados</p>
          </div>
          
          {genState.error && (
            <div className="animate-fadeIn bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-red-700 dark:text-red-300">
                  {genState.error}
                </span>
            </div>
          )}
        </header>

        <div className="flex-1 flex px-6 pb-6 gap-6 overflow-hidden z-10">
          {/* Left Panel: Inputs */}
          <div className="w-1/3 min-w-[400px] h-full transition-all flex flex-col">
            <InputForm 
              formData={formData} 
              onChange={setFormData} 
              onSubmit={handleGenerate}
              isGenerating={genState.isGenerating}
            />
          </div>

          {/* Right Panel: Output */}
          <div className="flex-1 h-full flex flex-col">
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

export default App;