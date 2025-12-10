import React, { useState } from 'react';
import { login, hardReset } from '../services/mockBackend';
import { User } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900 relative overflow-hidden font-sans">
      {/* Improved Background Lighting - Lighter Gradients */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 z-0"></div>
      
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[100px] pointer-events-none z-0 mix-blend-screen"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0 mix-blend-screen"></div>

      <div className="max-w-7xl w-full mx-auto grid lg:grid-cols-12 gap-16 p-6 relative z-10 items-center">
        
        {/* Left Side: Branding / Hero */}
        <div className="lg:col-span-7 text-white space-y-8 animate-fadeIn">
            {/* Logo Text Only - Clean SaaS Look */}
            <div className="flex items-center gap-3">
                 <h2 className="text-3xl font-extrabold tracking-tight text-white">
                    LicitGov AI
                 </h2>
                 <span className="px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400 text-[10px] font-bold uppercase tracking-wider border border-primary-500/30">
                    GovTech
                 </span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight">
                Gestão de Licitações com<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">Tecnologia Total</span>
            </h1>
            
            <p className="text-slate-300 text-lg lg:text-xl leading-relaxed max-w-lg font-normal">
                Especialistas em documentos jurídicos para órgãos públicos. Otimize ETPs, TRs e Mapas de Risco com inteligência artificial.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
               <button className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-3.5 px-8 rounded-lg shadow-glow transition-all transform hover:-translate-y-0.5">
                  Solicitar Orçamento
               </button>
               <button className="bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 px-8 rounded-lg border border-white/10 backdrop-blur-sm transition-all transform hover:-translate-y-0.5">
                  Conhecer Soluções
               </button>
            </div>
            
            {/* Social Proof */}
            <div className="pt-8 flex items-center gap-4 text-sm text-slate-400 font-medium">
                <div className="flex -space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-navy-900"></div>
                    <div className="w-8 h-8 rounded-full bg-slate-600 border-2 border-navy-900"></div>
                    <div className="w-8 h-8 rounded-full bg-slate-500 border-2 border-navy-900"></div>
                </div>
                <span>Utilizado por +500 órgãos públicos</span>
            </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="lg:col-span-5">
            <div className="bg-navy-800/80 backdrop-blur-xl p-8 lg:p-10 rounded-3xl border border-white/10 shadow-2xl">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Acessar Plataforma</h2>
                    <p className="text-slate-400 text-sm">Entre com suas credenciais governamentais para continuar.</p>
                </div>
                
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">E-mail Corporativo</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full px-4 py-4 rounded-xl border border-white/10 bg-navy-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            placeholder="nome@orgao.gov.br"
                        />
                    </div>
                    <div className="space-y-2">
                         <div className="flex justify-between items-center ml-1">
                            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Senha</label>
                            <a href="#" className="text-xs text-primary-400 hover:text-primary-300 font-medium">Esqueceu?</a>
                         </div>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full px-4 py-4 rounded-xl border border-white/10 bg-navy-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-200 text-sm bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                            <svg className="w-5 h-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-4 px-4 text-base font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-900 focus:ring-primary-500 transition-all shadow-lg shadow-primary-600/20 ${loading ? 'opacity-75 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                    >
                        {loading ? 'Autenticando...' : 'Entrar no Sistema'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <button 
                        onClick={hardReset}
                        type="button"
                        className="text-xs text-slate-500 hover:text-primary-400 transition-colors"
                    >
                        Problemas com acesso? Restaurar Sistema
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};