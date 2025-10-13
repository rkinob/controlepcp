export interface LogSistema {
  id_log?: number;
  id_usuario?: number;
  id_alterado?: number;
  ocorrencia: string;
  data_cadastro?: string;
  usuario_nome?: string;
  usuario_login?: string;
  usuario_email?: string;
}

export interface LogSistemaRequest {
  id_usuario?: number;
  id_alterado?: number;
  ocorrencia: string;
}

export interface LogSistemaResponse {
  success: boolean;
  message: string;
  data?: LogSistema;
}

export interface LogSistemaListResponse {
  success: boolean;
  message: string;
  data?: {
    logs: LogSistema[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface LogSistemaSearchResponse {
  success: boolean;
  message: string;
  data?: LogSistema[];
}

// Tipos de operações para facilitar a criação de logs
export enum TipoOperacao {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  VIEW = 'VIEW',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT'
}

// Entidades que podem ser logadas
export enum EntidadeLogada {
  USUARIO = 'USUARIO',
  ALUNO = 'ALUNO',
  INSTRUTOR = 'INSTRUTOR',
  SERVICO = 'SERVICO',
  MATRICULA = 'MATRICULA',
  MENSALIDADE = 'MENSALIDADE',
  DESPESA = 'DESPESA',
  RECEITA = 'RECEITA',
  SISTEMA = 'SISTEMA'
}

// Interface para criar logs de forma padronizada
export interface LogEntry {
  tipoOperacao: TipoOperacao;
  entidade: EntidadeLogada;
  idAlterado?: number;
  descricao: string;
  dadosAntigos?: any;
  dadosNovos?: any;
}
