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
  
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newOrg, setNewOrg] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
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
        role: 'user',
        organization: newOrg,
        active: true
      }, newPassword);

      setShowAddModal(false);
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
      if(window.confirm("Confirmar exclusão definitiva?")) {
        try {
            deleteUser(userId);
            loadData();
        } catch (e: any) {
            alert(e.message);
        }
      }
  };

  const isNewUser = (dateString: string) => {
    const createdDate = new Date(dateString);
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    return createdDate > twoDaysAgo;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg font-sans">
      {/* Header */}
      <header className="bg-white dark:bg-dark-card border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-1.5 rounded text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
            </div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-white">Administração</h1>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{currentUser.name}</p>
            </div>
            <button 
                onClick={onExit}
                className="px-3 py-1.5 bg-white border border-slate-300 dark:bg-slate-800 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded text-sm font-medium hover:bg-slate-50 transition-colors"
            >
                Sair
            </button>
        </div>
      </header>

      {/* Stats Cards - Flat Style */}
      <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-dark-card p-5 rounded border border-slate-200 dark:border-slate-700 shadow-soft">
            <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Total de Usuários</h3>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{users.length}</p>
        </div>
        <div className="bg-white dark:bg-dark-card p-5 rounded border border-slate-200 dark:border-slate-700 shadow-soft">
            <h3 className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wide">Contas Ativas</h3>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{users.filter(u => u.active).length}</p>
        </div>
        <div className="bg-white dark:bg-dark-card p-5 rounded border border-slate-200 dark:border-slate-700 shadow-soft">
            <h3 className="text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wide">Documentos Gerados</h3>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalDocs}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="px-6 pb-6">
        <div className="bg-white dark:bg-dark-card rounded border border-slate-200 dark:border-slate-700 shadow-soft">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <h2 className="text-sm font-bold text-slate-800 dark:text-white">Usuários do Sistema</h2>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary-700 hover:bg-primary-800 text-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide transition-colors"
                >
                    + Novo Usuário
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white dark:bg-dark-card border-b border-slate-200 dark:border-slate-700 text-slate-500 font-medium">
                        <tr>
                            <th className="px-4 py-3 w-1/4">Nome</th>
                            <th className="px-4 py-3">Organização</th>
                            <th className="px-4 py-3">Cadastro</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-4 py-3">
                                    <div className="font-medium text-slate-900 dark:text-white">
                                        {user.name}
                                        {user.role === 'admin' && <span className="ml-2 text-[10px] bg-slate-200 text-slate-600 px-1 rounded">ADMIN</span>}
                                        {isNewUser(user.createdAt) && <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-1 rounded">NOVO</span>}
                                    </div>
                                    <div className="text-xs text-slate-500">{user.email}</div>
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{user.organization}</td>
                                <td className="px-4 py-3 text-slate-500 text-xs">
                                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                        user.active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                    }`}>
                                        {user.active ? 'Ativo' : 'Bloqueado'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right space-x-2">
                                    {user.role !== 'admin' && (
                                        <>
                                            <button onClick={() => handleToggleStatus(user.id)} className="text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium text-xs">
                                                {user.active ? 'Bloquear' : 'Ativar'}
                                            </button>
                                            <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:text-red-700 font-medium text-xs">
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

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-dark-card rounded shadow-xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Adicionar Usuário</h3>
                <form onSubmit={handleCreateUser} className="space-y-3">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Nome</label>
                        <input type="text" required className="w-full px-3 py-2 border rounded border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white text-sm" value={newName} onChange={e => setNewName(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">E-mail</label>
                        <input type="email" required className="w-full px-3 py-2 border rounded border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white text-sm" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Organização</label>
                        <input type="text" required className="w-full px-3 py-2 border rounded border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white text-sm" value={newOrg} onChange={e => setNewOrg(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Senha Provisória</label>
                        <input type="text" required className="w-full px-3 py-2 border rounded border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white text-sm" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    </div>
                    {error && <p className="text-red-500 text-xs">{error}</p>}
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 border rounded text-sm text-slate-600 hover:bg-slate-50">Cancelar</button>
                        <button type="submit" className="flex-1 py-2 bg-primary-700 text-white rounded text-sm hover:bg-primary-800 font-medium">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};