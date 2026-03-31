export enum DocumentType {
  DFD = 'DFD (Formalização da Demanda)',
  ETP = 'ETP (Estudo Técnico Preliminar)',
  MAPA_RISCO = 'Mapa de Risco',
  TR = 'Termo de Referência',
  VIABILIDADE = 'Estudo de Viabilidade',
  IMPUGNACAO = 'Resposta à Impugnação',
}

export type ObjectType =
  | 'Bem / Material'
  | 'Serviço Comum'
  | 'Serviço de TI / Software'
  | 'Serviço Continuado'
  | 'Obra / Engenharia'
  | '';

export interface FormData {
  organName: string;
  city: string;
  modality: string;
  judgmentCriteria: string;
  objectDescription: string;
  estimatedValue: string;
  justification: string;
  additionalInfo: string;
  // Campos avançados — Step 5
  objectType: ObjectType;
  consumptionHistory: string;
  requiresPoC: 'sim' | 'nao' | '';
  pocDescription: string;
  customRequirements: string;
  impugnmentText?: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface GenerationState {
  isGenerating: boolean;
  error: string | null;
}

// --- SAAS TYPES ---

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization?: string;
  createdAt: string;
  active: boolean;
}

export interface SavedDocument {
  id: string;
  userId: string;
  type: DocumentType;
  title: string;
  content: string;
  createdAt: string;
  preview: string;
}

