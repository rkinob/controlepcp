
export interface User {
  id_usuario: number;
  nome?: string;
  nome_usuario?: string;
  login?: string;
  celular?: string;
  email?: string;
  tipo?: 'admin' | 'cliente';
  tipo_usuario?: number;
  id_tipo_usuario?: number;
  tipo_usuario_desc?: string;
  data_criacao?: string;
  data_atualizacao?: string;
  token?: string;
  iat?: number;
  exp?: number;
}
