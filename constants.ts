import { DocumentType } from './types';

export const SYSTEM_INSTRUCTION = `
Você é o "LicitGov AI", a maior autoridade em Direito Administrativo e Licitações Públicas do Brasil.
Sua persona é a de um Procurador Jurídico Sênior e Auditor do Tribunal de Contas (TCU) com 30 anos de experiência.

OBJETIVO FINAL:
Gerar documentos administrativos com "Blindagem Jurídica". O texto deve ser tão robusto, detalhado e fundamentado que nenhum órgão de controle (TCE/TCU) possa apontar falhas ou omissões.

DIRETRIZES DE ESCRITA (ALTA RIGOROSIDADE):
1.  **EXAUSTIVIDADE:** Nunca economize palavras. Se um tópico exige 3 páginas de explicação técnica, escreva 3 páginas. O documento deve ser longo, detalhado e denso.
2.  **FUNDAMENTAÇÃO LEGAL:** Para cada afirmação, decisão ou critério adotado, você DEVE citar o Artigo, Inciso e Parágrafo correspondente da Lei 14.133/2021, ou Súmulas do TCU quando aplicável.
3.  **PROFUNDIDADE TÉCNICA:** Não use frases genéricas como "conforme a lei". Especifique "conforme o Art. 18, §1º, inciso III da Lei 14.133/2021".
4.  **SEM RESUMOS:** É estritamente proibido resumir, usar reticências (...) ou placeholders. Escreva o conteúdo real e final.
5.  **ESTILO:** Formal, culto, impessoal e técnico.

SUA REPUTAÇÃO ESTÁ EM JOGO. ERROS OU OMISSÕES SÃO INACEITÁVEIS.
`;

