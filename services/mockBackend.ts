import { User, SavedDocument, DocumentType } from '../types';

// Extended internal type to include password
interface StoredUser extends User {
  password?: string;
}

// Chaves do LocalStorage - Alteradas para produção (reset limpo)
const USERS_KEY = 'licitgov_users_prod_v1';
const DOCS_KEY = 'licitgov_documents_prod_v1';
const CURRENT_USER_KEY = 'licitgov_current_user_prod_v1';

// Dados Iniciais (Seed) - Apenas o Super Admin inicial
const INITIAL_ADMIN: StoredUser = {
  id: 'admin-master',
  name: 'Super Administrador',
  email: 'admin@licitgov.com',
  role: 'admin',
  organization: 'LicitGov HQ',
  createdAt: new Date().toISOString(),
  active: true,
  password: 'admin123' // Senha padrão restaurada a cada boot
};

// Inicializa o "Banco de Dados" e GARANTE acesso ao Admin
const initDB = () => {
  let users: StoredUser[] = [];
  const existingData = localStorage.getItem(USERS_KEY);

  if (existingData) {
    try {
      users = JSON.parse(existingData);
    } catch (e) {
      console.error("Dados corrompidos, resetando...", e);
      users = [];
    }
  }

  // LÓGICA DE AUTO-CORREÇÃO DO ADMIN
  const adminIndex = users.findIndex(u => u.email === INITIAL_ADMIN.email);

  if (adminIndex !== -1) {
    // Admin existe: FORÇAR a senha correta e garantir que está ativo
    users[adminIndex].password = INITIAL_ADMIN.password;
    users[adminIndex].active = true;
    users[adminIndex].role = 'admin'; // Garantir permissão
    console.log("Admin account restored/verified.");
  } else {
    // Admin não existe: Adicionar ao topo da lista
    users.unshift(INITIAL_ADMIN);
    console.log("Admin account created.");
  }

  // Salvar de volta no Storage
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  // Inicializar documentos se não existirem
  if (!localStorage.getItem(DOCS_KEY)) {
    localStorage.setItem(DOCS_KEY, JSON.stringify([]));
  }
};

// Executa a correção imediatamente ao carregar o arquivo
initDB();

// --- AUTH SERVICES ---

export const login = (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    // Simulação de delay de rede
    setTimeout(() => {
      try {
        // Recarregar do storage para garantir dados frescos
        const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        
        // Normalização para evitar erros de digitação (trim + lowercase)
        const cleanEmail = email.trim().toLowerCase();
        const cleanPass = password.trim();

        const user = users.find(u => u.email.toLowerCase() === cleanEmail);

        if (user && user.password === cleanPass) {
          if (!user.active) {
            reject(new Error('Conta desativada pelo administrador.'));
            return;
          }
          
          // Remove a senha antes de salvar na sessão/retornar
          const { password: _, ...safeUser } = user;
          
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
          resolve(safeUser);
        } else {
          reject(new Error('Credenciais inválidas. Verifique e-mail e senha.'));
        }
      } catch (e) {
        reject(new Error('Erro interno no serviço de autenticação.'));
      }
    }, 800);
  });
};

export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  try {
      const userStr = localStorage.getItem(CURRENT_USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
      return null;
  }
};

// --- USER MANAGEMENT (ADMIN ONLY) ---

export const getAllUsers = (): User[] => {
  const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  // Retorna usuários sem a senha para a interface
  return users.map(({ password, ...u }) => u);
};

export const createUser = (user: Omit<User, 'id' | 'createdAt'>, password: string): User => {
  const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  
  if (users.find(u => u.email.toLowerCase() === user.email.toLowerCase())) {
    throw new Error('E-mail já cadastrado no sistema.');
  }
  
  const newUser: StoredUser = {
    ...user,
    id: `user-${Date.now()}`,
    createdAt: new Date().toISOString(),
    password: password.trim() // Salva a senha definida pelo admin
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // Retorna sem a senha
  const { password: _, ...safeUser } = newUser;
  return safeUser;
};

export const toggleUserStatus = (userId: string): User[] => {
  const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const updatedUsers = users.map(u => {
    if (u.id === userId && u.role !== 'admin') { 
      return { ...u, active: !u.active };
    }
    return u;
  });
  localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
  return updatedUsers.map(({ password, ...u }) => u);
};

export const deleteUser = (userId: string): User[] => {
    let users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find(u => u.id === userId);
    
    // Proteção extra para não deletar o admin principal
    if(user?.email === 'admin@licitgov.com') {
      throw new Error("Não é possível deletar o administrador principal do sistema.");
    }
    
    users = users.filter(u => u.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return users.map(({ password, ...u }) => u);
}

// --- DOCUMENT MANAGEMENT (USER ISOLATED) ---

export const saveDocument = (doc: Omit<SavedDocument, 'id' | 'createdAt'>): SavedDocument => {
  const docs: SavedDocument[] = JSON.parse(localStorage.getItem(DOCS_KEY) || '[]');
  
  const newDoc: SavedDocument = {
    ...doc,
    id: `doc-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  docs.push(newDoc);
  localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
  return newDoc;
};

export const getDocumentsByUser = (userId: string): SavedDocument[] => {
  const docs: SavedDocument[] = JSON.parse(localStorage.getItem(DOCS_KEY) || '[]');
  return docs.filter(d => d.userId === userId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const getAllDocumentsCount = (): number => {
    const docs: SavedDocument[] = JSON.parse(localStorage.getItem(DOCS_KEY) || '[]');
    return docs.length;
}

// Função de emergência para reset total (se necessário chamar via console)
export const hardResetDB = () => {
    localStorage.clear();
    location.reload();
}