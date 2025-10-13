import { Injectable } from '@angular/core';
import { User } from '../model/user';



@Injectable({
    providedIn: 'root'
  })

export class sessionStorageUtils {


    public obterUsuario(): User | null {
        let usuario: User | null = null;
        let token = this.obterTokenUsuario();

        if (token) {
            try {
                // Decodificar token JWT manualmente (simplificado)
                const payload = JSON.parse(atob(token.split('.')[1]));
                usuario = payload;
            } catch (error) {
                console.error('Erro ao decodificar token:', error);
            }
        }

        return usuario;
    }

    public obterTokenUsuario(): string {
        return sessionStorage.getItem('usuario-token')??'';
    }

    public salvarTokenUsuario(token: string) {
        sessionStorage.setItem('usuario-token', token);
    }

    public usuarioEstaLogado(): boolean {
      const currentUser = this.obterUsuario();

      if (!currentUser) {

          return false;
      }

      if (!this.isTokenExpired()) {

          return true;

      }


      return false;
  }

    public salvarUsuario(user: string) {
        sessionStorage.setItem('usuario-autenticado', JSON.stringify(user));
    }

    public getTokenExpirationDate(token: string): Date|null {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));

            if (payload.exp === undefined) return null;

            const date = new Date(0);
            date.setUTCSeconds(payload.exp);
            return date;
        } catch (error) {
            console.error('Erro ao decodificar token:', error);
            return null;
        }
    }

    public isTokenExpired(token?: string): boolean {
        if (!token) token = this.obterTokenUsuario();
        if (!token) return true;

        const date = this.getTokenExpirationDate(token);
        if (date === undefined || date === null) return false;
        return !(date.valueOf() > new Date().valueOf());
    }

    public limpar_sessao() {
        sessionStorage.clear();
        sessionStorage.clear();
    }
}
