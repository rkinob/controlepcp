export interface OPProgramada {
  id_ordem_producao_data: number;
  id_ordem_producao: number;
  id_grupo_producao: number;
  dt_ordem_producao: string;
  qtd_prevista: number;
  qtd_realizada: number;
  qtd_perda: number;
  status: string;
  aprovado: number;
  fl_remanejado: number;
  // Campos da OP (join)
  codigo_op: string;
  qtd_total: number;
  // Campos do modelo (join)
  cd_modelo: string;
  modelo_descricao: string;
  meta_por_hora: number;
  // Campos do grupo (join)
  grupo_descricao: string;
  // Calculado
  saldo: number;
}

export interface OPProgramadaListResponse {
  success: boolean;
  message: string;
  data: {
    ops: OPProgramada[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    pode_remanejar: boolean;
  };
}

