import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';
import {
  LogSistema,
  LogSistemaRequest,
  LogSistemaResponse,
  LogSistemaListResponse,
  LogSistemaSearchResponse,
  LogEntry,
  TipoOperacao,
  EntidadeLogada
} from '../model/log-sistema';

@Injectable({
  providedIn: 'root'
})
export class LogSistemaService {
  private apiUrl = environment.apiUrlv1;

  constructor(private http: HttpClient) {}

  /**
   * Criar novo log
   */
  createLog(log: LogSistemaRequest): Observable<LogSistemaResponse> {
    return this.http.post<LogSistemaResponse>(`${this.apiUrl}/log-sistema.php?action=create`, log);
  }

  /**
   * Listar logs com paginação e filtros
   */
  listLogs(
    page: number = 1,
    limit: number = 20,
    search: string = '',
    idUsuario?: number,
    dataInicio?: string,
    dataFim?: string
  ): Observable<LogSistemaListResponse> {
    let params = new HttpParams()
      .set('action', 'list')
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search);
    }

    if (idUsuario) {
      params = params.set('id_usuario', idUsuario.toString());
    }

    if (dataInicio) {
      params = params.set('data_inicio', dataInicio);
    }

    if (dataFim) {
      params = params.set('data_fim', dataFim);
    }

    return this.http.get<LogSistemaListResponse>(`${this.apiUrl}/log-sistema.php`, { params });
  }

  /**
   * Buscar logs para autocomplete
   */
  searchLogs(query: string, limit: number = 10): Observable<LogSistemaSearchResponse> {
    const params = new HttpParams()
      .set('action', 'search')
      .set('q', query)
      .set('limit', limit.toString());

    return this.http.get<LogSistemaSearchResponse>(`${this.apiUrl}/log-sistema.php`, { params });
  }

  /**
   * Obter log por ID
   */
  getLog(id: number): Observable<LogSistemaResponse> {
    const params = new HttpParams()
      .set('action', 'get')
      .set('id', id.toString());

    return this.http.get<LogSistemaResponse>(`${this.apiUrl}/log-sistema.php`, { params });
  }

  /**
   * Criar log de forma padronizada
   */
  createLogEntry(logEntry: LogEntry, idUsuario?: number): Observable<LogSistemaResponse> {
    const descricao = this.buildLogDescription(logEntry);

    const logRequest: LogSistemaRequest = {
      id_usuario: idUsuario,
      id_alterado: logEntry.idAlterado,
      ocorrencia: descricao
    };

    return this.createLog(logRequest);
  }

  /**
   * Construir descrição do log de forma padronizada
   */
  private buildLogDescription(logEntry: LogEntry): string {
    const { tipoOperacao, entidade, descricao, dadosAntigos, dadosNovos } = logEntry;

    let logDescription = `[${tipoOperacao}] ${entidade}: ${descricao}`;

    if (dadosAntigos && dadosNovos) {
      logDescription += ` | Dados alterados: ${JSON.stringify(dadosAntigos)} → ${JSON.stringify(dadosNovos)}`;
    } else if (dadosNovos) {
      logDescription += ` | Dados: ${JSON.stringify(dadosNovos)}`;
    }

    return logDescription;
  }

  /**
   * Log de criação de usuário
   */
  logUsuarioCreate(usuario: any, idUsuarioLogado?: number): Observable<LogSistemaResponse> {
    const logEntry: LogEntry = {
      tipoOperacao: TipoOperacao.CREATE,
      entidade: EntidadeLogada.USUARIO,
      idAlterado: usuario.id_usuario,
      descricao: `Usuário criado: ${usuario.nome_usuario} (${usuario.login})`,
      dadosNovos: {
        login: usuario.login,
        nome_usuario: usuario.nome_usuario
      }
    };

    return this.createLogEntry(logEntry, idUsuarioLogado);
  }

  /**
   * Log de atualização de usuário
   */
  logUsuarioUpdate(usuarioAntigo: any, usuarioNovo: any, idUsuarioLogado?: number): Observable<LogSistemaResponse> {
    const logEntry: LogEntry = {
      tipoOperacao: TipoOperacao.UPDATE,
      entidade: EntidadeLogada.USUARIO,
      idAlterado: usuarioNovo.id_usuario,
      descricao: `Usuário atualizado: ${usuarioNovo.nome_usuario} (${usuarioNovo.login})`,
      dadosAntigos: {
        login: usuarioAntigo.login,
        nome_usuario: usuarioAntigo.nome_usuario
      },
      dadosNovos: {
        login: usuarioNovo.login,
        nome_usuario: usuarioNovo.nome_usuario
      }
    };

    return this.createLogEntry(logEntry, idUsuarioLogado);
  }

  /**
   * Log de exclusão de usuário
   */
  logUsuarioDelete(usuario: any, idUsuarioLogado?: number): Observable<LogSistemaResponse> {
    const logEntry: LogEntry = {
      tipoOperacao: TipoOperacao.DELETE,
      entidade: EntidadeLogada.USUARIO,
      idAlterado: usuario.id_usuario,
      descricao: `Usuário excluído: ${usuario.nome_usuario} (${usuario.login})`,
      dadosAntigos: {
        login: usuario.login,
        nome_usuario: usuario.nome_usuario
      }
    };

    return this.createLogEntry(logEntry, idUsuarioLogado);
  }

  /**
   * Log de login
   */
  logLogin(usuario: any): Observable<LogSistemaResponse> {
    const logEntry: LogEntry = {
      tipoOperacao: TipoOperacao.LOGIN,
      entidade: EntidadeLogada.SISTEMA,
      idAlterado: usuario.id_usuario,
      descricao: `Login realizado: ${usuario.nome_usuario} (${usuario.login})`
    };

    return this.createLogEntry(logEntry, usuario.id_usuario);
  }

  /**
   * Log de logout
   */
  logLogout(usuario: any): Observable<LogSistemaResponse> {
    const logEntry: LogEntry = {
      tipoOperacao: TipoOperacao.LOGOUT,
      entidade: EntidadeLogada.SISTEMA,
      idAlterado: usuario.id_usuario,
      descricao: `Logout realizado: ${usuario.nome_usuario} (${usuario.login})`
    };

    return this.createLogEntry(logEntry, usuario.id_usuario);
  }

  /**
   * Formatar data para exibição
   */
  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  /**
   * Formatar data e hora para exibição
   */
  formatDateTime(dateString: string | undefined): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Extrair tipo de operação do log
   */
  extractOperationType(ocorrencia: string): string {
    const match = ocorrencia.match(/^\[(\w+)\]/);
    return match ? match[1] : 'UNKNOWN';
  }

  /**
   * Extrair entidade do log
   */
  extractEntity(ocorrencia: string): string {
    const match = ocorrencia.match(/^\[\w+\]\s+(\w+):/);
    return match ? match[1] : 'UNKNOWN';
  }

  /**
   * Obter cor do tipo de operação
   */
  getOperationColor(operationType: string): string {
    switch (operationType) {
      case 'CREATE': return '#27ae60'; // Verde
      case 'UPDATE': return '#f39c12'; // Laranja
      case 'DELETE': return '#e74c3c'; // Vermelho
      case 'LOGIN': return '#3498db'; // Azul
      case 'LOGOUT': return '#9b59b6'; // Roxo
      default: return '#95a5a6'; // Cinza
    }
  }
}
