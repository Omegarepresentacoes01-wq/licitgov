
import { GoogleGenAI } from "@google/genai";
import { DocumentType, FormData } from '../types';
import { PROMPT_TEMPLATES, SYSTEM_INSTRUCTION } from '../constants';

export const generateDocumentStream = async (
  docType: DocumentType,
  data: FormData,
  onChunk: (text: string) => void
) => {
  // Inicialização dentro da função para garantir que usa a chave mais atual do env
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // 'gemini-3-flash-preview' é significativamente mais rápido que o Pro para tarefas de texto
  const modelId = 'gemini-3-flash-preview'; 

  // Ativação inteligente de ferramentas para reduzir latência
  const needsSearch = docType === DocumentType.PESQUISA_PRECO || 
                      docType === DocumentType.ADESAO_ATA;

  const userPrompt = `
    DADOS DO PROCESSO:
    ÓRGÃO: ${data.organName}
    OBJETO: ${data.objectDescription}
    VALOR: ${data.estimatedValue}
    TIPO: ${docType}
    
    INSTRUÇÃO: Redija o documento completo conforme Lei 14.133/21. Seja extenso e técnico.
    ${needsSearch ? 'Use a ferramenta googleSearch para buscar preços/atas reais no PNCP.' : ''}

    TEMPLATES DE REFERÊNCIA:
    ${PROMPT_TEMPLATES[docType]}
  `;

  try {
    const config: any = {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.3,
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
    console.error("API Error:", error);
    // Repassa o erro detalhado para o App.tsx tratar
    throw error;
  }
};
