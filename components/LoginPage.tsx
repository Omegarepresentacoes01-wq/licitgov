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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B1120] relative overflow-hidden">
      {/* Artistic Background Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary-400/20 dark:bg-primary-600/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[100px] animation-delay-2000"></div>

      <div className="max-w-md w-full relative z-10 px-4">
        <div className="bg-white/70 dark:bg-[#1e293b]/70 backdrop-blur-xl p-10 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-white/50 dark:border-slate-700/50 ring-1 ring-slate-900/5">
            <div className="text-center mb-10">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/40 mb-6 transform rotate-3">
                <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            </div>
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
                Bem-vindo ao <span className="text-primary-600">LicitGov</span>
            </h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 font-medium">
                A plataforma de inteligência jurídica definitiva para gestão pública.
            </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 ml-1">E-mail Corporativo</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="appearance-none block w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium"
                        placeholder="seu@email.gov.br"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 ml-1">Senha</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="appearance-none block w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 py-3 px-4 rounded-xl border border-red-100 dark:border-red-800">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 active:scale-[0.98] transition-all shadow-xl shadow-primary-500/20 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
                {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                ) : 'Entrar no Portal'}
            </button>
            </form>

            <div className="mt-8 text-center">
                <button 
                    onClick={hardReset}
                    type="button"
                    className="text-xs font-medium text-slate-400 hover:text-primary-600 transition-colors"
                >
                    Problemas no acesso? Resetar aplicação
                </button>
            </div>
        </div>
        <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-6">
            &copy; 2025 LicitGov AI. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};