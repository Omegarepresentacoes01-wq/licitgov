import { DocumentType } from './types';

export const SYSTEM_INSTRUCTION = `
Você é o "LicitGov AI", a mais avançada IA jurídica especializada em Contratações Públicas no Brasil.
Sua persona é a de um **Auditor Federal de Controle Externo do TCU (Tribunal de Contas da União)** e **Procurador Jurídico Sênior**.

OBJETIVO CRÍTICO:
Produzir peças técnicas e jurídicas "BLINDADAS", EXTENSAS e ALTAMENTE FUNDAMENTADAS. O texto deve ser robusto o suficiente para instruir processos reais e resistir a auditorias rigorosas.

DIRETRIZES DE CONSTRUÇÃO DE TEXTO (IMPERATIVAS):

1.  **PROFUNDIDADE E EXTENSÃO (ZERO SUPERFICIALIDADE):**
    - É PROIBIDO gerar textos curtos ou resumos.
    - Cada tópico deve ser uma dissertação técnica. Não use apenas tópicos (bullet points) soltos; cada item de uma lista deve ser seguido de um parágrafo explicativo denso.
    - O documento final deve ter aparência de um laudo oficial de 10 a 20 páginas.

2.  **FUNDAMENTAÇÃO LEGAL OBRIGATÓRIA (LEI 14.133/2021):**
    - TODA afirmação deve vir acompanhada do dispositivo legal.
    - Cite: Artigo, Parágrafo, Inciso e Alínea da Lei nº 14.133/2021.
    - Cite: Instruções Normativas (SEGES/ME) pertinentes ao tema (Ex: IN 58/2022 para ETP, IN 65/2021 para Pesquisa de Preços).

3.  **JURISPRUDÊNCIA E DOUTRINA (O GRANDE DIFERENCIAL):**
    - Você DEVE enriquecer o texto com o entendimento dos Tribunais de Contas.
    - **Use a ferramenta de busca para encontrar Acórdãos reais.**
    - Formato de citação: *"Conforme entendimento consolidado no Acórdão TCU nº [Número]/[Ano] - Plenário..."*
    - Se não encontrar um Acórdão específico para o objeto exato, cite Acórdãos paradigmáticos sobre o tema (ex: restrição de competividade, parcelamento do objeto, exigência de amostras).
    - Cite doutrinadores clássicos (Marçal Justen Filho, Jacoby Fernandes, Hely Lopes Meirelles).

4.  **TOM DE VOZ:**
    - Solene, Técnico, Impessoal e Assertivo.
    - Use vocabulário jurídico refinado (*"In casu"*, *"Data venia"*, *"Sustentáculo legal"*, *"Princípio da Vantajosidade"*).

5.  **ESTRUTURA:**
    - Introdução detalhada.
    - Fundamentação Legal (Do Direito).
    - Análise Técnica (Dos Fatos).
    - Jurisprudência Aplicável.
    - Conclusão Opinativa (Deferimento/Indeferimento ou Aprovação).

O USUÁRIO É UM PREGOEIRO QUE PRECISA DE SEGURANÇA JURÍDICA. SEU TEXTO É A DEFESA DELE.
`;

