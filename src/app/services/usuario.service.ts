import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../environment/environment';
import {
  Usuario,
  UsuarioRequest,
  UsuarioUpdateRequest,
  UsuarioResponse,
  UsuarioListResponse,
  UsuarioSearchResponse,
  ChangePasswordRequest
} from '../model/usuario';
import { LogSistemaService } from './log-sistema.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = environment.apiUrlv1;

  constructor(
    private http: HttpClient,
    private logService: LogSistemaService
  ) {}

  /**
   * Criar novo usuário
   */
  createUsuario(usuario: UsuarioRequest, idUsuarioLogado?: number): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(`${this.apiUrl}/usuario.php?action=create`, usuario)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            // Criar log da operação
            this.logService.logUsuarioCreate(response.data, idUsuarioLogado).subscribe({
              error: (error) => console.error('Erro ao criar log:', error)
            });
          }
        })
      );
  }

  /**
   * Listar usuários com paginação e filtros
   */
  listUsuarios(page: number = 1, limit: number = 20, search: string = ''): Observable<UsuarioListResponse> {
    let params = new HttpParams()
      .set('action', 'list')
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search);
    }

    return this.http.get<UsuarioListResponse>(`${this.apiUrl}/usuario.php`, { params });
  }

  /**
   * Buscar usuários para autocomplete
   */
  searchUsuarios(query: string, limit: number = 10): Observable<UsuarioSearchResponse> {
    const params = new HttpParams()
      .set('action', 'search')
      .set('q', query)
      .set('limit', limit.toString());

    return this.http.get<UsuarioSearchResponse>(`${this.apiUrl}/usuario.php`, { params });
  }

  /**
   * Obter usuário por ID
   */
  getUsuario(id: number): Observable<UsuarioResponse> {
    const params = new HttpParams()
      .set('action', 'get')
      .set('id', id.toString());

    return this.http.get<UsuarioResponse>(`${this.apiUrl}/usuario.php`, { params });
  }

  /**
   * Atualizar usuário
   */
  updateUsuario(id: number, usuario: UsuarioUpdateRequest, usuarioAntigo?: Usuario, idUsuarioLogado?: number): Observable<UsuarioResponse> {
    const params = new HttpParams()
      .set('action', 'update')
      .set('id', id.toString());

    return this.http.post<UsuarioResponse>(`${this.apiUrl}/usuario.php`, usuario, { params })
      .pipe(
        tap(response => {
          if (response.success && response.data && usuarioAntigo) {
            // Criar log da operação
            this.logService.logUsuarioUpdate(usuarioAntigo, response.data, idUsuarioLogado).subscribe({
              error: (error) => console.error('Erro ao criar log:', error)
            });
          }
        })
      );
  }

  /**
   * Excluir usuário
   */
  deleteUsuario(id: number, usuario?: Usuario, idUsuarioLogado?: number): Observable<UsuarioResponse> {
    const params = new HttpParams()
      .set('action', 'delete')
      .set('id', id.toString());

    return this.http.post<UsuarioResponse>(`${this.apiUrl}/usuario.php`, {}, { params })
      .pipe(
        tap(response => {
          if (response.success && usuario) {
            // Criar log da operação
            this.logService.logUsuarioDelete(usuario, idUsuarioLogado).subscribe({
              error: (error) => console.error('Erro ao criar log:', error)
            });
          }
        })
      );
  }

  /**
   * Alterar senha do usuário
   */
  changePassword(id: number, passwordData: ChangePasswordRequest): Observable<UsuarioResponse> {
    const params = new HttpParams()
      .set('action', 'change_password')
      .set('id', id.toString());

    return this.http.post<UsuarioResponse>(`${this.apiUrl}/usuario.php`, passwordData, { params });
  }

  /**
   * Verificar se login já existe
   */
  checkLoginExists(login: string, excludeId?: number): Observable<{ exists: boolean }> {
    let params = new HttpParams()
      .set('action', 'check_login')
      .set('login', login);

    if (excludeId) {
      params = params.set('exclude_id', excludeId.toString());
    }

    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/usuario.php`, { params });
  }

  /**
   * Validar força da senha
   */
  validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[]
  } {
    const feedback: string[] = [];
    let score = 0;

    // Verificar comprimento mínimo
    if (password.length < 8) {
      feedback.push('A senha deve ter pelo menos 8 caracteres');
    } else {
      score += 1;
    }

    // Verificar se contém letra minúscula
    if (!/[a-z]/.test(password)) {
      feedback.push('A senha deve conter pelo menos uma letra minúscula');
    } else {
      score += 1;
    }

    // Verificar se contém letra maiúscula
    if (!/[A-Z]/.test(password)) {
      feedback.push('A senha deve conter pelo menos uma letra maiúscula');
    } else {
      score += 1;
    }

    // Verificar se contém número
    if (!/\d/.test(password)) {
      feedback.push('A senha deve conter pelo menos um número');
    } else {
      score += 1;
    }

    // Verificar se contém caractere especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      feedback.push('A senha deve conter pelo menos um caractere especial');
    } else {
      score += 1;
    }

    // Verificar se não contém sequências comuns
    const commonSequences = ['123', 'abc', 'qwe', 'asd', 'zxc'];
    const hasCommonSequence = commonSequences.some(seq =>
      password.toLowerCase().includes(seq)
    );

    if (hasCommonSequence) {
      feedback.push('A senha não deve conter sequências comuns');
    } else {
      score += 1;
    }

    return {
      isValid: score >= 4 && password.length >= 8,
      score,
      feedback
    };
  }

  /**
   * Gerar senha aleatória
   */
  generateRandomPassword(length: number = 12): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const allChars = lowercase + uppercase + numbers + symbols;
    let password = '';

    // Garantir pelo menos um caractere de cada tipo
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Preencher o resto aleatoriamente
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Embaralhar a senha
    return password.split('').sort(() => Math.random() - 0.5).join('');
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
}
