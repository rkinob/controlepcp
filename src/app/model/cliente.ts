export interface Cliente {
  id_cliente: number;
  cnpj: string;
  nome: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  celular?: string;
  email?: string;
  dt_inclusao: string;
  dt_alteracao: string;
  fl_ativo: number;
}

export interface ClienteListResponse {
  success: boolean;
  message: string;
  data: {
    clientes: Cliente[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface ClienteResponse {
  success: boolean;
  message: string;
  data: Cliente;
}

