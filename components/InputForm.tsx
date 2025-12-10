import React, { useState } from 'react';
import { FormData, DocumentType } from '../types';

interface InputFormProps {
  formData: FormData;
  onChange: (data: FormData) => void;
  onSubmit: () => void;
  isGenerating: boolean;
  isSidebarOpen?: boolean;
  selectedDoc: DocumentType;
}

const STEPS = [
  { id: 1, title: 'Institucional', description: 'Dados do Órgão' },
  { id: 2, title: 'Modalidade', description: 'Regras Legais' },
  { id: 3, title: 'Objeto', description: 'O que será contratado' },
  { id: 4, title: 'Finalização', description: 'Justificativa e Detalhes' }
];

const MODALITIES = [
  'Pregão Eletrônico (Lei 14.133/21)',
  'Concorrência Eletrônica',
  'Dispensa de Licitação',
  'Inexigibilidade',
  'Credenciamento'
];

const CRITERIA = [
  'Menor Preço',
  'Maior Desconto',
  'Melhor Técnica ou Conteúdo Artístico',
  'Técnica e Preço',
  'Maior Retorno Econômico',
  'Maior Lance (Leilão)'
];

export const InputForm: React.FC<InputFormProps> = ({ formData, onChange, onSubmit, isGenerating, selectedDoc }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const isImpugnment = selectedDoc === DocumentType.IMPUGNACAO;
  const isPriceResearch = selectedDoc === DocumentType.PESQUISA_PRECO;
  const isAdhesion = selectedDoc === DocumentType.ADESAO_ATA;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ ...formData, [name]: value });
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) setCurrentStep(c => c + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(c => c - 1);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return !!formData.organName && !!formData.city;
      case 2: return !!formData.modality && !!formData.judgmentCriteria;
      case 3: return !!formData.objectDescription;
      case 4: return isImpugnment ? !!formData.impugnmentText : (isPriceResearch ? true : (isAdhesion ? true : !!formData.justification));
      default: return false;
    }
  };

  return (
    <div className="bg-white dark:bg-navy-surface rounded-xl shadow-soft border border-slate-200 dark:border-white/5 h-full flex flex-col overflow-hidden">
      
      {/* Header Corporativo */}
      <div className="px-6 py-5 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-navy-800/50">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 font-sans">
           {isImpugnment ? 'Advogado Virtual (Defesa)' : isPriceResearch ? 'Analista de Mercado' : isAdhesion ? 'Gestão de Caronas (Adesão)' : 'Assistente de Criação'}
        </h2>
        
        {/* Progress Bar Limpa */}
        <div className="flex items-center justify-between gap-2">
            {STEPS.map((step) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;
                
                return (
                    <div key={step.id} className="flex flex-col items-center flex-1">
                         <div className={`
                            w-full h-1.5 rounded-full mb-2 transition-colors duration-300
                            ${isActive ? 'bg-primary-500' : isCompleted ? 'bg-primary-300/50' : 'bg-slate-200 dark:bg-navy-700'}
                         `}></div>
                         <span className={`text-[10px] font-bold uppercase tracking-wide font-sans ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`}>
                             Passo {step.id}
                         </span>
                    </div>
                )
            })}
        </div>
      </div>

      {/* Form Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 scroll-smooth bg-white dark:bg-navy-surface">
        <div className="max-w-xl mx-auto space-y-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white border-l-4 border-primary-500 pl-3 font-sans">
                {currentStep === 4 && isAdhesion 
                  ? 'Dados da Ata de Origem' 
                  : currentStep === 4 && isImpugnment 
                  ? 'Argumentação da Empresa'
                  : STEPS[currentStep - 1].title
                }
                <span className="block text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">{STEPS[currentStep - 1].description}</span>
            </h3>

            {/* STEP 1 */}
            {currentStep === 1 && (
            <div className="space-y-5 animate-fadeIn">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-sans">Nome do Órgão Público</label>
                    <input
                        type="text"
                        name="organName"
                        value={formData.organName}
                        onChange={handleChange}
                        placeholder="Ex: Prefeitura Municipal de..."
                        className="w-full px-4 py-3 bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 font-sans"
                        autoFocus
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-sans">Localidade (Cidade/UF)</label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Cidade / UF"
                        className="w-full px-4 py-3 bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 font-sans"
                    />
                </div>
            </div>
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
            <div className="space-y-5 animate-fadeIn">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-sans">Modalidade de Licitação</label>
                    <div className="relative">
                        <select
                            name="modality"
                            value={formData.modality}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white cursor-pointer appearance-none font-sans"
                        >
                            <option value="" disabled>Selecione...</option>
                            {MODALITIES.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                             <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-sans">Critério de Julgamento</label>
                    <div className="relative">
                        <select
                            name="judgmentCriteria"
                            value={formData.judgmentCriteria}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white cursor-pointer appearance-none font-sans"
                        >
                            <option value="" disabled>Selecione...</option>
                            {CRITERIA.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                             <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>
            </div>
            )}

            {/* STEP 3 */}
            {currentStep === 3 && (
            <div className="space-y-5 animate-fadeIn">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-sans">
                      {isImpugnment ? 'Objeto Impugnado (Resumo)' : isPriceResearch ? 'Itens a Cotar (Seja Específico)' : isAdhesion ? 'Item para Adesão (Carona)' : 'Objeto da Licitação'}
                    </label>
                    <textarea
                        name="objectDescription"
                        value={formData.objectDescription}
                        onChange={handleChange}
                        rows={6}
                        placeholder={
                            isImpugnment 
                            ? "Descreva resumidamente o objeto da licitação que está sendo atacado..." 
                            : isPriceResearch 
                            ? "IMPORTANTE: Para uma busca no PNCP, seja específico. Ex: 'Notebook Dell i7 16GB' em vez de apenas 'Computador'. Liste os itens e quantidades."
                            : isAdhesion
                            ? "Ex: Notebooks i7, Veículos tipo sedan, Mobiliário Escolar. Descreva o objeto que você deseja contratar via adesão."
                            : "Descreva detalhadamente o item, serviço ou obra..."
                        }
                        className="w-full px-4 py-3 bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none transition-all text-slate-900 dark:text-white placeholder-slate-400 font-serif leading-relaxed"
                        autoFocus
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-sans">Valor Estimado Total</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold font-sans">R$</span>
                        <input
                            type="text"
                            name="estimatedValue"
                            value={formData.estimatedValue}
                            onChange={handleChange}
                            placeholder="0,00"
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 font-sans"
                        />
                    </div>
                </div>
            </div>
            )}

            {/* STEP 4 */}
            {currentStep === 4 && (
            <div className="space-y-5 animate-fadeIn">
                {isImpugnment ? (
                   <div>
                       <label className="block text-sm font-bold text-primary-600 dark:text-primary-400 mb-2 font-sans flex items-center gap-2">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                           Texto da Impugnação (Copie e Cole)
                       </label>
                       <textarea
                           name="impugnmentText"
                           value={formData.impugnmentText || ''}
                           onChange={handleChange}
                           rows={8}
                           placeholder="Cole aqui o texto enviado pela empresa com os argumentos da impugnação. O assistente irá analisar e contra-argumentar juridicamente."
                           className="w-full px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none transition-all text-slate-900 dark:text-white placeholder-slate-400 font-serif leading-relaxed"
                           autoFocus
                       />
                       <p className="text-xs text-slate-500 mt-2">A IA agirá como Advogado do Órgão para defender o edital.</p>
                   </div>
                ) : isAdhesion ? (
                   <div>
                        <label className="block text-sm font-bold text-blue-600 dark:text-blue-400 mb-2 font-sans flex items-center gap-2">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                           Detalhes da Ata de Origem
                        </label>
                        <textarea
                           name="justification"
                           value={formData.justification}
                           onChange={handleChange}
                           rows={6}
                           placeholder="Se você já encontrou uma Ata, informe: Número da Ata, Órgão Gerenciador, Fornecedor e Vigência. &#10;&#10;Se NÃO encontrou, deixe em branco ou descreva 'Preciso de ajuda para buscar', que a IA gerará um guia de busca no PNCP."
                           className="w-full px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all text-slate-900 dark:text-white placeholder-slate-400 font-serif leading-relaxed"
                           autoFocus
                       />
                       <p className="text-xs text-slate-500 mt-2">O sistema gerará o Estudo de Vantajosidade e os Ofícios de Solicitação.</p>
                   </div>
                ) : (
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-sans">
                            {isPriceResearch ? 'Parâmetros de Pesquisa e Fontes' : 'Justificativa da Contratação'}
                        </label>
                        <textarea
                            name="justification"
                            value={formData.justification}
                            onChange={handleChange}
                            rows={4}
                            placeholder={
                                isPriceResearch 
                                ? "Defina a prioridade de fontes (ex: Painel de Preços, Compras Governamentais). Se quiser, especifique regiões para a busca." 
                                : "Por que essa contratação é necessária para o interesse público?"
                            }
                            className="w-full px-4 py-3 bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none transition-all text-slate-900 dark:text-white placeholder-slate-400 font-serif leading-relaxed"
                            autoFocus
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-sans">Informações Adicionais (Opcional)</label>
                    <textarea
                        name="additionalInfo"
                        value={formData.additionalInfo}
                        onChange={handleChange}
                        rows={3}
                        placeholder={isImpugnment ? "Observações específicas para a defesa..." : "Prazos, garantias, ou exigências específicas..."}
                        className="w-full px-4 py-3 bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none transition-all text-slate-900 dark:text-white placeholder-slate-400 font-serif leading-relaxed"
                    />
                </div>
            </div>
            )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 bg-slate-50 dark:bg-navy-800/50 border-t border-slate-200 dark:border-white/5 flex gap-3">
        <button
          onClick={prevStep}
          disabled={currentStep === 1 || isGenerating}
          className={`px-5 py-3 rounded-lg font-bold text-sm transition-colors border border-slate-300 dark:border-navy-700 font-sans
            ${currentStep === 1 || isGenerating 
              ? 'text-slate-400 cursor-not-allowed bg-slate-100 dark:bg-navy-900' 
              : 'text-slate-700 dark:text-slate-200 bg-white dark:bg-navy-800 hover:bg-slate-100 dark:hover:bg-navy-700'
            }`}
        >
          Voltar
        </button>

        {currentStep < STEPS.length ? (
          <button
            onClick={nextStep}
            disabled={!isStepValid()}
            className={`flex-1 px-5 py-3 rounded-lg font-bold text-white text-sm transition-all shadow-md font-sans
              ${!isStepValid()
                ? 'bg-slate-300 dark:bg-navy-800 cursor-not-allowed text-slate-500'
                : 'bg-primary-500 hover:bg-primary-600 shadow-primary-500/20'
              }`}
          >
            Próximo Passo
          </button>
        ) : (
          <button
            onClick={onSubmit}
            disabled={!isStepValid() || isGenerating}
            className={`flex-1 px-5 py-3 rounded-lg font-bold text-white text-sm transition-all flex items-center justify-center gap-2 shadow-lg font-sans
              ${!isStepValid() || isGenerating
                ? 'bg-slate-400 dark:bg-navy-700 cursor-not-allowed'
                : 'bg-primary-500 hover:bg-primary-600 shadow-primary-500/25 hover:translate-y-[-1px]'
              }`}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isImpugnment ? 'Gerar Parecer Jurídico' : isAdhesion ? 'Gerar Pedido de Adesão' : isPriceResearch ? 'Pesquisar Preços no PNCP' : 'Gerar Documento Oficial'}
              </>
            ) : (
              isImpugnment ? 'Gerar Resposta à Impugnação' : isAdhesion ? 'Gerar Pedido de Adesão' : isPriceResearch ? 'Pesquisar Preços no PNCP' : 'Gerar Documento Oficial'
            )}
          </button>
        )}
      </div>
    </div>
  );
};