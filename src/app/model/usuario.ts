export interface Usuario {
  id_usuario?: number;
  login: string;
  senha?: string; // Campo opcional para não expor a senha em listagens
  nome_usuario: string;
  id_tipo_usuario?: number;
  tipo_usuario?: number; // Mantido para compatibilidade
  data_cadastro?: string;
  data_atualizacao?: string;
  fl_ativo?: number;
}

export interface UsuarioRequest {
  login: string;
  senha: string;
  nome_usuario: string;
  id_tipo_usuario: number;
}

export interface UsuarioUpdateRequest {
  login?: string;
  senha?: string;
  nome_usuario?: string;
  id_tipo_usuario?: number;
}

export interface UsuarioResponse {
  success: boolean;
  message: string;
  data?: Usuario;
}

export interface UsuarioListResponse {
  success: boolean;
  message: string;
  data?: {
    usuarios: Usuario[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface UsuarioSearchResponse {
  success: boolean;
  message: string;
  data?: Usuario[];
}

export interface ChangePasswordRequest {
  senha_atual: string;
  nova_senha: string;
  confirmar_senha: string;
}
