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
    // Ideal: use a toast notification
    alert('Texto copiado para a área de transferência!');
  };

  const handleDownloadWord = () => {
    // Basic Markdown to HTML converter for Word export
    let htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${documentTitle}</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; color: #000; }
          h1 { font-size: 16pt; font-weight: bold; text-align: center; margin-bottom: 24px; text-transform: uppercase; }
          h2 { font-size: 14pt; font-weight: bold; margin-top: 18px; margin-bottom: 12px; }
          h3 { font-size: 13pt; font-weight: bold; margin-top: 14px; margin-bottom: 10px; }
          p { margin-bottom: 12px; text-align: justify; }
          ul { margin-bottom: 12px; }
          li { margin-bottom: 6px; }
          strong, b { font-weight: bold; }
        </style>
      </head>
      <body>
    `;

    const lines = content.split('\n');
    let listOpen = false;

    lines.forEach(line => {
      let text = line.trim();
      
      // Parse Bold (**text**)
      text = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

      if (text.startsWith('# ')) {
        if (listOpen) { htmlContent += '</ul>'; listOpen = false; }
        htmlContent += `<h1>${text.replace('# ', '')}</h1>`;
      }
      else if (text.startsWith('## ')) {
        if (listOpen) { htmlContent += '</ul>'; listOpen = false; }
        htmlContent += `<h2>${text.replace('## ', '')}</h2>`;
      }
      else if (text.startsWith('### ')) {
        if (listOpen) { htmlContent += '</ul>'; listOpen = false; }
        htmlContent += `<h3>${text.replace('### ', '')}</h3>`;
      }
      else if (text.startsWith('- ') || text.startsWith('* ')) {
        if (!listOpen) { htmlContent += '<ul>'; listOpen = true; }
        htmlContent += `<li>${text.replace(/^[-*]\s+/, '')}</li>`;
      }
      else if (text === '') {
        // Skip empty lines or treat as spacing
      }
      else {
        if (listOpen) { htmlContent += '</ul>'; listOpen = false; }
        htmlContent += `<p>${text}</p>`;
      }
    });

    if (listOpen) { htmlContent += '</ul>'; }
    htmlContent += '</body></html>';

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
      <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:p-10 transition-colors duration-300">
        <div className="w-16 h-16 lg:w-20 lg:h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 lg:w-10 lg:h-10 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <p className="text-lg lg:text-xl font-semibold text-slate-600 dark:text-slate-400 text-center">Pronto para criar?</p>
        <p className="text-xs lg:text-sm mt-2 text-center max-w-sm">Selecione o tipo de documento, preencha as informações e a IA gerará um esboço completo para você.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden relative transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 p-3 lg:p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
        <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 text-sm lg:text-base">
          {isGenerating ? (
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          ) : (
             <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          )}
          Resultado
        </h3>
        <div className="flex gap-2">
            {!isGenerating && content.length > 50 && (
                <span className="hidden sm:flex text-[10px] lg:text-xs text-green-600 items-center gap-1 bg-green-50 px-2 py-1 rounded-md animate-fadeIn">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Salvo
                </span>
            )}
            <button 
                onClick={handleCopy}
                disabled={!content}
                className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">Copiar</span>
            </button>
            <button 
                onClick={handleDownloadWord}
                disabled={!content}
                className="text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h5v5h5v11H6z"/>
                  <path d="M14.1 11.2l-1.3 4.8h-.1l-1.3-4.8h-1.4l-1.3 4.8h-.1l-1.3-4.8H6l2 6.4h1.4l1.3-4.6h.1l1.3 4.6h1.4l2-6.4h-1.4z" />
                </svg>
                <span className="hidden sm:inline">Word</span>
            </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50 dark:bg-slate-950/50">
        <div className="max-w-4xl mx-auto shadow-sm min-h-[300px] lg:min-h-[600px] border border-slate-200 dark:border-slate-800 rounded-xl p-4 lg:p-10 bg-white dark:bg-slate-900 transition-colors duration-300">
            <MarkdownViewer content={content} />
            {isGenerating && (
                <div className="flex items-center gap-2 mt-6 text-primary-600 dark:text-primary-400 animate-pulse">
                    <span className="h-2 w-2 bg-primary-500 rounded-full"></span>
                    <span className="text-sm font-medium">A IA está redigindo o documento...</span>
                </div>
            )}
            <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
};