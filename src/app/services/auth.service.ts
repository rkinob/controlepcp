import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseService } from './base.service';
import { Usuario } from '../model/usuario';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseService {
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    super();
  }

  /**
   * Realizar login
   */
  login(login: string, senha: string): Observable<any> {
    const body = { login, senha };
    return this.http.post(`${this.urlServiceV1}/auth.php?action=login`, body, this.ObterHeaderJson())
      .pipe(
        map((response: any) => {
          if (response.success) {
            // Salvar token e dados do usuário
            this.sessionStorageUtils.salvarTokenUsuario(response.data.token);
            this.sessionStorageUtils.salvarUsuario(response.data.usuario);
            this.currentUserSubject.next(response.data.usuario);
          }
          return response;
        })
      );
  }

  /**
   * Realizar logout
   */
  logout(): Observable<any> {
    return this.http.post(`${this.urlServiceV1}/auth.php?action=logout`, {})
      .pipe(
        map((response: any) => {
          if (response.success) {
            // Limpar dados da sessão
            this.sessionStorageUtils.limpar_sessao();
            this.currentUserSubject.next(null);
          }
          return response;
        }),
        catchError(this.errorHandler)
      );
  }

  /**
   * Verificar se token é válido
   */
  verifyToken(): Observable<any> {
    return this.http.post(`${this.urlServiceV1}/auth.php?action=verify`, {})
      .pipe(
        map((response: any) => {
          if (response.success) {
            this.currentUserSubject.next(response.data);
          }
          return response;
        }),
        catchError(this.errorHandler)
      );
  }

  /**
   * Obter usuário atual
   */
  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verificar se usuário está logado
   */
  isLoggedIn(): boolean {
    const token = this.sessionStorageUtils.obterTokenUsuario();
    return !!token;
  }

  /**
   * Inicializar autenticação (verificar token na inicialização)
   */
  initializeAuth(): void {
    if (this.isLoggedIn()) {
      this.verifyToken().subscribe({
        next: (response) => {
          if (response.success) {
            this.currentUserSubject.next(response.data);
          } else {
            this.logout().subscribe();
          }
        },
        error: () => {
          this.logout().subscribe();
        }
      });
    }
  }
}
