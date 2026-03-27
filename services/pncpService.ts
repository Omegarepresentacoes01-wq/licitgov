export interface PNCPItem {
  orgao: string;
  objeto: string;
  valorEstimado: number;
  dataPublicacao: string;
  modalidade: string;
  link: string;
  uf: string;
}

export interface PNCPResult {
  items: PNCPItem[];
  total: number;
  success: boolean;
  error?: string;
}

const PNCP_API = 'https://pncp.gov.br/api/consulta/v1';

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

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
    const response = await fetch(`${PNCP_API}/contratacoes/publicacao?${params}`, {
      headers: { Accept: 'application/json' },
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

export function formatPNCPForPrompt(result: PNCPResult, query: string): string {
  if (!result.success || result.items.length === 0) {
    return `[AVISO: Não foram encontrados contratos recentes no PNCP para "${query}". Use o Google Search para buscar dados de referência no pncp.gov.br e paineldeprecos.planejamento.gov.br.]`;
  }

  const linhas = result.items.map((item, i) => {
    const valor = item.valorEstimado > 0
      ? `R$ ${item.valorEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      : 'Não informado';
    return `${i + 1}. Órgão: ${item.orgao} (${item.uf || 'N/A'})
   Objeto: ${item.objeto}
   Valor Estimado: ${valor}
   Modalidade: ${item.modalidade}
   Data: ${item.dataPublicacao}
   Link: ${item.link}`;
  });

  return `DADOS REAIS DO PNCP (${result.total} contratos encontrados nos últimos 12 meses):
${linhas.join('\n\n')}`;
}
