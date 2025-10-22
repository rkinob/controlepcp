export interface Permissao {
  id_permissao: number;
  ds_permissao: string;
  descricao_completa?: string;
  fl_ativo: number;
  dt_cadastro?: string;
  dt_atualizacao?: string;
  qtd_usuarios?: number;
}

export interface UsuarioPermissao {
  id_usuario: number;
  id_permissao: number;
  dt_inclusao?: string;
}

export interface PermissaoComCheck extends Permissao {
  selecionada: boolean;
  desabilitada?: boolean;
}

