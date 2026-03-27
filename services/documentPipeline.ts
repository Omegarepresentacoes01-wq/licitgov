/**
 * documentPipeline.ts
 *
 * Pipeline completo de geração de documentos — 5 etapas em sequência:
 *
 *   1. EXTRAÇÃO   — LLM lê o texto e extrai campos estruturados (temp 0.0)
 *   2. VALIDAÇÃO  — verifica campos obrigatórios sem LLM
 *   3. ENRIQUECIMENTO — injeta leis verificadas + preços + sustentabilidade
 *   4. GERAÇÃO    — LLM gera o documento com dados reais (streaming)
 *   5. CHECKLIST  — verifica qualidade do output, score 0-100
 *
 * A IA NUNCA inventa dados. Se um campo não está no texto, o documento
 * escreve "A INFORMAR" — nunca um valor fabricado.
 */

import { DocumentType, FormData } from '../types';
import * as Client from './openrouterClient';
import { getLegalContext, getSustainabilityContext } from './enrichmentSources';
import { getDocumentConfig, SYSTEM_INSTRUCTION, ChecklistItem } from '../configs/documentConfigs';

// ─── Tipos do pipeline ────────────────────────────────────────────────────────

export interface PipelineResult {
  success: boolean;
  document?: string;
  qualityScore?: number;
  missingFields?: string[];
  failedChecks?: string[];
  error?: string;
  step?: string;
}

interface ExtractedData {
  dados_extraidos: Record<string, string | null>;
  campos_ausentes: string[];
  confianca: 'alta' | 'media' | 'baixa';
  observacoes: string;
}

// ─── ETAPA 1: Extração ────────────────────────────────────────────────────────

async function extract(
  rawInput: string,
  schema: Record<string, string>
): Promise<ExtractedData> {
  const fieldsList = Object.entries(schema)
    .map(([k, desc]) => `- ${k}: ${desc}`)
    .join('\n');

  const prompt = `Você é um extrator de dados para documentos de licitação brasileira.

Leia o texto abaixo e extraia APENAS as informações EXPLICITAMENTE presentes.

## CAMPOS A EXTRAIR:
${fieldsList}

## REGRAS ABSOLUTAS:
- Se uma informação NÃO estiver no texto: retorne null para aquele campo
- NUNCA infira, estime ou complete com conhecimento próprio
- NUNCA invente valores, nomes, números ou datas
- Retorne APENAS JSON válido, sem markdown ou texto adicional

## TEXTO DO USUÁRIO:
${rawInput}

## FORMATO DE SAÍDA (JSON puro):
{
  "dados_extraidos": {},
  "campos_ausentes": [],
  "confianca": "alta",
  "observacoes": ""
}`;

  const response = await Client.call({
    prompt,
    model: 'google/gemini-2.0-flash-001',
    temperature: 0.0,
    maxTokens: 3000,
  });

  const clean = response.text
    .replace(/^```(?:json)?\s*/im, '')
    .replace(/```$/m, '')
    .trim();

  try {
    const parsed = JSON.parse(clean);
    return {
      dados_extraidos: parsed.dados_extraidos ?? {},
      campos_ausentes: parsed.campos_ausentes ?? [],
      confianca: parsed.confianca ?? 'baixa',
      observacoes: parsed.observacoes ?? '',
    };
  } catch {
    return {
      dados_extraidos: {},
      campos_ausentes: Object.keys(schema),
      confianca: 'baixa',
      observacoes: `Falha no parse do JSON. Resposta bruta: ${response.text.slice(0, 200)}`,
    };
  }
}

// ─── ETAPA 2: Validação ───────────────────────────────────────────────────────

function validate(
  extracted: ExtractedData,
  requiredFields: string[]
): { valid: boolean; missing: string[] } {
  const missing = requiredFields.filter(field => {
    const value = extracted.dados_extraidos[field];
    return !value || value.trim() === '';
  });
  return { valid: missing.length === 0, missing };
}

// ─── ETAPA 3: Enriquecimento ──────────────────────────────────────────────────

async function enrich(
  extracted: ExtractedData,
  docType: DocumentType,
  objectDescription: string
): Promise<{ legal: string; market: string; sustainability: string }> {
  const legal = getLegalContext(docType);
  const sustainability = getSustainabilityContext(objectDescription);

  const objeto = (
    extracted.dados_extraidos.objeto_detalhado ||
    extracted.dados_extraidos.objeto ||
    extracted.dados_extraidos.objeto_resumido ||
    objectDescription
  )?.trim();

  let market = 'Dados de mercado não disponíveis. Indique "A INFORMAR" nos campos de preço e realize pesquisa formal conforme IN SEGES/ME 65/2021.';

  if (objeto && objeto.length > 10) {
    try {
      const priceResponse = await Client.call({
        prompt: `Você é assistente de pesquisa de preços para licitações públicas brasileiras.

## OBJETO:
${objeto}

## TAREFA:
Com base no seu conhecimento de contratos públicos brasileiros registrados no
Painel de Preços gov.br e PNCP, forneça uma faixa de referência de preços.

## REGRAS:
- Se não houver dados confiáveis: escreva "Preço de referência não localizado — necessária pesquisa formal conforme IN SEGES 65/2021"
- NUNCA invente valores sem base
- Indique grau de confiança: alto / médio / baixo

## FORMATO:
Preço mínimo: R$ ___
Preço máximo: R$ ___
Preço médio:  R$ ___
Confiança: ___
Fontes: ___`,
        model: 'google/gemini-2.0-flash-001',
        temperature: 0.0,
        maxTokens: 800,
      });
      market = priceResponse.text;
    } catch {
      // Falha silenciosa — o documento continua sem dados de mercado
    }
  }

  return { legal, market, sustainability };
}

