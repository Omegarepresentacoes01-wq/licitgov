
import { GoogleGenAI } from "@google/genai";
import { DocumentType, FormData } from '../types';
import { PROMPT_TEMPLATES, SYSTEM_INSTRUCTION } from '../constants';

export const generateDocumentStream = async (
  docType: DocumentType,
  data: FormData,
  onChunk: (text: string) => void
) => {
  // Inicialização com a chave do ambiente
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  /**
   * UPGRADE PARA GEMINI 3 PRO
   * Ideal para tarefas complexas de raciocínio jurídico e STEM.
   * Mais lento que o Flash, porém muito mais preciso e profundo.
   */
  const modelId = 'gemini-3-pro-preview'; 

  const needsSearch = docType === DocumentType.PESQUISA_PRECO || 
                      docType === DocumentType.ADESAO_ATA;

  const userPrompt = `
    DADOS DO PROCESSO ADMINISTRATIVO:
    ÓRGÃO: ${data.organName}
    OBJETO: ${data.objectDescription}
    VALOR: ${data.estimatedValue}
    DOCUMENTO ALVO: ${docType}
    
    INSTRUÇÃO DE ALTA PERFORMANCE:
    Como Auditor do TCU, redija este documento com profundidade máxima. 
    Analise os riscos, a viabilidade e a fundamentação na Lei 14.133/21.
    Não resuma. Use linguagem jurídica solene.

    ESTRUTURA DE REFERÊNCIA:
    ${PROMPT_TEMPLATES[docType]}
  `;

  try {
    const config: any = {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.4, // Aumentado levemente para permitir maior fluidez textual no Pro
      /**
       * THINKING CONFIG: 
       * Permite que o modelo 'pense' antes de responder.
       * O budget de 16000 tokens garante uma análise jurídica profunda.
       */
      thinkingConfig: { thinkingBudget: 16000 }
    };

    if (needsSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContentStream({
      model: modelId,
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      config: config
    });

    for await (const chunk of response) {
      const text = chunk.text;
      if (text) {
        onChunk(text);
      }
    }
  } catch (error: any) {
    console.error("API Pro Error:", error);
    throw error;
  }
};
