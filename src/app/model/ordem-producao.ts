export interface OrdemProducao {
  id_ordem_producao: number;
  id_modelo: number;
  codigo_op: string;
  data_inicio: string;
  qtd_total: number;
  qtd_realizada?: number;
  dt_inclusao: string;
  dt_alteracao: string;
  fl_ativo: number;
  // Campos do modelo (join)
  cd_modelo?: string;
  descricao_modelo?: string;
  meta_por_hora?: number;
}

export interface OrdemProducaoListResponse {
  success: boolean;
  message: string;
  data: {
    ordens: OrdemProducao[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface OrdemProducaoResponse {
  success: boolean;
  message: string;
  data: OrdemProducao;
}
