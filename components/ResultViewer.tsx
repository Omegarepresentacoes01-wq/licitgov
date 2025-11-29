import React, { useRef, useEffect } from 'react';
import { MarkdownViewer } from './MarkdownViewer';

interface ResultViewerProps {
  content: string;
  isGenerating: boolean;
  documentTitle: string;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({ content, isGenerating, documentTitle }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom while generating
  useEffect(() => {
    if (isGenerating && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [content, isGenerating]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    alert('Texto copiado para a área de transferência!');
  };

  const handleDownloadWord = () => {
    let htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${documentTitle}</title>
      </head>
      <body>
        ${content.split('\n').map(line => `<p>${line}</p>`).join('')}
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${documentTitle.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!content && !isGenerating) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-white/50 dark:bg-[#15171e]/50 backdrop-blur-sm border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-10 transition-colors duration-300 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/20 to-transparent dark:from-primary-900/5 pointer-events-none"></div>
        <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-slate-200/50 dark:shadow-none z-10 animate-fadeIn ring-1 ring-slate-100 dark:ring-slate-700">
          <svg className="w-10 h-10 text-primary-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-xl font-display font-bold text-slate-700 dark:text-slate-300 text-center z-10">Aguardando Início</p>
        <p className="text-sm mt-2 text-center max-w-sm z-10 leading-relaxed text-slate-500">Selecione o tipo de documento à esquerda e preencha o formulário para a Inteligência Artificial trabalhar.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-[#0f1016] rounded-3xl overflow-hidden relative transition-colors duration-300 border border-slate-200 dark:border-slate-800">
      
      {/* Floating Header */}
      <div className="bg-white/90 dark:bg-[#15171e]/90 backdrop-blur-md p-4 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center shrink-0 z-20 absolute top-0 left-0 right-0">
        <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${isGenerating ? 'bg-amber-500 animate-pulse' : 'bg-secondary-500'}`} />
            <div>
                <h3 className="font-display font-bold text-slate-800 dark:text-white text-sm">
                {documentTitle}
                </h3>
                {isGenerating && <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Escrevendo...</p>}
            </div>
        </div>
        <div className="flex gap-2">
            {!isGenerating && (
                <span className="hidden sm:flex text-[10px] font-bold text-secondary-600 dark:text-secondary-400 items-center gap-1 bg-secondary-50 dark:bg-secondary-900/20 px-3 py-1.5 rounded-full border border-secondary-100 dark:border-secondary-900/50 animate-fadeIn">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    SALVO NA NUVEM
                </span>
            )}
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
            <button 
                onClick={handleCopy}
                disabled={!content}
                className="p-2 text-slate-500 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Copiar Texto"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            </button>
            <button 
                onClick={handleDownloadWord}
                disabled={!content}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h5v5h5v11H6z"/>
                </svg>
                Exportar Word
            </button>
        </div>
      </div>
      
      {/* Paper View Container */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 pt-20 bg-slate-100 dark:bg-[#0f1016] scroll-smooth">
        <div className="max-w-[800px] mx-auto shadow-2xl shadow-slate-300/50 dark:shadow-black/50 min-h-[800px] border border-slate-200/50 dark:border-none rounded-sm p-12 lg:p-16 bg-white text-slate-900 transition-all duration-300 animate-slideUp">
            {/* Document Header Simulation */}
            {!isGenerating && content.length > 0 && (
                <div className="border-b-2 border-slate-900 pb-4 mb-8 flex justify-between items-end opacity-80">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] font-bold text-slate-500">Documento Oficial</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-400">Gerado via LicitGov AI</p>
                    </div>
                </div>
            )}

            {/* Force Light Mode Typography for the "Paper" feel */}
            <div className="prose prose-slate max-w-none font-serif leading-relaxed text-slate-900">
                <MarkdownViewer content={content} />
            </div>
            
            {isGenerating && (
                <div className="mt-6 flex items-center gap-3 text-primary-600 animate-pulse">
                     <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                     <div className="w-1.5 h-1.5 bg-primary-600 rounded-full animation-delay-200"></div>
                     <div className="w-1.5 h-1.5 bg-primary-600 rounded-full animation-delay-400"></div>
                </div>
            )}
            <div ref={bottomRef} />
        </div>
        <div className="h-20"></div> {/* Spacer for bottom */}
      </div>
    </div>
  );
};