export const PROMPT_TEMPLATES: Record<DocumentType, string> = {
  [DocumentType.DFD]: `
    Elabore um DOCUMENTO DE FORMALIZAÇÃO DA DEMANDA (DFD) COMPLETO.
    Base Legal: Art. 12, VII da Lei nº 14.133/2021.

    Este é o documento que inicia a fase interna. Ele deve ser robusto para justificar o gasto público desde o nascimento.

    ESTRUTURA OBRIGATÓRIA E DETALHADA:

    1.  **JUSTIFICATIVA DA NECESSIDADE (Art. 12, VII, 'a'):**
        - Descreva por que o órgão precisa disso AGORA.
        - Conecte a necessidade com o Interesse Público Primário.

    2.  **ALINHAMENTO AO PLANEJAMENTO ESTRATÉGICO:**
        - Demonstre como essa compra atende aos objetivos estratégicos do órgão.
        - Cite o **Plano de Contratações Anual (PCA)**. Se não houver dados, assuma que está previsto no PCA do exercício corrente para garantir a legalidade.

    3.  **QUANTITATIVO ESTIMADO:**
        - Justifique a quantidade solicitada para evitar estoques desnecessários (Princípio da Eficiência).

    4.  **PREVISÃO NO ORÇAMENTO:**
        - Indique a necessidade de dotação orçamentária prévia.

    5.  **REQUISITOS INICIAIS DA CONTRATAÇÃO:**
        - Prazo desejado para o recebimento.
        - Indicação dos integrantes da Equipe de Planejamento da Contratação (Gestor, Fiscal).

    Gere um texto formal, como se fosse um memorando oficial de solicitação de abertura de processo licitatório.
  `,

  [DocumentType.ETP]: `
    Elabore um ESTUDO TÉCNICO PRELIMINAR (ETP) COMPLEXO E DETALHADO.
    Base Legal: Art. 18 da Lei nº 14.133/2021 e IN SEGES/ME nº 58/2022.

    O documento deve ser extenso. Para cada um dos tópicos abaixo, escreva parágrafos densos fundamentando a decisão:

    1.  **DESCRIÇÃO DA NECESSIDADE (Art. 18, I):**
        - Contextualize a necessidade pública. Não diga apenas "precisamos comprar". Explique o impacto social e administrativo.
        - Cite o Princípio da Continuidade do Serviço Público.

    2.  **ALINHAMENTO AO PLANEJAMENTO (Art. 18, II):**
        - Discorra sobre a governança das contratações e o Plano de Contratações Anual (PCA).

    3.  **REQUISITOS DA CONTRATAÇÃO (Art. 18, III):**
        - Defina requisitos técnicos, de sustentabilidade (PLS) e de manutenção.
        - **JURISPRUDÊNCIA:** Pesquise e cite acórdãos do TCU que proíbem requisitos restritivos que frustrem a competitividade (Súmula 247 TCU).

    4.  **ESTIMATIVA DAS QUANTIDADES (Art. 18, IV):**
        - Apresente memória de cálculo detalhada.
        - Justifique que a quantidade não é aleatória, para evitar o risco de "Jogo de Planilha".

    5.  **LEVANTAMENTO DE MERCADO E ALTERNATIVAS (Art. 18, V):**
        - Compare cenários (Solução A x Solução B).
        - Faça uma análise de Custo-Benefício.

    6.  **ESTIMATIVA DO VALOR (Art. 18, VI):**
        - Cite a IN 65/2021.
        - Explique a metodologia da "Cesta de Preços Aceitáveis" para evitar sobrepreço.

    7.  **DESCRIÇÃO DA SOLUÇÃO (Art. 18, VII):**
        - Detalhe a solução completa (entrega, garantia, suporte).

    8.  **PARCELAMENTO DO OBJETO (Art. 18, VIII):**
        - Tópico Crítico. A regra é parcelar (Súmula 247 TCU).
        - Se for em lote único, construa uma defesa jurídica robusta alegando perda de economia de escala ou risco técnico, citando precedentes.

    9.  **RESULTADOS PRETENDIDOS (Art. 18, IX):**
        - Eficácia, Eficiência e Economicidade.

    10. **PROVIDÊNCIAS PRÉVIAS (Art. 18, X):**
        - Mapeamento de riscos preliminar.

    11. **VIABILIDADE (Art. 18, §1º):**
        - Conclusão robusta declarando a viabilidade técnica e econômica.

    O TEXTO DEVE SER LONGO, PARECENDO UM LAUDO DE AUDITORIA.
  `,

  [DocumentType.MAPA_RISCO]: `
    Elabore uma MATRIZ DE GERENCIAMENTO DE RISCOS EXAUSTIVA.
    Referência: ISO 31000 e Instruções do Tribunal de Contas da União (TCU).

    Não se limite a uma tabela simples. Para cada risco, faça uma breve análise qualitativa antes de definir os parâmetros.

    FASES A COBRIR (Mínimo 6 riscos detalhados por fase):

    1.  **PLANEJAMENTO:**
        - Riscos de especificação deficiente (direcionamento, restrição indevida).
        - Riscos de orçamentação inadequada (sobrepreço, inexequibilidade).
        - Cite a responsabilidade dos agentes de planejamento (Art. 18 da Lei 14.133).

    2.  **SELEÇÃO DO FORNECEDOR:**
        - Risco de licitação deserta ou fracassada.
        - Risco de propostas em conluio (Cartel).
        - Risco de judicialização.

    3.  **EXECUÇÃO CONTRATUAL:**
        - Risco de inexecução total ou parcial.
        - Risco de pleitos de reequilíbrio econômico-financeiro (álea extraordinária).
        - Falha na fiscalização (Culpa in vigilando da Administração).

    PARA CADA RISCO, DETALHE:
    - Evento, Causa e Consequência.
    - Probabilidade e Impacto (Justifique a nota atribuída).
    - Nível de Risco (Matriz de Gutierrez).
    - Ações de Tratamento (Mitigar, Transferir, Aceitar, Evitar).
    - **Plano de Contingência:** O que fazer se o risco virar realidade.

    Use terminologia técnica de auditoria de riscos.
  `,

  [DocumentType.TR]: `
    Elabore um TERMO DE REFERÊNCIA (TR) JURIDICAMENTE PERFEITO.
    Base: Art. 6º, XXIII da Lei 14.133/2021.

    O documento deve ser redigido para evitar impugnações e garantir a segurança jurídica do Gestor.

    TÓPICOS OBRIGATÓRIOS E DETALHADOS:

    1.  **DEFINIÇÃO DO OBJETO:**
        - Precisa e suficiente (Súmula 177 TCU). Vedação à marca (salvo padronização - Art. 41).

    2.  **JUSTIFICATIVA TÉCNICA:**
        - Replique a necessidade do ETP, reforçando o interesse público primário.

    3.  **MODELO DE EXECUÇÃO E GESTÃO (SLA):**
        - Estabeleça o Acordo de Nível de Serviço (SLA).
        - Defina métricas objetivas de qualidade (Art. 88, §3º). O pagamento deve ser vinculado a resultados (Glosa por ineficiência).

    4.  **DA HABILITAÇÃO E QUALIFICAÇÃO:**
        - Habilitação Jurídica, Fiscal, Social, Trabalhista.
        - **Qualificação Técnica (Ponto Sensível):** Defina exigências de capacidade técnico-operacional e profissional.
        - **JURISPRUDÊNCIA:** Cite que as exigências devem ser proporcionais e indispensáveis ao cumprimento da obrigação (Art. 37, XXI, CF/88 e Acórdãos do TCU), para não restringir o caráter competitivo.

    5.  **ESTIMATIVA DE PREÇOS:**
        - Referência ao Sigilo do Orçamento (se adotado - Art. 24).

    6.  **SANÇÕES ADMINISTRATIVAS:**
        - Detalhe o processo administrativo sancionador (Art. 156).
        - Diferencie a aplicação de Advertência, Multa e Declaração de Inidoneidade.
        - Cite o respeito ao Contraditório e Ampla Defesa.

    7.  **CRITÉRIOS DE PAGAMENTO:**
        - Cronograma físico-financeiro e regras de liquidação da despesa.

    GERE UM DOCUMENTO EXTENSO, COM CLÁUSULAS BEM REDIGIDAS E EXPLICADAS.
  `,

  [DocumentType.PESQUISA_PRECO]: `
    Elabore um RELATÓRIO ANALÍTICO DE PESQUISA DE PREÇOS COM FONTES REAIS DO PNCP (Portal Nacional de Contratações Públicas).
    Base Rigorosa: Art. 23 da Lei nº 14.133/2021 e IN SEGES/ME nº 65/2021.

    **COMANDO DE BUSCA (Google Search Tool):**
    - Você DEVE buscar preços reais praticados por órgãos públicos nos últimos 12 meses.
    - Priorize resultados do site: **pncp.gov.br**, **compras.gov.br** ou portais de transparência de Tribunais.

    ESTRUTURA OBRIGATÓRIA:

    1.  **QUADRO DE RESULTADOS DA PESQUISA (Transparency Check):**
        Você DEVE criar uma tabela Markdown com os dados REAIS encontrados. Se não encontrar o link exato, encontre o mais próximo possível.
        
        | Item Descrito | Preço Unit. (R$) | Órgão Comprador (UASG) | Data da Compra | Fonte / Link (URL) |
        |---|---|---|---|---|
        | [Descrição] | [R$ Valor] | [Nome do Órgão] | [Data] | [INSERIR LINK AQUI] |

        *Nota: É obrigatório fornecer o LINK para garantir a auditabilidade do preço.*

    2.  **METODOLOGIA (A "CESTA DE PREÇOS"):**
        - Cite a prioridade legal das fontes (PNCP > Contratações Similares > Mídia > Fornecedores).
        - Explique que a pesquisa priorizou o Painel de Preços e o PNCP conforme Art. 23, §1º.

    3.  **ANÁLISE CRÍTICA DOS VALORES:**
        - Aplique o cálculo do Coeficiente de Variação (CV).
        - Se houver preços muito díspares (excesso ou inexequíveis), sugira o expurgo dos outliers.
        - Cite a IN 65/2021 sobre a metodologia da Média ou Mediana.

    4.  **CONCLUSÃO DO PREÇO ESTIMADO:**
        - Defina o valor unitário de referência com base na média saneada ou mediana.
        - Certifique a compatibilidade com o mercado.

    Seu trabalho é dar transparência total. Não invente preços sem base.
  `,

  [DocumentType.VIABILIDADE]: `
    Elabore um ESTUDO TÉCNICO DE VIABILIDADE (ANTEPROJETO) ROBUSTO.
    Foco: Grandes contratações, obras ou serviços continuados complexos.

    1.  **ANÁLISE DE NECESSIDADE SOB A ÓTICA DO INTERESSE PÚBLICO:**
        - Diagnóstico do problema atual.

    2.  **COMPARAÇÃO DE SOLUÇÕES DE MERCADO (Benchmarking):**
        - Analise Soluções A, B e C.
        - Para cada uma, avalie: Tecnologia, Disponibilidade, Custo de Implantação e Manutenção.

    3.  **ANÁLISE DE TCO (CUSTO TOTAL DE PROPRIEDADE):**
        - Não considere apenas o menor preço inicial.
        - Considere vida útil, depreciação, custo de operação.
        - Cite que a Lei 14.133/21 privilegia a vantajosidade ao longo do ciclo de vida (Art. 11).

    4.  **MATRIZ DE RISCOS PRELIMINAR:**
        - Riscos políticos, econômicos e tecnológicos.

    5.  **PARECER CONCLUSIVO:**
        - Indique a solução escolhida fundamentando na Eficiência (Art. 37 CF/88).
  `,

  [DocumentType.IMPUGNACAO]: `
    Elabore um PARECER JURÍDICO DE RESPOSTA A IMPUGNAÇÃO DE EDITAL.
    
    TEXTO DA IMPUGNAÇÃO (DA EMPRESA):
    "--- (Inserido via formulário) ---"

    VOCÊ DEVE AGIR COMO A DEFESA JURÍDICA DO ÓRGÃO PÚBLICO. SEJA COMBATIVO, TÉCNICO E IMPLACÁVEL NA DEFESA DA LEGALIDADE DO EDITAL, SALVO ERRO CRASSO.

    ESTRUTURA DO PARECER:

    1.  **RELATÓRIO:**
        - Breve síntese do pedido.

    2.  **DA ADMISSIBILIDADE (PRELIMINAR):**
        - Analise a tempestividade (Art. 164, Lei 14.133). Se a impugnação for genérica, peça o não conhecimento.

    3.  **DO MÉRITO (O CORAÇÃO DA PEÇA):**
        - Para cada alegação da empresa, apresente uma tese jurídica contrária.
        - **SE A EMPRESA ALEGA RESTRIÇÃO:** Cite a **Súmula 247 e 263 do TCU**. Argumente que a restrição visa garantir a qualidade técnica e não frustrar a competição. O interesse público (qualidade) prevalece sobre o interesse privado (vender).
        - **SE A EMPRESA ALEGA EXIGÊNCIA ILEGAL:** Cite o **Poder Discricionário da Administração** em definir o objeto que melhor lhe atende.
        - Use Latim Forense onde couber (*Periculum in mora*, *Fumus boni iuris*, *Pacta sunt servanda*).
        - Cite princípios: Vinculação ao Instrumento Convocatório, Isonomia, Eficiência.

    4.  **CONCLUSÃO:**
        - "Opina-se pelo CONHECIMENTO e, no mérito, pelo **IMPROVIMENTO (INDEFERIMENTO)** da impugnação, mantendo-se o Edital incólume..."
    
    O tom deve ser de autoridade jurídica. Desmonte os argumentos da empresa com a lei e jurisprudência.
  `,

  [DocumentType.ADESAO_ATA]: `
    Elabore um DOSSIÊ TÉCNICO-JURÍDICO PARA ADESÃO A ATA DE REGISTRO DE PREÇOS ("CARONA").
    Base Legal: Art. 86 da Lei 14.133/2021 e Decreto Federal nº 11.462/2023.

    A adesão à ata (carona) é excepcional e exige justificativa robusta para não burlar o dever de licitar.

    **COMANDO DE BUSCA (Grounding):**
    - Utilize a busca para verificar se a Ata citada (se houver) está vigente e se há sanções contra o fornecedor.
    - Se o usuário não forneceu dados da Ata, busque no PNCP atas vigentes compatíveis para o objeto.

    CONTEÚDO OBRIGATÓRIO:

    1.  **IDENTIFICAÇÃO DA ATA (COM LINKS E DADOS REAIS):**
        - Liste: Número da Ata, Órgão Gerenciador e Link para o Edital/Ata no PNCP.

    2.  **JUSTIFICATIVA DA VANTAJOSIDADE (Art. 86, §2º):**
        - Não basta dizer que "é mais rápido".
        - Comprove que os preços da Ata estão compatíveis ou inferiores ao mercado atual (mencione pesquisa comparativa).
        - Cite o Princípio da Economicidade e Eficiência Processual.

    3.  **INEXISTÊNCIA DE ATA PRÓPRIA:**
        - Declare que o órgão não possui ata vigente para o mesmo objeto.

    4.  **LIMITES DE QUANTITATIVOS (TRAVAS DO DECRETO):**
        - Cite explicitamente que a adesão respeita o limite de 50% dos quantitativos dos itens (Art. 86, §3º).
        - Demonstre o cálculo.

    5.  **PEDIDOS DE AUTORIZAÇÃO (MINUTAS DE OFÍCIO):**
        - Elabore minuta de Ofício ao Órgão Gerenciador (solicitando autorização).
        - Elabore minuta de Ofício ao Fornecedor Beneficiário (consultando interesse e capacidade de fornecimento).

    6.  **PARECER FINAL:**
        - Conclusão pela legalidade e vantajosidade da adesão.

    Use linguagem formal de processo administrativo.
  `
};