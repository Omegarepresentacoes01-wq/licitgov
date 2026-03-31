export interface PNCPItem {
  orgao: string;
  objeto: string;
  valorEstimado: number;
  dataPublicacao: string;
  modalidade: string;
  link: string;
  uf: string;
}

export interface PainelPrecoItem {
  descricao: string;
  precoUnitario: number;
  unidade: string;
  orgao: string;
  dataCompra: string;
}

export interface PainelPrecoResult {
  items: PainelPrecoItem[];
  success: boolean;
  error?: string;
}

export interface PNCPResult {
  items: PNCPItem[];
  total: number;
  success: boolean;
  error?: string;
}

// Rotas via proxy Vite — sem CORS
const PNCP    = '/proxy-pncp/api/consulta/v1';
const PAINEL  = '/proxy-painel/api';
const COMPRAS = '/proxy-compras';

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

// ── PNCP ─────────────────────────────────────────────────────────────────────
export async function searchPNCP(query: string, uf?: string): Promise<PNCPResult> {
  const hoje = new Date();
  const dataFinal = formatDate(hoje);
  const umAnoAtras = new Date(hoje);
  umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1);
  const dataInicial = formatDate(umAnoAtras);

  const params = new URLSearchParams({
    dataInicial,
    dataFinal,
    tamanhoPagina: '10',
    pagina: '1',
    q: query,
  });

  if (uf) params.set('uf', uf.toUpperCase());

  try {
    const response = await fetch(`${PNCP}/contratacoes/publicacao?${params}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return { items: [], total: 0, success: false, error: `HTTP ${response.status}` };
    }

    const json = await response.json();
    const data: any[] = json.data || [];

    const items: PNCPItem[] = data.map((item) => {
      const cnpj = item.orgaoEntidade?.cnpj || '';
      const ano = item.anoCompra || new Date().getFullYear();
      const seq = item.sequencialCompra || '';
      const cnpjClean = cnpj.replace(/\D/g, '');
      const link =
        item.linkSistemaOrigem ||
        (cnpjClean && seq
          ? `https://pncp.gov.br/app/editais/${cnpjClean}/${ano}/${seq}`
          : `https://pncp.gov.br/app/editais?q=${encodeURIComponent(item.objetoCompra || query)}`);

      return {
        orgao: item.orgaoEntidade?.razaoSocial || item.unidadeOrgao?.nomeUnidade || 'Não informado',
        objeto: item.objetoCompra || '',
        valorEstimado: item.valorTotalEstimado || item.valorTotalHomologado || 0,
        dataPublicacao: item.dataPublicacaoPncp
          ? new Date(item.dataPublicacaoPncp).toLocaleDateString('pt-BR')
          : '',
        modalidade: item.modalidadeNome || '',
        link,
        uf: item.unidadeOrgao?.ufSigla || item.unidadeOrgao?.uf || '',
      };
    });

    return { items, total: json.totalRegistros || items.length, success: true };
  } catch (error: any) {
    return { items: [], total: 0, success: false, error: error.message };
  }
}

// ── Painel de Preços ──────────────────────────────────────────────────────────
export async function searchPainelPrecos(query: string): Promise<PainelPrecoResult> {
  // Tenta diferentes endpoints do Painel de Preços
  const endpoints = [
    `${PAINEL}/item-preco/resultado?descricao=${encodeURIComponent(query)}&pagina=1&tamanhoPagina=10`,
    `${PAINEL}/materiais?descricao=${encodeURIComponent(query)}&pagina=1&tamanhoPagina=10`,
    `${PAINEL}/servicos?descricao=${encodeURIComponent(query)}&pagina=1&tamanhoPagina=10`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) continue;

      const json = await res.json();
      const data: any[] = json.resultado || json.data || json.items || json.content || [];
      if (data.length === 0) continue;

      const items: PainelPrecoItem[] = data
        .map((d: any) => ({
          descricao: d.descricaoItem || d.descricao || d.nome || query,
          precoUnitario: parseFloat(d.precoUnitario || d.valorUnitario || d.preco || '0') || 0,
          unidade: d.unidadeMedida || d.unidade || '',
          orgao: d.nomeOrgao || d.orgao || d.razaoSocial || '',
          dataCompra: d.dataReferencia || d.dataAtualizacao || d.data || '',
        }))
        .filter(i => i.precoUnitario > 0);

      if (items.length > 0) return { items, success: true };
    } catch {
      // tenta próximo endpoint
    }
  }

  return { items: [], success: false, error: 'Nenhum resultado no Painel de Preços' };
}

// ── ComprasNet ────────────────────────────────────────────────────────────────
export async function searchComprasNet(query: string): Promise<{ text: string; success: boolean }> {
  try {
    const url = `${COMPRAS}/licitacoes/v1/licitacoes.json?descricao_objeto=${encodeURIComponent(query)}&_pageSize=8`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return { text: '', success: false };

    const json = await res.json();
    const items: any[] = json._embedded?.licitacoes || [];
    if (items.length === 0) return { text: '', success: false };

    const linhas = items.slice(0, 6).map((it: any, i: number) => {
      const valor = it.valor_licitacao
        ? `R$ ${Number(it.valor_licitacao).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        : 'Não informado';
      return `${i + 1}. Órgão: ${it.nome_orgao || 'N/A'} | Objeto: ${it.descricao_objeto || ''} | Valor: ${valor} | Data: ${it.data_resultado_compra || ''}`;
    });
    return {
      text: `COMPRASNET — ${items.length} licitações encontradas:\n${linhas.join('\n')}`,
      success: true,
    };
  } catch {
    return { text: '', success: false };
  }
}

// ── Formatadores ──────────────────────────────────────────────────────────────
export function formatPainelPrecoForPrompt(result: PainelPrecoResult): string {
  if (!result.success || result.items.length === 0) return '';
  const linhas = result.items.slice(0, 10).map((it, i) =>
    `${i + 1}. ${it.descricao} | Preço Unit.: R$ ${it.precoUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}${it.unidade ? ` (${it.unidade})` : ''} | Órgão: ${it.orgao || 'Gov.br'} | Data: ${it.dataCompra || 'N/A'}`
  );
  return `=== PAINEL DE PREÇOS GOV.BR (${result.items.length} registros reais) ===\n${linhas.join('\n')}`;
}

export function formatPNCPForPrompt(result: PNCPResult, query: string): string {
  if (!result.success || result.items.length === 0) {
    return `[PNCP: nenhum contrato encontrado para "${query}" nos últimos 12 meses]`;
  }

  const linhas = result.items.map((item, i) => {
    const valor = item.valorEstimado > 0
      ? `R$ ${item.valorEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      : 'Não informado';
    return `${i + 1}. Órgão: ${item.orgao} (${item.uf || 'N/A'}) | Objeto: ${item.objeto} | Valor: ${valor} | Modalidade: ${item.modalidade} | Data: ${item.dataPublicacao} | Link: ${item.link}`;
  });

  return `=== PNCP — ${result.total} contratos reais (últimos 12 meses) ===\n${linhas.join('\n')}`;
}
