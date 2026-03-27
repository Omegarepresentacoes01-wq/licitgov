/**
 * CloneDocument.tsx
 *
 * Funcionalidade de Clone de Documento:
 * 1. Usuário anexa um documento (PDF, DOCX, TXT, MD)
 * 2. O sistema extrai o texto completo (client-side, sem API)
 * 3. Usuário descreve em linguagem natural o que quer modificar
 * 4. A IA gera um documento idêntico com as modificações aplicadas
 *    — documentos longos são divididos em seções para não cortar no meio
 */

import React, { useState, useRef, useCallback } from 'react';
import * as Client from '../services/openrouterClient';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString();

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CloneDocumentProps {
  onResult: (content: string) => void;
  onGenerating: (isGenerating: boolean) => void;
  isGenerating: boolean;
}

type Step = 'upload' | 'prompt' | 'generating';
const STEPS: Step[] = ['upload', 'prompt', 'generating'];

// ─── Prompts do sistema ───────────────────────────────────────────────────────

const CLONE_SYSTEM_PROMPT = `Você é um especialista em documentos de licitação pública brasileira (Lei 14.133/2021).

MISSÃO: Receber um documento original e aplicar EXATAMENTE as modificações solicitadas pelo usuário,
mantendo toda a estrutura, formatação, linguagem jurídica e conteúdo restante IDÊNTICOS ao original.

REGRAS ABSOLUTAS:
1. Preserve 100% do conteúdo que NÃO foi mencionado nas modificações
2. Aplique APENAS as modificações explicitamente solicitadas
3. Mantenha a formatação Markdown original (cabeçalhos, tabelas, listas)
4. Mantenha o mesmo tom jurídico, vocabulário e estrutura de parágrafos
5. Se uma modificação for ambígua, aplique a interpretação mais conservadora
6. NÃO adicione conteúdo novo além do solicitado
7. NÃO remova conteúdo além do explicitamente pedido
8. O documento clonado deve parecer ter sido editado por um humano especialista
9. NUNCA pare no meio do documento — gere o texto COMPLETO até o final`;

function buildClonePrompt(docText: string, modifications: string, totalParts?: number, partNumber?: number): string {
  const partInfo = totalParts && totalParts > 1
    ? `\n⚠️ DOCUMENTO LONGO — Esta é a PARTE ${partNumber} de ${totalParts}. Processe esta seção completamente.`
    : '';

  return `## DOCUMENTO ORIGINAL${totalParts && totalParts > 1 ? ` (PARTE ${partNumber}/${totalParts})` : ''}:
${docText}

---

## MODIFICAÇÕES A APLICAR (em TODO o documento):
${modifications}
${partInfo}

---

## INSTRUÇÕES CRÍTICAS:
- Gere o documento COMPLETO, sem parar no meio
- Mantenha TODA a estrutura, parágrafos e formatação originais
- Aplique as modificações onde aparecerem nesta seção
- NÃO resuma nem omita nenhuma parte
- Comece DIRETO pelo conteúdo — sem preâmbulos`;
}

function buildContinuationPrompt(
  sectionText: string, modifications: string,
  partNumber: number, totalParts: number, isLast: boolean,
): string {
  return `## CONTINUAÇÃO DO DOCUMENTO (PARTE ${partNumber}/${totalParts}):
${sectionText}

---

## MODIFICAÇÕES A APLICAR (as mesmas do documento inteiro):
${modifications}

---

## INSTRUÇÕES:
- Continue o documento a partir deste ponto sem repetir o que já foi gerado
- Aplique as modificações onde aparecerem nesta seção
- Mantenha a formatação e linguagem idênticas às partes anteriores
- NÃO adicione cabeçalhos de "continuação" — apenas o conteúdo
${isLast ? '- Esta é a ÚLTIMA PARTE — certifique-se de incluir conclusão e assinaturas se existirem' : ''}`;
}

