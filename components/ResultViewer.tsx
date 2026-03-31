import React, { useRef, useEffect, useState } from 'react';
import { MarkdownViewer } from './MarkdownViewer';

interface ResultViewerProps {
  content: string;
  isGenerating: boolean;
  documentTitle: string;
  modelLabel?: string;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({
  content, isGenerating, documentTitle, modelLabel,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isGenerating && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [content, isGenerating]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Empty state ────────────────────────────────── */
  if (!content && !isGenerating) {
    return (
      <div className="h-full flex flex-col items-center justify-center rounded-xl border-2 border-white/12 animate-fadeIn" style={{ background: 'var(--bg-surface)' }}>
        <div className="text-center px-8 max-w-sm">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 border-2 border-white/10" style={{ background: 'var(--bg-app)' }}>
            <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <h3 className="font-black text-white text-sm mb-2">Documento será gerado aqui</h3>
          <p className="text-[12px] font-bold text-slate-400 leading-relaxed">
            Preencha o formulário e clique em <span className="text-primary-400 font-black">Gerar Documento</span>.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            {['Lei 14.133/2021 — base legal verificada', 'Dados reais do PNCP integrados', 'Pronto para assinatura oficial'].map(t => (
              <div key={t} className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                <svg className="w-3.5 h-3.5 text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Document viewer ────────────────────────────── */
  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden border-2 border-white/12" style={{ background: 'var(--bg-surface)' }}>

      {/* Toolbar */}
      <div className="h-12 flex items-center justify-between px-4 border-b-2 border-white/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${isGenerating ? 'bg-primary-500 animate-pulse' : 'bg-emerald-400'}`}/>
          <span className="text-[12px] font-black text-white uppercase tracking-wider">
            {documentTitle.split(' (')[0]}
          </span>
          {isGenerating && (
            <span className="text-[10px] font-black text-primary-400 uppercase tracking-wide animate-pulse">
              · {modelLabel ?? 'IA'} gerando...
            </span>
          )}
        </div>
        {content && (
          <button onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wide transition-all border-2
              ${copied
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                : 'text-slate-400 hover:text-white hover:bg-white/8 border-white/15 hover:border-white/30'}`}>
            {copied
              ? <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>Copiado!</>
              : <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>Copiar</>
            }
          </button>
        )}
      </div>

      {/* Paper area */}
      <div className="flex-1 overflow-y-auto py-6 px-4" style={{ background: 'var(--bg-app)' }}>
        <div className="max-w-[780px] mx-auto rounded-sm overflow-hidden shadow-2xl">

          {/* Header strip */}
          <div className="border-b-4 border-primary-500 px-10 py-4 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-600">LicitGov AI — Documento Oficial</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">Lei nº 14.133/2021</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400">{new Date().toLocaleDateString('pt-BR')}</p>
                {modelLabel && <p className="text-[9px] font-semibold text-slate-300 mt-0.5">{modelLabel}</p>}
              </div>
            </div>
          </div>

          {/* White paper */}
          <div className="bg-white px-10 py-10 doc-prose">
            <MarkdownViewer content={content} />
          </div>

          {isGenerating && (
            <div className="bg-white px-10 pb-12 flex flex-col items-center border-t border-slate-100">
              <div className="pt-8 flex items-center gap-3">
                <div className="relative w-6 h-6">
                  <div className="absolute inset-0 rounded-full border-2 border-primary-100"/>
                  <div className="absolute inset-0 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"/>
                </div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
                  Processando raciocínio jurídico...
                </p>
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>
        <div className="h-16"/>
      </div>
    </div>
  );
};
