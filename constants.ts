import { DocumentType } from './types';

export interface AIModel {
  id: string;
  label: string;
  provider: 'Google' | 'Anthropic' | 'OpenAI' | 'DeepSeek' | 'Meta';
  desc: string;
  badge?: string;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'google/gemini-2.5-pro',
    label: 'LicitGov Pro',
    provider: 'Google',
    desc: 'Ideal para ETP, TR e Mapa de Risco. Melhor equilíbrio entre qualidade jurídica e velocidade. Recomendado para a maioria dos documentos.',
    badge: 'Recomendado',
  },
  {
    id: 'google/gemini-2.0-flash-001',
    label: 'LicitGov Flash',
    provider: 'Google',
    desc: 'Geração ultra rápida. Ótimo para rascunhos iniciais ou quando o prazo é curto. Consome menos créditos.',
  },
  {
    id: 'anthropic/claude-sonnet-4.6',
    label: 'LicitGov Elite',
    provider: 'Anthropic',
    desc: 'Melhor modelo para escrita jurídica formal. Produz textos mais elaborados, com maior precisão na citação de leis e acórdãos do TCU.',
  },
  {
    id: 'anthropic/claude-haiku-4.5',
    label: 'LicitGov Express',
    provider: 'Anthropic',
    desc: 'Versão econômica com boa qualidade jurídica. Indicado para documentos mais simples como DFD e Estudo de Viabilidade.',
  },
  {
    id: 'deepseek/deepseek-r1',
    label: 'LicitGov Deep',
    provider: 'DeepSeek',
    desc: 'Motor de raciocínio avançado. Excelente para Mapa de Risco e análises complexas. Pensa antes de responder — mais lento, porém mais preciso.',
    badge: 'Melhor para Riscos',
  },
  {
    id: 'openai/gpt-4o',
    label: 'LicitGov Max',
    provider: 'OpenAI',
    desc: 'Alta capacidade de análise e síntese. Muito bom para Pesquisa de Preço e documentos que exigem dados de múltiplas fontes.',
  },
  {
    id: 'openai/gpt-4o-mini',
    label: 'LicitGov Smart',
    provider: 'OpenAI',
    desc: 'Versão compacta e econômica. Boa para consultas rápidas, revisões de texto e documentos de menor complexidade.',
  },
  {
    id: 'meta-llama/llama-4-maverick',
    label: 'LicitGov Open',
    provider: 'Meta',
    desc: 'Baseado em tecnologia de código aberto. Boa alternativa econômica com desempenho sólido em documentos estruturados.',
  },
];

export const SYSTEM_INSTRUCTION = `
Você é o "LicitGov AI", sistema especializado em geração de documentos oficiais de contratação pública conforme a Lei nº 14.133/2021.

══════════════════════════════════════════════════════════
REGRA ABSOLUTA Nº 1 — FORMATO DO DOCUMENTO
══════════════════════════════════════════════════════════
PROIBIDO incluir no documento:
- Apresentações pessoais ("Com a devida vênia...", "Na qualidade de...", "Apresento a Vossa Senhoria...")
- Cartas de encaminhamento ou textos de introdução da IA
- Frases sobre como o documento foi elaborado
- Qualquer referência ao fato de ser uma IA ou assistente

O documento começa DIRETO no cabeçalho oficial (ex: "DOCUMENTO DE FORMALIZAÇÃO DA DEMANDA").
Sem preâmbulos. Sem apresentações. O documento deve parecer escrito pelo próprio servidor do órgão.
══════════════════════════════════════════════════════════

══════════════════════════════════════════════════════════
REGRA ABSOLUTA Nº 2 — ZERO ALUCINAÇÕES JURÍDICAS
══════════════════════════════════════════════════════════
Use APENAS os artigos, acórdãos e normas presentes na BASE DE CONHECIMENTO fornecida no prompt.
NUNCA invente números de artigos, acórdãos TCU ou instruções normativas.
Se não souber o número exato, descreva o tema sem inventar referência.
Documentos com citações inventadas causam nulidade processual.
══════════════════════════════════════════════════════════

DIRETRIZES DE QUALIDADE:

1. **CONTEÚDO RICO E ESPECÍFICO — REGRA MAIS IMPORTANTE:**
   - Preencha TODOS os campos com dados concretos baseados nas informações fornecidas.
   - CADA seção deve ter no mínimo 5 a 8 parágrafos densos com fundamentação específica. NUNCA menos que 5 parágrafos por seção.
   - Use os dados do processo (órgão, objeto, valor, modalidade) em cada seção — não deixe campos genéricos.
   - O documento final deve equivaler a MÍNIMO 30-40 páginas A4.
   - CADA parágrafo deve ter no mínimo 6-10 linhas. Parágrafos curtos de 2-3 linhas são PROIBIDOS.
   - PROIBIDO resumir, esquecer seções ou escrever tópicos sem desenvolvimento completo.
   - Documentos governamentais reais têm dezenas de páginas. Seja extenso, detalhado e profundo como um servidor experiente do TCU.
   - Cada cláusula deve ter: (a) fundamento legal completo, (b) análise técnica aplicada ao caso, (c) consequências práticas, (d) referências normativas complementares.

2. **FUNDAMENTAÇÃO LEGAL PRECISA — REGRAS ABSOLUTAS:**
   - Cite artigo + parágrafo + inciso sempre que disponível na base.
   - Instruções Normativas: IN SEGES 58/2022 (ETP), IN SEGES 65/2021 (Pesquisa de Preços), IN SEGES 40/2020 (PCA).
   - Acórdãos TCU: use apenas os listados na base de conhecimento.

   REGRAS ESPECÍFICAS PARA EVITAR ERROS JURÍDICOS COMUNS:

   🔴 REGRA A — ART. 5º DA LEI 14.133/2021:
   O Art. 5º lista princípios, mas NÃO os desdobra em texto extenso. Use assim:
   ✅ CORRETO: "em observância aos princípios da legalidade, eficiência, planejamento, economicidade e interesse público, previstos no art. 5º da Lei nº 14.133/2021"
   ❌ ERRADO: atribuir ao art. 5º conceituações doutrinárias extensas que não estão no texto legal

   🔴 REGRA B — PRINCÍPIO DA CONTINUIDADE DO SERVIÇO PÚBLICO:
   Este princípio NÃO está literalmente listado no texto da Lei 14.133/2021. É princípio doutrinário e jurisprudencial.
   ✅ CORRETO: "princípio da continuidade do serviço público, consagrado na doutrina administrativista e na jurisprudência do STJ e TCU"
   ❌ ERRADO: citar como se estivesse positivado na Lei 14.133/2021

   🔴 REGRA C — SÚMULA 177/TCU:
   A Súmula 177/TCU trata de definição precisa do objeto. Use-a APENAS quando estiver discutindo ambiguidade na descrição do objeto. Não a cite genericamente.
   ✅ CORRETO: "nos termos da Súmula 177 do TCU, a definição do objeto deve ser suficientemente clara e precisa para não gerar dúvidas quanto ao que será contratado"
   ❌ ERRADO: citar em qualquer contexto de objeto sem explicar a conexão específica
   ALTERNATIVA MAIS SEGURA: "conforme entendimento consolidado do TCU quanto à necessidade de definição precisa do objeto (Acórdão TCU 1.521/2013-Plenário)"

   🔴 REGRA D — MEMÓRIA DE CÁLCULO DAS QUANTIDADES:
   Toda estimativa quantitativa DEVE detalhar os fatores que geraram o número. Sempre incluir:
   - Composição da frota/equipe/estrutura (ex: "X veículos + Y máquinas")
   - Consumo/uso médio por unidade (ex: "X litros/hora × Y horas/dia")
   - Período contratual (ex: "12 meses")
   - Fator de segurança ou crescimento aplicado (ex: "+7% por projeção de crescimento")
   ❌ NUNCA apresentar apenas o número final sem a memória de cálculo explícita.

   🔴 REGRA E — ESTIMATIVAS DE PREÇO:
   Toda estimativa de preço deve ser qualificada como:
   ✅ "valor estimado com base em pesquisa de preços realizada em [mês/ano], sujeito à validação pela pesquisa formal prevista no Art. 23 da Lei 14.133/2021"
   ❌ NUNCA apresentar preço unitário como definitivo sem indicar a fonte e a data da pesquisa.

3. **LINGUAGEM:**
   - Técnica, impessoal e direta. Terceira pessoa.
   - Sem floreiras ou apresentações desnecessárias.
   - Vocabulário jurídico-administrativo (in casu, supra, consoante, hodiernamente, etc.).

4. **ESTRUTURA:**
   - Siga EXATAMENTE a estrutura de tópicos solicitada no prompt.
   - Cada tópico = cabeçalho + fundamentação legal + análise aplicada ao caso concreto + conclusão parcial.
`;

