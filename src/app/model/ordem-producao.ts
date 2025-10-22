export interface OrdemProducao {
  id_ordem_producao: number;
  id_modelo: number;
  id_grupo_principal?: number;
  id_cliente?: number;
  codigo_op: string;
  data_inicio: string;
  prazo_final?: string;
  qtd_total: number;
  observacao?: string;
  qtd_realizada?: number;
  qtd_alocada?: number;
  dt_inclusao: string;
  dt_alteracao: string;
  fl_ativo: number;
  // Campos do modelo (join)
  cd_modelo?: string;
  descricao_modelo?: string;
  meta_por_hora?: number;
  id_empresa?: number;
  grupo_principal_descricao?: string;
  empresa_nome?: string;
  cliente_nome?: string;
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