// ─── Divisão em seções lógicas ────────────────────────────────────────────────

function splitIntoSections(text: string, maxCharsPerSection = 12_000): string[] {
  if (text.length <= maxCharsPerSection) return [text];

  const sections: string[] = [];
  const sectionBreaks = text.split(/(?=\n#{1,3}\s|\n\d+\.\s+[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ])/);

  let current = '';
  for (const part of sectionBreaks) {
    if ((current + part).length > maxCharsPerSection && current.length > 0) {
      sections.push(current.trim());
      current = part;
    } else {
      current += part;
    }
  }
  if (current.trim()) sections.push(current.trim());

  // Fallback: corte por parágrafos se não dividiu bem
  if (sections.length === 1 && text.length > maxCharsPerSection) {
    sections.length = 0;
    current = '';
    for (const para of text.split(/\n\n+/)) {
      if ((current + para).length > maxCharsPerSection && current.length > 0) {
        sections.push(current.trim());
        current = para + '\n\n';
      } else {
        current += para + '\n\n';
      }
    }
    if (current.trim()) sections.push(current.trim());
  }

  return sections.filter(s => s.length > 0);
}

// ─── Extração de texto ────────────────────────────────────────────────────────

async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const parts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    parts.push(content.items.map((item: any) => item.str).join(' '));
  }
  return parts.join('\n');
}

async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(buffer);
  const xmlFile = zip.file('word/document.xml');
  if (!xmlFile) throw new Error('word/document.xml não encontrado no DOCX.');
  const xml = await xmlFile.async('string');
  return xml
    .replace(/<\/w:p>/g, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/\s{2,}/g, ' ')
    .trim();
}

async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

  if (ext === 'txt' || ext === 'md') return file.text();

  const buffer = await file.arrayBuffer();

  if (ext === 'pdf') {
    const text = await extractPdfText(buffer);
    if (!text.trim()) throw new Error('Não foi possível extrair texto do PDF. O arquivo pode ser escaneado (imagem).');
    return text;
  }

  if (ext === 'docx' || ext === 'doc') {
    const text = await extractDocxText(buffer);
    if (text.length < 50) throw new Error('Texto extraído muito curto. Tente salvar o DOCX como PDF ou TXT.');
    return text;
  }

  throw new Error(`Formato ".${ext}" não suportado. Use PDF, DOCX, TXT ou MD.`);
}

// ─── Exemplos de prompts ──────────────────────────────────────────────────────

const PROMPT_EXAMPLES = [
  'Substituir o nome do órgão "Prefeitura de Porto Velho" por "Prefeitura de Manaus"',
  'Remover o item 4.2 sobre garantia contratual',
  'Atualizar a data de elaboração para 15 de março de 2025',
  'Substituir o valor estimado R$ 2.000.000,00 por R$ 1.500.000,00',
  'Trocar o nome do elaborador "João Silva" por "Maria Santos" e a matrícula 12345 por 67890',
  'Atualizar o prazo de vigência de 12 meses para 24 meses',
  'Alterar o município de Porto Velho/RO para Curitiba/PR',
];

// ─── Componente ───────────────────────────────────────────────────────────────

