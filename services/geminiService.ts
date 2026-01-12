import { GoogleGenAI } from "@google/genai";
import { DocumentType, FormData } from '../types';
import { PROMPT_TEMPLATES, SYSTEM_INSTRUCTION } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDocumentStream = async (
  docType: DocumentType,
  data: FormData,
  onChunk: (text: string) => void
) => {
  // Alterado para 'gemini-3-flash-preview' para máxima velocidade de resposta
  const modelId = 'gemini-3-flash-preview'; 

  // Somente ativa a busca do Google para tipos de documentos que exigem dados de mercado reais
  // Isso reduz drasticamente a latência inicial para outros documentos
  const needsSearch = docType === DocumentType.PESQUISA_PRECO || 
                      docType === DocumentType.ADESAO_ATA;

  const userPrompt = `
    DADOS DO PROCESSO ADMINISTRATIVO:
    -----------------------------------
    ÓRGÃO: ${data.organName}
    CIDADE/UF: ${data.city}
    MODALIDADE: ${data.modality}
    CRITÉRIO: ${data.judgmentCriteria}
    OBJETO: ${data.objectDescription}
    VALOR ESTIMADO: ${data.estimatedValue}
    JUSTIFICATIVA INICIAL: ${data.justification}
    OBSERVAÇÕES: ${data.additionalInfo}
    ${data.impugnmentText ? `\n--- TEXTO DA IMPUGNAÇÃO RECEBIDA: ---\n${data.impugnmentText}\n------------------` : ''}
    -----------------------------------

    COMANDO DE EXECUÇÃO:
    Atue como Consultor Jurídico Sênior do Governo. Redija o documento: **${docType}**.
    
    DIRETRIZES ESTRUTURAIS CRÍTICAS:
    1.  **BASE LEGAL:** Cite exaustivamente a Lei 14.133/2021.
    2.  **EXTENSÃO:** Escreva parágrafos robustos e bem fundamentados.
    3.  **OBJETIVIDADE TÉCNICA:** Seja assertivo e evite repetições desnecessárias para acelerar o processamento.
    ${needsSearch ? '4.  **DADOS REAIS:** Use a ferramenta de busca para encontrar preços ou atas vigentes no PNCP.' : ''}

    DETALHES ESPECÍFICOS DO TIPO DOCUMENTAL:
    ${PROMPT_TEMPLATES[docType]}
  `;

  try {
    const config: any = {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.2, // Reduzido ligeiramente para maior foco e velocidade
    };

    if (needsSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContentStream({
      model: modelId,
      contents: userPrompt,
      config: config
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