export enum DocumentType {
  ETP = 'ETP (Estudo Técnico Preliminar)',
  MAPA_RISCO = 'Mapa de Risco',
  TR = 'Termo de Referência',
  PESQUISA_PRECO = 'Modelo de Pesquisa de Preço',
  VIABILIDADE = 'Estudo de Viabilidade',
  EDITAL = 'Edital Completo (Lei 14.133)',
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
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface GenerationState {
  isGenerating: boolean;
  error: string | null;
}