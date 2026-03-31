/**
 * documentConfigs.ts
 *
 * Configuração completa para cada tipo de documento:
 *   - extractionSchema: campos a extrair do texto colado pelo usuário
 *   - requiredFields: campos obrigatórios (sem eles o pipeline para)
 *   - buildMasterPrompt: função que monta o prompt final com dados reais
 *   - checklist: regras de qualidade pós-geração
 *
 * Regra central: a IA nunca inventa dados. Se um campo não foi fornecido,
 * o documento escreve "A INFORMAR" naquele ponto.
 */

import { DocumentType } from '../types';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ExtractionSchema {
  [field: string]: string;
}

export interface ChecklistItem {
  field: string;
  rule: 'not_blank' | 'min_words_50' | 'min_words_100' | 'positive_number' | 'has_table' | 'all_sections';
  weight: number;
  description: string;
}

export interface DocumentConfig {
  extractionSchema: ExtractionSchema;
  requiredFields: string[];
  buildMasterPrompt: (
    extractedData: Record<string, string | null>,
    missingFields: string[],
    legalContext: string,
    marketContext: string,
    sustainabilityContext: string
  ) => string;
  checklist: ChecklistItem[];
}

// ─── Sistema de instrução comum a todos os documentos ────────────────────────

export const SYSTEM_INSTRUCTION = `Você é o "LicitGov AI", especialista sênior em elaboração de documentos oficiais
de contratação pública brasileira conforme a Lei nº 14.133/2021.

REGRAS ABSOLUTAS — violação torna o documento inválido:
1. Comece DIRETO no cabeçalho oficial do documento. ZERO apresentações ou preâmbulos da IA.
2. Use "A INFORMAR" onde o dado não foi fornecido — NUNCA invente nomes, números, datas ou valores.
3. Cite APENAS leis, artigos e acórdãos presentes no bloco de referências verificadas fornecido.
4. Cada seção deve ter MÍNIMO 3 parágrafos com: contextualização, fundamentação legal e conclusão.
5. NÃO use colchetes [] no documento final — substitua pelo dado real ou por "A INFORMAR".
6. Linguagem: técnica, impessoal, terceira pessoa, vocabulário jurídico-administrativo.
7. Valores monetários: use EXATAMENTE os dados extraídos, sem arredondamentos não informados.
8. O documento deve ter aparência de laudo oficial — extenso, denso e fundamentado.`;

// ─── Configurações por tipo de documento ─────────────────────────────────────

