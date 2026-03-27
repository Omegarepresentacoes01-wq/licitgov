/**
 * geminiService.ts — REFATORADO
 *
 * Interface fina que delega para o documentPipeline.
 * Mantido com o mesmo nome para não quebrar importações existentes.
 * Pipeline completo: services/documentPipeline.ts
 */

import { DocumentType, FormData } from '../types';
import { runPipeline } from './documentPipeline';

export const generateDocumentStream = async (
  docType: DocumentType,
  data: FormData,
  _modelId: string,
  onChunk: (text: string) => void
): Promise<void> => {
  const result = await runPipeline(docType, data, onChunk);

  if (!result.success) {
    throw new Error(result.error ?? 'Falha na geração do documento.');
  }

  if (result.qualityScore !== undefined) {
    console.info(`[LicitGov] Score de qualidade: ${result.qualityScore}/100`);
  }
  if (result.missingFields && result.missingFields.length > 0) {
    console.warn(`[LicitGov] Campos ausentes: ${result.missingFields.join(', ')}`);
  }
  if (result.failedChecks && result.failedChecks.length > 0) {
    console.warn(`[LicitGov] Verificações falhadas: ${result.failedChecks.join(', ')}`);
  }
};
