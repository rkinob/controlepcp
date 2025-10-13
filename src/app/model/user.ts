
export interface User {
  id_usuario: number;
  nome: string;
  celular: string;
  email?: string;
  tipo: 'admin' | 'cliente';
  data_criacao?: string;
  data_atualizacao?: string;
  token?: string;
}