const configs: Partial<Record<DocumentType, DocumentConfig>> = {

  // ── DFD ───────────────────────────────────────────────────────────────────
  [DocumentType.DFD]: {
    extractionSchema: {
      // Identificação
      orgao_nome:                'Nome completo do órgão ou entidade pública',
      orgao_cnpj:                'CNPJ do órgão demandante',
      orgao_endereco:            'Endereço completo da sede do órgão',
      secretaria_demandante:     'Nome da secretaria ou unidade demandante',
      responsavel_nome:          'Nome completo do servidor responsável pela demanda',
      responsavel_cargo:         'Cargo ou função do servidor responsável',
      responsavel_matricula:     'Matrícula ou CPF do responsável',
      equipe_elaboracao:         'Nomes e cargos dos membros da equipe de planejamento',
      processo_numero:           'Número do processo administrativo',
      data_elaboracao:           'Data de elaboração do documento',
      // Necessidade e objeto
      objeto_resumido:           'Descrição sucinta do bem ou serviço demandado',
      objeto_detalhado:          'Descrição completa e técnica do objeto contratual',
      justificativa_necessidade: 'Diagnóstico da situação atual e motivo da necessidade',
      consequencias_sem_contrato:'Consequências para a Administração se não contratar',
      urgencia_fundamento:       'Fundamento legal para caráter emergencial ou urgente, se houver',
      modalidade_dispensa:       'Modalidade (dispensa, pregão, concorrência etc.) e fundamento legal',
      // Especificações técnicas
      especificacoes_hardware:   'Especificações técnicas de equipamentos/hardware, se houver',
      especificacoes_software:   'Especificações técnicas de software/aplicativo, se houver',
      especificacoes_servicos:   'Especificações de serviços de manutenção ou suporte inclusos',
      modelo_remuneracao:        'Modelo de remuneração (por km, mensal, por evento, comodato etc.)',
      rede_credenciada:          'Requisito de rede credenciada ou cobertura geográfica',
      // Quantitativos e valores
      frota_quantidade:          'Quantidade total de veículos, equipamentos ou unidades da frota',
      frota_composicao:          'Composição detalhada da frota (tipos, categorias, capacidades)',
      quantidade_estimada:       'Quantidade total estimada com unidade de medida',
      valor_unitario_estimado:   'Valor unitário estimado em reais',
      valor_mensal_estimado:     'Valor mensal estimado em reais',
      valor_total_estimado:      'Valor total estimado para o período contratual',
      taxa_administracao:        'Taxa de administração percentual se aplicável',
      prazo_vigencia:            'Prazo de vigência do contrato em meses ou anos',
      // Planejamento e orçamento
      previsao_pca:              'Código ou confirmação de previsão no PCA',
      dotacao_sugerida:          'Classificação orçamentária sugerida',
      prazo_necessidade:         'Prazo estimado para conclusão da contratação',
      // Habilitação
      habilitacao_juridica:      'Documentos de habilitação jurídica exigidos',
      habilitacao_fiscal:        'Certidões fiscais e trabalhistas exigidas',
      habilitacao_tecnica:       'Qualificação técnica e atestados exigidos',
      habilitacao_economica:     'Requisitos econômico-financeiros e garantia exigidos',
    },
    requiredFields: ['secretaria_demandante', 'objeto_resumido', 'justificativa_necessidade'],
    checklist: [
      { field: 'responsavel_nome',          rule: 'not_blank',    weight: 20, description: 'Nome do responsável preenchido' },
      { field: 'objeto_resumido',           rule: 'not_blank',    weight: 15, description: 'Objeto descrito' },
      { field: 'justificativa_necessidade', rule: 'min_words_100',weight: 20, description: 'Justificativa com mínimo 100 palavras' },
      { field: 'dotacao_sugerida',          rule: 'not_blank',    weight: 15, description: 'Dotação orçamentária informada' },
      { field: 'previsao_pca',              rule: 'not_blank',    weight: 10, description: 'Previsão no PCA informada' },
      { field: 'documento_completo',        rule: 'all_sections', weight: 20, description: 'Todas as partes do DFD presentes' },
    ],
    buildMasterPrompt: (extracted, missing, legal, market, sustainability) => `
${missing.length > 0 ? `⚠️ CAMPOS AUSENTES NO TEXTO — escreva "A INFORMAR" nesses campos: ${missing.join(', ')}` : ''}

## DADOS EXTRAÍDOS DO TEXTO (USE APENAS ESTES — NUNCA INVENTE):
${JSON.stringify(extracted, null, 2)}

## REFERÊNCIAS LEGAIS VERIFICADAS (cite apenas estas):
${legal}

## DADOS DE MERCADO:
${market}

## CRITÉRIOS DE SUSTENTABILIDADE:
${sustainability}

## MISSÃO:
Elabore um DFD — Documento de Formalização de Demanda — completo, extenso e juridicamente robusto,
com no mínimo 25 páginas equivalentes, cobrindo TODAS as 13 partes abaixo.

## REGRAS ESPECÍFICAS:
- Cada parte deve ter MÍNIMO 4 parágrafos densos com contextualização, diagnóstico, fundamentação legal e conclusão
- Se código PCA não foi fornecido: escreva "A INFORMAR — verificar no sistema SIASG/PCA antes de assinar"
- NUNCA use colchetes [] no texto final — substitua por dado real ou "A INFORMAR"
- Inclua TODAS as tabelas indicadas com dados reais extraídos ou colunas preenchidas com "A INFORMAR"
- Obrigações: liste MÍNIMO 20 obrigações da contratada e MÍNIMO 10 da contratante, numeradas
- Sanções: inclua tabela completa com advertência, multa moratória, multa compensatória, suspensão, inidoneidade
- Fundamentação legal: inclua tabela consolidando TODOS os dispositivos legais aplicados

## ESTRUTURA OBRIGATÓRIA (13 PARTES — NÃO OMITA NENHUMA):

---

# DOCUMENTO DE FORMALIZAÇÃO DE DEMANDA — DFD

**Processo nº:** [processo_numero ou "A INFORMAR"]
**Data:** [data_elaboracao ou data atual]
**Órgão:** [orgao_nome]

---

## PARTE I — IDENTIFICAÇÃO DA UNIDADE DEMANDANTE

1.1 Dados do Órgão:
| Campo | Dados |
|-------|-------|
| Órgão/Entidade | [orgao_nome] |
| CNPJ | [orgao_cnpj] |
| Endereço | [orgao_endereco] |
| Unidade Demandante | [secretaria_demandante] |
| Processo nº | [processo_numero] |

1.2 Equipe de Planejamento da Contratação:
| Nome | Cargo/Função | Atribuição |
|------|-------------|------------|
[Listar equipe ou "A INFORMAR"]

1.3 Responsável pela Demanda:
| Campo | Dados |
|-------|-------|
| Nome | [responsavel_nome] |
| Cargo | [responsavel_cargo] |
| Matrícula/CPF | [responsavel_matricula] |

---

## PARTE II — DESCRIÇÃO DA NECESSIDADE

2.1 Diagnóstico da Situação Atual
[Mínimo 4 parágrafos: descrever o cenário atual, os problemas identificados, o histórico da necessidade,
e como essa contratação se enquadra no planejamento estratégico do órgão. Use dados extraídos.]

2.2 Consequências da Não Contratação
[Mínimo 3 parágrafos: descrever os riscos operacionais, legais e financeiros de não realizar a contratação.
Fundamentar no dever de continuidade do serviço público.]

2.3 Urgência e Fundamento Legal (se aplicável)
[Se houver caráter emergencial: descrever o fundamento legal (art. 75, VIII, Lei 14.133/2021 ou outro).
Se não emergencial: indicar o enquadramento no planejamento ordinário.]

---

## PARTE III — DESCRIÇÃO COMPLETA DA SOLUÇÃO CONTRATUAL

3.1 Objeto Contratual
[Mínimo 3 parágrafos descrevendo o objeto com precisão técnica. Incluir modalidade: [modalidade_dispensa].]

3.2 Especificações Técnicas
[Descrever TODAS as especificações extraídas. Se houver hardware/software/serviços, criar subseções:]

3.2.1 Especificações de Equipamentos/Hardware (se aplicável)
[especificacoes_hardware — listar em tabela: Item | Especificação | Unidade | Quantidade]

3.2.2 Especificações de Software/Aplicativo (se aplicável)
[especificacoes_software — descrever funcionalidades obrigatórias]

3.2.3 Serviços de Manutenção e Suporte (se aplicável)
[especificacoes_servicos — descrever escopo, prazos de atendimento, SLA]

3.3 Modelo de Remuneração
[Descrever o modelo: [modelo_remuneracao]. Fundamentar na IN SEGES/ME nº 5/2017 ou legislação aplicável.
Incluir tabela de composição de custos se dados disponíveis.]

3.4 Rede Credenciada / Cobertura (se aplicável)
[rede_credenciada — descrever requisitos de abrangência geográfica e credenciamento.]

---

## PARTE IV — JUSTIFICATIVA TÉCNICA E JURÍDICA

4.1 Justificativa Técnica
[Mínimo 4 parágrafos: por que essa é a melhor solução técnica disponível. Comparar com alternativas.
Fundamentar na análise de custo-benefício e na eficiência administrativa (art. 11, Lei 14.133/2021).]

4.2 Justificativa Jurídica e Enquadramento Legal
[Mínimo 3 parágrafos: fundamentar a modalidade escolhida. Se dispensa: citar artigo específico.
Se pregão: justificar enquadramento como bem/serviço comum. Citar acórdãos TCU pertinentes.]

4.3 Alinhamento com Planejamento Institucional
[Demonstrar alinhamento com PCA, PPA, LOA e diretrizes estratégicas do órgão.]

---

## PARTE V — ESTIMATIVA DE QUANTITATIVOS E VALORES

5.1 Composição da Frota / Quantitativos (se aplicável)
[Criar tabela detalhada:]
| Tipo/Categoria | Descrição | Quantidade | Unidade |
|---------------|-----------|------------|---------|
[frota_composicao — preencher ou "A INFORMAR"]

5.2 Memória de Cálculo do Valor Estimado
[Detalhar metodologia de cálculo. Referenciar Painel de Preços gov.br e PNCP conforme IN SEGES 65/2021.]

5.3 Planilha de Custos Estimados
| Item | Descrição | Valor Unitário (R$) | Quantidade | Valor Total (R$) |
|------|-----------|--------------------|-----------|--------------------|
| 01 | [objeto_resumido] | [valor_unitario_estimado] | [quantidade_estimada] | [valor_total_estimado] |
| **TOTAL MENSAL** | | | | **[valor_mensal_estimado]** |
| **TOTAL CONTRATUAL** | | | | **[valor_total_estimado]** |

5.4 Taxa de Administração (se aplicável)
[taxa_administracao — justificar razoabilidade com base em benchmarks de mercado.]

---

## PARTE VI — REQUISITOS DE HABILITAÇÃO

6.1 Habilitação Jurídica
[Listar documentos exigidos: ato constitutivo, CNPJ, etc. Fundamentar no art. 66 da Lei 14.133/2021.]

6.2 Regularidade Fiscal, Social e Trabalhista
[Listar certidões: PGFN, Receita Federal, FGTS, INSS, CNDT. Fundamentar no art. 68 da Lei 14.133/2021.]

6.3 Qualificação Técnica
[Descrever atestados, registros em conselhos profissionais e experiência mínima exigida.
Fundamentar no art. 67 da Lei 14.133/2021. Justificar proporcionalidade ao objeto.]

6.4 Qualificação Econômico-Financeira
[Capital social mínimo ou patrimônio líquido. Índices de liquidez. Garantia de proposta se exigida.
Fundamentar no art. 69 da Lei 14.133/2021.]

---

## PARTE VII — OBRIGAÇÕES DAS PARTES

7.1 Obrigações da Contratada
[Listar MÍNIMO 20 obrigações numeradas, específicas para o objeto contratado. Exemplos de categorias:
execução do serviço, qualidade, prazos, documentação, sigilo, subcontratação, responsabilidade civil,
treinamento, relatórios, fiscalização, LGPD, normas ambientais, SST, seguros, etc.]

I. ...
II. ...
III. ...
[continuar até mínimo XX]

7.2 Obrigações da Contratante
[Listar MÍNIMO 10 obrigações numeradas: pagamento, fornecimento de informações, designação de fiscal,
notificações, acesso às instalações, aprovação de planos, etc.]

I. ...
II. ...
[continuar até mínimo X]

---

## PARTE VIII — CONDIÇÕES DE PAGAMENTO E EXECUÇÃO

8.1 Forma e Prazo de Pagamento
[Descrever fluxo: medição → ateste → nota fiscal → prazo de pagamento (art. 141, Lei 14.133/2021).
Incluir condições para glosa e retenção de pagamento.]

8.2 Condições de Execução
[Descrever local, horário, cronograma, forma de entrega/execução, aceitação provisória e definitiva.]

8.3 Vigência Contratual
[prazo_vigencia — fundamentar prazo no art. 105 e ss. da Lei 14.133/2021. Indicar possibilidade de prorrogação.]

8.4 Reajuste e Repactuação
[Definir índice de reajuste (IPCA/INPC) e condições de repactuação conforme IN SEGES nº 5/2017.]

---

## PARTE IX — FISCALIZAÇÃO, SANÇÕES E RESCISÃO

9.1 Gestão e Fiscalização do Contrato
[Definir fiscal titular e substituto. Atribuições conforme art. 117 da Lei 14.133/2021.
Descrever metodologia de acompanhamento, relatórios e registros obrigatórios.]

9.2 Sanções Administrativas
[Tabela conforme art. 156 da Lei 14.133/2021:]
| Infração | Sanção | Percentual/Prazo | Fundamentação |
|----------|--------|-----------------|---------------|
| Inexecução parcial | Multa moratória | __% ao dia | Art. 162 |
| Inexecução total | Multa compensatória | __% do valor | Art. 162 |
| Reincidência | Impedimento de licitar | Até 3 anos | Art. 156, III |
| Fraude | Declaração de inidoneidade | Até 6 anos | Art. 156, IV |
[Preencher com percentuais do texto ou "A DEFINIR NO CONTRATO"]

9.3 Hipóteses de Rescisão
[Descrever hipóteses de rescisão unilateral, amigável e judicial. Fundamentar nos arts. 137 a 139
da Lei 14.133/2021. Mencionar direitos da Administração em caso de rescisão por culpa da contratada.]

---

## PARTE X — APROVAÇÕES E AUTORIZAÇÕES

10.1 Parecer da Equipe de Planejamento
[Área para declaração de concordância dos membros da equipe de planejamento]

| Nome | Cargo | Assinatura | Data |
|------|-------|-----------|------|
[equipe_elaboracao]

10.2 Aprovação da Autoridade Competente
[Área para aprovação do dirigente responsável pela autorização da contratação]

**Autoridade competente:** ________________________
**Cargo:** ________________________
**Data:** ________________________

---

## PARTE XI — FUNDAMENTAÇÃO LEGAL CONSOLIDADA

| Dispositivo Legal | Ementa / Aplicação no Presente DFD |
|-------------------|-------------------------------------|
| Lei nº 14.133/2021 | Lei de Licitações e Contratos Administrativos — fundamento geral |
| Art. 18 Lei 14.133/2021 | Estudo Técnico Preliminar |
| Art. 6º, XXIII | Definição de Termo de Referência |
| Art. 66 a 70 Lei 14.133/2021 | Habilitação das licitantes |
| Art. 117 Lei 14.133/2021 | Fiscalização do contrato |
| Art. 141 Lei 14.133/2021 | Pagamento |
| Art. 156 a 163 Lei 14.133/2021 | Sanções administrativas |
| Art. 137 a 139 Lei 14.133/2021 | Rescisão contratual |
| IN SEGES/ME nº 65/2021 | Pesquisa de preços para contratações |
[Adicionar demais dispositivos citados ao longo do documento]

---

## PARTE XII — ANEXOS

12.1 Relação de Anexos

| Anexo | Descrição | Status |
|-------|-----------|--------|
| Anexo I | Memória de cálculo detalhada | [A ANEXAR] |
| Anexo II | Pesquisa de preços (IN SEGES 65/2021) | [A REALIZAR] |
| Anexo III | Proposta técnica de referência | [A ANEXAR] |
| Anexo IV | Comprovação de previsão no PCA | [previsao_pca ou "A VERIFICAR"] |
[Adicionar outros anexos mencionados no texto]

---

## PARTE XIII — IDENTIFICAÇÃO E ASSINATURAS

**Elaborado por:**

Nome: [responsavel_nome]
Cargo: [responsavel_cargo]
Matrícula: [responsavel_matricula]
Assinatura: ___________________________
Data: [data_elaboracao]

**Equipe de Planejamento da Contratação:**
[Espaços para assinatura de cada membro da equipe]

**Aprovado por:**

Nome: ___________________________
Cargo: ___________________________
Assinatura: ___________________________
Data: ___________________________

---
*Documento elaborado em conformidade com a Lei nº 14.133/2021 e normas infralegais aplicáveis.*
    `.trim(),
  },

  // ── ETP ───────────────────────────────────────────────────────────────────
  [DocumentType.ETP]: {
    extractionSchema: {
      processo_numero:               'Número do processo administrativo',
      elaborado_por_nome:            'Nome completo do servidor elaborador',
      elaborado_por_cargo:           'Cargo ou função do elaborador',
      elaborado_por_matricula:       'Matrícula funcional do elaborador',
      secretaria_demandante:         'Secretaria ou órgão demandante',
      objeto_detalhado:              'Descrição completa e precisa do objeto',
      modalidade_prevista:           'Modalidade licitatória prevista',
      criterio_julgamento:           'Critério de julgamento das propostas',
      valor_estimado:                'Valor total estimado em reais',
      quantidade_estimada:           'Quantidade total estimada com unidade',
      unidade_medida:                'Unidade de medida',
      codigo_pca:                    'Código do item no Plano de Contratações Anual',
      dotacao_orcamentaria:          'Classificação orçamentária completa',
      natureza_despesa:              'Código da natureza da despesa',
      fonte_recurso:                 'Fonte de recurso orçamentário',
      prazo_vigencia_meses:          'Prazo de vigência do contrato em meses',
      justificativa_nao_parcelamento:'Justificativa para lote único ou parcelamento',
      historico_consumo:             'Dados históricos de consumo se disponíveis',
      data_elaboracao:               'Data de elaboração do ETP',
    },
    requiredFields: ['objeto_detalhado', 'valor_estimado', 'secretaria_demandante'],
    checklist: [
      { field: 'elaborado_por_nome',      rule: 'not_blank',      weight: 15, description: 'Nome do elaborador preenchido' },
      { field: 'elaborado_por_matricula', rule: 'not_blank',      weight: 10, description: 'Matrícula preenchida' },
      { field: 'codigo_pca',              rule: 'not_blank',      weight: 15, description: 'Código PCA preenchido' },
      { field: 'valor_estimado',          rule: 'positive_number', weight: 15, description: 'Valor estimado positivo' },
      { field: 'objeto_detalhado',        rule: 'min_words_100',  weight: 20, description: 'Objeto detalhado com mínimo 100 palavras' },
      { field: 'documento_completo',      rule: 'all_sections',   weight: 25, description: 'Todas as 12 seções do art. 18 presentes' },
    ],
    buildMasterPrompt: (extracted, missing, legal, market, sustainability) => `
${missing.length > 0 ? `⚠️ CAMPOS AUSENTES — escreva "A INFORMAR": ${missing.join(', ')}` : ''}

## DADOS EXTRAÍDOS (USE APENAS ESTES):
${JSON.stringify(extracted, null, 2)}

## REFERÊNCIAS LEGAIS VERIFICADAS:
${legal}

## DADOS DE MERCADO:
${market}

## CRITÉRIOS DE SUSTENTABILIDADE:
${sustainability}

## MISSÃO:
Elabore um ETP completo com as 12 seções obrigatórias do art. 18 da Lei 14.133/2021.
Formato: Markdown com cabeçalhos ##. Mínimo 3 parágrafos por seção.
O documento deve ter aparência de laudo oficial de 15 a 20 páginas.

## ESTRUTURA OBRIGATÓRIA:

### CABEÇALHO
[Processo nº | Data | Elaborado por: nome, cargo, matrícula]

### 1. DESCRIÇÃO DA NECESSIDADE (art. 18, I)
### 2. REFERÊNCIA AOS INSTRUMENTOS DE PLANEJAMENTO (art. 18, II)
### 3. REQUISITOS DA CONTRATAÇÃO (art. 18, III)
### 4. ESTIMATIVA DAS QUANTIDADES (art. 18, IV)
[Inclua memória de cálculo detalhada]
### 5. LEVANTAMENTO DE MERCADO E ANÁLISE DE SOLUÇÕES (art. 18, V)
[Compare mínimo 2 soluções com análise custo-benefício]
### 6. ESTIMATIVA DO VALOR DA CONTRATAÇÃO (art. 18, VI)
[Metodologia, fontes consultadas, preço unitário de referência]
### 7. DESCRIÇÃO DA SOLUÇÃO COMO UM TODO (art. 18, VII)
### 8. JUSTIFICATIVA PARA O PARCELAMENTO OU NÃO DO OBJETO (art. 18, VIII)
### 9. CONTRATAÇÕES CORRELATAS E/OU INTERDEPENDENTES (art. 18, IX)
### 10. IMPACTOS AMBIENTAIS E REQUISITOS DE SUSTENTABILIDADE (art. 18, X)
### 11. RESULTADOS PRETENDIDOS (art. 18, XI)
[Eficácia, Eficiência e Economicidade]
### 12. PROVIDÊNCIAS PRÉVIAS NECESSÁRIAS (art. 18, XII)

### CONCLUSÃO DE VIABILIDADE (art. 18, §1º)
[Declaração formal de viabilidade + espaço para assinatura]
    `.trim(),
  },

  // ── MAPA DE RISCO ─────────────────────────────────────────────────────────
  [DocumentType.MAPA_RISCO]: {
    extractionSchema: {
      objeto_contratacao:    'Objeto sendo contratado',
      secretaria_responsavel:'Secretaria responsável pela contratação',
      modalidade_licitacao:  'Modalidade de licitação prevista',
      valor_estimado:        'Valor estimado da contratação',
      elaborado_por:         'Nome do responsável pela elaboração',
      riscos_mencionados:    'Riscos já mencionados no texto fornecido',
    },
    requiredFields: ['objeto_contratacao', 'secretaria_responsavel'],
    checklist: [
      { field: 'fase_planejamento', rule: 'not_blank',    weight: 30, description: 'Riscos da fase de planejamento' },
      { field: 'fase_selecao',      rule: 'not_blank',    weight: 30, description: 'Riscos da fase de seleção' },
      { field: 'fase_execucao',     rule: 'not_blank',    weight: 25, description: 'Riscos da fase de execução' },
      { field: 'mitigacoes',        rule: 'min_words_50', weight: 15, description: 'Ações mitigadoras detalhadas' },
    ],
    buildMasterPrompt: (extracted, missing, legal) => `
${missing.length > 0 ? `⚠️ CAMPOS AUSENTES — escreva "A INFORMAR": ${missing.join(', ')}` : ''}

## DADOS EXTRAÍDOS:
${JSON.stringify(extracted, null, 2)}

## REFERÊNCIAS LEGAIS VERIFICADAS:
${legal}

## MISSÃO:
Elabore uma Matriz de Gerenciamento de Riscos completa conforme art. 18, §1º
da Lei 14.133/2021 e o Guia de Gestão de Riscos do TCU (2018).

## REGRAS:
- Mínimo 6 riscos por fase (18 riscos no total)
- Para cada risco: Evento | Causa | Consequência | Probabilidade | Impacto | Nível | Responsável | Ação Mitigadora | Plano de Contingência
- Probabilidade e Impacto: use APENAS Alto / Médio / Baixo
- Nível do Risco = combinação P × I conforme matriz padrão TCU
- Ações mitigadoras devem ser ESPECÍFICAS para o objeto — não genéricas

## ESTRUTURA OBRIGATÓRIA:

### IDENTIFICAÇÃO DO DOCUMENTO
### INTRODUÇÃO E METODOLOGIA
[Referenciar ISO 31000:2018 e Guia TCU]

### FASE 1 — PLANEJAMENTO DA CONTRATAÇÃO
| Risco | Causa | Consequência | Probabilidade | Impacto | Nível | Responsável | Ação Mitigadora | Contingência |
[Mínimo 6 riscos — especificação deficiente, sobrepreço, restrição de competição, etc.]

### FASE 2 — SELEÇÃO DO FORNECEDOR
| Risco | Causa | Consequência | Probabilidade | Impacto | Nível | Responsável | Ação Mitigadora | Contingência |
[Mínimo 6 riscos — licitação deserta, cartel, judicialização, etc.]

### FASE 3 — GESTÃO CONTRATUAL E EXECUÇÃO
| Risco | Causa | Consequência | Probabilidade | Impacto | Nível | Responsável | Ação Mitigadora | Contingência |
[Mínimo 6 riscos — inexecução, reequilíbrio, falha de fiscalização, etc.]

### MATRIZ DE CALOR CONSOLIDADA
### PLANO DE TRATAMENTO DOS RISCOS CRÍTICOS (Alto × Alto)
### RESPONSÁVEIS E ASSINATURAS
    `.trim(),
  },

  // ── TERMO DE REFERÊNCIA ───────────────────────────────────────────────────
  [DocumentType.TR]: {
    extractionSchema: {
      objeto:                   'Descrição completa e detalhada do objeto',
      justificativa:            'Justificativa técnica da contratação',
      especificacoes_tecnicas:  'Requisitos técnicos obrigatórios do produto/serviço',
      quantidade_estimada:      'Quantidade estimada com unidade de medida',
      criterio_julgamento:      'Critério de julgamento das propostas',
      habilitacao_tecnica:      'Atestados e documentos técnicos exigidos',
      prazo_execucao:           'Prazo para entrega ou execução',
      local_execucao:           'Local de entrega ou execução',
      garantia_percentual:      'Percentual de garantia contratual exigida',
      forma_pagamento:          'Forma e prazo de pagamento',
      fiscalizacao_responsavel: 'Responsável pela fiscalização do contrato',
      valor_estimado:           'Valor estimado da contratação',
    },
    requiredFields: ['objeto', 'especificacoes_tecnicas', 'criterio_julgamento'],
    checklist: [
      { field: 'especificacoes_tecnicas', rule: 'min_words_100', weight: 20, description: 'Especificações técnicas detalhadas' },
      { field: 'criterio_julgamento',     rule: 'not_blank',     weight: 15, description: 'Critério de julgamento definido' },
      { field: 'prazo_execucao',          rule: 'not_blank',     weight: 15, description: 'Prazo de execução definido' },
      { field: 'garantia_percentual',     rule: 'not_blank',     weight: 15, description: 'Garantia contratual definida' },
      { field: 'penalidades',             rule: 'not_blank',     weight: 15, description: 'Penalidades e sanções definidas' },
      { field: 'fiscalizacao_responsavel',rule: 'not_blank',     weight: 20, description: 'Fiscal do contrato definido' },
    ],
    buildMasterPrompt: (extracted, missing, legal, market, sustainability) => `
${missing.length > 0 ? `⚠️ CAMPOS AUSENTES — escreva "A INFORMAR": ${missing.join(', ')}` : ''}

## DADOS EXTRAÍDOS:
${JSON.stringify(extracted, null, 2)}

## REFERÊNCIAS LEGAIS VERIFICADAS:
${legal}

## DADOS DE MERCADO:
${market}

## SUSTENTABILIDADE:
${sustainability}

## MISSÃO:
Elabore um Termo de Referência juridicamente perfeito conforme art. 6º, XXIII
da Lei 14.133/2021. Extenso, fundamentado e à prova de impugnação.

## ESTRUTURA OBRIGATÓRIA:

### 1. DEFINIÇÃO DO OBJETO
[Precisão conforme Súmula 177 TCU. Vedação à indicação de marca (exceto padronização — art. 41)]

### 2. JUSTIFICATIVA E FUNDAMENTAÇÃO LEGAL

### 3. ESPECIFICAÇÕES TÉCNICAS DETALHADAS
[Tabela com todos os requisitos técnicos obrigatórios]

### 4. MODELO DE EXECUÇÃO E ACORDO DE NÍVEL DE SERVIÇO (SLA)
[Métricas objetivas de qualidade — art. 88, §3º]

### 5. DA HABILITAÇÃO JURÍDICA, FISCAL E TRABALHISTA

### 6. DA QUALIFICAÇÃO TÉCNICA
[Proporcional ao objeto — vedação a exigências restritivas]

### 7. ESTIMATIVA DO VALOR E SIGILO DO ORÇAMENTO (art. 24)

### 8. CRITÉRIOS DE MEDIÇÃO E PAGAMENTO
[Cronograma físico-financeiro. Glosa por ineficiência]

### 9. SANÇÕES ADMINISTRATIVAS (art. 156)
[Advertência, multa, impedimento, declaração de inidoneidade]
[Respeito ao contraditório e ampla defesa]

### 10. OBRIGAÇÕES DA CONTRATADA E DA CONTRATANTE

### 11. GESTÃO E FISCALIZAÇÃO DO CONTRATO
[Fiscal titular e substituto — art. 117]

### 12. CRITÉRIOS DE SUSTENTABILIDADE

### 13. DISPOSIÇÕES GERAIS
    `.trim(),
  },

  // ── ESTUDO DE VIABILIDADE ─────────────────────────────────────────────────
  [DocumentType.VIABILIDADE]: {
    extractionSchema: {
      objeto_concessao:       'Objeto sendo concedido ou viabilizado',
      prazo_anos:             'Prazo da concessão ou contrato em anos',
      valor_investimento:     'Valor total de investimento estimado',
      receitas_previstas:     'Projeção de receitas tarifárias e acessórias',
      custos_operacionais:    'Estimativa de OPEX anual',
      premissas_financeiras:  'Taxa de desconto, inflação, TMA utilizadas',
      analise_demanda:        'Estudos de demanda ou fluxo disponíveis',
      secretaria:             'Secretaria ou órgão responsável',
      elaborado_por:          'Responsável pelo estudo',
    },
    requiredFields: ['objeto_concessao', 'valor_investimento'],
    checklist: [
      { field: 'analise_financeira',  rule: 'min_words_100', weight: 30, description: 'Análise financeira detalhada (TIR/VPL)' },
      { field: 'comparacao_solucoes', rule: 'min_words_50',  weight: 25, description: 'Comparação de mínimo 2 soluções' },
      { field: 'analise_riscos',      rule: 'min_words_50',  weight: 25, description: 'Riscos do projeto identificados' },
      { field: 'conclusao',           rule: 'not_blank',     weight: 20, description: 'Parecer conclusivo emitido' },
    ],
    buildMasterPrompt: (extracted, missing, legal, market) => `
${missing.length > 0 ? `⚠️ CAMPOS AUSENTES — escreva "A INFORMAR": ${missing.join(', ')}` : ''}

## DADOS EXTRAÍDOS:
${JSON.stringify(extracted, null, 2)}

## REFERÊNCIAS LEGAIS VERIFICADAS:
${legal}

## BENCHMARKS DE MERCADO:
${market}

## MISSÃO:
Elabore um Estudo Técnico de Viabilidade completo para embasar decisão de
contratação de grande vulto, concessão ou PPP.

## ESTRUTURA OBRIGATÓRIA:

### 1. IDENTIFICAÇÃO E OBJETO DO ESTUDO

### 2. DIAGNÓSTICO DA SITUAÇÃO ATUAL
[Problema a ser resolvido — necessidade pública]

### 3. COMPARAÇÃO DE SOLUÇÕES (BENCHMARKING)
[Solução A × Solução B × Solução C]
[Para cada uma: tecnologia, custo de implantação, custo operacional, vida útil]

### 4. ANÁLISE DE TCO — CUSTO TOTAL DE PROPRIEDADE
[Não apenas menor preço inicial — considerar ciclo de vida completo (art. 11)]

### 5. ANÁLISE FINANCEIRA
[TIR esperada | VPL calculado | Payback estimado | TMA de referência]
[Premissas financeiras utilizadas]

### 6. ANÁLISE DE SENSIBILIDADE
[Cenário otimista, base e pessimista]

### 7. MATRIZ DE RISCOS DO PROJETO
[Riscos políticos, econômicos, tecnológicos, regulatórios]

### 8. PARECER CONCLUSIVO
[Solução recomendada + fundamentação na eficiência (art. 37 CF/88 e art. 11 Lei 14.133)]

### 9. RESPONSÁVEL E ASSINATURA
    `.trim(),
  },

  // ── RESPOSTA À IMPUGNAÇÃO ─────────────────────────────────────────────────
  [DocumentType.IMPUGNACAO]: {
    extractionSchema: {
      objeto_licitacao:     'Objeto da licitação sendo impugnada',
      numero_edital:        'Número do edital ou processo licitatório',
      empresa_impugnante:   'Nome da empresa que apresentou a impugnação',
      data_impugnacao:      'Data de protocolo da impugnação',
      argumentos_empresa:   'Principais argumentos apresentados pela empresa',
      secretaria:           'Secretaria responsável pela licitação',
    },
    requiredFields: ['objeto_licitacao', 'argumentos_empresa'],
    checklist: [
      { field: 'admissibilidade', rule: 'not_blank',     weight: 20, description: 'Análise de admissibilidade' },
      { field: 'merito',          rule: 'min_words_100', weight: 50, description: 'Análise de mérito contra-argumentada' },
      { field: 'conclusao',       rule: 'not_blank',     weight: 30, description: 'Conclusão pelo improvimento' },
    ],
    buildMasterPrompt: (extracted, missing, legal) => `
${missing.length > 0 ? `⚠️ CAMPOS AUSENTES — escreva "A INFORMAR": ${missing.join(', ')}` : ''}

## DADOS EXTRAÍDOS:
${JSON.stringify(extracted, null, 2)}

## REFERÊNCIAS LEGAIS VERIFICADAS:
${legal}

## MISSÃO:
Elabore um Parecer Jurídico de Resposta à Impugnação como defesa do órgão público.
Tom: combativo, técnico, assertivo. Desmonte os argumentos da empresa com lei e jurisprudência.

## ESTRUTURA OBRIGATÓRIA:

### RELATÓRIO
[Síntese do pedido e tempestividade — art. 164 Lei 14.133]

### DA ADMISSIBILIDADE (PRELIMINAR)
[Verificar tempestividade. Se genérica ou intempestiva — pedir não conhecimento]

### DO MÉRITO
[Para cada argumento da empresa, apresentar tese contrária fundamentada]
[Usar: Súmulas TCU, Poder Discricionário da Administração, princípios constitucionais]
[Latin forense onde couber: Periculum in mora, Pacta sunt servanda]

### CONCLUSÃO
"Opina-se pelo CONHECIMENTO e, no mérito, pelo IMPROVIMENTO (INDEFERIMENTO) da
impugnação, mantendo-se o Edital incólume em todos os seus termos..."

### RESPONSÁVEL E ASSINATURA
    `.trim(),
  },

};

export function getDocumentConfig(docType: DocumentType): DocumentConfig {
  const config = configs[docType];
  if (!config) {
    throw new Error(`Configuração não encontrada para o tipo: ${docType}`);
  }
  return config;
}
