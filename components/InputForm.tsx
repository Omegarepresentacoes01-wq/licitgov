import React, { useState } from 'react';
import { FormData } from '../types';

interface InputFormProps {
  formData: FormData;
  onChange: (data: FormData) => void;
  onSubmit: () => void;
  isGenerating: boolean;
}

const STEPS = [
  { id: 1, title: 'Institucional', description: 'Órgão e Local' },
  { id: 2, title: 'Regras', description: 'Modalidade' },
  { id: 3, title: 'Objeto', description: 'Especificação' },
  { id: 4, title: 'Finalizar', description: 'Detalhes finais' }
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
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
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
    <div className="bg-white dark:bg-[#15171e] rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 h-full flex flex-col overflow-hidden transition-all duration-300 relative z-10">
      
      {/* Sleek Header */}
      <div className="p-6 lg:p-8 shrink-0">
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-bold text-slate-800 dark:text-white tracking-tight">
               Configuração
            </h2>
            <div className="text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-full border border-primary-100 dark:border-primary-900/30">
                Passo {currentStep} de {STEPS.length}
            </div>
        </div>
        
        {/* Minimalist Progress */}
        <div className="flex items-center w-full">
            {STEPS.map((step, idx) => (
                <div key={step.id} className="flex-1 flex items-center">
                    <div className={`
                        flex flex-col items-center justify-center relative z-10
                    `}>
                        <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 shadow-lg
                            ${step.id <= currentStep 
                                ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-primary-500/30 scale-100' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 shadow-none'
                            }
                        `}>
                            {step.id < currentStep ? '✓' : step.id}
                        </div>
                    </div>
                    {idx < STEPS.length - 1 && (
                        <div className="h-[2px] w-full bg-slate-100 dark:bg-slate-800 mx-2 relative overflow-hidden rounded-full">
                            <div className={`
                                absolute left-0 top-0 h-full bg-primary-500 transition-all duration-700 ease-out
                                ${step.id < currentStep ? 'w-full' : 'w-0'}
                            `} />
                        </div>
                    )}
                </div>
            ))}
        </div>
        <div className="mt-3 text-sm font-semibold text-primary-600 dark:text-primary-400 animate-fadeIn">
            {STEPS[currentStep - 1].title} &mdash; <span className="text-slate-400 font-normal">{STEPS[currentStep - 1].description}</span>
        </div>
      </div>

      {/* Form Content Area */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-8 pb-4 scroll-smooth">
        <div className="space-y-6 lg:space-y-8 py-2">
            
            {/* STEP 1: INSTITUCIONAL */}
            {currentStep === 1 && (
            <div className="space-y-6 animate-slideUp">
                <div className={`group transition-all duration-300 ${focusedField === 'organName' ? 'transform scale-[1.01]' : ''}`}>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Órgão Público</label>
                    <input
                        type="text"
                        name="organName"
                        value={formData.organName}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('organName')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Ex: Prefeitura Municipal de..."
                        className="w-full h-14 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-500 outline-none transition-all dark:text-white placeholder-slate-400 font-medium text-lg"
                        autoFocus
                    />
                </div>

                <div className={`group transition-all duration-300 ${focusedField === 'city' ? 'transform scale-[1.01]' : ''}`}>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Localidade</label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('city')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Cidade / UF"
                        className="w-full h-14 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-500 outline-none transition-all dark:text-white placeholder-slate-400 font-medium"
                    />
                </div>
            </div>
            )}

            {/* STEP 2: REGRAS */}
            {currentStep === 2 && (
            <div className="space-y-6 animate-slideUp">
                <div className="group">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Modalidade</label>
                    <div className="relative">
                        <select
                        name="modality"
                        value={formData.modality}
                        onChange={handleChange}
                        className="w-full h-14 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-500 outline-none transition-all dark:text-white font-medium appearance-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                        <option value="" disabled>Selecione a modalidade</option>
                        {MODALITIES.map(m => <option key={m} value={m} className="dark:bg-slate-800">{m}</option>)}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                <div className="group">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Critério de Julgamento</label>
                    <div className="relative">
                        <select
                        name="judgmentCriteria"
                        value={formData.judgmentCriteria}
                        onChange={handleChange}
                        className="w-full h-14 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-500 outline-none transition-all dark:text-white font-medium appearance-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                        <option value="" disabled>Selecione o critério</option>
                        {CRITERIA.map(c => <option key={c} value={c} className="dark:bg-slate-800">{c}</option>)}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>
            </div>
            )}

            {/* STEP 3: OBJETO */}
            {currentStep === 3 && (
            <div className="space-y-6 animate-slideUp">
                <div className={`group flex flex-col h-full transition-all duration-300 ${focusedField === 'object' ? 'transform scale-[1.01]' : ''}`}>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Objeto da Licitação</label>
                    <textarea
                        name="objectDescription"
                        value={formData.objectDescription}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('object')}
                        onBlur={() => setFocusedField(null)}
                        rows={5}
                        placeholder="Descreva detalhadamente o item, serviço ou obra..."
                        className="w-full flex-1 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-500 outline-none resize-none transition-all dark:text-white placeholder-slate-400 font-medium leading-relaxed"
                        autoFocus
                    />
                </div>

                <div className={`group transition-all duration-300 ${focusedField === 'value' ? 'transform scale-[1.01]' : ''}`}>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Valor Estimado (R$)</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                        <input
                            type="text"
                            name="estimatedValue"
                            value={formData.estimatedValue}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('value')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="0,00"
                            className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-500 outline-none transition-all dark:text-white placeholder-slate-400 font-medium text-lg"
                        />
                    </div>
                </div>
            </div>
            )}

            {/* STEP 4: DETALHES */}
            {currentStep === 4 && (
            <div className="space-y-6 animate-slideUp">
                <div className={`group transition-all duration-300 ${focusedField === 'just' ? 'transform scale-[1.01]' : ''}`}>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Justificativa</label>
                    <textarea
                        name="justification"
                        value={formData.justification}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('just')}
                        onBlur={() => setFocusedField(null)}
                        rows={4}
                        placeholder="Por que essa contratação é necessária?"
                        className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-500 outline-none resize-none transition-all dark:text-white placeholder-slate-400 font-medium leading-relaxed"
                        autoFocus
                    />
                </div>

                <div className="group">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Informações Adicionais (Opcional)</label>
                    <textarea
                        name="additionalInfo"
                        value={formData.additionalInfo}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Prazos, garantias, etc..."
                        className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-500 outline-none resize-none transition-all dark:text-white placeholder-slate-400 font-medium"
                    />
                </div>
            </div>
            )}
        </div>
      </div>

      {/* Modern Footer Actions */}
      <div className="p-6 lg:p-8 bg-white dark:bg-[#15171e] flex gap-4 shrink-0 border-t border-slate-50 dark:border-slate-800/50">
        <button
          onClick={prevStep}
          disabled={currentStep === 1 || isGenerating}
          className={`px-6 py-4 rounded-xl font-bold transition-all duration-200 text-sm flex items-center gap-2 border border-transparent
            ${currentStep === 1 || isGenerating 
              ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed' 
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
            }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Voltar
        </button>

        {currentStep < STEPS.length ? (
          <button
            onClick={nextStep}
            disabled={!isStepValid()}
            className={`flex-1 px-6 py-4 rounded-xl font-bold text-white transition-all duration-200 shadow-xl text-sm flex items-center justify-center gap-2
              ${!isStepValid()
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 shadow-primary-500/30 hover:scale-[1.01] active:scale-[0.99]'
              }`}
          >
            Continuar
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        ) : (
          <button
            onClick={onSubmit}
            disabled={!isStepValid() || isGenerating}
            className={`flex-1 px-6 py-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 text-sm
              ${!isStepValid() || isGenerating
                ? 'bg-slate-400 dark:bg-slate-800 cursor-not-allowed opacity-70'
                : 'bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-400 hover:to-secondary-500 hover:scale-[1.02] active:scale-95 shadow-xl shadow-secondary-500/30 ring-1 ring-secondary-400/20'
              }`}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="font-display">Gerando Documento...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                <span className="font-display">Gerar Documento</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};