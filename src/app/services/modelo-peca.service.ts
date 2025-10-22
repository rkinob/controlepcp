import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseService } from './base.service';

export interface ModeloPeca {
  id_modelo?: number;
  cd_modelo: string;
  meta_por_hora: number;
  descricao: string;
  id_empresa?: number;
  dt_inclusao?: string;
  dt_alteracao?: string;
  fl_ativo?: boolean;
  empresa_nome?: string;
}

export interface ModeloPecaListResponse {
  modelos: ModeloPeca[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ModeloPecaService extends BaseService {

  constructor(private http: HttpClient) {
    super();
  }

  /**
   * Criar novo modelo de peça
   */
  create(modelo: ModeloPeca): Observable<any> {
    return this.http.post(`${this.urlServiceV1}/modelo_peca.php?action=create`, modelo)
      .pipe(
        map((response: any) => response),
        catchError(this.errorHandler)
      );
  }

  /**
   * Listar modelos de peça com paginação
   */
  list(page: number = 1, limit: number = 20, search: string = '', ativo: string = ''): Observable<ModeloPecaListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    if (ativo) {
      params = params.set('fl_ativo', ativo);
    }

    return this.http.get(`${this.urlServiceV1}/modelo_peca.php?action=list`, {
      headers: this.ObterAuthHeaderJson(),
      params: params
    })
      .pipe(
        map((response: any) => {
          if (response.success) {
            return response.data;
          }
          throw new Error(response.message || 'Erro ao listar modelos');
        }),
        catchError(this.errorHandler)
      );
  }

  /**
   * Obter modelo de peça por ID
   */
  getById(id: number): Observable<ModeloPeca> {
    return this.http.get(`${this.urlServiceV1}/modelo_peca.php?action=get&id=${id}`)
      .pipe(
        map((response: any) => {
          if (response.success) {
            return response.data;
          }
          throw new Error(response.message || 'Erro ao obter modelo');
        }),
        catchError(this.errorHandler)
      );
  }

  /**
   * Atualizar modelo de peça
   */
  update(id: number, modelo: ModeloPeca): Observable<any> {
    return this.http.post(`${this.urlServiceV1}/modelo_peca.php?action=update&id=${id}`, modelo)
      .pipe(
        map((response: any) => response),
        catchError(this.errorHandler)
      );
  }

  /**
   * Excluir modelo de peça (inativar)
   */
  delete(id: number): Observable<any> {
    return this.http.post(`${this.urlServiceV1}/modelo_peca.php?action=delete&id=${id}`, {})
      .pipe(
        map((response: any) => response),
        catchError(this.errorHandler)
      );
  }

  /**
   * Buscar modelos de peça para autocomplete
   */
  search(query: string, limit: number = 10): Observable<ModeloPeca[]> {
    let params = new HttpParams()
      .set('q', query)
      .set('limit', limit.toString());

    return this.http.get(`${this.urlServiceV1}/modelo_peca.php?action=search`, {
      params: params
    })
      .pipe(
        map((response: any) => {
          if (response.success) {
            return response.data;
          }
          return [];
        }),
        catchError(this.errorHandler)
      );
  }

  /**
   * Verificar se código do modelo já existe
   */
  checkCodigoExists(codigo: string, excludeId?: number): Observable<boolean> {
    let params = new HttpParams().set('codigo', codigo);
    console.log('checkCodigoExists', codigo, excludeId);
    if (excludeId) {
      params = params.set('exclude_id', excludeId.toString());
    }
    console.log('147', codigo, excludeId);
    return this.http.get(`${this.urlServiceV1}/modelo_peca.php?action=check_codigo`, {
      params: params
    })
      .pipe(
        map((response: any) => {
          console.log('153', response);
          if (response.success) {
            return response.data.exists;
          }
          return false;
        }),
        catchError(this.errorHandler)
      );
  }
}
