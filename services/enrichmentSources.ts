/**
 * enrichmentSources.ts
 *
 * Base de conhecimento embutida no código — rastreável e auditável.
 * ZERO dependência de LLM para dados legais: artigos, acórdãos e INs
 * são strings literais verificadas manualmente.
 */

import { DocumentType } from '../types';

// ─── Blocos legais verificados ────────────────────────────────────────────────

const LEGAL_BLOCKS = {
  principios: `
Lei nº 14.133/2021 — Art. 5º — Princípios:
Legalidade, impessoalidade, moralidade, publicidade, eficiência, interesse público,
probidade administrativa, igualdade, planejamento, transparência, eficácia,
segregação de funções, motivação, vinculação ao edital, julgamento objetivo,
segurança jurídica, razoabilidade, competitividade, proporcionalidade, celeridade,
economicidade e duração razoável do processo.
  `.trim(),

  art12_pca: `
Lei nº 14.133/2021 — Art. 12, §1º — Plano de Contratações Anual (PCA):
A Administração deverá elaborar plano anual de contratações, com o objetivo de
racionalizar as contratações dos órgãos e entidades sob sua competência.
IN SEGES/ME nº 40/2020 — regulamenta a elaboração e gestão do PCA.
Art. 12, VII — a contratação deve ser precedida de planejamento, com identificação
da necessidade, dos recursos orçamentários e do objeto com precisão.
  `.trim(),

  art18_etp: `
Lei nº 14.133/2021 — Art. 18 — Estudo Técnico Preliminar (ETP):
O ETP deve conter:
  I   — descrição da necessidade da contratação, considerado o problema a ser resolvido;
  II  — demonstração da previsão da contratação no plano de contratações anual;
  III — requisitos da contratação;
  IV  — estimativas das quantidades para a contratação;
  V   — levantamento de mercado e análise das alternativas possíveis;
  VI  — estimativa do valor da contratação;
  VII — descrição da solução como um todo;
  VIII — justificativas para o parcelamento ou não da solução;
  IX  — demonstrativo dos resultados pretendidos;
  X   — providências a serem adotadas pela Administração;
  XI  — possíveis impactos ambientais e medidas mitigadoras;
  XII — posicionamento conclusivo sobre a viabilidade da contratação.
§1º — O ETP deve conter ao menos os elementos dos incisos I, IV, VI e XII.
§2º — Se inviável, o processo é encerrado ou suspenso e os autos retornam à autoridade.
IN SEGES/ME nº 58/2022 — regulamenta o ETP; Art. 7º — conteúdo mínimo obrigatório.
  `.trim(),

  art23_pesquisa: `
Lei nº 14.133/2021 — Art. 23 — Estimativa do Valor da Contratação:
§1º — O valor estimado será calculado com base em:
  I   — Painel de Preços do Governo Federal;
  II  — preços de atas de registro de preços vigentes;
  III — contratos firmados pela Administração Pública;
  IV  — pesquisa publicada em mídia especializada;
  V   — cotação com fornecedores;
  VI  — pesquisa na internet.
§2º — proibido basear a estimativa em fonte única.
§3º — o valor poderá ser sigiloso até a abertura do certame (Art. 24).
IN SEGES/ME nº 65/2021:
  Art. 5º — fontes prioritárias: Painel de Preços e PNCP.
  Art. 6º — metodologia: média ou mediana; expurgo de outliers (1,5× desvio padrão).
  Art. 7º — validade da pesquisa: 180 dias.
  `.trim(),

  art40_parcelamento: `
Lei nº 14.133/2021 — Art. 40 — Parcelamento do Objeto:
§1º — O objeto deve ser dividido em tantas parcelas quantas se comprovem técnica
e economicamente viáveis, para ampliar a competição e reduzir riscos.
§2º — A não divisão em parcelas deverá ser justificada no processo.
Súmula TCU nº 247 — É obrigatória a admissão da adjudicação por item, e não por
preço global, nos editais de licitação para contratação de obras, serviços,
compras e alienações, cujo objeto seja divisível, desde que não haja prejuízo
para o conjunto ou complexo ou perda de economia de escala.
  `.trim(),

  art6_xxiii_tr: `
Lei nº 14.133/2021 — Art. 6º, XXIII — Termo de Referência:
Documento elaborado a partir dos estudos técnicos preliminares que contenha:
a) definição do objeto, incluídas suas características, unidade de medida,
   quantidade e prazo de execução do contrato;
b) fundamentação da contratação;
c) descrição da solução como um todo;
d) requisitos da contratação;
e) modelo de execução do objeto;
f) modelo de gestão do contrato;
g) critérios de medição e pagamento;
h) formas e critérios de seleção do fornecedor;
i) estimativas do valor da contratação;
j) adequação orçamentária.
Art. 92 — Exigências de habilitação devem ser proporcionais ao objeto.
  `.trim(),

  art18_riscos: `
Lei nº 14.133/2021 — Art. 18, §1º — Mapa de Riscos:
O ETP pode incluir mapa de riscos com identificação e análise de riscos que possam
comprometer o sucesso da licitação e da execução contratual.
Guia de Gestão de Riscos do TCU (2018):
  → Identificação: evento, causa, consequência.
  → Análise qualitativa: probabilidade × impacto (escala: Alto/Médio/Baixo).
  → Matriz de calor: nível = combinação P × I.
  → Respostas: mitigar, transferir, aceitar, evitar.
  → Plano de contingência para riscos críticos.
ISO 31000:2018 — referência internacional para gestão de riscos.
  `.trim(),

  acordaos_tcu: `
Acórdãos TCU verificados — uso obrigatório como jurisprudência:
• Acórdão 1.521/2013-Plenário — exigência de precisão na definição do objeto licitado.
• Acórdão 2.170/2007-Plenário — vedação à restrição indevida à competição.
• Acórdão 1.214/2013-Plenário — metodologia de pesquisa de preços; cesta de preços aceitáveis.
• Acórdão 1.599/2021-Plenário — proibição de superdimensionamento ("jogo de planilha").
• Acórdão 2.637/2015-Plenário — proporcionalidade nos requisitos de habilitação técnica.
• Acórdão 1.827/2008-Plenário — memória de cálculo obrigatória nas estimativas de quantidade.
• Acórdão 3.243/2020-Plenário — Painel de Preços como fonte preferencial de pesquisa.
  `.trim(),

  art86_carona: `
Lei nº 14.133/2021 — Art. 86 — Adesão à Ata de Registro de Preços ("Carona"):
§1º — A adesão é excepcional e depende de autorização do órgão gerenciador.
§2º — O órgão aderente deve demonstrar vantajosidade da adesão.
§3º — Limite por órgão aderente: 50% dos quantitativos dos itens da ata.
§4º — Limite global de adesões: até o dobro do quantitativo original.
Decreto Federal nº 11.462/2023 — regulamenta o registro de preços na Lei 14.133/2021.
  `.trim(),

  art66_habilitacao: `
Lei nº 14.133/2021 — Habilitação:
Art. 66 — Habilitação jurídica: atos constitutivos, inscrição no CNPJ, documentos de identidade dos representantes.
Art. 67 — Qualificação técnica: atestados de capacidade técnica, registros em conselhos profissionais, certificados.
Art. 68 — Regularidade fiscal, social e trabalhista: PGFN, SRF, FGTS, INSS, CNDT, Receita Estadual/Municipal.
Art. 69 — Qualificação econômico-financeira: balanço patrimonial, índices de liquidez, capital social mínimo, seguro.
Art. 70 — Vedação a exigências que restrinjam indevidamente a competição.
Art. 92, §1º — Exigências de habilitação devem ser proporcionais e justificadas no objeto.
  `.trim(),

  art117_fiscalizacao: `
Lei nº 14.133/2021 — Gestão e Fiscalização Contratual:
Art. 117 — A execução do contrato deverá ser acompanhada e fiscalizada por 1 ou mais fiscais designados pela autoridade.
§1º — O fiscal ou comissão deverá ser servidor com qualificação técnica necessária.
§2º — O fiscal poderá ser auxiliado por terceiros, sob responsabilidade da Administração.
Art. 119 — O fiscal registrará ocorrências, exigirá providências e comunicará irregularidades ao gestor.
Art. 140 — O recebimento provisório e definitivo do objeto deve ser formalizado.
  `.trim(),

  art141_pagamento: `
Lei nº 14.133/2021 — Pagamento:
Art. 141 — O prazo para pagamento é de até 30 dias corridos, contados da data da entrega da nota fiscal ou fatura.
§1º — O prazo poderá ser de até 45 dias quando o contratado for microempresa ou empresa de pequeno porte.
§2º — O atraso no pagamento gera atualização financeira com base no IPCA/INPC, pro rata die.
Art. 145 — Vedado o recebimento de valores sem a devida contraprestação de serviços ou bens.
IN SEGES/ME nº 5/2017 — Regras para pagamento de serviços terceirizados (retenções, conta vinculada).
  `.trim(),

  art156_sancoes: `
Lei nº 14.133/2021 — Sanções Administrativas:
Art. 156 — Sanções aplicáveis ao contratado:
  I   — Advertência;
  II  — Multa;
  III — Impedimento de licitar e contratar (até 3 anos);
  IV  — Declaração de inidoneidade para licitar ou contratar (até 6 anos).
Art. 162 — Multa moratória por atraso injustificado: até 0,5% por dia sobre o valor da parcela inadimplida.
Art. 163 — Multa compensatória por inexecução total ou parcial: até 30% do valor do contrato.
Art. 158 — Garantida a defesa prévia e o contraditório antes da aplicação de qualquer sanção.
Art. 160 — Sanções acima de advertência registradas no SICAF e CEIS.
  `.trim(),

  art137_rescisao: `
Lei nº 14.133/2021 — Rescisão Contratual:
Art. 137 — Hipóteses de rescisão unilateral pela Administração:
  I  — Inexecução total ou parcial do contrato;
  III — Lentidão no cumprimento das obrigações;
  IV  — Atraso injustificado no início da execução;
  IX  — Razões de interesse público, de alta relevância e amplo conhecimento.
Art. 138 — Na rescisão, a Administração pode assumir o objeto, ocupar e utilizar equipamentos e materiais.
Art. 139 — Rescisão amigável por mútuo acordo, quando conveniente para a Administração.
  `.trim(),

  lei_8987_concessoes: `
Lei nº 8.987/1995 — Regime de Concessão e Permissão de Serviços Públicos:
Art. 18 — exigências do edital de concessão.
Lei nº 11.079/2004 — Parcerias Público-Privadas (PPP):
Art. 10 — estudos de viabilidade obrigatórios antes da licitação.
Lei nº 14.133/2021 — Art. 11 — vantajosidade ao longo do ciclo de vida da contratação.
  `.trim(),
};

