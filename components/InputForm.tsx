import React, { useState } from 'react';
import { FormData, DocumentType, ObjectType } from '../types';

interface InputFormProps {
  formData: FormData;
  onChange: (data: FormData) => void;
  onSubmit: () => void;
  isGenerating: boolean;
  selectedDoc: DocumentType;
}

const STEPS = [
  { id: 1, label: 'Instituição'   },
  { id: 2, label: 'Modalidade'    },
  { id: 3, label: 'Objeto'        },
  { id: 4, label: 'Justificativa' },
  { id: 5, label: 'Requisitos'    },
];

const MODALITIES = [
  'Pregão Eletrônico (Lei 14.133/21)',
  'Concorrência Eletrônica',
  'Dispensa de Licitação',
  'Inexigibilidade',
  'Credenciamento',
];

const CRITERIA = [
  'Menor Preço',
  'Maior Desconto',
  'Melhor Técnica ou Conteúdo Artístico',
  'Técnica e Preço',
  'Maior Retorno Econômico',
  'Maior Lance (Leilão)',
];

const OBJECT_TYPES: ObjectType[] = [
  'Bem / Material',
  'Serviço Comum',
  'Serviço de TI / Software',
  'Serviço Continuado',
  'Obra / Engenharia',
];

const fieldCls = 'w-full px-4 py-3 rounded-xl text-[13px] font-bold text-white border-2 border-white/15 outline-none transition-all placeholder-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20';
const fieldBg = { background: '#0f172a' };

const Label: React.FC<{ children: React.ReactNode; hint?: string; required?: boolean }> = ({ children, hint, required }) => (
  <div className="mb-2">
    <label className="block text-[13px] font-black text-white">
      {children}{required && <span className="text-primary-400 ml-0.5">*</span>}
    </label>
    {hint && <p className="text-[11px] font-bold text-slate-400 mt-0.5 leading-snug">{hint}</p>}
  </div>
);

const SelectWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative">
    {children}
    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
      </svg>
    </span>
  </div>
);