export const PROMPT_TEMPLATES: Record<DocumentType, string> = {
  [DocumentType.ETP]: `
    Elabore um ESTUDO TÉCNICO PRELIMINAR (ETP) DIGITAL DE ALTA COMPLEXIDADE, em estrita conformidade com o Art. 18 da Lei nº 14.133/2021 e IN SEGES/ME nº 58/2022.

    O documento deve ser extremamente detalhado, contendo obrigatoriamente os seguintes elementos, desenvolvidos com profundidade argumentativa:

    1.  **DESCRIÇÃO DA NECESSIDADE DA CONTRATAÇÃO (Art. 18, I):**
        - Descreva o problema público de forma analítica.
        - Vincule a necessidade ao interesse público e à missão institucional do órgão.
        - Cite a obrigatoriedade da continuidade do serviço público.

    2.  **PREVISÃO NO PLANO DE CONTRATAÇÕES ANUAL (Art. 18, II):**
        - Verifique e declare o alinhamento com o planejamento estratégico. Caso não conste, justifique juridicamente a inclusão extemporânea.

    3.  **REQUISITOS DA CONTRATAÇÃO (Art. 18, III):**
        - Liste requisitos técnicos, legais, de segurança, de sustentabilidade (PLS) e de manutenção.
        - Justifique cada requisito com base na eficiência e na isonomia.

    4.  **ESTIMATIVA DAS QUANTIDADES (Art. 18, IV):**
        - APRESENTE MEMÓRIA DE CÁLCULO DETALHADA. Não lance apenas números. Explique a metodologia de cálculo (consumo histórico, projeção de demanda, benchmarks).

    5.  **LEVANTAMENTO DE MERCADO E ALTERNATIVAS (Art. 18, V):**
        - Compare diferentes soluções possíveis (ex: Comprar vs Locar, Software A vs B).
        - Justifique tecnicamente e economicamente a escolha da solução final.

    6.  **ESTIMATIVA DO VALOR DA CONTRATAÇÃO (Art. 18, VI):**
        - Descreva a metodologia de pesquisa de preços que será utilizada (Painel de Preços, Média, Mediana), citando a IN 65/2021.

    7.  **DESCRIÇÃO DA SOLUÇÃO COMO UM TODO (Art. 18, VII):**
        - Ciclo de vida do produto, assistência técnica, garantia, logística reversa.

    8.  **JUSTIFICATIVA PARA O PARCELAMENTO OU NÃO (Art. 18, VIII):**
        - Aplique a Súmula 247 do TCU. A regra é parcelar. Se não parcelar, justifique a inviabilidade técnica ou econômica de forma robusta.

    9.  **RESULTADOS PRETENDIDOS (Art. 18, IX):**
        - Liste métricas de economicidade, eficácia e eficiência esperadas.

    10. **PROVIDÊNCIAS PRÉVIAS (Art. 18, X):**
        - O que o órgão precisa fazer antes do contrato iniciar? (Adequação de rede elétrica, espaço físico, nomeação de fiscais).

    11. **CONTRATAÇÕES CORRELATAS E INTERDEPENDENTES (Art. 18, XI).**

    12. **IMPACTOS AMBIENTAIS (Art. 18, XII):**
        - Análise detalhada de sustentabilidade e mitigação de danos.

    13. **POSICIONAMENTO CONCLUSIVO SOBRE A VIABILIDADE (Art. 18, §1º):**
        - Declaração formal e fundamentada de que a contratação é VIÁVEL e atende ao INTERESSE PÚBLICO.

    GERE UM DOCUMENTO LONGO E COMPLETO, DIGNO DE UMA AUDITORIA.
  `,

  [DocumentType.MAPA_RISCO]: `
    Elabore um MATRIZ DE GERENCIAMENTO DE RISCOS completa e detalhada, baseada na ISO 31000 e nas orientações do TCU.

    Para cada fase abaixo, identifique MINIMAMENTE 5 (cinco) riscos específicos e técnicos (não use riscos genéricos). Para cada risco, detalhe:

    ESTRUTURA PARA CADA RISCO:
    a) **Evento de Risco**: Descrição clara do que pode acontecer.
    b) **Causa**: O que provoca esse risco?
    c) **Consequência**: Impacto no resultado da licitação ou contrato.
    d) **Probabilidade**: (Baixa / Média / Alta) - Justifique.
    e) **Impacto**: (Baixo / Médio / Alto) - Justifique.
    f) **Nível de Risco**: (Cálculo Probabilidade x Impacto).
    g) **Tratamento/Resposta**: (Mitigar, Evitar, Transferir, Aceitar).
    h) **Ações de Controle (Preventivas)**: O que fazer para não acontecer?
    i) **Ações de Contingência (Corretivas)**: O que fazer se acontecer?
    j) **Responsável**: Cargo/Setor responsável.

    FASES OBRIGATÓRIAS:
    1.  **RISCOS NA FASE DE PLANEJAMENTO (ETP/TR):**
        - Ex: Especificação restritiva, superestimativa de preços, deficiência na definição do objeto.
    2.  **RISCOS NA FASE DE SELEÇÃO DO FORNECEDOR (LICITAÇÃO):**
        - Ex: Licitação deserta, propostas inexequíveis, conluio, recursos protelatórios.
    3.  **RISCOS NA FASE DE GESTÃO CONTRATUAL:**
        - Ex: Inexecução total/parcial, entrega de material de baixa qualidade, falência da contratada, falha na fiscalização.

    O documento deve demonstrar ao órgão de controle que a administração previu todos os cenários adversos possíveis.
  `,

  [DocumentType.TR]: `
    Elabore um TERMO DE REFERÊNCIA (TR) EXTREMAMENTE ROBUSTO, em conformidade total com o Art. 6º, XXIII da Lei 14.133/2021.
    Este documento servirá de base para o Edital e o Contrato, portanto, deve ser impecável.

    ESTRUTURA OBRIGATÓRIA E DETALHADA:

    1.  **DEFINIÇÃO DO OBJETO:**
        - Descrição minuciosa, clara e precisa. Vedada especificação que direcione marca (salvo padronização justificada).

    2.  **FUNDAMENTAÇÃO DA CONTRATAÇÃO:**
        - Referência direta ao ETP e à necessidade pública.

    3.  **DESCRIÇÃO DA SOLUÇÃO COMO UM TODO:**
        - Especificações técnicas detalhadas, normas ABNT aplicáveis, ISOs exigidas.

    4.  **REQUISITOS DA CONTRATAÇÃO:**
        - Garantia da proposta e garantia contratual (Art. 96).
        - Experiência mínima e capacidade técnica operacional/profissional.

    5.  **MODELO DE EXECUÇÃO DO OBJETO (SLA - ACORDO DE NÍVEL DE SERVIÇO):**
        - Prazos de entrega/execução (cronograma físico-financeiro detalhado).
        - Local, horários e condições de recebimento.
        - Definição de níveis mínimos de qualidade aceitáveis.

    6.  **MODELO DE GESTÃO DO CONTRATO (Art. 117):**
        - Atribuições detalhadas do Gestor do Contrato e dos Fiscais (Técnico, Administrativo, Setorial).
        - Procedimentos de fiscalização e rotinas de acompanhamento.

    7.  **CRITÉRIOS DE MEDIÇÃO E PAGAMENTO (Art. 141):**
        - Vinculação do pagamento ao desempenho (se cabível).
        - Prazo de pagamento (Art. 143).
        - Documentação exigida para Nota Fiscal.

    8.  **FORMA E CRITÉRIOS DE SELEÇÃO DO FORNECEDOR:**
        - Modalidade, critério de julgamento e modo de disputa.
        - Exigências de Habilitação (Jurídica, Fiscal, Social, Trabalhista, Técnica, Econômica) - Cite os artigos 62 a 70 da Lei 14.133.

    9.  **ESTIMATIVA DO VALOR DA CONTRATAÇÃO:**
        - Valor máximo aceitável e sigilo do orçamento (se aplicável).

    10. **ADEQUAÇÃO ORÇAMENTÁRIA:**
        - Indicação da dotação orçamentária.

    11. **INFRAÇÕES E SANÇÕES ADMINISTRATIVAS (Art. 155 e 156):**
        - Liste detalhadamente as condutas infracionais e as penas (Advertência, Multa, Impedimento, Declaração de Inidoneidade).
        - Estipule os percentuais de multa moratória e compensatória.

    Escreva cada item com precisão cirúrgica para evitar impugnações.
  `,

  [DocumentType.PESQUISA_PRECO]: `
    Elabore um DOCUMENTO TÉCNICO DE PESQUISA DE PREÇOS E ORÇAMENTO ESTIMADO, conforme Art. 23 da Lei 14.133/2021 e IN 65/2021.

    O documento deve blindar o processo contra acusações de sobrepreço ou subpreço.

    CONTEÚDO OBRIGATÓRIO:

    1.  **IDENTIFICAÇÃO DO OBJETO ORÇADO:**
        - Especificação exata utilizada na cotação.

    2.  **PARÂMETROS E FONTES DE PESQUISA (Art. 23, §1º):**
        - Priorize e descreva o uso do PNCP (Portal Nacional de Contratações Públicas).
        - Contratações similares de outros entes (comprovando similaridade).
        - Mídia especializada e sítios eletrônicos.
        - Pesquisa direta com no mínimo 3 (três) fornecedores (último recurso).
        - Justifique a escolha das fontes.

    3.  **DATA BASE E VALIDADE DAS PROPOSTAS:**
        - Defina o período da pesquisa (máximo 6 meses ou conforme regra local).

    4.  **TRATAMENTO DOS DADOS (CRITICIDADE):**
        - Metodologia de Expurgo: Explique como valores inexequíveis ou excessivamente elevados foram descartados (Coeficiente de Variação).

    5.  **DEFINIÇÃO DO VALOR ESTIMADO:**
        - Justifique tecnicamente a escolha entre:
          a) MENOR PREÇO (Justificar por que não traz risco à qualidade).
          b) MÉDIA SANEADA (Padrão mais aceito).
          c) MEDIANA (Para evitar distorções de extremos).
        - Apresente a memória de cálculo simulada.

    6.  **CERTIFICAÇÃO DE COMPATIBILIDADE:**
        - Declaração de que os preços estão compatíveis com o mercado.

    7.  **MATRIZ DE RISCO ORÇAMENTÁRIO:**
        - Riscos de variação cambial, inflação setorial, etc.

    Seja extremamente técnico na metodologia estatística.
  `,

  [DocumentType.VIABILIDADE]: `
    Elabore um ESTUDO TÉCNICO DE VIABILIDADE (Antecedente ao ETP em projetos complexos).
    Foco: Análise de Custo-Benefício e Soluções de Mercado para grandes contratações.

    DESENVOLVA:
    1.  **ANÁLISE DAS ALTERNATIVAS POSSÍVEIS:**
        - Descreva pelo menos 3 cenários de solução para o problema.
        - Ex: Cenário A (Compra), Cenário B (Locação), Cenário C (Desenvolvimento Interno).

    2.  **VIABILIDADE TÉCNICA:**
        - O mercado dispõe de tecnologia madura? Há fornecedores suficientes para garantir competição?

    3.  **VIABILIDADE ECONÔMICA (TCO - Total Cost of Ownership):**
        - Não analise apenas o preço de compra. Analise:
          - Custo de aquisição.
          - Custo de instalação/treinamento.
          - Custo de operação (energia, insumos).
          - Custo de manutenção (peças, suporte).
          - Custo de descarte (fim de vida útil).
        - Compare o TCO dos cenários.

    4.  **VIABILIDADE JURÍDICA:**
        - Há vedação legal para alguma das soluções? Há riscos de questionamento judicial?

    5.  **VIABILIDADE AMBIENTAL:**
        - Qual solução gera menor impacto ambiental?

    6.  **CONCLUSÃO E RECOMENDAÇÃO:**
        - Indique a solução mais vantajosa para a Administração Pública com base em dados objetivos.
  `
};