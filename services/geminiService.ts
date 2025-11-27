import { GoogleGenAI } from "@google/genai";
import { DocumentType, FormData } from '../types';
import { PROMPT_TEMPLATES, SYSTEM_INSTRUCTION } from '../constants';

// Initialize the API client
// Note: In a production environment, this should be handled securely.
// Using process.env.API_KEY as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDocumentStream = async (
  docType: DocumentType,
  data: FormData,
  onChunk: (text: string) => void
) => {
  const modelId = 'gemini-2.5-flash'; 

  const userPrompt = `
    INFORMAÇÕES DO PROCESSO:
    Órgão Público: ${data.organName}
    Cidade/Estado: ${data.city}
    Modalidade da Licitação: ${data.modality}
    Critério de Julgamento: ${data.judgmentCriteria}
    Objeto da Licitação: ${data.objectDescription}
    Justificativa: ${data.justification}
    Valor Estimado: ${data.estimatedValue}
    Informações Adicionais: ${data.additionalInfo}

    TAREFA:
    ${PROMPT_TEMPLATES[docType]}

    Gere o conteúdo em formato Markdown bem estruturado. Use títulos (##), listas e negrito para destacar seções importantes.
  `;

  try {
    const response = await ai.models.generateContentStream({
      model: modelId,
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4, // Lower temperature for more consistent/legal output
        maxOutputTokens: 8192, // High limit for long legal documents
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