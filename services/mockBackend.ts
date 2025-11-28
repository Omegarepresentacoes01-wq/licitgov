import { User, SavedDocument, DocumentType } from '../types';

// Extended internal type to include password
interface StoredUser extends User {
  password?: string;
}

// Chaves do LocalStorage - V3 para produção real
const USERS_KEY = 'licitgov_users_prod_v3';
const DOCS_KEY = 'licitgov_documents_prod_v3';
const CURRENT_USER_KEY = 'licitgov_current_user_prod_v3';

// Dados Iniciais (Seed)
const INITIAL_ADMIN: StoredUser = {
  id: 'admin-master',
  name: 'Super Administrador',
  email: 'admin@licitgov.com',
  role: 'admin',
  organization: 'LicitGov HQ',
  createdAt: new Date().toISOString(),
  active: true,
  password: 'admin123'
};

// Inicializa o "Banco de Dados" e GARANTE acesso ao Admin
const initDB = () => {
  // SEGURANÇA: Verificar se estamos no navegador para evitar erro no build (SSR/Node)
  if (typeof window === 'undefined') return;

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

  // ESTRATÉGIA DE RECUPERAÇÃO AGRESSIVA:
  // 1. Remove qualquer usuário que tenha o email do admin (para evitar duplicatas ou dados velhos)
  users = users.filter(u => u.email.toLowerCase() !== INITIAL_ADMIN.email.toLowerCase());

  // 2. Insere o Admin Fresco no topo da lista
  users.unshift(INITIAL_ADMIN);

  // 3. Salva de volta no Storage
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  // Inicializar documentos se não existirem
  if (!localStorage.getItem(DOCS_KEY)) {
    localStorage.setItem(DOCS_KEY, JSON.stringify([]));
  }
  
  console.log("Sistema inicializado. Admin verificado.");
};

// Executa a correção apenas se estiver no navegador
if (typeof window !== 'undefined') {
  initDB();
}

// --- AUTH SERVICES ---

export const login = (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    // Simulação de delay de rede
    setTimeout(() => {
      try {
        if (typeof window === 'undefined') {
            reject(new Error('Ambiente inválido.'));
            return;
        }

        // Recarregar do storage para garantir dados frescos
        const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        
        // Normalização para evitar erros de digitação (trim + lowercase)
        const cleanEmail = email.trim().toLowerCase();
        const cleanPass = password.trim();

        console.log(`Tentativa de login: ${cleanEmail}`); // Debug

        const user = users.find(u => u.email.toLowerCase() === cleanEmail);

        if (!user) {
            console.log("Usuário não encontrado.");
            reject(new Error('E-mail não encontrado.'));
            return;
        }

        if (user.password !== cleanPass) {
             console.log("Senha incorreta.");
             reject(new Error('Senha incorreta.'));
             return;
        }

        if (!user.active) {
            reject(new Error('Conta desativada pelo administrador.'));
            return;
        }
          
        // Remove a senha antes de salvar na sessão/retornar
        const { password: _, ...safeUser } = user;
          
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
        resolve(safeUser);
        
      } catch (e) {
        console.error(e);
        reject(new Error('Erro interno no serviço de autenticação.'));
      }
    }, 800);
  });
};

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
      const userStr = localStorage.getItem(CURRENT_USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
      return null;
  }
};

// --- USER MANAGEMENT (ADMIN ONLY) ---

export const getAllUsers = (): User[] => {
  if (typeof window === 'undefined') return [];
  const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  return users.map(({ password, ...u }) => u);
};

export const createUser = (user: Omit<User, 'id' | 'createdAt'>, password: string): User => {
  if (typeof window === 'undefined') throw new Error('Ambiente inválido');
  const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  
  if (users.find(u => u.email.toLowerCase() === user.email.toLowerCase())) {
    throw new Error('E-mail já cadastrado no sistema.');
  }
  
  const newUser: StoredUser = {
    ...user,
    id: `user-${Date.now()}`,
    createdAt: new Date().toISOString(),
    password: password.trim()
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  const { password: _, ...safeUser } = newUser;
  return safeUser;
};

export const toggleUserStatus = (userId: string): User[] => {
  if (typeof window === 'undefined') return [];
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
    if (typeof window === 'undefined') return [];
    let users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find(u => u.id === userId);
    
    if(user?.email === 'admin@licitgov.com') {
      throw new Error("Não é possível deletar o administrador principal do sistema.");
    }
    
    users = users.filter(u => u.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return users.map(({ password, ...u }) => u);
}

// --- DOCUMENT MANAGEMENT (USER ISOLATED) ---

export const saveDocument = (doc: Omit<SavedDocument, 'id' | 'createdAt'>): SavedDocument => {
  if (typeof window === 'undefined') throw new Error('Ambiente inválido');
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
  if (typeof window === 'undefined') return [];
  const docs: SavedDocument[] = JSON.parse(localStorage.getItem(DOCS_KEY) || '[]');
  return docs.filter(d => d.userId === userId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const getAllDocumentsCount = (): number => {
    if (typeof window === 'undefined') return 0;
    const docs: SavedDocument[] = JSON.parse(localStorage.getItem(DOCS_KEY) || '[]');
    return docs.length;
}

// FUNÇÃO DE EMERGÊNCIA
export const hardReset = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USERS_KEY);
    localStorage.removeItem(DOCS_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.reload();
}