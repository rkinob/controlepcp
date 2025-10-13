import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseService } from './base.service';
import { environment } from '../environment/environment';
import { OrdemProducao, OrdemProducaoListResponse, OrdemProducaoResponse } from '../model/ordem-producao';

@Injectable({
  providedIn: 'root'
})
export class OrdemProducaoService extends BaseService {
  private apiUrl = `${environment.apiUrlv1}/ordem_producao.php`;

  constructor(private http: HttpClient) {
    super();
  }

  /**
   * Listar OPs com paginação e filtros
   */
  list(page: number = 1, limit: number = 20, search: string = '', ativo: string = '', id_modelo: number = 0, dataInicioDe: string = '', dataInicioAte: string = '', id_ordem_producao: number = 0): Observable<OrdemProducaoListResponse> {
    const params = new URLSearchParams({
      action: 'list',
      page: page.toString(),
      limit: limit.toString()
    });

    if (search) params.append('search', search);
    if (ativo) params.append('fl_ativo', ativo);
    if (id_modelo > 0) params.append('id_modelo', id_modelo.toString());
    if (dataInicioDe) params.append('data_inicio_de', dataInicioDe);
    if (dataInicioAte) params.append('data_inicio_ate', dataInicioAte);
    if (id_ordem_producao > 0) params.append('id_ordem_producao', id_ordem_producao.toString());
    return this.http.get<OrdemProducaoListResponse>(`${this.apiUrl}?${params}`, {
      headers: this.ObterAuthHeaderJson()
    }).pipe(
      catchError(this.errorHandler)
    );
  }

  /**
   * Buscar OP por ID
   */
  getById(id: number): Observable<OrdemProducaoResponse> {
    const params = new URLSearchParams({
      action: 'get',
      id: id.toString()
    });

    return this.http.get<OrdemProducaoResponse>(`${this.apiUrl}?${params}`, {

    }).pipe(
      catchError(this.errorHandler)
    );
  }

  /**
   * Criar nova OP
   */
  create(op: Partial<OrdemProducao>): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}?action=create`, op, {
      headers: this.ObterAuthHeaderJson()
    }).pipe(
      catchError(this.errorHandler)
    );
  }

  /**
   * Atualizar OP
   */
  update(id: number, op: Partial<OrdemProducao>): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}?action=update&id=${id}`, op, {
      headers: this.ObterAuthHeaderJson()
    }).pipe(
      catchError(this.errorHandler)
    );
  }

  /**
   * Inativar OP
   */
  delete(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}?action=delete&id=${id}`, {}, {
      headers: this.ObterAuthHeaderJson()
    }).pipe(
      catchError(this.errorHandler)
    );
  }

  /**
   * Buscar OPs para autocomplete
   */
  search(query: string, limit: number = 10): Observable<OrdemProducao[]> {
    const params = new URLSearchParams({
      action: 'search',
      q: query,
      limit: limit.toString()
    });

    return this.http.get<OrdemProducao[]>(`${this.apiUrl}?${params}`, {
      headers: this.ObterAuthHeaderJson()
    }).pipe(
      catchError(this.errorHandler)
    );
  }

  /**
   * Verificar se código OP existe
   */
  checkCodigoExists(codigo: string, excludeId?: number): Observable<{exists: boolean}> {
    const params = new URLSearchParams({
      action: 'check_codigo',
      codigo: codigo
    });

    if (excludeId) {
      params.append('exclude_id', excludeId.toString());
    }

    return this.http.get<{exists: boolean}>(`${this.apiUrl}?${params}`, {
      headers: this.ObterAuthHeaderJson()
    }).pipe(
      catchError(this.errorHandler)
    );
  }

  /**
   * Programar OP (distribuir nos horários)
   */
  programar(id_ordem_producao: number, id_grupo_producao: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}?action=programar`, {
      id_ordem_producao,
      id_grupo_producao
    }, {
      headers: this.ObterAuthHeaderJson()
    }).pipe(
      catchError(this.errorHandler)
    );
  }
}
