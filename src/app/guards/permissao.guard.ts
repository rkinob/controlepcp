import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { PermissaoService } from '../services/permissao.service';
import { sessionStorageUtils } from '../util/sessionStorage';
import { NotificationService } from '../services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class PermissaoGuard implements CanActivate {
  constructor(
    private permissaoService: PermissaoService,
    private router: Router,
    private sessionStorage: sessionStorageUtils,
    private notificationService: NotificationService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const usuario = this.sessionStorage.obterUsuario();

    if (!usuario) {
      this.notificationService.warning('Acesso Negado', 'Você precisa estar logado');
      return this.router.createUrlTree(['/login']);
    }

    // Verificar se é Gestor (tipo 1) - tem acesso total
    const usuarioData = usuario as any;
    const tipoUsuario = usuarioData.tipo_usuario || usuarioData.id_tipo_usuario;
    console.log('Guard - Verificando tipo:', { usuario: usuarioData, tipoUsuario });

    if (tipoUsuario === 1) {
      console.log('Guard - É gestor, permitindo acesso');
      return true;
    }

    // Obter permissão necessária da rota
    const permissaoNecessaria = route.data['permissao'] as string;

    if (!permissaoNecessaria) {
      // Se a rota não especifica permissão, permite acesso
      return true;
    }

    // Para usuário comum (tipo 2), bloquear acesso a cadastros mesmo sem consultar API
    if (tipoUsuario === 2) {
      console.log('Guard - É usuário comum, bloqueando acesso a:', route.url);
      this.notificationService.warning(
        'Acesso Negado',
        'Você não tem permissão para acessar esta funcionalidade. Apenas gestores podem acessar cadastros.'
      );
      return this.router.createUrlTree(['/ordem-producao']);
    }

    // Para outros tipos de usuário, verificar permissão via API
    if (!usuarioData.id_usuario) {
      return this.router.createUrlTree(['/login']);
    }

    return this.permissaoService.verificarPermissao(usuarioData.id_usuario, permissaoNecessaria).pipe(
      map(temPermissao => {
        if (temPermissao) {
          return true;
        } else {
          this.notificationService.warning(
            'Acesso Negado',
            'Você não tem permissão para acessar esta funcionalidade'
          );
          return this.router.createUrlTree(['/ordem-producao']);
        }
      }),
      catchError(() => {
        this.notificationService.error('Erro', 'Erro ao verificar permissões');
        return of(this.router.createUrlTree(['/ordem-producao']));
      })
    );
  }
}

