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
    <div className="flex h-screen w-full overflow-hidden" style={{ background: '#0f172a' }}>

      {/* Sidebar lista */}
      <aside className="w-[320px] flex flex-col h-full shrink-0 border-r-2 border-white/10" style={{ background: '#1e293b' }}>
        <div className="h-14 px-4 border-b-2 border-white/10 flex items-center gap-3 shrink-0">
          <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <h2 className="font-black text-white text-[14px]">Meus Documentos</h2>
            <p className="text-[11px] font-bold text-slate-400">{docs.length} documento{docs.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-white/8">
          {docs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
              <div className="w-12 h-12 rounded-xl border-2 border-white/10 flex items-center justify-center mb-3" style={{ background: '#0f172a' }}>
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </div>
              <p className="text-[13px] font-bold text-slate-400">Nenhum documento ainda</p>
              <p className="text-[12px] font-semibold text-slate-500 mt-1">Os documentos gerados serão salvos aqui.</p>
            </div>
          ) : (
            docs.map(doc => (
              <button
                key={doc.id}
                onClick={() => setSelected(doc)}
                className={`w-full text-left px-4 py-3.5 transition-colors border-l-2
                  ${selected?.id === doc.id
                    ? 'bg-primary-500/10 border-primary-500'
                    : 'border-transparent hover:bg-white/5'}`}
              >
                <p className={`text-[13px] font-bold truncate ${selected?.id === doc.id ? 'text-primary-400' : 'text-white'}`}>
                  {doc.title}
                </p>
                <p className="text-[11px] font-semibold text-slate-500 mt-0.5 truncate">{doc.preview}...</p>
                <p className="text-[10px] font-bold text-slate-600 mt-1.5">{new Date(doc.createdAt).toLocaleString('pt-BR')}</p>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Preview area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {selected ? (
          <>
            <div className="h-14 px-6 border-b-2 border-white/10 flex justify-between items-center shrink-0" style={{ background: '#1e293b' }}>
              <div>
                <h3 className="font-black text-white text-[14px]">{selected.title}</h3>
                <p className="text-[11px] font-bold text-slate-400 mt-0.5">{new Date(selected.createdAt).toLocaleString('pt-BR')}</p>
              </div>
              <button
                onClick={() => onLoadDocument(selected)}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-[12px] font-black rounded-xl transition-all border-2 border-primary-400 flex items-center gap-2 shadow-lg shadow-primary-500/20"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                Abrir no Editor
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-8 px-6" style={{ background: '#0f172a' }}>
              <div className="max-w-[780px] mx-auto rounded-sm overflow-hidden shadow-2xl">
                <div className="border-b-4 border-primary-500 px-10 py-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-600">LicitGov AI — Documento Oficial</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">Lei nº 14.133/2021</p>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400">{new Date(selected.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="bg-white px-10 py-10 doc-prose">
                  <MarkdownViewer content={selected.content} />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl border-2 border-white/10 flex items-center justify-center mx-auto mb-4" style={{ background: '#1e293b' }}>
                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"/></svg>
              </div>
              <p className="text-[13px] font-bold text-slate-400">Selecione um documento para visualizar</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
