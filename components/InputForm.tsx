import React, { useState } from 'react';
import { FormData } from '../types';

interface InputFormProps {
  formData: FormData;
  onChange: (data: FormData) => void;
  onSubmit: () => void;
  isGenerating: boolean;
}

const STEPS = [
  { id: 1, title: 'Órgão', description: 'Institucional' },
  { id: 2, title: 'Regras', description: 'Modalidade' },
  { id: 3, title: 'Objeto', description: 'Definição' },
  { id: 4, title: 'Detalhes', description: 'Justificativa' }
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

export const InputForm: React.FC<InputFormProps> = ({ formData, onChange, onSubmit, isGenerating }) => {
  const [currentStep, setCurrentStep] = useState(1);
  
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
      case 3: return !!formData.objectDescription && !!formData.estimatedValue;
      case 4: return !!formData.justification;
      default: return false;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 h-full flex flex-col overflow-hidden transition-all duration-300">
      
      {/* Wizard Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-4 lg:p-6 shrink-0">
        <div className="flex justify-between items-end mb-4 lg:mb-6">
          <div>
            <h2 className="text-lg lg:text-xl font-bold text-slate-800 dark:text-white">
              {STEPS[currentStep - 1].title}
            </h2>
            <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {STEPS[currentStep - 1].description}
            </p>
          </div>
          <span className="text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full">
            {currentStep} / {STEPS.length}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="relative px-1">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full -z-0" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-500 rounded-full transition-all duration-500 -z-0"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          />
          <div className="flex items-center justify-between">
            {STEPS.map((step) => (
              <div 
                key={step.id} 
                className={`relative z-10 flex flex-col items-center justify-center transition-all duration-300`}
              >
                <div 
                  className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-[10px] lg:text-xs font-bold border-2 transition-all duration-300
                    ${step.id === currentStep 
                      ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/30 scale-110' 
                      : step.id < currentStep
                        ? 'bg-primary-100 dark:bg-primary-900 border-primary-100 dark:border-primary-800 text-primary-600 dark:text-primary-400'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-600'
                    }
                  `}
                >
                  {step.id < currentStep ? '✓' : step.id}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wizard Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 scroll-smooth">
        
        {/* STEP 1: INSTITUCIONAL */}
        {currentStep === 1 && (
          <div className="space-y-4 lg:space-y-6 animate-fadeIn">
            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400">Órgão Público</label>
              <input
                type="text"
                name="organName"
                value={formData.organName}
                onChange={handleChange}
                placeholder="Ex: Prefeitura Municipal de Salvador"
                className="w-full p-3 lg:p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-400 outline-none transition-all dark:text-white dark:placeholder-slate-500"
                autoFocus
              />
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">Nome oficial completo do órgão contratante.</p>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400">Cidade / Estado</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Ex: Salvador / BA"
                className="w-full p-3 lg:p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-400 outline-none transition-all dark:text-white dark:placeholder-slate-500"
              />
            </div>
          </div>
        )}

        {/* STEP 2: REGRAS */}
        {currentStep === 2 && (
          <div className="space-y-4 lg:space-y-6 animate-fadeIn">
            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400">Modalidade da Licitação</label>
              <div className="relative">
                <select
                  name="modality"
                  value={formData.modality}
                  onChange={handleChange}
                  className="w-full p-3 lg:p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-400 outline-none transition-all dark:text-white appearance-none"
                >
                  <option value="" disabled>Selecione a modalidade</option>
                  {MODALITIES.map(m => <option key={m} value={m} className="dark:bg-slate-800">{m}</option>)}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400">Critério de Julgamento</label>
              <div className="relative">
                <select
                  name="judgmentCriteria"
                  value={formData.judgmentCriteria}
                  onChange={handleChange}
                  className="w-full p-3 lg:p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-400 outline-none transition-all dark:text-white appearance-none"
                >
                  <option value="" disabled>Selecione o critério</option>
                  {CRITERIA.map(c => <option key={c} value={c} className="dark:bg-slate-800">{c}</option>)}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: OBJETO */}
        {currentStep === 3 && (
          <div className="space-y-4 lg:space-y-6 animate-fadeIn">
            <div className="group h-full flex flex-col">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400">Objeto da Licitação</label>
              <textarea
                name="objectDescription"
                value={formData.objectDescription}
                onChange={handleChange}
                rows={6}
                placeholder="Descreva detalhadamente o item, serviço ou obra. Inclua especificações técnicas essenciais..."
                className="w-full flex-1 p-3 lg:p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-400 outline-none resize-none transition-all dark:text-white dark:placeholder-slate-500"
                autoFocus
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400">Valor Estimado Total (R$)</label>
              <input
                type="text"
                name="estimatedValue"
                value={formData.estimatedValue}
                onChange={handleChange}
                placeholder="Ex: R$ 1.500.000,00"
                className="w-full p-3 lg:p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-400 outline-none transition-all dark:text-white dark:placeholder-slate-500"
              />
            </div>
          </div>
        )}

        {/* STEP 4: DETALHES */}
        {currentStep === 4 && (
          <div className="space-y-4 lg:space-y-6 animate-fadeIn">
            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400">Justificativa da Contratação</label>
              <textarea
                name="justification"
                value={formData.justification}
                onChange={handleChange}
                rows={4}
                placeholder="Por que essa contratação é necessária para o interesse público?"
                className="w-full p-3 lg:p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-400 outline-none resize-none transition-all dark:text-white dark:placeholder-slate-500"
                autoFocus
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400">Informações Adicionais (Opcional)</label>
              <textarea
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleChange}
                rows={3}
                placeholder="Prazos de entrega, garantias exigidas, local de execução..."
                className="w-full p-3 lg:p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-400 outline-none resize-none transition-all dark:text-white dark:placeholder-slate-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 lg:p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-3 lg:gap-4 shrink-0">
        <button
          onClick={prevStep}
          disabled={currentStep === 1 || isGenerating}
          className={`px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl font-semibold border transition-all duration-200 text-sm lg:text-base
            ${currentStep === 1 || isGenerating 
              ? 'border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed' 
              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
        >
          Voltar
        </button>

        {currentStep < STEPS.length ? (
          <button
            onClick={nextStep}
            disabled={!isStepValid()}
            className={`flex-1 px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl font-bold text-white transition-all duration-200 shadow-lg shadow-primary-500/20 text-sm lg:text-base
              ${!isStepValid()
                ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-70 shadow-none'
                : 'bg-primary-600 hover:bg-primary-700 active:scale-95'
              }`}
          >
            Continuar
          </button>
        ) : (
          <button
            onClick={onSubmit}
            disabled={!isStepValid() || isGenerating}
            className={`flex-1 px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 lg:gap-3 text-sm lg:text-base
              ${!isStepValid() || isGenerating
                ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-70'
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-lg shadow-emerald-500/30'
              }`}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="hidden sm:inline">Gerando...</span>
              </>
            ) : (
              <>
                <span>✨</span> Gerar Documento
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};