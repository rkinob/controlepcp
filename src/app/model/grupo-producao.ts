export interface GrupoProducao {
  id_grupo_producao?: number;
  descricao: string;
  dt_inclusao?: string;
  dt_alteracao?: string;
  id_usuario?: number;
  fl_ativo?: boolean;
}

export interface GrupoProducaoForm {
  descricao: string;
  fl_ativo: boolean;
}

export interface GrupoProducaoListResponse {
  data: {
    grupos: GrupoProducao[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };

}
