import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseService } from './base.service';
import { environment } from '../environment/environment';
import { Empresa, EmpresaListResponse, EmpresaResponse } from '../model/empresa';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService extends BaseService {
  private apiUrl = environment.apiUrlv1 + '/empresa.php';

  constructor(private http: HttpClient) {
    super();
  }

  list(page: number = 1, limit: number = 20, search: string = '', ativo: string = ''): Observable<EmpresaListResponse> {
    let params = `?action=list&page=${page}&limit=${limit}`;
    if (search) params += `&search=${search}`;
    if (ativo) params += `&fl_ativo=${ativo}`;
    return this.http.get<EmpresaListResponse>(this.apiUrl + params, { headers: this.ObterAuthHeaderJson() })
      .pipe(catchError(this.errorHandler));
  }

  getById(id: number): Observable<EmpresaResponse> {
    const params = `?action=get&id=${id}`;
    return this.http.get<EmpresaResponse>(this.apiUrl + params, { headers: this.ObterAuthHeaderJson() })
      .pipe(catchError(this.errorHandler));
  }

  create(empresa: Partial<Empresa>): Observable<EmpresaResponse> {
    const params = `?action=create`;
    return this.http.post<EmpresaResponse>(this.apiUrl + params, empresa, { headers: this.ObterAuthHeaderJson() })
      .pipe(catchError(this.errorHandler));
  }

  update(id: number, empresa: Partial<Empresa>): Observable<EmpresaResponse> {
    const params = `?action=update&id=${id}`;
    return this.http.post<EmpresaResponse>(this.apiUrl + params, empresa, { headers: this.ObterAuthHeaderJson() })
      .pipe(catchError(this.errorHandler));
  }

  delete(id: number): Observable<any> {
    const params = `?action=delete&id=${id}`;
    return this.http.post<any>(this.apiUrl + params, {}, { headers: this.ObterAuthHeaderJson() })
      .pipe(catchError(this.errorHandler));
  }

  checkCnpjExists(cnpj: string, excludeId?: number): Observable<{success: boolean, data: {exists: boolean}}> {
    let params = `?action=check_cnpj&cnpj=${cnpj}`;
    if (excludeId) params += `&exclude_id=${excludeId}`;
    return this.http.get<{success: boolean, data: {exists: boolean}}>(this.apiUrl + params, { headers: this.ObterAuthHeaderJson() })
      .pipe(catchError(this.errorHandler));
  }
}

