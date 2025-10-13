import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseService } from './base.service';
import { environment } from '../environment/environment';
import { GrupoProducao, GrupoProducaoListResponse } from '../model/grupo-producao';

@Injectable({
  providedIn: 'root'
})
export class GrupoProducaoService extends BaseService {
  private apiUrl = environment.apiUrlv1 + '/grupo_producao.php';

  constructor(private http: HttpClient) {
    super();
  }

  list(page: number = 1, limit: number = 20, search: string = '', ativo: string = ''): Observable<GrupoProducaoListResponse> {
    let params = `?action=list&page=${page}&limit=${limit}`;
    if (search) params += `&search=${search}`;
    if (ativo) params += `&ativo=${ativo}`;
    return this.http.get<GrupoProducaoListResponse>(this.apiUrl + params, { headers: this.ObterAuthHeaderJson() })
      .pipe(catchError(this.errorHandler));
  }

  getById(id: number): Observable<any> {
    const params = `?action=get&id=${id}`;
    return this.http.get<any>(this.apiUrl + params, { headers: this.ObterAuthHeaderJson() })
      .pipe(catchError(this.errorHandler));
  }

  create(grupo: GrupoProducao): Observable<any> {
    const params = `?action=create`;
    return this.http.post<any>(this.apiUrl + params, grupo, { headers: this.ObterAuthHeaderJson() })
      .pipe(catchError(this.errorHandler));
  }

  update(id: number, grupo: GrupoProducao): Observable<any> {
    const params = `?action=update&id=${id}`;
    return this.http.post<any>(this.apiUrl + params, grupo, { headers: this.ObterAuthHeaderJson() })
      .pipe(catchError(this.errorHandler));
  }

  delete(id: number): Observable<any> {
    const params = `?action=delete&id=${id}`;
    return this.http.post<any>(this.apiUrl + params, {}, { headers: this.ObterAuthHeaderJson() })
      .pipe(catchError(this.errorHandler));
  }

  checkDescricaoExists(descricao: string, excludeId: number | null = null): Observable<any> {
    let params = `?action=check_descricao&descricao=${descricao}`;
    if (excludeId) params += `&exclude_id=${excludeId}`;
    return this.http.get<any>(this.apiUrl + params, { headers: this.ObterAuthHeaderJson() })
      .pipe(catchError(this.errorHandler));
  }

  search(query: string, limit: number = 10): Observable<any> {
    const params = `?action=search&q=${query}&limit=${limit}`;
    return this.http.get<any>(this.apiUrl + params, { headers: this.ObterAuthHeaderJson() })
      .pipe(catchError(this.errorHandler));
  }
}