export const InputForm: React.FC<InputFormProps> = ({
  formData, onChange, onSubmit, isGenerating, selectedDoc,
}) => {
  const [step, setStep] = useState(1);
  const isPriceResearch = selectedDoc === DocumentType.PESQUISA_PRECO;
  const isDFD = selectedDoc === DocumentType.DFD;

  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    onChange({ ...formData, [e.target.name]: e.target.value });

  const valid = () => {
    if (step === 1) return !!formData.organName && !!formData.city;
    if (step === 2) return !!formData.modality && !!formData.judgmentCriteria;
    if (step === 3) return !!formData.objectDescription;
    if (step === 4) return isPriceResearch || !!formData.justification;
    if (step === 5) return !!formData.objectType;
    return false;
  };

  const isLast = step === STEPS.length;

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden border-2 border-white/12" style={{ background: '#1e293b' }}>

      {/* ── Header ─────────────────────── */}
      <div className="px-5 pt-5 pb-4 border-b-2 border-white/10 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[13px] font-black text-white uppercase tracking-widest">
              {isPriceResearch ? 'Pesquisa de Preços' : isDFD ? 'Demanda' : 'Novo Documento'}
            </h2>
            <p className="text-[11px] font-bold text-slate-400 mt-0.5">
              Passo {step} de {STEPS.length} — {STEPS[step - 1].label}
            </p>
          </div>
          <span className="text-[11px] font-black text-primary-400 bg-primary-500/10 border-2 border-primary-500/30 px-2.5 py-1 rounded-full">
            {Math.round((step / STEPS.length) * 100)}%
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {STEPS.map((s) => (
            <button key={s.id} onClick={() => s.id < step && setStep(s.id)} className="flex-1">
              <div className={`w-full h-1.5 rounded-full transition-all duration-300
                ${s.id < step ? 'bg-primary-500' : s.id === step ? 'bg-primary-400' : 'bg-white/10'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ───────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="space-y-5 animate-fadeIn">

          {step === 1 && (
            <>
              <div>
                <Label required>Nome do Órgão Público</Label>
                <input type="text" name="organName" value={formData.organName} onChange={set}
                  placeholder="Ex: Prefeitura Municipal de Cacoal/RO"
                  className={fieldCls} style={fieldBg} autoFocus />
              </div>
              <div>
                <Label required>Localidade (Cidade / UF)</Label>
                <input type="text" name="city" value={formData.city} onChange={set}
                  placeholder="Ex: Cacoal / RO"
                  className={fieldCls} style={fieldBg} />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <Label required>Modalidade de Licitação</Label>
                <SelectWrapper>
                  <select name="modality" value={formData.modality} onChange={set}
                    className={`${fieldCls} appearance-none pr-8 cursor-pointer`} style={fieldBg}>
                    <option value="" disabled>Selecione...</option>
                    {MODALITIES.map(m => <option key={m} style={{ background: '#1e293b' }}>{m}</option>)}
                  </select>
                </SelectWrapper>
              </div>
              <div>
                <Label required>Critério de Julgamento</Label>
                <SelectWrapper>
                  <select name="judgmentCriteria" value={formData.judgmentCriteria} onChange={set}
                    className={`${fieldCls} appearance-none pr-8 cursor-pointer`} style={fieldBg}>
                    <option value="" disabled>Selecione...</option>
                    {CRITERIA.map(c => <option key={c} style={{ background: '#1e293b' }}>{c}</option>)}
                  </select>
                </SelectWrapper>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <Label required hint={isPriceResearch ? 'Seja específico para melhorar a busca no PNCP.' : isDFD ? 'Descreva a necessidade do setor.' : 'Descreva o objeto com especificações técnicas.'}>
                  {isPriceResearch ? 'Itens a Cotar' : isDFD ? 'Necessidade da Demanda' : 'Objeto da Licitação'}
                </Label>
                <textarea name="objectDescription" value={formData.objectDescription} onChange={set} rows={6}
                  placeholder={isPriceResearch ? 'Liste os itens e quantidades...' : isDFD ? 'Descreva a necessidade do setor...' : 'Descreva o item ou serviço com requisitos técnicos...'}
                  className={`${fieldCls} resize-none leading-relaxed`} style={fieldBg} autoFocus />
              </div>
              <div>
                <Label hint="Valor total estimado para a contratação.">Valor Estimado Total</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black select-none text-sm">R$</span>
                  <input type="text" name="estimatedValue" value={formData.estimatedValue} onChange={set}
                    placeholder="0,00" className={`${fieldCls} pl-10`} style={fieldBg} />
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div>
                <Label required={!isPriceResearch} hint={isPriceResearch ? 'Defina fontes prioritárias (Painel de Preços, PNCP).' : isDFD ? 'Como esta compra se alinha ao PCA?' : 'Fundamente a necessidade para o interesse público.'}>
                  {isPriceResearch ? 'Parâmetros e Fontes' : isDFD ? 'Alinhamento ao PCA' : 'Justificativa da Contratação'}
                </Label>
                <textarea name="justification" value={formData.justification} onChange={set} rows={5}
                  placeholder={isPriceResearch ? 'Ex: Priorizar Painel de Preços gov.br...' : isDFD ? 'Ex: Previsto no PCA 2025...' : 'Ex: A ausência desse serviço compromete...'}
                  className={`${fieldCls} resize-none leading-relaxed`} style={fieldBg} autoFocus />
              </div>
              <div>
                <Label hint="Prazos, garantias, número do processo, exigências específicas.">Informações Adicionais (opcional)</Label>
                <textarea name="additionalInfo" value={formData.additionalInfo} onChange={set} rows={3}
                  placeholder="Ex: Processo nº 12474/2025. Prazo de entrega 30 dias..."
                  className={`${fieldCls} resize-none`} style={fieldBg} />
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <div>
                <Label required hint="Define o regime jurídico aplicável (Art. 6º, Lei 14.133/21).">Tipo de Objeto</Label>
                <SelectWrapper>
                  <select name="objectType" value={formData.objectType} onChange={set}
                    className={`${fieldCls} appearance-none pr-8 cursor-pointer`} style={fieldBg}>
                    <option value="" disabled>Selecione o tipo...</option>
                    {OBJECT_TYPES.map(t => <option key={t} style={{ background: '#1e293b' }}>{t}</option>)}
                  </select>
                </SelectWrapper>
              </div>

              <div>
                <Label hint="Ano — nº do contrato — quantidade — valor pago. Fundamenta a estimativa no ETP/TR.">Histórico de Consumo (últimos 3 anos)</Label>
                <textarea name="consumptionHistory" value={formData.consumptionHistory} onChange={set} rows={4}
                  placeholder={`2023 — Contrato 12/2023 — 500 un. — R$ 12.500,00\n2024 — Contrato 08/2024 — 600 un. — R$ 15.600,00\n2025 — (em andamento)`}
                  className={`${fieldCls} resize-none font-mono text-[12px] leading-relaxed`} style={fieldBg} />
              </div>

              <div>
                <Label hint="Aplicável a sistemas de TI (IN SGD 94/2022) e bens de alta complexidade.">Exige Prova de Conceito (PoC) ou Amostra?</Label>
                <div className="flex gap-2">
                  {(['nao', 'sim'] as const).map(val => (
                    <label key={val} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 cursor-pointer transition-all text-[13px] font-black select-none
                      ${formData.requiresPoC === val
                        ? val === 'sim' ? 'border-primary-500 bg-primary-500/10 text-primary-400' : 'border-white/30 bg-white/8 text-white'
                        : 'border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300'}`}>
                      <input type="radio" name="requiresPoC" value={val} checked={formData.requiresPoC === val} onChange={set} className="sr-only"/>
                      {val === 'sim' ? '✓ Sim' : '✗ Não'}
                    </label>
                  ))}
                </div>
                {formData.requiresPoC === 'sim' && (
                  <textarea name="pocDescription" value={formData.pocDescription} onChange={set} rows={3}
                    placeholder="Critérios: o que será avaliado, prazo, avaliadores, nota mínima..."
                    className={`${fieldCls} resize-none mt-2 leading-relaxed`} style={fieldBg} />
                )}
              </div>

              <div>
                <Label hint="Informe SLAs, certificações, penalidades e cláusulas específicas que devem constar no documento.">O que precisa constar no documento?</Label>
                <textarea name="customRequirements" value={formData.customRequirements} onChange={set} rows={5}
                  placeholder="Ex: SLA de 4h para chamados críticos. Certificação ISO 27001. Vigência 12 meses renováveis por até 48. Multa de 10%..."
                  className={`${fieldCls} resize-none leading-relaxed`} style={fieldBg} />
              </div>
            </>
          )}

        </div>
      </div>

      {/* ── Footer ─────────────────────── */}
      <div className="px-5 py-4 border-t-2 border-white/10 flex gap-2.5 shrink-0" style={{ background: 'rgba(0,0,0,0.25)' }}>
        <button
          onClick={() => setStep(s => s - 1)}
          disabled={step === 1 || isGenerating}
          className={`px-4 py-2.5 rounded-xl text-[13px] font-black border-2 transition-all
            ${step === 1 || isGenerating
              ? 'border-white/8 text-slate-600 cursor-not-allowed'
              : 'border-white/20 text-slate-300 hover:bg-white/8 hover:text-white hover:border-white/30'}`}
        >
          ← Voltar
        </button>

        {!isLast ? (
          <button onClick={() => setStep(s => s + 1)} disabled={!valid()}
            className={`flex-1 py-2.5 rounded-xl text-[13px] font-black text-white transition-all border-2
              ${!valid() ? 'border-white/8 bg-white/5 cursor-not-allowed text-slate-500' : 'bg-primary-500 hover:bg-primary-600 border-primary-400 shadow-lg shadow-primary-500/20'}`}>
            Próximo →
          </button>
        ) : (
          <button onClick={onSubmit} disabled={!valid() || isGenerating}
            className={`flex-1 py-2.5 rounded-xl text-[13px] font-black text-white transition-all flex items-center justify-center gap-2 border-2
              ${!valid() || isGenerating ? 'border-white/8 bg-white/5 cursor-not-allowed text-slate-500' : 'bg-primary-500 hover:bg-primary-600 border-primary-400 shadow-lg shadow-primary-500/25 hover:-translate-y-px'}`}>
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Gerando...
              </>
            ) : isPriceResearch ? 'Pesquisar no PNCP' : 'Gerar Documento'}
          </button>
        )}
      </div>
    </div>
  );
};
