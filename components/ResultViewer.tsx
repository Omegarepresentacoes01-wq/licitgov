
import React, { useRef, useEffect } from 'react';
import { MarkdownViewer } from './MarkdownViewer';

interface ResultViewerProps {
  content: string;
  isGenerating: boolean;
  documentTitle: string;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({ content, isGenerating, documentTitle }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isGenerating && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [content, isGenerating]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    alert('Texto copiado.');
  };

  if (!content && !isGenerating) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 bg-white dark:bg-navy-surface border border-slate-200 dark:border-white/5 rounded-xl p-10">
        <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        <p className="font-bold text-slate-500">Pronto para gerar</p>
        <p className="text-xs mt-1">Preencha os dados e clique em "Gerar Documento".</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-navy-900 rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-soft">
      <div className="bg-white dark:bg-navy-surface p-3 border-b border-slate-200 dark:border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-3 px-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isGenerating ? 'bg-primary-500 animate-pulse' : 'bg-emerald-500'}`} />
            <h3 className="font-bold text-slate-700 dark:text-white text-xs truncate max-w-xs uppercase tracking-wider">
                {documentTitle}
            </h3>
        </div>
        <div className="flex gap-2">
            <button onClick={handleCopy} disabled={!content} className="px-3 py-1.5 text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 rounded border border-slate-200 dark:border-white/10">Copiar</button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-100 dark:bg-navy-950 scroll-smooth">
        <div className="max-w-[800px] mx-auto shadow-2xl bg-white text-slate-900 min-h-full p-10 lg:p-16 rounded-sm relative">
            <div className="prose prose-slate max-w-none font-serif">
                <MarkdownViewer content={content} />
            </div>
            
            {isGenerating && (
                <div className="mt-12 flex flex-col items-center gap-4 py-10 border-t border-slate-100">
                    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-primary-600 font-black uppercase tracking-[0.2em] text-[10px] animate-pulse">
                         IA processando fundamentação jurídica...
                    </div>
                </div>
            )}
            <div ref={bottomRef} />
        </div>
        <div className="h-20"></div>
      </div>
    </div>
  );
};
