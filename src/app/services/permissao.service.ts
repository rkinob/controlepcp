import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseService } from './base.service';
import { Permissao } from '../model/permissao';

@Injectable({
  providedIn: 'root'
})
export class PermissaoService extends BaseService {
  private apiUrl = `${this.urlServiceV1}/permissao.php`;

  constructor(private http: HttpClient) {
    super();
  }

  /**
   * Listar todas as permissões
   */
  list(page: number = 1, limit: number = 100, search: string = '', ativo: string = '1'): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    if (ativo) {
      params = params.set('fl_ativo', ativo);
    }

    return this.http.get(`${this.apiUrl}?action=list`, {
      headers: this.ObterAuthHeaderJson(),
      params: params
    }).pipe(
      map((response: any) => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Erro ao listar permissões');
      }),
      catchError(this.errorHandler)
    );
  }

  /**
   * Listar permissões de um usuário
   */
  permissoesDoUsuario(idUsuario: number): Observable<Permissao[]> {
    return this.http.get(`${this.apiUrl}?action=permissoes_usuario&id_usuario=${idUsuario}`, {
      headers: this.ObterAuthHeaderJson()
    }).pipe(
      map((response: any) => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Erro ao buscar permissões do usuário');
      }),
      catchError(this.errorHandler)
    );
  }

  /**
   * Verificar se usuário tem permissão específica
   */
  verificarPermissao(idUsuario: number, dsPermissao: string): Observable<boolean> {
    return this.http.get(`${this.apiUrl}?action=verificar_permissao&id_usuario=${idUsuario}&ds_permissao=${dsPermissao}`, {
      headers: this.ObterAuthHeaderJson()
    }).pipe(
      map((response: any) => {
        if (response.success) {
          return response.data.tem_permissao;
        }
        return false;
      }),
      catchError(this.errorHandler)
    );
  }

  /**
   * Atualizar permissões de um usuário
   */
  atualizarPermissoesUsuario(idUsuario: number, permissoes: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}?action=atualizar_permissoes_usuario`, {
      id_usuario: idUsuario,
      permissoes: permissoes
    }, {
      headers: this.ObterAuthHeaderJson()
    }).pipe(
      map((response: any) => response),
      catchError(this.errorHandler)
    );
  }

  /**
   * Obter permissões padrão por tipo de usuário
   */
  getPermissoesPadraoPorTipo(tipoUsuario: number): string[] {
    if (tipoUsuario === 1) {
      // Gestor: todas as permissões
      return [
        'REMANEJAR_SALDO',
        'EDITAR_OP',
        'DELETAR_OP',
        'PROGRAMAR_OP',
        'EDITAR_MODELO',
        'DELETAR_MODELO',
        'GERENCIAR_USUARIOS',
        'GERENCIAR_GRUPOS',
        'VISUALIZAR_RELATORIOS',
        'EXPORTAR_DADOS'
      ];
    } else if (tipoUsuario === 2) {
      // Usuário Comum: apenas OPs, OPs programadas e relatórios
      return [
        'EDITAR_OP',
        'PROGRAMAR_OP',
        'VISUALIZAR_RELATORIOS'
      ];
    }
    return [];
  }
}

