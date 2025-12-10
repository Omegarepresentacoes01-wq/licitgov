import React from 'react';
import { DocumentType, User } from '../types';

interface SidebarProps {
  selectedDoc: DocumentType;
  onSelect: (doc: DocumentType) => void;
  isGenerating: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
  currentUser: User | null;
  onLogout: () => void;
  onAdminClick: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Icons = {
  [DocumentType.ETP]: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  [DocumentType.MAPA_RISCO]: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  [DocumentType.TR]: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  [DocumentType.PESQUISA_PRECO]: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  [DocumentType.VIABILIDADE]: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  [DocumentType.IMPUGNACAO]: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  ),
  [DocumentType.ADESAO_ATA]: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
};

export const Sidebar: React.FC<SidebarProps> = ({ 
  selectedDoc, 
  onSelect, 
  isGenerating, 
  darkMode, 
  toggleDarkMode, 
  currentUser, 
  onLogout, 
  onAdminClick,
  isOpen = false,
  onClose
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-navy-950/90 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Container - Use Navy-900 instead of 950 for slightly lighter feel */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-[280px] bg-navy-900 border-r border-white/5
        flex flex-col h-full shrink-0 
        transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header - Text Only, No Icon */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 bg-navy-900 shrink-0">
          <div>
            <h1 className="font-sans font-extrabold text-2xl text-white tracking-tight">
              LicitGov<span className="text-primary-500">.</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Inteligência Pública
            </p>
          </div>
          
          <button 
            onClick={onClose} 
            className="lg:hidden p-1 text-slate-400 hover:text-white transition-colors rounded hover:bg-white/10"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-8 px-4 space-y-2">
          <div className="px-2 mb-4">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Documentos Oficiais</h3>
          </div>
          
          {Object.values(DocumentType).map((doc) => {
            const isSelected = selectedDoc === doc;
            return (
              <button
                key={doc}
                onClick={() => {
                  if (!isGenerating) {
                    onSelect(doc);
                    onClose?.();
                  }
                }}
                disabled={isGenerating}
                className={`w-full group flex items-center justify-between px-4 py-3.5 rounded-lg transition-all duration-200 text-sm font-medium border border-transparent
                  ${isSelected 
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }
                  ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-center gap-3">
                  <span className={`${isSelected ? 'text-white' : 'text-slate-500 group-hover:text-primary-500 transition-colors'}`}>
                    {Icons[doc]}
                  </span>
                  <span className="truncate tracking-tight">{doc.split(' (')[0]}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* User Profile Section */}
        {currentUser && (
            <div className="p-4 bg-navy-900 border-t border-white/5 shrink-0">
                <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-white/10 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {currentUser.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate leading-tight group-hover:text-primary-400 transition-colors">{currentUser.name}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{currentUser.organization}</p>
                    </div>
                    
                    <button 
                         onClick={onLogout}
                         className="text-slate-500 hover:text-red-400 transition-colors p-1.5 hover:bg-white/5 rounded"
                         title="Sair"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>

                {currentUser.role === 'admin' && (
                    <button 
                        onClick={() => {
                          onAdminClick();
                          onClose?.();
                        }}
                        className="w-full mb-3 py-2.5 bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white text-xs font-bold rounded-lg border border-white/5 transition-all uppercase tracking-wide hover:shadow-md"
                    >
                        Painel Administrativo
                    </button>
                )}
                
                <button 
                  onClick={toggleDarkMode} 
                  className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 hover:text-primary-400 transition-colors py-2 rounded"
                >
                    {darkMode ? (
                        <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> Light Mode</>
                    ) : (
                        <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> Dark Mode</>
                    )}
                </button>
            </div>
        )}
      </aside>
    </>
  );
};