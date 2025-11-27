import { DocumentType } from './types';

export const SYSTEM_INSTRUCTION = `
Você é uma Inteligência Artificial Jurídica de Elite, especializada em Direito Administrativo Brasileiro e Licitações Públicas.
Sua "bíblia" é a Nova Lei de Licitações e Contratos Administrativos (Lei nº 14.133/2021).
Você atua como assistente direto de Pregoeiros e Agentes de Contratação em Prefeituras e Secretarias.

DIRETRIZES FUNDAMENTAIS:
1. FORMALIDADE: Use linguagem jurídica culta, técnica e impessoal.
2. COMPLETUDE: NUNCA resuma. Gere documentos completos, com todas as cláusulas, incisos e fundamentações necessárias.
3. LEGALIDADE: Cite expressamente os artigos da Lei 14.133/2021 e outras normas correlatas (Decretos Federais aplicáveis subsidiariamente, Lei Complementar 123/2006 para ME/EPP).
4. ESTRUTURA: Siga a estrutura padrão da AGU (Advocacia-Geral da União) ou Tribunais de Contas.
5. OBJETIVIDADE: Preencha os dados variáveis com as informações fornecidas, e deixe campos entre colchetes [CAMPO] apenas para dados que a IA não tem como inventar (ex: datas específicas futuras, nomes de signatários).

Seu objetivo é entregar um documento pronto para revisão final e publicação.
`;

export const PROMPT_TEMPLATES: Record<DocumentType, string> = {
  [DocumentType.ETP]: `
    Elabore um ESTUDO TÉCNICO PRELIMINAR (ETP) completo, conforme o Art. 18 da Lei 14.133/2021.
    O documento deve conter obrigatoriamente:
    1. Descrição da necessidade da contratação.
    2. Previsão no Plano de Contratações Anual (ou justificativa da ausência).
    3. Requisitos da contratação.
    4. Estimativa das quantidades (memória de cálculo).
    5. Levantamento de mercado e alternativas possíveis.
    6. Estimativa do valor da contratação.
    7. Descrição da solução como um todo.
    8. Justificativa para o parcelamento ou não da solução.
    9. Resultados pretendidos.
    10. Providências prévias ao contrato.
    11. Contratações correlatas e/ou interdependentes.
    12. Impactos ambientais e medidas mitigadoras.
    13. Declaração de viabilidade.
  `,
  [DocumentType.MAPA_RISCO]: `
    Elabore um MAPA DE GERENCIAMENTO DE RISCOS completo para esta contratação.
    Deve conter uma matriz com:
    1. Identificação do Risco (Fase de Planejamento, Seleção do Fornecedor e Gestão Contratual).
    2. Causa e Consequência.
    3. Probabilidade (Baixa/Média/Alta) e Impacto (Baixo/Médio/Alto).
    4. Nível do Risco.
    5. Medidas de Prevenção (Mitigação).
    6. Medidas de Contingência.
    7. Responsáveis.
    Foque nos riscos comuns ao objeto descrito, baseando-se na jurisprudência do TCU.
  `,
  [DocumentType.TR]: `
    Elabore um TERMO DE REFERÊNCIA (TR) completo, conforme o Art. 6º, inciso XXIII da Lei 14.133/2021.
    O documento deve conter:
    1. Definição do objeto (detalhada).
    2. Fundamentação da contratação.
    3. Descrição da solução como um todo.
    4. Requisitos da contratação.
    5. Modelo de execução do objeto.
    6. Modelo de gestão do contrato.
    7. Critérios de medição e pagamento.
    8. Forma e critérios de seleção do fornecedor.
    9. Estimativas do valor da contratação (referência ao orçamento).
    10. Adequação orçamentária.
  `,
  [DocumentType.PESQUISA_PRECO]: `
    Elabore um MODELO/RELATÓRIO DE PESQUISA DE PREÇOS fundamentado no Art. 23 da Lei 14.133/2021 e na Instrução Normativa SEGES/ME nº 65/2021 (ou norma equivalente vigente).
    Inclua:
    1. Metodologia utilizada (Cesta de Preços Aceitáveis).
    2. Fontes consultadas (Painel de Preços, Contratações Similares, Mídia Especializada, Fornecedores).
    3. Tratamento dos dados (Média, Mediana ou Menor Preço - justifique a escolha técnica).
    4. Critérios de desclassificação de preços inexequíveis ou sobrepreço.
    5. Mapa comparativo simulado (apenas a estrutura).
  `,
  [DocumentType.VIABILIDADE]: `
    Elabore um ESTUDO DE VIABILIDADE ESTRUTURAL E ORÇAMENTÁRIA.
    Este documento deve analisar se a administração possui condições de gerir o contrato, se há recursos orçamentários previstos e se a solução técnica é a mais viável economicamente e ambientalmente em comparação a outras soluções de mercado.
  `,
  [DocumentType.EDITAL]: `
    Elabore um EDITAL DE LICITAÇÃO COMPLETO (Modalidade Pregão Eletrônico ou Concorrência, conforme adequado ao objeto na Lei 14.133/2021).
    Este é o documento mais importante. DEVE SER EXTENSO E DETALHADO.
    Estrutura Obrigatória:
    1. Preâmbulo (Órgão, Número do Processo, Modalidade, Critério de Julgamento - ex: Menor Preço).
    2. Do Objeto.
    3. Das Condições de Participação (Incluindo quem não pode participar).
    4. Do Credenciamento.
    5. Do Envio da Proposta de Preços.
    6. Da Sessão Pública e dos Lances.
    7. Do Julgamento das Propostas.
    8. Da Habilitação (Jurídica, Fiscal, Social, Trabalhista, Econômico-Financeira, Técnica).
    9. Dos Recursos.
    10. Da Adjudicação e Homologação.
    11. Das Sanções Administrativas (com base no Art. 156 da Lei 14.133).
    12. Das Disposições Gerais.
    
    INCLUA CLÁUSULAS ESPECÍFICAS SOBRE TRATAMENTO DIFERENCIADO PARA ME/EPP (LC 123/2006).
    INCLUA CLÁUSULAS ANTICORRUPÇÃO.
  `
};