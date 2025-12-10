export enum DocumentType {
  ETP = 'ETP (Estudo Técnico Preliminar)',
  MAPA_RISCO = 'Mapa de Risco',
  TR = 'Termo de Referência',
  PESQUISA_PRECO = 'Modelo de Pesquisa de Preço',
  VIABILIDADE = 'Estudo de Viabilidade',
  IMPUGNACAO = 'Resposta à Impugnação',
  ADESAO_ATA = 'Adesão à Ata (Carona)',
}

export interface FormData {
  organName: string;
  city: string;
  modality: string;
  judgmentCriteria: string;
  objectDescription: string;
  estimatedValue: string;
  justification: string;
  additionalInfo: string;
  impugnmentText?: string; // New field for the company's argument
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