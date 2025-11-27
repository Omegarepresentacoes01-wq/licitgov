import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { InputForm } from './components/InputForm';
import { ResultViewer } from './components/ResultViewer';
import { DocumentType, FormData, GenerationState } from './types';
import { generateDocumentStream } from './services/geminiService';

const App: React.FC = () => {
  const [selectedDoc, setSelectedDoc] = useState<DocumentType>(DocumentType.ETP);
  const [outputContent, setOutputContent] = useState<string>('');
  
  // Theme state initialization
  const [darkMode, setDarkMode] = useState(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }
    return false;
  });

  // Apply theme class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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
    setGenState({ isGenerating: false, error: null });
  };

  const handleGenerate = useCallback(async () => {
    if (!formData.objectDescription) return;

    setGenState({ isGenerating: true, error: null });
    setOutputContent(''); 

    try {
      await generateDocumentStream(selectedDoc, formData, (chunk) => {
        setOutputContent(prev => prev + chunk);
      });
    } catch (error) {
      console.error(error);
      setGenState(prev => ({ ...prev, error: "Erro ao gerar o documento. Verifique sua chave de API ou tente novamente." }));
    } finally {
      setGenState(prev => ({ ...prev, isGenerating: false }));
    }
  }, [selectedDoc, formData]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar 
        selectedDoc={selectedDoc} 
        onSelect={handleDocumentSelect} 
        isGenerating={genState.isGenerating}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-primary-100/20 to-transparent dark:from-primary-900/10 pointer-events-none z-0"></div>

        <header className="px-6 py-4 shrink-0 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
              {selectedDoc}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Preencha os dados para gerar o documento jurídico completo</p>
          </div>
          
          {genState.error && (
            <span className="animate-pulse text-red-600 dark:text-red-400 text-sm font-medium bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-full border border-red-200 dark:border-red-800 shadow-sm">
              {genState.error}
            </span>
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