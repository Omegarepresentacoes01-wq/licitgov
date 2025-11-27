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
}

const DocIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ScaleIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const MoneyIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const docIcons: Record<DocumentType, React.ReactNode> = {
  [DocumentType.ETP]: <DocIcon />,
  [DocumentType.MAPA_RISCO]: <AlertIcon />,
  [DocumentType.TR]: <DocIcon />,
  [DocumentType.PESQUISA_PRECO]: <MoneyIcon />,
  [DocumentType.VIABILIDADE]: <ChartIcon />,
};

export const Sidebar: React.FC<SidebarProps> = ({ selectedDoc, onSelect, isGenerating, darkMode, toggleDarkMode, currentUser, onLogout, onAdminClick }) => {
  return (
    <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full z-20 shrink-0 transition-colors duration-300">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-primary-600 p-2 rounded-lg text-white shadow-lg shadow-primary-500/30">
            <ScaleIcon />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">
              LicitGov AI
            </h1>
            <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-1">SaaS Jurídico</p>
          </div>
        </div>
      </div>
      
      {/* User Profile Card */}
      {currentUser && (
        <div className="px-4 mb-6">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 flex items-center justify-center font-bold text-xs">
                        {currentUser.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{currentUser.name}</p>
                        <p className="text-xs text-slate-500 truncate">{currentUser.organization}</p>
                    </div>
                </div>
                {currentUser.role === 'admin' && (
                    <button 
                        onClick={onAdminClick}
                        className="w-full text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 py-1 rounded-md font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors mb-2"
                    >
                        Painel Admin
                    </button>
                )}
                <button 
                    onClick={onLogout}
                    className="w-full text-xs flex items-center justify-center gap-1 text-slate-500 hover:text-red-500 transition-colors"
                >
                    Sair da conta
                </button>
            </div>
        </div>
      )}

      <div className="px-4 mb-2">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-2">Gerar Novo</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 space-y-1">
        {Object.values(DocumentType).map((doc) => (
          <button
            key={doc}
            onClick={() => !isGenerating && onSelect(doc)}
            disabled={isGenerating}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 group
              ${selectedDoc === doc 
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }
              ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span className={`${selectedDoc === doc ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
              {docIcons[doc]}
            </span>
            <span className="text-sm font-medium leading-tight">{doc.split(' (')[0]}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            {darkMode ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
            <span className="text-sm font-medium">{darkMode ? 'Modo Escuro' : 'Modo Claro'}</span>
          </div>
          <div className={`w-10 h-5 rounded-full relative transition-colors ${darkMode ? 'bg-primary-600' : 'bg-slate-300'}`}>
            <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${darkMode ? 'left-6' : 'left-1'}`} />
          </div>
        </button>
        
        <div className="mt-4 text-xs text-center text-slate-400 dark:text-slate-600">
          LicitGov SaaS v1.0
        </div>
      </div>
    </aside>
  );
};
