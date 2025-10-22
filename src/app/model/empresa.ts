export interface Empresa {
  id_empresa: number;
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

export interface EmpresaListResponse {
  success: boolean;
  message: string;
  data: {
    empresas: Empresa[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface EmpresaResponse {
  success: boolean;
  message: string;
  data: Empresa;
}

