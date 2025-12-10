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
    alert('Texto copiado com sucesso.');
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
      <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-white dark:bg-navy-surface border border-slate-200 dark:border-white/5 rounded-lg p-10 shadow-sm">
        <div className="w-20 h-20 bg-slate-50 dark:bg-navy-900 rounded-full flex items-center justify-center mb-4 border border-slate-100 dark:border-white/5">
          <svg className="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-base font-bold text-slate-600 dark:text-slate-300">Nenhum documento gerado</p>
        <p className="text-sm mt-1 text-slate-400 text-center max-w-xs">Preencha os dados no formulário e clique em "Gerar Documento".</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-navy-900 rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-soft">
      
      {/* Toolbar / Header Simples */}
      <div className="bg-white dark:bg-navy-surface p-3 border-b border-slate-200 dark:border-white/5 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3 px-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isGenerating ? 'bg-primary-500 animate-pulse shadow-glow' : 'bg-emerald-500'}`} />
            <h3 className="font-semibold text-slate-700 dark:text-white text-sm truncate max-w-[200px] sm:max-w-md">
                {documentTitle}
            </h3>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handleCopy}
                disabled={!content}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 rounded border border-slate-200 dark:border-white/10 transition-colors"
            >
                Copiar
            </button>
            <button 
                onClick={handleDownloadWord}
                disabled={!content}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded shadow-sm transition-colors"
            >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h5v5h5v11H6z"/></svg>
                Word
            </button>
        </div>
      </div>
      
      {/* Paper View */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-100 dark:bg-navy-950 scroll-smooth">
        <div className="max-w-[800px] mx-auto shadow-sm bg-white text-slate-900 min-h-[600px] p-8 lg:p-12 transition-all rounded-sm">
            {/* Cabeçalho do Papel */}
            {!isGenerating && content.length > 0 && (
                <div className="border-b border-slate-200 pb-4 mb-6 flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Minuta Oficial</span>
                    <span className="text-[10px] text-slate-400">Gerado por LicitGov</span>
                </div>
            )}

            <div className="prose prose-slate prose-sm sm:prose-base max-w-none font-serif leading-relaxed text-slate-900">
                <MarkdownViewer content={content} />
            </div>
            
            {isGenerating && (
                <div className="mt-4 text-primary-600 italic text-sm animate-pulse font-medium">
                     Redigindo cláusulas e fundamentando...
                </div>
            )}
            <div ref={bottomRef} />
        </div>
        <div className="h-10"></div>
      </div>
    </div>
  );
};