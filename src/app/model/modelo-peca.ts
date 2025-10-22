export interface ModeloPeca {
  id_modelo?: number;
  cd_modelo: string;
  meta_por_hora: number;
  descricao: string;
  dt_inclusao?: string;
  dt_alteracao?: string;
  fl_ativo?: boolean;
  id_empresa?: number;
  empresa_nome?: string;
}

export interface ModeloPecaForm {
  cd_modelo: string;
  meta_por_hora: number;
  descricao: string;
  fl_ativo: boolean;
  id_empresa: number;
}

export interface ModeloPecaListResponse {
  modelos: ModeloPeca[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