export const CloneDocument: React.FC<CloneDocumentProps> = ({
  onResult,
  onGenerating,
  isGenerating,
}) => {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [modificationPrompt, setModificationPrompt] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stepIndex = STEPS.indexOf(step);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setError('');
    setFile(selectedFile);
    setIsExtracting(true);

    try {
      const text = await extractTextFromFile(selectedFile);
      if (!text || text.trim().length < 50)
        throw new Error('Não foi possível extrair texto suficiente do arquivo.');
      setExtractedText(text);
      setCharCount(text.length);
      setStep('prompt');
    } catch (e: any) {
      setError(e.message ?? 'Erro ao ler o arquivo.');
      setFile(null);
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  }, [handleFileSelect]);

  const handleClone = useCallback(async () => {
    if (!modificationPrompt.trim()) {
      setError('Descreva as modificações que deseja fazer no documento.');
      return;
    }
    if (!extractedText) {
      setError('Texto do documento não foi extraído corretamente.');
      return;
    }

    setError('');
    setStep('generating');
    onGenerating(true);

    try {
      let fullDocument = '';
      const sections = splitIntoSections(extractedText);
      const totalSections = sections.length;

      for (let i = 0; i < sections.length; i++) {
        const isFirst = i === 0;
        const isLast = i === sections.length - 1;

        const prompt = isFirst
          ? buildClonePrompt(sections[i], modificationPrompt, totalSections, i + 1)
          : buildContinuationPrompt(sections[i], modificationPrompt, i + 1, totalSections, isLast);

        await Client.stream({
          prompt,
          system: CLONE_SYSTEM_PROMPT,
          model: 'google/gemini-2.5-pro',
          temperature: 0.1,
          maxTokens: 32_000,
          onChunk: (chunk) => {
            fullDocument += chunk;
            onResult(fullDocument);
          },
        });

        if (!isLast) await new Promise(r => setTimeout(r, 500));
      }
    } catch (e: any) {
      setError(`Erro na geração: ${e.message}`);
      setStep('prompt');
    } finally {
      onGenerating(false);
    }
  }, [extractedText, modificationPrompt, onResult, onGenerating]);

  const handleReset = () => {
    setStep('upload');
    setFile(null);
    setExtractedText('');
    setModificationPrompt('');
    setError('');
    setCharCount(0);
  };

  return (
    <div className="rounded-2xl border-2 border-white/10 h-full flex flex-col overflow-hidden" style={{ background: '#1e293b' }}>

      {/* Header */}
      <div className="px-5 py-4 border-b-2 border-white/10 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[15px] font-black text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
              Clone de Documento
            </h2>
            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
              Anexe um documento e descreva as modificações
            </p>
          </div>
          {step !== 'upload' && (
            <button
              onClick={handleReset}
              className="text-[11px] font-bold text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg border-2 border-white/10 hover:border-white/20"
            >
              Novo clone
            </button>
          )}
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => {
            const si = STEPS.indexOf(step);
            const done = si > i;
            const active = si === i;
            return (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1.5 ${active ? 'opacity-100' : done ? 'opacity-70' : 'opacity-30'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black
                    ${active ? 'bg-primary-500 text-white' : done ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-400'}`}>
                    {done ? '✓' : i + 1}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                    {s === 'upload' ? 'Anexar' : s === 'prompt' ? 'Modificar' : 'Gerando'}
                  </span>
                </div>
                {i < 2 && <div className="flex-1 h-px bg-white/10"/>}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5">

        {/* STEP 1: Upload */}
        {step === 'upload' && (
          <div className="space-y-4">
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all
                ${isDragging
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-white/20 hover:border-primary-500/60 hover:bg-primary-500/5'}`}
            >
              {isExtracting ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"/>
                  <p className="text-sm font-bold text-primary-300">Extraindo texto do documento...</p>
                </div>
              ) : (
                <>
                  <svg className="w-10 h-10 text-slate-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                  </svg>
                  <p className="font-black text-white text-sm mb-1">Arraste o documento aqui ou clique</p>
                  <p className="text-xs text-slate-400">PDF, DOCX, TXT ou MD</p>
                  <div className="mt-4 inline-flex items-center gap-2 bg-primary-500 text-white text-xs font-black px-4 py-2 rounded-lg">
                    Selecionar arquivo
                  </div>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt,.md"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
            />

            <div className="rounded-xl border-2 border-white/10 bg-white/5 p-4">
              <p className="text-xs font-black text-slate-400 mb-2">Como funciona</p>
              <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside font-semibold">
                <li>Anexe um ETP, DFD, TR ou qualquer documento de licitação</li>
                <li>Descreva em linguagem natural o que quer mudar</li>
                <li>A IA gera o documento idêntico com suas modificações</li>
              </ol>
            </div>
          </div>
        )}

        {/* STEP 2: Prompt */}
        {step === 'prompt' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
              <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
              </svg>
              <div className="min-w-0">
                <p className="text-xs font-black text-emerald-400 truncate">{file?.name}</p>
                <p className="text-[10px] font-semibold text-emerald-500">
                  {charCount.toLocaleString('pt-BR')} caracteres extraídos
                  {charCount > 12_000 && ' — será processado em partes'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Descreva as modificações
              </label>
              <textarea
                value={modificationPrompt}
                onChange={e => setModificationPrompt(e.target.value)}
                rows={8}
                placeholder="Exemplos:&#10;• Substituir o nome do órgão 'Prefeitura A' por 'Prefeitura B'&#10;• Remover o item 4.2 sobre garantia&#10;• Atualizar a data para 15/03/2025&#10;• Trocar o valor de R$ 2.000.000,00 por R$ 1.500.000,00"
                className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl focus:border-primary-500 outline-none resize-none text-white placeholder-slate-500 text-sm leading-relaxed font-semibold transition-colors"
                autoFocus
              />
              <p className="text-[10px] font-semibold text-slate-500 mt-1">
                Seja específico. Quanto mais detalhado, mais precisa será a modificação.
              </p>
            </div>

            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Exemplos rápidos</p>
              <div className="flex flex-col gap-1.5">
                {PROMPT_EXAMPLES.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setModificationPrompt(prev => prev ? `${prev}\n• ${ex}` : `• ${ex}`)}
                    className="text-left text-xs font-semibold text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 px-2 py-1 rounded-lg transition-colors border border-primary-500/20 hover:border-primary-500/40 truncate"
                  >
                    + {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Generating */}
        {step === 'generating' && (
          <div className="flex flex-col items-center justify-center h-full gap-6 py-10">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-primary-500/20 rounded-full"/>
              <div className="absolute inset-0 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"/>
            </div>
            <div className="text-center">
              <p className="font-black text-white">Clonando documento...</p>
              <p className="text-xs font-semibold text-slate-400 mt-1">
                {charCount > 12_000
                  ? `Documento longo (${(charCount / 1000).toFixed(0)}k chars) — processando em ${splitIntoSections(extractedText).length} partes`
                  : 'Aplicando modificações com fidelidade ao original'}
              </p>
            </div>
            <div className="w-full max-w-xs rounded-xl border-2 border-white/10 bg-white/5 p-3">
              <p className="text-[10px] font-semibold text-slate-400 italic line-clamp-3">
                "{modificationPrompt.slice(0, 120)}{modificationPrompt.length > 120 ? '…' : ''}"
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-xl border-2 border-red-500/40 bg-red-900/20 px-4 py-3">
            <p className="text-xs font-bold text-red-300">{error}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t-2 border-white/10 shrink-0">
        {step === 'upload' && (
          <p className="text-xs text-center font-semibold text-slate-500">Selecione um arquivo para começar</p>
        )}
        {step === 'prompt' && (
          <button
            onClick={handleClone}
            disabled={!modificationPrompt.trim() || isGenerating}
            className={`w-full py-3.5 rounded-xl font-black text-sm transition-all border-2 flex items-center justify-center gap-2
              ${!modificationPrompt.trim() || isGenerating
                ? 'opacity-40 cursor-not-allowed border-white/10 text-slate-400'
                : 'bg-primary-500 border-primary-400 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/30 cursor-pointer'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            Gerar Clone com Modificações
          </button>
        )}
        {step === 'generating' && (
          <p className="text-xs text-center font-semibold text-slate-400 animate-pulse">
            O documento está sendo gerado no painel ao lado...
          </p>
        )}
      </div>
    </div>
  );
};
