import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { getAllUsers, createUser, toggleUserStatus, deleteUser, getAllDocumentsCount } from '../services/mockBackend';

interface AdminDashboardProps {
  currentUser: User;
  onExit: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onExit }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [totalDocs, setTotalDocs] = useState(0);
  
  // New User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newOrg, setNewOrg] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Carrega usuários e ordena por data de criação (mais recentes primeiro)
    const allUsers = getAllUsers();
    const sortedUsers = [...allUsers].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setUsers(sortedUsers);
    setTotalDocs(getAllDocumentsCount());
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    try {
      createUser({
        name: newName,
        email: newEmail,
        role: 'user', // Default create role is user
        organization: newOrg,
        active: true
      }, newPassword);

      setShowAddModal(false);
      // Reset Form
      setNewName('');
      setNewEmail('');
      setNewOrg('');
      setNewPassword('');
      setError('');
      
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleStatus = (userId: string) => {
    toggleUserStatus(userId);
    loadData();
  };

  const handleDelete = (userId: string) => {
      if(window.confirm("Tem certeza que deseja excluir este usuário permanentemente?")) {
        try {
            deleteUser(userId);
            loadData();
        } catch (e: any) {
            alert(e.message);
        }
      }
  };

  // Helper para identificar usuários criados nas últimas 48h
  const isNewUser = (dateString: string) => {
    const createdDate = new Date(dateString);
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    return createdDate > twoDaysAgo;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <div className="bg-purple-600 p-2 rounded-lg text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </div>
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Portal Administrativo</h1>
                <p className="text-sm text-slate-500">Gestão de Licenças e Usuários SaaS</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
                <p className="text-xs text-slate-500">Super Admin</p>
            </div>
            <button 
            onClick={onExit}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
            <span>Ir para o App</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            </button>
        </div>
      </header>

      {/* Stats */}
      <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path></svg>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">Total de Usuários</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{users.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-emerald-500">
                 <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">Usuários Ativos</h3>
            <p className="text-3xl font-bold text-emerald-600 mt-2">{users.filter(u => u.active).length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-blue-500">
                 <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"></path></svg>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">Documentos Gerados</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{totalDocs}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="px-8 pb-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Gerenciar Acessos</h2>
                    <p className="text-sm text-slate-500">Lista ordenada pelos cadastros mais recentes</p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary-500/30 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Novo Usuário
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Usuário</th>
                            <th className="px-6 py-4">Organização</th>
                            <th className="px-6 py-4">Data Cadastro</th>
                            <th className="px-6 py-4">Função</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-xs">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                                {user.name}
                                                {isNewUser(user.createdAt) && (
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                                        NOVO
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-slate-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">{user.organization}</td>
                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm font-mono">
                                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                                    <span className="text-xs text-slate-400 block">
                                        {new Date(user.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                    }`}>
                                        {user.role.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        user.active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                    }`}>
                                        {user.active ? 'ATIVO' : 'BLOQUEADO'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    {user.role !== 'admin' && (
                                        <>
                                            <button 
                                                onClick={() => handleToggleStatus(user.id)}
                                                className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                                            >
                                                {user.active ? 'Bloquear' : 'Ativar'}
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(user.id)}
                                                className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                Excluir
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Novo Usuário</h3>
                    <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
                        <input type="text" required className="w-full p-2.5 rounded-lg border border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Maria Silva" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
                        <input type="email" required className="w-full p-2.5 rounded-lg border border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Ex: maria@licitacao.gov.br" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Organização (Prefeitura/Órgão)</label>
                        <input type="text" required className="w-full p-2.5 rounded-lg border border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" value={newOrg} onChange={e => setNewOrg(e.target.value)} placeholder="Ex: Secretaria de Saúde" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Senha de Acesso</label>
                        <input type="text" required className="w-full p-2.5 rounded-lg border border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Defina a senha inicial" />
                        <p className="text-xs text-slate-500 mt-1">O usuário deverá usar esta senha no primeiro acesso.</p>
                    </div>
                    {error && <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">{error}</p>}
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
                        <button type="submit" className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition-all">Criar Usuário</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};