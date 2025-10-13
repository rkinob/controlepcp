import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseService } from './base.service';
import { environment } from '../environment/environment';
import { TipoUsuario, TipoUsuarioListResponse, TipoUsuarioResponse } from '../model/tipo-usuario';

@Injectable({
  providedIn: 'root'
})
export class TipoUsuarioService extends BaseService {
  private apiUrl = environment.apiUrlv1 + '/tipo_usuario.php';

  constructor(private http: HttpClient) {
    super();
  }

  /**
   * Listar tipos de usuário
   */
  list(page: number = 1, limit: number = 100): Observable<TipoUsuarioListResponse> {
    const params = `?action=list&page=${page}&limit=${limit}`;
    return this.http.get<TipoUsuarioListResponse>(this.apiUrl + params, { headers: this.ObterAuthHeaderJson() })
      .pipe(catchError(this.errorHandler));
  }

  /**
   * Buscar tipo de usuário por ID
   */
  getById(id: number): Observable<TipoUsuarioResponse> {
    const params = `?action=get_by_id&id=${id}`;
    return this.http.get<TipoUsuarioResponse>(this.apiUrl + params, { headers: this.ObterAuthHeaderJson() })
      .pipe(catchError(this.errorHandler));
  }

  /**
   * Criar novo tipo de usuário
   */
  create(tipoUsuario: Partial<TipoUsuario>): Observable<TipoUsuarioResponse> {
    const params = `?action=create`;
    return this.http.post<TipoUsuarioResponse>(this.apiUrl + params, tipoUsuario, { headers: this.ObterAuthHeaderJson() })
      .pipe(catchError(this.errorHandler));
  }

  /**
   * Atualizar tipo de usuário
   */
  update(id: number, tipoUsuario: Partial<TipoUsuario>): Observable<TipoUsuarioResponse> {
    const params = `?action=update&id=${id}`;
    return this.http.put<TipoUsuarioResponse>(this.apiUrl + params, tipoUsuario, { headers: this.ObterAuthHeaderJson() })
      .pipe(catchError(this.errorHandler));
  }

  /**
   * Excluir tipo de usuário
   */
  delete(id: number): Observable<TipoUsuarioResponse> {
    const params = `?action=delete&id=${id}`;
    return this.http.delete<TipoUsuarioResponse>(this.apiUrl + params, { headers: this.ObterAuthHeaderJson() })
      .pipe(catchError(this.errorHandler));
  }

  /**
   * Buscar tipos de usuário ativos (para dropdowns)
   */
  getActiveTypes(): Observable<TipoUsuarioListResponse> {
    const params = `?action=list_active`;
    return this.http.get<TipoUsuarioListResponse>(this.apiUrl + params, { headers: this.ObterAuthHeaderJson() })
      .pipe(catchError(this.errorHandler));
  }
}
