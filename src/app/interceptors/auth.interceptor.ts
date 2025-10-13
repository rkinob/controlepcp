import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { sessionStorageUtils } from '../util/sessionStorage';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionStorage = new sessionStorageUtils();

  // Obter token do sessionStorage
  const token = sessionStorage.obterTokenUsuario();

  // Se existe token, adicionar nos headers
  if (token) {
    const authReq = req.clone({
      headers: req.headers
        .set('Authorization', `Bearer ${token}`)
        .set('AccessToken', `Bearer ${token}`)
        .set('Content-Type', 'application/json;charset=utf-8')
        .set('Accept', 'application/json;charset=utf-8')
    });
    return next(authReq);
  }

  return next(req);
};