// ─── ETAPA 4: Geração ─────────────────────────────────────────────────────────

async function generate(
  extracted: ExtractedData,
  missingFields: string[],
  context: { legal: string; market: string; sustainability: string },
  config: ReturnType<typeof getDocumentConfig>,
  onChunk: (chunk: string) => void
): Promise<string> {
  const prompt = config.buildMasterPrompt(
    extracted.dados_extraidos,
    missingFields,
    context.legal,
    context.market,
    context.sustainability
  );

  return Client.stream({
    prompt,
    system: SYSTEM_INSTRUCTION,
    model: 'google/gemini-2.5-pro',
    temperature: 0.35,
    maxTokens: 16384,
    onChunk,
  });
}

// ─── ETAPA 5: Checklist de qualidade ─────────────────────────────────────────

function runChecklist(
  document: string,
  checklist: ChecklistItem[]
): { score: number; passed: boolean; failedItems: string[] } {
  const lower = document.toLowerCase();
  const results = checklist.map(item => {
    let passed = false;

    switch (item.rule) {
      case 'not_blank':
        passed = document.length > 100;
        break;
      case 'min_words_50':
        passed = document.split(/\s+/).length >= 50;
        break;
      case 'min_words_100':
        passed = document.split(/\s+/).length >= 100;
        break;
      case 'positive_number':
        passed = /R\$\s*[\d.,]+/.test(document) || /\d+/.test(document);
        break;
      case 'has_table':
        passed = document.includes('|') && document.includes('---');
        break;
      case 'all_sections': {
        const sections = [
          'necessidade', 'planejamento', 'requisitos', 'quantidades',
          'mercado', 'valor', 'solução', 'parcelamento',
          'correlatas', 'ambiental', 'resultados', 'providências'
        ];
        const found = sections.filter(s => lower.includes(s)).length;
        passed = found >= 8;
        break;
      }
    }

    return { ...item, passed };
  });

  const totalWeight = results.reduce((sum, r) => sum + r.weight, 0);
  const earnedWeight = results.filter(r => r.passed).reduce((sum, r) => sum + r.weight, 0);
  const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
  const failedItems = results.filter(r => !r.passed).map(r => r.description);

  return { score, passed: score >= 70, failedItems };
}

// ─── Pipeline principal ───────────────────────────────────────────────────────

export async function runPipeline(
  docType: DocumentType,
  formData: FormData,
  onChunk: (chunk: string) => void
): Promise<PipelineResult> {

  const rawInput = [
    `Órgão: ${formData.organName}`,
    `Cidade/UF: ${formData.city}`,
    `Modalidade: ${formData.modality}`,
    `Critério de Julgamento: ${formData.judgmentCriteria}`,
    `Objeto: ${formData.objectDescription}`,
    `Valor Estimado: R$ ${formData.estimatedValue}`,
    `Justificativa: ${formData.justification}`,
    formData.additionalInfo ? `Informações Adicionais: ${formData.additionalInfo}` : '',
    formData.impugnmentText ? `Texto da Impugnação: ${formData.impugnmentText}` : '',
  ].filter(Boolean).join('\n');

  try {
    const config = getDocumentConfig(docType);

    // ── Etapa 1: Extração ──────────────────────────────────────────────────
    let extracted: ExtractedData;
    try {
      extracted = await extract(rawInput, config.extractionSchema);
    } catch (e: any) {
      return { success: false, error: `Falha na extração: ${e.message}`, step: 'extract' };
    }

    // ── Etapa 2: Validação ─────────────────────────────────────────────────
    const { missing } = validate(extracted, config.requiredFields);
    // Não bloqueia — documento prossegue com "A INFORMAR"

    // ── Etapa 3: Enriquecimento ────────────────────────────────────────────
    let context: { legal: string; market: string; sustainability: string };
    try {
      context = await enrich(extracted, docType, formData.objectDescription);
    } catch (e: any) {
      return { success: false, error: `Falha no enriquecimento: ${e.message}`, step: 'enrich' };
    }

    // ── Etapa 4: Geração ───────────────────────────────────────────────────
    let document: string;
    try {
      document = await generate(extracted, missing, context, config, onChunk);
    } catch (e: any) {
      return { success: false, error: `Falha na geração: ${e.message}`, step: 'generate' };
    }

    if (!document || document.trim().length < 100) {
      return { success: false, error: 'Documento gerado está vazio ou muito curto.', step: 'generate' };
    }

    // ── Etapa 5: Checklist ─────────────────────────────────────────────────
    const { score, failedItems } = runChecklist(document, config.checklist);

    return {
      success: true,
      document,
      qualityScore: score,
      missingFields: missing,
      failedChecks: failedItems,
    };

  } catch (e: any) {
    return {
      success: false,
      error: e.message ?? 'Erro desconhecido no pipeline.',
      step: 'unknown',
    };
  }
}