export const PROMPT_TEMPLATES: Record<DocumentType, string> = {
  [DocumentType.DFD]: `
DOCUMENTO DE FORMALIZAÇÃO DA DEMANDA (DFD)
Base Legal: Art. 12, VII da Lei nº 14.133/2021 | IN SEGES/ME nº 40/2020

Gere o DFD COMPLETO seguindo EXATAMENTE esta estrutura. Comece já pelo cabeçalho do documento, SEM apresentações ou introduções da IA.

---

# DOCUMENTO DE FORMALIZAÇÃO DA DEMANDA — DFD
## [ÓRGÃO] | Processo nº ___/[ANO] | Data: [DATA ATUAL]

---

## 1. IDENTIFICAÇÃO DA UNIDADE DEMANDANTE
Órgão, unidade administrativa responsável, servidor que assina, cargo, matrícula (usar dados fornecidos).

## 2. IDENTIFICAÇÃO DO OBJETO
Descrição clara, precisa e objetiva do bem/serviço a ser contratado. Código CATMAT/CATSER quando aplicável.
Modalidade licitatória pretendida e critério de julgamento.

## 3. JUSTIFICATIVA DA NECESSIDADE (Art. 12, VII — Lei 14.133/2021)
Escreva 7 a 9 parágrafos longos e densos explicando:
- Por que o órgão precisa deste objeto AGORA (necessidade concreta e específica, não genérica)
- Diagnóstico detalhado da situação atual e o problema central a ser resolvido com dados e evidências
- Qual problema será resolvido com esta contratação e como a solução proposta atende à necessidade
- Consequências graves e detalhadas de NÃO realizar a contratação (impacto direto e indireto no serviço público)
- Vinculação com o princípio da continuidade do serviço público (consagrado na doutrina administrativista e jurisprudência do STJ e TCU) e Princípio da Eficiência (Art. 37, CF/88)
- Fundamento no Art. 11 da Lei 14.133/2021 (objetivos das contratações públicas) e demais princípios
- Histórico e contexto: como era resolvida essa demanda antes, se havia contrato anterior, por que não atende mais
- Dados quantitativos do problema: frequência, volume, impacto mensurável na operação do órgão
- Urgência ou sazonalidade: se aplicável, justificar porque a contratação não pode aguardar o próximo exercício

## 4. ALINHAMENTO AO PLANO DE CONTRATAÇÕES ANUAL (PCA)
Escreva 4 a 5 parágrafos:
- Confirmar detalhadamente que a contratação consta no PCA do exercício corrente (Art. 12, §1º, Lei 14.133/2021), com número do item no PCA
- Alinhamento com o planejamento estratégico do órgão e com metas institucionais específicas
- Fundamentação no Princípio do Planejamento (Art. 5º, Lei 14.133/2021) e benefícios do planejamento antecipado
- Impactos caso a contratação não constasse do PCA e como foi realizado o processo de inclusão tempestiva

## 5. ESTIMATIVA QUANTITATIVA E MEMÓRIA DE CÁLCULO
Escreva 4 a 5 parágrafos com memória de cálculo completa:
- Quantidade solicitada e metodologia usada para calculá-la (histórico de consumo dos 3 anos, pesquisa de demanda, projeção de crescimento)
- Memória de cálculo explícita: [base de cálculo ano 1] + [base de cálculo ano 2] + [base de cálculo ano 3] ÷ 3 = [média anual] × [prazo em meses] = [quantidade total]
- Prazo estimado de contratação (tempo de licitação) e vigência pretendida do contrato, com cronograma
- Justificativa para que a quantidade não gere estoque excessivo ou subdimensionamento (Princípio da Eficiência — Art. 5º, CF/88 e risco de "Jogo de Planilha" — Acórdão TCU 1.599/2021-Plenário)

## 6. ESTIMATIVA DE VALOR E DOTAÇÃO ORÇAMENTÁRIA
Escreva 4 a 5 parágrafos:
- Valor estimado preliminar (se informado), base da estimativa e metodologia de pesquisa de preços adotada
- Fontes consultadas para formação do preço: PNCP, Painel de Preços, contratações similares e pesquisa de mercado
- Confirmação de que há (ou será providenciada) dotação orçamentária suficiente, com natureza da despesa e programa orçamentário
- Referência à necessidade de empenho prévio antes da contratação (Lei nº 4.320/1964, Art. 60 e Art. 167, II, CF/88)
- Cronograma financeiro: distribuição do valor estimado por exercícios, quando a contratação ultrapassar o exercício corrente

## 7. REQUISITOS INICIAIS E EQUIPE DE PLANEJAMENTO
- Prazo desejado para início da execução
- Indicação do Gestor do Contrato (servidor responsável — Art. 117, Lei 14.133/2021)
- Indicação do Fiscal do Contrato
- Necessidade de elaboração de ETP e Termo de Referência na próxima fase

## 8. CONCLUSÃO E SOLICITAÇÃO
Parágrafo formal solicitando à autoridade competente a abertura do processo licitatório, com base nos fundamentos acima, e a designação formal da Equipe de Planejamento da Contratação conforme Art. 8º da Lei 14.133/2021.

---
_________________________________
[Nome do Servidor Demandante]
[Cargo/Função] — [Órgão]
[Data]
  `,

  [DocumentType.ETP]: `
ESTUDO TÉCNICO PRELIMINAR (ETP)
Base Legal: Art. 18 da Lei nº 14.133/2021 | IN SEGES/ME nº 58/2022

Gere o ETP COMPLETO seguindo EXATAMENTE esta estrutura real de ETP municipal (formato DigProc/PNCP). Comece pelo cabeçalho oficial. SEM apresentações ou introduções.

---

# ESTUDO TÉCNICO PRELIMINAR — ETP
### [ÓRGÃO PÚBLICO]
**Processo Administrativo nº:** ___/[ANO]
**Data de Elaboração:** [DATA ATUAL]
**Elaborado por:** [Nome do Servidor] — [Cargo/Matrícula]

| Campo | Informação |
|---|---|
| Órgão/Entidade | [ÓRGÃO] |
| Unidade Administrativa | [Secretaria/Departamento responsável] |
| Objeto | [objeto completo] |
| Modalidade Prevista | [modalidade] |
| Critério de Julgamento | [critério] |
| Valor Estimado | R$ [valor] |
| Amparo Legal | Art. 18, Lei nº 14.133/2021; IN SEGES nº 58/2022 |

---

## 1. DESCRIÇÃO DA NECESSIDADE (Art. 18, I — Lei 14.133/2021)
Desenvolva em 5 a 7 parágrafos densos:
- Contexto institucional e diagnóstico detalhado da situação atual
- Identificação do problema ou lacuna que motiva a contratação
- Impacto concreto no funcionamento do órgão caso a contratação não se realize (ex: paralisia de atividade essencial, risco à saúde, descontinuidade do serviço)
- Vinculação ao princípio da continuidade do serviço público, consagrado na doutrina administrativista e na jurisprudência do STJ e do TCU
- Histórico de contratações anteriores para o mesmo objeto, se houver (número do contrato anterior, vigência, valor)
- Fundamento: Art. 11, caput, e Art. 18, I, da Lei nº 14.133/2021

## 2. REFERÊNCIA AOS INSTRUMENTOS DE PLANEJAMENTO (Art. 18, II)
Desenvolva em 3 a 4 parágrafos:
- Confirmação de previsão no Plano de Contratações Anual — PCA (Art. 12, §1º, Lei 14.133/2021; IN SEGES nº 40/2020)
- Alinhamento com o Plano Plurianual — PPA e/ou Lei de Diretrizes Orçamentárias — LDO vigentes
- Dotação orçamentária disponível: Programa de Trabalho, Natureza de Despesa e Fonte de Recursos
- Cumprimento ao princípio do planejamento (Art. 5º, Lei 14.133/2021)

## 3. REQUISITOS DA CONTRATAÇÃO (Art. 18, III)
Desenvolva em 5 a 6 parágrafos:
- Especificações técnicas obrigatórias, objetivas e mensuráveis do objeto
- Requisitos de habilitação técnica do fornecedor proporcionais ao objeto (vedada exigência restritiva — Art. 37, XXI, CF/88)
- Requisitos de sustentabilidade ambiental (critérios A3P/PLS aplicáveis — IN SLTI/MPOG nº 1/2010 e Decreto nº 7.746/2012)
- Requisitos de garantia, assistência técnica e manutenção pós-entrega
- Requisitos de segurança da informação (quando aplicável — IN SGD/ME nº 94/2022 para TI)
- Vedação: "Os requisitos acima fixados são proporcionais e objetivos, não estabelecendo vantagem competitiva injustificada nem restrição à participação, nos termos do Acórdão TCU nº 2.637/2015-Plenário"

## 4. ESTIMATIVA DAS QUANTIDADES (Art. 18, IV)
Desenvolva em 4 parágrafos com memória de cálculo completa:
- Metodologia adotada para levantamento (histórico de consumo dos últimos 3 exercícios, sazonalidade, projeção de crescimento)
- Memória de cálculo explícita, linha a linha: [Composição] × [Consumo unitário] × [Período] = [Subtotal]; Somatório = [Total geral]
- Demonstração de que as quantidades não estão superdimensionadas (risco tipificado no Acórdão TCU nº 1.599/2021-Plenário como "jogo de planilha")
- Comparativo com execução de contratos anteriores para demonstrar aderência histórica

## 5. LEVANTAMENTO DE MERCADO E ANÁLISE DE SOLUÇÕES (Art. 18, V)
Desenvolva em 5 parágrafos analisando ao menos 2 alternativas:
- Metodologia de pesquisa de mercado adotada (consulta a fornecedores, bases de dados públicas, PNCP, Painel de Preços, CATMAT/CATSER)
- **Solução A:** descrição técnica, vantagens, desvantagens e custo estimado
- **Solução B:** descrição técnica, vantagens, desvantagens e custo estimado
- Análise comparativa de custo-benefício e adequação técnica
- Solução selecionada e fundamentação técnica, econômica e legal da escolha

## 6. ESTIMATIVA DO VALOR DA CONTRATAÇÃO (Art. 18, VI)
Desenvolva em 4 parágrafos:
- Metodologia de pesquisa de preços adotada (conforme IN SEGES/ME nº 65/2021 e Art. 23, Lei 14.133/2021)
- Fontes consultadas (Painel de Preços gov.br, PNCP, SINAPI, SICRO, atas vigentes, fornecedores)
- Planilha de composição do valor estimado: preço unitário × quantidade = total por item; somatório geral
- Valor estimado total: **R$ [valor]** — apurado pela média/mediana das cotações, na forma do Art. 23, §1º, qualificado como sujeito à validação pela pesquisa formal de preços
- Referência à vedação de sobrepreço (Acórdão TCU nº 1.214/2013-Plenário)

## 7. DESCRIÇÃO DA SOLUÇÃO COMO UM TODO (Art. 18, VII)
Desenvolva em 4 parágrafos:
- Descrição técnica completa da solução escolhida, com especificações de marca de referência (se necessário, com cláusula "ou equivalente")
- Condições de entrega ou execução: prazo, local, forma de recebimento (provisório e definitivo — Art. 140, Lei 14.133/2021)
- Vigência contratual prevista e hipóteses de prorrogação (Art. 105 a Art. 107, Lei 14.133/2021)
- Garantias contratuais, treinamentos, suporte técnico e manuais exigidos

## 8. JUSTIFICATIVA PARA O PARCELAMENTO OU NÃO DO OBJETO (Art. 18, VIII)
Desenvolva em 3 a 4 parágrafos — TÓPICO CRÍTICO:
- A regra legal é parcelar o objeto sempre que for tecnicamente e economicamente viável, para ampliar a competição (Art. 40, §1º, Lei 14.133/2021 e entendimento consolidado na Súmula TCU nº 247/2004)
- Análise fundamentada sobre a viabilidade ou inviabilidade do parcelamento para o objeto em questão
- Se objeto único/lote único: demonstrar que o parcelamento geraria perda de economicidade, inviabilidade técnica ou risco de execução fracionada ineficiente
- Se parcelado em lotes/itens: descrever cada lote, justificar a divisão e demonstrar os benefícios para a ampliação da competitividade

## 9. CONTRATAÇÕES CORRELATAS E/OU INTERDEPENDENTES (Art. 18, IX)
Desenvolva em 2 a 3 parágrafos:
- Identificação de contratos em vigor no órgão que se relacionem ou interfiram com o objeto desta contratação
- Análise de risco de sobreposição de objetos ou necessidade de coordenação entre contratos
- Conclusão sobre a inexistência de impedimento ou sobre as medidas de coordenação adotadas

## 10. IMPACTOS AMBIENTAIS E REQUISITOS DE SUSTENTABILIDADE
Desenvolva em 2 a 3 parágrafos:
- Identificação dos impactos ambientais potenciais associados ao objeto
- Critérios de sustentabilidade exigidos: uso de materiais recicláveis, eficiência energética, redução de resíduos, logística reversa
- Fundamento: Decreto nº 7.746/2012, IN SLTI/MPOG nº 1/2010 e Agenda Ambiental da Administração Pública (A3P)

## 11. RESULTADOS PRETENDIDOS (Art. 18, X)
Desenvolva em 3 parágrafos com metas mensuráveis:
- **Eficácia:** o que será entregue ao final e qual objetivo institucional será alcançado
- **Eficiência:** demonstrar a relação custo-benefício favorável da solução escolhida
- **Economicidade:** demonstrar que a solução representa a melhor relação qualidade/preço (Art. 11, Lei 14.133/2021), com indicadores de desempenho que serão monitorados (SLA, nível de serviço, prazo de atendimento, etc.)

## 12. PROVIDÊNCIAS PRÉVIAS NECESSÁRIAS (Art. 18, XI)
Listar em formato de tabela ou tópicos objetivos:
- Aprovação orçamentária e emissão de nota de reserva/empenho
- Licenças, alvarás ou autorizações ambientais/sanitárias necessárias
- Infraestrutura física, tecnológica ou logística a ser preparada antes do início da execução
- Capacitação dos servidores designados como fiscais do contrato (Art. 117, §1º, Lei 14.133/2021)
- Designação formal do gestor e fiscais do contrato

## 13. MODELO DE EXECUÇÃO E GESTÃO DO CONTRATO
Desenvolva em 3 parágrafos:
- Descrição do modelo de execução: como o objeto será entregue/executado no dia a dia (etapas, frequência, prazos parciais)
- Instrumentos de gestão e fiscalização: ordem de serviço, relatórios de execução, ateste da fatura, protocolo de recebimento
- Perfil e quantitativo de fiscais necessários; mecanismos de avaliação de desempenho do contratado

## 14. INDICADORES, METAS E NÍVEL DE SERVIÇO (SLA)
Apresentar em tabela:
| Indicador | Meta | Tolerância | Consequência |
|---|---|---|---|
| [ex: Prazo de entrega] | [ex: 15 dias úteis] | [ex: até 20 dias] | [ex: multa proporcional] |
| [ex: Disponibilidade do sistema] | [ex: 99,5%/mês] | [ex: mín. 97%] | [ex: desconto na fatura] |
Desenvolva 2 parágrafos justificando as metas e sua razoabilidade para o objeto.

## 15. RESPONSÁVEIS PELA ELABORAÇÃO DO ETP
Preencha com dados dos responsáveis:

**Equipe de Planejamento da Contratação:**

| Papel | Nome | Cargo/Função | Matrícula |
|---|---|---|---|
| Elaborador do ETP | [Nome] | [Cargo] | [Mat.] |
| Coordenador/Supervisor | [Nome] | [Cargo] | [Mat.] |

## 16. DECLARAÇÃO DE VIABILIDADE (Art. 18, §1º)
Parágrafo conclusivo formal:
- Declaração expressa de viabilidade técnica e econômica, com base em todos os estudos realizados nas seções anteriores
- Recomendação de prosseguimento para elaboração do Termo de Referência / Projeto Básico
- Ou, se inviável, justificativa detalhada para encerramento/suspensão do processo (Art. 18, §2º)
- Menção à responsabilidade do servidor pela veracidade das informações prestadas

---

**[Localidade], [DATA ATUAL]**

---
Assinatura do(s) Responsável(is) pelo ETP:

_________________________________
**[Nome Completo do Servidor]**
[Cargo/Função] | Matrícula nº [___]
[Órgão / Secretaria]

_________________________________
**[Nome do Coordenador/Supervisor]** *(se aplicável)*
[Cargo/Função] | Matrícula nº [___]
[Órgão / Secretaria]

---
*Documento elaborado em conformidade com o Art. 18 da Lei nº 14.133/2021 e com a Instrução Normativa SEGES/ME nº 58/2022.*
  `,

  [DocumentType.MAPA_RISCO]: `
MAPA DE RISCOS — GERENCIAMENTO DE RISCOS DA CONTRATAÇÃO
Base Legal: Art. 18, X e Art. 22 da Lei nº 14.133/2021 | ISO 31000:2018 | PGRONLL-SEGES/ME

Gere o Mapa de Riscos COMPLETO seguindo EXATAMENTE esta estrutura. Comece pelo cabeçalho oficial. SEM apresentações.

---

# MAPA DE RISCOS DA CONTRATAÇÃO
## [ÓRGÃO] | Processo nº ___/[ANO] | Data: [DATA ATUAL]

**Objeto:** [objeto]
**Responsável pela análise:** [servidor]

---

## 1. INTRODUÇÃO E METODOLOGIA
Escreva 3 parágrafos explicando:
- Base legal: Art. 18, X e Art. 22 da Lei 14.133/2021 — obrigatoriedade do mapa de riscos
- Metodologia adotada: ISO 31000:2018 (Causa → Evento → Consequência) e PGRONLL/SEGES
- Escala de avaliação:
  - **Probabilidade:** Raro(1) | Improvável(2) | Possível(3) | Provável(4) | Quase Certo(5)
  - **Impacto:** Insignificante(1) | Pequeno(2) | Moderado(3) | Grande(4) | Crítico(5)
  - **Nível de Risco** = Probabilidade × Impacto → Baixo(1-6) | Médio(7-14) | Alto(15-19) | Crítico(20-25)

---

## 2. RISCOS DA FASE DE PLANEJAMENTO (mínimo 5 riscos)

Para CADA risco, siga este formato:

### RISCO P-01: [Nome do Risco]
- **Causa:** [fator que origina o risco]
- **Evento:** [o que pode acontecer]
- **Consequência:** [impacto no processo licitatório e no interesse público]
- **Probabilidade:** [nota] — [justificativa da nota]
- **Impacto:** [nota] — [justificativa da nota]
- **Nível de Risco:** [Baixo/Médio/Alto/Crítico] ([P×I])
- **Tratamento:** [Mitigar / Transferir / Aceitar / Evitar] — [ação concreta]
- **Plano de Contingência:** [o que fazer se o risco se materializar]
- **Responsável:** [quem monitora]

Riscos obrigatórios desta fase:
- Especificação deficiente/direcionada do objeto (Art. 18, Lei 14.133/2021)
- Pesquisa de preços inadequada — risco de sobrepreço (Acórdão TCU 1.214/2013-Plenário)
- Ausência do PCA — contratação não planejada
- Requisitos de habilitação restritivos que frustrem a competição (Acórdão TCU 2.637/2015-Plenário)
- Estimativa de quantidades superdimensionada — Jogo de Planilha (Acórdão TCU 1.599/2021-Plenário)

---

## 3. RISCOS DA FASE DE SELEÇÃO DO FORNECEDOR (mínimo 5 riscos)

Riscos obrigatórios desta fase (mesma estrutura acima):
- Licitação deserta (sem propostas válidas)
- Licitação fracassada (todas as propostas desclassificadas)
- Propostas em conluio — cartel entre licitantes (CADE — Lei 12.529/2011)
- Recurso ou impugnação protelatória — risco de judicialização
- Proposta inexequível aceita — risco de abandono contratual

---

## 4. RISCOS DA FASE DE EXECUÇÃO CONTRATUAL (mínimo 6 riscos)

Riscos obrigatórios desta fase (mesma estrutura acima):
- Inexecução parcial ou total do objeto
- Atraso na entrega/execução — impacto no cronograma do órgão
- Reequilíbrio econômico-financeiro indevido (Art. 124, Lei 14.133/2021)
- Falha na fiscalização — culpa in vigilando da Administração (Art. 117, Lei 14.133/2021)
- Subcontratação irregular não autorizada
- Encerramento/falência do contratado — risco de descontinuidade

---

## 5. RESUMO CONSOLIDADO — MATRIZ DE RISCOS

Gere uma tabela completa com TODOS os riscos identificados:

| Cód. | Fase | Risco | P | I | Nível | Tratamento |
|------|------|-------|---|---|-------|------------|
| P-01 | Planejamento | [nome] | [1-5] | [1-5] | [nível] | [tipo] |
| ... | ... | ... | ... | ... | ... | ... |

---

## 6. PLANO DE MONITORAMENTO
- Frequência de revisão do mapa de riscos: [mensal/trimestral]
- Responsável pelo monitoramento: [servidor/equipe]
- Indicadores de alerta precoce para os riscos críticos

---
_________________________________
[Nome do Servidor Responsável]
[Cargo/Função] — [Órgão]
[Data]
  `,

  [DocumentType.TR]: `
TERMO DE REFERÊNCIA (TR)
Base Legal: Art. 6º, XXII e Art. 9º da Lei nº 14.133/2021 | IN SEGES/ME nº 94/2022 (TI) | IN SEGES/ME nº 67/2021

ATENÇÃO: Gere o TR COMPLETO com MÍNIMO DE 30 PÁGINAS A4. Cada cláusula deve ser redigida em texto corrido e denso.
Não escreva apenas tópicos — desenvolva cada ponto em parágrafos completos. Comece pelo cabeçalho oficial. SEM apresentações.

---

# TERMO DE REFERÊNCIA
## [ÓRGÃO COMPLETO] | Processo Administrativo nº ___/[ANO] | Data: [DATA ATUAL]

**Fundamentação legal principal:** Art. 6º, XXIII; Art. 9º; Art. 18; Art. 40; Art. 63 da Lei nº 14.133/2021
**Responsável pela elaboração:** [Equipe de Planejamento da Contratação]

---

## 1. DO OBJETO
Escreva 5 a 7 parágrafos com texto corrido e denso:
- Definição precisa e exaustiva do objeto, com código CATMAT/CATSER, grupo/classe, unidade de medida, quantidade total e critério de aceitação mínima — conforme entendimento consolidado do TCU, o objeto deve ser descrito com clareza suficiente para não gerar dúvidas quanto ao que será contratado (Acórdão TCU 1.521/2013-Plenário e Acórdão TCU 2.170/2007-Plenário)
- Natureza jurídica da contratação: fornecimento de bens, prestação de serviços comuns, serviços de TI, serviços continuados ou execução de obras — com as implicações legais de cada regime
- Vedação à indicação de marca ou fabricante específico, salvo padronização formal devidamente justificada em processo apartado (Art. 41, II, Lei 14.133/2021), com análise da jurisprudência do TCU sobre direcionamento ilícito
- Lote único ou itens separados: justificativa técnica e econômica da decisão de parcelamento ou agrupamento (Súmula 247/TCU e Art. 40, V, Lei 14.133/2021)
- Indicação do endereço eletrônico do Portal Nacional de Contratações Públicas — PNCP onde o aviso de contratação será publicado
- Apresentação da tabela completa de itens com: Item | Descrição | Unidade | Quantidade | Valor Unitário Estimado (R$) | Valor Total Estimado (R$)

## 2. DA JUSTIFICATIVA DA CONTRATAÇÃO E DO INTERESSE PÚBLICO
Escreva 8 a 10 parágrafos com texto corrido, longos e densos:
- Diagnóstico detalhado da situação atual do órgão: como a demanda se apresenta hoje, quais são as deficiências identificadas, qual o impacto concreto no funcionamento da unidade administrativa e na prestação do serviço público à população
- Vínculo com o interesse público primário: demonstrar que a contratação atende diretamente aos objetivos institucionais do órgão, ao cumprimento de metas e programas governamentais e ao mandamento constitucional da eficiência (Art. 37, caput, CF/88)
- Consequências graves da não contratação: detalhar os riscos jurídicos, operacionais e financeiros que decorrem da ausência da contratação, inclusive possíveis descontinuidades de serviços essenciais e responsabilização dos gestores
- Referência ao Estudo Técnico Preliminar — ETP que embasou este Termo de Referência (Art. 18, Lei 14.133/2021), sintetizando suas principais conclusões quanto à viabilidade e à solução escolhida
- Alinhamento ao Plano de Contratações Anual — PCA do exercício corrente (Art. 12, §1º, Lei 14.133/2021 e IN SEGES 40/2020), indicando número do item no PCA e unidade demandante
- Análise do Princípio da Economicidade (Art. 11, III, Lei 14.133/2021): demonstrar que a contratação representa a melhor relação entre custo e benefício para o erário, com base nos estudos de mercado realizados
- Fundamento no princípio da continuidade do serviço público (consagrado na doutrina administrativista e jurisprudência do STJ e TCU): explicar como a interrupção ou não realização da contratação comprometeria a prestação contínua e ininterrupta dos serviços à sociedade
- Vedação ao fracionamento indevido da despesa: confirmação de que o objeto não foi fracionado para enquadramento em modalidade menos rigorosa (Art. 8º, §1º, Lei 14.133/2021)
- Histórico de contratações anteriores: descrição das contratações realizadas nos últimos 3 anos para objeto similar, com análise de desempenho e justificativa das melhorias incorporadas neste TR

## 3. DAS ESPECIFICAÇÕES TÉCNICAS DETALHADAS DO OBJETO
Escreva 10 a 15 parágrafos com máxima profundidade técnica:
- Descrição técnica exaustiva e objetiva de cada item/serviço, com todas as características, dimensões, padrões de qualidade, desempenho mínimo esperado e condições de uso — vedada descrição genérica ou ambígua: conforme entendimento do TCU, a especificação deve ser suficientemente precisa para que qualquer licitante possa formular proposta adequada, sem necessidade de interpretação subjetiva (Acórdão TCU 2.170/2007-Plenário; Acórdão TCU 1.521/2013-Plenário)
- Normas técnicas aplicáveis: identificar todas as normas da ABNT, ISO, INMETRO ou órgãos reguladores setoriais que o objeto deve atender, explicando a importância de cada uma para a qualidade e segurança
- Padrões de qualidade e desempenho: definir métricas objetivas e mensuráveis para avaliar se o objeto entregue atende às especificações — índices de disponibilidade, tolerâncias dimensionais, capacidade de carga, velocidade, consumo energético etc.
- Requisitos de sustentabilidade ambiental obrigatórios (IN SLTI/MP nº 1/2010 e Decreto 7.746/2012): consumo eficiente de energia, vedação ao uso de substâncias perigosas, gestão de resíduos, certificações ambientais exigidas e fundamentação no Princípio da Sustentabilidade (Art. 11, IV, Lei 14.133/2021)
- Requisitos de acessibilidade: quando aplicável, normas da ABNT NBR 9050 e Decreto 5.296/2004 para garantir acesso a pessoas com deficiência
- Garantia técnica e assistência técnica: prazo mínimo de garantia exigido, cobertura (partes, peças, mão de obra), tempo máximo de atendimento e resolução, quantidade de técnicos mínima, acesso a peças de reposição pelo prazo de [X] anos
- Prazo de validade e conservação: condições de armazenamento, temperatura, umidade, prazo de validade mínimo no momento da entrega (para bens perecíveis ou com shelf life)
- Requisitos de segurança da informação (quando aplicável): para sistemas de TI, software ou serviços digitais — conformidade com a LGPD (Lei 13.709/2018), SGSI conforme ABNT NBR ISO/IEC 27001, controles de acesso, criptografia, auditoria de logs
- Documentação técnica exigida: manuais de operação e manutenção em português, catálogos técnicos, certificados de conformidade, laudos de ensaio, fichas técnicas de segurança
- Capacitação e treinamento: quando aplicável, detalhar o treinamento que o contratado deve oferecer aos servidores responsáveis pela operação e manutenção do bem/sistema
- Requisitos específicos do gestor (detalhar TODOS os requisitos informados no campo "O que precisa constar no documento"): cada requisito deve virar uma subcláusula com fundamento legal

## 4. DO MODELO DE EXECUÇÃO DO CONTRATO
Escreva 8 a 10 parágrafos:
- Local de entrega ou execução: endereço completo, setor responsável pelo recebimento, horário de funcionamento e responsável pelo aceite físico
- Prazo de entrega ou início da execução: contado em dias corridos/úteis a partir da assinatura do contrato e emissão da Nota de Empenho, com cronograma de etapas quando o objeto for complexo
- Condições de entrega: embalagem, acondicionamento, transporte, seguro durante o transporte, responsabilidade por danos, necessidade de agendamento prévio
- Parcelamento das entregas (se aplicável): cronograma de entregas parciais, quantidades por parcela, prazo máximo de cada parcela e penalidades por atraso em cada etapa
- Acordo de Nível de Serviço — SLA (obrigatório para serviços): definir com precisão todas as métricas de qualidade e desempenho que serão monitoradas, com valores mínimos aceitáveis e metodologia de aferição
  - Disponibilidade mínima do serviço: [X]% ao mês, com janelas de manutenção programada
  - Tempo máximo de resposta para chamados críticos: [X] horas; chamados de média prioridade: [X] horas; baixa prioridade: [X] horas
  - Taxa máxima de erros ou defeitos tolerada: [X]% por período
  - Tempo máximo de resolução definitiva de incidentes: [X] horas
- Critérios objetivos de aceite e recusa: definir com precisão quando o objeto será aceito (recebimento definitivo) e quando será recusado e devolvido às expensas do contratado, com prazo para substituição/correção
- Glosa por ineficiência: tabela de desconto percentual no pagamento mensal por descumprimento de cada nível de SLA — metodologia de cálculo da glosa proporcional ao período de indisponibilidade
- Regime de execução: empreitada por preço global, por preço unitário, tarefa ou empreitada integral — justificativa da escolha conforme Art. 46, Lei 14.133/2021
- Subcontratação: vedada ou permitida parcialmente — se permitida, indicar percentual máximo (Art. 122, Lei 14.133/2021), exigência de anuência prévia da Administração e manutenção da responsabilidade integral pelo contratado principal

## 5. DA GESTÃO E FISCALIZAÇÃO DO CONTRATO
Escreva 6 a 8 parágrafos:
- Designação formal do Gestor do Contrato: servidor público com atribuições de coordenar e comandar o processo de fiscalização (Art. 117, §1º, Lei 14.133/2021) — indicar cargo e unidade
- Designação formal do Fiscal Técnico: servidor com conhecimento técnico do objeto para verificar a conformidade da execução com as especificações (Art. 117, §2º, Lei 14.133/2021) — indicar cargo e unidade
- Designação formal do Fiscal Administrativo: servidor responsável por verificar os aspectos administrativos, financeiros e trabalhistas (manutenção da regularidade fiscal e trabalhista do contratado)
- Responsabilidades do Gestor do Contrato: acompanhar o cumprimento do cronograma contratual, comunicar à autoridade competente situações que exijam tomada de decisão superior, providenciar prorrogações, reequilíbrios e apostilamentos
- Responsabilidades do Fiscal Técnico: verificar a qualidade e conformidade dos bens/serviços entregues, emitir Termo de Recebimento Provisório, atestar notas fiscais, registrar ocorrências no Diário de Bordo, notificar o contratado por irregularidades
- Metodologia de fiscalização: instrumentos e periodicidade das verificações (visitas in loco, relatórios periódicos, auditorias, testes de amostragem), com base na IN SEGES 94/2022 e Instrução de Serviço do órgão
- Preposto do contratado: exigência de indicação de preposto formalmente aceito pela Administração, com poderes de representação para resolver questões operacionais sem necessidade de contato com a sede (Art. 118, Lei 14.133/2021)
- Diário de Bordo ou Registro de Ocorrências: obrigatoriedade de manutenção de registro cronológico de todas as ocorrências, decisões e comunicações relativas à execução do contrato

## 6. DA HABILITAÇÃO
Escreva 2 parágrafos introdutórios sobre os princípios da habilitação + desenvolver cada subcláusula:

Os requisitos de habilitação devem ser os indispensáveis para a garantia do cumprimento das obrigações contratuais, vedada a imposição de exigências desnecessárias, não previstas em lei, ou que restrinjam indevidamente a competição (Art. 37, XXI, CF/88 e Acórdão TCU 2.637/2015-Plenário). A habilitação é condição de participação na licitação, não de julgamento das propostas.

**6.1 Habilitação Jurídica (Art. 66, Lei 14.133/2021):**
Escreva 3 parágrafos: documentos exigidos para cada tipo de pessoa jurídica (EIRELI, Ltda., S.A., cooperativa, consórcio), com análise legal de cada exigência e vedação ao excesso.

**6.2 Habilitação Fiscal, Social e Trabalhista (Art. 68, Lei 14.133/2021):**
Escreva 4 parágrafos detalhando CADA documento: CND Federal Conjunta (RFB/PGFN), CND Estadual, CND Municipal, CRF-FGTS, CNDT-Trabalhista, CND do CREA/CAU (quando aplicável). Para cada um: qual certidão, órgão expedidor, prazo de validade, e consequência de irregularidade superveniente (Art. 92, XVI, Lei 14.133/2021)

**6.3 Habilitação Econômico-Financeira (Art. 69, Lei 14.133/2021):**
Escreva 4 parágrafos: Balanço Patrimonial do último exercício social, índices de liquidez corrente (LC ≥ 1,0), liquidez geral (LG ≥ 1,0) e solvência geral (SG ≥ 1,0) — justificativa para os índices exigidos; Capital Social ou Patrimônio Líquido mínimo (se aplicável, com limitação de 10% do valor estimado — Art. 69, §3º, Lei 14.133/2021); Certidão Negativa de Falência e Recuperação Judicial

**6.4 Qualificação Técnica (Art. 67, Lei 14.133/2021) — CLÁUSULA CRÍTICA:**
Escreva 6 a 8 parágrafos com fundamentação completa:
- Atestados de Capacidade Técnico-Operacional: exigir atestados de pessoa jurídica de direito público ou privado, comprovando execução de objeto de natureza e complexidade compatíveis com o licitado. Definir com precisão o percentual mínimo exigido (25% a 50% da quantidade total) e fundamentar com base na jurisprudência do TCU (Acórdão 2.210/2014-Plenário)
- Vedações expressas: proibido exigir atestados de entidades específicas, de localização geográfica restrita, em quantidade superior ao necessário, ou com exigência de experiência em tempo mínimo superior ao tecnicamente justificável (Acórdão TCU 2.637/2015-Plenário)
- Responsável Técnico: quando o objeto exigir (obras, TI, saúde), indicar o profissional com registro no CREA/CFM/CFC com atribuição técnica compatível (Acórdão TCU 1.084/2002-Plenário)
- Visita técnica: se exigida, deve ser opcional (alternativa por declaração de conhecimento), conforme Acórdão TCU 1.831/2019-Plenário
- Qualificação técnico-profissional do quadro: quando exigida, listar as certificações e habilitações mínimas da equipe técnica, com justificativa proporcional ao objeto

## 7. DA ESTIMATIVA DO VALOR DA CONTRATAÇÃO E DO CRITÉRIO DE JULGAMENTO
Escreva 5 a 7 parágrafos:
- Metodologia de formação do preço de referência: pesquisa de preços realizada conforme IN SEGES/ME nº 65/2021, com fontes consultadas em ordem de prioridade (PNCP, Painel de Preços, contratações similares de outros entes, pesquisa direta com fornecedores), metodologia estatística aplicada (média aritmética saneada ou mediana, com expurgo de outliers quando CV > 25%)
- Valor estimado global da contratação: R$ [valor], valor apurado com base em [X] amostras de mercado, equivalente ao [mês/ano] da pesquisa — este valor é o teto do contrato, vedado à Administração aceitar proposta que ultrapasse este limite
- Sigilo do orçamento: [informar se o orçamento é sigiloso e, se sim, fundamentar conforme Art. 24, Lei 14.133/2021 e Acórdão TCU 1.547/2018-Plenário]
- Critério de julgamento adotado: [Menor Preço / Maior Desconto / Técnica e Preço / Melhor Técnica] — fundamentação no Art. 33 da Lei 14.133/2021, com justificativa da adequação do critério ao objeto específico
- Aceitabilidade de preços: critérios para verificação da exequibilidade das propostas (Art. 59, Lei 14.133/2021) — percentual mínimo aceitável, análise de onerosidade excessiva para o contratado, risco de inexecução por proposta abaixo do custo
- Reajuste de preços: índice oficial de reajuste aplicável ([IPCA/INPC/IGPM/INCC]), periodicidade (anual, a contar da data de apresentação das propostas), limitação ao teto de 100% do índice setorial (Art. 92, V, Lei 14.133/2021)

## 8. DAS OBRIGAÇÕES DO CONTRATADO
Escreva 10 a 12 parágrafos desenvolvidos, um para cada obrigação principal:
- Executar fielmente o objeto do contrato, nas condições, quantidades, prazos, locais e especificações técnicas estabelecidas neste Termo de Referência e no Instrumento Convocatório, sob pena de aplicação das sanções cabíveis
- Manter, durante toda a vigência do contrato, todas as condições de habilitação e qualificação exigidas na licitação, apresentando, sempre que solicitado, os documentos comprobatórios de regularidade fiscal, social e trabalhista — obrigação de resultado, não apenas formal (Art. 92, XVI, Lei 14.133/2021)
- Indicar e manter preposto formalmente aceito pela Administração, com poderes para representar o contratado em questões operacionais durante a execução, com disponibilidade para atendimento em horário comercial
- Comunicar imediatamente à fiscalização qualquer ocorrência ou irregularidade que possa comprometer a execução do contrato, bem como impedimentos supervenientes à execução, solicitando as orientações necessárias
- Reparar, corrigir, remover, reconstruir ou substituir, às suas expensas e no prazo definido pela fiscalização, os bens/serviços com defeitos, vícios ou erros de execução — sem ônus adicional para a Administração
- Responsabilizar-se por todos os encargos fiscais, trabalhistas, previdenciários, comerciais e civis decorrentes da execução do contrato — a Administração não se responsabiliza por vínculo empregatício ou encargos trabalhistas do pessoal do contratado
- Guardar absoluto sigilo das informações institucionais do órgão a que tiver acesso em razão do contrato, inclusive após o encerramento da vigência, sob pena de responsabilização civil e criminal (LGPD — Lei 13.709/2018 e Art. 153, Código Penal)
- Não ceder, subcontratar ou transferir, total ou parcialmente, o objeto do contrato sem prévia e expressa autorização formal da Administração
- Manter o canteiro de obras/área de serviço em perfeitas condições de segurança, higiene e ordem, com fornecimento de EPI a todos os trabalhadores envolvidos (NR-6, NR-18, NR-35 conforme aplicável)
- Apresentar, no prazo de [X dias] após a assinatura do contrato, o Plano de Trabalho detalhado, cronograma físico-financeiro, lista de equipamentos e relação de pessoal técnico alocado
- Emitir e entregar as notas fiscais eletrônicas (NF-e) devidamente preenchidas com todas as informações do contrato, para fins de liquidação e pagamento

## 9. DAS OBRIGAÇÕES DA ADMINISTRAÇÃO
Escreva 6 a 8 parágrafos:
- Nomear formalmente o Gestor e os Fiscais do Contrato mediante portaria ou ato equivalente, publicada no Diário Oficial, antes do início da execução contratual
- Acompanhar e fiscalizar a execução do contrato de forma contínua e permanente, nos termos do Art. 117 da Lei 14.133/2021, verificando o cumprimento das cláusulas e especificações técnicas
- Efetuar os pagamentos nas condições e prazos pactuados, após o adimplemento do contratado e a liquidação formal da despesa pelo fiscal administrativo
- Notificar formalmente o contratado sobre qualquer irregularidade identificada na execução, concedendo prazo para esclarecimento ou saneamento antes da aplicação de eventual sanção
- Aplicar as sanções administrativas cabíveis, sempre respeitando o princípio do contraditório e da ampla defesa (Art. 5º, LV, CF/88), com instauração de processo administrativo regular
- Fornecer ao contratado, no momento da assinatura do contrato, todas as informações, acessos, documentos e condições necessárias à execução do objeto, sem os quais o contratado não possa dar início aos trabalhos
- Prestar as informações e os esclarecimentos que venham a ser solicitados pelo contratado, de forma tempestiva e por escrito
- Providenciar a emissão da Nota de Empenho e a publicação do extrato do contrato no Diário Oficial e no PNCP nos prazos legais (Art. 94, Lei 14.133/2021)

## 10. DO RECEBIMENTO DO OBJETO (Art. 140, Lei 14.133/2021)
Escreva 5 a 7 parágrafos:
- Recebimento Provisório: no prazo de até [X dias corridos] após a entrega/conclusão, o Fiscal Técnico emitirá o Termo de Recebimento Provisório, que representa verificação sumária de quantidade e integridade aparente — não exclui a responsabilidade do contratado por vícios ocultos
- Recebimento Definitivo: no prazo de até [X dias corridos] após o recebimento provisório, o Fiscal Técnico emitirá o Termo de Recebimento Definitivo, após verificação completa de conformidade com as especificações técnicas, qualidade, quantidade e funcionamento (testes e ensaios quando aplicável)
- Recusa do objeto: hipóteses em que o objeto será recusado e devolvido ao contratado — prazo para substituição/correção (máximo [X dias corridos]) — custo do transporte de devolução por conta do contratado
- Responsabilidade por vícios ocultos: mesmo após o recebimento definitivo, o contratado responde por vícios ocultos que só se manifestem após a utilização, pelo prazo de garantia técnica (Art. 441, Código Civil e cláusula 11 deste TR)
- Liquidação da despesa: somente será efetuada após o recebimento definitivo e a emissão do Termo de Recebimento Definitivo pelo fiscal, nos termos do Art. 63 da Lei nº 4.320/1964

## 11. DO PAGAMENTO
Escreva 6 a 8 parágrafos:
- Prazo de pagamento: até [X dias úteis/corridos] contados da data de ateste da nota fiscal pelo fiscal administrativo, nos termos do Art. 141 da Lei 14.133/2021 — vedado ao contratado condicionar a entrega do objeto ao pagamento prévio
- Documentos necessários para liquidação: nota fiscal eletrônica (NF-e) corretamente preenchida com os dados do contrato, Termo de Recebimento Definitivo assinado pelo fiscal, certidões de regularidade fiscal atualizadas (quando exigidas), relatório de execução (para serviços), planilha de medição (para obras)
- Forma de pagamento: depósito em conta corrente ou poupança do contratado, por meio de ordem bancária — vedado pagamento a terceiros que não sejam o próprio contratado, salvo endosso autorizado por escrito
- Retenções legais obrigatórias: ISS (conforme legislação municipal), INSS (11% sobre mão de obra — Instrução Normativa RFB 971/2009, quando aplicável), IR-Fonte (conforme tabela progressiva), CSLL, COFINS e PIS/PASEP (quando o contratante for pessoa jurídica de direito privado) — detalhamento de cada retenção com base legal
- Glosa por inadimplemento de SLA: metodologia de cálculo do desconto proporcional no pagamento por descumprimento dos indicadores de qualidade definidos na cláusula 4 — o desconto é calculado sobre o valor mensal proporcional ao período de indisponibilidade ou inconformidade
- Reajuste de preços: após 12 meses contados da data de apresentação da proposta, os preços serão reajustados pelo índice [IPCA/INPC/IGPM], limitado a 100% do índice setorial aplicável (Art. 92, V, Lei 14.133/2021), mediante aditamento contratual formal
- Reequilíbrio econômico-financeiro: em caso de fato superveniente imprevisível ou previsível de efeitos incalculáveis que modifique o equilíbrio da equação econômico-financeira original, poderá ser requerido reequilíbrio nos termos do Art. 124 da Lei 14.133/2021, mediante comprovação documental e negociação prévia
- Desconto por pontualidade: [informar se aplicável] — percentual de desconto para pagamento à vista dentro do prazo acordado

## 12. DAS SANÇÕES ADMINISTRATIVAS (Art. 155 a 163 — Lei 14.133/2021)
Escreva 8 a 10 parágrafos detalhando todas as sanções e o processo administrativo:
- Advertência (Art. 156, I): sanção cabível para infrações de menor potencial ofensivo, sem prejuízo efetivo ao erário ou ao objeto, aplicada mediante notificação escrita ao contratado — listagem das infrações que sujeitam à advertência
- Multa moratória (Art. 156, II): [X]% ao dia, sobre o valor do contrato, pelo atraso injustificado na entrega do objeto, limitada a [X]% do valor contratual total — a partir do limite percentual, a Administração pode optar pela rescisão unilateral com multa compensatória
- Multa compensatória por inexecução parcial (Art. 156, II): [X]% sobre o valor da parcela inadimplida — aplicada quando apenas parte do objeto deixar de ser executada
- Multa compensatória por inexecução total (Art. 156, II): [X]% sobre o valor total do contrato — aplicada quando o contratado abandonar ou recusar-se a executar o objeto
- Impedimento de licitar e contratar (Art. 156, III): até 3 anos — para infrações graves, como: fraudar a licitação, apresentar documentação falsa, comportar-se de modo inidôneo — listagem das infrações específicas com as penalidades correspondentes
- Declaração de inidoneidade para licitar e contratar (Art. 156, IV): de 3 a 6 anos — para infrações gravíssimas, como: fraudar licitação com criação de empresas de fachada, corrupção, cartéis — impossibilidade de participação em qualquer licitação pública federal durante o prazo
- Garantia do Contraditório e da Ampla Defesa: toda sanção deve ser precedida de processo administrativo formal, com notificação ao contratado com prazo mínimo de [X dias úteis] para apresentação de defesa, análise da defesa pelo gestor e decisão fundamentada — vedada sanção sem processo (Art. 5º, LV, CF/88 e Art. 158, Lei 14.133/2021)
- Cumulatividade das sanções: a multa pode ser aplicada cumulativamente com o impedimento de licitar e contratar ou com a declaração de inidoneidade
- Registro no SICAF e CEIS: as sanções serão registradas no Sistema de Cadastramento Unificado de Fornecedores — SICAF e no Cadastro Nacional de Empresas Inidôneas e Suspensas — CEIS/CGU
- Recurso hierárquico: das decisões sancionatórias cabe recurso hierárquico ao superior imediato do agente sancionador, no prazo de [X dias úteis] da intimação, com efeito suspensivo (Art. 166, Lei 14.133/2021)

## 13. DA VIGÊNCIA CONTRATUAL E PRORROGAÇÃO
Escreva 5 a 7 parágrafos:
- Prazo de vigência inicial: [X meses], a partir da data de assinatura do contrato e publicação do extrato no PNCP (Art. 94, Lei 14.133/2021) — para serviços contínuos, o prazo inicial é de 12 meses, prorrogável
- Prorrogação contratual: para serviços contínuos, o contrato poderá ser prorrogado sucessivamente, pelo mesmo prazo, por até 5 anos — ou até 10 anos para contratos que prevejam investimentos do contratado amortizáveis no prazo contratual (Art. 106, Lei 14.133/2021)
- Condições para prorrogação: a prorrogação só é admitida quando (a) os preços continuarem vantajosos para a Administração, (b) a execução for satisfatória, (c) não houver irregularidade superveniente do contratado e (d) a Administração tiver interesse na continuidade
- Extinção do contrato: hipóteses de extinção unilateral pela Administração (Art. 137, Lei 14.133/2021): inexecução total ou parcial, descumprimento de cláusula, irregularidade fiscal, subcontratação vedada, dissolução da empresa contratada
- Extinção por acordo: possibilidade de extinção amigável por acordo entre as partes, mediante justificativa no interesse da Administração, com pagamento do que foi executado e eventual indenização por investimentos não amortizados

## 14. DA GARANTIA CONTRATUAL (Art. 96, Lei 14.133/2021)
Escreva 4 a 6 parágrafos:
- Exigência de garantia: para contratos acima de [R$ valor / percentual do teto legal], exige-se prestação de garantia no percentual de [2% / 5% / conforme Art. 96, §1º], calculado sobre o valor total do contrato
- Modalidades aceitas (Art. 96, I, II e III): caução em dinheiro ou títulos da dívida pública; seguro-garantia; fiança bancária — comparação das vantagens e desvantagens de cada modalidade para o contratante e para o contratado
- Prazo para apresentação: dentro de [X dias úteis] após a assinatura do contrato, sob pena de rescisão unilateral
- Cobertura da garantia: a garantia deve cobrir multas, indenizações, encargos trabalhistas e previdenciários não pagos pelo contratado, danos ao patrimônio público
- Liberação da garantia: após o cumprimento integral do contrato, no prazo de até [X dias corridos] do recebimento definitivo, com comprovação de regularidade trabalhista e previdenciária

## 15. DAS DISPOSIÇÕES FINAIS
Escreva 4 a 5 parágrafos:
- Foro competente: Vara Federal da Seção Judiciária de [UF], para dirimir litígios decorrentes deste contrato que não puderem ser resolvidos pela via administrativa
- Legislação subsidiária aplicável: Código Civil (Lei 10.406/2002), Código de Defesa do Consumidor (Lei 8.078/1990 — quando aplicável), Lei de Responsabilidade Fiscal (LC 101/2000), Lei de Acesso à Informação (Lei 12.527/2011), LGPD (Lei 13.709/2018)
- Divulgação e publicidade: o extrato do contrato será publicado no Diário Oficial da União/Estado/Município e no Portal Nacional de Contratações Públicas — PNCP, no prazo de 20 dias úteis da assinatura (Art. 94, Lei 14.133/2021)
- Outros termos: cláusulas de prevalência (este TR prevalece sobre propostas comerciais em caso de conflito), integração (documentos do processo licitatório integram o contrato), boa-fé e probidade (obrigação de colaboração recíproca)

---

**DECLARAÇÃO DO RESPONSÁVEL PELA ELABORAÇÃO:**

Declaro que este Termo de Referência foi elaborado em conformidade com o Art. 6º, XXIII, e Art. 9º da Lei nº 14.133/2021, com as normas internas do órgão, e que as especificações técnicas não foram direcionadas a produto ou fornecedor específico.

_________________________________
[Nome completo do Servidor Responsável pelo TR]
[Cargo/Função] — [Unidade Administrativa]
[Órgão Público] — [CNPJ]
Data: [DATA ATUAL]

**APROVADO POR:**

_________________________________
[Nome do Ordenador de Despesas / Autoridade Competente]
[Cargo/Função] — [Órgão]
Data: [DATA ATUAL]
  `,

  [DocumentType.PESQUISA_PRECO]: `
RELATÓRIO ANALÍTICO DE PESQUISA DE PREÇOS
Base Legal: Art. 23 da Lei nº 14.133/2021 | IN SEGES/ME nº 65/2021

Gere o Relatório COMPLETO seguindo EXATAMENTE esta estrutura. Comece pelo cabeçalho oficial. SEM apresentações.
REGRA CRÍTICA: NUNCA invente valores, links ou cotações. Use apenas dados reais fornecidos nos DADOS DO PNCP acima.

---

# RELATÓRIO DE PESQUISA DE PREÇOS
## [ÓRGÃO] | Processo nº ___/[ANO]

**Objeto:** [objeto completo]
**Data da pesquisa:** [data atual]
**Responsável técnico:** [servidor]

---

## 1. FUNDAMENTO LEGAL E METODOLOGIA
Escreva 3 parágrafos:
- Base legal: Art. 23 da Lei 14.133/2021 e IN SEGES/ME nº 65/2021 — obrigatoriedade da pesquisa de preços
- Fontes consultadas em ordem de prioridade legal (Art. 5º, IN 65/2021):
  1. PNCP — Portal Nacional de Contratações Públicas (pncp.gov.br)
  2. Painel de Preços (paineldeprecos.planejamento.gov.br)
  3. Contratações similares de outros entes públicos
  4. Pesquisa direta com fornecedores
- Metodologia de cálculo: média aritmética saneada ou mediana, com expurgo de outliers se CV > 25% (Art. 6º, IN 65/2021)

## 2. QUADRO DE CONTRATAÇÕES SIMILARES — PNCP
Com base exclusivamente nos DADOS REAIS DO PNCP fornecidos acima, preencher a tabela:

| # | Órgão Contratante | UF | Objeto | Valor Estimado (R$) | Modalidade | Data | Link |
|---|---|---|---|---|---|---|---|
[Inserir TODOS os contratos dos dados PNCP fornecidos — um por linha — com link clicável]

*Fonte: Portal Nacional de Contratações Públicas — pncp.gov.br*
*Auditabilidade garantida conforme Art. 23 da Lei 14.133/2021*

Se não houver dados do PNCP: declarar explicitamente "Não foram encontrados contratos similares no PNCP para o período pesquisado" e justificar.

## 3. PESQUISA COMPLEMENTAR — OUTRAS FONTES
Tabela com referências de outras fontes (se disponíveis nos dados fornecidos):

| # | Fonte | Descrição | Valor (R$) | Data | Link |
|---|---|---|---|---|---|
[Inserir apenas dados reais — não inventar]

Se não houver dados complementares: declarar e justificar a limitação.

## 4. ANÁLISE ESTATÍSTICA DOS PREÇOS
Com base nos valores reais coletados, calcular:

**Valores coletados:** [listar todos os valores]

| Estatística | Valor (R$) |
|---|---|
| Menor valor | R$ |
| Maior valor | R$ |
| Soma total | R$ |
| Média Aritmética | R$ |
| Mediana | R$ |
| Desvio Padrão | R$ |
| CV (Coef. de Variação) | % |

**Análise do CV:**
- Se CV ≤ 25%: usar a Média Aritmética como referência — distribuição homogênea
- Se CV > 25%: aplicar expurgo dos outliers (valores > média + 1,5×DP ou < média − 1,5×DP) e recalcular

[Mostrar o cálculo passo a passo]

## 5. PREÇO DE REFERÊNCIA APURADO
- **Metodologia adotada:** [média saneada / mediana] — [justificativa da escolha]
- **Preço unitário de referência:** R$ [valor]
- **Quantidade estimada:** [qtd]
- **Valor total estimado da contratação:** R$ [valor unitário × quantidade]
- Confirmação de compatibilidade com o mercado (Art. 23, §1º, Lei 14.133/2021)

## 6. CONCLUSÃO E ATESTADO DE CONFORMIDADE
Escreva 2 parágrafos formais:
- Declaração de que a pesquisa de preços foi realizada em conformidade com o Art. 23 da Lei 14.133/2021 e a IN SEGES/ME nº 65/2021
- O valor de R$ [valor] está apto a servir como preço de referência para a contratação

---
_________________________________
[Nome do Servidor Responsável pela Pesquisa]
[Cargo/Função] — [Órgão]
[Data]

*Nota: Este relatório foi elaborado com dados reais do PNCP e fontes oficiais. Todos os links são rastreáveis para fins de auditoria.*
  `,

  [DocumentType.VIABILIDADE]: `
ESTUDO DE VIABILIDADE DA CONTRATAÇÃO
Base Legal: Art. 18, V e §1º da Lei nº 14.133/2021

Gere o Estudo de Viabilidade COMPLETO seguindo EXATAMENTE esta estrutura. Comece pelo cabeçalho oficial. SEM apresentações.

---

# ESTUDO DE VIABILIDADE DA CONTRATAÇÃO
## [ÓRGÃO] | Processo nº ___/[ANO] | Data: [DATA ATUAL]

**Objeto analisado:** [objeto completo]

---

## 1. DIAGNÓSTICO DA SITUAÇÃO ATUAL E PROBLEMA A RESOLVER
Escreva 5 parágrafos:
- Situação atual detalhada: como o serviço/bem é obtido hoje (se há)
- Deficiências, riscos e impactos negativos da situação atual
- Necessidade concreta que justifica a análise de viabilidade
- Dados quantitativos do problema (volumes, frequência, perdas, etc.)
- Base legal: Art. 11 da Lei 14.133/2021 (objetivos das contratações)

## 2. ANÁLISE COMPARATIVA DE SOLUÇÕES (Benchmarking de Mercado)
Escreva análise detalhada de ao menos 3 soluções alternativas:

### Solução A: [Nome/Descrição]
- Descrição técnica completa
- Vantagens: [listar com parágrafos explicativos]
- Desvantagens e riscos: [listar com parágrafos explicativos]
- Custo estimado de implantação: R$ [valor]
- Custo estimado de operação anual: R$ [valor]
- Disponibilidade no mercado nacional: [sim/não/limitada]

### Solução B: [Nome/Descrição]
[mesma estrutura]

### Solução C: [Nome/Descrição]
[mesma estrutura]

## 3. ANÁLISE DE TCO — CUSTO TOTAL DE PROPRIEDADE (Art. 11 — Lei 14.133/2021)
Escreva 4 parágrafos:
- A Lei 14.133/2021 (Art. 11) determina que se considere o ciclo de vida completo — não apenas o menor preço inicial
- Tabela comparativa de TCO para cada solução ao longo de [X anos]:

| Componente de Custo | Solução A | Solução B | Solução C |
|---|---|---|---|
| Custo de aquisição | R$ | R$ | R$ |
| Custo de implantação | R$ | R$ | R$ |
| Custo de manutenção (anual) | R$ | R$ | R$ |
| Custo de operação (anual) | R$ | R$ | R$ |
| Custo de descarte/substituição | R$ | R$ | R$ |
| **TCO Total ([X] anos)** | **R$** | **R$** | **R$** |

- Análise: qual solução apresenta melhor vantajosidade ao longo do ciclo de vida
- Princípio da Economicidade: justificar que a solução escolhida representa eficiência máxima do gasto público

## 4. ANÁLISE DE BENEFÍCIOS E IMPACTOS ESPERADOS
Escreva 3 parágrafos com indicadores mensuráveis:
- **Benefícios quantitativos:** redução de custos, ganho de produtividade, economia gerada
- **Benefícios qualitativos:** melhoria do serviço ao cidadão, segurança jurídica, conformidade legal
- **Indicadores de acompanhamento:** KPIs que serão monitorados após a contratação

## 5. MATRIZ DE RISCOS PRELIMINAR
Para cada risco, formato: Causa → Evento → Consequência → Probabilidade (1-5) → Impacto (1-5) → Nível → Tratamento

Riscos obrigatórios:
- Risco financeiro: variação de preços / inflação durante a execução
- Risco tecnológico: obsolescência ou incompatibilidade da solução escolhida
- Risco de mercado: concentração de fornecedores / fornecedor único
- Risco regulatório: mudanças normativas que afetem a execução
- Risco operacional: falha na implantação ou na capacitação dos servidores

## 6. CONCLUSÃO — PARECER DE VIABILIDADE
Escreva 4 parágrafos:
- Síntese comparativa das soluções analisadas
- Identificação da solução mais vantajosa com base no TCO e nos benefícios
- **Declaração formal de viabilidade** (ou inviabilidade com justificativa)
- Recomendação: prosseguir para elaboração do ETP e TR com a Solução [X] escolhida

---
_________________________________
[Nome do Servidor Responsável]
[Cargo/Função] — [Órgão]
[Data]
  `,

  [DocumentType.IMPUGNACAO]: `
RESPOSTA À IMPUGNAÇÃO
Base Legal: Art. 164 da Lei nº 14.133/2021

Gere o Parecer de Resposta à Impugnação completo. Comece direto no cabeçalho. SEM introduções da IA.

---

## RELATÓRIO
## DA ADMISSIBILIDADE
## DO MÉRITO
## CONCLUSÃO
## RESPONSÁVEL E ASSINATURA
  `,

};