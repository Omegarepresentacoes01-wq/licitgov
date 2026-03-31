import React, { useState } from 'react';
import { DocumentType, User } from '../types';
import { AI_MODELS, AIModel } from '../constants';

interface SidebarProps {
  selectedDoc: DocumentType;
  onSelect: (doc: DocumentType) => void;
  isGenerating: boolean;
  currentUser: User | null;
  onLogout: () => void;
  onHistoryClick: () => void;
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
  isCloneMode?: boolean;
  onCloneModeChange?: (v: boolean) => void;
}

const DocIcons: Record<DocumentType, React.ReactNode> = {
  [DocumentType.DFD]: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  [DocumentType.ETP]: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  [DocumentType.MAPA_RISCO]: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  [DocumentType.TR]: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  [DocumentType.VIABILIDADE]: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  [DocumentType.IMPUGNACAO]: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  ),
};

const ModelSelector: React.FC<{ selected: string; onChange: (id: string) => void; disabled: boolean }> = ({
  selected, onChange, disabled,
}) => {
  const [open, setOpen] = useState(false);
  const current = AI_MODELS.find(m => m.id === selected) ?? AI_MODELS[0];

  return (
    <div className="px-3 py-3 border-b-2 border-white/10 relative">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Motor de IA</p>
      <button
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 text-left transition-all
          ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:border-primary-500 hover:bg-white/5 cursor-pointer'}
          bg-white/5 border-white/15`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-bold text-white truncate">{current.label}</span>
            {current.badge && (
              <span className="text-[9px] font-black bg-primary-500/20 text-primary-400 border border-primary-500/40 px-1.5 py-0.5 rounded-full">{current.badge}</span>
            )}
          </div>
        </div>
        <svg className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-3 right-3 mt-1 z-20 bg-navy-800 border-2 border-white/15 rounded-xl shadow-2xl overflow-hidden" style={{background:'var(--bg-dropdown)'}}>
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-white/8">
              {AI_MODELS.map((model, i) => (
                <button
                  key={model.id}
                  onClick={() => { onChange(model.id); setOpen(false); }}
                  className={`w-full flex items-start gap-3 px-3.5 py-3 text-left transition-colors hover:bg-white/8
                    ${model.id === selected ? 'bg-primary-500/10 border-l-2 border-primary-500' : ''}`}
                >
                  <span className="text-[10px] font-black text-slate-500 w-4 shrink-0 mt-0.5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-bold text-white">{model.label}</span>
                      {model.badge && (
                        <span className="text-[9px] font-black bg-primary-500/20 text-primary-400 border border-primary-500/40 px-1.5 py-0.5 rounded-full">{model.badge}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug font-semibold">{model.desc}</p>
                  </div>
                  {model.id === selected && (
                    <svg className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  selectedDoc, onSelect, isGenerating,
  currentUser, onLogout, onHistoryClick, selectedModel, onModelChange,
  isOpen = false, onClose, isDark = true, onToggleTheme,
  isCloneMode = false, onCloneModeChange,
}) => {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 flex flex-col h-full shrink-0
          border-r-2 border-white/10
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ background: 'var(--bg-surface)' }}
      >
        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-4 border-b-2 border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-black text-white tracking-tight leading-none">LicitGov AI</p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">Plataforma Gov</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Model selector */}
        <ModelSelector selected={selectedModel} onChange={onModelChange} disabled={isGenerating} />

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">

          {/* Clone button */}
          <button
            onClick={() => { onCloneModeChange?.(!isCloneMode); onClose?.(); }}
            disabled={isGenerating}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-[13px] font-black transition-all mb-3
              ${isCloneMode
                ? 'bg-primary-500 border-primary-400 text-white shadow-lg shadow-primary-500/30'
                : 'bg-primary-500/10 border-primary-500/30 text-primary-300 hover:bg-primary-500/20 hover:border-primary-500/50 hover:text-white'
              }
              ${isGenerating ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            Clonar Documento
          </button>

          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mb-3 mt-1">Documentos</p>
          {Object.values(DocumentType).map((doc) => {
            const isActive = selectedDoc === doc;
            return (
              <button
                key={doc}
                onClick={() => { if (!isGenerating) { onSelect(doc); onClose?.(); } }}
                disabled={isGenerating}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-[13px] font-black transition-all
                  ${isActive
                    ? 'bg-primary-500 border-primary-400 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-primary-500/10 border-primary-500/30 text-primary-300 hover:bg-primary-500/20 hover:border-primary-500/50 hover:text-white'
                  }
                  ${isGenerating ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className={isActive ? 'text-white' : 'text-primary-400'}>
                  {DocIcons[doc]}
                </span>
                {doc.split(' (')[0]}
              </button>
            );
          })}
        </div>

        {/* Bottom */}
        {currentUser && (
          <div className="shrink-0 border-t-2 border-white/10 p-3 space-y-1" style={{ background: 'var(--bg-footer)' }}>
            <div className="flex gap-1.5">
              <button
                onClick={() => { onHistoryClick(); onClose?.(); }}
                className="flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 border-transparent text-slate-300 hover:text-white hover:bg-white/8 hover:border-white/10 transition-all text-[13px] font-bold"
              >
                <svg className="w-4 h-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Meus Documentos
              </button>
              <button
                onClick={onToggleTheme}
                title={isDark ? 'Modo claro' : 'Modo escuro'}
                className="p-2.5 rounded-xl border-2 border-white/10 hover:bg-white/8 transition-all text-slate-400 hover:text-white shrink-0"
              >
                {isDark ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                  </svg>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 border-white/10 bg-white/5 mt-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-black shrink-0">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-white truncate leading-tight">{currentUser.name}</p>
                <p className="text-[11px] font-semibold text-slate-400 truncate">
                  {currentUser.role === 'admin' ? 'Administrador' : 'Gestor Público'}
                </p>
              </div>
              <button onClick={onLogout} title="Sair" className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded hover:bg-white/5 shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