// ─── Mapeamento por tipo de documento ────────────────────────────────────────

const LEGAL_SOURCE_MAP: Record<string, (keyof typeof LEGAL_BLOCKS)[]> = {
  DFD:           ['principios', 'art12_pca', 'art18_etp', 'art23_pesquisa', 'art6_xxiii_tr', 'art66_habilitacao', 'art117_fiscalizacao', 'art141_pagamento', 'art156_sancoes', 'art137_rescisao', 'acordaos_tcu'],
  ETP:           ['principios', 'art18_etp', 'art23_pesquisa', 'art40_parcelamento', 'acordaos_tcu'],
  MAPA_RISCO:    ['principios', 'art18_riscos', 'acordaos_tcu'],
  TR:            ['principios', 'art6_xxiii_tr', 'art40_parcelamento', 'acordaos_tcu'],
  PESQUISA_PRECO:['principios', 'art23_pesquisa', 'acordaos_tcu'],
  VIABILIDADE:   ['principios', 'lei_8987_concessoes'],
  IMPUGNACAO:    ['principios', 'art40_parcelamento', 'acordaos_tcu'],
};

export function getLegalContext(docType: DocumentType): string {
  const key = Object.entries(DocumentType).find(([, v]) => v === docType)?.[0] ?? '';
  const blocks = LEGAL_SOURCE_MAP[key] ?? ['principios'];
  return blocks.map(k => LEGAL_BLOCKS[k]).join('\n\n---\n\n');
}

