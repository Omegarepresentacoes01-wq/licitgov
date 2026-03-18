import React, { useState, useEffect } from 'react';
import { User, SavedDocument } from '../types';
import { getDocumentsByUser } from '../services/mockBackend';
import { MarkdownViewer } from './MarkdownViewer';

interface HistoryPanelProps {
  currentUser: User;
  onBack: () => void;
  onLoadDocument: (doc: SavedDocument) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ currentUser, onBack, onLoadDocument }) => {
  const [docs, setDocs] = useState<SavedDocument[]>([]);
  const [selected, setSelected] = useState<SavedDocument | null>(null);

  useEffect(() => {
    setDocs(getDocumentsByUser(currentUser.id));
  }, [currentUser.id]);

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full overflow-hidden bg-slate-50 dark:bg-navy-900">
      {/* Lista lateral */}
      <aside className="w-full lg:w-[360px] bg-white dark:bg-navy-surface border-r border-slate-200 dark:border-white/5 flex flex-col h-full shrink-0">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-white/5 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white text-base">Meus Documentos</h2>
            <p className="text-xs text-slate-400 mt-0.5">{docs.length} documento{docs.length !== 1 ? 's' : ''} guardado{docs.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
          {docs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400 dark:text-slate-600 px-8 text-center">
              <svg className="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <p className="font-semibold text-sm">Nenhum documento ainda</p>
              <p className="text-xs mt-1 opacity-70">Os documentos gerados aparecerão aqui.</p>
            </div>
          ) : (
            docs.map(doc => (
              <button
                key={doc.id}
                onClick={() => setSelected(doc)}
                className={`w-full text-left px-6 py-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group ${selected?.id === doc.id ? 'bg-primary-50 dark:bg-primary-600/10 border-l-2 border-primary-500' : ''}`}
              >
                <p className={`font-semibold text-sm truncate ${selected?.id === doc.id ? 'text-primary-600 dark:text-primary-400' : 'text-slate-800 dark:text-slate-200'}`}>{doc.title}</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{doc.preview}...</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-1.5 font-mono">{new Date(doc.createdAt).toLocaleString('pt-BR')}</p>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Painel de preview */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {selected ? (
          <>
            <div className="px-8 py-5 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-navy-surface flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{selected.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{new Date(selected.createdAt).toLocaleString('pt-BR')}</p>
              </div>
              <button
                onClick={() => onLoadDocument(selected)}
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold rounded-lg transition-colors shadow-md flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Abrir no Editor
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 bg-slate-100 dark:bg-navy-950">
              <div className="max-w-[800px] mx-auto shadow-2xl bg-white text-slate-900 min-h-full p-10 lg:p-16 rounded-sm">
                <div className="prose prose-slate max-w-none font-serif">
                  <MarkdownViewer content={selected.content} />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-600">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" /></svg>
              <p className="font-semibold">Selecione um documento para visualizar</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
