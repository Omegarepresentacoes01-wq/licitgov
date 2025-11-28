import { GoogleGenAI } from "@google/genai";
import { DocumentType, FormData } from '../types';
import { PROMPT_TEMPLATES, SYSTEM_INSTRUCTION } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDocumentStream = async (
  docType: DocumentType,
  data: FormData,
  onChunk: (text: string) => void
) => {
  const modelId = 'gemini-3-pro-preview';

  const userPrompt = `
    ATENÇÃO MÁXIMA: GERAÇÃO DE DOCUMENTO JURÍDICO OFICIAL.
    
    PERFIL DO REDATOR: Auditor Federal de Controle Externo e Especialista em Licitações.
    MISSÃO: Produzir um documento à prova de falhas, auditável e tecnicamente perfeito.
    
    DADOS DO PROCESSO ADMINISTRATIVO:
    -----------------------------------
    ÓRGÃO: ${data.organName}
    LOCAL: ${data.city}
    OBJETO DA CONTRATAÇÃO: ${data.objectDescription}
    VALOR ESTIMADO: ${data.estimatedValue}
    MODALIDADE: ${data.modality}
    CRITÉRIO DE JULGAMENTO: ${data.judgmentCriteria}
    JUSTIFICATIVA: ${data.justification}
    OBSERVAÇÕES: ${data.additionalInfo}
    -----------------------------------

    DOCUMENTO A SER GERADO: ${docType}
    
    INSTRUÇÕES ESTRUTURAIS ESPECÍFICAS:
    ${PROMPT_TEMPLATES[docType]}

    REGRAS DE FORMATAÇÃO E ESTILO:
    1. Use Markdown profissional.
    2. CITE A LEI: Sempre que afirmar uma obrigação ou direito, coloque "(conforme Art. X, Lei 14.133/21)".
    3. NÃO RESUMA: Escreva todas as cláusulas por extenso.
    4. Use linguagem clara, direta, mas formal.
    5. Destaque prazos, valores e obrigações críticas em **negrito**.
  `;

  try {
    const response = await ai.models.generateContentStream({
      model: modelId,
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4,
        topP: 0.95,
        topK: 40,
      }
    });

    for await (const chunk of response) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Error generating document:", error);
    throw error;
  }
};