// ─── Sustentabilidade por palavra-chave (zero LLM) ────────────────────────────

const SUSTAINABILITY_CRITERIA = [
  {
    keywords: ['veículo', 'carro', 'ônibus', 'caminhão', 'frota', 'combustível', 'diesel', 'gasolina'],
    text: `Sustentabilidade — Veículos e Combustíveis:
• Preferência a combustíveis com menor teor de enxofre (Diesel S10 vs S500 — Resolução ANP 50/2013)
• Menor emissão de CO₂ e material particulado (Programa PROCONVE — Resolução CONAMA 18/1986)
• Logística reversa de óleo lubrificante e pneus usados (Lei 12.305/2010 — PNRS)
• Decreto nº 7.746/2012 — critérios de sustentabilidade nas contratações públicas federais`,
  },
  {
    keywords: ['papel', 'impressão', 'gráfica', 'cópia', 'impressora'],
    text: `Sustentabilidade — Papel e Impressão:
• Papel com certificação FSC ou CERFLOR (manejo florestal sustentável)
• Impressão frente-e-verso como padrão; uso de papel reciclado quando disponível
• IN SLTI/MPOG nº 1/2010 — critérios de sustentabilidade para bens e serviços`,
  },
  {
    keywords: ['limpeza', 'conservação', 'higiene', 'produto químico', 'saneante'],
    text: `Sustentabilidade — Limpeza e Conservação:
• Produtos biodegradáveis com menor teor de substâncias tóxicas (ANVISA RDC 222/2006)
• Refil/recarga sempre que disponível para redução de embalagem plástica
• Destinação correta de resíduos perigosos (embalagens de produtos químicos)
• IN SLTI/MPOG nº 1/2010`,
  },
  {
    keywords: ['ti', 'tecnologia', 'computador', 'servidor', 'software', 'sistema', 'notebook', 'hardware'],
    text: `Sustentabilidade — TI Verde:
• Equipamentos com certificação Energy Star ou EPEAT (eficiência energética)
• Logística reversa de equipamentos eletrônicos (Lei 12.305/2010 — PNRS)
• Preferência a soluções em nuvem para redução de consumo de energia física
• IN SGD/ME nº 94/2022 — contratações de soluções de TIC`,
  },
  {
    keywords: ['obra', 'construção', 'reforma', 'infraestrutura', 'pavimentação', 'drenagem'],
    text: `Sustentabilidade — Obras e Construção:
• Uso de materiais locais e regionais (redução de frete e emissões de transporte)
• Eficiência energética e hídrica no projeto (NBR 15575 — ABNT)
• Destinação correta de resíduos da construção civil (Resolução CONAMA 307/2002)
• Gestão de áreas de bota-fora e jazidas (normas DNIT/IBAMA)
• Decreto nº 7.746/2012`,
  },
  {
    keywords: ['alimentação', 'merenda', 'refeição', 'gênero alimentício', 'alimento'],
    text: `Sustentabilidade — Alimentação:
• Priorização de alimentos orgânicos ou agroecológicos da agricultura familiar (Lei 11.947/2009)
• Embalagens biodegradáveis ou retornáveis
• Redução de desperdício alimentar — critérios de aproveitamento integral dos alimentos`,
  },
];

const SUSTAINABILITY_DEFAULT = `Sustentabilidade — Critérios Gerais:
• IN SLTI/MPOG nº 1/2010 — preferência a bens e serviços de menor impacto ambiental
• Decreto nº 7.746/2012 — sustentabilidade como critério de seleção nas contratações públicas
• Uso racional de recursos naturais e redução de resíduos na execução contratual
• Destinação ambientalmente adequada dos resíduos gerados
• Conformidade com a Política Nacional de Resíduos Sólidos (Lei 12.305/2010 — PNRS)`;

export function getSustainabilityContext(objectDescription: string): string {
  const lower = objectDescription.toLowerCase();
  const matched = SUSTAINABILITY_CRITERIA.filter(c =>
    c.keywords.some(kw => lower.includes(kw))
  );
  return matched.length > 0
    ? matched.map(c => c.text).join('\n\n')
    : SUSTAINABILITY_DEFAULT;
}
