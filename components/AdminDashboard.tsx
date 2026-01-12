import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, TestMetrics, GlobalTestStats, DocumentType, LogEntry } from '../types';
import { getAllUsers, createUser, toggleUserStatus, getAllDocumentsCount } from '../services/mockBackend';
import { generateDocumentStream } from '../services/geminiService';
import { MarkdownViewer } from './MarkdownViewer';

interface AdminDashboardProps {
  currentUser: User;
  onExit: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onExit }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'stress' | 'logs' | 'branding'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Stress Test State (Extreme 250)
  const [concurrentReqs, setConcurrentReqs] = useState(50);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestMetrics[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalTestStats | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedAuditDoc, setSelectedAuditDoc] = useState<TestMetrics | null>(null);

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (logEndRef.current) {
        logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const loadData = () => {
    const allUsers = getAllUsers();
    setUsers([...allUsers].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setTotalDocs(getAllDocumentsCount());
  };

  const addLog = (threadId: number, level: LogEntry['level'], message: string) => {
    const newLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour12: false }) + '.' + new Date().getMilliseconds(),
      threadId,
      level,
      message
    };
    setLogs(prev => [...prev.slice(-200), newLog]); 
  };

  const runStressTest = async () => {
    setIsTesting(true);
    setGlobalStats(null);
    setLogs([]);
    
    const initialMetrics: TestMetrics[] = Array.from({ length: concurrentReqs }, (_, i) => ({
      id: i,
      status: 'pending',
      wordCount: 0,
      content: ''
    }));
    setTestResults(initialMetrics);

    addLog(0, 'info', `🚀 INICIANDO IGNITION EM LOTES: ${concurrentReqs} processos.`);

    // Processamento em lotes para evitar 429 instantâneo e melhorar performance percebida
    const batchSize = 10;
    const items = [...initialMetrics];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      const batchTasks = batch.map(async (m) => {
        setTestResults(prev => prev.map(item => item.id === m.id ? { ...item, status: 'running', startTime: Date.now() } : item));
        addLog(m.id, 'info', `Batch ${Math.floor(i/batchSize) + 1} - Iniciado.`);
        
        try {
          let firstTokenReceived = false;
          let fullText = '';
          
          await generateDocumentStream(DocumentType.TR, {
            organName: `Auditoria Alpha`,
            city: 'Brasília/DF',
            modality: 'Pregão',
            judgmentCriteria: 'Menor Preço',
            objectDescription: "Stress Test Performance LicitGov.",
            estimatedValue: '100.000,00',
            justification: 'Carga técnica.',
            additionalInfo: `ID ${m.id}`
          }, (chunk) => {
            fullText += chunk;
            if (!firstTokenReceived) {
              firstTokenReceived = true;
              setTestResults(prev => prev.map(item => item.id === m.id ? { ...item, firstTokenTime: Date.now() } : item));
            }
            setTestResults(prev => prev.map(item => 
              item.id === m.id ? { ...item, content: fullText, wordCount: fullText.split(/\s+/).length } : item
            ));
          });

          addLog(m.id, 'success', `Finalizado.`);
          setTestResults(prev => prev.map(item => item.id === m.id ? { ...item, status: 'success', endTime: Date.now() } : item));
        } catch (err: any) {
          const errorMsg = err.message || "Erro";
          addLog(m.id, 'error', `FALHA: ${errorMsg.includes('429') ? 'QUOTA EXCEDIDA' : 'ERRO API'}`);
          setTestResults(prev => prev.map(item => item.id === m.id ? { ...item, status: 'error', error: errorMsg } : item));
        }
      });

      await Promise.all(batchTasks);
      // Pequena pausa entre lotes para respirar a API
      if (i + batchSize < items.length) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    setIsTesting(false);
    addLog(0, 'warn', 'Stress Test concluído.');
  };

  useEffect(() => {
    if (!isTesting && testResults.length > 0) {
      const successful = testResults.filter(r => r.status === 'success');
      const stats: GlobalTestStats = {
        totalRequests: testResults.length,
        successCount: successful.length,
        errorCount: testResults.filter(r => r.status === 'error').length,
        avgFirstTokenLatency: successful.reduce((acc, r) => acc + ((r.firstTokenTime || 0) - (r.startTime || 0)), 0) / (successful.length || 1),
        avgTotalDuration: successful.reduce((acc, r) => acc + ((r.endTime || 0) - (r.startTime || 0)), 0) / (successful.length || 1),
        totalWordsGenerated: testResults.reduce((acc, r) => acc + r.wordCount, 0)
      };
      setGlobalStats(stats);
    }
  }, [isTesting, testResults]);

  const failureAnalysis = useMemo(() => {
    const errors = testResults.filter(r => r.status === 'error');
    const quotaErrors = errors.filter(e => e.error?.includes('429') || e.error?.toLowerCase().includes('quota')).length;
    return {
        total: errors.length,
        quota: quotaErrors,
        other: errors.length - quotaErrors
    };
  }, [testResults]);

  const handleToggleStatus = (userId: string) => {
    try {
      const updatedUsers = toggleUserStatus(userId);
      setUsers([...updatedUsers]);
    } catch (err: any) {}
  };

  return (
    <div className="min-h-screen bg-[#020408] text-slate-100 font-sans overflow-hidden flex flex-col">
      <header className="bg-black/60 backdrop-blur-2xl border-b border-white/5 px-8 py-5 flex justify-between items-center shrink-0 z-20">
        <div className="flex items-center gap-12">
            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setActiveTab('branding')}>
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center font-black text-xl text-white italic shadow-[0_0_25px_rgba(249,115,22,0.4)] transition-transform group-hover:rotate-12">L</div>
                <div className="flex flex-col">
                    <h1 className="text-xl font-black text-white tracking-tighter uppercase italic leading-none">LicitGov <span className="text-primary-500">Matrix Core</span></h1>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Audit Protocol 250X</span>
                </div>
            </div>
            
            <nav className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                {[
                    { id: 'users', label: 'Agentes', icon: '👤' },
                    { id: 'stress', label: 'Stress Matrix', icon: '⚡' },
                    { id: 'logs', label: 'Kernel Logs', icon: '⌨️' },
                    { id: 'branding', label: 'Audit Logos', icon: '🖼️' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2.5
                            ${activeTab === tab.id ? 'bg-primary-600 text-white shadow-glow' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}
                        `}
                    >
                        <span>{tab.icon}</span> {tab.label}
                    </button>
                ))}
            </nav>
        </div>
        <div className="flex items-center gap-4">
            <a 
              href="https://ai.google.dev/usage" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all mr-2 flex items-center gap-2"
            >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                Monitorar Quota
            </a>
            <button onClick={onExit} className="px-5 py-2.5 bg-white/5 border border-white/10 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all">Sair</button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 relative scroll-smooth custom-scrollbar">
        {activeTab === 'users' && (
          <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                      { label: 'Usuários Registrados', value: users.length, color: 'text-white', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                      { label: 'Total Documentos (SaaS)', value: totalDocs, color: 'text-primary-500', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                      { label: 'Integridade de Rede', value: '99.9%', color: 'text-emerald-500', icon: 'M13 10V3L4 14h7v7l9-11h-7z' }
                  ].map((stat, i) => (
                      <div key={i} className="bg-white/5 border border-white/5 p-8 rounded-[2rem] shadow-2xl backdrop-blur-xl group hover:border-primary-500/30 transition-all">
                          <div className="flex justify-between items-start mb-4">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</span>
                              <svg className="w-5 h-5 text-slate-700 group-hover:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                              </svg>
                          </div>
                          <p className={`text-5xl font-black mt-2 tracking-tighter ${stat.color}`}>{stat.value}</p>
                      </div>
                  ))}
              </div>

              <div className="bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-md">
                  <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                      <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Diretório de Acessos Autorizados</h2>
                      <button onClick={() => setShowAddModal(true)} className="bg-primary-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-500 shadow-glow transition-all">New Agent Access</button>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left">
                          <thead>
                              <tr className="bg-black/20 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-white/5">
                                  <th className="px-8 py-5">Identidade / Core</th>
                                  <th className="px-8 py-5">Jurisdição</th>
                                  <th className="px-8 py-5">SLA State</th>
                                  <th className="px-8 py-5 text-right">Controles</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                              {users.map(user => (
                                  <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                      <td className="px-8 py-6">
                                          <div className="font-bold text-slate-100 group-hover:text-primary-400 transition-colors">{user.name}</div>
                                          <div className="text-[10px] text-slate-500 font-mono mt-1">{user.email}</div>
                                      </td>
                                      <td className="px-8 py-6 text-slate-400 text-xs font-bold uppercase tracking-tighter">{user.organization}</td>
                                      <td className="px-8 py-6">
                                          <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${user.active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                              {user.active ? 'Operational' : 'Revoked'}
                                          </span>
                                      </td>
                                      <td className="px-8 py-6 text-right">
                                          {user.role !== 'admin' && (
                                              <button onClick={() => handleToggleStatus(user.id)} className="text-primary-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all bg-white/5 px-4 py-2 rounded-lg border border-white/5 hover:bg-primary-600">Switch Protocol</button>
                                          )}
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
        )}

        {activeTab === 'stress' && (
          <div className="h-full flex flex-col gap-8 animate-fadeIn max-w-[1600px] mx-auto w-full">
              <div className="bg-white/5 border border-white/5 p-10 rounded-[3rem] shadow-2xl shrink-0 backdrop-blur-2xl">
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-12">
                      <div className="max-w-2xl">
                          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-4 leading-none">Matrix <span className="text-primary-500">250X</span> Turbo</h2>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.3em] leading-relaxed opacity-70">
                              Otimizado com Gemini 3 Flash e processamento em lotes (Batching) para evitar erros de quota.
                          </p>
                      </div>
                      
                      <div className="flex items-center gap-10 bg-black/50 p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
                          <div className="w-80">
                              <div className="flex justify-between mb-4 items-end">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Intensity (Threads)</label>
                                <span className="text-3xl font-black text-primary-500 italic leading-none">{concurrentReqs}</span>
                              </div>
                              <input 
                                type="range" min="1" max="250" step="1" 
                                value={concurrentReqs} 
                                onChange={(e) => setConcurrentReqs(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                              />
                          </div>
                          <button 
                            onClick={runStressTest}
                            disabled={isTesting}
                            className={`h-20 px-16 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all
                                ${isTesting ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-primary-600 text-white hover:bg-primary-500 shadow-glow'}
                            `}
                          >
                              {isTesting ? 'Processing Batches...' : 'Execute Ignition'}
                          </button>
                      </div>
                  </div>

                  {globalStats && (
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12 pt-12 border-t border-white/5 animate-fadeIn">
                          {[
                              { label: 'Success Rate (SLA)', val: `${(globalStats.successCount / globalStats.totalRequests * 100).toFixed(1)}%`, color: 'text-emerald-500', sub: `${globalStats.successCount} Success` },
                              { label: 'Latency (Avg)', val: `${globalStats.avgFirstTokenLatency.toFixed(0)}ms`, color: 'text-white', sub: 'First Token Handshake' },
                              { label: 'Total Failures', val: globalStats.errorCount, color: 'text-red-500', sub: `Quota 429: ${failureAnalysis.quota}` },
                              { label: 'Word Pool (Load)', val: globalStats.totalWordsGenerated.toLocaleString(), color: 'text-primary-500', sub: 'Aggregated Content' }
                          ].map((s, i) => (
                              <div key={i} className="bg-black/40 p-6 rounded-3xl border border-white/5 relative overflow-hidden">
                                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 block">{s.label}</span>
                                  <p className={`text-3xl font-black tracking-tighter ${s.color}`}>{s.val}</p>
                                  <p className="text-[9px] font-bold text-slate-600 uppercase mt-2">{s.sub}</p>
                              </div>
                          ))}
                      </div>
                  )}
              </div>

              <div className="flex-1 min-h-0 bg-black/40 rounded-[3rem] border border-white/5 p-10 overflow-hidden flex flex-col shadow-inner backdrop-blur-xl">
                  <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                      <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-20 lg:grid-cols-25 gap-2.5 pb-4">
                          {testResults.map((res) => (
                              <button 
                                key={res.id} 
                                onClick={() => setSelectedAuditDoc(res)}
                                className={`aspect-square rounded-md transition-all flex items-center justify-center text-[9px] font-black border
                                    ${res.status === 'running' ? 'bg-primary-500 border-primary-400 text-white animate-pulse' : 
                                      res.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white' : 
                                      res.status === 'error' ? 'bg-red-500/10 border-red-500/40 text-red-500 hover:bg-red-500 hover:text-white' : 
                                      'bg-white/5 border-white/5 text-slate-700 hover:bg-white/10'}
                                `}
                              >
                                  {res.id + 1}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
        )}

        {activeTab === 'logs' && (
            <div className="h-full flex flex-col animate-fadeIn max-w-5xl mx-auto w-full">
                 <div className="bg-black/80 border border-white/10 rounded-[2.5rem] flex-1 flex flex-col overflow-hidden shadow-2xl font-mono">
                    <div className="flex-1 p-8 overflow-y-auto space-y-1.5 text-xs custom-scrollbar bg-[#000000]">
                        {logs.map((log, i) => (
                            <div key={i} className={`flex gap-6 border-l-4 pl-4 py-0.5 ${log.level === 'error' ? 'border-red-500 bg-red-500/10' : log.level === 'warn' ? 'border-primary-500 bg-primary-500/10' : log.level === 'success' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800'}`}>
                                <span className="text-slate-600 shrink-0 font-bold">[{log.timestamp}]</span>
                                <span className={`font-black shrink-0 w-28 italic ${log.level === 'error' ? 'text-red-400' : log.level === 'warn' ? 'text-primary-400' : log.level === 'success' ? 'text-emerald-400' : 'text-slate-400'}`}>
                                    >> THREAD_{log.threadId}
                                </span>
                                <span className={`${log.level === 'error' ? 'text-red-300 font-bold' : 'text-slate-300'}`}>{log.message}</span>
                            </div>
                        ))}
                        <div ref={logEndRef} />
                    </div>
                 </div>
            </div>
        )}

        {activeTab === 'branding' && (
            <div className="h-full flex flex-col animate-fadeIn max-w-6xl mx-auto w-full">
                <div className="bg-white/5 border border-white/5 p-12 rounded-[3rem] shadow-2xl backdrop-blur-xl h-full flex flex-col">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 overflow-y-auto pr-4 custom-scrollbar">
                         {Array.from({ length: 24 }).map((_, i) => (
                             <div key={i} className="flex flex-col items-center gap-4 group">
                                 <div className="w-full aspect-square bg-black/40 rounded-3xl border border-white/5 flex items-center justify-center p-6 group-hover:border-primary-500/50 transition-all group-hover:bg-black/60 shadow-xl">
                                     <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center font-black text-2xl text-white italic transition-transform group-hover:rotate-12">L</div>
                                 </div>
                                 <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest group-hover:text-primary-500 transition-colors">LicitGov Icon v{i+1}</span>
                             </div>
                         ))}
                    </div>
                </div>
            </div>
        )}
      </main>

      {/* Extreme Audit Modal */}
      {selectedAuditDoc && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[100] p-6 md:p-16 flex items-center justify-center animate-fadeIn">
              <div className="bg-[#05070a] border border-white/10 w-full max-w-6xl h-full rounded-[3.5rem] shadow-[0_0_150px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden relative">
                  <div className="px-12 py-10 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
                      <div className="flex items-center gap-8">
                        <div className={`w-6 h-6 rounded-full ${selectedAuditDoc.status === 'success' ? 'bg-emerald-500' : selectedAuditDoc.status === 'error' ? 'bg-red-500' : 'bg-primary-500 animate-pulse'}`}></div>
                        <div>
                            <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Deep <span className="text-primary-500">Audit Protocol</span></h3>
                        </div>
                      </div>
                      <button onClick={() => setSelectedAuditDoc(null)} className="p-4 hover:bg-white/10 rounded-[1.5rem] transition-all text-slate-400 hover:text-white group">
                          <svg className="w-10 h-10 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-16 bg-white scroll-smooth custom-scrollbar-paper selection:bg-primary-500/20 selection:text-primary-950">
                      <div className="max-w-4xl mx-auto">
                        {selectedAuditDoc.content ? (
                            <MarkdownViewer content={selectedAuditDoc.content} />
                        ) : selectedAuditDoc.error ? (
                            <div className="bg-red-50 border-4 border-red-200 p-12 rounded-[2.5rem]">
                                <h4 className="text-red-700 font-black uppercase text-xl tracking-tighter italic leading-none mb-4">Critical Failure Analysis</h4>
                                <p className="text-red-900 font-mono text-sm leading-relaxed bg-white/50 p-6 rounded-2xl border border-red-100">{selectedAuditDoc.error}</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full py-24 text-slate-300">
                                <div className="w-24 h-24 border-8 border-primary-500 border-t-transparent rounded-full animate-spin mb-10 shadow-glow"></div>
                                <p className="font-black uppercase tracking-[0.5em] text-sm animate-pulse">Decompressing Core Stream...</p>
                            </div>
                        )}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-6">
             <div className="bg-[#0b0e14] border border-white/10 rounded-[3rem] shadow-2xl max-w-md w-full p-12 animate-fadeIn relative overflow-hidden">
                 <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-10 leading-none">Authorize <span className="text-primary-500">Agent</span></h3>
                 <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setShowAddModal(false); loadData(); }}>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Legal Identity</label>
                        <input type="text" required className="w-full px-6 py-4 bg-black/50 rounded-2xl border border-white/5 text-sm text-white focus:border-primary-500 outline-none transition-all shadow-inner" placeholder="Nome do Pregoeiro / Auditor" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Gov Mail Protocol</label>
                        <input type="email" required className="w-full px-6 py-4 bg-black/50 rounded-2xl border border-white/5 text-sm text-white focus:border-primary-500 outline-none transition-all shadow-inner" placeholder="nome@orgao.gov.br" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Security Token</label>
                        <input type="password" required className="w-full px-6 py-4 bg-black/50 rounded-2xl border border-white/5 text-sm text-white focus:border-primary-500 outline-none transition-all shadow-inner" placeholder="••••••••" />
                    </div>
                    <div className="flex gap-5 pt-10">
                        <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all bg-white/5 rounded-2xl">Abort</button>
                        <button type="submit" className="flex-1 py-5 bg-primary-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-glow">Authorize Access</button>
                    </div>
                 </form>
             </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(249, 115, 22, 0.2); border-radius: 20px; border: 2px solid transparent; background-clip: content-box; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(249, 115, 22, 0.4); }

        .custom-scrollbar-paper::-webkit-scrollbar { width: 12px; }
        .custom-scrollbar-paper::-webkit-scrollbar-track { background: #f8fafc; }
        .custom-scrollbar-paper::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; border: 3px solid #f8fafc; }
        .custom-scrollbar-paper::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};