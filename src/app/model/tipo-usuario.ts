export interface TipoUsuario {
  id_tipo_usuario: number;
  descricao: string;
  dt_inclusao?: string;
  dt_alteracao?: string;
  id_usuario?: number;
  fl_ativo: number;
}

export interface TipoUsuarioListResponse {
  success: boolean;
  message: string;
  data: {
    tipos: TipoUsuario[];
    total: number;
  };
}

export interface TipoUsuarioResponse {
  success: boolean;
  message: string;
  data: TipoUsuario;
}
