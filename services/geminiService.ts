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

  // Wrapper que reforça a persona e a necessidade de citações a cada execução
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
    Atue como Consultor Jurídico Sênior. Redija o documento: **${docType}**.
    
    DIRETRIZES ESTRUTURAIS CRÍTICAS:
    1.  **JURISPRUDÊNCIA:** O documento DEVE conter citações diretas ou indiretas de Acórdãos do TCU, Súmulas ou entendimentos doutrinários relevantes ao objeto.
    2.  **BASE LEGAL:** Cite exaustivamente a Lei 14.133/2021 (Artigos, incisos).
    3.  **EXTENSÃO:** Escreva parágrafos longos, bem fundamentados e conectados. Nada de textos curtos ou superficiais.
    4.  **PROPRIEDADE:** Use termos como "Vantajosidade", "Economicidade", "Isonomia", "Vinculação ao Instrumento Convocatório".
    5.  **LINKS E FONTES:** Para pesquisas de preço ou adesões, é OBRIGATÓRIO fornecer o LINK da fonte consultada para transparência.

    DETALHES ESPECÍFICOS DO TIPO DOCUMENTAL:
    ${PROMPT_TEMPLATES[docType]}
  `;

  try {
    const response = await ai.models.generateContentStream({
      model: modelId,
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3, // Baixa temperatura para maior rigor técnico e factualidade
        topP: 0.8,
        topK: 40,
        // Habilita busca no Google para encontrar preços reais e links no PNCP
        tools: [{ googleSearch: {} }],
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