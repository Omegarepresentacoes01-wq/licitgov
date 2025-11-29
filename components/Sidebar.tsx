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

const LogoIcon = () => (
  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

// Ícones Premium Redesenhados
const Icons = {
  [DocumentType.ETP]: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  [DocumentType.MAPA_RISCO]: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  [DocumentType.TR]: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-[280px] bg-white dark:bg-[#15171e] border-r border-slate-200 dark:border-slate-800 
        flex flex-col h-full shrink-0 transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header / Logo */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <LogoIcon />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-slate-900 dark:text-white leading-tight tracking-tight">
                LicitGov <span className="text-primary-600 dark:text-primary-400">AI</span>
              </h1>
              <span className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Gestão Pública</span>
            </div>
          </div>
          
          <button onClick={onClose} className="absolute top-6 right-4 lg:hidden text-slate-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8">
          
          {/* Menu Section */}
          <div>
            <h3 className="px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Documentos Oficiais</h3>
            <div className="space-y-1.5">
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
                    className={`w-full group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 text-sm font-medium relative overflow-hidden
                      ${isSelected 
                        ? 'bg-gradient-to-r from-primary-50 to-white dark:from-primary-900/30 dark:to-transparent text-primary-700 dark:text-primary-300 ring-1 ring-primary-100 dark:ring-primary-900/50 shadow-sm' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                      }
                      ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600 rounded-l-xl"></div>}
                    
                    <span className={`transition-colors duration-200 ${isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                      {Icons[doc]}
                    </span>
                    <span className="truncate">{doc.split(' (')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Section */}
          {currentUser && (
            <div>
               <h3 className="px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Sua Conta</h3>
               <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400 shadow-sm">
                        {currentUser.name.charAt(0)}
                     </div>
                     <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{currentUser.organization}</p>
                     </div>
                  </div>
                  
                  <div className="space-y-1">
                    {currentUser.role === 'admin' && (
                        <button 
                            onClick={onAdminClick}
                            className="w-full text-xs flex items-center gap-2 px-2 py-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors font-medium"
                        >
                            <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            Painel Administrativo
                        </button>
                    )}
                    <button 
                        onClick={onLogout}
                        className="w-full text-xs flex items-center gap-2 px-2 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Sair do Sistema
                    </button>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Footer Toggle */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-full transition-colors ${darkMode ? 'text-slate-400' : 'bg-white shadow-sm text-amber-500'}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Modo {darkMode ? 'Escuro' : 'Claro'}</span>
            </div>
            <div className={`p-1.5 rounded-full transition-colors ${darkMode ? 'bg-slate-700 shadow-sm text-primary-400' : 'text-slate-400'}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};